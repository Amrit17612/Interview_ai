const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login');
    
    // Login
    console.log('Logging in...');
    await page.fill('input[type="email"]', 'amrit17612@gmail.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for Dashboard to load
    console.log('Waiting for Dashboard...');
    await page.waitForURL('**/dashboard');
    
    // Click the Test Gemini Connection button
    console.log('Clicking Test Gemini Connection button...');
    const button = page.locator('button:has-text("Test Gemini Connection")');
    await button.click();

    console.log('Waiting for AI response or error...');
    
    // Wait for either the success or error box
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('AI Configuration Error') || text.includes('Success:');
    }, { timeout: 20000 });

    const resultText = await page.evaluate(() => {
      const text = document.body.innerText;
      if (text.includes('AI Configuration Error')) return 'AI Configuration Error';
      if (text.includes('Success:')) return 'Success Text Rendered';
      return 'Unknown Result';
    });

    console.log('RESULT:', resultText);
    console.log('Browser flow test complete.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
