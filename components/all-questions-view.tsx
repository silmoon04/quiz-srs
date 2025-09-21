'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SecureTextRenderer } from './secure-text-renderer';
import { OptionCard } from './option-card';
import { ProgressBar } from './progress-bar';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  RotateCcw,
  Home,
  Brain,
} from 'lucide-react';
import type { QuizChapter, QuizQuestion, DisplayedOption } from '@/types/quiz-types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CircularProgress } from '@/components/ui/circular-progress';

interface AllQuestionsViewProps {
  chapter: QuizChapter;
  onBackToQuiz: () => void;
  onBackToDashboard: () => void;
  onRetryChapter: () => void;
  isReviewSession?: boolean;
}

interface QuestionState {
  selectedOptionId: string | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  displayedOptions: DisplayedOption[];
}

export function AllQuestionsView({
  chapter,
  onBackToQuiz,
  onBackToDashboard,
  onRetryChapter,
  isReviewSession = false,
}: AllQuestionsViewProps) {
  // State for each question's answers and submission status
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({});

  // Toggle for showing/hiding answers
  const [showAnswers, setShowAnswers] = useState(false);

  // Initialize question states and generate displayed options for each question
  useEffect(() => {
    const initialStates: Record<string, QuestionState> = {};

    chapter.questions.forEach((question) => {
      // Generate displayed options for each question (similar to quiz session logic)
      const displayedOptions = generateDisplayedOptionsForQuestion(question);

      initialStates[question.questionId] = {
        selectedOptionId: null,
        isSubmitted: false,
        isCorrect: null,
        displayedOptions,
      };
    });

    setQuestionStates(initialStates);
  }, [chapter.questions]);

  // Generate displayed options for a question (simplified version of quiz logic)
  const generateDisplayedOptionsForQuestion = (question: QuizQuestion): DisplayedOption[] => {
    const maxDisplayOptions = 5;
    const correctOptions = question.options.filter((opt) =>
      question.correctOptionIds.includes(opt.optionId),
    );
    const incorrectOptions = question.options.filter(
      (opt) => !question.correctOptionIds.includes(opt.optionId),
    );

    const selectedOptions: DisplayedOption[] = [];

    // Add at least one correct option
    if (correctOptions.length > 0) {
      const correctIndex = question.srsLevel ? question.srsLevel % correctOptions.length : 0;
      const selectedCorrectOption = correctOptions[correctIndex] || correctOptions[0];
      selectedOptions.push({
        ...selectedCorrectOption,
        isCorrect: true,
      });
    }

    // Fill remaining slots with incorrect options
    const remainingSlots = maxDisplayOptions - selectedOptions.length;
    const shuffledIncorrect = [...incorrectOptions].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(remainingSlots, shuffledIncorrect.length); i++) {
      selectedOptions.push({
        ...shuffledIncorrect[i],
        isCorrect: false,
      });
    }

    // Add more correct options if we have space
    const remainingSlotsAfterIncorrect = maxDisplayOptions - selectedOptions.length;
    const remainingCorrect = correctOptions.filter(
      (opt) => !selectedOptions.some((selected) => selected.optionId === opt.optionId),
    );

    for (let i = 0; i < Math.min(remainingSlotsAfterIncorrect, remainingCorrect.length); i++) {
      selectedOptions.push({
        ...remainingCorrect[i],
        isCorrect: true,
      });
    }

    // Shuffle final options
    return selectedOptions.sort(() => Math.random() - 0.5);
  };

  // Calculate real-time score percentage
  const scoreData = useMemo(() => {
    const submittedQuestions = Object.values(questionStates).filter((state) => state.isSubmitted);
    const correctAnswers = submittedQuestions.filter((state) => state.isCorrect).length;
    const totalQuestions = chapter.questions.length;
    const answeredQuestions = submittedQuestions.length;

    const scorePercentage =
      totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const progressPercentage =
      totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    return {
      correctAnswers,
      totalQuestions,
      answeredQuestions,
      scorePercentage,
      progressPercentage,
    };
  }, [questionStates, chapter.questions.length]);

  // Handle option selection for a specific question
  const handleSelectOption = (questionId: string, optionId: string) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: optionId,
      },
    }));
  };

  // Handle answer submission for a specific question
  const handleSubmitAnswer = (questionId: string) => {
    const questionState = questionStates[questionId];
    if (!questionState?.selectedOptionId) return;

    const question = chapter.questions.find((q) => q.questionId === questionId);
    if (!question) return;

    const isCorrect = question.correctOptionIds.includes(questionState.selectedOptionId);

    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isSubmitted: true,
        isCorrect,
      },
    }));
  };

  // Get option display state for feedback
  const getOptionDisplayState = (questionId: string, option: DisplayedOption) => {
    const questionState = questionStates[questionId];
    const question = chapter.questions.find((q) => q.questionId === questionId);

    if (!questionState || !question) {
      return {
        isSelected: false,
        showAsCorrect: false,
        showAsIncorrect: false,
      };
    }

    if (!questionState.isSubmitted && !showAnswers) {
      return {
        isSelected: questionState.selectedOptionId === option.optionId,
        showAsCorrect: false,
        showAsIncorrect: false,
      };
    }

    // Show answers mode or submitted state
    const isSelected = questionState.selectedOptionId === option.optionId;
    const isCorrectOption = question.correctOptionIds.includes(option.optionId);
    const selectedWasCorrect = questionState.isCorrect;

    if (showAnswers) {
      // In show answers mode, highlight all correct options
      return {
        isSelected,
        showAsCorrect: isCorrectOption,
        showAsIncorrect: isSelected && !isCorrectOption,
      };
    }

    // Normal submitted state logic
    if (selectedWasCorrect) {
      return {
        isSelected,
        showAsCorrect: isSelected && isCorrectOption,
        showAsIncorrect: false,
      };
    } else {
      return {
        isSelected,
        showAsCorrect: !isSelected && isCorrectOption,
        showAsIncorrect: isSelected && !isCorrectOption,
      };
    }
  };

  // Process explanation text to replace option IDs with option text
  const processExplanationText = (question: QuizQuestion, questionId: string): string => {
    let processedText = question.explanationText;
    const questionState = questionStates[questionId];

    // Replace option IDs in <code> tags
    processedText = processedText.replace(/<code>(.*?)<\/code>/g, (match, optionId) => {
      const option = question.options.find((opt) => opt.optionId === optionId);
      if (option) {
        return `<code>${option.optionText}</code>`;
      }
      return match;
    });

    // Replace bare option IDs with option text
    question.options.forEach((option) => {
      const optionIdPattern = new RegExp(
        `\\b${option.optionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'g',
      );

      processedText = processedText.replace(optionIdPattern, (match) => {
        const isSelectedOption = questionState?.selectedOptionId === option.optionId;

        if (isSelectedOption) {
          return `<strong class="text-blue-300">"${option.optionText}"</strong>`;
        } else {
          return `"${option.optionText}"`;
        }
      });
    });

    return processedText;
  };

  // Reset all answers
  const handleResetAllAnswers = () => {
    const resetStates: Record<string, QuestionState> = {};

    chapter.questions.forEach((question) => {
      resetStates[question.questionId] = {
        selectedOptionId: null,
        isSubmitted: false,
        isCorrect: null,
        displayedOptions: questionStates[question.questionId]?.displayedOptions || [],
      };
    });

    setQuestionStates(resetStates);
    setShowAnswers(false);
  };

  // Enhanced chapter name parsing
  const parseChapterName = (name: string) => {
    const chapterMatch = name.match(/^(Chapter\s+\d+):\s*(.*)$/i);

    if (chapterMatch) {
      return {
        chapterNumber: chapterMatch[1],
        chapterTitle: chapterMatch[2].trim(),
        hasChapterNumber: true,
      };
    }

    return {
      chapterNumber: '',
      chapterTitle: name,
      hasChapterNumber: false,
    };
  };

  const headerInfo = parseChapterName(chapter.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-gray-950">
      {/* Fixed Progress and Score Bar */}
      <div className="sticky top-0 z-50 border-b border-slate-700 bg-gradient-to-r from-slate-900/95 to-slate-800/95 shadow-lg backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Progress Section */}
            <div className="flex flex-1 items-center gap-3">
              <Clock className="h-5 w-5 flex-shrink-0 text-blue-300" />
              <span className="min-w-[3rem] whitespace-nowrap text-right text-sm font-medium text-blue-300">
                {scoreData.progressPercentage}%
              </span>
              <ProgressBar
                current={scoreData.answeredQuestions}
                total={scoreData.totalQuestions}
                variant="default"
                showText={false}
                showPercentage={false}
                className="h-2 flex-1"
              />
            </div>

            {/* Score Section */}
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 flex-shrink-0 text-green-300" />
              <span className="whitespace-nowrap text-sm font-medium text-green-300">Score:</span>
              <CircularProgress
                value={scoreData.scorePercentage}
                size={32}
                className="text-green-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-8 sm:pt-12">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  {isReviewSession ? (
                    <div>
                      <h1 className="hyphens-auto break-words text-3xl font-bold leading-tight text-white">
                        Review Session - All Questions
                      </h1>
                      <div className="mt-2">
                        {headerInfo.hasChapterNumber ? (
                          <div>
                            <div className="break-words text-lg font-medium text-orange-300">
                              {headerInfo.chapterNumber}
                            </div>
                            <div className="mt-1 break-words text-xl font-medium leading-tight text-orange-200">
                              {headerInfo.chapterTitle}
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 break-words text-lg font-medium text-orange-300">
                            {headerInfo.chapterTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {headerInfo.hasChapterNumber ? (
                        <div>
                          <div className="hyphens-auto break-words text-xl font-semibold text-blue-300">
                            {headerInfo.chapterNumber} - All Questions
                          </div>
                          <h1 className="mt-1 hyphens-auto break-words text-3xl font-bold leading-tight text-white">
                            {headerInfo.chapterTitle}
                          </h1>
                        </div>
                      ) : (
                        <h1 className="hyphens-auto break-words text-3xl font-bold leading-tight text-white">
                          {chapter.name} - All Questions
                        </h1>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="break-words text-base text-gray-400">
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
                      className="h-10 w-10 border-orange-700 bg-orange-900/40 p-0 text-orange-200 transition-all duration-200 hover:border-orange-600 hover:bg-orange-800/50 hover:text-white"
                    >
                      <RotateCcw className="h-4 w-4" />
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
                      className="h-10 w-10 border-gray-700 bg-gray-900/70 p-0 text-gray-200 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800 hover:text-white"
                    >
                      <Home className="h-4 w-4" />
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
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              onClick={onBackToQuiz}
              variant="outline"
              className="border-gray-700 bg-gray-900/40 text-gray-200 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800/50 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quiz Navigation
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowAnswers(!showAnswers)}
                variant="outline"
                className={`transition-all duration-200 ${
                  showAnswers
                    ? 'border-yellow-600 bg-yellow-900/50 text-yellow-200 hover:bg-yellow-800/60'
                    : 'border-gray-700 bg-gray-900/40 text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {showAnswers ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide Answers
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Show All Answers
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* All Questions */}
          <div className="space-y-8">
            {chapter.questions.map((question, index) => {
              const questionState = questionStates[question.questionId];
              const isSubmitted = questionState?.isSubmitted || showAnswers;

              return (
                <Card
                  key={question.questionId}
                  className="border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg backdrop-blur-sm"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 break-words text-lg text-white">
                      <span className="font-mono text-base text-blue-400">Q{index + 1}</span>
                      {questionState?.isSubmitted && (
                        <div className="flex items-center gap-1">
                          {questionState.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              questionState.isCorrect ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {questionState.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Text */}
                    <div className="prose prose-invert max-w-none">
                      <SecureTextRenderer
                        content={question.questionText}
                        className="break-words text-lg leading-relaxed text-white"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <h4 className="break-words text-base font-semibold text-white">
                        Choose your answer:
                      </h4>
                      <div className="space-y-2">
                        {questionState?.displayedOptions.map((option) => {
                          const displayState = getOptionDisplayState(question.questionId, option);
                          return (
                            <OptionCard
                              key={option.optionId}
                              option={option}
                              isSelected={displayState.isSelected}
                              showAsCorrect={displayState.showAsCorrect}
                              showAsIncorrect={displayState.showAsIncorrect}
                              isSubmitted={isSubmitted}
                              onSelect={() =>
                                handleSelectOption(question.questionId, option.optionId)
                              }
                              disabled={isSubmitted}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit Button */}
                    {!isSubmitted && !showAnswers && (
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleSubmitAnswer(question.questionId)}
                          disabled={!questionState?.selectedOptionId}
                          className="bg-blue-700 px-6 text-white shadow-sm transition-all duration-200 hover:bg-blue-800 active:bg-blue-900"
                        >
                          Submit Answer
                        </Button>
                      </div>
                    )}

                    {/* Explanation */}
                    {isSubmitted && (
                      <Card className="border-slate-700 bg-gradient-to-r from-slate-900 to-slate-950 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-base text-slate-200">Explanation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-invert max-w-none">
                            <SecureTextRenderer
                              content={processExplanationText(question, question.questionId)}
                              className="break-words text-sm leading-relaxed text-white"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col items-stretch gap-4 border-t border-slate-700 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Button
              onClick={onBackToQuiz}
              variant="outline"
              className="border-gray-700 bg-gray-900/40 text-gray-200 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800/50 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quiz Navigation
            </Button>

            <div className="flex gap-2">
              {!isReviewSession && (
                <Button
                  onClick={onRetryChapter}
                  variant="outline"
                  className="border-orange-700 bg-orange-900/40 text-orange-200 transition-all duration-200 hover:border-orange-600 hover:bg-orange-800/50 hover:text-white"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry Chapter
                </Button>
              )}

              <Button
                onClick={onBackToDashboard}
                className="bg-green-700 px-6 text-white shadow-sm transition-all duration-200 hover:bg-green-800 active:bg-green-900"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
