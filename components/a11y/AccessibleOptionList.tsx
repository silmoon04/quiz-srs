'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OptionCard } from '@/components/option-card';
import type { DisplayedOption } from '@/types/quiz-types';

interface AccessibleOptionListProps {
  options: DisplayedOption[];
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  isSubmitted: boolean;
  disabled?: boolean;
}

export function AccessibleOptionList({
  options,
  selectedOptionId,
  onSelectOption,
  isSubmitted,
  disabled = false,
}: AccessibleOptionListProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update option refs array when options change
  useEffect(() => {
    optionRefs.current = optionRefs.current.slice(0, options.length);
  }, [options.length]);

  // Focus management
  const focusOption = useCallback((index: number) => {
    if (optionRefs.current[index]) {
      optionRefs.current[index]?.focus();
      setFocusedIndex(index);
    }
  }, []);

  // Handle focus events from the wrapper div
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled || isSubmitted) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = (focusedIndex + 1) % options.length;
          focusOption(nextIndex);
          break;

        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = focusedIndex === 0 ? options.length - 1 : focusedIndex - 1;
          focusOption(prevIndex);
          break;

        case ' ':
        case 'Enter':
          event.preventDefault();
          if (options[focusedIndex]) {
            onSelectOption(options[focusedIndex].optionId);
          }
          break;

        case 'Home':
          event.preventDefault();
          focusOption(0);
          break;

        case 'End':
          event.preventDefault();
          focusOption(options.length - 1);
          break;
      }
    },
    [disabled, isSubmitted, focusedIndex, options, focusOption, onSelectOption],
  );

  // Set initial focus when component mounts
  useEffect(() => {
    if (options.length > 0) {
      focusOption(0);
    }
  }, [options.length, focusOption]);

  // Update focused index when selected option changes
  useEffect(() => {
    const selectedIndex = options.findIndex((option) => option.optionId === selectedOptionId);
    if (selectedIndex !== -1) {
      setFocusedIndex(selectedIndex);
    }
  }, [selectedOptionId, options]);

  return (
    <div
      role="radiogroup"
      aria-label="Answer options"
      onKeyDown={handleKeyDown}
      className="space-y-3"
    >
      {options.map((option, index) => {
        const displayState = {
          isSelected: option.optionId === selectedOptionId,
          showAsCorrect: false,
          showAsIncorrect: false,
        };

        return (
          <div
            key={option.optionId}
            ref={(el) => {
              optionRefs.current[index] = el;
            }}
            role="radio"
            aria-checked={displayState.isSelected}
            tabIndex={index === focusedIndex ? 0 : -1}
            aria-labelledby={`option-text-${option.optionId}`}
            className="rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            onFocus={() => handleFocus(index)}
          >
            <OptionCard
              option={option}
              isSelected={displayState.isSelected}
              showAsCorrect={displayState.showAsCorrect}
              showAsIncorrect={displayState.showAsIncorrect}
              isSubmitted={isSubmitted}
              onSelect={() => onSelectOption(option.optionId)}
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
}
