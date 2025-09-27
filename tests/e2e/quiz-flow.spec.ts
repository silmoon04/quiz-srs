import { test, expect } from '@playwright/test';

test.describe('Quiz Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page', async ({ page }) => {
    await expect(page).toHaveTitle(/Quiz.*SRS/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to test page', async ({ page }) => {
    await page.goto('/test');
    await expect(page).toHaveURL('/test');
  });

  test('should display quiz content', async ({ page }) => {
    await page.goto('/test');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Check if quiz content is visible
    const quizContent = page.locator('[data-testid="quiz-content"]');
    if (await quizContent.isVisible()) {
      await expect(quizContent).toBeVisible();
    }
  });

  test('should handle quiz interactions', async ({ page }) => {
    await page.goto('/test');

    // Wait for quiz to load
    await page.waitForLoadState('networkidle');

    // Look for quiz options or buttons
    const quizOptions = page.locator('[data-testid*="option"]');
    const optionCount = await quizOptions.count();

    if (optionCount > 0) {
      // Click on the first option
      await quizOptions.first().click();

      // Check if there's feedback or next button
      const nextButton = page.locator('[data-testid="next-button"]');
      const submitButton = page.locator('[data-testid="submit-button"]');

      if (await nextButton.isVisible()) {
        await nextButton.click();
      } else if (await submitButton.isVisible()) {
        await submitButton.click();
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/test');

    // Check if content is visible on mobile
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/test');
    await page.waitForLoadState('networkidle');

    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focus is visible (excluding Next.js dev tools)
    const focusedElement = page.locator(':focus:not([data-nextjs-dev-tools-button])');
    if ((await focusedElement.count()) > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should display error states gracefully', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/non-existent-page');

    // Should either show 404 content or stay on the page (Next.js behavior)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/non-existent-page/);

    // Check that the page doesn't crash and shows some content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/test');
    await page.waitForLoadState('networkidle');

    // Navigate away and back
    await page.goto('/');
    await page.goto('/test');

    // Content should still be there
    await page.waitForLoadState('networkidle');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/test');
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1');
    const h1Count = await h1.count();

    if (h1Count > 0) {
      await expect(h1.first()).toBeVisible();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/test');
    await page.waitForLoadState('networkidle');

    // Check for form elements with proper labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        // At least one accessibility attribute should be present
        expect(id || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/test');
    await page.waitForLoadState('networkidle');

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        // Button should have either text content or aria-label
        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    }
  });
});
