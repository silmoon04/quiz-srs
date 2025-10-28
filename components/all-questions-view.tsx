'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from './rendering/MarkdownRenderer';
import { OptionCard } from './option-card';
import { ProgressBar } from './progress-bar';
import { ArrowLeft, CheckCircle, XCircle, Eye, EyeOff, Brain, Home, RotateCcw } from 'lucide-react';
import type { AnswerRecord, QuizChapter, QuizQuestion, DisplayedOption } from '@/types/quiz-types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AllQuestionsViewProps {
  chapter: QuizChapter;
  onBackToQuiz: () => void;
  onBackToDashboard: () => void;
  onRetryChapter: () => void;
  isReviewSession?: boolean;
  answerRecords?: Record<string, AnswerRecord>;
}

type QuestionSummary = {
  questionId: string;
  prompt: string;
  displayedOptions: DisplayedOption[];
  lastSelectedOptionId: string | null;
  isCorrect: boolean | null;
  explanation: string;
};

export function AllQuestionsView({
  chapter,
  onBackToQuiz,
  onBackToDashboard,
  onRetryChapter,
  isReviewSession = false,
  answerRecords = {},
}: AllQuestionsViewProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  const questionSummaries = useMemo((): QuestionSummary[] => {
    return chapter.questions.map((question: QuizQuestion) => {
      const record = answerRecords[question.questionId];
      let displayedOptions: DisplayedOption[] = [];

      if (record) {
        // If a record exists, reconstruct the displayed options from it
        displayedOptions = record.displayedOptionIds
          .map((optionId: string) => {
            const option = question.options.find((quizOption) => quizOption.optionId === optionId);
            if (!option) return null;
            const newOption: DisplayedOption = {
              ...option,
              isCorrect: question.correctOptionIds.includes(optionId),
            };
            return newOption;
          })
          .filter((option): option is DisplayedOption => option !== null);
      } else {
        // Fallback for questions without a record (e.g., not yet answered)
        // Display all options, marking the correct ones
        displayedOptions = question.options.map((option) => ({
          ...option,
          isCorrect: question.correctOptionIds.includes(option.optionId),
        }));
      }

      return {
        questionId: question.questionId,
        prompt: question.questionText,
        displayedOptions,
        lastSelectedOptionId: record ? record.selectedOptionId : null,
        isCorrect: record ? record.isCorrect : null,
        explanation: processExplanationText(question, record?.selectedOptionId ?? null),
      };
    });
  }, [chapter.questions, answerRecords]);

  const scoreData = useMemo(() => {
    const totalQuestions = chapter.totalQuestions ?? chapter.questions.length;
    const answeredQuestions = chapter.answeredQuestions ?? 0;
    const correctAnswers = chapter.correctAnswers ?? 0;
    const percentage = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      percentage,
    };
  }, [chapter]);

  const getOptionDisplayState = (
    summary: QuestionSummary,
    option: DisplayedOption,
  ): { isSelected: boolean; showAsCorrect: boolean; showAsIncorrect: boolean } => {
    const isSelected = summary.lastSelectedOptionId === option.optionId;

    return {
      isSelected,
      showAsCorrect: !!(showAnswers && option.isCorrect),
      showAsIncorrect: !!(showAnswers && isSelected && !option.isCorrect),
    };
  };

  const headerInfo = useMemo(() => {
    const match = chapter.name.match(/^(\d+)\.\s*(.*)/);
    if (match) {
      return {
        hasChapterNumber: true,
        chapterNumber: `Chapter ${match[1]}`,
        chapterTitle: match[2],
      };
    }
    return {
      hasChapterNumber: false,
      chapterNumber: '',
      chapterTitle: chapter.name,
    };
  }, [chapter.name]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="sticky top-0 z-20 bg-slate-950/80 pb-4 pt-6 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                {headerInfo.hasChapterNumber ? (
                  <>
                    <span className="font-medium">{headerInfo.chapterNumber}</span>
                    <span className="text-slate-600">/</span>
                    <span>{headerInfo.chapterTitle}</span>
                  </>
                ) : (
                  <span className="font-medium">{headerInfo.chapterTitle}</span>
                )}
                {isReviewSession && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-200">
                    <Brain className="h-3 w-3" />
                    Review Session
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold">All Questions</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowAnswers(!showAnswers)}
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0"
                    >
                      {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showAnswers ? 'Hide' : 'Show'} Answers</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button onClick={onRetryChapter} variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry Chapter
              </Button>
              <Button onClick={onBackToDashboard} variant="outline" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button onClick={onBackToQuiz} size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quiz
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar
              current={scoreData.answeredQuestions}
              total={scoreData.totalQuestions}
              variant={scoreData.percentage >= 50 ? 'success' : 'warning'}
            />
            <div className="mt-2 flex justify-between text-sm text-gray-400">
              <span>
                Score: {scoreData.correctAnswers} / {scoreData.answeredQuestions} (
                {scoreData.percentage.toFixed(0)}%)
              </span>
              <span>Total Questions: {scoreData.totalQuestions}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-8 sm:pt-12">
        <div className="mx-auto max-w-6xl space-y-6">
          {questionSummaries.map((summary) => (
            <Card key={summary.questionId} className="border-slate-800 bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-start justify-between text-lg font-semibold text-slate-200">
                  <MarkdownRenderer markdown={summary.prompt} />
                  {summary.isCorrect !== null && (
                    <div className="ml-4 flex-shrink-0">
                      {summary.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.displayedOptions.map((option) => {
                    const displayState = getOptionDisplayState(summary, option);
                    return (
                      <OptionCard
                        key={option.optionId}
                        option={option}
                        isSelected={displayState.isSelected}
                        showAsCorrect={displayState.showAsCorrect}
                        showAsIncorrect={displayState.showAsIncorrect}
                        isSubmitted={summary.lastSelectedOptionId !== null}
                        onSelect={() => {}} // This is a read-only view
                        disabled={true}
                      />
                    );
                  })}
                </div>
                {showAnswers && (
                  <Card className="mt-4 border-slate-700 bg-slate-800/50">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-200">Explanation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        <MarkdownRenderer
                          markdown={summary.explanation}
                          className="break-words text-sm leading-relaxed text-white"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function processExplanationText(question: QuizQuestion, selectedOptionId: string | null): string {
  let processedText = question.explanationText;

  // Replace option placeholders like {{option:optionId}}
  question.options.forEach((option) => {
    const placeholder = `{{option:${option.optionId}}}`;
    if (processedText.includes(placeholder)) {
      processedText = processedText.replace(
        new RegExp(placeholder, 'g'),
        `**"${option.optionText}"**`,
      );
    }
  });

  // Highlight the selected option if applicable
  if (selectedOptionId) {
    const selectedOption = question.options.find((opt) => opt.optionId === selectedOptionId);
    if (selectedOption) {
      processedText = processedText.replace(
        selectedOption.optionText,
        `<strong class="text-blue-300">${selectedOption.optionText}</strong>`,
      );
    }
  }

  return processedText;
}
