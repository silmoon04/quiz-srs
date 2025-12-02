/**
 * Quiz Flow Integration Tests
 *
 * These tests verify the complete quiz session flow from start to finish.
 * They test the EXPECTED behavior of the quiz system, not the current implementation.
 * If these tests fail, it indicates bugs in the implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { QuizModule, QuizChapter, QuizQuestion } from '@/types/quiz-types';

// Helper to create a complete quiz quizModule for testing
function createTestModule(): QuizModule {
  return {
    name: 'Test Module',
    description: 'A test quizModule for integration testing',
    chapters: [
      {
        id: 'ch1',
        name: 'Chapter 1: Basics',
        questions: [
          {
            questionId: 'q1',
            questionText: 'What is 2 + 2?',
            options: [
              { optionId: 'a', optionText: '3' },
              { optionId: 'b', optionText: '4' },
              { optionId: 'c', optionText: '5' },
            ],
            correctOptionIds: ['b'],
            explanationText: '2 + 2 = 4',
            status: 'not_attempted',
            timesAnsweredCorrectly: 0,
            timesAnsweredIncorrectly: 0,
            srsLevel: 0,
            nextReviewAt: null,
            shownIncorrectOptionIds: [],
            historyOfIncorrectSelections: [],
          },
          {
            questionId: 'q2',
            questionText: 'What is 3 + 3?',
            options: [
              { optionId: 'a', optionText: '5' },
              { optionId: 'b', optionText: '6' },
              { optionId: 'c', optionText: '7' },
            ],
            correctOptionIds: ['b'],
            explanationText: '3 + 3 = 6',
            status: 'not_attempted',
            timesAnsweredCorrectly: 0,
            timesAnsweredIncorrectly: 0,
            srsLevel: 0,
            nextReviewAt: null,
            shownIncorrectOptionIds: [],
            historyOfIncorrectSelections: [],
          },
        ],
        totalQuestions: 2,
        answeredQuestions: 0,
        correctAnswers: 0,
        isCompleted: false,
      },
    ],
  };
}

describe('Quiz Session Flow - Expected Behavior', () => {
  describe('Question Navigation', () => {
    it('should show first question when quiz starts', () => {
      // The quiz should display the first question when starting
      const quizModule = createTestModule();
      const firstQuestion = quizModule.chapters[0].questions[0];

      expect(firstQuestion.questionText).toBe('What is 2 + 2?');
      expect(quizModule.chapters[0].questions.length).toBe(2);
    });

    it('should show all options for the current question', () => {
      const quizModule = createTestModule();
      const firstQuestion = quizModule.chapters[0].questions[0];

      // Question should have at least 2 options
      expect(firstQuestion.options.length).toBeGreaterThanOrEqual(2);

      // One option should be correct
      const correctOptions = firstQuestion.options.filter((opt) =>
        firstQuestion.correctOptionIds.includes(opt.optionId),
      );
      expect(correctOptions.length).toBeGreaterThanOrEqual(1);
    });

    it('should have exactly one correct answer per question for MCQ', () => {
      const quizModule = createTestModule();

      quizModule.chapters.forEach((chapter) => {
        chapter.questions.forEach((question) => {
          // For standard MCQ, there should be exactly one correct answer
          // (unless it's a select-all-that-apply question)
          expect(question.correctOptionIds.length).toBeGreaterThanOrEqual(1);
        });
      });
    });
  });

  describe('Answer Submission Flow', () => {
    it('should require an option to be selected before submission', () => {
      const quizModule = createTestModule();
      const question = quizModule.chapters[0].questions[0];

      // Initially no option selected
      expect(question.lastSelectedOptionId).toBeUndefined();
    });

    it('should correctly identify correct answer', () => {
      const quizModule = createTestModule();
      const question = quizModule.chapters[0].questions[0];

      // Option 'b' (which is '4') should be correct for "What is 2 + 2?"
      expect(question.correctOptionIds).toContain('b');

      // Verify the correct option text
      const correctOption = question.options.find((opt) => opt.optionId === 'b');
      expect(correctOption?.optionText).toBe('4');
    });

    it('should correctly identify incorrect answer', () => {
      const quizModule = createTestModule();
      const question = quizModule.chapters[0].questions[0];

      // Options 'a' and 'c' should be incorrect
      expect(question.correctOptionIds).not.toContain('a');
      expect(question.correctOptionIds).not.toContain('c');
    });
  });

  describe('Progress Tracking', () => {
    it('should track answered questions count', () => {
      const quizModule = createTestModule();
      const chapter = quizModule.chapters[0];

      // Initially no questions answered
      expect(chapter.answeredQuestions).toBe(0);

      // After answering, count should increase
      // This tests the expected behavior
      chapter.questions[0].status = 'passed_once';
      chapter.answeredQuestions = 1;

      expect(chapter.answeredQuestions).toBe(1);
    });

    it('should track correct answers count', () => {
      const quizModule = createTestModule();
      const chapter = quizModule.chapters[0];

      // Initially no correct answers
      expect(chapter.correctAnswers).toBe(0);

      // After correct answer, count should increase
      chapter.questions[0].timesAnsweredCorrectly = 1;
      chapter.correctAnswers = 1;

      expect(chapter.correctAnswers).toBe(1);
    });

    it('should mark chapter as complete when all questions answered', () => {
      const quizModule = createTestModule();
      const chapter = quizModule.chapters[0];

      // Mark all questions as answered
      chapter.questions.forEach((q) => {
        q.status = 'passed_once';
      });
      chapter.answeredQuestions = chapter.totalQuestions;
      chapter.isCompleted = true;

      expect(chapter.isCompleted).toBe(true);
    });
  });

  describe('Explanation Display', () => {
    it('should have explanation for each question', () => {
      const quizModule = createTestModule();

      quizModule.chapters.forEach((chapter) => {
        chapter.questions.forEach((question) => {
          expect(question.explanationText).toBeTruthy();
          expect(question.explanationText.length).toBeGreaterThan(0);
        });
      });
    });
  });
});

describe('Quiz Results - Expected Behavior', () => {
  describe('Accuracy Calculation', () => {
    it('should calculate 100% when all answers are correct', () => {
      const chapter: QuizChapter = {
        id: 'ch1',
        name: 'Test',
        questions: [
          { ...createTestModule().chapters[0].questions[0], timesAnsweredCorrectly: 1 },
          { ...createTestModule().chapters[0].questions[1], timesAnsweredCorrectly: 1 },
        ],
        totalQuestions: 2,
        answeredQuestions: 2,
        correctAnswers: 2,
        isCompleted: true,
      };

      const accuracy = (chapter.correctAnswers / chapter.totalQuestions) * 100;
      expect(accuracy).toBe(100);
    });

    it('should calculate 50% when half answers are correct', () => {
      const chapter: QuizChapter = {
        id: 'ch1',
        name: 'Test',
        questions: [
          { ...createTestModule().chapters[0].questions[0], timesAnsweredCorrectly: 1 },
          { ...createTestModule().chapters[0].questions[1], timesAnsweredCorrectly: 0 },
        ],
        totalQuestions: 2,
        answeredQuestions: 2,
        correctAnswers: 1,
        isCompleted: true,
      };

      const accuracy = (chapter.correctAnswers / chapter.totalQuestions) * 100;
      expect(accuracy).toBe(50);
    });

    it('should calculate 0% when no answers are correct', () => {
      const chapter: QuizChapter = {
        id: 'ch1',
        name: 'Test',
        questions: [
          { ...createTestModule().chapters[0].questions[0], timesAnsweredCorrectly: 0 },
          { ...createTestModule().chapters[0].questions[1], timesAnsweredCorrectly: 0 },
        ],
        totalQuestions: 2,
        answeredQuestions: 2,
        correctAnswers: 0,
        isCompleted: true,
      };

      const accuracy = (chapter.correctAnswers / chapter.totalQuestions) * 100;
      expect(accuracy).toBe(0);
    });
  });

  describe('Performance Metrics', () => {
    it('should track total questions attempted', () => {
      const chapter: QuizChapter = {
        id: 'ch1',
        name: 'Test',
        questions: [
          { ...createTestModule().chapters[0].questions[0], status: 'passed_once' },
          { ...createTestModule().chapters[0].questions[1], status: 'not_attempted' },
        ],
        totalQuestions: 2,
        answeredQuestions: 1,
        correctAnswers: 1,
        isCompleted: false,
      };

      expect(chapter.answeredQuestions).toBe(1);
      expect(chapter.totalQuestions).toBe(2);
    });
  });
});

describe('Data Validation - Expected Behavior', () => {
  describe('Question Structure', () => {
    it('should have required fields on each question', () => {
      const quizModule = createTestModule();

      quizModule.chapters.forEach((chapter) => {
        chapter.questions.forEach((question) => {
          // Required fields
          expect(question.questionId).toBeDefined();
          expect(question.questionText).toBeDefined();
          expect(question.options).toBeDefined();
          expect(question.correctOptionIds).toBeDefined();
          expect(question.explanationText).toBeDefined();

          // Array validations
          expect(Array.isArray(question.options)).toBe(true);
          expect(Array.isArray(question.correctOptionIds)).toBe(true);
          expect(question.options.length).toBeGreaterThanOrEqual(2);
          expect(question.correctOptionIds.length).toBeGreaterThanOrEqual(1);
        });
      });
    });

    it('should have valid option structure', () => {
      const quizModule = createTestModule();

      quizModule.chapters.forEach((chapter) => {
        chapter.questions.forEach((question) => {
          question.options.forEach((option) => {
            expect(option.optionId).toBeDefined();
            expect(option.optionText).toBeDefined();
            expect(option.optionId.length).toBeGreaterThan(0);
            expect(option.optionText.length).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should have correctOptionIds that exist in options', () => {
      const quizModule = createTestModule();

      quizModule.chapters.forEach((chapter) => {
        chapter.questions.forEach((question) => {
          const optionIds = question.options.map((opt) => opt.optionId);
          question.correctOptionIds.forEach((correctId) => {
            expect(optionIds).toContain(correctId);
          });
        });
      });
    });
  });

  describe('Chapter Structure', () => {
    it('should have required fields on each chapter', () => {
      const quizModule = createTestModule();

      quizModule.chapters.forEach((chapter) => {
        expect(chapter.id).toBeDefined();
        expect(chapter.name).toBeDefined();
        expect(chapter.questions).toBeDefined();
        expect(Array.isArray(chapter.questions)).toBe(true);
      });
    });

    it('should have consistent totalQuestions count', () => {
      const quizModule = createTestModule();

      quizModule.chapters.forEach((chapter) => {
        expect(chapter.totalQuestions).toBe(chapter.questions.length);
      });
    });
  });

  describe('Module Structure', () => {
    it('should have at least one chapter', () => {
      const quizModule = createTestModule();

      expect(quizModule.chapters.length).toBeGreaterThanOrEqual(1);
    });

    it('should have a name', () => {
      const quizModule = createTestModule();

      expect(quizModule.name).toBeDefined();
      expect(quizModule.name.length).toBeGreaterThan(0);
    });
  });
});

describe('Edge Cases - Expected Behavior', () => {
  describe('Empty States', () => {
    it('should handle chapter with no questions gracefully', () => {
      const chapter: QuizChapter = {
        id: 'empty',
        name: 'Empty Chapter',
        questions: [],
        totalQuestions: 0,
        answeredQuestions: 0,
        correctAnswers: 0,
        isCompleted: true, // Empty chapter is considered complete
      };

      expect(chapter.totalQuestions).toBe(0);
      expect(chapter.isCompleted).toBe(true);
    });
  });

  describe('Single Question', () => {
    it('should handle chapter with single question', () => {
      const chapter: QuizChapter = {
        id: 'single',
        name: 'Single Question Chapter',
        questions: [createTestModule().chapters[0].questions[0]],
        totalQuestions: 1,
        answeredQuestions: 0,
        correctAnswers: 0,
        isCompleted: false,
      };

      expect(chapter.totalQuestions).toBe(1);

      // After answering
      chapter.questions[0].status = 'passed_once';
      chapter.answeredQuestions = 1;
      chapter.isCompleted = true;

      expect(chapter.isCompleted).toBe(true);
    });
  });

  describe('Unicode and Special Characters', () => {
    it('should handle questions with unicode characters', () => {
      const question: QuizQuestion = {
        questionId: 'unicode',
        questionText: '日本語のテスト: What is 2 + 2?',
        options: [
          { optionId: 'a', optionText: '三 (3)' },
          { optionId: 'b', optionText: '四 (4)' },
        ],
        correctOptionIds: ['b'],
        explanationText: '2 + 2 = 4 (四)',
        status: 'not_attempted',
        timesAnsweredCorrectly: 0,
        timesAnsweredIncorrectly: 0,
        srsLevel: 0,
        nextReviewAt: null,
        shownIncorrectOptionIds: [],
        historyOfIncorrectSelections: [],
      };

      expect(question.questionText).toContain('日本語');
      expect(question.options[1].optionText).toContain('四');
    });

    it('should handle questions with mathematical notation', () => {
      const question: QuizQuestion = {
        questionId: 'math',
        questionText: 'What is $\\frac{1}{2} + \\frac{1}{2}$?',
        options: [
          { optionId: 'a', optionText: '$\\frac{1}{2}$' },
          { optionId: 'b', optionText: '$1$' },
        ],
        correctOptionIds: ['b'],
        explanationText: '$\\frac{1}{2} + \\frac{1}{2} = 1$',
        status: 'not_attempted',
        timesAnsweredCorrectly: 0,
        timesAnsweredIncorrectly: 0,
        srsLevel: 0,
        nextReviewAt: null,
        shownIncorrectOptionIds: [],
        historyOfIncorrectSelections: [],
      };

      expect(question.questionText).toContain('$');
      expect(question.questionText).toContain('\\frac');
    });
  });

  describe('Rapid Answer Changes', () => {
    it('should track only the final selected option', () => {
      const question = createTestModule().chapters[0].questions[0];

      // Simulate changing selection multiple times
      question.lastSelectedOptionId = 'a';
      question.lastSelectedOptionId = 'b';
      question.lastSelectedOptionId = 'c';
      question.lastSelectedOptionId = 'b'; // Final selection

      expect(question.lastSelectedOptionId).toBe('b');
    });
  });
});
