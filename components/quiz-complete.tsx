'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from './progress-bar';
import {
  Trophy,
  RotateCcw,
  Home,
  Download,
  Upload,
  FileText,
  LayoutGrid,
  SkipForward,
} from 'lucide-react';

interface QuizCompleteProps {
  chapter: {
    id: string;
    name: string;
  };
  results?: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
  };
  onBackToDashboard: () => void;
  onRetryQuiz: () => void;
  onExportResults: () => void;
  onLoadNewModule: () => void;
  onExportIncorrectAnswers: () => void;
  hasIncorrectAnswers: boolean;
  nextChapterId?: string | null;
  onStartChapterQuiz: (chapterId: string) => void;
}

export function QuizComplete({
  chapter,
  results,
  onBackToDashboard,
  onRetryQuiz,
  onExportResults,
  onLoadNewModule,
  onExportIncorrectAnswers,
  hasIncorrectAnswers,
  nextChapterId,
  onStartChapterQuiz,
}: QuizCompleteProps) {
  const getPerformanceMessage = () => {
    if (!results) return 'No results available';
    if (results.accuracy >= 90) return 'Outstanding! 🎉';
    if (results.accuracy >= 80) return 'Excellent work! 👏';
    if (results.accuracy >= 70) return 'Good job! 👍';
    if (results.accuracy >= 60) return 'Not bad, keep practicing! 💪';
    return 'Keep studying and try again! 📚';
  };

  const getPerformanceColor = () => {
    if (!results) return 'text-gray-400';
    if (results.accuracy >= 80) return 'text-green-400';
    if (results.accuracy >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-slate-950 to-gray-950 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Celebration Header */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-yellow-700 p-4 shadow-sm">
              <Trophy className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">Quiz Complete!</h1>
          <p className="text-xl text-gray-300">
            You've finished <span className="text-blue-400">{chapter.name}</span>
          </p>
        </div>

        {/* Results Card */}
        <Card className="border-gray-800 bg-gradient-to-r from-slate-950 to-gray-950 shadow-sm backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Your Results</CardTitle>
            <p className={`text-xl font-semibold ${getPerformanceColor()}`}>
              {getPerformanceMessage()}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className={`text-6xl font-bold ${getPerformanceColor()}`}>
                {results?.accuracy ?? 0}%
              </div>
              <p className="mt-2 text-gray-300">Overall Accuracy</p>
            </div>

            {/* Progress Bar */}
            <ProgressBar
              current={results?.correctAnswers ?? 0}
              total={results?.totalQuestions ?? 0}
              variant={
                results && results.accuracy >= 70
                  ? 'success'
                  : results && results.accuracy >= 50
                    ? 'warning'
                    : 'default'
              }
            />

            {/* Detailed Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{results?.totalQuestions ?? 0}</div>
                <div className="text-sm text-gray-300">Total Questions</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-400">
                  {results?.correctAnswers ?? 0}
                </div>
                <div className="text-sm text-gray-300">Correct</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-400">
                  {results?.incorrectAnswers ?? 0}
                </div>
                <div className="text-sm text-gray-300">Incorrect</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div
          className={`grid grid-cols-1 ${nextChapterId ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-3`}
        >
          <Button
            onClick={onBackToDashboard}
            className="bg-blue-700 text-white shadow-sm hover:bg-blue-800"
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>

          <Button
            onClick={onRetryQuiz}
            className="border-blue-700 bg-blue-900/40 text-blue-200 shadow-sm transition-all duration-200 hover:border-blue-600 hover:bg-blue-800/50 hover:text-white"
            size="lg"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Retry Quiz
          </Button>

          {nextChapterId && (
            <Button
              onClick={() => onStartChapterQuiz(nextChapterId)}
              className="bg-teal-700 text-white shadow-sm hover:bg-teal-800"
              size="lg"
            >
              <SkipForward className="mr-2 h-5 w-5" />
              Start Next Chapter
            </Button>
          )}
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Button
            onClick={onExportResults}
            className="border-green-700 bg-green-900/40 text-green-200 shadow-sm transition-all duration-200 hover:border-green-600 hover:bg-green-800/50 hover:text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>

          {/* NEW: Export Incorrect Answers Button */}
          <Button
            onClick={onExportIncorrectAnswers}
            disabled={!hasIncorrectAnswers}
            className="border-red-700 bg-red-900/40 text-red-200 shadow-sm transition-all duration-200 hover:border-red-600 hover:bg-red-800/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
            className="border-purple-700 bg-purple-900/40 text-purple-200 shadow-sm transition-all duration-200 hover:border-purple-600 hover:bg-purple-800/50 hover:text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            Load New Module
          </Button>

          <Button
            onClick={onBackToDashboard}
            className="border-amber-700 bg-amber-900/40 text-amber-200 shadow-sm transition-all duration-200 hover:border-amber-600 hover:bg-amber-800/50 hover:text-white"
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            View All Chapters
          </Button>
        </div>
      </div>
    </div>
  );
}
