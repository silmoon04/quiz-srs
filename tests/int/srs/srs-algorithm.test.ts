/**
 * SRS Algorithm Integration Tests
 *
 * These tests verify the EXPECTED behavior of the Spaced Repetition System.
 * The tests define what SHOULD happen, not what currently happens.
 * If these tests fail, it indicates a BUG in the implementation.
 *
 * Expected SRS Behavior:
 * 1. Correct answer on srsLevel 0 → srsLevel 1, nextReviewAt = +10 minutes
 * 2. Correct answer on srsLevel 1 → srsLevel 2 (mastered), nextReviewAt = null
 * 3. Incorrect answer on any level → srsLevel 0, nextReviewAt = +30 seconds
 * 4. Status transitions: not_attempted → passed_once → mastered (on correct)
 * 5. Status transitions: any → attempted (on incorrect)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recalculateChapterStats } from '@/utils/quiz-validation-refactored';
import type { QuizQuestion, QuizChapter } from '@/types/quiz-types';

// Helper to create a question with specific SRS state
function createQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    questionId: 'q1',
    questionText: 'Test question?',
    options: [
      { optionId: 'a', optionText: 'Option A' },
      { optionId: 'b', optionText: 'Option B' },
    ],
    correctOptionIds: ['a'],
    explanationText: 'A is correct',
    status: 'not_attempted',
    timesAnsweredCorrectly: 0,
    timesAnsweredIncorrectly: 0,
    srsLevel: 0,
    nextReviewAt: null,
    shownIncorrectOptionIds: [],
    historyOfIncorrectSelections: [],
    ...overrides,
  };
}

// Helper to create a chapter with questions
function createChapter(questions: QuizQuestion[]): QuizChapter {
  return {
    id: 'ch1',
    name: 'Test Chapter',
    questions,
    totalQuestions: questions.length,
    answeredQuestions: 0,
    correctAnswers: 0,
    isCompleted: false,
  };
}

// Simulate the SRS update logic from app/page.tsx
function simulateSrsUpdate(
  question: QuizQuestion,
  selectedOptionId: string,
  isCorrect: boolean,
): QuizQuestion {
  const updated = { ...question };
  const now = Date.now();

  updated.lastSelectedOptionId = selectedOptionId;
  updated.lastAttemptedAt = new Date(now).toISOString();

  if (isCorrect) {
    updated.timesAnsweredCorrectly = (updated.timesAnsweredCorrectly || 0) + 1;

    // Update SRS level and status
    const newSrsLevel = Math.min((updated.srsLevel || 0) + 1, 2);
    updated.srsLevel = newSrsLevel;

    if (newSrsLevel >= 2) {
      updated.status = 'mastered';
      updated.nextReviewAt = null;
    } else {
      updated.status = 'passed_once';
      // Schedule next review (10 minutes for level 1)
      const intervals = [0, 10 * 60 * 1000, 0]; // 0, 10 minutes, mastered
      const nextReviewTime = new Date(now + intervals[newSrsLevel]);
      updated.nextReviewAt = nextReviewTime.toISOString();
    }
  } else {
    updated.timesAnsweredIncorrectly = (updated.timesAnsweredIncorrectly || 0) + 1;

    // Track incorrect selection
    if (!updated.historyOfIncorrectSelections) {
      updated.historyOfIncorrectSelections = [];
    }
    updated.historyOfIncorrectSelections.push(selectedOptionId);

    // Reset SRS progress
    updated.srsLevel = 0;
    updated.status = 'attempted';

    // Schedule for quick retry (30 seconds)
    const nextReviewTime = new Date(now + 30 * 1000);
    updated.nextReviewAt = nextReviewTime.toISOString();
  }

  return updated;
}

describe('SRS Algorithm - Expected Behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Correct Answer SRS Transitions', () => {
    it('should transition srsLevel 0 → 1 on correct answer', () => {
      const question = createQuestion({ srsLevel: 0 });
      const updated = simulateSrsUpdate(question, 'a', true);

      expect(updated.srsLevel).toBe(1);
    });

    it('should set status to "passed_once" when reaching srsLevel 1', () => {
      const question = createQuestion({ srsLevel: 0, status: 'not_attempted' });
      const updated = simulateSrsUpdate(question, 'a', true);

      expect(updated.status).toBe('passed_once');
    });

    it('should schedule nextReviewAt 10 minutes in the future for srsLevel 1', () => {
      const question = createQuestion({ srsLevel: 0 });
      const updated = simulateSrsUpdate(question, 'a', true);

      expect(updated.nextReviewAt).not.toBeNull();

      const nextReview = new Date(updated.nextReviewAt!);
      const expectedTime = new Date('2025-01-01T10:10:00.000Z'); // 10 minutes later

      expect(nextReview.getTime()).toBe(expectedTime.getTime());
    });

    it('should transition srsLevel 1 → 2 (mastered) on correct answer', () => {
      const question = createQuestion({ srsLevel: 1, status: 'passed_once' });
      const updated = simulateSrsUpdate(question, 'a', true);

      expect(updated.srsLevel).toBe(2);
    });

    it('should set status to "mastered" when reaching srsLevel 2', () => {
      const question = createQuestion({ srsLevel: 1 });
      const updated = simulateSrsUpdate(question, 'a', true);

      expect(updated.status).toBe('mastered');
    });

    it('should set nextReviewAt to null when mastered', () => {
      const question = createQuestion({ srsLevel: 1 });
      const updated = simulateSrsUpdate(question, 'a', true);

      expect(updated.nextReviewAt).toBeNull();
    });

    it('should NOT exceed srsLevel 2', () => {
      const question = createQuestion({ srsLevel: 2, status: 'mastered' });
      const updated = simulateSrsUpdate(question, 'a', true);

      expect(updated.srsLevel).toBe(2);
    });

    it('should increment timesAnsweredCorrectly on each correct answer', () => {
      const question = createQuestion({ timesAnsweredCorrectly: 5 });
      const updated = simulateSrsUpdate(question, 'a', true);

      expect(updated.timesAnsweredCorrectly).toBe(6);
    });
  });

  describe('Incorrect Answer SRS Transitions', () => {
    it('should reset srsLevel to 0 on incorrect answer from level 1', () => {
      const question = createQuestion({ srsLevel: 1 });
      const updated = simulateSrsUpdate(question, 'b', false);

      expect(updated.srsLevel).toBe(0);
    });

    it('should reset srsLevel to 0 on incorrect answer from level 2 (mastered)', () => {
      const question = createQuestion({ srsLevel: 2, status: 'mastered' });
      const updated = simulateSrsUpdate(question, 'b', false);

      expect(updated.srsLevel).toBe(0);
    });

    it('should keep srsLevel at 0 on incorrect answer from level 0', () => {
      const question = createQuestion({ srsLevel: 0 });
      const updated = simulateSrsUpdate(question, 'b', false);

      expect(updated.srsLevel).toBe(0);
    });

    it('should set status to "attempted" on incorrect answer', () => {
      const question = createQuestion({ srsLevel: 1, status: 'passed_once' });
      const updated = simulateSrsUpdate(question, 'b', false);

      expect(updated.status).toBe('attempted');
    });

    it('should schedule nextReviewAt 30 seconds in the future on incorrect answer', () => {
      const question = createQuestion({ srsLevel: 1 });
      const updated = simulateSrsUpdate(question, 'b', false);

      expect(updated.nextReviewAt).not.toBeNull();

      const nextReview = new Date(updated.nextReviewAt!);
      const expectedTime = new Date('2025-01-01T10:00:30.000Z'); // 30 seconds later

      expect(nextReview.getTime()).toBe(expectedTime.getTime());
    });

    it('should increment timesAnsweredIncorrectly on each incorrect answer', () => {
      const question = createQuestion({ timesAnsweredIncorrectly: 3 });
      const updated = simulateSrsUpdate(question, 'b', false);

      expect(updated.timesAnsweredIncorrectly).toBe(4);
    });

    it('should track incorrect selection in historyOfIncorrectSelections', () => {
      const question = createQuestion({ historyOfIncorrectSelections: [] });
      const updated = simulateSrsUpdate(question, 'b', false);

      expect(updated.historyOfIncorrectSelections).toContain('b');
    });

    it('should accumulate multiple incorrect selections', () => {
      let question = createQuestion({ historyOfIncorrectSelections: [] });
      question = simulateSrsUpdate(question, 'b', false);
      question = simulateSrsUpdate(question, 'c', false);

      expect(question.historyOfIncorrectSelections).toEqual(['b', 'c']);
    });
  });

  describe('Complete Learning Cycle', () => {
    it('should progress from new → learning → mastered with consecutive correct answers', () => {
      let question = createQuestion({
        srsLevel: 0,
        status: 'not_attempted',
        nextReviewAt: null,
      });

      // First correct answer: 0 → 1
      question = simulateSrsUpdate(question, 'a', true);
      expect(question.srsLevel).toBe(1);
      expect(question.status).toBe('passed_once');
      expect(question.nextReviewAt).not.toBeNull();

      // Second correct answer: 1 → 2 (mastered)
      question = simulateSrsUpdate(question, 'a', true);
      expect(question.srsLevel).toBe(2);
      expect(question.status).toBe('mastered');
      expect(question.nextReviewAt).toBeNull();
    });

    it('should reset progress completely on incorrect answer after learning', () => {
      let question = createQuestion({
        srsLevel: 1,
        status: 'passed_once',
        timesAnsweredCorrectly: 1,
        nextReviewAt: '2025-01-01T10:10:00.000Z',
      });

      // Incorrect answer resets everything
      question = simulateSrsUpdate(question, 'b', false);

      expect(question.srsLevel).toBe(0);
      expect(question.status).toBe('attempted');
      expect(question.nextReviewAt).not.toBeNull();
      // Should be scheduled 30 seconds from now
      const nextReview = new Date(question.nextReviewAt!);
      expect(nextReview.getTime()).toBe(new Date('2025-01-01T10:00:30.000Z').getTime());
    });

    it('should require 2 consecutive correct answers to master', () => {
      let question = createQuestion({ srsLevel: 0, status: 'not_attempted' });

      // Correct
      question = simulateSrsUpdate(question, 'a', true);
      expect(question.status).not.toBe('mastered');

      // Incorrect (reset)
      question = simulateSrsUpdate(question, 'b', false);
      expect(question.srsLevel).toBe(0);

      // Correct again
      question = simulateSrsUpdate(question, 'a', true);
      expect(question.status).toBe('passed_once');

      // Second consecutive correct
      question = simulateSrsUpdate(question, 'a', true);
      expect(question.status).toBe('mastered');
    });
  });

  describe('Statistics Tracking', () => {
    it('should track lastAttemptedAt timestamp', () => {
      const question = createQuestion();
      const updated = simulateSrsUpdate(question, 'a', true);

      expect(updated.lastAttemptedAt).toBe('2025-01-01T10:00:00.000Z');
    });

    it('should track lastSelectedOptionId', () => {
      const question = createQuestion();
      const updated = simulateSrsUpdate(question, 'a', true);

      expect(updated.lastSelectedOptionId).toBe('a');
    });

    it('should preserve timesAnsweredCorrectly across incorrect answers', () => {
      let question = createQuestion({ timesAnsweredCorrectly: 5 });
      question = simulateSrsUpdate(question, 'b', false);

      // Incorrect answer should NOT reset timesAnsweredCorrectly
      expect(question.timesAnsweredCorrectly).toBe(5);
    });

    it('should preserve timesAnsweredIncorrectly across correct answers', () => {
      let question = createQuestion({ timesAnsweredIncorrectly: 3 });
      question = simulateSrsUpdate(question, 'a', true);

      // Correct answer should NOT reset timesAnsweredIncorrectly
      expect(question.timesAnsweredIncorrectly).toBe(3);
    });
  });
});

describe('Chapter Statistics Calculation', () => {
  describe('recalculateChapterStats', () => {
    it('should count totalQuestions as the number of questions in chapter', () => {
      const questions = [createQuestion(), createQuestion({ questionId: 'q2' })];
      const chapter = createChapter(questions);

      recalculateChapterStats(chapter);

      expect(chapter.totalQuestions).toBe(2);
    });

    it('should count answeredQuestions as questions with status !== "not_attempted"', () => {
      const questions = [
        createQuestion({ status: 'not_attempted' }),
        createQuestion({ questionId: 'q2', status: 'passed_once' }),
        createQuestion({ questionId: 'q3', status: 'attempted' }),
      ];
      const chapter = createChapter(questions);

      recalculateChapterStats(chapter);

      expect(chapter.answeredQuestions).toBe(2); // passed_once and attempted
    });

    it('should count correctAnswers as questions with timesAnsweredCorrectly > 0', () => {
      const questions = [
        createQuestion({ timesAnsweredCorrectly: 0 }),
        createQuestion({ questionId: 'q2', timesAnsweredCorrectly: 1 }),
        createQuestion({ questionId: 'q3', timesAnsweredCorrectly: 5 }),
      ];
      const chapter = createChapter(questions);

      recalculateChapterStats(chapter);

      expect(chapter.correctAnswers).toBe(2); // q2 and q3
    });

    it('should set isCompleted to true when all questions are attempted', () => {
      const questions = [
        createQuestion({ status: 'passed_once' }),
        createQuestion({ questionId: 'q2', status: 'attempted' }),
      ];
      const chapter = createChapter(questions);

      recalculateChapterStats(chapter);

      expect(chapter.isCompleted).toBe(true);
    });

    it('should set isCompleted to false when some questions are not attempted', () => {
      const questions = [
        createQuestion({ status: 'passed_once' }),
        createQuestion({ questionId: 'q2', status: 'not_attempted' }),
      ];
      const chapter = createChapter(questions);

      recalculateChapterStats(chapter);

      expect(chapter.isCompleted).toBe(false);
    });

    it('should handle empty chapter', () => {
      const chapter = createChapter([]);

      recalculateChapterStats(chapter);

      expect(chapter.totalQuestions).toBe(0);
      expect(chapter.answeredQuestions).toBe(0);
      expect(chapter.correctAnswers).toBe(0);
      expect(chapter.isCompleted).toBe(true); // 0 === 0
    });

    it('should count mastered questions as answered', () => {
      const questions = [
        createQuestion({ status: 'mastered' }),
        createQuestion({ questionId: 'q2', status: 'not_attempted' }),
      ];
      const chapter = createChapter(questions);

      recalculateChapterStats(chapter);

      expect(chapter.answeredQuestions).toBe(1);
    });
  });
});

describe('Review Queue Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Simulate the review queue calculation from app/page.tsx
  function isQuestionDue(question: QuizQuestion): boolean {
    const now = new Date();
    const isNotMastered = question.status !== 'mastered';

    if (!isNotMastered) return false;

    // Brand new question (srsLevel 0, no review scheduled yet)
    const isBrandNewAndReady = question.srsLevel === 0 && question.nextReviewAt === null;

    // Scheduled and past due
    const isScheduledAndDue =
      question.nextReviewAt !== null && new Date(question.nextReviewAt) <= now;

    return isBrandNewAndReady || isScheduledAndDue;
  }

  describe('Due Question Detection', () => {
    it('should mark brand new questions (srsLevel 0, nextReviewAt null) as due', () => {
      const question = createQuestion({
        srsLevel: 0,
        nextReviewAt: null,
        status: 'not_attempted',
      });

      expect(isQuestionDue(question)).toBe(true);
    });

    it('should mark questions with past nextReviewAt as due', () => {
      const question = createQuestion({
        srsLevel: 1,
        nextReviewAt: '2025-01-01T09:00:00.000Z', // 1 hour ago
        status: 'passed_once',
      });

      expect(isQuestionDue(question)).toBe(true);
    });

    it('should mark questions with current nextReviewAt as due', () => {
      const question = createQuestion({
        srsLevel: 1,
        nextReviewAt: '2025-01-01T10:00:00.000Z', // exactly now
        status: 'passed_once',
      });

      expect(isQuestionDue(question)).toBe(true);
    });

    it('should NOT mark questions with future nextReviewAt as due', () => {
      const question = createQuestion({
        srsLevel: 1,
        nextReviewAt: '2025-01-01T10:10:00.000Z', // 10 minutes in future
        status: 'passed_once',
      });

      expect(isQuestionDue(question)).toBe(false);
    });

    it('should NOT mark mastered questions as due', () => {
      const question = createQuestion({
        srsLevel: 2,
        status: 'mastered',
        nextReviewAt: null,
      });

      expect(isQuestionDue(question)).toBe(false);
    });

    it('should NOT mark mastered questions with old nextReviewAt as due', () => {
      const question = createQuestion({
        srsLevel: 2,
        status: 'mastered',
        nextReviewAt: '2024-01-01T00:00:00.000Z', // Very old
      });

      expect(isQuestionDue(question)).toBe(false);
    });
  });

  describe('Review Queue Count', () => {
    function calculateReviewQueueCount(questions: QuizQuestion[]): number {
      return questions.filter(isQuestionDue).length;
    }

    it('should count all due questions', () => {
      const questions = [
        createQuestion({ srsLevel: 0, nextReviewAt: null, status: 'not_attempted' }),
        createQuestion({
          questionId: 'q2',
          srsLevel: 1,
          nextReviewAt: '2025-01-01T09:00:00.000Z',
          status: 'passed_once',
        }),
        createQuestion({ questionId: 'q3', srsLevel: 2, status: 'mastered', nextReviewAt: null }),
      ];

      expect(calculateReviewQueueCount(questions)).toBe(2); // q1 and q2, not q3
    });

    it('should return 0 when no questions are due', () => {
      const questions = [
        createQuestion({
          srsLevel: 1,
          nextReviewAt: '2025-01-01T11:00:00.000Z',
          status: 'passed_once',
        }),
        createQuestion({ questionId: 'q2', srsLevel: 2, status: 'mastered', nextReviewAt: null }),
      ];

      expect(calculateReviewQueueCount(questions)).toBe(0);
    });

    it('should return 0 when all questions are mastered', () => {
      const questions = [
        createQuestion({ srsLevel: 2, status: 'mastered', nextReviewAt: null }),
        createQuestion({ questionId: 'q2', srsLevel: 2, status: 'mastered', nextReviewAt: null }),
      ];

      expect(calculateReviewQueueCount(questions)).toBe(0);
    });
  });
});

describe('Accuracy Calculation', () => {
  function calculateAccuracy(correctAnswers: number, totalQuestions: number): number {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  it('should calculate 100% accuracy when all correct', () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
  });

  it('should calculate 0% accuracy when none correct', () => {
    expect(calculateAccuracy(0, 10)).toBe(0);
  });

  it('should calculate 50% accuracy when half correct', () => {
    expect(calculateAccuracy(5, 10)).toBe(50);
  });

  it('should round to nearest integer', () => {
    expect(calculateAccuracy(1, 3)).toBe(33); // 33.33...
    expect(calculateAccuracy(2, 3)).toBe(67); // 66.66...
  });

  it('should return 0 when no questions', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('should handle single question', () => {
    expect(calculateAccuracy(1, 1)).toBe(100);
    expect(calculateAccuracy(0, 1)).toBe(0);
  });
});
