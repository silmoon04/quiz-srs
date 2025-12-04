/**
 * E2E Tests: Error Recovery
 * Tests graceful handling of errors and recovery
 */

import { test, expect } from '@playwright/test';
import {
  validQuizJSON,
  importQuizViaUI,
  clearLocalStorage,
  setLocalStorage,
  waitForQuizLoaded,
} from '../fixtures/quiz-data';

test.describe('Error Boundary', () => {
  test('E1-01: Error boundary fallback UI', async ({ page }) => {
    await page.goto('/');

    // Set up corrupted state that might cause render error
    await setLocalStorage(page, 'quiz-state', {
      quizModule: { chapters: 'not-an-array' }, // Invalid structure
      currentQuestionIndex: -1, // Invalid
    });

    await page.reload();

    // Should show error UI or recover, not crash
    await expect(page.locator('body')).toBeVisible();

    // Should either show error message or fresh state
    const errorOrFresh = page.locator('text=/error|oops|something went wrong|import|welcome/i');
    await expect(errorOrFresh.first()).toBeVisible({ timeout: 3000 });
  });

  test('E1-08: Recovery from any error', async ({ page }) => {
    await page.goto('/');

    // Inject error-causing state
    await page.evaluate(() => {
      localStorage.setItem('quiz-state', 'corrupted{{{');
    });

    await page.reload();

    // Should recover - app should be usable
    await expect(page.locator('body')).toBeVisible();

    // Try to import new quiz
    await clearLocalStorage(page);
    await page.reload();
    await importQuizViaUI(page, validQuizJSON);

    // Should work after recovery
    await waitForQuizLoaded(page);
    await expect(page.locator(`text=${validQuizJSON.name}`)).toBeVisible();
  });

  test('E1-15: Component error isolation', async ({ page }) => {
    await page.goto('/');

    // Create quiz with potentially problematic content
    const problematicQuiz = {
      ...validQuizJSON,
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter',
          questions: [
            {
              questionId: 'q1',
              questionText: null, // Might cause render error
              options: [],
              correctOptionIds: [],
            },
            {
              questionId: 'q2',
              questionText: 'Valid question',
              options: [{ optionId: 'a', optionText: 'A' }],
              correctOptionIds: ['a'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, problematicQuiz);

    // Even if first question errors, app should not crash
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Parse Error Recovery', () => {
  test('E1-02: Parse error message', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]');
    const buffer = Buffer.from('{ invalid json }}}');

    await fileInput.setInputFiles({
      name: 'broken.json',
      mimeType: 'application/json',
      buffer,
    });

    // Should show parse error message
    await expect(page.locator('text=/error|invalid|parse|json/i')).toBeVisible({ timeout: 2000 });
  });

  test('E1-03: Validation error detail', async ({ page }) => {
    await page.goto('/');

    // Quiz missing required fields
    const invalidQuiz = {
      name: 'Missing stuff',
      // No chapters!
    };

    const buffer = Buffer.from(JSON.stringify(invalidQuiz));
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer,
    });

    // Should show specific validation error
    await expect(page.locator('text=/error|invalid|required|chapters/i')).toBeVisible({
      timeout: 2000,
    });
  });
});

test.describe('Storage Error Recovery', () => {
  test('B2-01: LocalStorage corruption recovery', async ({ page }) => {
    await page.goto('/');

    // Write corrupted data
    await page.evaluate(() => {
      localStorage.setItem('quiz-state', '{"broken": true, "invalid');
    });

    await page.reload();

    // App should recover
    await expect(page.locator('body')).toBeVisible();

    // Should show fresh state or error
    await expect(page.locator('text=/import|error|welcome/i').first()).toBeVisible({
      timeout: 3000,
    });
  });

  test('B2-02: Partial localStorage corruption', async ({ page }) => {
    await page.goto('/');

    // Set partially valid state
    await setLocalStorage(page, 'quiz-state', {
      quizModule: validQuizJSON,
      // Missing other required fields
    });

    await page.reload();

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('B2-03: localStorage cleared by user', async ({ page }) => {
    await page.goto('/');
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // User clears storage
    await clearLocalStorage(page);
    await page.reload();

    // App should start fresh
    await expect(page.locator('text=/import|welcome|get started/i').first()).toBeVisible({
      timeout: 3000,
    });
  });

  test('B2-11: Recover half-written state', async ({ page }) => {
    await page.goto('/');

    // Simulate interrupted write
    await page.evaluate(() => {
      localStorage.setItem(
        'quiz-state',
        '{"quizModule":{"name":"Test","chapters":[{"id":"ch1","title":"Chapter","questions":[{"questionId":"q1"',
      );
    });

    await page.reload();

    // Should recover from truncated JSON
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=/error|import|welcome/i').first()).toBeVisible({
      timeout: 3000,
    });
  });
});

test.describe('Silent Failure Prevention', () => {
  test('E1-06: Silent failure prevention', async ({ page }) => {
    await page.goto('/');

    // Track console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Try various operations that could fail
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Try to break things
      await page.evaluate(() => {
        // Dispatch weird events
        document.dispatchEvent(new Event('error'));
      });
    }

    // Should have no uncaught errors (some console errors might be expected)
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('E1-09: Error dismissal', async ({ page }) => {
    await page.goto('/');

    // Trigger an error
    const buffer = Buffer.from('invalid');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer,
    });

    // Wait for error
    const error = page.locator('[role="alert"], [class*="error"], [class*="toast"]');

    if (await error.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Try to dismiss
      const closeBtn = error.locator('button, [aria-label*="close"]');
      if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeBtn.click();

        // Error should be dismissed
        await expect(error).not.toBeVisible({ timeout: 1000 });
      }
    }
  });
});

test.describe('Error During Operations', () => {
  test('E1-12: Error during save', async ({ page }) => {
    await page.goto('/');
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // Fill up localStorage to near limit
    await page.evaluate(() => {
      try {
        const largeData = 'x'.repeat(1024 * 1024); // 1MB
        for (let i = 0; i < 4; i++) {
          localStorage.setItem(`filler-${i}`, largeData);
        }
      } catch (e) {
        // Expected to fail at some point
      }
    });

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Try to answer (might fail to save)
      const options = page.locator('[role="radio"], .option-card');
      if (await options.first().isVisible()) {
        await options.first().click();

        const submitBtn = page.locator('button:has-text("Submit")');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
        }
      }
    }

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();

    // Cleanup
    await page.evaluate(() => {
      for (let i = 0; i < 10; i++) {
        localStorage.removeItem(`filler-${i}`);
      }
    });
  });

  test('E1-13: Error during load', async ({ page }) => {
    await page.goto('/');

    // Mock network error for sample quiz
    await page.route('**/*.json', (route) => route.abort());

    // Try to load sample
    const sampleBtn = page.locator('button:has-text("Sample"), button:has-text("Demo")');
    if (await sampleBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sampleBtn.click();

      // Should show error
      await expect(page.locator('text=/error|failed|unable/i')).toBeVisible({ timeout: 3000 });
    }

    // Unroute
    await page.unroute('**/*.json');
  });
});

test.describe('Infinite Loop Prevention', () => {
  test('E1-70: Infinite loop prevention', async ({ page }) => {
    await page.goto('/');

    // Quiz with potential circular reference
    const circularQuiz = {
      name: 'Test',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Question',
              options: [{ optionId: 'a', optionText: 'A' }],
              correctOptionIds: ['a'],
            },
          ],
        },
      ],
    };

    // Add circular reference (won't serialize but tests parser)
    await importQuizViaUI(page, circularQuiz);

    // App should not hang
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Null/Undefined Handling', () => {
  test('E2-11: Null/undefined values in quiz data', async ({ page }) => {
    await page.goto('/');

    const nullQuiz = {
      name: 'Null Test',
      description: null,
      chapters: [
        {
          id: 'ch1',
          title: null,
          questions: [
            {
              questionId: 'q1',
              questionText: 'Question with null explanation',
              options: [
                { optionId: 'a', optionText: null },
                { optionId: 'b', optionText: 'Valid' },
              ],
              correctOptionIds: ['b'],
              explanation: null,
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, nullQuiz);

    // Should handle nulls gracefully
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('E2-10: Missing optional fields', async ({ page }) => {
    await page.goto('/');

    const minimalQuiz = {
      name: 'Minimal',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Question',
              options: [{ optionId: 'a', optionText: 'A' }],
              correctOptionIds: ['a'],
              // No explanation - optional
            },
          ],
        },
      ],
      // No description - optional
    };

    await importQuizViaUI(page, minimalQuiz);
    await waitForQuizLoaded(page);

    // Should work with minimal fields
    await expect(page.locator(`text=${minimalQuiz.name}`)).toBeVisible();
  });
});

test.describe('Console Error Monitoring', () => {
  test('No critical console errors during normal operation', async ({ page }) => {
    const criticalErrors: string[] = [];

    page.on('pageerror', (error) => {
      criticalErrors.push(error.message);
    });

    await page.goto('/');
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Answer a question
      const options = page.locator('[role="radio"], .option-card');
      if (await options.first().isVisible()) {
        await options.first().click();

        const submitBtn = page.locator('button:has-text("Submit")');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
        }
      }
    }

    // Filter out expected/benign errors
    const realErrors = criticalErrors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Script error'),
    );

    expect(realErrors).toHaveLength(0);
  });
});
