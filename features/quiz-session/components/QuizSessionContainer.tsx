/**
 * QuizSessionContainer
 *
 * Container component that connects the QuizSession presentation component
 * to the Zustand store via the useQuizSession hook.
 *
 * Responsibilities:
 * - Generates displayedOptions for the current question
 * - Handles answer submission flow
 * - Handles question navigation
 * - Passes appropriate props to QuizSession
 *
 * @module features/quiz-session/components/QuizSessionContainer
 */

'use client';

import { useCallback } from 'react';
import type { ReactElement } from 'react';
import { QuizSession } from '@/components/quiz-session';
import { useQuizSession } from '../hooks/use-quiz-session';
import type { DisplayedOption } from '@/types/quiz-types';

// ============================================
// TYPES
// ============================================

export interface QuizSessionContainerProps {
  /** Called when chapter is complete */
  onComplete?: () => void;
  /** Called when navigating back to dashboard */
  onBack?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function QuizSessionContainer({
  onComplete,
  onBack,
}: QuizSessionContainerProps): ReactElement | null {
  // Hook state and actions
  const {
    currentChapter,
    currentQuestion,
    currentQuestionIndex,
    totalQuestionsInChapter,
    selectedOptionId,
    isSubmitted,
    isReviewSessionActive,
    currentModule,
    selectOption,
    submitAnswer,
    nextQuestion,
    backToDashboard,
    isLastQuestion,
  } = useQuizSession();

  // Handlers
  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!isSubmitted) {
        selectOption(optionId);
      }
    },
    [isSubmitted, selectOption],
  );

  const handleSubmitAnswer = useCallback(
    (displayedOptions: DisplayedOption[]) => {
      if (!selectedOptionId || isSubmitted) return;
      submitAnswer(selectedOptionId, displayedOptions);
    },
    [selectedOptionId, isSubmitted, submitAnswer],
  );

  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion && onComplete) {
      onComplete();
    } else {
      nextQuestion();
    }
  }, [isLastQuestion, onComplete, nextQuestion]);

  const handleBackToDashboard = useCallback(() => {
    backToDashboard();
    onBack?.();
  }, [backToDashboard, onBack]);

  // Placeholder handlers for features not yet connected
  const handleExportCurrentQuestionState = useCallback(() => {
    // TODO: Implement export functionality
    console.log('Export current question state');
  }, []);

  const handleImportQuestionStateFromFile = useCallback((file: File) => {
    // TODO: Implement import functionality
    console.log('Import question state from file:', file.name);
  }, []);

  const handleRetryChapter = useCallback(() => {
    // TODO: Implement retry chapter functionality
    console.log('Retry chapter');
  }, []);

  const handleNavigateToQuestion = useCallback((questionIndex: number) => {
    // TODO: Implement question navigation
    console.log('Navigate to question:', questionIndex);
  }, []);

  // Loading state
  if (!currentChapter || !currentQuestion) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-slate-950 to-gray-950"
        data-testid="quiz-session-loading"
      >
        <div className="text-xl text-white">Loading question...</div>
      </div>
    );
  }

  return (
    <QuizSession
      chapter={currentChapter}
      question={currentQuestion}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={totalQuestionsInChapter}
      selectedOptionId={selectedOptionId}
      isSubmitted={isSubmitted}
      isReviewSession={isReviewSessionActive}
      currentModule={currentModule ?? undefined}
      onSelectOption={handleSelectOption}
      onSubmitAnswer={handleSubmitAnswer}
      onNextQuestion={handleNextQuestion}
      onBackToDashboard={handleBackToDashboard}
      onExportCurrentQuestionState={handleExportCurrentQuestionState}
      onImportQuestionStateFromFile={handleImportQuestionStateFromFile}
      onRetryChapter={handleRetryChapter}
      onNavigateToQuestion={handleNavigateToQuestion}
    />
  );
}
