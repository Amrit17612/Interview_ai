import { Page } from '@playwright/test';

interface MockContextOptions {
  readiness?: any;
  readinessError?: boolean;
}

export async function mockContextApis(page: Page, options: MockContextOptions = {}) {
  const { readiness, readinessError } = options;

  await page.route('**/api/resumes*', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, json: { success: true, count: 0, resumes: [] } });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/ats/jobs*', async route => {
    // Note: This matches /api/ats/jobs, /api/ats/jobs/:id, etc.
    // If it's a readiness request, we intercept it specifically below.
    if (route.request().url().includes('/readiness')) {
      await route.fallback();
      return;
    }
    
    if (route.request().method() === 'GET') {
      const url = route.request().url();
      if (url.match(/\/api\/ats\/jobs\/[a-zA-Z0-9_-]+$/)) {
        await route.fulfill({ status: 200, json: { success: true, job: { id: 'test-job', title: 'Software Engineer', company: 'TechCorp', content: 'Job description' } } });
      } else {
        await route.fulfill({ status: 200, json: { success: true, count: 1, jobs: [{ id: 'test-job', title: 'Software Engineer', company: 'TechCorp', content: 'Job description' }] } });
      }
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/ats/jobs/*/readiness', async route => {
    if (readinessError) {
      await route.fulfill({ status: 500, json: { success: false, message: 'Internal Server Error' } });
      return;
    }

    const defaultReadiness = {
      readinessScore: 75,
      readinessStatus: 'MODERATE',
      scoreBreakdown: { resumeMatch: 80, interviewAlignment: 70, weaknessRisk: 60, practiceProgress: 90 },
      matchedSkills: [],
      missingSkills: [],
      relevantStrengths: [],
      relevantWeaknesses: [],
      recommendedActions: [],
      summary: 'Moderate alignment with the job description.'
    };

    await route.fulfill({
      status: 200,
      json: {
        success: true,
        data: readiness || defaultReadiness
      }
    });
  });
}
