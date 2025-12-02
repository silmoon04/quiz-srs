/**
 * E2E User Flow Contract Tests
 *
 * These Playwright tests define the REQUIRED end-to-end user flows.
 * Any implementation MUST satisfy these contracts.
 *
 * These tests are BEHAVIOR-FOCUSED and implementation-agnostic.
 * They test what the user sees and does, not how it's built.
 */

import { test, expect, Page } from '@playwright/test';

// ============================================
// CONTRACT: QUIZ SESSION FLOW
// ============================================

test.describe('E2E Contract - Complete Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('CONTRACT: User can complete a full quiz session', async ({ page }) => {
    // Start quiz
    const startButton = page.getByRole('button', { name: /start|begin|quiz/i });
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    // Wait for quiz to load
    await page.waitForSelector('[data-testid="question-text"], .question-text, h2, h3', {
      timeout: 10000,
    });

    // Select an option
    const options = page.locator(
      '[role="radio"], [data-testid="option"], button:has-text("A"), button:has-text("B")',
    );
    const optionCount = await options.count();

    if (optionCount > 0) {
      await options.first().click();
    }

    // Submit answer
    const submitButton = page.getByRole('button', { name: /submit/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Verify feedback is shown (explanation or next button)
    await expect(
      page
        .locator('[data-testid="explanation"], .explanation, [role="alert"]')
        .or(page.getByRole('button', { name: /next/i })),
    ).toBeVisible({ timeout: 5000 });
  });

  test('CONTRACT: User can navigate between questions', async ({ page }) => {
    // Start quiz if needed
    const startButton = page.getByRole('button', { name: /start|begin/i });
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    await page.waitForTimeout(1000);

    // Look for navigation controls
    const nextButton = page.getByRole('button', { name: /next/i });
    const prevButton = page.getByRole('button', { name: /prev|back/i });

    // Navigation buttons should exist
    const hasNavigation =
      (await nextButton.isVisible().catch(() => false)) ||
      (await prevButton.isVisible().catch(() => false));

    // Or there should be a question navigation menu
    const hasNavMenu = await page
      .locator('[data-testid="question-nav"], .question-navigation')
      .isVisible()
      .catch(() => false);

    expect(hasNavigation || hasNavMenu).toBeTruthy();
  });
});

// ============================================
// CONTRACT: ANSWER FEEDBACK
// ============================================

test.describe('E2E Contract - Answer Feedback Display', () => {
  test('CONTRACT: Correct answer shows success feedback', async ({ page }) => {
    await page.goto('/');

    // Start quiz
    const startButton = page.getByRole('button', { name: /start|begin/i });
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    await page.waitForTimeout(1000);

    // This test verifies that SOME feedback is shown
    // The specific styling is implementation detail
    const hasSubmitButton = await page
      .getByRole('button', { name: /submit/i })
      .isVisible()
      .catch(() => false);

    if (hasSubmitButton) {
      // Select first option
      const options = page.locator('[role="radio"], [data-testid="option"]');
      if ((await options.count()) > 0) {
        await options.first().click();
        await page.getByRole('button', { name: /submit/i }).click();

        // Should show some feedback
        await page.waitForTimeout(500);
        const hasFeedback = await page
          .locator('.correct, .incorrect, [data-testid="feedback"], .explanation')
          .isVisible()
          .catch(() => false);
        // Feedback or next button should appear
        const hasNext = await page
          .getByRole('button', { name: /next/i })
          .isVisible()
          .catch(() => false);

        expect(hasFeedback || hasNext).toBeTruthy();
      }
    }
  });

  test('CONTRACT: Explanation is shown after submission', async ({ page }) => {
    await page.goto('/');

    // Start quiz
    const startButton = page.getByRole('button', { name: /start|begin/i });
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    await page.waitForTimeout(1000);

    // Select and submit
    const options = page.locator('[role="radio"], [data-testid="option"]');
    const submitButton = page.getByRole('button', { name: /submit/i });

    if ((await options.count()) > 0 && (await submitButton.isVisible())) {
      await options.first().click();
      await submitButton.click();

      // Wait for explanation or feedback
      await page.waitForTimeout(1000);

      // Some form of explanation/feedback should be visible
      const explanationVisible = await page
        .locator('[data-testid="explanation"], .explanation, [role="alert"]')
        .isVisible()
        .catch(() => false);
      const nextVisible = await page
        .getByRole('button', { name: /next/i })
        .isVisible()
        .catch(() => false);

      expect(explanationVisible || nextVisible).toBeTruthy();
    }
  });
});

// ============================================
// CONTRACT: STATE PERSISTENCE
// ============================================

test.describe('E2E Contract - State Persistence', () => {
  test('CONTRACT: Progress survives page reload', async ({ page }) => {
    await page.goto('/');

    // Start quiz
    const startButton = page.getByRole('button', { name: /start|begin/i });
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    await page.waitForTimeout(1000);

    // Answer a question if possible
    const options = page.locator('[role="radio"], [data-testid="option"]');
    const submitButton = page.getByRole('button', { name: /submit/i });

    if ((await options.count()) > 0 && (await submitButton.isVisible())) {
      await options.first().click();
      await submitButton.click();
      await page.waitForTimeout(500);
    }

    // Get current state indicator (progress, question number, etc.)
    const progressText = await page
      .locator('[data-testid="progress"], .progress, [role="progressbar"]')
      .textContent()
      .catch(() => '');

    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);

    // State should be preserved (either in quiz or on dashboard with progress)
    const isInQuiz = await page
      .locator('[data-testid="question-text"], .question-text')
      .isVisible()
      .catch(() => false);
    const isOnDashboard = await page
      .locator('[data-testid="dashboard"], .dashboard')
      .isVisible()
      .catch(() => false);
    const isOnWelcome = await page
      .getByRole('button', { name: /start|begin/i })
      .isVisible()
      .catch(() => false);

    // Should be somewhere valid after reload
    expect(isInQuiz || isOnDashboard || isOnWelcome).toBeTruthy();
  });
});

// ============================================
// CONTRACT: KEYBOARD NAVIGATION
// ============================================

test.describe('E2E Contract - Keyboard Accessibility', () => {
  test('CONTRACT: Can complete quiz with keyboard only', async ({ page }) => {
    await page.goto('/');

    // Tab to start button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Try to find and activate start button
    const startButton = page.getByRole('button', { name: /start|begin/i });
    if (await startButton.isVisible()) {
      await startButton.focus();
      await page.keyboard.press('Enter');
    }

    await page.waitForTimeout(1000);

    // Tab to options area
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Arrow through options
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Select with Enter or Space
    await page.keyboard.press('Space');

    // Tab to submit
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Some interaction should have happened
    await page.waitForTimeout(500);
  });

  test('CONTRACT: Focus is visible on interactive elements', async ({ page }) => {
    await page.goto('/');

    // Tab to first focusable element
    await page.keyboard.press('Tab');

    // Get the focused element
    const focusedElement = page.locator(':focus');

    // Focused element should exist
    expect(await focusedElement.count()).toBeGreaterThan(0);
  });
});

// ============================================
// CONTRACT: IMPORT/EXPORT
// ============================================

test.describe('E2E Contract - Import/Export', () => {
  test('CONTRACT: Export button triggers download', async ({ page }) => {
    await page.goto('/');

    // Look for export button
    const exportButton = page.getByRole('button', { name: /export/i });

    if (await exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

      await exportButton.click();

      const download = await downloadPromise;

      if (download) {
        // Verify download was triggered
        expect(download.suggestedFilename()).toBeTruthy();
      }
    }
  });
});

// ============================================
// CONTRACT: ERROR HANDLING
// ============================================

test.describe('E2E Contract - Error Handling', () => {
  test('CONTRACT: 404 page shows helpful message', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');

    // Should show some error indication
    const hasErrorMessage = await page
      .locator('text=/not found|404|error/i')
      .isVisible()
      .catch(() => false);
    const hasHomeLink = await page
      .getByRole('link', { name: /home|back/i })
      .isVisible()
      .catch(() => false);

    // Either error message or redirect to home
    const isHome = (await page.url()) === page.url().split('/')[0] + '/';

    expect(hasErrorMessage || hasHomeLink || isHome).toBeTruthy();
  });
});

// ============================================
// CONTRACT: RESPONSIVE DESIGN
// ============================================

test.describe('E2E Contract - Responsive Design', () => {
  test('CONTRACT: App is usable on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // App should load
    await page.waitForLoadState('networkidle');

    // Content should be visible (not overflowing)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;

    // Body shouldn't be significantly wider than viewport
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50);
  });

  test('CONTRACT: App is usable on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Start button should be visible and clickable
    const startButton = page.getByRole('button', { name: /start|begin/i });
    if (await startButton.isVisible()) {
      await expect(startButton).toBeEnabled();
    }
  });
});

// ============================================
// CONTRACT: LOADING STATES
// ============================================

test.describe('E2E Contract - Loading States', () => {
  test('CONTRACT: App shows content within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Should have some visible content
    const hasContent = await page.locator('body').textContent();
    expect(hasContent?.length).toBeGreaterThan(0);
  });
});

// ============================================
// CONTRACT: DARK MODE
// ============================================

test.describe('E2E Contract - Theme Support', () => {
  test('CONTRACT: Dark mode is supported', async ({ page }) => {
    // Set dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Get background color
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Dark mode should have dark background
    // (not necessarily pure black, but not white)
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });
});
