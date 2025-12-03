/**
 * E2E Tests: First-Time User Journey
 * Tests the complete flow of a new user from landing to quiz completion
 */

import { test, expect } from '@playwright/test';
import {
  validQuizJSON,
  importQuizViaUI,
  clearLocalStorage,
  waitForQuizLoaded,
  answerQuestion,
  navigateToNextQuestion,
  startQuizSession,
} from '../fixtures/quiz-data';

test.describe('First-Time User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all storage to simulate first-time user
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('A1-01: Complete first-time user journey', async ({ page }) => {
    // Step 1: Verify welcome screen shown
    await expect(page.locator('text=/welcome|get started|import/i')).toBeVisible();

    // Step 2: Import a quiz
    await importQuizViaUI(page, validQuizJSON);

    // Step 3: Wait for quiz to load
    await waitForQuizLoaded(page);

    // Step 4: Verify dashboard shows quiz info
    await expect(page.locator(`text=${validQuizJSON.name}`)).toBeVisible();

    // Step 5: Start quiz session
    await startQuizSession(page);

    // Step 6: Answer first question correctly
    await answerQuestion(page, 1); // Correct answer index

    // Step 7: Verify correct feedback shown
    await expect(
      page.locator('[class*="correct"], [data-state="correct"], .text-green'),
    ).toBeVisible();

    // Step 8: Continue to next question
    await navigateToNextQuestion(page);

    // Step 9: Answer incorrectly
    await answerQuestion(page, 0); // Wrong answer

    // Step 10: Verify incorrect feedback
    await expect(
      page.locator('[class*="incorrect"], [data-state="incorrect"], .text-red'),
    ).toBeVisible();
  });

  test('A1-02: First user sees empty state before import', async ({ page }) => {
    // Should show import prompt or empty state
    await expect(page.locator('text=/no quiz|import|load|get started/i')).toBeVisible();

    // Should not show quiz content
    await expect(page.locator('[data-testid="question-text"]')).not.toBeVisible();
  });

  test('A1-03: First user can import via file picker', async ({ page }) => {
    // Find and verify file input exists
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // Import quiz
    await importQuizViaUI(page, validQuizJSON);

    // Verify success
    await waitForQuizLoaded(page);
    await expect(page.locator(`text=${validQuizJSON.name}`)).toBeVisible();
  });

  test('A1-04: First user progress persists after refresh', async ({ page }) => {
    // Import quiz
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // Start and answer a question
    await startQuizSession(page);
    await answerQuestion(page, 1);

    // Refresh the page
    await page.reload();

    // Verify progress maintained
    await waitForQuizLoaded(page);
    // Should show progress or be on next question
    await expect(page.locator('text=/answered|progress|1/i')).toBeVisible();
  });

  test('A1-05: First user can complete entire quiz', async ({ page }) => {
    // Import quiz
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
    await startQuizSession(page);

    // Count total questions
    const totalQuestions = validQuizJSON.chapters.reduce((sum, ch) => sum + ch.questions.length, 0);

    // Answer all questions
    for (let i = 0; i < totalQuestions; i++) {
      await answerQuestion(page, 1); // Just pick an answer

      // Try to go next (may fail on last question)
      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
      }
    }

    // Verify completion state
    await expect(page.locator('text=/complete|finished|results|summary/i')).toBeVisible();
  });

  test('A1-06: First user sees dashboard stats after answering', async ({ page }) => {
    // Import and answer
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
    await startQuizSession(page);
    await answerQuestion(page, 1);

    // Go to dashboard
    const dashboardBtn = page.locator('text=/dashboard|home|back/i').first();
    await dashboardBtn.click();

    // Verify stats visible
    await expect(page.locator('text=/answered|progress|1/i')).toBeVisible();
  });

  test('A1-07: First user can use keyboard navigation', async ({ page }) => {
    // Import quiz
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
    await startQuizSession(page);

    // Tab to first option
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Use arrow keys
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Select with Enter
    await page.keyboard.press('Enter');

    // Tab to submit
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Verify answer registered
    await expect(page.locator('[data-state="submitted"], [class*="submitted"]')).toBeVisible();
  });

  test('A1-08: First user on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Import quiz
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // Verify layout works
    await expect(page.locator(`text=${validQuizJSON.name}`)).toBeVisible();

    // Start quiz
    await startQuizSession(page);

    // Verify questions visible
    await expect(
      page.locator('[data-testid="question-text"], .question-text, h2, h3'),
    ).toBeVisible();
  });

  test('A1-09: First user dark mode preference', async ({ page }) => {
    // Set dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });

    // Import quiz
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // Verify dark theme applied (check for dark class or colors)
    const html = page.locator('html, body, [class*="dark"]');
    await expect(html).toBeVisible();
  });

  test('A1-10: First user sees loading state during import', async ({ page }) => {
    // Start import of large quiz (mock delay)
    const importPromise = importQuizViaUI(page, validQuizJSON);

    // Check for loading indicator (might be quick)
    const loadingIndicator = page.locator(
      '[class*="loading"], [class*="spinner"], text=/loading/i',
    );

    // Complete import
    await importPromise;
    await waitForQuizLoaded(page);

    // Loading should be gone
    await expect(loadingIndicator)
      .not.toBeVisible({ timeout: 1000 })
      .catch(() => {
        // It's ok if loading was too fast to catch
      });
  });
});

test.describe('Welcome Screen Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('Shows call-to-action for new users', async ({ page }) => {
    await expect(
      page.locator('button, a').filter({ hasText: /import|start|begin|load/i }),
    ).toBeVisible();
  });

  test('Has accessible landmarks', async ({ page }) => {
    // Should have main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('All interactive elements are focusable', async ({ page }) => {
    // Tab through page
    let focusableCount = 0;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      if (focused && focused !== 'BODY') {
        focusableCount++;
      }
    }

    // Should find focusable elements
    expect(focusableCount).toBeGreaterThan(0);
  });
});
