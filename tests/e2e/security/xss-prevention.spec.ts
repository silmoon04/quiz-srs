/**
 * E2E Tests: Security - XSS Prevention
 * Tests that malicious content is properly sanitized
 */

import { test, expect } from '@playwright/test';
import {
  xssScriptTag,
  xssEventHandlers,
  xssJavascriptUrls,
  xssSvgContent,
  htmlInjection,
  getAllMaliciousQuizzes,
} from '../fixtures/malicious-data';
import { clearLocalStorage } from '../fixtures/quiz-data';

test.describe('XSS Prevention - Script Tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('B3-01: Script tags in quiz name blocked', async ({ page }) => {
    // Track if any alert is triggered
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    // Import malicious quiz
    const jsonString = JSON.stringify(xssScriptTag, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    // Wait for processing
    await page.waitForTimeout(2000);

    // Script should NOT have executed
    expect(alertTriggered).toBe(false);
  });

  test('B3-01: Script tags in question text blocked', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const jsonString = JSON.stringify(xssScriptTag, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Try to start quiz and view questions
    const startBtn = page.locator('button:has-text("Start")');
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(1000);
    }

    expect(alertTriggered).toBe(false);
  });

  test('B3-01: Script tags in options blocked', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const jsonString = JSON.stringify(xssScriptTag, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Navigate through quiz
    const startBtn = page.locator('button:has-text("Start")');
    if (await startBtn.isVisible()) {
      await startBtn.click();
      // Click on options
      const options = page.locator('[role="radio"], .option-card');
      if (await options.first().isVisible()) {
        await options.first().click();
      }
    }

    expect(alertTriggered).toBe(false);
  });

  test('B3-01: Script tags in explanation blocked', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const jsonString = JSON.stringify(xssScriptTag, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Answer question to see explanation
    const startBtn = page.locator('button:has-text("Start")');
    if (await startBtn.isVisible()) {
      await startBtn.click();

      const options = page.locator('[role="radio"], .option-card');
      if (await options.first().isVisible()) {
        await options.first().click();

        const submitBtn = page.locator('button:has-text("Submit")');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    expect(alertTriggered).toBe(false);
  });
});

test.describe('XSS Prevention - Event Handlers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('B3-02: onerror handlers stripped', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const jsonString = JSON.stringify(xssEventHandlers, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);
    expect(alertTriggered).toBe(false);
  });

  test('B3-02: onclick handlers stripped', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const jsonString = JSON.stringify(xssEventHandlers, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Try to trigger by clicking content
    await page.click('body');
    await page.waitForTimeout(500);

    expect(alertTriggered).toBe(false);
  });

  test('B3-02: onmouseover handlers stripped', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const jsonString = JSON.stringify(xssEventHandlers, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Hover over content
    await page.hover('body');
    await page.waitForTimeout(500);

    expect(alertTriggered).toBe(false);
  });

  test('B3-02: onfocus/autofocus handlers stripped', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const jsonString = JSON.stringify(xssEventHandlers, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    // Wait longer for autofocus to trigger if not sanitized
    await page.waitForTimeout(3000);

    expect(alertTriggered).toBe(false);
  });
});

test.describe('XSS Prevention - JavaScript URLs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('B3-03: javascript: URLs blocked in links', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const jsonString = JSON.stringify(xssJavascriptUrls, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Try to click any rendered links
    const links = page.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');

      // If href exists and starts with javascript:, try clicking
      if (href && href.startsWith('javascript:')) {
        await link.click().catch(() => {});
      }
    }

    expect(alertTriggered).toBe(false);
  });

  test('B3-03: javascript: URLs not present in rendered HTML', async ({ page }) => {
    const jsonString = JSON.stringify(xssJavascriptUrls, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Check that no javascript: URLs are in the page
    const html = await page.content();
    const hasJsUrl =
      html.toLowerCase().includes('javascript:') &&
      !html.includes('test') && // Exclude test file references
      html.includes('href="javascript:');

    // Either no javascript: URLs or they're properly escaped
    expect(html.includes('href="javascript:alert')).toBe(false);
  });
});

test.describe('XSS Prevention - SVG Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('B3-05: SVG with script content blocked', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const jsonString = JSON.stringify(xssSvgContent, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);
    expect(alertTriggered).toBe(false);
  });

  test('B3-05: SVG onload handler blocked', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    const jsonString = JSON.stringify(xssSvgContent, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(3000);
    expect(alertTriggered).toBe(false);
  });
});

test.describe('HTML Injection Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('B3-04: Form elements stripped', async ({ page }) => {
    const jsonString = JSON.stringify(htmlInjection, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Check for dangerous form elements
    const forms = await page.locator('form[action*="evil"]').count();
    expect(forms).toBe(0);
  });

  test('B3-04: iframe elements stripped', async ({ page }) => {
    const jsonString = JSON.stringify(htmlInjection, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Check for dangerous iframe elements
    const iframes = await page.locator('iframe[src*="evil"]').count();
    expect(iframes).toBe(0);
  });

  test('B3-04: object/embed elements stripped', async ({ page }) => {
    const jsonString = JSON.stringify(htmlInjection, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Check for dangerous embed/object elements
    const objects = await page.locator('object[data*="evil"], embed[src*="evil"]').count();
    expect(objects).toBe(0);
  });

  test('B3-04: meta refresh stripped', async ({ page }) => {
    const jsonString = JSON.stringify(htmlInjection, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    // Wait to see if page redirects
    const startUrl = page.url();
    await page.waitForTimeout(3000);
    const endUrl = page.url();

    // Should not have redirected
    expect(endUrl).not.toContain('evil.com');
  });
});

test.describe('Comprehensive Security Scan', () => {
  test('All malicious quizzes blocked', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);

    let anyAlertTriggered = false;
    page.on('dialog', async (dialog) => {
      anyAlertTriggered = true;
      await dialog.dismiss();
    });

    const maliciousQuizzes = getAllMaliciousQuizzes();

    for (const { name, data } of maliciousQuizzes) {
      await page.reload();

      const jsonString = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonString);
      const fileInput = page.locator('input[type="file"]');

      await fileInput.setInputFiles({
        name: `${name}.json`,
        mimeType: 'application/json',
        buffer,
      });

      await page.waitForTimeout(1000);
    }

    // None should have triggered alerts
    expect(anyAlertTriggered).toBe(false);
  });

  test('No console errors for security-related issues', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await clearLocalStorage(page);

    const jsonString = JSON.stringify(xssScriptTag, null, 2);
    const buffer = Buffer.from(jsonString);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'xss-quiz.json',
      mimeType: 'application/json',
      buffer,
    });

    await page.waitForTimeout(2000);

    // Should have handled gracefully (no uncaught errors)
    // Some validation errors are expected and ok
    const criticalErrors = errors.filter((e) => !e.includes('validation') && !e.includes('parse'));

    expect(criticalErrors.length).toBe(0);
  });
});
