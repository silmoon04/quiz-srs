import type { DisplayedOption, QuizQuestion } from '@/types/quiz-types';

const DEFAULT_MAX_OPTIONS = 5;

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

  return selectedOptions.sort(() => Math.random() - 0.5);
}
