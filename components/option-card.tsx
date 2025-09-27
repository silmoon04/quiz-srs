'use client';
import { Card } from '@/components/ui/card';
import { MarkdownRenderer } from './rendering/MarkdownRenderer';
import { Check, X } from 'lucide-react';
import type { QuizOption } from '@/types/quiz-types';
import { memo } from 'react';

interface OptionCardProps {
  option: QuizOption;
  isSelected: boolean;
  showAsCorrect?: boolean;
  showAsIncorrect?: boolean;
  isSubmitted: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

// MEMOIZED: Prevent unnecessary re-renders when props haven't meaningfully changed
export const OptionCard = memo(function OptionCard({
  option,
  isSelected,
  showAsCorrect = false,
  showAsIncorrect = false,
  isSubmitted,
  onSelect,
  disabled = false,
}: OptionCardProps) {
  const getCardClasses = () => {
    let baseClasses =
      'cursor-pointer transition-all duration-200 border-2 backdrop-blur-sm shadow-sm ';

    if (disabled) {
      baseClasses += 'cursor-not-allowed opacity-70 ';
    }

    if (isSubmitted) {
      if (showAsCorrect) {
        baseClasses +=
          'bg-gradient-to-r from-green-950 to-green-900 border-green-700 shadow-green-900/20 ';
      } else if (showAsIncorrect) {
        baseClasses += 'bg-gradient-to-r from-red-950 to-red-900 border-red-700 shadow-red-900/20 ';
      } else {
        baseClasses += 'bg-gradient-to-r from-slate-950 to-gray-950 border-gray-800 ';
      }
    } else {
      if (isSelected) {
        baseClasses +=
          'bg-gradient-to-r from-blue-950 to-blue-900 border-blue-700 shadow-blue-900/20 ';
      } else {
        baseClasses +=
          'bg-gradient-to-r from-slate-950 to-gray-950 border-gray-800 hover:from-slate-900 hover:to-gray-900 hover:border-gray-700 hover:shadow-md active:scale-[0.99] ';
      }
    }

    return baseClasses;
  };

  const getIcon = () => {
    return (
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
        {isSubmitted && showAsCorrect && <Check className="h-5 w-5 text-green-400" />}
        {isSubmitted && showAsIncorrect && <X className="h-5 w-5 text-red-400" />}
      </div>
    );
  };

  return (
    <Card
      className={getCardClasses()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1">
          <MarkdownRenderer
            key={`option-${option.optionId}-${isSelected}-${isSubmitted}`}
            markdown={option.optionText}
            className="leading-relaxed text-white"
          />
        </div>
        {getIcon()}
      </div>
    </Card>
  );
});
