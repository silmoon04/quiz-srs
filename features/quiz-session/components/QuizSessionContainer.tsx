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

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactElement } from 'react';
import { QuizSession } from '@/components/quiz-session';
import { useQuizSession } from '../hooks/use-quiz-session';
import type { DisplayedOption, QuizQuestion } from '@/types/quiz-types';

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
// CONSTANTS
// ============================================

const MAX_DISPLAY_OPTIONS = 5;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generates the displayed options for a question.
 * - Includes at least one correct option
 * - Prioritizes unshown incorrect options
 * - Shuffles the final selection
 */
function generateDisplayedOptions(question: QuizQuestion): DisplayedOption[] {
  const correctOptions = question.options.filter((opt) =>
    question.correctOptionIds.includes(opt.optionId),
  );
  const incorrectOptions = question.options.filter(
    (opt) => !question.correctOptionIds.includes(opt.optionId),
  );

  const shownIncorrectIds = question.shownIncorrectOptionIds || [];
  const unshownIncorrectOptions = incorrectOptions.filter(
    (opt) => !shownIncorrectIds.includes(opt.optionId),
  );
  const shownIncorrectOptions = incorrectOptions.filter((opt) =>
    shownIncorrectIds.includes(opt.optionId),
  );

  const selectedOptions: DisplayedOption[] = [];

  // Add one correct option
  if (correctOptions.length > 0) {
    const correctIndex = question.srsLevel ? question.srsLevel % correctOptions.length : 0;
    const selectedCorrectOption = correctOptions[correctIndex] || correctOptions[0];
    selectedOptions.push({
      ...selectedCorrectOption,
      isCorrect: true,
    });
  }

  const remainingSlots = MAX_DISPLAY_OPTIONS - selectedOptions.length;

  // Add unshown incorrect options first (shuffled)
  const shuffledUnshown = [...unshownIncorrectOptions].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(remainingSlots, shuffledUnshown.length); i++) {
    selectedOptions.push({
      ...shuffledUnshown[i],
      isCorrect: false,
    });
  }

  // Add shown incorrect options if needed
  const remainingSlotsAfterUnshown = MAX_DISPLAY_OPTIONS - selectedOptions.length;
  if (remainingSlotsAfterUnshown > 0 && shownIncorrectOptions.length > 0) {
    const shuffledShown = [...shownIncorrectOptions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(remainingSlotsAfterUnshown, shuffledShown.length); i++) {
      selectedOptions.push({
        ...shuffledShown[i],
        isCorrect: false,
      });
    }
  }

  // Add remaining correct options if slots still available
  const remainingSlotsAfterIncorrect = MAX_DISPLAY_OPTIONS - selectedOptions.length;
  const remainingCorrect = correctOptions.filter(
    (opt) => !selectedOptions.some((selected) => selected.optionId === opt.optionId),
  );

  for (let i = 0; i < Math.min(remainingSlotsAfterIncorrect, remainingCorrect.length); i++) {
    selectedOptions.push({
      ...remainingCorrect[i],
      isCorrect: true,
    });
  }

  // Shuffle final selection
  return selectedOptions.sort(() => Math.random() - 0.5);
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

  // Local state for displayed options
  const [displayedOptionsCache, setDisplayedOptionsCache] = useState<DisplayedOption[]>([]);
  const lastGeneratedQuestionIdRef = useRef<string | null>(null);

  // Generate displayed options when question changes
  useEffect(() => {
    if (!currentQuestion) {
      setDisplayedOptionsCache([]);
      lastGeneratedQuestionIdRef.current = null;
      return;
    }

    const questionChanged = lastGeneratedQuestionIdRef.current !== currentQuestion.questionId;

    // Avoid reshuffling while feedback for the current question is visible
    if (!questionChanged && isSubmitted) {
      return;
    }

    if (questionChanged) {
      const newDisplayedOptions = generateDisplayedOptions(currentQuestion);
      setDisplayedOptionsCache(newDisplayedOptions);
      lastGeneratedQuestionIdRef.current = currentQuestion.questionId;
    }
  }, [currentQuestion, isSubmitted]);

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
