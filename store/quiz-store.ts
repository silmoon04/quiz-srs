/**
 * Quiz Store - Zustand State Management
 *
 * Centralized state management for the quiz application.
 * Organized into logical slices for maintainability.
 *
 * @module store/quiz-store
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  QuizModule,
  QuizChapter,
  QuizQuestion,
  SessionHistoryEntry,
  DisplayedOption,
} from '@/types/quiz-types';
import { calculateNextReview } from '@/lib/engine/srs';

// ============================================
// TYPES
// ============================================

/** Application view states */
export type AppState = 'welcome' | 'dashboard' | 'quiz' | 'complete' | 'all-questions';

/** Answer record for tracking submissions */
export interface AnswerRecord {
  selectedOptionId: string | null;
  isCorrect: boolean;
  displayedOptionIds: string[];
  timestamp: string;
}

/** Reference to a question in review */
export interface NextReviewQuestion {
  chapterId: string;
  question: QuizQuestion;
}

/** Complete store state interface */
export interface QuizState {
  // === Quiz Data ===
  currentModule: QuizModule | null;
  answerRecords: Record<string, AnswerRecord>;

  // === Session State ===
  appState: AppState;
  currentChapterId: string;
  currentQuestionIndex: number;
  selectedOptionId: string | null;
  isSubmitted: boolean;
  sessionHistory: SessionHistoryEntry[];
  currentHistoryViewIndex: number | null;

  // === UI State ===
  isLoading: boolean;
  error: string;
  isEditModeActive: boolean;
  editingQuestionData: QuizQuestion | null;

  // === SRS State ===
  isReviewSessionActive: boolean;
  currentReviewQuestion: NextReviewQuestion | null;

  // === Quiz Data Actions ===
  setCurrentModule: (module: QuizModule | null) => void;
  updateModule: (updater: (module: QuizModule) => QuizModule) => void;
  clearQuizData: () => void;
  setAnswerRecord: (questionId: string, record: AnswerRecord) => void;

  // === Session Actions ===
  setAppState: (state: AppState) => void;
  setCurrentChapterId: (chapterId: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  selectOption: (optionId: string | null) => void;
  submitAnswer: (selectedOptionId?: string, displayedOptions?: DisplayedOption[]) => void;
  resetQuestionState: () => void;

  // === UI Actions ===
  setIsLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  setEditModeActive: (active: boolean) => void;
  setEditingQuestionData: (question: QuizQuestion | null) => void;
  clearEditingQuestionData: () => void;

  // === SRS Actions ===
  startReviewSession: () => void;
  endReviewSession: () => void;
  setCurrentReviewQuestion: (question: NextReviewQuestion | null) => void;

  // === Session History Actions ===
  addToSessionHistory: (entry: SessionHistoryEntry) => void;
  setHistoryViewIndex: (index: number | null) => void;
  clearSessionHistory: () => void;

  // === Navigation Actions ===
  startQuiz: (chapterId: string) => void;
  backToDashboard: () => void;

  // === Computed Getters (Selectors) ===
  getCurrentChapter: () => QuizChapter | null;
  getCurrentQuestion: () => QuizQuestion | null;
  getTotalQuestionsInChapter: () => number;
  getQuestionByIndex: (index: number) => QuizQuestion | null;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  // Quiz Data
  currentModule: null,
  answerRecords: {},

  // Session State
  appState: 'welcome' as AppState,
  currentChapterId: '',
  currentQuestionIndex: 0,
  selectedOptionId: null,
  isSubmitted: false,
  sessionHistory: [],
  currentHistoryViewIndex: null,

  // UI State
  isLoading: false,
  error: '',
  isEditModeActive: false,
  editingQuestionData: null,

  // SRS State
  isReviewSessionActive: false,
  currentReviewQuestion: null,
};

// ============================================
// STORE CREATION
// ============================================

export const useQuizStore = create<QuizState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // === Quiz Data Actions ===

      setCurrentModule: (module) => set({ currentModule: module }, false, 'setCurrentModule'),

      updateModule: (updater) =>
        set(
          (state) => {
            if (!state.currentModule) return state;
            return { currentModule: updater(state.currentModule) };
          },
          false,
          'updateModule',
        ),

      clearQuizData: () =>
        set(
          {
            currentModule: null,
            answerRecords: {},
            appState: 'welcome',
            currentChapterId: '',
            currentQuestionIndex: 0,
            selectedOptionId: null,
            isSubmitted: false,
            sessionHistory: [],
            currentHistoryViewIndex: null,
            isReviewSessionActive: false,
            currentReviewQuestion: null,
          },
          false,
          'clearQuizData',
        ),

      setAnswerRecord: (questionId, record) =>
        set(
          (state) => ({
            answerRecords: { ...state.answerRecords, [questionId]: record },
          }),
          false,
          'setAnswerRecord',
        ),

      // === Session Actions ===

      setAppState: (appState) => set({ appState }, false, 'setAppState'),

      setCurrentChapterId: (currentChapterId) =>
        set({ currentChapterId }, false, 'setCurrentChapterId'),

      setCurrentQuestionIndex: (currentQuestionIndex) =>
        set({ currentQuestionIndex }, false, 'setCurrentQuestionIndex'),

      nextQuestion: () =>
        set(
          (state) => {
            const chapter = get().getCurrentChapter();
            if (!chapter) return state;

            const maxIndex = chapter.questions.length - 1;
            const newIndex = Math.min(state.currentQuestionIndex + 1, maxIndex);

            return {
              currentQuestionIndex: newIndex,
              selectedOptionId: null,
              isSubmitted: false,
            };
          },
          false,
          'nextQuestion',
        ),

      previousQuestion: () =>
        set(
          (state) => ({
            currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
            selectedOptionId: null,
            isSubmitted: false,
          }),
          false,
          'previousQuestion',
        ),

      selectOption: (optionId) => set({ selectedOptionId: optionId }, false, 'selectOption'),

      submitAnswer: (selectedOptionId, displayedOptions) =>
        set(
          (state) => {
            // If no parameters provided, just set isSubmitted (legacy behavior)
            if (selectedOptionId === undefined || displayedOptions === undefined) {
              return { isSubmitted: true };
            }

            // Get current question
            const { currentModule, currentChapterId, currentQuestionIndex, isReviewSessionActive } =
              state;
            if (!currentModule || !currentChapterId) {
              return { isSubmitted: true };
            }

            const chapterIndex = currentModule.chapters.findIndex((c) => c.id === currentChapterId);
            if (chapterIndex === -1) {
              return { isSubmitted: true };
            }

            const chapter = currentModule.chapters[chapterIndex];
            const question = chapter.questions[currentQuestionIndex];
            if (!question) {
              return { isSubmitted: true };
            }

            // Check if answer is correct
            const isCorrect = question.correctOptionIds.includes(selectedOptionId);

            // Call SRS engine
            const srsInput = {
              srsLevel: question.srsLevel ?? 0,
              status: question.status ?? 'not_attempted',
              timesAnsweredCorrectly: question.timesAnsweredCorrectly ?? 0,
              timesAnsweredIncorrectly: question.timesAnsweredIncorrectly ?? 0,
            };
            const srsResult = calculateNextReview(srsInput, isCorrect);

            // Build updated question
            const timestamp = new Date().toISOString();
            const updatedQuestion: QuizQuestion = {
              ...question,
              srsLevel: srsResult.srsLevel,
              status: srsResult.status,
              nextReviewAt: srsResult.nextReviewAt,
              timesAnsweredCorrectly: srsResult.timesAnsweredCorrectly,
              timesAnsweredIncorrectly: srsResult.timesAnsweredIncorrectly,
              lastAttemptedAt: timestamp,
              lastSelectedOptionId: selectedOptionId,
              historyOfIncorrectSelections: isCorrect
                ? question.historyOfIncorrectSelections
                : [...(question.historyOfIncorrectSelections || []), selectedOptionId],
            };

            // Build updated chapter
            const updatedQuestions = [...chapter.questions];
            updatedQuestions[currentQuestionIndex] = updatedQuestion;
            const updatedChapter: QuizChapter = {
              ...chapter,
              questions: updatedQuestions,
            };

            // Build updated module
            const updatedChapters = [...currentModule.chapters];
            updatedChapters[chapterIndex] = updatedChapter;
            const updatedModule: QuizModule = {
              ...currentModule,
              chapters: updatedChapters,
            };

            // Build answer record
            const answerRecord: AnswerRecord = {
              selectedOptionId,
              isCorrect,
              displayedOptionIds: displayedOptions.map((o) => o.optionId),
              timestamp,
            };

            // Build session history entry
            const historyEntry: SessionHistoryEntry = {
              questionSnapshot: { ...question }, // Snapshot before update
              selectedOptionId,
              displayedOptions,
              isCorrect,
              isReviewSessionQuestion: isReviewSessionActive,
              chapterId: currentChapterId,
            };

            return {
              isSubmitted: true,
              currentModule: updatedModule,
              answerRecords: {
                ...state.answerRecords,
                [question.questionId]: answerRecord,
              },
              sessionHistory: [...state.sessionHistory, historyEntry],
            };
          },
          false,
          'submitAnswer',
        ),

      resetQuestionState: () =>
        set({ selectedOptionId: null, isSubmitted: false }, false, 'resetQuestionState'),

      // === UI Actions ===

      setIsLoading: (isLoading) => set({ isLoading }, false, 'setIsLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      clearError: () => set({ error: '' }, false, 'clearError'),

      setEditModeActive: (isEditModeActive) =>
        set({ isEditModeActive }, false, 'setEditModeActive'),

      setEditingQuestionData: (editingQuestionData) =>
        set({ editingQuestionData }, false, 'setEditingQuestionData'),

      clearEditingQuestionData: () =>
        set({ editingQuestionData: null }, false, 'clearEditingQuestionData'),

      // === SRS Actions ===

      startReviewSession: () =>
        set(
          {
            isReviewSessionActive: true,
            appState: 'quiz',
          },
          false,
          'startReviewSession',
        ),

      endReviewSession: () =>
        set(
          {
            isReviewSessionActive: false,
            currentReviewQuestion: null,
          },
          false,
          'endReviewSession',
        ),

      setCurrentReviewQuestion: (question) =>
        set({ currentReviewQuestion: question }, false, 'setCurrentReviewQuestion'),

      // === Session History Actions ===

      addToSessionHistory: (entry) =>
        set(
          (state) => ({
            sessionHistory: [...state.sessionHistory, entry],
          }),
          false,
          'addToSessionHistory',
        ),

      setHistoryViewIndex: (index) =>
        set({ currentHistoryViewIndex: index }, false, 'setHistoryViewIndex'),

      clearSessionHistory: () =>
        set({ sessionHistory: [], currentHistoryViewIndex: null }, false, 'clearSessionHistory'),

      // === Navigation Actions ===

      startQuiz: (chapterId) =>
        set(
          {
            currentChapterId: chapterId,
            currentQuestionIndex: 0,
            selectedOptionId: null,
            isSubmitted: false,
            answerRecords: {},
            isReviewSessionActive: false,
            currentReviewQuestion: null,
            sessionHistory: [],
            currentHistoryViewIndex: null,
            appState: 'quiz',
          },
          false,
          'startQuiz',
        ),

      backToDashboard: () =>
        set(
          {
            appState: 'welcome',
            currentChapterId: '',
            currentQuestionIndex: 0,
            selectedOptionId: null,
            isSubmitted: false,
            isReviewSessionActive: false,
            currentReviewQuestion: null,
            sessionHistory: [],
            currentHistoryViewIndex: null,
            isEditModeActive: false,
            editingQuestionData: null,
          },
          false,
          'backToDashboard',
        ),

      // === Computed Getters (Selectors) ===

      getCurrentChapter: () => {
        const { currentModule, currentChapterId } = get();
        if (!currentModule || !currentChapterId) return null;
        return currentModule.chapters.find((c) => c.id === currentChapterId) || null;
      },

      getCurrentQuestion: () => {
        const chapter = get().getCurrentChapter();
        const { currentQuestionIndex } = get();
        if (!chapter) return null;
        return chapter.questions[currentQuestionIndex] || null;
      },

      getTotalQuestionsInChapter: () => {
        const chapter = get().getCurrentChapter();
        return chapter?.questions.length || 0;
      },

      getQuestionByIndex: (index) => {
        const chapter = get().getCurrentChapter();
        if (!chapter) return null;
        return chapter.questions[index] || null;
      },
    }),
    { name: 'quiz-store' },
  ),
);

// ============================================
// UTILITY FOR TESTING
// ============================================

/** Initial state values (without actions) for testing */
export type InitialStateType = typeof initialState;

/** Get initial state for testing/reset purposes */
(useQuizStore as any).getInitialState = (): InitialStateType => initialState;
