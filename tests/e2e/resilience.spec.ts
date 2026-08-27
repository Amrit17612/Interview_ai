import { test, expect } from '@playwright/test';
import { mockAuthApis } from './helpers/mockAuthApis';
import { mockDashboardApis } from './helpers/mockDashboardApis';
import { mockContextApis } from './helpers/mockContextApis';
import { mockInterviewApis } from './helpers/mockInterviewApis';

test.describe('Sprint 15 Phase 3 Resilience E2E', () => {
  let liveGeminiCalls = 0;
  let finalReportCalls = 0;
  let questionIndex = 0;

  test.beforeEach(async ({ page, context }) => {
    // Zero Gemini Audit (Test 8)
    await page.route('**/*generativelanguage.googleapis.com*/**', route => {
      liveGeminiCalls++;
      console.error('CRITICAL FAILURE: Browser attempted to contact Gemini directly.');
      route.abort();
    });

    // Mock Authentication
    await mockAuthApis(page, { isAuthenticated: false });

    // Mock Dashboard Stats and Context
    await mockDashboardApis(page);
    await mockContextApis(page);

    // Mock Interview Creation and Fetching
    await mockInterviewApis(page);

    // Mock Question Generation
    questionIndex = 0;
    await page.route('**/api/interviews/*/question', async route => {
      questionIndex++;
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            _id: `q-${questionIndex}`,
            index: questionIndex,
            text: `This is deterministic mock question number ${questionIndex}?`,
            status: 'PENDING'
          }
        }
      });
    });

    // Mock Answer Submission
    await page.route('**/api/interviews/*/answer', async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            _id: `q-${questionIndex}`,
            index: questionIndex,
            text: `This is deterministic mock question number ${questionIndex}?`,
            userAnswer: 'This is my realistic mock answer.',
            status: 'EVALUATED'
          }
        }
      });
    });

    // Test 10: Speech Fallback verification (Disable window.SpeechRecognition in all tests by mocking browser env)
    await page.addInitScript(() => {
      // Delete speech recognition APIs to simulate fallback environment
      delete (window as any).SpeechRecognition;
      delete (window as any).webkitSpeechRecognition;
    });
  });

  // Helper to login and start interview
  const loginAndStartInterview = async (page: any) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.getByRole('link', { name: /Start Interview/i }).first().click();
    await page.getByRole('button', { name: /Start Interview/i }).click();
    await expect(page).toHaveURL(/.*\/interviews?\/active/);
    await expect(page.getByText(`This is deterministic mock question number 1?`)).toBeVisible();
  };

  test('Test 1: Autosave Refresh Recovery & Test 9: LocalStorage Isolation', async ({ page, context }) => {
    await loginAndStartInterview(page);

    const answerInput = page.getByPlaceholder(/Type your answer here/i);
    await answerInput.fill('This is a test autosave answer that should be recovered.');
    
    // Wait for the 500ms debounce
    await page.waitForTimeout(1000);

    // Assert LocalStorage structure (Test 9)
    const draftKey = `interviu_ai_draft_test-session-id_q-1`;
    const draftValue = await page.evaluate((key) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item).answerText : null;
    }, draftKey);
    expect(draftValue).toBe('This is a test autosave answer that should be recovered.');

    // Assert it does NOT bleed to another question draft
    const otherDraftValue = await page.evaluate(() => localStorage.getItem('interviu_ai_draft_test-session-id_q-2'));
    expect(otherDraftValue).toBeNull();

    // Mock /auth/me to return valid user so reload doesn't log us out
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          user: { id: 'test-user-id', firstName: 'Test', lastName: 'User', email: 'test@example.com', onboardingCompleted: true, emailVerified: true }
        }
      });
    });

    // Mock the session fetch to return the question that was already generated
    await page.route('**/api/interviews/test-session-id', async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            _id: 'test-session-id',
            user: 'test-user-id',
            status: 'IN_PROGRESS',
            configuration: { type: 'TECHNICAL', domain: 'Software Engineering', difficulty: 'BEGINNER' },
            questions: [
              {
                _id: 'q-1',
                index: 1,
                text: 'This is deterministic mock question number 1?',
                status: 'PENDING'
              }
            ]
          }
        }
      });
    });

    // Reload the page
    await page.reload();

    // Verify draft is restored
    await expect(page.getByText(`This is deterministic mock question number 1?`)).toBeVisible();
    await expect(page.getByPlaceholder(/Type your answer here/i)).toHaveValue('This is a test autosave answer that should be recovered.');

    // Verify 0 Gemini calls (Test 8)
    expect(liveGeminiCalls).toBe(0);
  });

  test('Test 2: Failed Answer Submission preserves draft', async ({ page }) => {
    await loginAndStartInterview(page);
    
    // Override the answer route to fail
    await page.route('**/api/interviews/*/answer', async route => {
      await route.fulfill({ status: 500, json: { success: false, message: 'Internal Server Error' } });
    });

    const answerInput = page.getByPlaceholder(/Type your answer here/i);
    await answerInput.fill('Failing answer submission text.');
    
    // Wait for autosave
    await page.waitForTimeout(1000);

    // Submit
    await page.getByRole('button', { name: /submit answer/i }).click();

    // Verify UI does not advance
    await expect(page.getByText('This is deterministic mock question number 1?')).toBeVisible();
    
    // Check if the answer input still has the text. NOTE: This will fail due to a known bug in InterviewContext swallowing the error.
    // However, we assert the expected behavior according to the requirements.
    await expect(answerInput).toHaveValue('Failing answer submission text.');
    
    // Verify draft remains in localStorage
    const draftValue = await page.evaluate((key) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item).answerText : null;
    }, 'interviu_ai_draft_test-session-id_q-1');
    expect(draftValue).toBe('Failing answer submission text.');

    expect(liveGeminiCalls).toBe(0);
  });

  test('Test 3: Successful Submission Cleanup', async ({ page }) => {
    await loginAndStartInterview(page);

    const answerInput = page.getByPlaceholder(/Type your answer here/i);
    await answerInput.fill('Successful answer submission text.');
    
    // Wait for autosave
    await page.waitForTimeout(1000);

    // Confirm draft exists
    const draftValue = await page.evaluate((key) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item).answerText : null;
    }, 'interviu_ai_draft_test-session-id_q-1');
    expect(draftValue).toBe('Successful answer submission text.');

    // Submit successfully
    await page.getByRole('button', { name: /submit answer/i }).click();

    // Wait for the next question (index 2)
    await expect(page.getByText('This is deterministic mock question number 2?')).toBeVisible({ timeout: 10000 });

    // Verify the previous question draft key is deleted
    const draftValueAfter = await page.evaluate((key) => localStorage.getItem(key), 'interviu_ai_draft_test-session-id_q-1');
    expect(draftValueAfter).toBeNull();

    expect(liveGeminiCalls).toBe(0);
  });

  test('Test 4: Final Report Failure', async ({ page }) => {
    await loginAndStartInterview(page);

    // Override the complete route to fail
    await page.route('**/api/interviews/*/complete', async route => {
      // NOTE: Our actual app logic expects an error to be thrown and caught in useInterview
      await route.fulfill({ status: 500, json: { success: false, message: 'Report Generation Failed' } });
    });

    // Answer 5 questions
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`This is deterministic mock question number ${i}?`)).toBeVisible({ timeout: 10000 });
      const answerInput = page.getByPlaceholder(/Type your answer here/i);
      await answerInput.fill(`Mock answer ${i}`);
      await page.getByRole('button', { name: /submit answer/i }).click();
    }

    // Verify UI exposes the report failure state (usually an error message in ActiveInterview)
    await expect(page.getByText(/Report Generation Failed|failed to complete interview/i)).toBeVisible({ timeout: 15000 });

    // The backend immediately saves the session as COMPLETED before calling AI. 
    // To see the retry button, we simulate the user refreshing the page (which fetches the latest state).
    await page.route('**/api/interviews/test-session-id', async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            _id: 'test-session-id',
            user: 'test-user-id',
            status: 'COMPLETED',
            configuration: { type: 'TECHNICAL', domain: 'Software Engineering', difficulty: 'BEGINNER' },
            questions: [] // Not needed for the error UI
          }
        }
      });
    });

    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          user: { id: 'test-user-id', firstName: 'Test', lastName: 'User', email: 'test@example.com', onboardingCompleted: true, emailVerified: true }
        }
      });
    });

    await page.reload();

    // Verify session remains COMPLETED (ActiveInterview displays "Interview Completed" if session.status === 'COMPLETED')
    await expect(page.getByText(/Interview Completed/i)).toBeVisible();

    // Verify retriable
    await expect(page.getByRole('button', { name: /Retry Report Generation/i })).toBeVisible();

    expect(liveGeminiCalls).toBe(0);
  });

  test('Test 5: Final Report Retry', async ({ page }) => {
    // This test is self-contained. 
    // We mock the session fetch to return a COMPLETED session with no report data yet.
    await page.route('**/api/interviews/test-session-id', async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            _id: 'test-session-id',
            user: 'test-user-id',
            status: 'COMPLETED',
            configuration: { type: 'TECHNICAL', domain: 'Software Engineering', difficulty: 'BEGINNER' },
            questions: [] // Mock questions omitted for brevity
          }
        }
      });
    });

    // Ensure we start logged in and load the specific active interview directly
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    
    // Once login is clicked, mock /auth/me to return valid so that hard navigations or reloads work
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          user: { id: 'test-user-id', firstName: 'Test', lastName: 'User', email: 'test@example.com', onboardingCompleted: true, emailVerified: true }
        }
      });
    });

    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Instead of hard navigation which might have race conditions with React Router, 
    // we use client side navigation by executing a script or simply we can just do the hard navigation since /auth/me is mocked.
    await page.goto('/interviews/active?id=test-session-id');

    // Wait for the "failed report" view which contains the retry button
    await expect(page.getByRole('button', { name: /Retry Report Generation/i })).toBeVisible();

    // Setup the retry-report route mock
    let retryCalls = 0;
    await page.route('**/api/interviews/*/retry-report', async route => {
      retryCalls++;
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            _id: 'test-session-id',
            user: 'test-user-id',
            status: 'COMPLETED',
            configuration: { type: 'TECHNICAL', domain: 'Software Engineering', difficulty: 'BEGINNER' },
            overallScore: 92,
            feedbackSummary: 'Retried Report Generation Success!',
            strengths: ['Resilience'],
            weaknesses: ['None'],
            recommendations: ['Keep it up'],
            questions: []
          }
        }
      });
    });

    // Click retry
    await page.getByRole('button', { name: /Retry Report Generation/i }).click();

    // Verify it redirects to the report and renders
    await expect(page).toHaveURL(/.*\/interviews?\/report.*/);
    await expect(page.getByText('Retried Report Generation Success!')).toBeVisible({ timeout: 15000 });
    
    // Verify exactly one AI request
    expect(retryCalls).toBe(1);
    
    // Reload and verify report available
    // Mock the session fetch again to return the fully populated report
    await page.route('**/api/interviews/test-session-id', async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            _id: 'test-session-id',
            user: 'test-user-id',
            status: 'COMPLETED',
            configuration: { type: 'TECHNICAL', domain: 'Software Engineering', difficulty: 'BEGINNER' },
            overallScore: 92,
            feedbackSummary: 'Retried Report Generation Success!',
            strengths: ['Resilience'],
            weaknesses: ['None'],
            recommendations: ['Keep it up'],
            questions: []
          }
        }
      });
    });
    
    await page.reload();
    await expect(page.getByText('Retried Report Generation Success!')).toBeVisible();

    expect(liveGeminiCalls).toBe(0);
  });
});
