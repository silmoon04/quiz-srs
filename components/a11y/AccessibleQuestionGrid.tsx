'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { QuizQuestion, SessionHistoryEntry } from '@/types/quiz-types';

interface AccessibleQuestionGridProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  sessionHistory: SessionHistoryEntry[];
  currentHistoryViewIndex: number | null;
  onNavigateToQuestion: (questionIndex: number) => void;
  isReviewSession: boolean;
}

export function AccessibleQuestionGrid({
  questions,
  currentQuestionIndex,
  sessionHistory,
  currentHistoryViewIndex,
  onNavigateToQuestion,
  isReviewSession,
}: AccessibleQuestionGridProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(currentQuestionIndex);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update button refs array when questions change
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, questions.length);
  }, [questions.length]);

  // Focus management
  const focusButton = useCallback((index: number) => {
    if (buttonRefs.current[index]) {
      buttonRefs.current[index]?.focus();
      setFocusedIndex(index);
    }
  }, []);

  // Handle focus events from buttons
  const handleButtonFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (isReviewSession) return;

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = (focusedIndex + 1) % questions.length;
          focusButton(nextIndex);
          break;

        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = focusedIndex === 0 ? questions.length - 1 : focusedIndex - 1;
          focusButton(prevIndex);
          break;

        case 'Home':
          event.preventDefault();
          focusButton(0);
          break;

        case 'End':
          event.preventDefault();
          focusButton(questions.length - 1);
          break;

        case ' ':
        case 'Enter':
          event.preventDefault();
          onNavigateToQuestion(focusedIndex);
          break;
      }
    },
    [isReviewSession, focusedIndex, questions.length, focusButton, onNavigateToQuestion],
  );

  // Handle individual button key events
  const handleButtonKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (isReviewSession) return;

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = (index + 1) % questions.length;
          focusButton(nextIndex);
          break;

        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = index === 0 ? questions.length - 1 : index - 1;
          focusButton(prevIndex);
          break;

        case 'Home':
          event.preventDefault();
          focusButton(0);
          break;

        case 'End':
          event.preventDefault();
          focusButton(questions.length - 1);
          break;

        case ' ':
        case 'Enter':
          event.preventDefault();
          onNavigateToQuestion(index);
          break;
      }
    },
    [isReviewSession, questions.length, focusButton, onNavigateToQuestion],
  );

  // Set initial focus when component mounts
  useEffect(() => {
    if (questions.length > 0) {
      focusButton(currentQuestionIndex);
    }
  }, [questions.length, currentQuestionIndex, focusButton]);

  // Update focused index when current question changes
  useEffect(() => {
    setFocusedIndex(currentQuestionIndex);
  }, [currentQuestionIndex]);

  // Helper function to find session history entry for a question
  const findHistoryEntryForQuestion = (questionId: string): SessionHistoryEntry | null => {
    return sessionHistory.find((entry) => entry.questionSnapshot.questionId === questionId) || null;
  };

  // Helper function to determine the status and styling for each question box
  const getQuestionBoxStatus = (questionIndex: number) => {
    const question = questions[questionIndex];
    const historyEntry = findHistoryEntryForQuestion(question.questionId);

    // Check if this is the question being viewed in history mode
    const isCurrentHistoricalView =
      currentHistoryViewIndex !== null &&
      historyEntry &&
      sessionHistory[currentHistoryViewIndex]?.questionSnapshot.questionId === question.questionId;

    // Check if this is the current live question (not yet submitted)
    const isCurrentLive =
      questionIndex === currentQuestionIndex && currentHistoryViewIndex === null && !historyEntry;

    // Determine status
    if (isCurrentHistoricalView) {
      return {
        status: 'current-historical',
        isCorrect: historyEntry.isCorrect,
        classes: historyEntry.isCorrect
          ? 'bg-gradient-to-r from-green-900 to-green-800 border-green-600 ring-2 ring-green-400 ring-opacity-50'
          : 'bg-gradient-to-r from-red-900 to-red-800 border-red-600 ring-2 ring-red-400 ring-opacity-50',
      };
    } else if (isCurrentLive) {
      return {
        status: 'current-live',
        classes:
          'bg-gradient-to-r from-blue-900 to-blue-800 border-blue-600 ring-2 ring-blue-400 ring-opacity-50',
      };
    } else if (historyEntry) {
      return {
        status: historyEntry.isCorrect ? 'answered-correct' : 'answered-incorrect',
        isCorrect: historyEntry.isCorrect,
        classes: historyEntry.isCorrect
          ? 'bg-gradient-to-r from-green-950 to-green-900 border-green-700 hover:from-green-900 hover:to-green-800'
          : 'bg-gradient-to-r from-red-950 to-red-900 border-red-700 hover:from-red-900 hover:to-red-800',
      };
    } else {
      return {
        status: 'unanswered',
        classes:
          'bg-gradient-to-r from-slate-800 to-gray-800 border-gray-600 hover:from-slate-700 hover:to-gray-700',
      };
    }
  };

  // Don't render during review sessions
  if (isReviewSession) {
    return null;
  }

  return (
    <div
      role="grid"
      aria-label="Question navigation"
      onKeyDown={handleKeyDown}
      className="space-y-4"
    >
      <div className="flex w-full gap-1">
        {questions.map((question, index) => {
          const boxStatus = getQuestionBoxStatus(index);

          return (
            <button
              key={question.questionId}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              onClick={() => onNavigateToQuestion(index)}
              role="gridcell"
              tabIndex={index === focusedIndex ? 0 : -1}
              className={`${boxStatus.classes} flex h-10 min-w-[2.5rem] flex-1 items-center justify-center whitespace-nowrap rounded-md border-2 px-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 active:scale-95`}
              title={`Question ${index + 1}${
                boxStatus.status === 'current-live'
                  ? ' (Current)'
                  : boxStatus.status === 'current-historical'
                    ? ` (Viewing - ${boxStatus.isCorrect ? 'Correct' : 'Incorrect'})`
                    : boxStatus.status === 'answered-correct'
                      ? ' (Correct)'
                      : boxStatus.status === 'answered-incorrect'
                        ? ' (Incorrect)'
                        : ' (Unanswered)'
              }`}
              aria-label={`Navigate to question ${index + 1}`}
              aria-describedby={`question-status-${index}`}
              onFocus={() => handleButtonFocus(index)}
              onKeyDown={(e) => handleButtonKeyDown(e, index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
