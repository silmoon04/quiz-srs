"use client"
import { useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChapterCard } from "./chapter-card"
import { ProgressBar } from "./progress-bar"
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
} from "lucide-react"
import type { QuizModule } from "@/types/quiz-types"

interface DashboardProps {
  module: QuizModule
  onStartQuiz: (chapterId: string) => void
  onStartReviewSession: () => void
  onLoadNewModule: () => void
  onExportState: () => void
  onImportState: (file: File) => void
  onExportIncorrectAnswers: () => void
  reviewQueueCount: number
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
  const importFileInputRef = useRef<HTMLInputElement>(null)

  const totalQuestions = module.chapters.reduce((sum, chapter) => sum + chapter.totalQuestions, 0)
  const totalAnswered = module.chapters.reduce((sum, chapter) => sum + chapter.answeredQuestions, 0)
  const totalCorrect = module.chapters.reduce((sum, chapter) => sum + chapter.correctAnswers, 0)
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  const hasIncorrectAnswers = module.chapters.some((chapter) =>
    chapter.questions.some((question) => (question.timesAnsweredIncorrectly || 0) > 0),
  )

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("Import file selected:", file.name, "Type:", file.type, "Size:", file.size)
      onImportState(file)
    }
    if (importFileInputRef.current) {
      importFileInputRef.current.value = ""
    }
  }

  const triggerImportFileInput = () => {
    importFileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-gray-950 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Improved responsive layout */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold text-white leading-tight break-words hyphens-auto">{module.name}</h1>
            {module.description && (
              <p className="text-gray-300 mt-2 leading-relaxed break-words hyphens-auto text-sm">
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
              className="border-blue-700 bg-blue-900/40 text-blue-200 hover:bg-blue-800/50 hover:text-white hover:border-blue-600 active:bg-blue-800/70 transition-all duration-200 shadow-sm whitespace-nowrap focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import State
            </Button>
            <Button
              onClick={onExportState}
              variant="outline"
              size="sm"
              className="border-green-700 bg-green-900/40 text-green-200 hover:bg-green-800/50 hover:text-white hover:border-green-600 active:bg-green-800/70 transition-all duration-200 shadow-sm whitespace-nowrap focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export State
            </Button>
            <Button
              onClick={onExportIncorrectAnswers}
              disabled={!hasIncorrectAnswers}
              variant="outline"
              size="sm"
              className="border-red-700 bg-red-900/40 text-red-200 hover:bg-red-800/50 hover:text-white hover:border-red-600 active:bg-red-800/70 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus-visible:ring-2 focus-visible:ring-red-500"
              title={
                hasIncorrectAnswers ? "Export detailed log of incorrect answers" : "No incorrect answers to export"
              }
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Mistakes
            </Button>
            <Button
              onClick={onLoadNewModule}
              variant="outline"
              size="sm"
              className="border-purple-700 bg-purple-900/40 text-purple-200 hover:bg-purple-800/50 hover:text-white hover:border-purple-600 active:bg-purple-800/70 transition-all duration-200 shadow-sm whitespace-nowrap focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Load New Module
            </Button>
          </div>
        </div>

        {/* Review Session Card */}
        {reviewQueueCount > 0 && (
          <Card className="bg-gradient-to-r from-orange-950 to-red-950 border-orange-700 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-xl font-semibold text-white break-words">Spaced Repetition Review</CardTitle>              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-orange-200 break-words text-sm">
                    You have <span className="font-bold text-orange-300">{reviewQueueCount}</span> question
                    {reviewQueueCount !== 1 ? "s" : ""} ready for review
                  </p>
                  <p className="text-xs text-orange-300 break-words">
                    Review questions to strengthen your memory and improve retention
                  </p>
                </div>
                <Button
                  onClick={onStartReviewSession}
                  className="bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white px-6 shadow-sm whitespace-nowrap flex-shrink-0 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Start Review Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Progress - Redesigned */}
        <Card className="bg-gradient-to-r from-slate-950 to-gray-950 border-gray-800 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-white">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar Section */}
            <div>
              <ProgressBar
                current={totalAnswered}
                total={totalQuestions}
                variant={totalAnswered === totalQuestions ? "success" : "default"}
                showText={true}
                label="Questions Completed"
                showPercentage={true}
              />
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Chapters */}
              <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="bg-blue-700/20 p-2 rounded-lg w-fit">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Chapters</div>
                  <div className="text-2xl font-bold text-white tabular-nums">{module.chapters.length}</div>
                </div>
              </div>

              {/* Total Questions */}
              <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="bg-purple-700/20 p-2 rounded-lg w-fit">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Total Questions</div>
                  <div className="text-2xl font-bold text-white tabular-nums">{totalQuestions}</div>
                </div>
              </div>

              {/* Answered */}
              <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="bg-green-700/20 p-2 rounded-lg w-fit">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Answered</div>
                  <div className="text-2xl font-bold text-white tabular-nums">{totalAnswered}</div>
                </div>
              </div>

              {/* Accuracy */}
              <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="bg-yellow-700/20 p-2 rounded-lg w-fit">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Accuracy</div>
                  <div
                    className={`text-2xl font-bold tabular-nums ${overallAccuracy >= 70 ? "text-green-400" : "text-yellow-400"}`}
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
          <h2 className="text-xl font-semibold text-white mb-4">Chapters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-fr">
            {module.chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} onStartQuiz={onStartQuiz} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
