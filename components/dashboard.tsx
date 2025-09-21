'use client';
import { useRef } from 'react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChapterCard } from './chapter-card';
import { ProgressBar } from './progress-bar';
import {
  Upload,
  Download,
  RotateCcw,
  Clock,
  FileText,
  BookOpen,
  HelpCircle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import type { QuizModule } from '@/types/quiz-types';

interface DashboardProps {
  module: QuizModule;
  onStartQuiz: (chapterId: string) => void;
  onStartReviewSession: () => void;
  onLoadNewModule: () => void;
  onExportState: () => void;
  onImportState: (file: File) => void;
  onExportIncorrectAnswers: () => void;
  reviewQueueCount: number;
}

export function Dashboard({
  module,
  onStartQuiz,
  onStartReviewSession,
  onLoadNewModule,
  onExportState,
  onImportState,
  onExportIncorrectAnswers,
  reviewQueueCount,
}: DashboardProps) {
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const totalQuestions = module.chapters.reduce((sum, chapter) => sum + chapter.totalQuestions, 0);
  const totalAnswered = module.chapters.reduce(
    (sum, chapter) => sum + chapter.answeredQuestions,
    0,
  );
  const totalCorrect = module.chapters.reduce((sum, chapter) => sum + chapter.correctAnswers, 0);
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const hasIncorrectAnswers = module.chapters.some((chapter) =>
    chapter.questions.some((question) => (question.timesAnsweredIncorrectly || 0) > 0),
  );

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Import file selected:', file.name, 'Type:', file.type, 'Size:', file.size);
      onImportState(file);
    }
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
    }
  };

  const triggerImportFileInput = () => {
    importFileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-gray-950 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header - Improved responsive layout */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="hyphens-auto break-words text-3xl font-extrabold leading-tight text-white">
              {module.name}
            </h1>
            {module.description && (
              <p className="mt-2 hyphens-auto break-words text-sm leading-relaxed text-gray-300">
                {module.description}
              </p>
            )}
          </div>

          {/* Action buttons - Improved responsive layout */}
          <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
            <input
              ref={importFileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFileSelect}
              className="hidden"
            />

            <Button
              onClick={triggerImportFileInput}
              variant="outline"
              size="sm"
              className="whitespace-nowrap border-blue-700 bg-blue-900/40 text-blue-200 shadow-sm transition-all duration-200 hover:border-blue-600 hover:bg-blue-800/50 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-blue-800/70"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import State
            </Button>
            <Button
              onClick={onExportState}
              variant="outline"
              size="sm"
              className="whitespace-nowrap border-green-700 bg-green-900/40 text-green-200 shadow-sm transition-all duration-200 hover:border-green-600 hover:bg-green-800/50 hover:text-white focus-visible:ring-2 focus-visible:ring-green-500 active:bg-green-800/70"
            >
              <Download className="mr-2 h-4 w-4" />
              Export State
            </Button>
            <Button
              onClick={onExportIncorrectAnswers}
              disabled={!hasIncorrectAnswers}
              variant="outline"
              size="sm"
              className="whitespace-nowrap border-red-700 bg-red-900/40 text-red-200 shadow-sm transition-all duration-200 hover:border-red-600 hover:bg-red-800/50 hover:text-white focus-visible:ring-2 focus-visible:ring-red-500 active:bg-red-800/70 disabled:cursor-not-allowed disabled:opacity-50"
              title={
                hasIncorrectAnswers
                  ? 'Export detailed log of incorrect answers'
                  : 'No incorrect answers to export'
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              Export Mistakes
            </Button>
            <Button
              onClick={onLoadNewModule}
              variant="outline"
              size="sm"
              className="whitespace-nowrap border-purple-700 bg-purple-900/40 text-purple-200 shadow-sm transition-all duration-200 hover:border-purple-600 hover:bg-purple-800/50 hover:text-white focus-visible:ring-2 focus-visible:ring-purple-500 active:bg-purple-800/70"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Load New Module
            </Button>
          </div>
        </div>

        {/* Review Session Card */}
        {reviewQueueCount > 0 && (
          <Card className="border-orange-700 bg-gradient-to-r from-orange-950 to-red-950 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="break-words text-xl font-semibold text-white">
                  Spaced Repetition Review
                </CardTitle>{' '}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="break-words text-sm text-orange-200">
                    You have <span className="font-bold text-orange-300">{reviewQueueCount}</span>{' '}
                    question
                    {reviewQueueCount !== 1 ? 's' : ''} ready for review
                  </p>
                  <p className="break-words text-xs text-orange-300">
                    Review questions to strengthen your memory and improve retention
                  </p>
                </div>
                <Button
                  onClick={onStartReviewSession}
                  className="flex-shrink-0 whitespace-nowrap bg-orange-700 px-6 text-white shadow-sm transition-all duration-200 hover:bg-orange-800 focus-visible:ring-2 focus-visible:ring-orange-500 active:bg-orange-900"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Start Review Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Progress - Redesigned */}
        <Card className="border-gray-800 bg-gradient-to-r from-slate-950 to-gray-950 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar Section */}
            <div>
              <ProgressBar
                current={totalAnswered}
                total={totalQuestions}
                variant={totalAnswered === totalQuestions ? 'success' : 'default'}
                showText={true}
                label="Questions Completed"
                showPercentage={true}
              />
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* Chapters */}
              <div className="space-y-3 rounded-lg bg-slate-800 p-4">
                <div className="w-fit rounded-lg bg-blue-700/20 p-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Chapters</div>
                  <div className="text-2xl font-bold tabular-nums text-white">
                    {module.chapters.length}
                  </div>
                </div>
              </div>

              {/* Total Questions */}
              <div className="space-y-3 rounded-lg bg-slate-800 p-4">
                <div className="w-fit rounded-lg bg-purple-700/20 p-2">
                  <HelpCircle className="h-5 w-5 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Total Questions</div>
                  <div className="text-2xl font-bold tabular-nums text-white">{totalQuestions}</div>
                </div>
              </div>

              {/* Answered */}
              <div className="space-y-3 rounded-lg bg-slate-800 p-4">
                <div className="w-fit rounded-lg bg-green-700/20 p-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Answered</div>
                  <div className="text-2xl font-bold tabular-nums text-white">{totalAnswered}</div>
                </div>
              </div>

              {/* Accuracy */}
              <div className="space-y-3 rounded-lg bg-slate-800 p-4">
                <div className="w-fit rounded-lg bg-yellow-700/20 p-2">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Accuracy</div>
                  <div
                    className={`text-2xl font-bold tabular-nums ${overallAccuracy >= 70 ? 'text-green-400' : 'text-yellow-400'}`}
                  >
                    {overallAccuracy}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters Grid - Improved responsive layout */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Chapters</h2>
          <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {module.chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} onStartQuiz={onStartQuiz} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
