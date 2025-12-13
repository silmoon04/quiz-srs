/**
 * Playwright Global Setup
 *
 * Pre-loads quiz data to avoid redundant imports in each test.
 * This runs once before all tests, saving ~3 seconds per test.
 */

import { chromium, FullConfig } from '@playwright/test';
import { validQuizJSON } from './fixtures/quiz-data';

/**
 * State that will be injected into localStorage before tests run.
 * This is the pre-loaded quiz state to skip the import flow.
 */
export const PRE_LOADED_QUIZ_STATE = {
  quizData: validQuizJSON,
  quizName: validQuizJSON.name,
  currentView: 'dashboard' as const,
  sessionState: null,
  userProgress: {
    questionsAttempted: [],
    correctAnswers: [],
    incorrectAnswers: [],
    srsLevels: {},
    lastReviewDates: {},
  },
  version: '1.0.0',
};

/**
 * Storage state file path - shared across all tests
 */
export const STORAGE_STATE_PATH = 'tests/e2e/.auth/storage-state.json';

function resolveBaseURL(config: FullConfig): string {
  const projectBaseURL = config.projects
    ?.map((p) => p.use?.baseURL)
    .find((url): url is string => typeof url === 'string' && url.length > 0);

  const envBaseURL = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL;

  const resolved = (projectBaseURL || envBaseURL || 'http://localhost:4000') as string;
  return resolved.replace(/\/$/, '');
}

async function globalSetup(_config: FullConfig) {
  console.log('🚀 Global setup: Pre-loading quiz data...');

  const baseURL = resolveBaseURL(_config);

  // Launch browser to set up localStorage state
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

    // Pre-load Zustand persisted store state into localStorage
    // Key must match `persist({ name: 'quiz-store' })` in store/quiz-store.ts
    await page.evaluate((state) => {
      const persisted = {
        state: {
          currentModule: state.quizData,
          answerRecords: {},
          appState: state.currentView,
          currentChapterId: '',
          currentQuestionIndex: 0,
          sessionHistory: [],
        },
        version: 1,
      };
      localStorage.setItem('quiz-store', JSON.stringify(persisted));
    }, PRE_LOADED_QUIZ_STATE);

    // Save the storage state for reuse
    await context.storageState({ path: STORAGE_STATE_PATH });

    console.log('✅ Global setup complete: Quiz data pre-loaded');
  } catch (error) {
    console.warn('⚠️ Global setup warning:', error);
    // Don't fail - tests can still work without pre-loaded state
  } finally {
    await browser.close();
  }
}

export default globalSetup;
