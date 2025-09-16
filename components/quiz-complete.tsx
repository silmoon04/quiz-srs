"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "./progress-bar"
import { Trophy, RotateCcw, Home, Download, Upload, FileText, LayoutGrid, SkipForward } from "lucide-react"

interface QuizCompleteProps {
  chapter: {
    id: string
    name: string
  }
  results?: {
    totalQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    accuracy: number
  }
  onBackToDashboard: () => void
  onRetryQuiz: () => void
  onExportResults: () => void
  onLoadNewModule: () => void
  onExportIncorrectAnswers: () => void
  hasIncorrectAnswers: boolean
  nextChapterId?: string | null
  onStartChapterQuiz: (chapterId: string) => void
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
    if (!results) return "No results available"
    if (results.accuracy >= 90) return "Outstanding! 🎉"
    if (results.accuracy >= 80) return "Excellent work! 👏"
    if (results.accuracy >= 70) return "Good job! 👍"
    if (results.accuracy >= 60) return "Not bad, keep practicing! 💪"
    return "Keep studying and try again! 📚"
  }

  const getPerformanceColor = () => {
    if (!results) return "text-gray-400"
    if (results.accuracy >= 80) return "text-green-400"
    if (results.accuracy >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Celebration Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-yellow-700 p-4 rounded-full shadow-sm">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">Quiz Complete!</h1>
          <p className="text-xl text-gray-300">
            You've finished <span className="text-blue-400">{chapter.name}</span>
          </p>
        </div>

        {/* Results Card */}
        <Card className="bg-gradient-to-r from-slate-950 to-gray-950 border-gray-800 backdrop-blur-sm shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Your Results</CardTitle>
            <p className={`text-xl font-semibold ${getPerformanceColor()}`}>{getPerformanceMessage()}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className={`text-6xl font-bold ${getPerformanceColor()}`}>{results?.accuracy ?? 0}%</div>
              <p className="text-gray-300 mt-2">Overall Accuracy</p>
            </div>

            {/* Progress Bar */}
            <ProgressBar
              current={results?.correctAnswers ?? 0}
              total={results?.totalQuestions ?? 0}
              variant={results && results.accuracy >= 70 ? "success" : results && results.accuracy >= 50 ? "warning" : "default"}
            />

            {/* Detailed Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{results?.totalQuestions ?? 0}</div>
                <div className="text-sm text-gray-300">Total Questions</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-400">{results?.correctAnswers ?? 0}</div>
                <div className="text-sm text-gray-300">Correct</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-400">{results?.incorrectAnswers ?? 0}</div>
                <div className="text-sm text-gray-300">Incorrect</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className={`grid grid-cols-1 ${nextChapterId ? "md:grid-cols-3" : "md:grid-cols-2"} gap-3`}>
          <Button onClick={onBackToDashboard} className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm" size="lg">
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>

          <Button
            onClick={onRetryQuiz}
            className="border-blue-700 bg-blue-900/40 text-blue-200 hover:bg-blue-800/50 hover:text-white hover:border-blue-600 transition-all duration-200 shadow-sm"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Retry Quiz
          </Button>

          {nextChapterId && (
            <Button
              onClick={() => onStartChapterQuiz(nextChapterId)}
              className="bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
              size="lg"
            >
              <SkipForward className="w-5 h-5 mr-2" />
              Start Next Chapter
            </Button>
          )}
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Button
            onClick={onExportResults}
            className="border-green-700 bg-green-900/40 text-green-200 hover:bg-green-800/50 hover:text-white hover:border-green-600 transition-all duration-200 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>

          {/* NEW: Export Incorrect Answers Button */}
          <Button
            onClick={onExportIncorrectAnswers}
            disabled={!hasIncorrectAnswers}
            className="border-red-700 bg-red-900/40 text-red-200 hover:bg-red-800/50 hover:text-white hover:border-red-600 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={hasIncorrectAnswers ? "Export detailed log of incorrect answers" : "No incorrect answers to export"}
          >
            <FileText className="w-4 h-4 mr-2" />
            Export Mistakes
          </Button>

          <Button
            onClick={onLoadNewModule}
            className="border-purple-700 bg-purple-900/40 text-purple-200 hover:bg-purple-800/50 hover:text-white hover:border-purple-600 transition-all duration-200 shadow-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load New Module
          </Button>

          <Button
            onClick={onBackToDashboard}
            className="border-amber-700 bg-amber-900/40 text-amber-200 hover:bg-amber-800/50 hover:text-white hover:border-amber-600 transition-all duration-200 shadow-sm"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            View All Chapters
          </Button>
        </div>
      </div>
    </div>
  )
}
