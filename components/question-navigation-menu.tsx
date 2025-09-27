'use client';
import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { QuizQuestion, SessionHistoryEntry } from '@/types/quiz-types';

interface QuestionNavigationMenuProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  sessionHistory: SessionHistoryEntry[];
  currentHistoryViewIndex: number | null;
  onNavigateToQuestion: (questionIndex: number) => void;
  isReviewSession: boolean;
}

export const QuestionNavigationMenu = memo(function QuestionNavigationMenu({
  questions,
  currentQuestionIndex,
  sessionHistory,
  currentHistoryViewIndex,
  onNavigateToQuestion,
  isReviewSession,
}: QuestionNavigationMenuProps) {
  // Don't render during review sessions
  if (isReviewSession) {
    return null;
  }

  // Helper function to find session history entry for a question
  const findHistoryEntryForQuestion = (questionId: string): SessionHistoryEntry | null => {
    return sessionHistory.find((entry) => entry.questionSnapshot.questionId === questionId) || null;
  };

  // Calculate progress percentage
  const answeredCount = sessionHistory.length;
  const progressPercentage =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

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

  return (
    <Card className="mb-6 border-slate-700 bg-slate-900/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Question Navigation</h3>
          <div className="text-sm font-medium tabular-nums text-gray-300">
            {progressPercentage}% Complete
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Single-line question navigation buttons */}
        <div className="flex w-full gap-1">
          {questions.map((question, index) => {
            const boxStatus = getQuestionBoxStatus(index);

            return (
              <button
                key={question.questionId}
                onClick={() => onNavigateToQuestion(index)}
                className={` ${boxStatus.classes} flex h-10 min-w-[2.5rem] flex-1 items-center justify-center whitespace-nowrap rounded-md border-2 px-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 active:scale-95`}
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
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-4 border-t border-slate-700 pt-2 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border border-blue-600 bg-gradient-to-r from-blue-900 to-blue-800"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border border-green-700 bg-gradient-to-r from-green-950 to-green-900"></div>
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border border-red-700 bg-gradient-to-r from-red-950 to-red-900"></div>
            <span>Incorrect</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border border-gray-600 bg-gradient-to-r from-slate-800 to-gray-800"></div>
            <span>Unanswered</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
