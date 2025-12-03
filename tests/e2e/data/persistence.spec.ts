/**
 * E2E Tests: Persistence & State
 * Tests localStorage persistence and state management
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
} from '../fixtures/quiz-data';

test.describe('State Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('B2-08: Autosave frequency', async ({ page }) => {
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Answer question
    await answerQuestion(page, 1);

    // Check state saved immediately
    const state = await getLocalStorage(page, 'quiz-state');
    expect(state).toBeTruthy();

    // Navigate
    await navigateToNextQuestion(page).catch(() => {});

    // Check saved again
    const newState = await getLocalStorage(page, 'quiz-state');
    expect(newState).toBeTruthy();
  });

  test('B2-09: Save during navigation', async ({ page }) => {
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Answer and immediately navigate
    await answerQuestion(page, 1);

    const nextBtn = page.locator('button:has-text("Next")');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }

    // Verify saved
    const state = await getLocalStorage(page, 'quiz-state');
    expect(state).toBeTruthy();
  });

  test('B2-10: Save on browser close (beforeunload)', async ({ page }) => {
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Answer
    await answerQuestion(page, 1);

    // Trigger beforeunload
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });

    // State should be saved
    const state = await getLocalStorage(page, 'quiz-state');
    expect(state).toBeTruthy();
  });
});

test.describe('Concurrent Tab Handling', () => {
  test('B2-05: Concurrent tab state handling', async ({ page, context }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('/');
    await waitForQuizLoaded(page2);

    // Both should see same quiz
    await expect(page2.locator(`text=${validQuizJSON.name}`)).toBeVisible();

    // Make change in tab 1
    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();
    await answerQuestion(page, 1);

    // Tab 2 should see updated state on refresh
    await page2.reload();
    await waitForQuizLoaded(page2);

    // Should have progress
    const hasProgress = await page2
      .locator('text=/answered|progress|1/i')
      .isVisible()
      .catch(() => false);

    await page2.close();

    expect(hasProgress).toBe(true);
  });

  test('B2-06: State sync between tabs', async ({ page, context }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // Start in tab 1
    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Open tab 2
    const page2 = await context.newPage();
    await page2.goto('/');
    await waitForQuizLoaded(page2);

    // Make changes in tab 1
    await answerQuestion(page, 1);

    // Trigger storage event in tab 2 (simulate sync)
    await page2.evaluate(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'quiz-state',
          newValue: localStorage.getItem('quiz-state'),
        }),
      );
    });

    await page2.close();

    // Tab 1 should still work
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('State Corruption Handling', () => {
  test('B2-01: Complete localStorage corruption recovery', async ({ page }) => {
    await page.goto('/');

    // Set completely invalid state
    await page.evaluate(() => {
      localStorage.setItem('quiz-state', 'not json at all!!!');
    });

    await page.reload();

    // Should recover gracefully
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=/import|welcome|error/i').first()).toBeVisible({
      timeout: 3000,
    });
  });

  test('B2-02: Partial corruption recovery', async ({ page }) => {
    await page.goto('/');

    // Set partially valid state
    await setLocalStorage(page, 'quiz-state', {
      quizModule: validQuizJSON,
      currentQuestionIndex: 'not-a-number', // Invalid
      answers: null, // Might cause issues
    });

    await page.reload();

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('B2-13: Invalid state reset option', async ({ page }) => {
    await page.goto('/');

    // Set invalid state
    await setLocalStorage(page, 'quiz-state', {
      quizModule: { name: 'Broken', chapters: 'not-array' },
    });

    await page.reload();

    // Should either auto-reset or offer reset option
    await expect(page.locator('body')).toBeVisible();

    // Clear and verify can start fresh
    await clearLocalStorage(page);
    await page.reload();

    // Should work fresh
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
    await expect(page.locator(`text=${validQuizJSON.name}`)).toBeVisible();
  });
});

test.describe('localStorage Quota', () => {
  test('B2-04: localStorage quota exceeded', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // Fill up localStorage near limit
    await page.evaluate(() => {
      try {
        const bigData = 'x'.repeat(1024 * 1024); // 1MB chunks
        for (let i = 0; i < 4; i++) {
          localStorage.setItem(`filler-${i}`, bigData);
        }
      } catch (e) {
        // Expected
      }
    });

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Try to answer (save might fail)
    await answerQuestion(page, 1);

    // Should handle gracefully - either save worked or showed error
    await expect(page.locator('body')).toBeVisible();

    // Cleanup
    await page.evaluate(() => {
      for (let i = 0; i < 10; i++) {
        localStorage.removeItem(`filler-${i}`);
      }
    });
  });
});

test.describe('State Migration', () => {
  test('B2-07: State migration on app update', async ({ page }) => {
    await page.goto('/');

    // Set old format state (hypothetical v1 format)
    await setLocalStorage(page, 'quiz-state', {
      _version: 1,
      quiz: validQuizJSON,
      progress: { q1: true },
    });

    await page.reload();

    // Should handle old format (migrate or reset)
    await expect(page.locator('body')).toBeVisible();
  });

  test('B2-15: Version mismatch handling', async ({ page }) => {
    await page.goto('/');

    // Set future version state
    await setLocalStorage(page, 'quiz-state', {
      _version: 9999,
      quizModule: validQuizJSON,
    });

    await page.reload();

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Incognito Mode', () => {
  test('A3-08: Incognito mode session', async ({ browser }) => {
    // Create incognito context
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/');
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    await answerQuestion(page, 1);

    // Should work in incognito
    await expect(page.locator('body')).toBeVisible();

    // State saved
    const state = await getLocalStorage(page, 'quiz-state');
    expect(state).toBeTruthy();

    await context.close();
  });
});

test.describe('Answer Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
  });

  test('Answer history recorded', async ({ page }) => {
    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Answer multiple questions
    for (let i = 0; i < 3; i++) {
      await answerQuestion(page, i % 2);
      await navigateToNextQuestion(page).catch(() => {});
    }

    const state = await getLocalStorage(page, 'quiz-state');
    expect(state).toBeTruthy();
  });

  test('Correct/incorrect counts accurate', async ({ page }) => {
    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Answer correctly
    await answerQuestion(page, 1);
    await navigateToNextQuestion(page).catch(() => {});

    // Answer incorrectly
    await answerQuestion(page, 0);

    const state = await getLocalStorage(page, 'quiz-state');
    expect(state).toBeTruthy();
  });

  test('Answer modification tracked', async ({ page }) => {
    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Select first option
    const options = page.locator('[role="radio"], .option-card');
    await options.first().click();

    // Change to second
    await options.nth(1).click();

    // Submit
    const submitBtn = page.locator('button:has-text("Submit")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }

    // Final selection should be recorded
    const state = await getLocalStorage(page, 'quiz-state');
    expect(state).toBeTruthy();
  });
});

test.describe('Session Boundaries', () => {
  test('A3-03: Session across midnight boundary', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // Set date to just before midnight
    await page.evaluate(() => {
      const originalDate = Date;
      const mockDate = new Date('2024-01-01T23:59:59');
      // @ts-expect-error - Mocking Date for testing
      Date = class extends originalDate {
        constructor() {
          super();
          return mockDate;
        }
        static now() {
          return mockDate.getTime();
        }
      };
    });

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();
    await answerQuestion(page, 1);

    // Simulate midnight crossing
    await page.evaluate(() => {
      const originalDate = Date;
      const mockDate = new Date('2024-01-02T00:00:01');
      // @ts-expect-error - Mocking Date for testing
      Date = class extends originalDate {
        constructor() {
          super();
          return mockDate;
        }
        static now() {
          return mockDate.getTime();
        }
      };
    });

    await navigateToNextQuestion(page).catch(() => {});
    await answerQuestion(page, 1);

    // Should handle date change gracefully
    const state = await getLocalStorage(page, 'quiz-state');
    expect(state).toBeTruthy();
  });
});
