import { Page } from '@playwright/test';

export async function mockAuthApis(page: Page, options: { isAuthenticated?: boolean } = {}) {
  const { isAuthenticated = true } = options;

  await page.route('**/api/auth/me', async route => {
    if (isAuthenticated) {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          user: {
            id: 'test-user-id',
            firstName: 'Test',
            lastName: 'User',
            email: process.env.E2E_TEST_EMAIL || 'test@example.com',
            onboardingCompleted: true,
            emailVerified: true,
          }
        }
      });
    } else {
      await route.fulfill({
        status: 401,
        json: { success: false, message: 'Not authenticated' }
      });
    }
  });

  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      json: {
        success: true,
        user: {
          id: 'test-user-id',
          firstName: 'Test',
          lastName: 'User',
          email: process.env.E2E_TEST_EMAIL || 'test@example.com',
          onboardingCompleted: true,
          emailVerified: true
        },
        token: 'mock-jwt-token'
      }
    });
  });
}
