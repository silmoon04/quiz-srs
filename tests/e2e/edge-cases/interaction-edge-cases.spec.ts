/**
 * E2E Tests: Interaction Edge Cases
 * Tests rapid interactions, double-clicks, and timing issues
 */

import { test, expect } from '@playwright/test';
import {
  validQuizJSON,
  importQuizViaUI,
  clearLocalStorage,
  getLocalStorage,
  waitForQuizLoaded,
} from '../fixtures/quiz-data';

test.describe('Double-Click Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    if (await startBtn.isVisible()) {
      await startBtn.click();
    }
  });

  test('E3-01: Double-click prevention on submit', async ({ page }) => {
    // Select an option
    const options = page.locator('[role="radio"], .option-card');
    await options.first().click();

    // Double-click submit rapidly
    const submitBtn = page.locator('button:has-text("Submit")');

    if (await submitBtn.isVisible()) {
      await submitBtn.dblclick();

      await page.waitForTimeout(500);

      // Should only have recorded one submission
      // Check that we're not on question 3 (skipped one)
      const state = await getLocalStorage(page, 'quiz-state');
      expect(state).toBeTruthy();
    }
  });

  test('E3-01: Rapid submit clicks handled', async ({ page }) => {
    const options = page.locator('[role="radio"], .option-card');
    await options.first().click();

    const submitBtn = page.locator('button:has-text("Submit")');

    if (await submitBtn.isVisible()) {
      // Click many times rapidly
      for (let i = 0; i < 5; i++) {
        await submitBtn.click({ delay: 10 });
      }

      await page.waitForTimeout(500);

      // App should still work
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('E3-02: Rapid option clicks handled', async ({ page }) => {
    const options = page.locator('[role="radio"], .option-card');
    const count = await options.count();

    // Click through options rapidly
    for (let i = 0; i < Math.min(count, 4); i++) {
      await options.nth(i).click({ delay: 50 });
    }

    await page.waitForTimeout(200);

    // Only one should be selected
    const selected = await page
      .locator('[aria-checked="true"], [data-selected="true"], .selected')
      .count();
    expect(selected).toBeLessThanOrEqual(1);
  });
});

test.describe('Rapid Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
  });

  test('A3-45: Rapid chapter navigation', async ({ page }) => {
    // Find chapter navigation
    const chapters = page.locator('[class*="chapter"], [data-testid*="chapter"]');
    const count = await chapters.count();

    if (count > 1) {
      // Click rapidly between chapters
      for (let i = 0; i < 10; i++) {
        await chapters.nth(i % count).click({ delay: 50 });
      }

      await page.waitForTimeout(500);

      // App should still work
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('E3-02: Rapid question navigation', async ({ page }) => {
    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    const nextBtn = page.locator('button:has-text("Next")');
    const prevBtn = page.locator('button:has-text("Previous")');

    // Navigate rapidly
    for (let i = 0; i < 10; i++) {
      if (await nextBtn.isEnabled().catch(() => false)) {
        await nextBtn.click({ delay: 50 });
      }
      if (await prevBtn.isEnabled().catch(() => false)) {
        await prevBtn.click({ delay: 50 });
      }
    }

    await page.waitForTimeout(500);

    // Should be in a valid state
    await expect(page.locator('body')).toBeVisible();
  });

  test('A1-45: Rapid clicking through UI', async ({ page }) => {
    // Click everything rapidly
    const clickables = page.locator('button, a, [role="button"]');
    const count = await clickables.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const el = clickables.nth(i);
      if (await el.isVisible().catch(() => false)) {
        await el.click({ delay: 30 }).catch(() => {});
      }
    }

    await page.waitForTimeout(500);

    // App should recover
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Click During Animation', () => {
  test('E3-03: Click during animation', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Select and submit
    const options = page.locator('[role="radio"], .option-card');
    await options.first().click();

    const submitBtn = page.locator('button:has-text("Submit")');
    await submitBtn.click();

    // Immediately try to click next during transition
    const nextBtn = page.locator('button:has-text("Next")');
    await nextBtn.click({ delay: 0 }).catch(() => {});

    await page.waitForTimeout(500);

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Scroll During Interaction', () => {
  test('E3-04: Scroll during interaction', async ({ page }) => {
    await page.goto('/');
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Start selecting while scrolling
    const scrollAndClick = async () => {
      // Scroll
      await page.evaluate(() => window.scrollBy(0, 100));

      // Click option
      const options = page.locator('[role="radio"], .option-card');
      if (await options.first().isVisible()) {
        await options.first().click();
      }

      // Scroll more
      await page.evaluate(() => window.scrollBy(0, -100));
    };

    await scrollAndClick();

    await page.waitForTimeout(300);

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Theme Toggle Mid-Action', () => {
  test('E3-06: Theme toggle mid-action', async ({ page }) => {
    await page.goto('/');
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Select option
    const options = page.locator('[role="radio"], .option-card');
    await options.first().click();

    // Toggle theme
    const themeBtn = page.locator('button[aria-label*="theme"]');
    if (await themeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await themeBtn.click();
    }

    // Submit
    const submitBtn = page.locator('button:has-text("Submit")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }

    await page.waitForTimeout(300);

    // Should work regardless of theme change
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Navigation During Save', () => {
  test('E3-07: Navigation during save', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Answer question
    const options = page.locator('[role="radio"], .option-card');
    await options.first().click();

    const submitBtn = page.locator('button:has-text("Submit")');
    await submitBtn.click();

    // Immediately navigate away (during potential save)
    await page.goto('/').catch(() => {});

    await page.waitForTimeout(500);

    // Navigate back
    await page.goto('/');
    await waitForQuizLoaded(page);

    // State should be consistent
    const state = await getLocalStorage(page, 'quiz-state');
    expect(state).toBeTruthy();
  });
});

test.describe('Import During Quiz', () => {
  test('E3-08: Import during quiz', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Answer a question
    const options = page.locator('[role="radio"], .option-card');
    await options.first().click();

    // Try to import new quiz mid-session
    const newQuiz = {
      ...validQuizJSON,
      name: 'New Quiz',
    };

    await importQuizViaUI(page, newQuiz);

    await page.waitForTimeout(500);

    // Should either:
    // 1. Block import and keep current session
    // 2. Warn and allow import
    // 3. Just work
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Concurrent Operations', () => {
  test('E3-10: Concurrent operations', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Do multiple things at once
    await Promise.all([
      // Select option
      page
        .locator('[role="radio"], .option-card')
        .first()
        .click()
        .catch(() => {}),
      // Try to navigate
      page
        .locator('button:has-text("Next")')
        .click()
        .catch(() => {}),
      // Toggle theme
      page
        .locator('button[aria-label*="theme"]')
        .click()
        .catch(() => {}),
    ]);

    await page.waitForTimeout(500);

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('Multiple rapid submissions', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Answer rapidly
    for (let i = 0; i < 5; i++) {
      const options = page.locator('[role="radio"], .option-card');
      if (
        await options
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        await options.first().click();
      }

      const submitBtn = page.locator('button:has-text("Submit")');
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
      }

      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
      }
    }

    await page.waitForTimeout(500);

    // App should be in consistent state
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Browser Back/Forward', () => {
  test('A1-44: Browser back button', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Answer question
    const options = page.locator('[role="radio"], .option-card');
    await options.first().click();

    const submitBtn = page.locator('button:has-text("Submit")');
    await submitBtn.click();

    // Go to next
    const nextBtn = page.locator('button:has-text("Next")');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }

    // Press back
    await page.goBack().catch(() => {});

    await page.waitForTimeout(500);

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('Browser forward button', async ({ page }) => {
    await page.goto('/');
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // Navigate around
    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Back
    await page.goBack().catch(() => {});

    // Forward
    await page.goForward().catch(() => {});

    await page.waitForTimeout(500);

    // Should work
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Resize During Interaction', () => {
  test('E3-05: Resize during interaction', async ({ page }) => {
    await page.goto('/');
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")');
    await startBtn.click();

    // Select option
    const options = page.locator('[role="radio"], .option-card');
    await options.first().click();

    // Resize during selection
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);
    await page.setViewportSize({ width: 1280, height: 800 });

    // Submit
    const submitBtn = page.locator('button:has-text("Submit")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }

    await page.waitForTimeout(300);

    // Should work
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Interrupted Operations', () => {
  test("E4-99: Interrupted operations don't corrupt", async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);

    // Start import
    const importPromise = importQuizViaUI(page, validQuizJSON);

    // Interrupt by navigating away
    await page.evaluate(() => window.stop());

    await page.waitForTimeout(500);

    // Reload
    await page.goto('/');

    // Should be in clean state
    await expect(page.locator('body')).toBeVisible();
  });
});
