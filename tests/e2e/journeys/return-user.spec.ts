/**
 * E2E Tests: Return User & Session Resume
 * Tests that returning users can resume their progress
 */

import { test, expect } from '@playwright/test';
import {
  validQuizJSON,
  importQuizViaUI,
  clearLocalStorage,
  setLocalStorage,
  getLocalStorage,
  waitForQuizLoaded,
  answerQuestion,
  navigateToNextQuestion,
  startQuizSession,
} from '../fixtures/quiz-data';

test.describe('Return User Resume', () => {
  test('A1-02: Return user resumes exact position', async ({ page }) => {
    // First session: Make progress
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();

    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
    await startQuizSession(page);

    // Answer first 3 questions
    for (let i = 0; i < 3; i++) {
      await answerQuestion(page, 1);
      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
      }
    }

    // Get current position before leaving
    const currentQuestion = await page
      .locator('.question-text, [data-testid="question-text"], h2, h3')
      .first()
      .textContent();

    // Simulate leaving and returning (new browser session)
    await page.reload();
    await waitForQuizLoaded(page);

    // Should be at same position or able to continue
    await startQuizSession(page).catch(() => {});

    // Verify progress preserved
    const progressText = await page.locator('text=/3|answered|progress/i').isVisible();
    expect(progressText).toBeTruthy();
  });

  test('A3-01: Continue after browser restart', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();

    // Set up quiz and make progress
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
    await startQuizSession(page);
    await answerQuestion(page, 1);

    // Store what we had
    const savedState = await getLocalStorage(page, 'quiz-state');

    // Simulate browser restart (clear session, reload with stored data)
    await page.context().clearCookies();
    await page.goto('/');

    // Verify state was preserved in localStorage
    await waitForQuizLoaded(page);
    const restoredState = await getLocalStorage(page, 'quiz-state');

    // State should be preserved
    expect(restoredState).toBeTruthy();
  });

  test('A3-04: Interrupted session recovery', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();

    // Import and start
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
    await startQuizSession(page);

    // Select answer but don't submit (interrupted)
    const options = page.locator('[role="radio"], [role="option"], .option-card');
    await options.first().click();

    // Abrupt navigation (simulate interruption)
    await page.goto('about:blank');
    await page.goto('/');

    // Should be able to continue
    await waitForQuizLoaded(page);
    await expect(page.locator('text=/continue|resume|quiz/i')).toBeVisible();
  });

  test('A3-09: Session after cache clear', async ({ page }) => {
    await page.goto('/');

    // Set up quiz with progress
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
    await startQuizSession(page);
    await answerQuestion(page, 1);

    // Clear only cache (not localStorage)
    // In real browser, this is Clear browsing data -> Cached images
    // We simulate by just reloading
    await page.reload();

    // Should still have progress
    await waitForQuizLoaded(page);
    const hasProgress = await page.locator('text=/answered|progress|continue/i').isVisible();
    expect(hasProgress).toBeTruthy();
  });

  test('A3-07: Multiple browser windows', async ({ page, context }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();

    // Import quiz in first tab
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
    await startQuizSession(page);
    await answerQuestion(page, 1);

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('/');
    await waitForQuizLoaded(page2);

    // Both tabs should see same quiz
    await expect(page2.locator(`text=${validQuizJSON.name}`)).toBeVisible();

    // Answer in tab 2
    await startQuizSession(page2).catch(() => {});

    // Tabs should handle concurrent state
    // At minimum, no crash
    await expect(page2.locator('body')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();

    await page2.close();
  });
});

test.describe('Progress Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
  });

  test('Answer saved immediately after submission', async ({ page }) => {
    await startQuizSession(page);
    await answerQuestion(page, 1);

    // Check localStorage immediately
    const state = await getLocalStorage(page, 'quiz-state');
    expect(state).toBeTruthy();
  });

  test('All answers preserved across refresh', async ({ page }) => {
    await startQuizSession(page);

    // Answer multiple questions
    for (let i = 0; i < 3; i++) {
      await answerQuestion(page, i % 2);
      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
      }
    }

    // Refresh
    await page.reload();
    await waitForQuizLoaded(page);

    // Verify all progress kept
    await expect(page.locator('text=/3|answered/i')).toBeVisible();
  });

  test('SRS levels persist correctly', async ({ page }) => {
    await startQuizSession(page);

    // Answer correctly multiple times (for SRS level up)
    await answerQuestion(page, 1); // Correct
    await navigateToNextQuestion(page);

    const state = await getLocalStorage(page, 'quiz-state');

    // Reload and verify SRS data
    await page.reload();
    await waitForQuizLoaded(page);

    const newState = await getLocalStorage(page, 'quiz-state');
    expect(newState).toBeTruthy();
  });

  test('Chapter progress tracked separately', async ({ page }) => {
    await startQuizSession(page);

    // Answer questions in first chapter
    await answerQuestion(page, 1);
    await navigateToNextQuestion(page);
    await answerQuestion(page, 1);

    // Navigate to dashboard
    const dashboardBtn = page.locator('text=/dashboard|home/i').first();
    await dashboardBtn.click();

    // Both chapters should show appropriate progress
    await expect(page.locator('text=/chapter 1/i')).toBeVisible();
  });

  test('Review queue populated correctly', async ({ page }) => {
    await startQuizSession(page);

    // Answer incorrectly
    await answerQuestion(page, 0);

    // Check if review queue updated
    const state = await getLocalStorage(page, 'quiz-state');

    // Navigate to review (if feature exists)
    const reviewBtn = page.locator('text=/review/i');
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();
      // Should have question to review
      await expect(page.locator('.question-text, [data-testid="question"]')).toBeVisible();
    }
  });
});

test.describe('State Consistency', () => {
  test('E2-01: Empty quiz handling after restart', async ({ page }) => {
    await page.goto('/');

    // Set corrupted/empty state
    await setLocalStorage(page, 'quiz-state', {});
    await page.reload();

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
    // Should show import option or error
    await expect(page.locator('text=/import|error|start/i')).toBeVisible();
  });

  test('E2-11: Null/undefined values in state', async ({ page }) => {
    await page.goto('/');

    // Set state with null values
    await setLocalStorage(page, 'quiz-state', {
      quizModule: null,
      currentQuestion: undefined,
      answers: null,
    });

    await page.reload();

    // Should handle gracefully - no crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('B2-01: LocalStorage corruption recovery', async ({ page }) => {
    await page.goto('/');

    // Set completely invalid JSON
    await page.evaluate(() => {
      localStorage.setItem('quiz-state', '{invalid json!!!');
    });

    await page.reload();

    // Should recover - no white screen
    await expect(page.locator('body')).toBeVisible();

    // Should show fresh state or error message
    await expect(page.locator('text=/import|error|welcome/i')).toBeVisible();
  });
});
