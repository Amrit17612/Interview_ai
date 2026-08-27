import { test, expect } from '@playwright/test';
import { mockAuthApis } from './helpers/mockAuthApis';
import { mockDashboardApis } from './helpers/mockDashboardApis';
import { mockContextApis } from './helpers/mockContextApis';
import { mockInterviewApis } from './helpers/mockInterviewApis';

test.describe('Core Interview Engine E2E', () => {
  let liveGeminiCalls = 0;
  let finalReportCalls = 0;

  test.beforeEach(async ({ page }) => {
    // 1. Enforce ZERO direct Gemini calls from the frontend
    await page.route('**/*generativelanguage.googleapis.com*/**', route => {
      liveGeminiCalls++;
      console.error('CRITICAL FAILURE: Browser attempted to contact Gemini directly.');
      route.abort();
    });

    // 2. Mock Authentication
    await mockAuthApis(page, { isAuthenticated: false });

    // 3. Mock Dashboard Stats and Context
    await mockDashboardApis(page);
    await mockContextApis(page);

    // 4. Mock Interview Creation and Fetching
    await mockInterviewApis(page);

    // 5. Mock Question Generation (Live Interview Loop)
    let questionIndex = 0;
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

    // 6. Mock Answer Submission (Live Interview Loop)
    await page.route('**/api/interviews/*/answer', async route => {
      // The body contains the answer string.
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

    // 7. Mock Final Report Completion
    await page.route('**/api/interviews/*/complete', async (route) => {
      finalReportCalls++;
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            _id: 'test-session-id',
            user: 'test-user-id',
            status: 'COMPLETED',
            configuration: { type: 'TECHNICAL', domain: 'Software Engineering', difficulty: 'BEGINNER' },
            overallScore: 85,
            feedbackSummary: 'Excellent logical breakdown, but review some core concepts.',
            strengths: ['Clear communication', 'Good problem solving'],
            weaknesses: ['Missed edge cases'],
            recommendations: ['Practice more system design'],
            questions: []
          }
        }
      });
    });
  });

  test('successfully navigates the complete interview journey without hitting AI during the live loop', async ({ page }) => {
    // 1. Authenticate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL || 'test@example.com');
    await page.getByLabel(/password/i).fill(process.env.E2E_TEST_PASSWORD || 'Password123!');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Verify Dashboard load
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByText(/Welcome/i).first()).toBeVisible();

    // 2. Start Interview Flow
    // Use client-side navigation to avoid full page reload which clears in-memory auth state
    await page.getByRole('link', { name: /Start Interview/i }).first().click();
    await expect(page).toHaveURL(/.*\/interviews?/);
    
    // Skip filling out the configuration form (default values are already populated)
    
    await page.getByRole('button', { name: /Start Interview/i }).click();

    // The app should create an interview, fetch question, and land on Active Interview
    await expect(page).toHaveURL(/.*\/interviews?\/active/);

    // 3. Question Verification & Answer Submission for 5 questions
    for (let i = 1; i <= 5; i++) {
      // A visible question exists and contains the expected mocked text
      await expect(page.getByText(`This is deterministic mock question number ${i}?`)).toBeVisible({ timeout: 10000 });
      
      // Locate the answer textarea
      const answerInput = page.getByPlaceholder(/Type your answer here/i);
      await answerInput.fill(`Realistic test answer for question ${i}.`);
      
      // Submit
      await page.getByRole('button', { name: /submit answer/i }).click();
    }
    
    // Verify processing page or redirect to report
    await expect(page).toHaveURL(/.*\/interviews?\/report/);

    // 5. Final Report Verification
    await expect(page.getByText(/Excellent logical breakdown/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/85/)).toBeVisible();
    await expect(page.getByText(/Clear communication/i)).toBeVisible();

    // 6. Zero-Gemini Assertion
    expect(liveGeminiCalls).toBe(0);
    expect(finalReportCalls).toBe(1);
  });
});
