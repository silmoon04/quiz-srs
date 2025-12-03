/**
 * E2E Test Fixtures - Quiz Data
 * Shared test data for all e2e tests
 */

import { Page } from '@playwright/test';

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

  // Find file input and upload
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'test-quiz.json',
    mimeType: 'application/json',
    buffer,
  });
}

export async function importMarkdownViaUI(page: Page, markdownContent: string) {
  const buffer = Buffer.from(markdownContent);

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'test-quiz.md',
    mimeType: 'text/markdown',
    buffer,
  });
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

export async function answerQuestion(page: Page, optionIndex: number, submit = true) {
  // Wait for options to be visible and interactive
  await page.waitForSelector('[role="radiogroup"]', { state: 'visible', timeout: 10000 });

  // Get all option cards using role="radio" (the wrapper divs in AccessibleOptionList)
  const optionCards = page.locator('[role="radio"]');

  // Wait for options to be ready
  await optionCards.first().waitFor({ state: 'visible', timeout: 5000 });

  // Click the option at the given index - click on the button inside
  const targetOption = optionCards.nth(optionIndex);
  await targetOption.locator('[role="button"]').click();

  // Wait for React state to update
  await page.waitForTimeout(100);

  if (submit) {
    // Wait for Submit button to be enabled and click it
    const submitBtn = page.locator('button:has-text("Submit Answer")');
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
    // Wait for button to be enabled (not disabled)
    await page
      .waitForFunction(
        () => {
          const btn =
            document.querySelector('button:has([class*="Submit"])') ||
            Array.from(document.querySelectorAll('button')).find((b) =>
              b.textContent?.includes('Submit'),
            );
          return btn && !btn.hasAttribute('disabled');
        },
        { timeout: 5000 },
      )
      .catch(() => {}); // Ignore timeout, try clicking anyway
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
  const startBtn = page.locator('button:has-text("Start"), button:has-text("Begin")');
  await startBtn.click();
}

export async function goToDashboard(page: Page) {
  const dashboardLink = page.locator('a:has-text("Dashboard"), button:has-text("Dashboard")');
  await dashboardLink.click();
}
