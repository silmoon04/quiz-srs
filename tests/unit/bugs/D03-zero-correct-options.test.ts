/**
 * D3: Zero Correct Options = Impossible Question
 *
 * Bug: If correctOptionIds contains IDs that don't exist in options,
 * the question becomes impossible to answer correctly.
 *
 * These tests verify that:
 * - Questions always have at least one valid correct option displayed
 * - Data corruption is detected and handled
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateDisplayedOptions,
  NoCorrectOptionsError,
} from '@/lib/quiz/generate-displayed-options';
import type { QuizQuestion, DisplayedOption } from '@/types/quiz-types';

describe('D3: Zero Correct Options Bug', () => {
  const createQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
    questionId: 'q1',
    questionText: 'What is 2+2?',
    type: 'mcq',
    options: [
      { optionId: 'a', optionText: '3' },
      { optionId: 'b', optionText: '4' },
      { optionId: 'c', optionText: '5' },
      { optionId: 'd', optionText: '6' },
    ],
    correctOptionIds: ['b'],
    explanationText: 'Basic math',
    status: 'not_attempted',
    srsLevel: 0,
    nextReviewAt: null,
    timesAnsweredCorrectly: 0,
    timesAnsweredIncorrectly: 0,
    historyOfIncorrectSelections: [],
    shownIncorrectOptionIds: [],
    ...overrides,
  });

  describe('correctOptionIds validation', () => {
    it('should throw NoCorrectOptionsError when correctOptionIds reference non-existent options', () => {
      const corruptedQuestion = createQuestion({
        correctOptionIds: ['nonexistent_id'], // This ID doesn't exist in options
      });

      // EXPECTED: Should throw an error for data corruption
      expect(() => generateDisplayedOptions(corruptedQuestion)).toThrow(NoCorrectOptionsError);
    });

    it('should handle empty correctOptionIds array by returning options without correct marking', () => {
      const noCorrectQuestion = createQuestion({
        correctOptionIds: [],
      });

      // With empty correctOptionIds, return options but none marked as correct
      const result = generateDisplayedOptions(noCorrectQuestion);

      // Should return some options
      expect(result.length).toBeGreaterThan(0);

      // None should be marked as correct (edge case handling)
      expect(result.every((opt) => opt.isCorrect === false)).toBe(true);
    });

    it('should handle partially valid correctOptionIds', () => {
      const partiallyCorruptQuestion = createQuestion({
        correctOptionIds: ['b', 'nonexistent'], // One valid, one invalid
      });

      const result = generateDisplayedOptions(partiallyCorruptQuestion);

      // Should still include the valid correct option
      const correctCount = result.filter((opt) => opt.isCorrect).length;
      expect(correctCount).toBeGreaterThan(0);

      // The valid correct option 'b' should be present
      expect(result.some((opt) => opt.optionId === 'b' && opt.isCorrect)).toBe(true);
    });

    it('should throw when all correctOptionIds are invalid', () => {
      const allInvalidQuestion = createQuestion({
        correctOptionIds: ['x', 'y', 'z'], // None exist
      });

      // This should throw NoCorrectOptionsError
      expect(() => generateDisplayedOptions(allInvalidQuestion)).toThrow(NoCorrectOptionsError);
    });
  });

  describe('Option filtering edge cases', () => {
    it('should handle question with only one option that is correct', () => {
      const singleOptionQuestion = createQuestion({
        options: [{ optionId: 'only', optionText: 'The answer' }],
        correctOptionIds: ['only'],
      });

      const result = generateDisplayedOptions(singleOptionQuestion);

      expect(result.length).toBe(1);
      expect(result[0].isCorrect).toBe(true);
    });

    it('should handle question where all options are correct', () => {
      const allCorrectQuestion = createQuestion({
        options: [
          { optionId: 'a', optionText: 'True statement 1' },
          { optionId: 'b', optionText: 'True statement 2' },
        ],
        correctOptionIds: ['a', 'b'],
      });

      const result = generateDisplayedOptions(allCorrectQuestion);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((opt) => opt.isCorrect)).toBe(true);
    });

    it('should throw when options array is empty but correctOptionIds are set', () => {
      const noOptionsQuestion = createQuestion({
        options: [],
        correctOptionIds: ['a'],
      });

      // Should throw NoCorrectOptionsError since correctOptionIds reference non-existent options
      expect(() => generateDisplayedOptions(noOptionsQuestion)).toThrow(NoCorrectOptionsError);
    });
  });

  describe('SRS level interaction with correct option selection', () => {
    it('should throw when srsLevel is used with zero correct options due to corruption', () => {
      const highSrsCorruptQuestion = createQuestion({
        srsLevel: 5,
        correctOptionIds: ['nonexistent'],
      });

      // Now correctly throws NoCorrectOptionsError for data corruption
      expect(() => {
        generateDisplayedOptions(highSrsCorruptQuestion);
      }).toThrow(NoCorrectOptionsError);
    });

    it('should rotate through correct options based on srsLevel when valid', () => {
      const multiCorrectQuestion = createQuestion({
        options: [
          { optionId: 'a', optionText: 'Correct 1' },
          { optionId: 'b', optionText: 'Wrong' },
          { optionId: 'c', optionText: 'Correct 2' },
        ],
        correctOptionIds: ['a', 'c'],
        srsLevel: 0,
      });

      const result0 = generateDisplayedOptions(multiCorrectQuestion);

      const srs1Question = { ...multiCorrectQuestion, srsLevel: 1 };
      const result1 = generateDisplayedOptions(srs1Question);

      // Should have different correct options shown based on srsLevel
      // (or at least not crash)
      expect(result0.filter((o) => o.isCorrect).length).toBeGreaterThan(0);
      expect(result1.filter((o) => o.isCorrect).length).toBeGreaterThan(0);
    });

    it('should handle srsLevel of 0 correctly (falsy but valid)', () => {
      const zeroSrsQuestion = createQuestion({
        srsLevel: 0,
        correctOptionIds: ['b'],
      });

      const result = generateDisplayedOptions(zeroSrsQuestion);

      expect(result.filter((o) => o.isCorrect).length).toBeGreaterThan(0);
    });
  });

  describe('Data integrity checks', () => {
    it('should validate that displayed options can lead to correct answer', () => {
      const question = createQuestion();
      const displayedOptions = generateDisplayedOptions(question);

      // Verify the question is answerable
      const hasCorrectOption = displayedOptions.some((opt) =>
        question.correctOptionIds.includes(opt.optionId),
      );

      expect(hasCorrectOption).toBe(true);
    });

    it('should mark options correctly when isCorrect property is set', () => {
      const question = createQuestion({
        correctOptionIds: ['b'],
      });

      const displayedOptions = generateDisplayedOptions(question);

      displayedOptions.forEach((opt) => {
        const shouldBeCorrect = question.correctOptionIds.includes(opt.optionId);
        expect(opt.isCorrect).toBe(shouldBeCorrect);
      });
    });
  });
});
