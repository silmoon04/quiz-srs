/**
 * DashboardContainer Component
 *
 * Container component that manages state and data flow for the Dashboard.
 * Handles module loading, file uploads, and action dispatching.
 *
 * @module features/dashboard/components/DashboardContainer
 */

'use client';

import { useCallback, useMemo, useRef } from 'react';
import { Dashboard } from '@/components/dashboard';
import { useModuleLoader } from '../hooks/use-module-loader';
import { useQuizStore } from '@/store';
import type { QuizModule } from '@/types/quiz-types';

// ============================================
// TYPES
// ============================================

export interface DashboardContainerProps {
  /** Callback when user starts a quiz for a specific chapter */
  onStartQuiz?: (chapterId: string) => void;
  /** Callback when user starts a review session */
  onStartReview?: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate the number of questions due for review
 */
function calculateReviewQueueCount(module: QuizModule | null): number {
  if (!module) return 0;

  const now = new Date();
  let count = 0;

  module.chapters.forEach((chapter) => {
    chapter.questions.forEach((question) => {
      const isNotMastered = question.status !== 'mastered';

      // Brand new questions (srsLevel 0, no scheduled review) are due
      const isBrandNewAndReady = question.srsLevel === 0 && question.nextReviewAt === null;
      // Scheduled questions past their due date are due
      const nextReviewAt = question.nextReviewAt;
      const isScheduledAndDue =
        nextReviewAt !== null && nextReviewAt !== undefined && new Date(nextReviewAt) <= now;

      const isDue = isBrandNewAndReady || isScheduledAndDue;

      if (isNotMastered && isDue) {
        count++;
      }
    });
  });

  return count;
}

// ============================================
// COMPONENT
// ============================================

export function DashboardContainer({ onStartQuiz, onStartReview }: DashboardContainerProps) {
  // File input ref for loading new modules
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get module loader hook
  const { currentModule, isLoading, error, loadFromFile, clearModule } = useModuleLoader();

  // Get store actions for state management
  const setCurrentModule = useQuizStore((state) => state.setCurrentModule);

  // Calculate review queue count
  const reviewQueueCount = useMemo(() => calculateReviewQueueCount(currentModule), [currentModule]);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Handle starting a quiz for a specific chapter
   */
  const handleStartQuiz = useCallback(
    (chapterId: string) => {
      onStartQuiz?.(chapterId);
    },
    [onStartQuiz],
  );

  /**
   * Handle starting a review session
   */
  const handleStartReviewSession = useCallback(() => {
    onStartReview?.();
  }, [onStartReview]);

  /**
   * Trigger file input for loading a new module
   */
  const handleLoadNewModule = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handle file selection for loading a new module
   */
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await loadFromFile(file);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [loadFromFile],
  );

  /**
   * Handle exporting the current state
   */
  const handleExportState = useCallback(() => {
    if (!currentModule) return;

    const dataStr = JSON.stringify(currentModule, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-state-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentModule]);

  /**
   * Handle importing state from a file
   */
  const handleImportState = useCallback(
    async (file: File) => {
      await loadFromFile(file);
    },
    [loadFromFile],
  );

  /**
   * Handle exporting incorrect answers
   */
  const handleExportIncorrectAnswers = useCallback(() => {
    if (!currentModule) return;

    const incorrectAnswersLog: Array<{
      questionId: string;
      questionText: string;
      chapterId: string;
      chapterName: string;
      incorrectSelections: Array<{
        selectedOptionId: string;
        selectedOptionText: string;
      }>;
      correctOptionIds: string[];
      correctOptionTexts: string[];
      explanationText: string;
      totalTimesCorrect: number;
      totalTimesIncorrect: number;
      currentSrsLevel: number;
      lastAttemptedAt?: string;
    }> = [];

    currentModule.chapters.forEach((chapter) => {
      chapter.questions.forEach((question) => {
        if ((question.timesAnsweredIncorrectly || 0) > 0) {
          const incorrectSelections = (question.historyOfIncorrectSelections || []).map(
            (selectedOptionId) => {
              const selectedOption = question.options.find(
                (opt) => opt.optionId === selectedOptionId,
              );
              return {
                selectedOptionId,
                selectedOptionText: selectedOption
                  ? selectedOption.optionText
                  : `[Option ${selectedOptionId} not found]`,
              };
            },
          );

          const correctOptionTexts = question.correctOptionIds.map((correctOptionId) => {
            const correctOption = question.options.find((opt) => opt.optionId === correctOptionId);
            return correctOption
              ? correctOption.optionText
              : `[Option ${correctOptionId} not found]`;
          });

          incorrectAnswersLog.push({
            questionId: question.questionId,
            questionText: question.questionText,
            chapterId: chapter.id,
            chapterName: chapter.name,
            incorrectSelections,
            correctOptionIds: question.correctOptionIds,
            correctOptionTexts,
            explanationText: question.explanationText,
            totalTimesCorrect: question.timesAnsweredCorrectly || 0,
            totalTimesIncorrect: question.timesAnsweredIncorrectly || 0,
            currentSrsLevel: question.srsLevel || 0,
            lastAttemptedAt: question.lastAttemptedAt,
          });
        }
      });
    });

    if (incorrectAnswersLog.length === 0) {
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      moduleName: currentModule.name,
      moduleDescription: currentModule.description,
      totalIncorrectQuestions: incorrectAnswersLog.length,
      totalIncorrectAttempts: incorrectAnswersLog.reduce(
        (sum, entry) => sum + entry.totalTimesIncorrect,
        0,
      ),
      incorrectAnswers: incorrectAnswersLog,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incorrect-answers-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentModule]);

  // ============================================
  // RENDER
  // ============================================

  // Show loading state
  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-slate-950 to-gray-950"
        data-testid="dashboard-loading"
      >
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-black via-slate-950 to-gray-950"
        data-testid="dashboard-error"
      >
        <div className="text-xl text-red-400">Error: {error}</div>
        <button
          onClick={handleLoadNewModule}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Try Again
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.md,.markdown"
          onChange={handleFileChange}
          className="hidden"
          data-testid="file-input"
        />
      </div>
    );
  }

  // Show empty state if no module
  if (!currentModule) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-black via-slate-950 to-gray-950"
        data-testid="dashboard-empty"
      >
        <div className="text-xl text-white">No module loaded</div>
        <button
          onClick={handleLoadNewModule}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Load Module
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.md,.markdown"
          onChange={handleFileChange}
          className="hidden"
          data-testid="file-input"
        />
      </div>
    );
  }

  // Render dashboard with module
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.md,.markdown"
        onChange={handleFileChange}
        className="hidden"
        data-testid="file-input"
      />
      <Dashboard
        module={currentModule}
        onStartQuiz={handleStartQuiz}
        onStartReviewSession={handleStartReviewSession}
        onLoadNewModule={handleLoadNewModule}
        onExportState={handleExportState}
        onImportState={handleImportState}
        onExportIncorrectAnswers={handleExportIncorrectAnswers}
        reviewQueueCount={reviewQueueCount}
      />
    </>
  );
}
