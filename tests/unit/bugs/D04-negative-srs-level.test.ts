/**
 * D4: srsLevel || 0 Treats Negative Values as Valid
 *
 * Bug: The pattern `srsLevel || 0` treats negative numbers as valid because
 * they're truthy. If imported data has srsLevel: -1, calculations produce
 * incorrect results.
 *
 * These tests verify proper handling of negative and invalid srsLevel values.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  normalizeSingleQuestion,
  normalizeQuizModule,
  validateSingleQuestion,
} from '@/utils/quiz-validation-refactored';
import type { QuizQuestion } from '@/types/quiz-types';

describe('D4: srsLevel Negative Value Bug', () => {
  const createValidQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
    questionId: 'q1',
    questionText: 'Test question',
    type: 'mcq',
    options: [
      { optionId: 'a', optionText: 'Option A' },
      { optionId: 'b', optionText: 'Option B' },
    ],
    correctOptionIds: ['a'],
    explanationText: 'Explanation',
    status: 'not_attempted',
    srsLevel: 0,
    nextReviewAt: null,
    timesAnsweredCorrectly: 0,
    timesAnsweredIncorrectly: 0,
    historyOfIncorrectSelections: [],
    shownIncorrectOptionIds: [],
    ...overrides,
  });

  describe('srsLevel validation', () => {
    it('should reject or clamp negative srsLevel values', () => {
      const negativeQuestion = createValidQuestion({
        srsLevel: -5,
      });

      const normalized = normalizeSingleQuestion(negativeQuestion);

      // EXPECTED: srsLevel should be clamped to 0 or validation should fail
      // BUG: Currently passes through as -5
      expect(normalized.srsLevel).toBeGreaterThanOrEqual(0);
    });

    it('should clamp srsLevel to maximum of 2', () => {
      const highSrsQuestion = createValidQuestion({
        srsLevel: 100,
      });

      const normalized = normalizeSingleQuestion(highSrsQuestion);

      // srsLevel should be capped at 2 (mastered)
      expect(normalized.srsLevel).toBeLessThanOrEqual(2);
    });

    it('should handle srsLevel of -1 specifically', () => {
      const minusOneQuestion = createValidQuestion({
        srsLevel: -1,
      });

      const normalized = normalizeSingleQuestion(minusOneQuestion);

      // After normalization, srsLevel + 1 should still be >= 1
      const newSrsLevel = Math.min((normalized.srsLevel || 0) + 1, 2);
      expect(newSrsLevel).toBeGreaterThanOrEqual(1);
    });

    it('should handle srsLevel of NaN', () => {
      const nanQuestion = createValidQuestion({
        srsLevel: NaN as any,
      });

      const normalized = normalizeSingleQuestion(nanQuestion);

      // Should be normalized to a valid number
      expect(Number.isNaN(normalized.srsLevel)).toBe(false);
      expect(normalized.srsLevel).toBeGreaterThanOrEqual(0);
    });

    it('should handle srsLevel of Infinity', () => {
      const infinityQuestion = createValidQuestion({
        srsLevel: Infinity as any,
      });

      const normalized = normalizeSingleQuestion(infinityQuestion);

      // Should be normalized to a valid finite number
      expect(Number.isFinite(normalized.srsLevel)).toBe(true);
      expect(normalized.srsLevel).toBeLessThanOrEqual(2);
    });
  });

  describe('SRS calculation correctness', () => {
    it('should calculate correct new srsLevel when starting from negative', () => {
      // Simulate the calculation done in handleSubmitAnswer
      const startingSrsLevel = -1;
      const newSrsLevel = Math.min((startingSrsLevel || 0) + 1, 2);

      // BUG: -1 is truthy, so || 0 doesn't trigger
      // Result: Math.min(-1 + 1, 2) = 0
      // This seems correct but is accidental - the bug is the data shouldn't be -1
      expect(newSrsLevel).toBeGreaterThanOrEqual(0);
    });

    it('should ensure srsLevel progression is always forward or reset to 0', () => {
      const levels = [-5, -1, 0, 1, 2, 3, 100];

      levels.forEach((startLevel) => {
        const question = createValidQuestion({ srsLevel: startLevel });
        const normalized = normalizeSingleQuestion(question);

        // After correct answer, should progress to next level (max 2)
        const afterCorrect = Math.min((normalized.srsLevel || 0) + 1, 2);

        expect(afterCorrect).toBeGreaterThanOrEqual(0);
        expect(afterCorrect).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('timesAnswered validation', () => {
    it('should clamp negative timesAnsweredCorrectly to 0', () => {
      const negativeCorrectQuestion = createValidQuestion({
        timesAnsweredCorrectly: -10,
      });

      const normalized = normalizeSingleQuestion(negativeCorrectQuestion);

      // Should not be negative
      expect(normalized.timesAnsweredCorrectly).toBeGreaterThanOrEqual(0);
    });

    it('should clamp negative timesAnsweredIncorrectly to 0', () => {
      const negativeIncorrectQuestion = createValidQuestion({
        timesAnsweredIncorrectly: -5,
      });

      const normalized = normalizeSingleQuestion(negativeIncorrectQuestion);

      expect(normalized.timesAnsweredIncorrectly).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Status and srsLevel consistency', () => {
    it('should ensure mastered status only with srsLevel >= 2', () => {
      const inconsistentQuestion = createValidQuestion({
        status: 'mastered',
        srsLevel: 0,
      });

      const normalized = normalizeSingleQuestion(inconsistentQuestion);

      // Status should match srsLevel
      if (normalized.status === 'mastered') {
        expect(normalized.srsLevel).toBeGreaterThanOrEqual(2);
      }
    });

    it('should correct status when srsLevel indicates mastery', () => {
      const highLevelNotMastered = createValidQuestion({
        status: 'passed_once',
        srsLevel: 2,
      });

      const normalized = normalizeSingleQuestion(highLevelNotMastered);

      // If srsLevel is 2, status should be mastered
      if (typeof normalized.srsLevel === 'number' && normalized.srsLevel >= 2) {
        expect(normalized.status).toBe('mastered');
      }
    });

    it('should handle undefined srsLevel correctly', () => {
      const undefinedSrs: any = createValidQuestion();
      delete undefinedSrs.srsLevel;

      const normalized = normalizeSingleQuestion(undefinedSrs);

      // Should default to 0, not undefined
      expect(normalized.srsLevel).toBe(0);
    });
  });

  describe('Module-level validation', () => {
    it('should normalize all questions in a module with invalid srsLevels', () => {
      const moduleWithBadSrs = {
        name: 'Test Module',
        chapters: [
          {
            id: 'ch1',
            title: 'Chapter 1',
            questions: [
              createValidQuestion({ questionId: 'q1', srsLevel: -5 }),
              createValidQuestion({ questionId: 'q2', srsLevel: 100 }),
              createValidQuestion({ questionId: 'q3', srsLevel: NaN as any }),
            ],
          },
        ],
      };

      const normalized = normalizeQuizModule(moduleWithBadSrs);

      normalized.chapters[0].questions.forEach((q) => {
        expect(q.srsLevel).toBeGreaterThanOrEqual(0);
        expect(q.srsLevel).toBeLessThanOrEqual(2);
        expect(Number.isFinite(q.srsLevel)).toBe(true);
      });
    });
  });

  describe('Validation errors for invalid srsLevel', () => {
    it('should report validation error for negative srsLevel', () => {
      const invalidQuestion = createValidQuestion({ srsLevel: -1 });

      const result = validateSingleQuestion(invalidQuestion);

      // Should either fail validation or be auto-corrected
      // Currently, validation likely passes - this test should fail
      if (result.isValid) {
        // If valid, the normalization should have fixed it
        const normalized = normalizeSingleQuestion(invalidQuestion);
        expect(normalized.srsLevel).toBeGreaterThanOrEqual(0);
      } else {
        expect(
          result.errors.some(
            (e) => e.toLowerCase().includes('srs') || e.toLowerCase().includes('level'),
          ),
        ).toBe(true);
      }
    });
  });
});
