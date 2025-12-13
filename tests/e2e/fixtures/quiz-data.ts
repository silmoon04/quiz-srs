/**
 * E2E Test Fixtures - Quiz Data
 * Shared test data for all e2e tests
 */

import { Page, expect } from '@playwright/test';

// ============================================
// VALID QUIZ DATA
// ============================================

export const validQuizJSON = {
  name: 'Test Quiz',
  description: 'A quiz for e2e testing',
  chapters: [
    {
      id: 'ch1',
      name: 'Chapter 1: Basics',
      questions: [
        {
          questionId: 'q1',
          questionText: 'What is 2 + 2?',
          options: [
            { optionId: 'q1-a', optionText: '3' },
            { optionId: 'q1-b', optionText: '4' },
            { optionId: 'q1-c', optionText: '5' },
            { optionId: 'q1-d', optionText: '6' },
          ],
          correctOptionIds: ['q1-b'],
          explanationText: 'Basic arithmetic: 2 + 2 = 4',
        },
        {
          questionId: 'q2',
          questionText: 'What is the capital of France?',
          options: [
            { optionId: 'q2-a', optionText: 'London' },
            { optionId: 'q2-b', optionText: 'Berlin' },
            { optionId: 'q2-c', optionText: 'Paris' },
            { optionId: 'q2-d', optionText: 'Madrid' },
          ],
          correctOptionIds: ['q2-c'],
          explanationText: 'Paris is the capital of France.',
        },
        {
          questionId: 'q3',
          questionText: 'Is the sky blue?',
          options: [
            { optionId: 'q3-a', optionText: 'True' },
            { optionId: 'q3-b', optionText: 'False' },
          ],
          correctOptionIds: ['q3-a'],
          explanationText: 'The sky appears blue due to Rayleigh scattering.',
        },
      ],
    },
    {
      id: 'ch2',
      name: 'Chapter 2: Advanced',
      questions: [
        {
          questionId: 'q4',
          questionText: 'What is the square root of 144?',
          options: [
            { optionId: 'q4-a', optionText: '10' },
            { optionId: 'q4-b', optionText: '11' },
            { optionId: 'q4-c', optionText: '12' },
            { optionId: 'q4-d', optionText: '13' },
          ],
          correctOptionIds: ['q4-c'],
          explanationText: '12 × 12 = 144',
        },
        {
          questionId: 'q5',
          questionText: 'Which planet is closest to the Sun?',
          options: [
            { optionId: 'q5-a', optionText: 'Venus' },
            { optionId: 'q5-b', optionText: 'Mercury' },
            { optionId: 'q5-c', optionText: 'Mars' },
            { optionId: 'q5-d', optionText: 'Earth' },
          ],
          correctOptionIds: ['q5-b'],
          explanationText: 'Mercury is the closest planet to the Sun.',
        },
      ],
    },
  ],
};

export const validQuizMarkdown = `# Test Quiz

A quiz for e2e testing.

## Chapter 1: Basics

### Question 1
What is 2 + 2?

- [ ] 3
- [x] 4
- [ ] 5
- [ ] 6

> Basic arithmetic: 2 + 2 = 4

### Question 2
What is the capital of France?

- [ ] London
- [ ] Berlin
- [x] Paris
- [ ] Madrid

> Paris is the capital of France.

## Chapter 2: Advanced

### Question 3
What is the square root of 144?

- [ ] 10
- [ ] 11
- [x] 12
- [ ] 13

> 12 × 12 = 144
`;

// ============================================
// UNICODE & SPECIAL CONTENT
// ============================================

export const unicodeQuiz = {
  name: 'Unicode Quiz 🎯',
  description: '日本語、中文、العربية content',
  chapters: [
    {
      id: 'ch-unicode',
      title: 'Unicode Chapter 日本語',
      questions: [
        {
          questionId: 'q-emoji',
          questionText: 'What does 🎉 represent?',
          options: [
            { optionId: 'opt-1', optionText: 'Party 🥳' },
            { optionId: 'opt-2', optionText: 'Sad 😢' },
          ],
          correctOptionIds: ['opt-1'],
          explanation: '🎉 = celebration!',
        },
        {
          questionId: 'q-cjk',
          questionText: '漢字の読み方は？',
          options: [
            { optionId: 'cjk-1', optionText: 'かんじ' },
            { optionId: 'cjk-2', optionText: 'ひらがな' },
          ],
          correctOptionIds: ['cjk-1'],
          explanation: '漢字 is read as かんじ (kanji)',
        },
      ],
    },
  ],
};

// ============================================
// LATEX & CODE CONTENT
// ============================================

export const mathQuiz = {
  name: 'Math Quiz',
  description: 'Quiz with LaTeX equations',
  chapters: [
    {
      id: 'ch-math',
      title: 'Mathematics',
      questions: [
        {
          questionId: 'q-latex-inline',
          questionText: 'What is the value of $x$ when $x^2 = 16$?',
          options: [
            { optionId: 'math-1', optionText: '$x = 2$' },
            { optionId: 'math-2', optionText: '$x = 4$' },
            { optionId: 'math-3', optionText: '$x = 8$' },
          ],
          correctOptionIds: ['math-2'],
          explanation: '$\\sqrt{16} = 4$',
        },
        {
          questionId: 'q-latex-block',
          questionText: 'Evaluate: $$\\int_0^1 x^2 dx$$',
          options: [
            { optionId: 'int-1', optionText: '$$\\frac{1}{3}$$' },
            { optionId: 'int-2', optionText: '$$\\frac{1}{2}$$' },
          ],
          correctOptionIds: ['int-1'],
          explanation: '$$\\int_0^1 x^2 dx = \\left[\\frac{x^3}{3}\\right]_0^1 = \\frac{1}{3}$$',
        },
      ],
    },
  ],
};

export const codeQuiz = {
  name: 'Programming Quiz',
  description: 'Quiz with code blocks',
  chapters: [
    {
      id: 'ch-code',
      title: 'JavaScript',
      questions: [
        {
          questionId: 'q-code-1',
          questionText:
            'What does this code output?\n\n```javascript\nconsole.log(typeof null);\n```',
          options: [
            { optionId: 'code-1', optionText: '`"null"`' },
            { optionId: 'code-2', optionText: '`"object"`' },
            { optionId: 'code-3', optionText: '`"undefined"`' },
          ],
          correctOptionIds: ['code-2'],
          explanation: '`typeof null` returns `"object"` due to a historical bug in JavaScript.',
        },
      ],
    },
  ],
};

// ============================================
// LARGE QUIZ FOR PERFORMANCE TESTS
// ============================================

export function generateLargeQuiz(questionCount: number) {
  const questions = [];
  for (let i = 1; i <= questionCount; i++) {
    questions.push({
      questionId: `q${i}`,
      questionText: `Question ${i}: What is ${i} + ${i}?`,
      options: [
        { optionId: `q${i}-a`, optionText: `${i * 2 - 1}` },
        { optionId: `q${i}-b`, optionText: `${i * 2}` },
        { optionId: `q${i}-c`, optionText: `${i * 2 + 1}` },
      ],
      correctOptionIds: [`q${i}-b`],
      explanation: `${i} + ${i} = ${i * 2}`,
    });
  }

  return {
    name: `Large Quiz (${questionCount} questions)`,
    description: 'Performance testing quiz',
    chapters: [
      {
        id: 'ch-large',
        title: 'All Questions',
        questions,
      },
    ],
  };
}

// ============================================
// EDGE CASE QUIZZES
// ============================================

export const emptyChaptersQuiz = {
  name: 'Empty Chapters Quiz',
  description: 'Quiz with no questions',
  chapters: [],
};

export const singleQuestionQuiz = {
  name: 'Single Question Quiz',
  description: 'Minimal quiz',
  chapters: [
    {
      id: 'ch1',
      title: 'Only Chapter',
      questions: [
        {
          questionId: 'only-q',
          questionText: 'The only question',
          options: [
            { optionId: 'only-a', optionText: 'Yes' },
            { optionId: 'only-b', optionText: 'No' },
          ],
          correctOptionIds: ['only-a'],
          explanation: 'Yes is correct.',
        },
      ],
    },
  ],
};

export const allCorrectQuiz = {
  name: 'All Correct Quiz',
  description: 'All options are correct',
  chapters: [
    {
      id: 'ch1',
      title: 'All Correct',
      questions: [
        {
          questionId: 'q-all',
          questionText: 'Which are primary colors?',
          options: [
            { optionId: 'color-r', optionText: 'Red' },
            { optionId: 'color-b', optionText: 'Blue' },
            { optionId: 'color-y', optionText: 'Yellow' },
          ],
          correctOptionIds: ['color-r', 'color-b', 'color-y'],
          explanation: 'All primary colors are correct!',
        },
      ],
    },
  ],
};

export const manyOptionsQuiz = {
  name: 'Many Options Quiz',
  description: 'Question with many options',
  chapters: [
    {
      id: 'ch1',
      title: 'Many Options',
      questions: [
        {
          questionId: 'q-many',
          questionText: 'Select a number from 1-20:',
          options: Array.from({ length: 20 }, (_, i) => ({
            optionId: `opt-${i + 1}`,
            optionText: `${i + 1}`,
          })),
          correctOptionIds: ['opt-7'],
          explanation: '7 is the lucky number.',
        },
      ],
    },
  ],
};

export const longContentQuiz = {
  name: 'Long Content Quiz',
  description: 'Quiz with very long text',
  chapters: [
    {
      id: 'ch1',
      title: 'Long Content',
      questions: [
        {
          questionId: 'q-long',
          questionText: `This is a very long question that contains a lot of text. `.repeat(50),
          options: [
            { optionId: 'long-a', optionText: 'A '.repeat(100) },
            { optionId: 'long-b', optionText: 'B '.repeat(100) },
          ],
          correctOptionIds: ['long-a'],
          explanation: 'Explanation '.repeat(100),
        },
      ],
    },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export async function importQuizViaUI(page: Page, quizData: object) {
  // Create a file and upload it
  const jsonString = JSON.stringify(quizData, null, 2);
  const buffer = Buffer.from(jsonString);

  const dashboardSelector = '[data-testid="dashboard"], .dashboard';
  const dashboard = page.locator(dashboardSelector);
  const fileInput = page.getByTestId('file-input');

  // Ensure we're on the welcome screen (file input present)
  if (!(await fileInput.isVisible().catch(() => false))) {
    if (await dashboard.isVisible().catch(() => false)) {
      const loadNewModule = page.getByRole('button', { name: /load new module/i });
      if (await loadNewModule.isVisible().catch(() => false)) {
        await loadNewModule.click();
      }
    }
  }

  if (!(await fileInput.isVisible().catch(() => false))) {
    // Fallback: hard reset to reach welcome screen
    try {
      const url = page.url();
      if (!url || url === 'about:blank') {
        await page.goto('/');
      }
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    } catch {
      // If storage is inaccessible (e.g., not on a proper origin yet), just navigate.
      await page.goto('/');
    }
  }

  await fileInput.waitFor({ state: 'attached', timeout: 10000 });
  await fileInput.setInputFiles({
    name: 'test-quiz.json',
    mimeType: 'application/json',
    buffer,
  });

  // Wait for either success (dashboard) or error banner.
  const successPromise = page
    .waitForSelector(dashboardSelector, { timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  const errorPromise = page
    .waitForSelector('text=Error Loading Quiz Module', { timeout: 10000 })
    .then(() => false)
    .catch(() => false);

  await Promise.race([successPromise, errorPromise]);
}

export async function importMarkdownViaUI(page: Page, markdownContent: string) {
  const buffer = Buffer.from(markdownContent);

  const dashboardSelector = '[data-testid="dashboard"], .dashboard';
  const dashboard = page.locator(dashboardSelector);
  const fileInput = page.getByTestId('file-input');

  if (!(await fileInput.isVisible().catch(() => false))) {
    if (await dashboard.isVisible().catch(() => false)) {
      const loadNewModule = page.getByRole('button', { name: /load new module/i });
      if (await loadNewModule.isVisible().catch(() => false)) {
        await loadNewModule.click();
      }
    }
  }

  if (!(await fileInput.isVisible().catch(() => false))) {
    try {
      const url = page.url();
      if (!url || url === 'about:blank') {
        await page.goto('/');
      }
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    } catch {
      await page.goto('/');
    }
  }

  await fileInput.waitFor({ state: 'attached', timeout: 10000 });
  await fileInput.setInputFiles({
    name: 'test-quiz.md',
    mimeType: 'text/markdown',
    buffer,
  });

  const successPromise = page
    .waitForSelector(dashboardSelector, { timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  const errorPromise = page
    .waitForSelector('text=Error Loading Quiz Module', { timeout: 10000 })
    .then(() => false)
    .catch(() => false);

  await Promise.race([successPromise, errorPromise]);
}

export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

export async function setLocalStorage(page: Page, key: string, value: any) {
  await page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [key, value]);
}

export async function getLocalStorage(page: Page, key: string) {
  return await page.evaluate((k) => {
    const item = localStorage.getItem(k);
    return item ? JSON.parse(item) : null;
  }, key);
}

export async function waitForQuizLoaded(page: Page) {
  // Wait for quiz content to be visible
  await page.waitForSelector('[data-testid="quiz-content"], .quiz-session, .dashboard', {
    timeout: 10000,
  });
}

export async function startFirstChapterFromDashboard(page: Page) {
  const dashboard = page.locator('[data-testid="dashboard"], .dashboard');
  if (!(await dashboard.isVisible().catch(() => false))) return;

  const startChapter = page.locator('[data-testid="start-chapter-button"]').first();
  if (await startChapter.isVisible().catch(() => false)) {
    await startChapter.click();
  }

  await page.waitForSelector('[data-testid="quiz-session"], .quiz-session', { timeout: 10000 });
}

export async function answerQuestion(page: Page, optionIndex: number, submit = true) {
  // If we're on dashboard, start a chapter first
  await startFirstChapterFromDashboard(page);

  // Wait for options to be visible and interactive
  await page.waitForSelector('[role="radiogroup"]', { state: 'visible', timeout: 10000 });
  // Get all option cards using role="radio" (the wrapper divs in AccessibleOptionList)
  const optionCards = page.locator('[role="radio"]');

  const quizSession = page.locator('.quiz-session, [data-testid="quiz-session"]');
  if (await quizSession.isVisible().catch(() => false)) {
    // If we're already past the submit step (e.g., viewing feedback or completion), don't block.
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Next Question")');
    const completion = page.locator(
      '[data-testid="quiz-complete"], text=/quiz complete|completed|results|summary/i',
    );
    if (await completion.isVisible().catch(() => false)) {
      return;
    }
    if (await nextBtn.isVisible().catch(() => false)) {
      return;
    }
  }

  // Wait for options to be ready
  await optionCards.first().waitFor({ state: 'visible', timeout: 5000 });

  // Options are intentionally shuffled in the UI.
  // Many tests historically used (0 = incorrect, 1 = correct), so support that deterministically.
  let targetOption = optionCards.nth(optionIndex);
  if (optionIndex === 1) {
    const correct = page.locator('[role="radio"][data-correct="true"]').first();
    if (await correct.isVisible().catch(() => false)) {
      targetOption = correct;
    }
  } else if (optionIndex === 0) {
    const incorrect = page.locator('[role="radio"][data-correct="false"]').first();
    if (await incorrect.isVisible().catch(() => false)) {
      targetOption = incorrect;
    }
  }

  // Click the option wrapper (it owns aria-checked)
  await targetOption.click();

  // Wait for React state to update (selected option reflected in aria-checked)
  await expect(targetOption).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });

  if (submit) {
    const submitBtn = page.locator('button:has-text("Submit Answer")');
    const submitVisible = await submitBtn.isVisible().catch(() => false);
    if (!submitVisible) {
      // Some flows swap Submit for Next/Complete quickly; don't hard-fail.
      return;
    }

    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
  }
}

export async function navigateToNextQuestion(page: Page) {
  const nextBtn = page.locator('button:has-text("Next"), button[aria-label*="next"]');
  await nextBtn.click();
}

export async function navigateToPreviousQuestion(page: Page) {
  const prevBtn = page.locator('button:has-text("Previous"), button[aria-label*="previous"]');
  await prevBtn.click();
}

export async function startQuizSession(page: Page) {
  // Current flow: dashboard chapter cards have a Start Quiz button
  await startFirstChapterFromDashboard(page);
}

export async function goToDashboard(page: Page) {
  const dashboardBtn = page.getByTestId('back-dashboard-btn');
  if (await dashboardBtn.isVisible().catch(() => false)) {
    await dashboardBtn.click();
    await page.waitForSelector('[data-testid="dashboard"], .dashboard', { timeout: 10000 });
    return;
  }

  const fallback = page.locator('a:has-text("Dashboard"), button:has-text("Dashboard")').first();
  await fallback.click();
  await page.waitForSelector('[data-testid="dashboard"], .dashboard', { timeout: 10000 });
}
