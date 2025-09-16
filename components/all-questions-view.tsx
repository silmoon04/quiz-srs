"use client"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TextRenderer } from "./text-renderer"
import { OptionCard } from "./option-card"
import { ProgressBar } from "./progress-bar"
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, EyeOff, RotateCcw, Home, Brain } from "lucide-react"
import type { QuizChapter, QuizQuestion, DisplayedOption } from "@/types/quiz-types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CircularProgress } from "@/components/ui/circular-progress"

interface AllQuestionsViewProps {
  chapter: QuizChapter
  onBackToQuiz: () => void
  onBackToDashboard: () => void
  onRetryChapter: () => void
  isReviewSession?: boolean
}

interface QuestionState {
  selectedOptionId: string | null
  isSubmitted: boolean
  isCorrect: boolean | null
  displayedOptions: DisplayedOption[]
}

export function AllQuestionsView({
  chapter,
  onBackToQuiz,
  onBackToDashboard,
  onRetryChapter,
  isReviewSession = false,
}: AllQuestionsViewProps) {
  // State for each question's answers and submission status
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({})

  // Toggle for showing/hiding answers
  const [showAnswers, setShowAnswers] = useState(false)

  // Initialize question states and generate displayed options for each question
  useEffect(() => {
    const initialStates: Record<string, QuestionState> = {}

    chapter.questions.forEach((question) => {
      // Generate displayed options for each question (similar to quiz session logic)
      const displayedOptions = generateDisplayedOptionsForQuestion(question)

      initialStates[question.questionId] = {
        selectedOptionId: null,
        isSubmitted: false,
        isCorrect: null,
        displayedOptions,
      }
    })

    setQuestionStates(initialStates)
  }, [chapter.questions])

  // Generate displayed options for a question (simplified version of quiz logic)
  const generateDisplayedOptionsForQuestion = (question: QuizQuestion): DisplayedOption[] => {
    const maxDisplayOptions = 5
    const correctOptions = question.options.filter((opt) => question.correctOptionIds.includes(opt.optionId))
    const incorrectOptions = question.options.filter((opt) => !question.correctOptionIds.includes(opt.optionId))

    const selectedOptions: DisplayedOption[] = []

    // Add at least one correct option
    if (correctOptions.length > 0) {
      const correctIndex = question.srsLevel ? question.srsLevel % correctOptions.length : 0
      const selectedCorrectOption = correctOptions[correctIndex] || correctOptions[0]
      selectedOptions.push({
        ...selectedCorrectOption,
        isCorrect: true,
      })
    }

    // Fill remaining slots with incorrect options
    const remainingSlots = maxDisplayOptions - selectedOptions.length
    const shuffledIncorrect = [...incorrectOptions].sort(() => Math.random() - 0.5)

    for (let i = 0; i < Math.min(remainingSlots, shuffledIncorrect.length); i++) {
      selectedOptions.push({
        ...shuffledIncorrect[i],
        isCorrect: false,
      })
    }

    // Add more correct options if we have space
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

    // Shuffle final options
    return selectedOptions.sort(() => Math.random() - 0.5)
  }

  // Calculate real-time score percentage
  const scoreData = useMemo(() => {
    const submittedQuestions = Object.values(questionStates).filter((state) => state.isSubmitted)
    const correctAnswers = submittedQuestions.filter((state) => state.isCorrect).length
    const totalQuestions = chapter.questions.length
    const answeredQuestions = submittedQuestions.length

    const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    const progressPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

    return {
      correctAnswers,
      totalQuestions,
      answeredQuestions,
      scorePercentage,
      progressPercentage,
    }
  }, [questionStates, chapter.questions.length])

  // Handle option selection for a specific question
  const handleSelectOption = (questionId: string, optionId: string) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: optionId,
      },
    }))
  }

  // Handle answer submission for a specific question
  const handleSubmitAnswer = (questionId: string) => {
    const questionState = questionStates[questionId]
    if (!questionState?.selectedOptionId) return

    const question = chapter.questions.find((q) => q.questionId === questionId)
    if (!question) return

    const isCorrect = question.correctOptionIds.includes(questionState.selectedOptionId)

    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isSubmitted: true,
        isCorrect,
      },
    }))
  }

  // Get option display state for feedback
  const getOptionDisplayState = (questionId: string, option: DisplayedOption) => {
    const questionState = questionStates[questionId]
    const question = chapter.questions.find((q) => q.questionId === questionId)

    if (!questionState || !question) {
      return {
        isSelected: false,
        showAsCorrect: false,
        showAsIncorrect: false,
      }
    }

    if (!questionState.isSubmitted && !showAnswers) {
      return {
        isSelected: questionState.selectedOptionId === option.optionId,
        showAsCorrect: false,
        showAsIncorrect: false,
      }
    }

    // Show answers mode or submitted state
    const isSelected = questionState.selectedOptionId === option.optionId
    const isCorrectOption = question.correctOptionIds.includes(option.optionId)
    const selectedWasCorrect = questionState.isCorrect

    if (showAnswers) {
      // In show answers mode, highlight all correct options
      return {
        isSelected,
        showAsCorrect: isCorrectOption,
        showAsIncorrect: isSelected && !isCorrectOption,
      }
    }

    // Normal submitted state logic
    if (selectedWasCorrect) {
      return {
        isSelected,
        showAsCorrect: isSelected && isCorrectOption,
        showAsIncorrect: false,
      }
    } else {
      return {
        isSelected,
        showAsCorrect: !isSelected && isCorrectOption,
        showAsIncorrect: isSelected && !isCorrectOption,
      }
    }
  }

  // Process explanation text to replace option IDs with option text
  const processExplanationText = (question: QuizQuestion, questionId: string): string => {
    let processedText = question.explanationText
    const questionState = questionStates[questionId]

    // Replace option IDs in <code> tags
    processedText = processedText.replace(/<code>(.*?)<\/code>/g, (match, optionId) => {
      const option = question.options.find((opt) => opt.optionId === optionId)
      if (option) {
        return `<code>${option.optionText}</code>`
      }
      return match
    })

    // Replace bare option IDs with option text
    question.options.forEach((option) => {
      const optionIdPattern = new RegExp(`\\b${option.optionId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")

      processedText = processedText.replace(optionIdPattern, (match) => {
        const isSelectedOption = questionState?.selectedOptionId === option.optionId

        if (isSelectedOption) {
          return `<strong class="text-blue-300">"${option.optionText}"</strong>`
        } else {
          return `"${option.optionText}"`
        }
      })
    })

    return processedText
  }

  // Reset all answers
  const handleResetAllAnswers = () => {
    const resetStates: Record<string, QuestionState> = {}

    chapter.questions.forEach((question) => {
      resetStates[question.questionId] = {
        selectedOptionId: null,
        isSubmitted: false,
        isCorrect: null,
        displayedOptions: questionStates[question.questionId]?.displayedOptions || [],
      }
    })

    setQuestionStates(resetStates)
    setShowAnswers(false)
  }

  // Enhanced chapter name parsing
  const parseChapterName = (name: string) => {
    const chapterMatch = name.match(/^(Chapter\s+\d+):\s*(.*)$/i)

    if (chapterMatch) {
      return {
        chapterNumber: chapterMatch[1],
        chapterTitle: chapterMatch[2].trim(),
        hasChapterNumber: true,
      }
    }

    return {
      chapterNumber: "",
      chapterTitle: name,
      hasChapterNumber: false,
    }
  }

  const headerInfo = parseChapterName(chapter.name)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-gray-950">
      {/* Fixed Progress and Score Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border-b border-slate-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Progress Section */}
            <div className="flex items-center gap-3 flex-1">
              <Clock className="w-5 h-5 text-blue-300 flex-shrink-0" />
              <span className="text-sm font-medium text-blue-300 whitespace-nowrap min-w-[3rem] text-right">
                {scoreData.progressPercentage}%
              </span>
              <ProgressBar
                current={scoreData.answeredQuestions}
                total={scoreData.totalQuestions}
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
              <CircularProgress value={scoreData.scorePercentage} size={32} className="text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-8 sm:pt-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  {isReviewSession ? (
                    <div>
                      <h1 className="text-3xl font-bold text-white leading-tight break-words hyphens-auto">
                        Review Session - All Questions
                      </h1>
                      <div className="mt-2">
                        {headerInfo.hasChapterNumber ? (
                          <div>
                            <div className="text-lg text-orange-300 font-medium break-words">
                              {headerInfo.chapterNumber}
                            </div>
                            <div className="text-xl text-orange-200 mt-1 break-words font-medium leading-tight">
                              {headerInfo.chapterTitle}
                            </div>
                          </div>
                        ) : (
                          <p className="text-lg text-orange-300 mt-1 break-words font-medium">
                            {headerInfo.chapterTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {headerInfo.hasChapterNumber ? (
                        <div>
                          <div className="text-xl font-semibold text-blue-300 break-words hyphens-auto">
                            {headerInfo.chapterNumber} - All Questions
                          </div>
                          <h1 className="text-3xl font-bold text-white mt-1 leading-tight break-words hyphens-auto">
                            {headerInfo.chapterTitle}
                          </h1>
                        </div>
                      ) : (
                        <h1 className="text-3xl font-bold text-white leading-tight break-words hyphens-auto">
                          {chapter.name} - All Questions
                        </h1>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-400 break-words text-base">
                Complete overview of all {chapter.questions.length} questions
              </p>
            </div>

            <TooltipProvider>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleResetAllAnswers}
                      variant="outline"
                      size="sm"
                      className="border-orange-700 bg-orange-900/40 text-orange-200 hover:bg-orange-800/50 hover:text-white hover:border-orange-600 transition-all duration-200 w-10 h-10 p-0"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset All Answers</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onBackToDashboard}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 bg-gray-900/70 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-all duration-200 w-10 h-10 p-0"
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

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-4">
            <Button
              onClick={onBackToQuiz}
              variant="outline"
              className="border-gray-700 bg-gray-900/40 text-gray-200 hover:bg-gray-800/50 hover:text-white hover:border-gray-600 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz Navigation
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowAnswers(!showAnswers)}
                variant="outline"
                className={`transition-all duration-200 ${
                  showAnswers
                    ? "border-yellow-600 bg-yellow-900/50 text-yellow-200 hover:bg-yellow-800/60"
                    : "border-gray-700 bg-gray-900/40 text-gray-200 hover:bg-gray-800/50"
                }`}
              >
                {showAnswers ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Answers
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show All Answers
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* All Questions */}
          <div className="space-y-8">
            {chapter.questions.map((question, index) => {
              const questionState = questionStates[question.questionId]
              const isSubmitted = questionState?.isSubmitted || showAnswers

              return (
                <Card
                  key={question.questionId}
                  className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 backdrop-blur-sm shadow-lg"
                >
                  <CardHeader>
                    <CardTitle className="text-white text-lg break-words flex items-center gap-3">
                      <span className="text-blue-400 font-mono text-base">Q{index + 1}</span>
                      {questionState?.isSubmitted && (
                        <div className="flex items-center gap-1">
                          {questionState.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              questionState.isCorrect ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {questionState.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Text */}
                    <div className="prose prose-invert max-w-none">
                      <TextRenderer
                        content={question.questionText}
                        className="text-white text-lg leading-relaxed break-words"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-white break-words">Choose your answer:</h4>
                      <div className="space-y-2">
                        {questionState?.displayedOptions.map((option) => {
                          const displayState = getOptionDisplayState(question.questionId, option)
                          return (
                            <OptionCard
                              key={option.optionId}
                              option={option}
                              isSelected={displayState.isSelected}
                              showAsCorrect={displayState.showAsCorrect}
                              showAsIncorrect={displayState.showAsIncorrect}
                              isSubmitted={isSubmitted}
                              onSelect={() => handleSelectOption(question.questionId, option.optionId)}
                              disabled={isSubmitted}
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* Submit Button */}
                    {!isSubmitted && !showAnswers && (
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleSubmitAnswer(question.questionId)}
                          disabled={!questionState?.selectedOptionId}
                          className="bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white px-6 shadow-sm transition-all duration-200"
                        >
                          Submit Answer
                        </Button>
                      </div>
                    )}

                    {/* Explanation */}
                    {isSubmitted && (
                      <Card className="bg-gradient-to-r from-slate-900 to-slate-950 border-slate-700 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-slate-200 text-base">Explanation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-invert max-w-none">
                            <TextRenderer
                              content={processExplanationText(question, question.questionId)}
                              className="text-white leading-relaxed text-sm break-words"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-4 pt-8 border-t border-slate-700">
            <Button
              onClick={onBackToQuiz}
              variant="outline"
              className="border-gray-700 bg-gray-900/40 text-gray-200 hover:bg-gray-800/50 hover:text-white hover:border-gray-600 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz Navigation
            </Button>

            <div className="flex gap-2">
              {!isReviewSession && (
                <Button
                  onClick={onRetryChapter}
                  variant="outline"
                  className="border-orange-700 bg-orange-900/40 text-orange-200 hover:bg-orange-800/50 hover:text-white hover:border-orange-600 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Chapter
                </Button>
              )}

              <Button
                onClick={onBackToDashboard}
                className="bg-green-700 hover:bg-green-800 active:bg-green-900 text-white px-6 shadow-sm transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
