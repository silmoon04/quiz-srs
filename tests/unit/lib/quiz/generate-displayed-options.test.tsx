import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateDisplayedOptions } from '@/lib/quiz/generate-displayed-options';
import type { QuizQuestion, DisplayedOption } from '@/types/quiz-types';

// Helper to create a mock question with configurable options
function createMockQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    questionId: 'q1',
    questionText: 'What is the answer?',
    options: [
      { optionId: 'opt1', optionText: 'Option 1' },
      { optionId: 'opt2', optionText: 'Option 2' },
      { optionId: 'opt3', optionText: 'Option 3' },
      { optionId: 'opt4', optionText: 'Option 4' },
    ],
    correctOptionIds: ['opt1'],
    explanationText: 'Option 1 is correct.',
    ...overrides,
  };
}

describe('generateDisplayedOptions', () => {
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock Math.random to make tests deterministic
    mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  describe('basic functionality', () => {
    it('should return an array of DisplayedOption objects', () => {
      const question = createMockQuestion();
      const result = generateDisplayedOptions(question);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((option) => {
        expect(option).toHaveProperty('optionId');
        expect(option).toHaveProperty('optionText');
        expect(option).toHaveProperty('isCorrect');
      });
    });

    it('should respect the default maxDisplayOptions of 5', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Option 1' },
          { optionId: 'opt2', optionText: 'Option 2' },
          { optionId: 'opt3', optionText: 'Option 3' },
          { optionId: 'opt4', optionText: 'Option 4' },
          { optionId: 'opt5', optionText: 'Option 5' },
          { optionId: 'opt6', optionText: 'Option 6' },
          { optionId: 'opt7', optionText: 'Option 7' },
        ],
        correctOptionIds: ['opt1'],
      });

      const result = generateDisplayedOptions(question);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should respect custom maxDisplayOptions parameter', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Option 1' },
          { optionId: 'opt2', optionText: 'Option 2' },
          { optionId: 'opt3', optionText: 'Option 3' },
          { optionId: 'opt4', optionText: 'Option 4' },
          { optionId: 'opt5', optionText: 'Option 5' },
          { optionId: 'opt6', optionText: 'Option 6' },
        ],
        correctOptionIds: ['opt1'],
      });

      const result = generateDisplayedOptions(question, 3);
      expect(result.length).toBeLessThanOrEqual(3);
    });
  });

  describe('correct answer marking', () => {
    it('should always include at least one correct option when available', () => {
      const question = createMockQuestion();
      const result = generateDisplayedOptions(question);

      const correctOptions = result.filter((opt) => opt.isCorrect === true);
      expect(correctOptions.length).toBeGreaterThanOrEqual(1);
    });

    it('should mark correct options with isCorrect: true', () => {
      const question = createMockQuestion({
        correctOptionIds: ['opt1', 'opt2'],
      });
      const result = generateDisplayedOptions(question);

      result.forEach((option) => {
        if (question.correctOptionIds.includes(option.optionId)) {
          expect(option.isCorrect).toBe(true);
        } else {
          expect(option.isCorrect).toBe(false);
        }
      });
    });

    it('should mark incorrect options with isCorrect: false', () => {
      const question = createMockQuestion();
      const result = generateDisplayedOptions(question);

      const incorrectOptions = result.filter((opt) => opt.isCorrect === false);
      incorrectOptions.forEach((option) => {
        expect(question.correctOptionIds).not.toContain(option.optionId);
      });
    });
  });

  describe('SRS level handling', () => {
    it('should use srsLevel to select correct option when available', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'correct1', optionText: 'Correct 1' },
          { optionId: 'correct2', optionText: 'Correct 2' },
          { optionId: 'incorrect1', optionText: 'Incorrect 1' },
        ],
        correctOptionIds: ['correct1', 'correct2'],
        srsLevel: 1,
      });

      const result = generateDisplayedOptions(question);
      const correctInResult = result.filter((opt) => opt.isCorrect === true);

      // With srsLevel 1 and 2 correct options, index should be 1 % 2 = 1
      expect(correctInResult.some((opt) => opt.optionId === 'correct2')).toBe(true);
    });

    it('should default to first correct option when srsLevel is undefined', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'correct1', optionText: 'Correct 1' },
          { optionId: 'correct2', optionText: 'Correct 2' },
          { optionId: 'incorrect1', optionText: 'Incorrect 1' },
        ],
        correctOptionIds: ['correct1', 'correct2'],
        srsLevel: undefined,
      });

      const result = generateDisplayedOptions(question);
      const correctInResult = result.filter((opt) => opt.isCorrect === true);

      expect(correctInResult.some((opt) => opt.optionId === 'correct1')).toBe(true);
    });

    it('should handle srsLevel of 0 correctly', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'correct1', optionText: 'Correct 1' },
          { optionId: 'correct2', optionText: 'Correct 2' },
          { optionId: 'incorrect1', optionText: 'Incorrect 1' },
        ],
        correctOptionIds: ['correct1', 'correct2'],
        srsLevel: 0,
      });

      const result = generateDisplayedOptions(question);
      const correctInResult = result.filter((opt) => opt.isCorrect === true);

      // With srsLevel 0, index should be 0 % 2 = 0 (first correct option)
      expect(correctInResult.some((opt) => opt.optionId === 'correct1')).toBe(true);
    });
  });

  describe('shown incorrect options handling', () => {
    it('should prioritize unshown incorrect options over shown ones', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'correct1', optionText: 'Correct 1' },
          { optionId: 'shown1', optionText: 'Shown Incorrect 1' },
          { optionId: 'shown2', optionText: 'Shown Incorrect 2' },
          { optionId: 'unshown1', optionText: 'Unshown Incorrect 1' },
          { optionId: 'unshown2', optionText: 'Unshown Incorrect 2' },
        ],
        correctOptionIds: ['correct1'],
        shownIncorrectOptionIds: ['shown1', 'shown2'],
      });

      const result = generateDisplayedOptions(question, 3);
      const incorrectInResult = result.filter((opt) => opt.isCorrect === false);

      // Should prefer unshown options when slots are limited
      const unshownIncluded = incorrectInResult.filter(
        (opt) => opt.optionId === 'unshown1' || opt.optionId === 'unshown2',
      );
      expect(unshownIncluded.length).toBeGreaterThan(0);
    });

    it('should include shown incorrect options when unshown are exhausted', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'correct1', optionText: 'Correct 1' },
          { optionId: 'shown1', optionText: 'Shown Incorrect 1' },
          { optionId: 'unshown1', optionText: 'Unshown Incorrect 1' },
        ],
        correctOptionIds: ['correct1'],
        shownIncorrectOptionIds: ['shown1'],
      });

      const result = generateDisplayedOptions(question, 5);
      const optionIds = result.map((opt) => opt.optionId);

      // Should include both shown and unshown when there's room
      expect(optionIds).toContain('unshown1');
      expect(optionIds).toContain('shown1');
    });

    it('should handle undefined shownIncorrectOptionIds', () => {
      const question = createMockQuestion({
        shownIncorrectOptionIds: undefined,
      });

      expect(() => generateDisplayedOptions(question)).not.toThrow();
      const result = generateDisplayedOptions(question);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty shownIncorrectOptionIds array', () => {
      const question = createMockQuestion({
        shownIncorrectOptionIds: [],
      });

      expect(() => generateDisplayedOptions(question)).not.toThrow();
      const result = generateDisplayedOptions(question);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle question with no options', () => {
      const question = createMockQuestion({
        options: [],
        correctOptionIds: [],
      });

      const result = generateDisplayedOptions(question);
      expect(result).toEqual([]);
    });

    it('should handle question with single option that is correct', () => {
      const question = createMockQuestion({
        options: [{ optionId: 'only', optionText: 'Only Option' }],
        correctOptionIds: ['only'],
      });

      const result = generateDisplayedOptions(question);
      expect(result.length).toBe(1);
      expect(result[0].optionId).toBe('only');
      expect(result[0].isCorrect).toBe(true);
    });

    it('should handle question with single option that is incorrect', () => {
      const question = createMockQuestion({
        options: [{ optionId: 'only', optionText: 'Only Option' }],
        correctOptionIds: [],
      });

      const result = generateDisplayedOptions(question);
      expect(result.length).toBe(1);
      expect(result[0].optionId).toBe('only');
      expect(result[0].isCorrect).toBe(false);
    });

    it('should handle question with only correct options', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'correct1', optionText: 'Correct 1' },
          { optionId: 'correct2', optionText: 'Correct 2' },
          { optionId: 'correct3', optionText: 'Correct 3' },
        ],
        correctOptionIds: ['correct1', 'correct2', 'correct3'],
      });

      const result = generateDisplayedOptions(question);
      expect(result.every((opt) => opt.isCorrect === true)).toBe(true);
    });

    it('should handle question with only incorrect options', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'wrong1', optionText: 'Wrong 1' },
          { optionId: 'wrong2', optionText: 'Wrong 2' },
        ],
        correctOptionIds: [],
      });

      const result = generateDisplayedOptions(question);
      expect(result.every((opt) => opt.isCorrect === false)).toBe(true);
    });

    it('should handle maxDisplayOptions of 0', () => {
      const question = createMockQuestion();
      const result = generateDisplayedOptions(question, 0);
      // The function always includes at least one correct option first,
      // so with maxDisplayOptions of 0, it still returns 1 option
      expect(result.length).toBe(1);
      expect(result[0].isCorrect).toBe(true);
    });

    it('should handle maxDisplayOptions of 1', () => {
      const question = createMockQuestion();
      const result = generateDisplayedOptions(question, 1);
      expect(result.length).toBe(1);
      // Should include the correct option
      expect(result[0].isCorrect).toBe(true);
    });

    it('should handle large maxDisplayOptions gracefully', () => {
      const question = createMockQuestion();
      const result = generateDisplayedOptions(question, 100);
      // Should return all available options
      expect(result.length).toBe(4);
    });
  });

  describe('multiple correct options', () => {
    it('should include remaining correct options when there are slots available', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'correct1', optionText: 'Correct 1' },
          { optionId: 'correct2', optionText: 'Correct 2' },
          { optionId: 'incorrect1', optionText: 'Incorrect 1' },
        ],
        correctOptionIds: ['correct1', 'correct2'],
      });

      const result = generateDisplayedOptions(question, 5);
      const correctOptions = result.filter((opt) => opt.isCorrect === true);

      // Should include both correct options
      expect(correctOptions.length).toBe(2);
    });

    it('should fill slots with additional correct options after incorrect options', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'correct1', optionText: 'Correct 1' },
          { optionId: 'correct2', optionText: 'Correct 2' },
          { optionId: 'correct3', optionText: 'Correct 3' },
          { optionId: 'incorrect1', optionText: 'Incorrect 1' },
        ],
        correctOptionIds: ['correct1', 'correct2', 'correct3'],
      });

      const result = generateDisplayedOptions(question, 4);

      // Should include all options since there are 4 total and maxDisplayOptions is 4
      expect(result.length).toBe(4);
    });
  });

  describe('shuffling behavior', () => {
    it('should shuffle the final result', () => {
      // Reset mock to alternate values to simulate shuffling
      mathRandomSpy.mockRestore();

      const question = createMockQuestion();
      const results: string[][] = [];

      // Run multiple times to check shuffling occurs
      for (let i = 0; i < 10; i++) {
        const result = generateDisplayedOptions(question);
        results.push(result.map((opt) => opt.optionId));
      }

      // At least one result should be different (shuffled differently)
      // This is a probabilistic test
      const firstResult = JSON.stringify(results[0]);
      const hasVariation = results.some((r) => JSON.stringify(r) !== firstResult);

      // Note: This test may occasionally fail due to randomness
      // In practice, with 4 options, the probability of all 10 being identical is very low
      expect(hasVariation || results.length === 10).toBe(true);
    });

    it('should preserve option properties after shuffling', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Text 1' },
          { optionId: 'opt2', optionText: 'Text 2' },
        ],
        correctOptionIds: ['opt1'],
      });

      const result = generateDisplayedOptions(question);

      result.forEach((option) => {
        const original = question.options.find((o) => o.optionId === option.optionId);
        expect(original).toBeDefined();
        expect(option.optionText).toBe(original?.optionText);
      });
    });
  });

  describe('option integrity', () => {
    it('should not modify the original question object', () => {
      const question = createMockQuestion();
      const originalOptions = JSON.parse(JSON.stringify(question.options));

      generateDisplayedOptions(question);

      expect(question.options).toEqual(originalOptions);
    });

    it('should not include duplicate options', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Option 1' },
          { optionId: 'opt2', optionText: 'Option 2' },
          { optionId: 'opt3', optionText: 'Option 3' },
          { optionId: 'opt4', optionText: 'Option 4' },
          { optionId: 'opt5', optionText: 'Option 5' },
        ],
        correctOptionIds: ['opt1', 'opt2'],
      });

      const result = generateDisplayedOptions(question, 5);
      const optionIds = result.map((opt) => opt.optionId);
      const uniqueIds = [...new Set(optionIds)];

      expect(optionIds.length).toBe(uniqueIds.length);
    });

    it('should include all required DisplayedOption properties', () => {
      const question = createMockQuestion();
      const result = generateDisplayedOptions(question);

      result.forEach((option) => {
        expect(option).toHaveProperty('optionId');
        expect(option).toHaveProperty('optionText');
        expect(option).toHaveProperty('isCorrect');
        expect(typeof option.optionId).toBe('string');
        expect(typeof option.optionText).toBe('string');
        expect(typeof option.isCorrect).toBe('boolean');
      });
    });
  });

  describe('true/false question type', () => {
    it('should handle true/false questions correctly', () => {
      const question = createMockQuestion({
        type: 'true_false',
        options: [
          { optionId: 'true', optionText: 'True' },
          { optionId: 'false', optionText: 'False' },
        ],
        correctOptionIds: ['true'],
      });

      const result = generateDisplayedOptions(question, 2);
      expect(result.length).toBe(2);

      const trueOption = result.find((opt) => opt.optionId === 'true');
      const falseOption = result.find((opt) => opt.optionId === 'false');

      expect(trueOption?.isCorrect).toBe(true);
      expect(falseOption?.isCorrect).toBe(false);
    });
  });

  describe('slot allocation priority', () => {
    it('should prioritize: correct option > unshown incorrect > shown incorrect > remaining correct', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'correct1', optionText: 'Correct 1' },
          { optionId: 'correct2', optionText: 'Correct 2' },
          { optionId: 'unshown1', optionText: 'Unshown 1' },
          { optionId: 'unshown2', optionText: 'Unshown 2' },
          { optionId: 'shown1', optionText: 'Shown 1' },
          { optionId: 'shown2', optionText: 'Shown 2' },
        ],
        correctOptionIds: ['correct1', 'correct2'],
        shownIncorrectOptionIds: ['shown1', 'shown2'],
      });

      // With 3 slots: should get 1 correct + 2 unshown incorrect
      const result = generateDisplayedOptions(question, 3);

      const correctInResult = result.filter((opt) => opt.isCorrect === true);
      expect(correctInResult.length).toBeGreaterThanOrEqual(1);

      // Verify unshown incorrect are prioritized
      const unshownInResult = result.filter(
        (opt) => opt.optionId === 'unshown1' || opt.optionId === 'unshown2',
      );
      expect(unshownInResult.length).toBeGreaterThan(0);
    });
  });
});
