'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecureTextRenderer } from './secure-text-renderer';
import { OptionCard } from './option-card';
import { QuestionNavigationMenu } from './question-navigation-menu';
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
} from 'lucide-react';
import type {
  QuizChapter,
  QuizQuestion,
  DisplayedOption,
  SrsProgressCounts,
  SessionHistoryEntry,
  QuizModule,
} from '@/types/quiz-types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QuestionEditor } from './question-editor';
import { CircularProgress } from '@/components/ui/circular-progress';
import { ProgressBar } from './progress-bar';

interface QuizSessionProps {
  chapter: QuizChapter;
  question: QuizQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  isSubmitted: boolean;
  isReviewSession?: boolean;
  srsProgressCounts?: SrsProgressCounts;
  currentModule?: QuizModule;
  // Session History Navigation Props
  sessionHistory?: SessionHistoryEntry[];
  currentHistoryViewIndex?: number | null;
  // Edit Mode Props - Phase 1
  isEditModeActive?: boolean;
  editingQuestionData?: QuizQuestion | null;
  onSetEditMode?: (question: QuizQuestion | null) => void;
  onSaveQuestion?: (question: QuizQuestion) => void;
  onDeleteQuestion?: (questionId: string) => void;
  generateUniqueQuestionId?: (chapterId: string) => string;
  generateUniqueOptionId?: (questionId: string, existingOptionIds: string[]) => string;
  onSelectOption: (optionId: string) => void;
  onSubmitAnswer: (displayedOptions: DisplayedOption[]) => void;
  onNextQuestion: () => void;
  onBackToDashboard: () => void;
  onExportCurrentQuestionState: () => void;
  onImportQuestionStateFromFile: (file: File) => void;
  onRetryChapter: () => void;
  onNavigateToQuestion: (questionIndex: number) => void;
  // Session History Navigation Handlers
  onViewPrevious?: () => void;
  onViewNextInHistory?: () => void;
  // NEW: All Questions View Handler
  onViewAllQuestions?: () => void;
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
  const [displayedOptionsCache, setDisplayedOptionsCache] = useState<DisplayedOption[]>([]);
  const [targetCorrectOptionForFeedback, setTargetCorrectOptionForFeedback] = useState<
    string | null
  >(null);

  const importFileInputRef = useRef<HTMLInputElement>(null);

  // FIXED: Correctly access props for history state
  const isViewingHistoricalEntry =
    typeof currentHistoryViewIndex === 'number' &&
    currentHistoryViewIndex >= 0 &&
    sessionHistory &&
    sessionHistory.length > 0 &&
    currentHistoryViewIndex < sessionHistory.length;

  const historicalEntry = isViewingHistoricalEntry ? sessionHistory[currentHistoryViewIndex] : null;

  // Use historical data when viewing history, otherwise use live data
  const displayQuestion = historicalEntry ? historicalEntry.questionSnapshot : question;
  const displaySelectedOptionId = historicalEntry
    ? historicalEntry.selectedOptionId
    : selectedOptionId;
  const displayIsSubmitted = historicalEntry ? true : isSubmitted; // Historical entries are always "submitted"
  const displayDisplayedOptions = historicalEntry
    ? historicalEntry.displayedOptions
    : displayedOptionsCache;

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportQuestionStateFromFile(file);
    }
    if (importFileInputRef.current) {
      importFileInputRef.current.value = ''; // Reset file input
    }
  };

  const triggerImportFileInput = () => {
    importFileInputRef.current?.click();
  };

  console.log('Quiz Session - isSubmitted:', displayIsSubmitted);
  console.log('Quiz Session - question:', displayQuestion.questionId);
  console.log('Quiz Session - isViewingHistoricalEntry:', isViewingHistoricalEntry);

  // FIXED: Stable display options for historical view
  useEffect(() => {
    if (isViewingHistoricalEntry && historicalEntry) {
      // Use historical displayed options directly
      setDisplayedOptionsCache(historicalEntry.displayedOptions);
      setTargetCorrectOptionForFeedback(null); // Not relevant for historical views
      console.log(
        `Using historical options for question: ${historicalEntry.questionSnapshot.questionId}`,
      );
      return;
    }

    // Generate options only for live questions (not historical)
    console.log(`=== Generating options for live question: ${question.questionId} ===`);

    const generateDisplayedOptions = (): DisplayedOption[] => {
      const maxDisplayOptions = 5;
      const correctOptions = question.options.filter((opt) =>
        question.correctOptionIds.includes(opt.optionId),
      );
      const incorrectOptions = question.options.filter(
        (opt) => !question.correctOptionIds.includes(opt.optionId),
      );

      const shownIncorrectIds = question.shownIncorrectOptionIds || [];
      const unshownIncorrectOptions = incorrectOptions.filter(
        (opt) => !shownIncorrectIds.includes(opt.optionId),
      );
      const shownIncorrectOptions = incorrectOptions.filter((opt) =>
        shownIncorrectIds.includes(opt.optionId),
      );

      const selectedOptions: DisplayedOption[] = [];

      if (correctOptions.length > 0) {
        const correctIndex = question.srsLevel ? question.srsLevel % correctOptions.length : 0;
        const selectedCorrectOption = correctOptions[correctIndex] || correctOptions[0];
        selectedOptions.push({
          ...selectedCorrectOption,
          isCorrect: true,
        });
      }

      const remainingSlots = maxDisplayOptions - selectedOptions.length;

      const shuffledUnshown = [...unshownIncorrectOptions].sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(remainingSlots, shuffledUnshown.length); i++) {
        selectedOptions.push({
          ...shuffledUnshown[i],
          isCorrect: false,
        });
      }

      const remainingSlotsAfterUnshown = maxDisplayOptions - selectedOptions.length;
      if (remainingSlotsAfterUnshown > 0 && shownIncorrectOptions.length > 0) {
        const shuffledShown = [...shownIncorrectOptions].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(remainingSlotsAfterUnshown, shuffledShown.length); i++) {
          selectedOptions.push({
            ...shuffledShown[i],
            isCorrect: false,
          });
        }
      }

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

      const finalOptions = selectedOptions.sort(() => Math.random() - 0.5);

      console.log(`Generated ${finalOptions.length} options for display:`);
      finalOptions.forEach((opt, index) => {
        console.log(`  ${index + 1}. ${opt.optionId} (${opt.isCorrect ? 'CORRECT' : 'incorrect'})`);
      });

      return finalOptions;
    };

    const newDisplayedOptions = generateDisplayedOptions();
    setDisplayedOptionsCache(newDisplayedOptions);
    setTargetCorrectOptionForFeedback(null);

    console.log(
      `Options cached for question ${question.questionId} - will remain stable during feedback`,
    );
  }, [question.questionId, isViewingHistoricalEntry, historicalEntry]);

  // FIXED: Accurate feedback for historical answers
  const getOptionDisplayState = (option: DisplayedOption) => {
    if (isViewingHistoricalEntry && historicalEntry) {
      // Historical view logic
      const isSelected = historicalEntry.selectedOptionId === option.optionId;
      const userWasCorrect = historicalEntry.isCorrect;
      const optionIsActuallyCorrect = historicalEntry.questionSnapshot.correctOptionIds.includes(
        option.optionId,
      );

      if (isSelected) {
        return {
          isSelected: true,
          showAsCorrect: userWasCorrect,
          showAsIncorrect: !userWasCorrect,
        };
      } else {
        // Not selected by user - highlight correct answer if user was wrong
        return {
          isSelected: false,
          showAsCorrect: !userWasCorrect && optionIsActuallyCorrect,
          showAsIncorrect: false,
        };
      }
    }

    // Live question logic (existing)
    if (!displayIsSubmitted) {
      return {
        isSelected: displaySelectedOptionId === option.optionId,
        showAsCorrect: false,
        showAsIncorrect: false,
      };
    }

    const isSelected = displaySelectedOptionId === option.optionId;
    const isCorrectOption = displayQuestion.correctOptionIds.includes(option.optionId);
    const selectedWasCorrect = displaySelectedOptionId
      ? displayQuestion.correctOptionIds.includes(displaySelectedOptionId)
      : false;

    if (selectedWasCorrect) {
      return {
        isSelected,
        showAsCorrect: isSelected && isCorrectOption,
        showAsIncorrect: false,
      };
    } else {
      if (isSelected) {
        return {
          isSelected,
          showAsCorrect: false,
          showAsIncorrect: true,
        };
      } else if (option.optionId === targetCorrectOptionForFeedback) {
        return {
          isSelected: false,
          showAsCorrect: true,
          showAsIncorrect: false,
        };
      } else {
        return {
          isSelected: false,
          showAsCorrect: false,
          showAsIncorrect: false,
        };
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isViewingHistoricalEntry) return;

    // Add validation for correctOptionIds
    if (!question.correctOptionIds || !Array.isArray(question.correctOptionIds)) {
      console.error('Question missing correctOptionIds:', question.questionId);
      return;
    }

    console.log(`=== Submitting answer for question: ${question.questionId} ===`);
    console.log(`Selected option: ${selectedOptionId}`);
    console.log(
      `Options being submitted:`,
      displayedOptionsCache.map((opt) => opt.optionId),
    );

    const selectedWasCorrect = question.correctOptionIds.includes(selectedOptionId);
    if (!selectedWasCorrect) {
      const displayedCorrectOptions = displayedOptionsCache.filter((opt) =>
        question.correctOptionIds.includes(opt.optionId),
      );

      if (displayedCorrectOptions.length > 0) {
        const targetOption =
          question.correctOptionIds.find((correctId) =>
            displayedCorrectOptions.some((displayed) => displayed.optionId === correctId),
          ) || displayedCorrectOptions[0].optionId;

        setTargetCorrectOptionForFeedback(targetOption);
        console.log(`Set target correct option for feedback: ${targetOption}`);
      } else {
        setTargetCorrectOptionForFeedback(question.correctOptionIds[0]);
        console.log(`Fallback target correct option: ${question.correctOptionIds[0]}`);
      }
    }

    onSubmitAnswer(displayedOptionsCache);
  };

  const processExplanationText = (explanationText: string): string => {
    let processedText = explanationText;

    // First, handle option IDs wrapped in <code> tags (existing functionality)
    processedText = processedText.replace(/<code>(.*?)<\/code>/g, (match, optionId) => {
      const option = displayQuestion.options.find((opt) => opt.optionId === optionId);
      if (option) {
        return `<code>${option.optionText}</code>`;
      } else {
        console.warn(`Option ID ${optionId} not found in question ${displayQuestion.questionId}`);
        return match;
      }
    });

    // Then, replace any bare option IDs with their corresponding option text
    // This handles option IDs that appear directly in the explanation text
    displayQuestion.options.forEach((option) => {
      const optionIdPattern = new RegExp(
        `\\b${option.optionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'g',
      );

      processedText = processedText.replace(optionIdPattern, (match) => {
        // Check if this option ID is the currently selected option
        const isSelectedOption = displaySelectedOptionId === option.optionId;

        if (isSelectedOption) {
          // Highlight the selected option text
          return `<strong class="text-blue-300">"${option.optionText}"</strong>`;
        } else {
          // Regular option text replacement
          return `"${option.optionText}"`;
        }
      });
    });

    return processedText;
  };

  // Enhanced chapter name parsing for better formatting
  const parseChapterName = (name: string) => {
    // Match patterns like "Chapter X:" or "Chapter XX:" at the beginning
    const chapterMatch = name.match(/^(Chapter\s+\d+):\s*(.*)$/i);

    if (chapterMatch) {
      return {
        chapterNumber: chapterMatch[1], // e.g., "Chapter 1"
        chapterTitle: chapterMatch[2].trim(), // e.g., "Fundamentals of Algorithms & Complexity"
        hasChapterNumber: true,
      };
    }

    // Fallback for names that don't follow the "Chapter X:" pattern
    return {
      chapterNumber: '',
      chapterTitle: name,
      hasChapterNumber: false,
    };
  };

  const getHeaderTitle = () => {
    if (isReviewSession) {
      return `Review Session`;
    }
    return parseChapterName(chapter.name);
  };

  const getProgressInfo = () => {
    if (isReviewSession) {
      return '';
    }
    return 'Chapter Progress';
  };

  const headerInfo = getHeaderTitle();

  // FIXED: Navigation button visibility and state logic using props
  const canViewPrevious =
    isViewingHistoricalEntry || (isSubmitted && sessionHistory && sessionHistory.length > 0);

  const canViewNextInHistory =
    isViewingHistoricalEntry &&
    currentHistoryViewIndex !== null &&
    currentHistoryViewIndex < sessionHistory.length - 1;

  const shouldShowNextQuestion =
    (!isViewingHistoricalEntry && isSubmitted) ||
    (isViewingHistoricalEntry &&
      currentHistoryViewIndex !== null &&
      currentHistoryViewIndex === sessionHistory.length - 1);

  // Calculate progress and score percentages
  const progressPercentage = useMemo(() => {
    return totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;
  }, [currentQuestionIndex, totalQuestions]);

  const scorePercentage = useMemo(() => {
    if (!currentModule) return 0;
    const currentChapter = currentModule.chapters.find((c) => c.id === chapter.id);
    if (!currentChapter) return 0;
    return currentChapter.totalQuestions > 0
      ? Math.round((currentChapter.correctAnswers / currentChapter.totalQuestions) * 100)
      : 0;
  }, [currentModule, chapter.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-gray-950">
      {/* Fixed Progress and Score Bar */}
      <div className="sticky top-0 z-50 border-b border-slate-700 bg-gradient-to-r from-slate-900/95 to-slate-800/95 shadow-lg backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Progress Section */}
            <div className="flex flex-1 items-center gap-3">
              <span className="min-w-[3rem] text-right text-lg font-medium text-blue-300">
                {progressPercentage}%
              </span>
              <ProgressBar
                current={currentQuestionIndex + 1}
                total={totalQuestions}
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
              <CircularProgress value={scorePercentage} size={32} className="text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-8 sm:pt-12">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Enhanced Header with improved formatting */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  {isReviewSession ? (
                    <div>
                      <h1 className="hyphens-auto break-words text-3xl font-bold leading-tight text-white">
                        Review Session
                      </h1>
                      <div className="mt-2">
                        {/* Display the chapter name for the current review question */}
                        {(() => {
                          // Get chapter name for display
                          const chapterNameForDisplay =
                            isViewingHistoricalEntry && historicalEntry
                              ? currentModule?.chapters.find(
                                  (c) => c.id === historicalEntry.chapterId,
                                )?.name || chapter.name
                              : chapter.name;

                          const parsedChapterName = parseChapterName(chapterNameForDisplay);

                          if (parsedChapterName.hasChapterNumber) {
                            return (
                              <div>
                                <div className="break-words text-lg font-medium text-orange-300">
                                  {parsedChapterName.chapterNumber}
                                </div>
                                <div className="mt-1 break-words text-xl font-medium leading-tight text-orange-200">
                                  {parsedChapterName.chapterTitle}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <p className="mt-1 break-words text-lg font-medium text-orange-300">
                                {parsedChapterName.chapterTitle}
                              </p>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {typeof headerInfo === 'object' && headerInfo.hasChapterNumber ? (
                        <div>
                          <div className="hyphens-auto break-words text-xl font-semibold text-blue-300">
                            {headerInfo.chapterNumber}
                          </div>
                          <h1 className="mt-1 hyphens-auto break-words text-3xl font-bold leading-tight text-white">
                            {headerInfo.chapterTitle}
                          </h1>
                        </div>
                      ) : (
                        <h1 className="hyphens-auto break-words text-3xl font-bold leading-tight text-white">
                          {typeof headerInfo === 'string' ? headerInfo : chapter.name}
                        </h1>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="break-words text-base text-gray-400">{getProgressInfo()}</p>
              {isReviewSession &&
                displayQuestion.srsLevel !== undefined &&
                displayQuestion.srsLevel > 0 && (
                  <p className="mt-2 text-sm text-blue-400">
                    SRS Level: {displayQuestion.srsLevel}
                  </p>
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
                        className="h-10 w-10 flex-shrink-0 border-purple-700 bg-purple-900/40 p-0 text-purple-200 transition-all duration-200 hover:border-purple-600 hover:bg-purple-800/50 hover:text-white focus-visible:ring-2 focus-visible:ring-purple-500 active:bg-purple-800/80"
                      >
                        <List className="h-4 w-4" />
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
                        className="h-10 w-10 flex-shrink-0 border-orange-700 bg-orange-900/40 p-0 text-orange-200 transition-all duration-200 hover:border-orange-600 hover:bg-orange-800/50 hover:text-white focus-visible:ring-2 focus-visible:ring-orange-500 active:bg-orange-800/80"
                      >
                        <RotateCcw className="h-4 w-4" />
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
                      className="h-10 w-10 flex-shrink-0 border-gray-700 bg-gray-900/70 p-0 text-gray-200 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800 hover:text-white focus-visible:ring-2 focus-visible:ring-gray-500 active:bg-gray-800/80"
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

          {/* Anki-style Progress Bars - Enhanced spacing */}
          {isReviewSession && srsProgressCounts && (
            <Card className="mb-8 border-indigo-700 bg-gradient-to-r from-indigo-950 to-purple-950 shadow-sm backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex flex-wrap items-center gap-2 text-lg text-white">
                  <Brain className="h-5 w-5 flex-shrink-0 text-indigo-400" />
                  <span className="break-words">Review Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 flex-1 items-center gap-1 text-sm font-medium text-red-300">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="break-words">New/Lapsing (Due Now)</span>
                      </span>
                      <span className="flex-shrink-0 text-sm tabular-nums text-red-200">
                        {srsProgressCounts.newOrLapsingDue}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-yellow-500 transition-all duration-300"
                        style={{
                          width: `${srsProgressCounts.totalNonMastered > 0 ? (srsProgressCounts.newOrLapsingDue / srsProgressCounts.totalNonMastered) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 flex-1 items-center gap-1 text-sm font-medium text-blue-300">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="break-words">Learning Pipeline</span>
                      </span>
                      <span className="flex-shrink-0 text-sm tabular-nums text-blue-200">
                        {srsProgressCounts.learningReviewDue}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${srsProgressCounts.totalNonMastered > 0 ? (srsProgressCounts.learningReviewDue / srsProgressCounts.totalNonMastered) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-indigo-800 pt-4 text-center">
                  <span className="break-words text-sm text-indigo-200">
                    Active Workload:{' '}
                    {srsProgressCounts.newOrLapsingDue + srsProgressCounts.learningReviewDue} of{' '}
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
          <Card className="border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="break-words text-lg text-white">
                {isReviewSession ? `Review Question` : `Question ${currentQuestionIndex + 1}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <SecureTextRenderer
                  content={displayQuestion.questionText}
                  className="break-words text-lg leading-relaxed text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Options - Clean layout */}
          <div className="space-y-4">
            <h3 className="break-words text-lg font-semibold text-white">Choose your answer:</h3>
            <div className="space-y-3">
              {displayDisplayedOptions.map((option) => {
                const displayState = getOptionDisplayState(option);
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
                );
              })}
            </div>
          </div>

          {/* Explanation - Enhanced styling */}
          {displayIsSubmitted && (
            <Card className="border-slate-700 bg-gradient-to-r from-slate-900 to-slate-950 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-200">Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <SecureTextRenderer
                    key={`explanation-${displayQuestion.questionId}-${displayIsSubmitted}`}
                    content={processExplanationText(displayQuestion.explanationText)}
                    className="break-words text-base leading-relaxed text-white"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons - Enhanced with history navigation */}
          <div className="flex flex-col items-stretch gap-4 pt-4 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
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
                          className="h-10 w-10 border-green-700 bg-green-900/40 p-0 text-green-200 transition-all duration-200 hover:border-green-600 hover:bg-green-800/50 hover:text-white"
                        >
                          <Download className="h-4 w-4" />
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
                          className="h-10 w-10 border-purple-700 bg-purple-900/40 p-0 text-purple-200 transition-all duration-200 hover:border-purple-600 hover:bg-purple-800/50 hover:text-white"
                        >
                          <Upload className="h-4 w-4" />
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
                              className="h-10 w-10 border-yellow-700 bg-yellow-900/40 p-0 text-yellow-200 transition-all duration-200 hover:border-yellow-600 hover:bg-yellow-800/50 hover:text-white"
                              disabled={isEditModeActive}
                            >
                              <Edit className="h-4 w-4" />
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
                                  const newQuestionId = generateUniqueQuestionId(chapter.id);
                                  const newQuestion: QuizQuestion = {
                                    questionId: newQuestionId,
                                    questionText: '',
                                    options: [],
                                    correctOptionIds: [],
                                    explanationText: '',
                                    status: 'not_attempted',
                                    timesAnsweredCorrectly: 0,
                                    timesAnsweredIncorrectly: 0,
                                    historyOfIncorrectSelections: [],
                                    srsLevel: 0,
                                    nextReviewAt: null,
                                    shownIncorrectOptionIds: [],
                                  };
                                  onSetEditMode(newQuestion);
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="h-10 w-10 border-cyan-700 bg-cyan-900/40 p-0 text-cyan-200 transition-all duration-200 hover:border-cyan-600 hover:bg-cyan-800/50 hover:text-white"
                              disabled={isEditModeActive}
                            >
                              <Plus className="h-4 w-4" />
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
                  className="border-gray-700 bg-gray-900/40 text-gray-200 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous Answer
                </Button>
              )}

              {/* Submit Answer Button - Only for live questions */}
              {!displayIsSubmitted && !isViewingHistoricalEntry && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId}
                  className="whitespace-nowrap bg-blue-700 px-6 text-white shadow-sm transition-all duration-200 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 active:bg-blue-900"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Answer
                </Button>
              )}

              {/* FIXED: Next Answer Button (for history navigation) */}
              {canViewNextInHistory && onViewNextInHistory && (
                <Button
                  onClick={onViewNextInHistory}
                  className="whitespace-nowrap bg-purple-700 px-6 text-white shadow-sm transition-all duration-200 hover:bg-purple-800 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 active:bg-purple-900"
                >
                  Next Answer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {/* FIXED: Next Question Button - For advancing to actual next question */}
              {shouldShowNextQuestion && (
                <Button
                  onClick={onNextQuestion}
                  className="whitespace-nowrap bg-green-700 px-6 text-white shadow-sm transition-all duration-200 hover:bg-green-800 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 active:bg-green-900"
                >
                  {isReviewSession ? 'Next Review' : 'Next Question'}
                  <ArrowRight className="ml-2 h-4 w-4" />
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
          {isEditModeActive &&
            editingQuestionData &&
            onSetEditMode &&
            onSaveQuestion &&
            onDeleteQuestion && (
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
  );
}
