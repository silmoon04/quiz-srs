"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "./progress-bar"
import { BookOpen, CheckCircle, PlayCircle } from "lucide-react"

interface ChapterCardProps {
  chapter: {
    id: string
    name: string
    description?: string
    totalQuestions: number
    answeredQuestions: number
    correctAnswers: number
    isCompleted: boolean
  }
  onStartQuiz: (chapterId: string) => void
}

export function ChapterCard({ chapter, onStartQuiz }: ChapterCardProps) {
  const accuracy =
    chapter.answeredQuestions > 0 ? Math.round((chapter.correctAnswers / chapter.answeredQuestions) * 100) : 0

  const getButtonText = () => {
    if (chapter.isCompleted) return "Review Quiz"
    if (chapter.answeredQuestions > 0) return "Continue Quiz"
    return "Start Quiz"
  }

  const getButtonIcon = () => {
    if (chapter.isCompleted) return <CheckCircle className="w-4 h-4" />
    return <PlayCircle className="w-4 h-4" />
  }

  // Parse chapter name to separate prefix from main title
  const parseChapterName = (name: string) => {
    const nameParts = name.split(/:\s*(.*)/s) // Splits on the first ": "
    const prefix = nameParts.length > 1 ? nameParts[0] + ":" : ""
    const mainTitle = nameParts.length > 1 ? nameParts[1] : name
    return { prefix, mainTitle }
  }

  const { prefix, mainTitle } = parseChapterName(chapter.name)

  return (
    <Card
      className={`
        bg-gradient-to-r backdrop-blur-sm shadow-sm h-full flex flex-col transition-all duration-200 
        hover:shadow-md hover:border-gray-700 active:scale-[0.98]
        ${
          chapter.isCompleted
            ? "from-slate-900 to-green-950 border-green-700/70"
            : "from-slate-950 to-gray-950 border-gray-800 hover:from-slate-900 hover:to-gray-900"
        }
      `}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg leading-tight break-words hyphens-auto line-clamp-2">
              {prefix && <span className="text-gray-400 font-medium opacity-80 mr-1">{prefix}</span>}
              <span className="text-white font-semibold">{mainTitle}</span>
            </CardTitle>
          </div>
          <div className="flex-shrink-0">
            <BookOpen className="w-5 h-5 text-gray-500" />
          </div>
        </div>
        {chapter.description && (
          <p className="text-xs text-gray-400 mt-2 leading-relaxed break-words hyphens-auto line-clamp-3">
            {chapter.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Flexible content area that pushes progress section to bottom */}
        <div className="flex-1" />

        {/* Fixed progress section at bottom */}
        <div className="space-y-3">
          {/* Progress bar with consistent positioning */}
          <div>
            <ProgressBar
              current={chapter.answeredQuestions}
              total={chapter.totalQuestions}
              variant={chapter.isCompleted ? "success" : "default"}
              compact={true}
              showPercentage={true}
            />
          </div>

          {/* Progress info and accuracy in aligned container */}
          <div className="flex justify-between items-center text-sm min-h-[1.25rem]">
            <span className="text-gray-400 whitespace-nowrap">
              {chapter.answeredQuestions} of {chapter.totalQuestions} questions completed
            </span>
            {chapter.answeredQuestions > 0 ? (
              <span className="text-gray-300 whitespace-nowrap ml-2">
                Accuracy: <span className={accuracy >= 70 ? "text-green-400" : "text-yellow-400"}>{accuracy}%</span>
              </span>
            ) : (
              <span className="text-transparent whitespace-nowrap ml-2">Accuracy: 0%</span>
            )}
          </div>

          {/* Button with consistent positioning */}
          <Button
            onClick={() => onStartQuiz(chapter.id)}
            className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            size="sm"
          >
            {getButtonIcon()}
            <span className="ml-1 truncate">{getButtonText()}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
