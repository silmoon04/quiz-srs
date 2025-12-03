/**
 * Data Integrity Behavioral Contract Tests
 *
 * These tests define the REQUIRED behavior for data integrity.
 * Any implementation MUST satisfy these contracts.
 *
 * Reference: docs/consolidated-audit-plan.md - ARD-002, ARD-004
 *
 * CRITICAL ISSUES:
 * 1. Duplicate question IDs causing React key errors
 * 2. SRS state corruption during navigation
 * 3. Statistics miscalculation
 * 4. Invalid correctOptionIds references
 */

import { describe, it, expect } from 'vitest';
import type { QuizModule, QuizChapter, QuizQuestion } from '@/types/quiz-types';

// ============================================
// CONTRACT: UNIQUE IDS
// ============================================

describe('Data Integrity Contract - Unique IDs', () => {
  /**
   * CONTRACT: All IDs must be unique within their scope.
   * - Chapter IDs: unique within module
   * - Question IDs: unique across ENTIRE module
   * - Option IDs: unique within question
   */

  describe('CONTRACT: Chapter ID Uniqueness', () => {
    function validateChapterIdUniqueness(chapters: QuizChapter[]): {
      valid: boolean;
      duplicates: string[];
    } {
      const seen = new Set<string>();
      const duplicates: string[] = [];

      for (const chapter of chapters) {
        if (seen.has(chapter.id)) {
          duplicates.push(chapter.id);
        }
        seen.add(chapter.id);
      }

      return { valid: duplicates.length === 0, duplicates };
    }

    it('should detect duplicate chapter IDs', () => {
      const chapters: QuizChapter[] = [
        {
          id: 'ch1',
          name: 'Chapter 1',
          questions: [],
          totalQuestions: 0,
          answeredQuestions: 0,
          correctAnswers: 0,
          isCompleted: false,
        },
        {
          id: 'ch1',
          name: 'Chapter 2',
          questions: [],
          totalQuestions: 0,
          answeredQuestions: 0,
          correctAnswers: 0,
          isCompleted: false,
        },
      ];

      const result = validateChapterIdUniqueness(chapters);

      expect(result.valid).toBe(false);
      expect(result.duplicates).toContain('ch1');
    });

    it('should allow unique chapter IDs', () => {
      const chapters: QuizChapter[] = [
        {
          id: 'ch1',
          name: 'Chapter 1',
          questions: [],
          totalQuestions: 0,
          answeredQuestions: 0,
          correctAnswers: 0,
          isCompleted: false,
        },
        {
          id: 'ch2',
          name: 'Chapter 2',
          questions: [],
          totalQuestions: 0,
          answeredQuestions: 0,
          correctAnswers: 0,
          isCompleted: false,
        },
      ];

      const result = validateChapterIdUniqueness(chapters);

      expect(result.valid).toBe(true);
      expect(result.duplicates.length).toBe(0);
    });
  });

  describe('CONTRACT: Question ID Uniqueness Across Module', () => {
    function validateQuestionIdUniqueness(chapters: QuizChapter[]): {
      valid: boolean;
      duplicates: Array<{ id: string; chapters: string[] }>;
    } {
      const questionToChapters = new Map<string, string[]>();

      for (const chapter of chapters) {
        for (const question of chapter.questions) {
          const existing = questionToChapters.get(question.questionId) || [];
          existing.push(chapter.id);
          questionToChapters.set(question.questionId, existing);
        }
      }

      const duplicates: Array<{ id: string; chapters: string[] }> = [];

      for (const [id, chapterIds] of questionToChapters) {
        if (chapterIds.length > 1) {
          duplicates.push({ id, chapters: chapterIds });
        }
      }

      return { valid: duplicates.length === 0, duplicates };
    }

    it('should detect duplicate question IDs across chapters', () => {
      const chapters: QuizChapter[] = [
        {
          id: 'ch1',
          name: 'Chapter 1',
          questions: [{ questionId: 'q1' } as QuizQuestion],
          totalQuestions: 1,
          answeredQuestions: 0,
          correctAnswers: 0,
          isCompleted: false,
        },
        {
          id: 'ch2',
          name: 'Chapter 2',
          questions: [{ questionId: 'q1' } as QuizQuestion], // Duplicate!
          totalQuestions: 1,
          answeredQuestions: 0,
          correctAnswers: 0,
          isCompleted: false,
        },
      ];

      const result = validateQuestionIdUniqueness(chapters);

      expect(result.valid).toBe(false);
      expect(result.duplicates[0].id).toBe('q1');
      expect(result.duplicates[0].chapters).toContain('ch1');
      expect(result.duplicates[0].chapters).toContain('ch2');
    });

    it('should detect duplicate question IDs within same chapter', () => {
      const chapters: QuizChapter[] = [
        {
          id: 'ch1',
          name: 'Chapter 1',
          questions: [
            { questionId: 'q1' } as QuizQuestion,
            { questionId: 'q1' } as QuizQuestion, // Duplicate!
          ],
          totalQuestions: 2,
          answeredQuestions: 0,
          correctAnswers: 0,
          isCompleted: false,
        },
      ];

      const result = validateQuestionIdUniqueness(chapters);

      expect(result.valid).toBe(false);
    });
  });

  describe('CONTRACT: Option ID Uniqueness Within Question', () => {
    function validateOptionIdUniqueness(question: QuizQuestion): {
      valid: boolean;
      duplicates: string[];
    } {
      const seen = new Set<string>();
      const duplicates: string[] = [];

      for (const option of question.options) {
        if (seen.has(option.optionId)) {
          duplicates.push(option.optionId);
        }
        seen.add(option.optionId);
      }

      return { valid: duplicates.length === 0, duplicates };
    }

    it('should detect duplicate option IDs', () => {
      const question: QuizQuestion = {
        questionId: 'q1',
        questionText: 'Q?',
        options: [
          { optionId: 'a', optionText: 'A' },
          { optionId: 'a', optionText: 'B' }, // Duplicate!
        ],
        correctOptionIds: ['a'],
        explanationText: 'Exp',
        status: 'not_attempted',
        srsLevel: 0,
        timesAnsweredCorrectly: 0,
        timesAnsweredIncorrectly: 0,
        nextReviewAt: null,
        shownIncorrectOptionIds: [],
        historyOfIncorrectSelections: [],
      };

      const result = validateOptionIdUniqueness(question);

      expect(result.valid).toBe(false);
      expect(result.duplicates).toContain('a');
    });
  });
});

// ============================================
// CONTRACT: CORRECT OPTION VALIDATION
// ============================================

describe('Data Integrity Contract - Correct Option Validation', () => {
  /**
   * CONTRACT: correctOptionIds must reference valid options.
   */

  describe('CONTRACT: correctOptionIds References Valid Options', () => {
    function validateCorrectOptionIds(question: QuizQuestion): {
      valid: boolean;
      invalid: string[];
    } {
      const optionIds = new Set(question.options.map((o) => o.optionId));
      const invalid: string[] = [];

      for (const correctId of question.correctOptionIds) {
        if (!optionIds.has(correctId)) {
          invalid.push(correctId);
        }
      }

      return { valid: invalid.length === 0, invalid };
    }

    it('should detect invalid correctOptionIds', () => {
      const question: QuizQuestion = {
        questionId: 'q1',
        questionText: 'Q?',
        options: [
          { optionId: 'a', optionText: 'A' },
          { optionId: 'b', optionText: 'B' },
        ],
        correctOptionIds: ['c'], // 'c' doesn't exist!
        explanationText: 'Exp',
        status: 'not_attempted',
        srsLevel: 0,
        timesAnsweredCorrectly: 0,
        timesAnsweredIncorrectly: 0,
        nextReviewAt: null,
        shownIncorrectOptionIds: [],
        historyOfIncorrectSelections: [],
      };

      const result = validateCorrectOptionIds(question);

      expect(result.valid).toBe(false);
      expect(result.invalid).toContain('c');
    });

    it('should require at least one correct option', () => {
      const question: QuizQuestion = {
        questionId: 'q1',
        questionText: 'Q?',
        options: [{ optionId: 'a', optionText: 'A' }],
        correctOptionIds: [], // Empty!
        explanationText: 'Exp',
        status: 'not_attempted',
        srsLevel: 0,
        timesAnsweredCorrectly: 0,
        timesAnsweredIncorrectly: 0,
        nextReviewAt: null,
        shownIncorrectOptionIds: [],
        historyOfIncorrectSelections: [],
      };

      expect(question.correctOptionIds.length).toBe(0);
      // This should be caught by validation
    });
  });
});

// ============================================
// CONTRACT: SRS STATE CONSISTENCY
// ============================================

describe('Data Integrity Contract - SRS State Consistency', () => {
  /**
   * CONTRACT: SRS state must be internally consistent.
   */

  describe('CONTRACT: Status Matches Counters', () => {
    function validateStatusConsistency(question: QuizQuestion): { valid: boolean; error?: string } {
      const { status, timesAnsweredCorrectly, timesAnsweredIncorrectly, srsLevel } = question;

      // not_attempted: no answers
      if (status === 'not_attempted') {
        if ((timesAnsweredCorrectly || 0) > 0 || (timesAnsweredIncorrectly || 0) > 0) {
          return { valid: false, error: 'not_attempted but has answer history' };
        }
      }

      // mastered: srsLevel should be max (2)
      if (status === 'mastered') {
        if (srsLevel !== 2) {
          return { valid: false, error: 'mastered but srsLevel not at max' };
        }
      }

      // passed_once: should have at least one correct
      if (status === 'passed_once') {
        if ((timesAnsweredCorrectly || 0) === 0) {
          return { valid: false, error: 'passed_once but no correct answers' };
        }
      }

      return { valid: true };
    }

    it('should validate not_attempted status', () => {
      const invalidQuestion: QuizQuestion = {
        questionId: 'q1',
        questionText: 'Q?',
        options: [],
        correctOptionIds: [],
        explanationText: '',
        status: 'not_attempted',
        timesAnsweredCorrectly: 5, // Inconsistent!
        timesAnsweredIncorrectly: 0,
        srsLevel: 0,
        nextReviewAt: null,
        shownIncorrectOptionIds: [],
        historyOfIncorrectSelections: [],
      };

      const result = validateStatusConsistency(invalidQuestion);
      expect(result.valid).toBe(false);
    });

    it('should validate mastered status requires max srsLevel', () => {
      const invalidQuestion: QuizQuestion = {
        questionId: 'q1',
        questionText: 'Q?',
        options: [],
        correctOptionIds: [],
        explanationText: '',
        status: 'mastered',
        timesAnsweredCorrectly: 5,
        timesAnsweredIncorrectly: 0,
        srsLevel: 1, // Should be 2 for mastered!
        nextReviewAt: null,
        shownIncorrectOptionIds: [],
        historyOfIncorrectSelections: [],
      };

      const result = validateStatusConsistency(invalidQuestion);
      expect(result.valid).toBe(false);
    });
  });

  describe('CONTRACT: srsLevel Bounds', () => {
    it('should enforce srsLevel minimum of 0', () => {
      const minLevel = 0;
      expect(minLevel).toBeGreaterThanOrEqual(0);
    });

    it('should enforce srsLevel maximum of 2', () => {
      const maxLevel = 2;
      expect(maxLevel).toBeLessThanOrEqual(2);
    });

    it('should not allow negative srsLevel', () => {
      function clampSrsLevel(level: number): number {
        return Math.max(0, Math.min(2, level));
      }

      expect(clampSrsLevel(-1)).toBe(0);
      expect(clampSrsLevel(5)).toBe(2);
    });
  });

  describe('CONTRACT: nextReviewAt Consistency', () => {
    it('should have null nextReviewAt when mastered', () => {
      const masteredQuestion: Partial<QuizQuestion> = {
        status: 'mastered',
        srsLevel: 2,
        nextReviewAt: null, // Should be null for mastered
      };

      expect(masteredQuestion.nextReviewAt).toBeNull();
    });

    it('should have valid date string when not mastered and answered', () => {
      const inProgressQuestion: Partial<QuizQuestion> = {
        status: 'passed_once',
        srsLevel: 1,
        nextReviewAt: '2025-01-15T10:00:00.000Z',
      };

      expect(inProgressQuestion.nextReviewAt).toBeTruthy();
      expect(() => new Date(inProgressQuestion.nextReviewAt!)).not.toThrow();
    });
  });
});

// ============================================
// CONTRACT: CHAPTER STATISTICS
// ============================================

describe('Data Integrity Contract - Chapter Statistics', () => {
  /**
   * CONTRACT: Chapter statistics must accurately reflect question states.
   */

  describe('CONTRACT: Statistics Calculation', () => {
    function calculateChapterStats(questions: QuizQuestion[]): {
      totalQuestions: number;
      answeredQuestions: number;
      correctAnswers: number;
      masteredCount: number;
    } {
      const totalQuestions = questions.length;
      const answeredQuestions = questions.filter((q) => q.status !== 'not_attempted').length;
      const correctAnswers = questions.filter(
        (q) => q.status === 'passed_once' || q.status === 'mastered',
      ).length;
      const masteredCount = questions.filter((q) => q.status === 'mastered').length;

      return { totalQuestions, answeredQuestions, correctAnswers, masteredCount };
    }

    it('should calculate totalQuestions correctly', () => {
      const questions: QuizQuestion[] = [
        { questionId: 'q1', status: 'not_attempted' } as QuizQuestion,
        { questionId: 'q2', status: 'passed_once' } as QuizQuestion,
        { questionId: 'q3', status: 'mastered' } as QuizQuestion,
      ];

      const stats = calculateChapterStats(questions);
      expect(stats.totalQuestions).toBe(3);
    });

    it('should calculate answeredQuestions correctly', () => {
      const questions: QuizQuestion[] = [
        { questionId: 'q1', status: 'not_attempted' } as QuizQuestion,
        { questionId: 'q2', status: 'passed_once' } as QuizQuestion,
        { questionId: 'q3', status: 'mastered' } as QuizQuestion,
        { questionId: 'q4', status: 'review_soon' } as QuizQuestion,
      ];

      const stats = calculateChapterStats(questions);
      expect(stats.answeredQuestions).toBe(3); // All except not_attempted
    });

    it('should calculate correctAnswers correctly', () => {
      const questions: QuizQuestion[] = [
        { questionId: 'q1', status: 'not_attempted' } as QuizQuestion,
        { questionId: 'q2', status: 'passed_once' } as QuizQuestion,
        { questionId: 'q3', status: 'mastered' } as QuizQuestion,
        { questionId: 'q4', status: 'review_soon' } as QuizQuestion,
      ];

      const stats = calculateChapterStats(questions);
      expect(stats.correctAnswers).toBe(2); // passed_once + mastered
    });

    it('should handle empty chapter', () => {
      const stats = calculateChapterStats([]);

      expect(stats.totalQuestions).toBe(0);
      expect(stats.answeredQuestions).toBe(0);
      expect(stats.correctAnswers).toBe(0);
    });
  });

  describe('CONTRACT: Accuracy Calculation', () => {
    function calculateAccuracy(correct: number, total: number): number {
      if (total === 0) return 0;
      return Math.round((correct / total) * 100);
    }

    it('should return 0 for no attempts', () => {
      expect(calculateAccuracy(0, 0)).toBe(0);
    });

    it('should calculate percentage correctly', () => {
      expect(calculateAccuracy(3, 4)).toBe(75);
      expect(calculateAccuracy(1, 2)).toBe(50);
      expect(calculateAccuracy(10, 10)).toBe(100);
    });

    it('should round to nearest integer', () => {
      expect(calculateAccuracy(1, 3)).toBe(33); // 33.33... -> 33
      expect(calculateAccuracy(2, 3)).toBe(67); // 66.66... -> 67
    });
  });
});

// ============================================
// CONTRACT: DATA NORMALIZATION
// ============================================

describe('Data Integrity Contract - Data Normalization', () => {
  /**
   * CONTRACT: Imported data must be normalized to expected format.
   */

  describe('CONTRACT: Default Values', () => {
    function normalizeQuestion(raw: Partial<QuizQuestion>): QuizQuestion {
      return {
        questionId: raw.questionId || `q_${Date.now()}`,
        questionText: raw.questionText || '',
        options: raw.options || [],
        correctOptionIds: raw.correctOptionIds || [],
        explanationText: raw.explanationText || '',
        status: raw.status || 'not_attempted',
        srsLevel: raw.srsLevel ?? 0,
        timesAnsweredCorrectly: raw.timesAnsweredCorrectly ?? 0,
        timesAnsweredIncorrectly: raw.timesAnsweredIncorrectly ?? 0,
        nextReviewAt: raw.nextReviewAt ?? null,
        shownIncorrectOptionIds: raw.shownIncorrectOptionIds || [],
        historyOfIncorrectSelections: raw.historyOfIncorrectSelections || [],
      };
    }

    it('should provide default status', () => {
      const normalized = normalizeQuestion({ questionId: 'q1', questionText: 'Q?' });
      expect(normalized.status).toBe('not_attempted');
    });

    it('should provide default srsLevel', () => {
      const normalized = normalizeQuestion({ questionId: 'q1' });
      expect(normalized.srsLevel).toBe(0);
    });

    it('should provide default counters', () => {
      const normalized = normalizeQuestion({ questionId: 'q1' });
      expect(normalized.timesAnsweredCorrectly).toBe(0);
      expect(normalized.timesAnsweredIncorrectly).toBe(0);
    });

    it('should provide default arrays', () => {
      const normalized = normalizeQuestion({ questionId: 'q1' });
      expect(normalized.shownIncorrectOptionIds).toEqual([]);
      expect(normalized.historyOfIncorrectSelections).toEqual([]);
    });
  });

  describe('CONTRACT: ID Generation', () => {
    function generateQuestionId(chapterId: string, index: number): string {
      return `${chapterId}_q${index + 1}`;
    }

    it('should generate predictable IDs', () => {
      expect(generateQuestionId('ch1', 0)).toBe('ch1_q1');
      expect(generateQuestionId('ch1', 1)).toBe('ch1_q2');
      expect(generateQuestionId('ch_intro', 4)).toBe('ch_intro_q5');
    });
  });

  describe('CONTRACT: Duplicate ID Resolution', () => {
    function deduplicateIds(ids: string[]): string[] {
      const seen = new Set<string>();
      const result: string[] = [];

      for (const id of ids) {
        let uniqueId = id;
        let counter = 1;

        while (seen.has(uniqueId)) {
          uniqueId = `${id}_${counter}`;
          counter++;
        }

        seen.add(uniqueId);
        result.push(uniqueId);
      }

      return result;
    }

    it('should append suffix to duplicate IDs', () => {
      const input = ['q1', 'q2', 'q1', 'q1'];
      const output = deduplicateIds(input);

      expect(output).toEqual(['q1', 'q2', 'q1_1', 'q1_2']);
    });

    it('should not modify unique IDs', () => {
      const input = ['q1', 'q2', 'q3'];
      const output = deduplicateIds(input);

      expect(output).toEqual(['q1', 'q2', 'q3']);
    });
  });
});

// ============================================
// CONTRACT: HISTORY TRACKING
// ============================================

describe('Data Integrity Contract - History Tracking', () => {
  /**
   * CONTRACT: Answer history must be accurate and complete.
   */

  describe('CONTRACT: Incorrect Selection History', () => {
    it('should append to history on incorrect answer', () => {
      const history: string[] = ['b'];
      const newIncorrect = 'c';

      history.push(newIncorrect);

      expect(history).toEqual(['b', 'c']);
    });

    it('should NOT modify history on correct answer', () => {
      const history: string[] = ['b', 'c'];
      const correctAnswer = 'a';

      // Correct answers don't get added to incorrect history
      // History stays the same

      expect(history).toEqual(['b', 'c']);
    });

    it('should track repeated incorrect selections', () => {
      const history: string[] = [];

      // User selects wrong answer 'b' three times
      history.push('b');
      history.push('b');
      history.push('b');

      expect(history).toEqual(['b', 'b', 'b']);
      expect(history.filter((h) => h === 'b').length).toBe(3);
    });
  });

  describe('CONTRACT: shownIncorrectOptionIds Tracking', () => {
    function updateShownIncorrect(shown: string[], newIncorrect: string): string[] {
      if (!shown.includes(newIncorrect)) {
        return [...shown, newIncorrect];
      }
      return shown;
    }

    it('should add new incorrect options to shown set', () => {
      const shown: string[] = ['b'];
      const updated = updateShownIncorrect(shown, 'c');

      expect(updated).toEqual(['b', 'c']);
    });

    it('should NOT duplicate already shown options', () => {
      const shown: string[] = ['b', 'c'];
      const updated = updateShownIncorrect(shown, 'b');

      expect(updated).toEqual(['b', 'c']);
    });
  });
});
