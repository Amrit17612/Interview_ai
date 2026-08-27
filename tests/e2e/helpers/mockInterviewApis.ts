import { Page } from '@playwright/test';

export async function mockInterviewApis(page: Page, overrides: any = {}) {
  await page.route('**/api/interviews', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        json: {
          success: true,
          data: {
            _id: 'test-session-id',
            user: 'test-user-id',
            resumeId: null,
            atsJobId: null,
            configuration: { type: 'TECHNICAL', domain: 'Software Engineering', difficulty: 'BEGINNER' },
            status: 'IN_PROGRESS',
            questions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...overrides.session
          }
        }
      });
    } else {
      await route.continue();
    }
  });

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
          questions: [],
          ...overrides.session
        }
      }
    });
  });
}
