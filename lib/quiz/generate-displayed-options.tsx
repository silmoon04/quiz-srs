import type { DisplayedOption, QuizQuestion } from '@/types/quiz-types';

const DEFAULT_MAX_OPTIONS = 5;

/**
 * Error thrown when a question has no valid correct options
 */
export class NoCorrectOptionsError extends Error {
  constructor(questionId: string) {
    super(
      `Question ${questionId} has no valid correct options - correctOptionIds reference non-existent options`,
    );
    this.name = 'NoCorrectOptionsError';
  }
}

export function generateDisplayedOptions(
  question: QuizQuestion,
  maxDisplayOptions: number = DEFAULT_MAX_OPTIONS,
): DisplayedOption[] {
  const correctOptions = question.options.filter((opt) =>
    question.correctOptionIds.includes(opt.optionId),
  );
  const incorrectOptions = question.options.filter(
    (opt) => !question.correctOptionIds.includes(opt.optionId),
  );

  // FIXED D3: Validate that we have at least one valid correct option
  if (correctOptions.length === 0) {
    // If there are correctOptionIds but none match actual options, this is data corruption
    if (question.correctOptionIds && question.correctOptionIds.length > 0) {
      console.error(
        `Data integrity error: Question ${question.questionId} has correctOptionIds ` +
          `[${question.correctOptionIds.join(', ')}] but none match available options ` +
          `[${question.options.map((o) => o.optionId).join(', ')}]`,
      );
      throw new NoCorrectOptionsError(question.questionId);
    }

    // If no correctOptionIds at all, treat all options as incorrect (edge case)
    console.warn(`Question ${question.questionId} has no correctOptionIds defined`);

    // Return options without any marked as correct - caller should handle this
    return question.options.slice(0, maxDisplayOptions).map((opt) => ({
      ...opt,
      isCorrect: false,
    }));
  }

  const shownIncorrectIds = question.shownIncorrectOptionIds || [];
  const unshownIncorrectOptions = incorrectOptions.filter(
    (opt) => !shownIncorrectIds.includes(opt.optionId),
  );
  const shownIncorrectOptions = incorrectOptions.filter((opt) =>
    shownIncorrectIds.includes(opt.optionId),
  );

  const selectedOptions: DisplayedOption[] = [];

  // FIXED: Use proper srsLevel handling (0 is valid, not falsy)
  const srsLevel = typeof question.srsLevel === 'number' ? question.srsLevel : 0;
  const correctIndex = srsLevel % correctOptions.length;
  const selectedCorrectOption = correctOptions[correctIndex] || correctOptions[0];
  selectedOptions.push({
    ...selectedCorrectOption,
    isCorrect: true,
  });

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

  return selectedOptions.sort(() => Math.random() - 0.5);
}
