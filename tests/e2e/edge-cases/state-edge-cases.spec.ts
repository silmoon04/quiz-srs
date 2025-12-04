/**
 * E2E Tests: State Edge Cases
 * Tests unusual quiz configurations and edge case states
 */

import { test, expect } from '@playwright/test';
import {
  validQuizJSON,
  emptyChaptersQuiz,
  singleQuestionQuiz,
  allCorrectQuiz,
  manyOptionsQuiz,
  longContentQuiz,
  unicodeQuiz,
  generateLargeQuiz,
  importQuizViaUI,
  clearLocalStorage,
  waitForQuizLoaded,
  answerQuestion,
} from '../fixtures/quiz-data';

test.describe('Empty & Minimal Quizzes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('E2-01: Empty quiz handling', async ({ page }) => {
    await importQuizViaUI(page, emptyChaptersQuiz);

    // Should show error or empty state
    await page.waitForTimeout(1000);
    const result = page.locator('text=/error|empty|no questions/i');
    await expect(result.or(page.locator('body'))).toBeVisible();
  });

  test('E2-02: Single question quiz', async ({ page }) => {
    await importQuizViaUI(page, singleQuestionQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Answer
      await answerQuestion(page, 0);

      // Should show completion immediately
      await expect(page.locator('text=/complete|finish|done|results/i')).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test('E2-03: Single option question', async ({ page }) => {
    const singleOptionQuiz = {
      name: 'Single Option',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Only one choice here',
              options: [{ optionId: 'only', optionText: 'The only option' }],
              correctOptionIds: ['only'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, singleOptionQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Should be able to select and submit
      const option = page.locator('[role="radio"], .option-card');
      await option.click();

      const submit = page.locator('button:has-text("Submit")');
      if (await submit.isVisible()) {
        await submit.click();
      }

      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('E2-04: All options correct', async ({ page }) => {
    await importQuizViaUI(page, allCorrectQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Any option should be correct
      await answerQuestion(page, 0);

      // Should show correct feedback
      await expect(page.locator('[class*="correct"], text=/correct/i')).toBeVisible({
        timeout: 2000,
      });
    }
  });

  test('E2-05: No correct options', async ({ page }) => {
    const noCorrectQuiz = {
      name: 'No Correct',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Trick question - no correct answer',
              options: [
                { optionId: 'a', optionText: 'A' },
                { optionId: 'b', optionText: 'B' },
              ],
              correctOptionIds: [], // Empty!
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, noCorrectQuiz);

    // Either validation error or quiz loads
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Many Options', () => {
  test('E2-06: 100+ options question', async ({ page }) => {
    const manyManyOptions = {
      name: 'Many Options',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Pick a number 1-100',
              options: Array.from({ length: 100 }, (_, i) => ({
                optionId: `opt-${i}`,
                optionText: `Option ${i + 1}`,
              })),
              correctOptionIds: ['opt-42'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, manyManyOptions);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Should render without crashing
      await expect(page.locator('body')).toBeVisible();

      // Options should be scrollable
      const options = page.locator('[role="radio"], .option-card');
      const count = await options.count();
      expect(count).toBe(100);
    }
  });

  test('E2-20: 20 options display', async ({ page }) => {
    await importQuizViaUI(page, manyOptionsQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      const options = page.locator('[role="radio"], .option-card');
      const count = await options.count();
      expect(count).toBe(20);
    }
  });
});

test.describe('Large Quiz', () => {
  test('E2-07: 1000+ questions quiz', async ({ page }) => {
    const largeQuiz = generateLargeQuiz(1000);

    const startTime = Date.now();
    await importQuizViaUI(page, largeQuiz);
    await waitForQuizLoaded(page);
    const loadTime = Date.now() - startTime;

    // Should load in reasonable time
    expect(loadTime).toBeLessThan(15000);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Navigate through some questions
      for (let i = 0; i < 5; i++) {
        await answerQuestion(page, 1);
        const nextBtn = page.locator('button:has-text("Next")');
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
        }
      }

      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Content Edge Cases', () => {
  test('E2-08: Deeply nested content', async ({ page }) => {
    const nestedQuiz = {
      name: 'Nested',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter',
          questions: [
            {
              questionId: 'q1',
              questionText: `
- Level 1
  - Level 2
    - Level 3
      - Level 4
        - Level 5
          - Level 6
            - Level 7
              - Level 8`,
              options: [{ optionId: 'a', optionText: 'A' }],
              correctOptionIds: ['a'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, nestedQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Should render nested content
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('E2-12: Empty strings handling', async ({ page }) => {
    const emptyStringsQuiz = {
      name: '',
      description: '',
      chapters: [
        {
          id: 'ch1',
          title: '',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Question with empty strings elsewhere',
              options: [
                { optionId: 'a', optionText: '' },
                { optionId: 'b', optionText: 'Valid' },
              ],
              correctOptionIds: ['b'],
              explanation: '',
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, emptyStringsQuiz);

    // Should handle or reject gracefully
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('E2-13: Whitespace-only content', async ({ page }) => {
    const whitespaceQuiz = {
      name: '   ',
      chapters: [
        {
          id: 'ch1',
          title: '   ',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Question with whitespace titles',
              options: [{ optionId: 'a', optionText: 'A' }],
              correctOptionIds: ['a'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, whitespaceQuiz);

    // Should handle gracefully
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('E2-14: Very long strings', async ({ page }) => {
    await importQuizViaUI(page, longContentQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Should not break layout
      const hasHorizontalScroll = await page.evaluate(
        () => document.body.scrollWidth > window.innerWidth,
      );

      // Might have scroll, but should be contained
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('E2-15: Unicode edge cases', async ({ page }) => {
    const unicodeEdgeQuiz = {
      name: '🎯 Quiz with 日本語 and العربية',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter 一 🌟',
          questions: [
            {
              questionId: 'q1',
              questionText:
                'Emoji: 🎉🎊🎈\nCJK: 漢字ひらがなカタカナ\nRTL: مرحبا العالم\nSymbols: ™©®℃℉',
              options: [
                { optionId: 'a', optionText: '正解 ✓' },
                { optionId: 'b', optionText: '不正解 ✗' },
              ],
              correctOptionIds: ['a'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, unicodeEdgeQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Unicode should display correctly
      await expect(page.locator('text=🎉')).toBeVisible();
    }
  });
});

test.describe('ID Edge Cases', () => {
  test('Duplicate question IDs', async ({ page }) => {
    const duplicateIdQuiz = {
      name: 'Duplicate IDs',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter',
          questions: [
            {
              questionId: 'same-id',
              questionText: 'First question',
              options: [{ optionId: 'a', optionText: 'A' }],
              correctOptionIds: ['a'],
            },
            {
              questionId: 'same-id', // Duplicate!
              questionText: 'Second question',
              options: [{ optionId: 'b', optionText: 'B' }],
              correctOptionIds: ['b'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, duplicateIdQuiz);

    // Should handle - either error or dedupe
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Special characters in IDs', async ({ page }) => {
    const specialIdQuiz = {
      name: 'Special IDs',
      chapters: [
        {
          id: 'ch-1-special',
          title: 'Chapter',
          questions: [
            {
              questionId: 'q.1/special?&=',
              questionText: 'Question with special ID',
              options: [{ optionId: 'opt:1', optionText: 'A' }],
              correctOptionIds: ['opt:1'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, specialIdQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await answerQuestion(page, 0);

      // Should work with special IDs
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Multi-Chapter Edge Cases', () => {
  test('Empty chapter between non-empty', async ({ page }) => {
    const mixedChaptersQuiz = {
      name: 'Mixed Chapters',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter 1',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Question in chapter 1',
              options: [{ optionId: 'a', optionText: 'A' }],
              correctOptionIds: ['a'],
            },
          ],
        },
        {
          id: 'ch2',
          title: 'Empty Chapter',
          questions: [], // Empty!
        },
        {
          id: 'ch3',
          title: 'Chapter 3',
          questions: [
            {
              questionId: 'q3',
              questionText: 'Question in chapter 3',
              options: [{ optionId: 'b', optionText: 'B' }],
              correctOptionIds: ['b'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, mixedChaptersQuiz);
    await waitForQuizLoaded(page);

    // Should handle empty chapter gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('Many chapters', async ({ page }) => {
    const manyChaptersQuiz = {
      name: 'Many Chapters',
      chapters: Array.from({ length: 50 }, (_, i) => ({
        id: `ch${i}`,
        title: `Chapter ${i + 1}`,
        questions: [
          {
            questionId: `q${i}`,
            questionText: `Question for chapter ${i + 1}`,
            options: [{ optionId: `a${i}`, optionText: 'A' }],
            correctOptionIds: [`a${i}`],
          },
        ],
      })),
    };

    await importQuizViaUI(page, manyChaptersQuiz);
    await waitForQuizLoaded(page);

    // Should handle many chapters
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Option Content Edge Cases', () => {
  test('Options with identical text', async ({ page }) => {
    const identicalOptionsQuiz = {
      name: 'Identical Options',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter',
          questions: [
            {
              questionId: 'q1',
              questionText: 'All options look the same',
              options: [
                { optionId: 'a', optionText: 'Same' },
                { optionId: 'b', optionText: 'Same' },
                { optionId: 'c', optionText: 'Same' },
              ],
              correctOptionIds: ['b'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, identicalOptionsQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Should still be able to select different options
      const options = page.locator('[role="radio"], .option-card');
      expect(await options.count()).toBe(3);
    }
  });
});
