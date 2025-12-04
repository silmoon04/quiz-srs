/**
 * useQuizSession Hook
 *
 * Provides a clean interface for quiz session state and actions.
 * Wraps the Zustand store with optimized selectors using shallow comparison.
 *
 * @module features/quiz-session/hooks/use-quiz-session
 */

import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useQuizStore, type AppState } from '@/store';
import type { QuizModule, QuizChapter, QuizQuestion, DisplayedOption } from '@/types/quiz-types';

// ============================================
// TYPES
// ============================================

export interface UseQuizSessionReturn {
  // State (from store)
  appState: AppState;
  currentModule: QuizModule | null;
  currentChapter: QuizChapter | null;
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  totalQuestionsInChapter: number;
  selectedOptionId: string | null;
  isSubmitted: boolean;
  isReviewSessionActive: boolean;

  // Actions (wrapped from store)
  startQuiz: (chapterId: string) => void;
  submitAnswer: (optionId: string, displayedOptions: DisplayedOption[]) => void;
  selectOption: (optionId: string | null) => void;
  nextQuestion: () => void;
  backToDashboard: () => void;

  // Computed
  isLastQuestion: boolean;
  progress: { current: number; total: number; percentage: number };
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

/**
 * Hook for managing quiz session state and actions.
 *
 * Uses shallow comparison for selectors to prevent unnecessary re-renders
 * when unrelated state changes.
 *
 * @returns Quiz session state, actions, and computed values
 *
 * @example
 * ```tsx
 * const {
 *   currentQuestion,
 *   selectedOptionId,
 *   selectOption,
 *   submitAnswer,
 *   progress,
 * } = useQuizSession();
 * ```
 */
export function useQuizSession(): UseQuizSessionReturn {
  // ============================================
  // STATE SELECTORS (with shallow comparison)
  // ============================================

  const {
    appState,
    currentModule,
    currentChapterId,
    currentQuestionIndex,
    selectedOptionId,
    isSubmitted,
    isReviewSessionActive,
  } = useQuizStore(
    useShallow((state) => ({
      appState: state.appState,
      currentModule: state.currentModule,
      currentChapterId: state.currentChapterId,
      currentQuestionIndex: state.currentQuestionIndex,
      selectedOptionId: state.selectedOptionId,
      isSubmitted: state.isSubmitted,
      isReviewSessionActive: state.isReviewSessionActive,
    })),
  );

  // ============================================
  // DERIVED STATE
  // ============================================

  const currentChapter = useMemo((): QuizChapter | null => {
    if (!currentModule || !currentChapterId) return null;
    return currentModule.chapters.find((c) => c.id === currentChapterId) ?? null;
  }, [currentModule, currentChapterId]);

  const currentQuestion = useMemo((): QuizQuestion | null => {
    if (!currentChapter) return null;
    return currentChapter.questions[currentQuestionIndex] ?? null;
  }, [currentChapter, currentQuestionIndex]);

  const totalQuestionsInChapter = useMemo((): number => {
    return currentChapter?.questions.length ?? 0;
  }, [currentChapter]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const isLastQuestion = useMemo((): boolean => {
    if (!currentChapter || totalQuestionsInChapter === 0) return false;
    return currentQuestionIndex === totalQuestionsInChapter - 1;
  }, [currentChapter, currentQuestionIndex, totalQuestionsInChapter]);

  const progress = useMemo((): { current: number; total: number; percentage: number } => {
    if (totalQuestionsInChapter === 0) {
      return { current: 0, total: 0, percentage: 0 };
    }

    const current = currentQuestionIndex + 1;
    const total = totalQuestionsInChapter;
    const percentage = Math.round((current / total) * 100);

    return { current, total, percentage };
  }, [currentQuestionIndex, totalQuestionsInChapter]);

  // ============================================
  // ACTIONS (wrapped from store)
  // ============================================

  const startQuiz = useCallback((chapterId: string): void => {
    useQuizStore.getState().startQuiz(chapterId);
  }, []);

  const submitAnswer = useCallback(
    (optionId: string, displayedOptions: DisplayedOption[]): void => {
      useQuizStore.getState().submitAnswer(optionId, displayedOptions);
    },
    [],
  );

  const selectOption = useCallback((optionId: string | null): void => {
    useQuizStore.getState().selectOption(optionId);
  }, []);

  const nextQuestion = useCallback((): void => {
    useQuizStore.getState().nextQuestion();
  }, []);

  const backToDashboard = useCallback((): void => {
    useQuizStore.getState().backToDashboard();
  }, []);

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    appState,
    currentModule,
    currentChapter,
    currentQuestion,
    currentQuestionIndex,
    totalQuestionsInChapter,
    selectedOptionId,
    isSubmitted,
    isReviewSessionActive,

    // Actions
    startQuiz,
    submitAnswer,
    selectOption,
    nextQuestion,
    backToDashboard,

    // Computed
    isLastQuestion,
    progress,
  };
}
