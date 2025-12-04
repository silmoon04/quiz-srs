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

async function globalSetup(_config: FullConfig) {
  console.log('🚀 Global setup: Pre-loading quiz data...');

  // Launch browser to set up localStorage state
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    // Pre-load quiz data into localStorage
    await page.evaluate((state) => {
      localStorage.setItem('quiz-srs-data', JSON.stringify(state.quizData));
      localStorage.setItem('quiz-srs-name', state.quizName);
      localStorage.setItem('quiz-srs-view', state.currentView);
      localStorage.setItem('quiz-srs-progress', JSON.stringify(state.userProgress));
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
