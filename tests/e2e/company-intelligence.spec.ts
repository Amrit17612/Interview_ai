import { test, expect } from '@playwright/test';
import { mockAuthApis } from './helpers/mockAuthApis';
import { mockContextApis } from './helpers/mockContextApis';
import { mockInterviewApis } from './helpers/mockInterviewApis';

test.describe('Sprint 22: Company Intelligence E2E', () => {

  test.beforeEach(async ({ page }) => {
    await mockAuthApis(page);
    await mockContextApis(page);
    await mockInterviewApis(page);
  });

  test('Scenario 1: Generic Interview (No company/role)', async ({ page }) => {
    await page.goto('/interviews');

    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/api/interviews') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: /Start Interview|Create/i }).click();

    const request = await requestPromise;
    const postData = request.postDataJSON();

    expect(postData.configuration.company).toBeUndefined();
    expect(postData.configuration.role).toBeUndefined();
    expect(postData.configuration.domain).toBe('Frontend'); // Default value

    await expect(page).toHaveURL(/.*\/interviews\/active\?id=/);
  });

  test('Scenario 2: Company Only', async ({ page }) => {
    await page.goto('/interviews');

    await page.locator('select').filter({ hasText: 'Google' }).selectOption('GOOGLE');

    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/api/interviews') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: /Start Interview|Create/i }).click();

    const request = await requestPromise;
    const postData = request.postDataJSON();

    expect(postData.configuration.company).toBe('GOOGLE');
    expect(postData.configuration.role).toBeUndefined(); 

    await expect(page).toHaveURL(/.*\/interviews\/active\?id=/);
  });

  test('Scenario 3: Role Only', async ({ page }) => {
    await page.goto('/interviews');

    const roleInput = page.getByPlaceholder(/Frontend Engineer/i);
    await roleInput.fill('Frontend Engineer');

    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/api/interviews') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: /Start Interview|Create/i }).click();

    const request = await requestPromise;
    const postData = request.postDataJSON();

    expect(postData.configuration.role).toBe('Frontend Engineer');
    expect(postData.configuration.company).toBeUndefined(); // or empty string

    await expect(page).toHaveURL(/.*\/interviews\/active\?id=/);
  });

  test('Scenario 4: Company + Role', async ({ page }) => {
    await page.goto('/interviews');

    await page.locator('select').filter({ hasText: 'Microsoft' }).selectOption('MICROSOFT');
    await page.getByPlaceholder(/Frontend Engineer/i).fill('Software Engineer');

    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/api/interviews') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: /Start Interview|Create/i }).click();

    const request = await requestPromise;
    const postData = request.postDataJSON();

    expect(postData.configuration.company).toBe('MICROSOFT');
    expect(postData.configuration.role).toBe('Software Engineer');

    await expect(page).toHaveURL(/.*\/interviews\/active\?id=/);
  });

  test('Scenario 5: Targeted Practice Compatibility', async ({ page }) => {
    await page.goto('/interviews?targetSkill=react');

    await page.locator('select').filter({ hasText: 'Meta' }).selectOption('META');
    await page.getByPlaceholder(/Frontend Engineer/i).fill('UI Engineer');

    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/api/interviews') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: /Start Interview|Create/i }).click();

    const request = await requestPromise;
    const postData = request.postDataJSON();

    expect(postData.configuration.targetSkill).toBe('react');
    expect(postData.configuration.company).toBe('META');
    expect(postData.configuration.role).toBe('UI Engineer');

    await expect(page).toHaveURL(/.*\/interviews\/active\?id=/);
  });

});
