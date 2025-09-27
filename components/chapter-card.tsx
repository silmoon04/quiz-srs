'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from './progress-bar';
import { BookOpen, CheckCircle, PlayCircle } from 'lucide-react';

interface ChapterCardProps {
  chapter: {
    id: string;
    name: string;
    description?: string;
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    isCompleted: boolean;
  };
  onStartQuiz: (chapterId: string) => void;
}

export function ChapterCard({ chapter, onStartQuiz }: ChapterCardProps) {
  const accuracy =
    chapter.answeredQuestions > 0
      ? Math.round((chapter.correctAnswers / chapter.answeredQuestions) * 100)
      : 0;

  const getButtonText = () => {
    if (chapter.isCompleted) return 'Review Quiz';
    if (chapter.answeredQuestions > 0) return 'Continue Quiz';
    return 'Start Quiz';
  };

  const getButtonIcon = () => {
    if (chapter.isCompleted) return <CheckCircle className="h-4 w-4" />;
    return <PlayCircle className="h-4 w-4" />;
  };

  // Parse chapter name to separate prefix from main title
  const parseChapterName = (name: string) => {
    const nameParts = name.split(/:\s*(.*)/); // Splits on the first ": "
    const prefix = nameParts.length > 1 ? nameParts[0] + ':' : '';
    const mainTitle = nameParts.length > 1 ? nameParts[1] : name;
    return { prefix, mainTitle };
  };

  const { prefix, mainTitle } = parseChapterName(chapter.name);

  return (
    <Card
      className={`flex h-full flex-col bg-gradient-to-r shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-700 hover:shadow-md active:scale-[0.98] ${
        chapter.isCompleted
          ? 'border-green-700/70 from-slate-900 to-green-950'
          : 'border-gray-800 from-slate-950 to-gray-950 hover:from-slate-900 hover:to-gray-900'
      } `}
    >
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-2 hyphens-auto break-words text-lg leading-tight">
              {prefix && (
                <span className="mr-1 font-medium text-gray-400 opacity-80">{prefix}</span>
              )}
              <span className="font-semibold text-white">{mainTitle}</span>
            </CardTitle>
          </div>
          <div className="flex-shrink-0">
            <BookOpen className="h-5 w-5 text-gray-500" />
          </div>
        </div>
        {chapter.description && (
          <p className="mt-2 line-clamp-3 hyphens-auto break-words text-xs leading-relaxed text-gray-400">
            {chapter.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4">
        {/* Flexible content area that pushes progress section to bottom */}
        <div className="flex-1" />

        {/* Fixed progress section at bottom */}
        <div className="space-y-3">
          {/* Progress bar with consistent positioning */}
          <div>
            <ProgressBar
              current={chapter.answeredQuestions}
              total={chapter.totalQuestions}
              variant={chapter.isCompleted ? 'success' : 'default'}
              compact={true}
              showPercentage={true}
            />
          </div>

          {/* Progress info and accuracy in aligned container */}
          <div className="flex min-h-[1.25rem] items-center justify-between text-sm">
            <span className="whitespace-nowrap text-gray-400">
              {chapter.answeredQuestions} of {chapter.totalQuestions} questions completed
            </span>
            {chapter.answeredQuestions > 0 ? (
              <span className="ml-2 whitespace-nowrap text-gray-300">
                Accuracy:{' '}
                <span className={accuracy >= 70 ? 'text-green-400' : 'text-yellow-400'}>
                  {accuracy}%
                </span>
              </span>
            ) : (
              <span className="ml-2 whitespace-nowrap text-transparent">Accuracy: 0%</span>
            )}
          </div>

          {/* Button with consistent positioning */}
          <Button
            onClick={() => onStartQuiz(chapter.id)}
            className="w-full bg-blue-700 text-white shadow-sm transition-all duration-200 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 active:bg-blue-900"
            size="sm"
          >
            {getButtonIcon()}
            <span className="ml-1 truncate">{getButtonText()}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
