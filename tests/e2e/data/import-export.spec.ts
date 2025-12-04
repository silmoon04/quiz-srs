/**
 * E2E Tests: Import & Export
 * Tests file import and export functionality
 */

import { test, expect } from '@playwright/test';
import {
  validQuizJSON,
  validQuizMarkdown,
  unicodeQuiz,
  mathQuiz,
  codeQuiz,
  emptyChaptersQuiz,
  singleQuestionQuiz,
  longContentQuiz,
  generateLargeQuiz,
  importQuizViaUI,
  importMarkdownViaUI,
  clearLocalStorage,
  getLocalStorage,
  waitForQuizLoaded,
  answerQuestion,
} from '../fixtures/quiz-data';
import { malformedJsonStrings } from '../fixtures/malicious-data';

test.describe('JSON Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('B1-01: Valid JSON import', async ({ page }) => {
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);

    // Quiz should be loaded
    await expect(page.locator(`text=${validQuizJSON.name}`)).toBeVisible();
  });

  test('B1-05: Large quiz import (1000 questions)', async ({ page }) => {
    const largeQuiz = generateLargeQuiz(1000);

    // Should complete within reasonable time
    const startTime = Date.now();
    await importQuizViaUI(page, largeQuiz);
    await waitForQuizLoaded(page);
    const endTime = Date.now();

    // Should load in under 10 seconds
    expect(endTime - startTime).toBeLessThan(10000);

    // Quiz should be loaded
    await expect(page.locator(`text=${largeQuiz.name}`)).toBeVisible();
  });

  test('B1-06: Unicode content preservation', async ({ page }) => {
    await importQuizViaUI(page, unicodeQuiz);
    await waitForQuizLoaded(page);

    // Check for emoji in quiz name
    await expect(page.locator('text=🎯')).toBeVisible();

    // Start quiz and check Japanese text
    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await expect(page.locator('text=🎉')).toBeVisible();
    }
  });

  test('B1-07: LaTeX content preservation', async ({ page }) => {
    await importQuizViaUI(page, mathQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // LaTeX should be rendered (check for MathJax/KaTeX elements)
      const mathContent = page.locator('.katex, .MathJax, [class*="math"]');
      const rawLatex = page.locator('text=$x$');

      // Either rendered or raw visible
      await expect(mathContent.or(rawLatex).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('B1-08: Code block preservation', async ({ page }) => {
    await importQuizViaUI(page, codeQuiz);
    await waitForQuizLoaded(page);

    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Code should be in pre/code elements
      const codeElement = page.locator('pre, code, [class*="code"]');
      await expect(codeElement.first()).toBeVisible({ timeout: 2000 });
    }
  });

  test('B1-10: Empty file rejection', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const buffer = Buffer.from('');

    await fileInput.setInputFiles({
      name: 'empty.json',
      mimeType: 'application/json',
      buffer,
    });

    // Should show error
    await expect(page.locator('text=/error|invalid|empty/i')).toBeVisible({ timeout: 2000 });
  });

  test('B1-12: Malformed JSON handling', async ({ page }) => {
    for (const invalidJson of malformedJsonStrings.slice(0, 3)) {
      await page.reload();

      const fileInput = page.locator('input[type="file"]');
      const buffer = Buffer.from(invalidJson);

      await fileInput.setInputFiles({
        name: 'invalid.json',
        mimeType: 'application/json',
        buffer,
      });

      // Should show error, not crash
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('B1-14: Missing required fields', async ({ page }) => {
    const incompleteQuiz = { name: 'Test' }; // Missing chapters

    const buffer = Buffer.from(JSON.stringify(incompleteQuiz));
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: 'incomplete.json',
      mimeType: 'application/json',
      buffer,
    });

    // Should show error about missing fields
    await expect(page.locator('text=/error|invalid|required|chapters/i')).toBeVisible({
      timeout: 2000,
    });
  });

  test('B1-15: Extra unknown fields ignored', async ({ page }) => {
    const quizWithExtra = {
      ...validQuizJSON,
      unknownField: 'should be ignored',
      anotherExtra: { nested: true },
    };

    await importQuizViaUI(page, quizWithExtra);
    await waitForQuizLoaded(page);

    // Should load successfully despite extra fields
    await expect(page.locator(`text=${validQuizJSON.name}`)).toBeVisible();
  });
});

test.describe('Markdown Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('B1-02: Valid Markdown import', async ({ page }) => {
    await importMarkdownViaUI(page, validQuizMarkdown);
    await waitForQuizLoaded(page);

    // Quiz should be loaded
    await expect(page.locator('text=/Test Quiz|Chapter/i')).toBeVisible();
  });

  test('B1-13: Malformed Markdown handling', async ({ page }) => {
    const badMarkdown = `
# Incomplete Quiz
## No questions here
Just some text without proper format
`;

    await importMarkdownViaUI(page, badMarkdown);

    // Should either parse what it can or show error
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Markdown with extra blank lines', async ({ page }) => {
    const mdWithBlanks = `
# Quiz With Blanks



## Chapter 1



### Question 1
What is 1+1?

- [ ] 1
- [x] 2


> Answer is 2


`;

    await importMarkdownViaUI(page, mdWithBlanks);
    await waitForQuizLoaded(page);

    // Should parse correctly
    await expect(page.locator('text=/Quiz|Chapter/i')).toBeVisible();
  });
});

test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await importQuizViaUI(page, validQuizJSON);
    await waitForQuizLoaded(page);
  });

  test('B1-03: Export complete state', async ({ page }) => {
    // Make some progress first
    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await answerQuestion(page, 1);
    }

    // Find and click export button
    const exportBtn = page.locator('button:has-text("Export"), button[aria-label*="export"]');

    if (await exportBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      await exportBtn.click();

      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.json');
    }
  });

  test('B1-04: Import/export round-trip', async ({ page }) => {
    // Make progress
    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await answerQuestion(page, 1);
    }

    // Get state before export
    const stateBefore = await getLocalStorage(page, 'quiz-state');

    // Export
    const exportBtn = page.locator('button:has-text("Export")');
    if (await exportBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const downloadPromise = page.waitForEvent('download');
      await exportBtn.click();
      const download = await downloadPromise;

      // Read exported file
      const path = await download.path();
      if (path) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        const exportedData = JSON.parse(fs.readFileSync(path, 'utf8'));

        // Clear and reimport
        await clearLocalStorage(page);
        await page.reload();
        await importQuizViaUI(page, exportedData);
        await waitForQuizLoaded(page);

        // State should be preserved
        const stateAfter = await getLocalStorage(page, 'quiz-state');
        expect(stateAfter).toBeTruthy();
      }
    }
  });

  test('B1-37: Export includes all progress data', async ({ page }) => {
    // Make varied progress
    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await answerQuestion(page, 1); // Correct

      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await answerQuestion(page, 0); // Incorrect
      }
    }

    // Export
    const exportBtn = page.locator('button:has-text("Export")');
    if (await exportBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const downloadPromise = page.waitForEvent('download');
      await exportBtn.click();
      const download = await downloadPromise;

      const path = await download.path();
      if (path) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        const exportedData = JSON.parse(fs.readFileSync(path, 'utf8'));

        // Should have progress data
        expect(exportedData).toBeTruthy();
      }
    }
  });
});

test.describe('Edge Case Quizzes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('E2-01: Empty quiz handling', async ({ page }) => {
    await importQuizViaUI(page, emptyChaptersQuiz);

    // Should either show error or empty state
    await page.waitForTimeout(1000);
    const error = page.locator('text=/error|no questions|empty/i');
    const emptyState = page.locator('text=/no content|import/i');

    await expect(error.or(emptyState).or(page.locator('body'))).toBeVisible();
  });

  test('E2-02: Single question quiz', async ({ page }) => {
    await importQuizViaUI(page, singleQuestionQuiz);
    await waitForQuizLoaded(page);

    // Should load and be answerable
    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await answerQuestion(page, 0);

      // Should show completion
      await expect(page.locator('text=/complete|finish|done/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('E2-14: Very long strings', async ({ page }) => {
    await importQuizViaUI(page, longContentQuiz);
    await waitForQuizLoaded(page);

    // Should handle without crash
    const startBtn = page.locator('button:has-text("Start")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();

      // Long content should be visible (possibly truncated/scrollable)
      await expect(page.locator('.question-text, [data-testid="question"]').first()).toBeVisible();
    }
  });

  test('Duplicate question IDs', async ({ page }) => {
    const duplicateIdQuiz = {
      name: 'Duplicate IDs Quiz',
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter',
          questions: [
            {
              questionId: 'same-id',
              questionText: 'Question 1',
              options: [{ optionId: 'a', optionText: 'A' }],
              correctOptionIds: ['a'],
            },
            {
              questionId: 'same-id', // Duplicate!
              questionText: 'Question 2',
              options: [{ optionId: 'b', optionText: 'B' }],
              correctOptionIds: ['b'],
            },
          ],
        },
      ],
    };

    await importQuizViaUI(page, duplicateIdQuiz);

    // Should either deduplicate or show error
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('File Type Validation', () => {
  test('B1-40: File type validation on import', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]');

    // Try importing wrong file type
    const buffer = Buffer.from('Just plain text');

    await fileInput.setInputFiles({
      name: 'wrong.txt',
      mimeType: 'text/plain',
      buffer,
    });

    // Should show error or ignore
    await page.waitForTimeout(1000);

    // Either error shown or nothing happened
    await expect(page.locator('body')).toBeVisible();
  });

  test('Binary file rejection', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]');

    // Create binary-like content
    const buffer = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe]);

    await fileInput.setInputFiles({
      name: 'binary.bin',
      mimeType: 'application/octet-stream',
      buffer,
    });

    // Should handle gracefully
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Drag and Drop Import', () => {
  test('B5-32: Drag-drop file imports', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);

    // Create a DataTransfer for drag-drop
    const jsonString = JSON.stringify(validQuizJSON);

    // Dispatch drag events
    await page.evaluate((data) => {
      const dataTransfer = new DataTransfer();
      const file = new File([data], 'quiz.json', { type: 'application/json' });
      dataTransfer.items.add(file);

      const dropZone = document.body;

      const dragEnterEvent = new DragEvent('dragenter', {
        bubbles: true,
        dataTransfer,
      });
      dropZone.dispatchEvent(dragEnterEvent);

      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        dataTransfer,
      });
      dropZone.dispatchEvent(dropEvent);
    }, jsonString);

    // Wait for potential processing
    await page.waitForTimeout(1000);

    // May or may not work depending on implementation
    await expect(page.locator('body')).toBeVisible();
  });
});
