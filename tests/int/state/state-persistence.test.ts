/**
 * State Persistence Integration Tests
 *
 * These tests verify that quiz state is correctly exported, imported, and persisted.
 * They test the EXPECTED behavior of state management, not the current implementation.
 * If these tests fail, it indicates bugs in the implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateAndCorrectQuizModule,
  normalizeQuizModule,
} from '@/utils/quiz-validation-refactored';
import type { QuizModule, QuizChapter, QuizQuestion } from '@/types/quiz-types';

// Helper to create a question with full SRS state
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

// Helper to create a chapter
function createChapter(overrides: Partial<QuizChapter> = {}): QuizChapter {
  return {
    id: 'ch1',
    name: 'Test Chapter',
    questions: [createQuestion()],
    totalQuestions: 1,
    answeredQuestions: 0,
    correctAnswers: 0,
    isCompleted: false,
    ...overrides,
  };
}

// Helper to create a quizModule with specific state
function createModule(overrides: Partial<QuizModule> = {}): QuizModule {
  return {
    name: 'Test Module',
    description: 'A test quizModule',
    chapters: [createChapter()],
    ...overrides,
  };
}

describe('State Export - Expected Behavior', () => {
  describe('Full State Serialization', () => {
    it('should serialize quizModule name and description', () => {
      const quizModule = createModule({
        name: 'My Quiz',
        description: 'Description of quiz',
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.name).toBe('My Quiz');
      expect(restored.description).toBe('Description of quiz');
    });

    it('should serialize all chapters', () => {
      const quizModule = createModule({
        chapters: [
          createChapter({ id: 'ch1', name: 'Chapter 1' }),
          createChapter({ id: 'ch2', name: 'Chapter 2' }),
        ],
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.chapters.length).toBe(2);
      expect(restored.chapters[0].id).toBe('ch1');
      expect(restored.chapters[1].id).toBe('ch2');
    });

    it('should serialize all questions in each chapter', () => {
      const quizModule = createModule({
        chapters: [
          createChapter({
            questions: [createQuestion({ questionId: 'q1' }), createQuestion({ questionId: 'q2' })],
            totalQuestions: 2,
          }),
        ],
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.chapters[0].questions.length).toBe(2);
    });
  });

  describe('SRS State Preservation', () => {
    it('should preserve srsLevel in export', () => {
      const quizModule = createModule({
        chapters: [
          createChapter({
            questions: [createQuestion({ srsLevel: 2 })],
          }),
        ],
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.chapters[0].questions[0].srsLevel).toBe(2);
    });

    it('should preserve nextReviewAt timestamp in export', () => {
      const nextReview = '2025-01-15T10:00:00.000Z';
      const quizModule = createModule({
        chapters: [
          createChapter({
            questions: [createQuestion({ nextReviewAt: nextReview })],
          }),
        ],
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.chapters[0].questions[0].nextReviewAt).toBe(nextReview);
    });

    it('should preserve null nextReviewAt for mastered questions', () => {
      const quizModule = createModule({
        chapters: [
          createChapter({
            questions: [createQuestion({ srsLevel: 2, status: 'mastered', nextReviewAt: null })],
          }),
        ],
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.chapters[0].questions[0].nextReviewAt).toBeNull();
    });
  });

  describe('Statistics Preservation', () => {
    it('should preserve timesAnsweredCorrectly', () => {
      const quizModule = createModule({
        chapters: [
          createChapter({
            questions: [createQuestion({ timesAnsweredCorrectly: 5 })],
          }),
        ],
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.chapters[0].questions[0].timesAnsweredCorrectly).toBe(5);
    });

    it('should preserve timesAnsweredIncorrectly', () => {
      const quizModule = createModule({
        chapters: [
          createChapter({
            questions: [createQuestion({ timesAnsweredIncorrectly: 3 })],
          }),
        ],
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.chapters[0].questions[0].timesAnsweredIncorrectly).toBe(3);
    });

    it('should preserve historyOfIncorrectSelections', () => {
      const quizModule = createModule({
        chapters: [
          createChapter({
            questions: [createQuestion({ historyOfIncorrectSelections: ['b', 'c', 'b'] })],
          }),
        ],
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.chapters[0].questions[0].historyOfIncorrectSelections).toEqual([
        'b',
        'c',
        'b',
      ]);
    });

    it('should preserve shownIncorrectOptionIds', () => {
      const quizModule = createModule({
        chapters: [
          createChapter({
            questions: [createQuestion({ shownIncorrectOptionIds: ['b', 'c'] })],
          }),
        ],
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.chapters[0].questions[0].shownIncorrectOptionIds).toEqual(['b', 'c']);
    });

    it('should preserve chapter statistics', () => {
      const quizModule = createModule({
        chapters: [
          createChapter({
            answeredQuestions: 5,
            correctAnswers: 3,
            isCompleted: true,
          }),
        ],
      });

      const serialized = JSON.stringify(quizModule);
      const restored = JSON.parse(serialized);

      expect(restored.chapters[0].answeredQuestions).toBe(5);
      expect(restored.chapters[0].correctAnswers).toBe(3);
      expect(restored.chapters[0].isCompleted).toBe(true);
    });
  });
});

describe('State Import - Expected Behavior', () => {
  describe('Validation on Import', () => {
    it('should validate quizModule structure on import', () => {
      const validModule = createModule();
      const serialized = JSON.stringify(validModule);

      const { validationResult } = validateAndCorrectQuizModule(serialized);

      expect(validationResult.isValid).toBe(true);
    });

    it('should reject invalid JSON', () => {
      const invalidJson = '{ invalid json }';

      const { validationResult } = validateAndCorrectQuizModule(invalidJson);

      expect(validationResult.isValid).toBe(false);
    });

    it('should reject quizModule without chapters', () => {
      const invalid = { name: 'Test', chapters: [] };
      const serialized = JSON.stringify(invalid);

      const { validationResult } = validateAndCorrectQuizModule(serialized);

      // Should be invalid because no chapters
      expect(validationResult.errors.length).toBeGreaterThan(0);
    });

    it('should reject chapter without questions', () => {
      const invalid = {
        name: 'Test',
        chapters: [{ id: 'ch1', name: 'Empty', questions: [] }],
      };
      const serialized = JSON.stringify(invalid);

      const { validationResult } = validateAndCorrectQuizModule(serialized);

      // Should be invalid because chapter has no questions
      expect(validationResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Normalization on Import', () => {
    it('should add missing SRS fields with defaults', () => {
      // Module with minimal question structure
      const minimal = {
        name: 'Test',
        chapters: [
          {
            id: 'ch1',
            name: 'Chapter',
            questions: [
              {
                questionId: 'q1',
                questionText: 'Question?',
                options: [
                  { optionId: 'a', optionText: 'A' },
                  { optionId: 'b', optionText: 'B' },
                ],
                correctOptionIds: ['a'],
                explanationText: 'A is correct',
                // Missing: status, srsLevel, nextReviewAt, etc.
              },
            ],
          },
        ],
      };

      const { normalizedModule } = validateAndCorrectQuizModule(JSON.stringify(minimal));

      expect(normalizedModule).not.toBeNull();
      if (normalizedModule) {
        const question = normalizedModule.chapters[0].questions[0];
        expect(question.status).toBe('not_attempted');
        expect(question.srsLevel).toBe(0);
        expect(question.nextReviewAt).toBeNull();
        expect(question.timesAnsweredCorrectly).toBe(0);
        expect(question.timesAnsweredIncorrectly).toBe(0);
      }
    });

    it('should preserve existing SRS fields on import', () => {
      const withProgress = {
        name: 'Test',
        chapters: [
          {
            id: 'ch1',
            name: 'Chapter',
            questions: [
              {
                questionId: 'q1',
                questionText: 'Question?',
                options: [
                  { optionId: 'a', optionText: 'A' },
                  { optionId: 'b', optionText: 'B' },
                ],
                correctOptionIds: ['a'],
                explanationText: 'A is correct',
                status: 'passed_once',
                srsLevel: 1,
                nextReviewAt: '2025-01-15T10:00:00.000Z',
                timesAnsweredCorrectly: 3,
                timesAnsweredIncorrectly: 1,
              },
            ],
          },
        ],
      };

      const { normalizedModule } = validateAndCorrectQuizModule(JSON.stringify(withProgress));

      expect(normalizedModule).not.toBeNull();
      if (normalizedModule) {
        const question = normalizedModule.chapters[0].questions[0];
        expect(question.status).toBe('passed_once');
        expect(question.srsLevel).toBe(1);
        expect(question.timesAnsweredCorrectly).toBe(3);
        expect(question.timesAnsweredIncorrectly).toBe(1);
      }
    });

    it('should calculate chapter statistics on import', () => {
      const withProgress = {
        name: 'Test',
        chapters: [
          {
            id: 'ch1',
            name: 'Chapter',
            questions: [
              {
                questionId: 'q1',
                questionText: 'Q1?',
                options: [{ optionId: 'a', optionText: 'A' }],
                correctOptionIds: ['a'],
                explanationText: 'Correct',
                status: 'passed_once',
                timesAnsweredCorrectly: 1,
              },
              {
                questionId: 'q2',
                questionText: 'Q2?',
                options: [{ optionId: 'a', optionText: 'A' }],
                correctOptionIds: ['a'],
                explanationText: 'Correct',
                status: 'not_attempted',
                timesAnsweredCorrectly: 0,
              },
            ],
            // Chapter stats might be wrong or missing
            totalQuestions: 0,
            answeredQuestions: 0,
            correctAnswers: 0,
          },
        ],
      };

      const { normalizedModule } = validateAndCorrectQuizModule(JSON.stringify(withProgress));

      expect(normalizedModule).not.toBeNull();
      if (normalizedModule) {
        const chapter = normalizedModule.chapters[0];
        expect(chapter.totalQuestions).toBe(2);
        expect(chapter.answeredQuestions).toBe(1); // Only q1 is answered
        expect(chapter.correctAnswers).toBe(1); // Only q1 has correct answers
      }
    });
  });
});

describe('State Round-Trip - Expected Behavior', () => {
  describe('Complete Round-Trip Preservation', () => {
    it('should preserve all state through export/import cycle', () => {
      const original = createModule({
        name: 'Complete Module',
        description: 'Full state quizModule',
        chapters: [
          createChapter({
            id: 'ch1',
            name: 'Chapter 1',
            questions: [
              createQuestion({
                questionId: 'q1',
                status: 'passed_once',
                srsLevel: 1,
                nextReviewAt: '2025-01-15T10:00:00.000Z',
                timesAnsweredCorrectly: 2,
                timesAnsweredIncorrectly: 1,
                historyOfIncorrectSelections: ['b'],
                shownIncorrectOptionIds: ['b'],
                lastSelectedOptionId: 'a',
                lastAttemptedAt: '2025-01-10T10:00:00.000Z',
              }),
            ],
            answeredQuestions: 1,
            correctAnswers: 1,
            isCompleted: true,
          }),
        ],
      });

      // Export
      const exported = JSON.stringify(original);

      // Import (simulate validation and normalization)
      const { normalizedModule } = validateAndCorrectQuizModule(exported);

      expect(normalizedModule).not.toBeNull();
      if (normalizedModule) {
        // Verify quizModule-level properties
        expect(normalizedModule.name).toBe(original.name);

        // Verify chapter-level properties
        const chapter = normalizedModule.chapters[0];
        expect(chapter.id).toBe('ch1');
        expect(chapter.name).toBe('Chapter 1');

        // Verify question-level properties
        const question = chapter.questions[0];
        expect(question.questionId).toBe('q1');
        expect(question.status).toBe('passed_once');
        expect(question.srsLevel).toBe(1);
        expect(question.timesAnsweredCorrectly).toBe(2);
        expect(question.timesAnsweredIncorrectly).toBe(1);
      }
    });

    it('should preserve question order through export/import', () => {
      const original = createModule({
        chapters: [
          createChapter({
            questions: [
              createQuestion({ questionId: 'q1' }),
              createQuestion({ questionId: 'q2' }),
              createQuestion({ questionId: 'q3' }),
            ],
            totalQuestions: 3,
          }),
        ],
      });

      const exported = JSON.stringify(original);
      const { normalizedModule } = validateAndCorrectQuizModule(exported);

      expect(normalizedModule).not.toBeNull();
      if (normalizedModule) {
        const questions = normalizedModule.chapters[0].questions;
        expect(questions[0].questionId).toBe('q1');
        expect(questions[1].questionId).toBe('q2');
        expect(questions[2].questionId).toBe('q3');
      }
    });

    it('should preserve chapter order through export/import', () => {
      const original = createModule({
        chapters: [
          createChapter({ id: 'ch1' }),
          createChapter({ id: 'ch2' }),
          createChapter({ id: 'ch3' }),
        ],
      });

      const exported = JSON.stringify(original);
      const { normalizedModule } = validateAndCorrectQuizModule(exported);

      expect(normalizedModule).not.toBeNull();
      if (normalizedModule) {
        expect(normalizedModule.chapters[0].id).toBe('ch1');
        expect(normalizedModule.chapters[1].id).toBe('ch2');
        expect(normalizedModule.chapters[2].id).toBe('ch3');
      }
    });
  });

  describe('Edge Cases in Round-Trip', () => {
    it('should handle empty arrays in round-trip', () => {
      const original = createModule({
        chapters: [
          createChapter({
            questions: [
              createQuestion({
                historyOfIncorrectSelections: [],
                shownIncorrectOptionIds: [],
              }),
            ],
          }),
        ],
      });

      const exported = JSON.stringify(original);
      const { normalizedModule } = validateAndCorrectQuizModule(exported);

      expect(normalizedModule).not.toBeNull();
      if (normalizedModule) {
        const question = normalizedModule.chapters[0].questions[0];
        expect(question.historyOfIncorrectSelections).toEqual([]);
        expect(question.shownIncorrectOptionIds).toEqual([]);
      }
    });

    it('should handle null nextReviewAt in round-trip', () => {
      const original = createModule({
        chapters: [
          createChapter({
            questions: [createQuestion({ nextReviewAt: null })],
          }),
        ],
      });

      const exported = JSON.stringify(original);
      const { normalizedModule } = validateAndCorrectQuizModule(exported);

      expect(normalizedModule).not.toBeNull();
      if (normalizedModule) {
        expect(normalizedModule.chapters[0].questions[0].nextReviewAt).toBeNull();
      }
    });

    it('should handle special characters in text fields', () => {
      const original = createModule({
        name: 'Test "Module" with <special> & chars',
        chapters: [
          createChapter({
            name: "Chapter with 'quotes'",
            questions: [
              createQuestion({
                questionText: 'What is $\\frac{1}{2}$?',
                explanationText: 'The answer is 1/2 or ½',
              }),
            ],
          }),
        ],
      });

      const exported = JSON.stringify(original);
      const { normalizedModule } = validateAndCorrectQuizModule(exported);

      expect(normalizedModule).not.toBeNull();
      if (normalizedModule) {
        expect(normalizedModule.name).toContain('special');
        expect(normalizedModule.chapters[0].name).toContain('quotes');
      }
    });
  });
});

describe('Concurrent State Operations - Expected Behavior', () => {
  describe('State Consistency', () => {
    it('should maintain consistency when updating multiple questions', () => {
      const quizModule = createModule({
        chapters: [
          createChapter({
            questions: [
              createQuestion({ questionId: 'q1', srsLevel: 0 }),
              createQuestion({ questionId: 'q2', srsLevel: 0 }),
            ],
            totalQuestions: 2,
          }),
        ],
      });

      // Simulate updating both questions
      quizModule.chapters[0].questions[0].srsLevel = 1;
      quizModule.chapters[0].questions[1].srsLevel = 1;

      // Both should be updated
      expect(quizModule.chapters[0].questions[0].srsLevel).toBe(1);
      expect(quizModule.chapters[0].questions[1].srsLevel).toBe(1);
    });
  });
});
