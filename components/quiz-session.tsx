"use client"
import { useState, useEffect, useRef, useMemo } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TextRenderer } from "./text-renderer"
import { OptionCard } from "./option-card"
import { QuestionNavigationMenu } from "./question-navigation-menu"
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Clock,
  Brain,
  Download,
  Upload,
  RotateCcw,
  Edit,
  Plus,
  Home,
  List,
} from "lucide-react"
import type {
  QuizChapter,
  QuizQuestion,
  DisplayedOption,
  SrsProgressCounts,
  SessionHistoryEntry,
  QuizModule,
} from "@/types/quiz-types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { QuestionEditor } from "./question-editor"
import { CircularProgress } from "@/components/ui/circular-progress"
import { ProgressBar } from "./progress-bar"

interface QuizSessionProps {
  chapter: QuizChapter
  question: QuizQuestion
  currentQuestionIndex: number
  totalQuestions: number
  selectedOptionId: string | null
  isSubmitted: boolean
  isReviewSession?: boolean
  srsProgressCounts?: SrsProgressCounts
  currentModule?: QuizModule
  // Session History Navigation Props
  sessionHistory?: SessionHistoryEntry[]
  currentHistoryViewIndex?: number | null
  // Edit Mode Props - Phase 1
  isEditModeActive?: boolean
  editingQuestionData?: QuizQuestion | null
  onSetEditMode?: (question: QuizQuestion | null) => void
  onSaveQuestion?: (question: QuizQuestion) => void
  onDeleteQuestion?: (questionId: string) => void
  generateUniqueQuestionId?: (chapterId: string) => string
  generateUniqueOptionId?: (questionId: string, existingOptionIds: string[]) => string
  onSelectOption: (optionId: string) => void
  onSubmitAnswer: (displayedOptions: DisplayedOption[]) => void
  onNextQuestion: () => void
  onBackToDashboard: () => void
  onExportCurrentQuestionState: () => void
  onImportQuestionStateFromFile: (file: File) => void
  onRetryChapter: () => void
  onNavigateToQuestion: (questionIndex: number) => void
  // Session History Navigation Handlers
  onViewPrevious?: () => void
  onViewNextInHistory?: () => void
  // NEW: All Questions View Handler
  onViewAllQuestions?: () => void
}

export function QuizSession({
  chapter,
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedOptionId,
  isSubmitted,
  isReviewSession = false,
  srsProgressCounts,
  currentModule,
  sessionHistory = [],
  currentHistoryViewIndex = null,
  // Edit Mode Props - Phase 1
  isEditModeActive = false,
  editingQuestionData = null,
  onSetEditMode,
  onSaveQuestion,
  onDeleteQuestion,
  generateUniqueQuestionId,
  generateUniqueOptionId,
  onSelectOption,
  onSubmitAnswer,
  onNextQuestion,
  onBackToDashboard,
  onExportCurrentQuestionState,
  onImportQuestionStateFromFile,
  onRetryChapter,
  onNavigateToQuestion,
  onViewPrevious,
  onViewNextInHistory,
  onViewAllQuestions,
}: QuizSessionProps) {
  const [displayedOptionsCache, setDisplayedOptionsCache] = useState<DisplayedOption[]>([])
  const [targetCorrectOptionForFeedback, setTargetCorrectOptionForFeedback] = useState<string | null>(null)

  const importFileInputRef = useRef<HTMLInputElement>(null)

  // FIXED: Correctly access props for history state
  const isViewingHistoricalEntry =
    typeof currentHistoryViewIndex === "number" &&
    currentHistoryViewIndex >= 0 &&
    sessionHistory &&
    sessionHistory.length > 0 &&
    currentHistoryViewIndex < sessionHistory.length

  const historicalEntry = isViewingHistoricalEntry ? sessionHistory[currentHistoryViewIndex] : null

  // Use historical data when viewing history, otherwise use live data
  const displayQuestion = historicalEntry ? historicalEntry.questionSnapshot : question
  const displaySelectedOptionId = historicalEntry ? historicalEntry.selectedOptionId : selectedOptionId
  const displayIsSubmitted = historicalEntry ? true : isSubmitted // Historical entries are always "submitted"
  const displayDisplayedOptions = historicalEntry ? historicalEntry.displayedOptions : displayedOptionsCache

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImportQuestionStateFromFile(file)
    }
    if (importFileInputRef.current) {
      importFileInputRef.current.value = "" // Reset file input
    }
  }

  const triggerImportFileInput = () => {
    importFileInputRef.current?.click()
  }

  console.log("Quiz Session - isSubmitted:", displayIsSubmitted)
  console.log("Quiz Session - question:", displayQuestion.questionId)
  console.log("Quiz Session - isViewingHistoricalEntry:", isViewingHistoricalEntry)

  // FIXED: Stable display options for historical view
  useEffect(() => {
    if (isViewingHistoricalEntry && historicalEntry) {
      // Use historical displayed options directly
      setDisplayedOptionsCache(historicalEntry.displayedOptions)
      setTargetCorrectOptionForFeedback(null) // Not relevant for historical views
      console.log(`Using historical options for question: ${historicalEntry.questionSnapshot.questionId}`)
      return
    }

    // Generate options only for live questions (not historical)
    console.log(`=== Generating options for live question: ${question.questionId} ===`)

    const generateDisplayedOptions = (): DisplayedOption[] => {
      const maxDisplayOptions = 5
      const correctOptions = question.options.filter((opt) => question.correctOptionIds.includes(opt.optionId))
      const incorrectOptions = question.options.filter((opt) => !question.correctOptionIds.includes(opt.optionId))

      const shownIncorrectIds = question.shownIncorrectOptionIds || []
      const unshownIncorrectOptions = incorrectOptions.filter((opt) => !shownIncorrectIds.includes(opt.optionId))
      const shownIncorrectOptions = incorrectOptions.filter((opt) => shownIncorrectIds.includes(opt.optionId))

      const selectedOptions: DisplayedOption[] = []

      if (correctOptions.length > 0) {
        const correctIndex = question.srsLevel ? question.srsLevel % correctOptions.length : 0
        const selectedCorrectOption = correctOptions[correctIndex] || correctOptions[0]
        selectedOptions.push({
          ...selectedCorrectOption,
          isCorrect: true,
        })
      }

      const remainingSlots = maxDisplayOptions - selectedOptions.length

      const shuffledUnshown = [...unshownIncorrectOptions].sort(() => Math.random() - 0.5)
      for (let i = 0; i < Math.min(remainingSlots, shuffledUnshown.length); i++) {
        selectedOptions.push({
          ...shuffledUnshown[i],
          isCorrect: false,
        })
      }

      const remainingSlotsAfterUnshown = maxDisplayOptions - selectedOptions.length
      if (remainingSlotsAfterUnshown > 0 && shownIncorrectOptions.length > 0) {
        const shuffledShown = [...shownIncorrectOptions].sort(() => Math.random() - 0.5)
        for (let i = 0; i < Math.min(remainingSlotsAfterUnshown, shuffledShown.length); i++) {
          selectedOptions.push({
            ...shuffledShown[i],
            isCorrect: false,
          })
        }
      }

      const remainingSlotsAfterIncorrect = maxDisplayOptions - selectedOptions.length
      const remainingCorrect = correctOptions.filter(
        (opt) => !selectedOptions.some((selected) => selected.optionId === opt.optionId),
      )

      for (let i = 0; i < Math.min(remainingSlotsAfterIncorrect, remainingCorrect.length); i++) {
        selectedOptions.push({
          ...remainingCorrect[i],
          isCorrect: true,
        })
      }

      const finalOptions = selectedOptions.sort(() => Math.random() - 0.5)

      console.log(`Generated ${finalOptions.length} options for display:`)
      finalOptions.forEach((opt, index) => {
        console.log(`  ${index + 1}. ${opt.optionId} (${opt.isCorrect ? "CORRECT" : "incorrect"})`)
      })

      return finalOptions
    }

    const newDisplayedOptions = generateDisplayedOptions()
    setDisplayedOptionsCache(newDisplayedOptions)
    setTargetCorrectOptionForFeedback(null)

    console.log(`Options cached for question ${question.questionId} - will remain stable during feedback`)
  }, [question.questionId, isViewingHistoricalEntry, historicalEntry])

  // FIXED: Accurate feedback for historical answers
  const getOptionDisplayState = (option: DisplayedOption) => {
    if (isViewingHistoricalEntry && historicalEntry) {
      // Historical view logic
      const isSelected = historicalEntry.selectedOptionId === option.optionId
      const userWasCorrect = historicalEntry.isCorrect
      const optionIsActuallyCorrect = historicalEntry.questionSnapshot.correctOptionIds.includes(option.optionId)

      if (isSelected) {
        return {
          isSelected: true,
          showAsCorrect: userWasCorrect,
          showAsIncorrect: !userWasCorrect,
        }
      } else {
        // Not selected by user - highlight correct answer if user was wrong
        return {
          isSelected: false,
          showAsCorrect: !userWasCorrect && optionIsActuallyCorrect,
          showAsIncorrect: false,
        }
      }
    }

    // Live question logic (existing)
    if (!displayIsSubmitted) {
      return {
        isSelected: displaySelectedOptionId === option.optionId,
        showAsCorrect: false,
        showAsIncorrect: false,
      }
    }

    const isSelected = displaySelectedOptionId === option.optionId
    const isCorrectOption = displayQuestion.correctOptionIds.includes(option.optionId)
    const selectedWasCorrect = displaySelectedOptionId
      ? displayQuestion.correctOptionIds.includes(displaySelectedOptionId)
      : false

    if (selectedWasCorrect) {
      return {
        isSelected,
        showAsCorrect: isSelected && isCorrectOption,
        showAsIncorrect: false,
      }
    } else {
      if (isSelected) {
        return {
          isSelected,
          showAsCorrect: false,
          showAsIncorrect: true,
        }
      } else if (option.optionId === targetCorrectOptionForFeedback) {
        return {
          isSelected: false,
          showAsCorrect: true,
          showAsIncorrect: false,
        }
      } else {
        return {
          isSelected: false,
          showAsCorrect: false,
          showAsIncorrect: false,
        }
      }
    }
  }

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isViewingHistoricalEntry) return

    // Add validation for correctOptionIds
    if (!question.correctOptionIds || !Array.isArray(question.correctOptionIds)) {
      console.error("Question missing correctOptionIds:", question.questionId)
      return
    }

    console.log(`=== Submitting answer for question: ${question.questionId} ===`)
    console.log(`Selected option: ${selectedOptionId}`)
    console.log(
      `Options being submitted:`,
      displayedOptionsCache.map((opt) => opt.optionId),
    )

    const selectedWasCorrect = question.correctOptionIds.includes(selectedOptionId)
    if (!selectedWasCorrect) {
      const displayedCorrectOptions = displayedOptionsCache.filter((opt) =>
        question.correctOptionIds.includes(opt.optionId),
      )

      if (displayedCorrectOptions.length > 0) {
        const targetOption =
          question.correctOptionIds.find((correctId) =>
            displayedCorrectOptions.some((displayed) => displayed.optionId === correctId),
          ) || displayedCorrectOptions[0].optionId

        setTargetCorrectOptionForFeedback(targetOption)
        console.log(`Set target correct option for feedback: ${targetOption}`)
      } else {
        setTargetCorrectOptionForFeedback(question.correctOptionIds[0])
        console.log(`Fallback target correct option: ${question.correctOptionIds[0]}`)
      }
    }

    onSubmitAnswer(displayedOptionsCache)
  }

  const processExplanationText = (explanationText: string): string => {
    let processedText = explanationText

    // First, handle option IDs wrapped in <code> tags (existing functionality)
    processedText = processedText.replace(/<code>(.*?)<\/code>/g, (match, optionId) => {
      const option = displayQuestion.options.find((opt) => opt.optionId === optionId)
      if (option) {
        return `<code>${option.optionText}</code>`
      } else {
        console.warn(`Option ID ${optionId} not found in question ${displayQuestion.questionId}`)
        return match
      }
    })

    // Then, replace any bare option IDs with their corresponding option text
    // This handles option IDs that appear directly in the explanation text
    displayQuestion.options.forEach((option) => {
      const optionIdPattern = new RegExp(`\\b${option.optionId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")

      processedText = processedText.replace(optionIdPattern, (match) => {
        // Check if this option ID is the currently selected option
        const isSelectedOption = displaySelectedOptionId === option.optionId

        if (isSelectedOption) {
          // Highlight the selected option text
          return `<strong class="text-blue-300">"${option.optionText}"</strong>`
        } else {
          // Regular option text replacement
          return `"${option.optionText}"`
        }
      })
    })

    return processedText
  }

  // Enhanced chapter name parsing for better formatting
  const parseChapterName = (name: string) => {
    // Match patterns like "Chapter X:" or "Chapter XX:" at the beginning
    const chapterMatch = name.match(/^(Chapter\s+\d+):\s*(.*)$/i)

    if (chapterMatch) {
      return {
        chapterNumber: chapterMatch[1], // e.g., "Chapter 1"
        chapterTitle: chapterMatch[2].trim(), // e.g., "Fundamentals of Algorithms & Complexity"
        hasChapterNumber: true,
      }
    }

    // Fallback for names that don't follow the "Chapter X:" pattern
    return {
      chapterNumber: "",
      chapterTitle: name,
      hasChapterNumber: false,
    }
  }

  const getHeaderTitle = () => {
    if (isReviewSession) {
      return `Review Session`
    }
    return parseChapterName(chapter.name)
  }

  const getProgressInfo = () => {
    if (isReviewSession) {
      return ""
    }
    return "Chapter Progress"
  }

  const headerInfo = getHeaderTitle()

  // FIXED: Navigation button visibility and state logic using props
  const canViewPrevious = isViewingHistoricalEntry || (isSubmitted && sessionHistory && sessionHistory.length > 0)

  const canViewNextInHistory =
    isViewingHistoricalEntry && currentHistoryViewIndex !== null && currentHistoryViewIndex < sessionHistory.length - 1

  const shouldShowNextQuestion =
    (!isViewingHistoricalEntry && isSubmitted) ||
    (isViewingHistoricalEntry &&
      currentHistoryViewIndex !== null &&
      currentHistoryViewIndex === sessionHistory.length - 1)

  // Calculate progress and score percentages
  const progressPercentage = useMemo(() => {
    return totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0
  }, [currentQuestionIndex, totalQuestions])

  const scorePercentage = useMemo(() => {
    if (!currentModule) return 0
    const currentChapter = currentModule.chapters.find((c) => c.id === chapter.id)
    if (!currentChapter) return 0
    return currentChapter.totalQuestions > 0
      ? Math.round((currentChapter.correctAnswers / currentChapter.totalQuestions) * 100)
      : 0
  }, [currentModule, chapter.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-gray-950">
      {/* Fixed Progress and Score Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border-b border-slate-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Progress Section */}
            <div className="flex items-center gap-3 flex-1">
              
              <span className="font-medium text-blue-300 min-w-[3rem] text-lg text-right">{progressPercentage}%</span>
              <ProgressBar
                current={currentQuestionIndex + 1}
                total={totalQuestions}
                variant="default"
                showText={false}
                showPercentage={false}
                className="flex-1 h-2"
              />
            </div>

            {/* Score Section */}
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span className="text-sm font-medium text-green-300 whitespace-nowrap">Score:</span>
              <CircularProgress value={scorePercentage} size={32} className="text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-8 sm:pt-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Enhanced Header with improved formatting */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  {isReviewSession ? (
                    <div>
                      <h1 className="text-3xl font-bold text-white leading-tight break-words hyphens-auto">
                        Review Session
                      </h1>
                      <div className="mt-2">
                        {/* Display the chapter name for the current review question */}
                        {(() => {
                          // Get chapter name for display
                          const chapterNameForDisplay =
                            isViewingHistoricalEntry && historicalEntry
                              ? currentModule?.chapters.find((c) => c.id === historicalEntry.chapterId)?.name ||
                                chapter.name
                              : chapter.name

                          const parsedChapterName = parseChapterName(chapterNameForDisplay)

                          if (parsedChapterName.hasChapterNumber) {
                            return (
                              <div>
                                <div className="text-lg text-orange-300 font-medium break-words">
                                  {parsedChapterName.chapterNumber}
                                </div>
                                <div className="text-xl text-orange-200 mt-1 break-words font-medium leading-tight">
                                  {parsedChapterName.chapterTitle}
                                </div>
                              </div>
                            )
                          } else {
                            return (
                              <p className="text-lg text-orange-300 mt-1 break-words font-medium">
                                {parsedChapterName.chapterTitle}
                              </p>
                            )
                          }
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {typeof headerInfo === "object" && headerInfo.hasChapterNumber ? (
                        <div>
                          <div className="text-xl font-semibold text-blue-300 break-words hyphens-auto">
                            {headerInfo.chapterNumber}
                          </div>
                          <h1 className="text-3xl font-bold text-white mt-1 leading-tight break-words hyphens-auto">
                            {headerInfo.chapterTitle}
                          </h1>
                        </div>
                      ) : (
                        <h1 className="text-3xl font-bold text-white leading-tight break-words hyphens-auto">
                          {typeof headerInfo === "string" ? headerInfo : chapter.name}
                        </h1>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-400 break-words text-base">{getProgressInfo()}</p>
              {isReviewSession && displayQuestion.srsLevel !== undefined && displayQuestion.srsLevel > 0 && (
                <p className="text-sm text-blue-400 mt-2">SRS Level: {displayQuestion.srsLevel}</p>
              )}
            </div>

            <TooltipProvider>
              <div className="flex gap-2">
                {/* NEW: View All Questions Button */}
                {onViewAllQuestions && !isReviewSession && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={onViewAllQuestions}
                        variant="outline"
                        size="sm"
                        className="border-purple-700 bg-purple-900/40 text-purple-200 hover:bg-purple-800/50 hover:text-white hover:border-purple-600 active:bg-purple-800/80 transition-all duration-200 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-purple-500 w-10 h-10 p-0"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View All Questions</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Retry Chapter Button - Only visible for regular quizzes */}
                {!isReviewSession && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={onRetryChapter}
                        variant="outline"
                        size="sm"
                        className="border-orange-700 bg-orange-900/40 text-orange-200 hover:bg-orange-800/50 hover:text-white hover:border-orange-600 active:bg-orange-800/80 transition-all duration-200 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-orange-500 w-10 h-10 p-0"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Retry Chapter</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onBackToDashboard}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 bg-gray-900/70 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-600 active:bg-gray-800/80 transition-all duration-200 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-gray-500 w-10 h-10 p-0"
                    >
                      <Home className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Return to Dashboard</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* Anki-style Progress Bars - Enhanced spacing */}
          {isReviewSession && srsProgressCounts && (
            <Card className="bg-gradient-to-r from-indigo-950 to-purple-950 border-indigo-700 backdrop-blur-sm shadow-sm mb-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2 flex-wrap">
                  <Brain className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span className="break-words">Review Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-red-300 flex items-center gap-1 min-w-0 flex-1">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">New/Lapsing (Due Now)</span>
                      </span>
                      <span className="text-sm text-red-200 tabular-nums flex-shrink-0">
                        {srsProgressCounts.newOrLapsingDue}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-300 bg-yellow-500"
                        style={{
                          width: `${srsProgressCounts.totalNonMastered > 0 ? (srsProgressCounts.newOrLapsingDue / srsProgressCounts.totalNonMastered) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-blue-300 flex items-center gap-1 min-w-0 flex-1">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">Learning Pipeline</span>
                      </span>
                      <span className="text-sm text-blue-200 tabular-nums flex-shrink-0">
                        {srsProgressCounts.learningReviewDue}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-300 bg-blue-500"
                        style={{
                          width: `${srsProgressCounts.totalNonMastered > 0 ? (srsProgressCounts.learningReviewDue / srsProgressCounts.totalNonMastered) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-indigo-800">
                  <span className="text-sm text-indigo-200 break-words">
                    Active Workload: {srsProgressCounts.newOrLapsingDue + srsProgressCounts.learningReviewDue} of{" "}
                    {srsProgressCounts.totalNonMastered} non-mastered
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question Navigation Menu - Replaces the old progress bar for regular quizzes */}
          <QuestionNavigationMenu
            questions={chapter.questions}
            currentQuestionIndex={currentQuestionIndex}
            sessionHistory={sessionHistory}
            currentHistoryViewIndex={currentHistoryViewIndex}
            onNavigateToQuestion={onNavigateToQuestion}
            isReviewSession={isReviewSession}
          />

          {/* Question Card - Enhanced styling */}
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg break-words">
                {isReviewSession ? `Review Question` : `Question ${currentQuestionIndex + 1}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <TextRenderer
                  content={displayQuestion.questionText}
                  className="text-white text-lg leading-relaxed break-words"
                />
              </div>
            </CardContent>
          </Card>

          {/* Options - Clean layout */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white break-words">Choose your answer:</h3>
            <div className="space-y-3">
              {displayDisplayedOptions.map((option) => {
                const displayState = getOptionDisplayState(option)
                return (
                  <OptionCard
                    key={option.optionId}
                    option={option}
                    isSelected={displayState.isSelected}
                    showAsCorrect={displayState.showAsCorrect}
                    showAsIncorrect={displayState.showAsIncorrect}
                    isSubmitted={displayIsSubmitted}
                    onSelect={() => onSelectOption(option.optionId)}
                    disabled={displayIsSubmitted || isViewingHistoricalEntry}
                  />
                )
              })}
            </div>
          </div>

          {/* Explanation - Enhanced styling */}
          {displayIsSubmitted && (
            <Card className="bg-gradient-to-r from-slate-900 to-slate-950 border-slate-700 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-200 text-lg">Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <TextRenderer
                    key={`explanation-${displayQuestion.questionId}-${displayIsSubmitted}`}
                    content={processExplanationText(displayQuestion.explanationText)}
                    className="text-white leading-relaxed text-base break-words"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons - Enhanced with history navigation */}
          <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-4 pt-4">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              {/* Import/Export Question State Buttons - Only show for live questions */}
              {!isViewingHistoricalEntry && (
                <TooltipProvider>
                  <div className="flex gap-2">
                    <input
                      ref={importFileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportFileSelect}
                      className="hidden"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={onExportCurrentQuestionState}
                          variant="outline"
                          size="sm"
                          className="border-green-700 bg-green-900/40 text-green-200 hover:bg-green-800/50 hover:text-white hover:border-green-600 transition-all duration-200 w-10 h-10 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Export current question state to JSON file</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={triggerImportFileInput}
                          variant="outline"
                          size="sm"
                          className="border-purple-700 bg-purple-900/40 text-purple-200 hover:bg-purple-800/50 hover:text-white hover:border-purple-600 transition-all duration-200 w-10 h-10 p-0"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Import question(s) from JSON file</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Edit Mode Buttons - Phase 1 */}
                    {onSetEditMode && onSaveQuestion && onDeleteQuestion && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => onSetEditMode(displayQuestion)}
                              variant="outline"
                              size="sm"
                              className="border-yellow-700 bg-yellow-900/40 text-yellow-200 hover:bg-yellow-800/50 hover:text-white hover:border-yellow-600 transition-all duration-200 w-10 h-10 p-0"
                              disabled={isEditModeActive}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit current question</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => {
                                if (generateUniqueQuestionId) {
                                  const newQuestionId = generateUniqueQuestionId(chapter.id)
                                  const newQuestion: QuizQuestion = {
                                    questionId: newQuestionId,
                                    questionText: "",
                                    options: [],
                                    correctOptionIds: [],
                                    explanationText: "",
                                    status: "not_attempted",
                                    timesAnsweredCorrectly: 0,
                                    timesAnsweredIncorrectly: 0,
                                    historyOfIncorrectSelections: [],
                                    srsLevel: 0,
                                    nextReviewAt: null,
                                    shownIncorrectOptionIds: [],
                                  }
                                  onSetEditMode(newQuestion)
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="border-cyan-700 bg-cyan-900/40 text-cyan-200 hover:bg-cyan-800/50 hover:text-white hover:border-cyan-600 transition-all duration-200 w-10 h-10 p-0"
                              disabled={isEditModeActive}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add new question</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </TooltipProvider>
              )}

              {/* FIXED: Previous Answer Button */}
              {canViewPrevious && onViewPrevious && (
                <Button
                  onClick={onViewPrevious}
                  disabled={isViewingHistoricalEntry && currentHistoryViewIndex === 0}
                  variant="outline"
                  className="border-gray-700 bg-gray-900/40 text-gray-200 hover:bg-gray-800/50 hover:text-white hover:border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Answer
                </Button>
              )}

              {/* Submit Answer Button - Only for live questions */}
              {!displayIsSubmitted && !isViewingHistoricalEntry && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId}
                  className="bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white px-6 shadow-sm whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Answer
                </Button>
              )}

              {/* FIXED: Next Answer Button (for history navigation) */}
              {canViewNextInHistory && onViewNextInHistory && (
                <Button
                  onClick={onViewNextInHistory}
                  className="bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white px-6 shadow-sm whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                >
                  Next Answer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {/* FIXED: Next Question Button - For advancing to actual next question */}
              {shouldShowNextQuestion && (
                <Button
                  onClick={onNextQuestion}
                  className="bg-green-700 hover:bg-green-800 active:bg-green-900 text-white px-6 shadow-sm whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                >
                  {isReviewSession ? "Next Review" : "Next Question"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/*
                  />
                </Button>
              )}
            </div>
          </div>

          {/* Question Editor Modal - Phase 2 */}
          {isEditModeActive && editingQuestionData && onSetEditMode && onSaveQuestion && onDeleteQuestion && (
            <QuestionEditor
              isOpen={isEditModeActive}
              question={editingQuestionData}
              chapterId={chapter.id}
              onSave={onSaveQuestion}
              onCancel={() => onSetEditMode(null)}
              onDelete={onDeleteQuestion}
              generateUniqueOptionId={generateUniqueOptionId}
            />
          )}
        </div>
      </div>
    </div>
  )
}
