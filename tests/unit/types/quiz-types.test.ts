import { describe, it, expect } from 'vitest';
import type {
  QuizOption,
  QuizQuestion,
  QuizChapter,
  QuizModule,
  DisplayedOption,
  AnswerRecord,
  ReviewQueueItem,
  IncorrectAnswerLogEntry,
  IncorrectAnswersExport,
  SrsProgressCounts,
  SessionHistoryEntry,
} from '@/types/quiz-types';

describe('quiz-types', () => {
  describe('QuizOption', () => {
    it('should create a valid QuizOption object', () => {
      const option: QuizOption = {
        optionId: 'opt-1',
        optionText: 'Option A',
      };

      expect(option.optionId).toBe('opt-1');
      expect(option.optionText).toBe('Option A');
    });

    it('should allow empty string values', () => {
      const option: QuizOption = {
        optionId: '',
        optionText: '',
      };

      expect(option.optionId).toBe('');
      expect(option.optionText).toBe('');
    });
  });

  describe('QuizQuestion', () => {
    it('should create a valid QuizQuestion with required fields only', () => {
      const question: QuizQuestion = {
        questionId: 'q-1',
        questionText: 'What is the answer?',
        options: [
          { optionId: 'opt-1', optionText: 'Answer A' },
          { optionId: 'opt-2', optionText: 'Answer B' },
        ],
        correctOptionIds: ['opt-1'],
        explanationText: 'The correct answer is A because...',
      };

      expect(question.questionId).toBe('q-1');
      expect(question.options).toHaveLength(2);
      expect(question.correctOptionIds).toContain('opt-1');
    });

    it('should create a QuizQuestion with mcq type', () => {
      const question: QuizQuestion = {
        questionId: 'q-2',
        questionText: 'Multiple choice question',
        options: [
          { optionId: 'opt-1', optionText: 'A' },
          { optionId: 'opt-2', optionText: 'B' },
          { optionId: 'opt-3', optionText: 'C' },
        ],
        correctOptionIds: ['opt-2'],
        explanationText: 'B is correct',
        type: 'mcq',
      };

      expect(question.type).toBe('mcq');
    });

    it('should create a QuizQuestion with true_false type', () => {
      const question: QuizQuestion = {
        questionId: 'q-3',
        questionText: 'Is the sky blue?',
        options: [
          { optionId: 'true', optionText: 'True' },
          { optionId: 'false', optionText: 'False' },
        ],
        correctOptionIds: ['true'],
        explanationText: 'Yes, the sky is blue',
        type: 'true_false',
      };

      expect(question.type).toBe('true_false');
    });

    it('should create a QuizQuestion with all status values', () => {
      const statusValues: QuizQuestion['status'][] = [
        'not_attempted',
        'attempted',
        'passed_once',
        'review_soon',
        'review_later',
        'mastered',
      ];

      statusValues.forEach((status) => {
        const question: QuizQuestion = {
          questionId: 'q-status',
          questionText: 'Status test',
          options: [],
          correctOptionIds: [],
          explanationText: '',
          status,
        };
        expect(question.status).toBe(status);
      });
    });

    it('should create a QuizQuestion with performance tracking fields', () => {
      const question: QuizQuestion = {
        questionId: 'q-4',
        questionText: 'Performance tracking test',
        options: [{ optionId: 'opt-1', optionText: 'A' }],
        correctOptionIds: ['opt-1'],
        explanationText: 'Explanation',
        timesAnsweredCorrectly: 5,
        timesAnsweredIncorrectly: 2,
        lastSelectedOptionId: 'opt-1',
        historyOfIncorrectSelections: ['opt-2', 'opt-3'],
        lastAttemptedAt: '2025-12-01T10:00:00.000Z',
      };

      expect(question.timesAnsweredCorrectly).toBe(5);
      expect(question.timesAnsweredIncorrectly).toBe(2);
      expect(question.lastSelectedOptionId).toBe('opt-1');
      expect(question.historyOfIncorrectSelections).toEqual(['opt-2', 'opt-3']);
      expect(question.lastAttemptedAt).toBe('2025-12-01T10:00:00.000Z');
    });

    it('should create a QuizQuestion with SRS fields', () => {
      const question: QuizQuestion = {
        questionId: 'q-5',
        questionText: 'SRS test',
        options: [{ optionId: 'opt-1', optionText: 'A' }],
        correctOptionIds: ['opt-1'],
        explanationText: 'Explanation',
        srsLevel: 2,
        nextReviewAt: '2025-12-15T10:00:00.000Z',
        shownIncorrectOptionIds: ['opt-2'],
      };

      expect(question.srsLevel).toBe(2);
      expect(question.nextReviewAt).toBe('2025-12-15T10:00:00.000Z');
      expect(question.shownIncorrectOptionIds).toEqual(['opt-2']);
    });

    it('should allow null for nextReviewAt when mastered', () => {
      const question: QuizQuestion = {
        questionId: 'q-6',
        questionText: 'Mastered question',
        options: [{ optionId: 'opt-1', optionText: 'A' }],
        correctOptionIds: ['opt-1'],
        explanationText: 'Explanation',
        srsLevel: 2,
        nextReviewAt: null,
        status: 'mastered',
      };

      expect(question.nextReviewAt).toBeNull();
      expect(question.status).toBe('mastered');
    });
  });

  describe('QuizChapter', () => {
    it('should create a valid QuizChapter object', () => {
      const chapter: QuizChapter = {
        id: 'chapter-1',
        name: 'Introduction',
        questions: [],
        totalQuestions: 10,
        answeredQuestions: 5,
        correctAnswers: 4,
        isCompleted: false,
      };

      expect(chapter.id).toBe('chapter-1');
      expect(chapter.name).toBe('Introduction');
      expect(chapter.totalQuestions).toBe(10);
      expect(chapter.answeredQuestions).toBe(5);
      expect(chapter.correctAnswers).toBe(4);
      expect(chapter.isCompleted).toBe(false);
    });

    it('should create a QuizChapter with optional description', () => {
      const chapter: QuizChapter = {
        id: 'chapter-2',
        name: 'Advanced Topics',
        description: 'This chapter covers advanced concepts',
        questions: [],
        totalQuestions: 15,
        answeredQuestions: 15,
        correctAnswers: 15,
        isCompleted: true,
      };

      expect(chapter.description).toBe('This chapter covers advanced concepts');
      expect(chapter.isCompleted).toBe(true);
    });

    it('should create a QuizChapter with questions', () => {
      const questions: QuizQuestion[] = [
        {
          questionId: 'q-1',
          questionText: 'Question 1',
          options: [{ optionId: 'opt-1', optionText: 'A' }],
          correctOptionIds: ['opt-1'],
          explanationText: 'Explanation',
        },
      ];

      const chapter: QuizChapter = {
        id: 'chapter-3',
        name: 'Basics',
        questions,
        totalQuestions: 1,
        answeredQuestions: 0,
        correctAnswers: 0,
        isCompleted: false,
      };

      expect(chapter.questions).toHaveLength(1);
      expect(chapter.questions[0].questionId).toBe('q-1');
    });
  });

  describe('QuizModule', () => {
    it('should create a valid QuizModule with required fields', () => {
      const quizModule: QuizModule = {
        name: 'Data Structures',
        chapters: [],
      };

      expect(quizModule.name).toBe('Data Structures');
      expect(quizModule.chapters).toEqual([]);
    });

    it('should create a QuizModule with optional description', () => {
      const quizModule: QuizModule = {
        name: 'Algorithms',
        description: 'Learn about sorting and searching algorithms',
        chapters: [],
      };

      expect(quizModule.description).toBe('Learn about sorting and searching algorithms');
    });

    it('should create a QuizModule with chapters', () => {
      const quizModule: QuizModule = {
        name: 'Programming Basics',
        chapters: [
          {
            id: 'ch-1',
            name: 'Variables',
            questions: [],
            totalQuestions: 5,
            answeredQuestions: 0,
            correctAnswers: 0,
            isCompleted: false,
          },
          {
            id: 'ch-2',
            name: 'Functions',
            questions: [],
            totalQuestions: 8,
            answeredQuestions: 0,
            correctAnswers: 0,
            isCompleted: false,
          },
        ],
      };

      expect(quizModule.chapters).toHaveLength(2);
      expect(quizModule.chapters[0].name).toBe('Variables');
      expect(quizModule.chapters[1].name).toBe('Functions');
    });
  });

  describe('DisplayedOption', () => {
    it('should extend QuizOption with display properties', () => {
      const displayedOption: DisplayedOption = {
        optionId: 'opt-1',
        optionText: 'Answer A',
        isCorrect: true,
        isSelected: false,
      };

      expect(displayedOption.optionId).toBe('opt-1');
      expect(displayedOption.optionText).toBe('Answer A');
      expect(displayedOption.isCorrect).toBe(true);
      expect(displayedOption.isSelected).toBe(false);
    });

    it('should work with optional display properties omitted', () => {
      const displayedOption: DisplayedOption = {
        optionId: 'opt-2',
        optionText: 'Answer B',
      };

      expect(displayedOption.isCorrect).toBeUndefined();
      expect(displayedOption.isSelected).toBeUndefined();
    });

    it('should represent a selected incorrect option', () => {
      const displayedOption: DisplayedOption = {
        optionId: 'opt-3',
        optionText: 'Wrong Answer',
        isCorrect: false,
        isSelected: true,
      };

      expect(displayedOption.isCorrect).toBe(false);
      expect(displayedOption.isSelected).toBe(true);
    });
  });

  describe('AnswerRecord', () => {
    it('should create a valid AnswerRecord for a correct answer', () => {
      const record: AnswerRecord = {
        selectedOptionId: 'opt-1',
        isCorrect: true,
        displayedOptionIds: ['opt-1', 'opt-2', 'opt-3', 'opt-4'],
        timestamp: '2025-12-01T10:30:00.000Z',
      };

      expect(record.selectedOptionId).toBe('opt-1');
      expect(record.isCorrect).toBe(true);
      expect(record.displayedOptionIds).toHaveLength(4);
      expect(record.timestamp).toBe('2025-12-01T10:30:00.000Z');
    });

    it('should create a valid AnswerRecord for an incorrect answer', () => {
      const record: AnswerRecord = {
        selectedOptionId: 'opt-3',
        isCorrect: false,
        displayedOptionIds: ['opt-1', 'opt-2', 'opt-3'],
        timestamp: '2025-12-01T10:35:00.000Z',
      };

      expect(record.isCorrect).toBe(false);
    });

    it('should allow null for selectedOptionId when skipped', () => {
      const record: AnswerRecord = {
        selectedOptionId: null,
        isCorrect: false,
        displayedOptionIds: ['opt-1', 'opt-2'],
        timestamp: '2025-12-01T10:40:00.000Z',
      };

      expect(record.selectedOptionId).toBeNull();
    });
  });

  describe('ReviewQueueItem', () => {
    it('should create a valid ReviewQueueItem', () => {
      const question: QuizQuestion = {
        questionId: 'q-review-1',
        questionText: 'Review this question',
        options: [{ optionId: 'opt-1', optionText: 'A' }],
        correctOptionIds: ['opt-1'],
        explanationText: 'Explanation',
        srsLevel: 1,
        nextReviewAt: '2025-12-01T00:00:00.000Z',
      };

      const reviewItem: ReviewQueueItem = {
        chapterId: 'chapter-1',
        questionId: 'q-review-1',
        question,
      };

      expect(reviewItem.chapterId).toBe('chapter-1');
      expect(reviewItem.questionId).toBe('q-review-1');
      expect(reviewItem.question.srsLevel).toBe(1);
    });
  });

  describe('IncorrectAnswerLogEntry', () => {
    it('should create a valid IncorrectAnswerLogEntry', () => {
      const entry: IncorrectAnswerLogEntry = {
        questionId: 'q-1',
        questionText: 'What is 2 + 2?',
        chapterId: 'chapter-math',
        chapterName: 'Basic Math',
        incorrectSelections: [
          { selectedOptionId: 'opt-3', selectedOptionText: '5' },
          { selectedOptionId: 'opt-2', selectedOptionText: '3' },
        ],
        correctOptionIds: ['opt-4'],
        correctOptionTexts: ['4'],
        explanationText: '2 + 2 = 4',
        totalTimesCorrect: 3,
        totalTimesIncorrect: 2,
        currentSrsLevel: 1,
        lastAttemptedAt: '2025-12-01T15:00:00.000Z',
      };

      expect(entry.questionId).toBe('q-1');
      expect(entry.incorrectSelections).toHaveLength(2);
      expect(entry.correctOptionIds).toContain('opt-4');
      expect(entry.totalTimesCorrect).toBe(3);
      expect(entry.totalTimesIncorrect).toBe(2);
    });

    it('should work without optional lastAttemptedAt', () => {
      const entry: IncorrectAnswerLogEntry = {
        questionId: 'q-2',
        questionText: 'Question without timestamp',
        chapterId: 'chapter-1',
        chapterName: 'Chapter 1',
        incorrectSelections: [],
        correctOptionIds: ['opt-1'],
        correctOptionTexts: ['Correct'],
        explanationText: 'Explanation',
        totalTimesCorrect: 0,
        totalTimesIncorrect: 1,
        currentSrsLevel: 0,
      };

      expect(entry.lastAttemptedAt).toBeUndefined();
    });
  });

  describe('IncorrectAnswersExport', () => {
    it('should be an array of IncorrectAnswerLogEntry', () => {
      const exportData: IncorrectAnswersExport = [
        {
          questionId: 'q-1',
          questionText: 'Question 1',
          chapterId: 'ch-1',
          chapterName: 'Chapter 1',
          incorrectSelections: [],
          correctOptionIds: ['opt-1'],
          correctOptionTexts: ['A'],
          explanationText: 'Explanation 1',
          totalTimesCorrect: 1,
          totalTimesIncorrect: 1,
          currentSrsLevel: 1,
        },
        {
          questionId: 'q-2',
          questionText: 'Question 2',
          chapterId: 'ch-2',
          chapterName: 'Chapter 2',
          incorrectSelections: [{ selectedOptionId: 'opt-2', selectedOptionText: 'B' }],
          correctOptionIds: ['opt-3'],
          correctOptionTexts: ['C'],
          explanationText: 'Explanation 2',
          totalTimesCorrect: 0,
          totalTimesIncorrect: 2,
          currentSrsLevel: 0,
        },
      ];

      expect(exportData).toHaveLength(2);
      expect(exportData[0].questionId).toBe('q-1');
      expect(exportData[1].questionId).toBe('q-2');
    });

    it('should allow empty array', () => {
      const exportData: IncorrectAnswersExport = [];

      expect(exportData).toHaveLength(0);
    });
  });

  describe('SrsProgressCounts', () => {
    it('should create valid SrsProgressCounts', () => {
      const progress: SrsProgressCounts = {
        newOrLapsingDue: 5,
        learningReviewDue: 3,
        totalNonMastered: 15,
      };

      expect(progress.newOrLapsingDue).toBe(5);
      expect(progress.learningReviewDue).toBe(3);
      expect(progress.totalNonMastered).toBe(15);
    });

    it('should handle zero counts', () => {
      const progress: SrsProgressCounts = {
        newOrLapsingDue: 0,
        learningReviewDue: 0,
        totalNonMastered: 0,
      };

      expect(progress.newOrLapsingDue).toBe(0);
      expect(progress.learningReviewDue).toBe(0);
      expect(progress.totalNonMastered).toBe(0);
    });
  });

  describe('SessionHistoryEntry', () => {
    it('should create a valid SessionHistoryEntry', () => {
      const questionSnapshot: QuizQuestion = {
        questionId: 'q-1',
        questionText: 'Test question',
        options: [
          { optionId: 'opt-1', optionText: 'A' },
          { optionId: 'opt-2', optionText: 'B' },
        ],
        correctOptionIds: ['opt-1'],
        explanationText: 'A is correct',
        srsLevel: 1,
      };

      const displayedOptions: DisplayedOption[] = [
        { optionId: 'opt-1', optionText: 'A', isCorrect: true, isSelected: true },
        { optionId: 'opt-2', optionText: 'B', isCorrect: false, isSelected: false },
      ];

      const historyEntry: SessionHistoryEntry = {
        questionSnapshot,
        selectedOptionId: 'opt-1',
        displayedOptions,
        isCorrect: true,
        isReviewSessionQuestion: false,
        chapterId: 'chapter-1',
      };

      expect(historyEntry.questionSnapshot.questionId).toBe('q-1');
      expect(historyEntry.selectedOptionId).toBe('opt-1');
      expect(historyEntry.displayedOptions).toHaveLength(2);
      expect(historyEntry.isCorrect).toBe(true);
      expect(historyEntry.isReviewSessionQuestion).toBe(false);
      expect(historyEntry.chapterId).toBe('chapter-1');
    });

    it('should create a SessionHistoryEntry for a review session question', () => {
      const questionSnapshot: QuizQuestion = {
        questionId: 'q-review',
        questionText: 'Review question',
        options: [{ optionId: 'opt-1', optionText: 'A' }],
        correctOptionIds: ['opt-1'],
        explanationText: 'Explanation',
        srsLevel: 0,
        nextReviewAt: '2025-12-01T00:00:00.000Z',
      };

      const historyEntry: SessionHistoryEntry = {
        questionSnapshot,
        selectedOptionId: 'opt-2',
        displayedOptions: [
          { optionId: 'opt-1', optionText: 'A', isCorrect: true, isSelected: false },
          { optionId: 'opt-2', optionText: 'B', isCorrect: false, isSelected: true },
        ],
        isCorrect: false,
        isReviewSessionQuestion: true,
        chapterId: 'chapter-srs',
      };

      expect(historyEntry.isReviewSessionQuestion).toBe(true);
      expect(historyEntry.isCorrect).toBe(false);
    });
  });

  describe('Type compatibility and edge cases', () => {
    it('should allow QuizQuestion with multiple correct answers', () => {
      const question: QuizQuestion = {
        questionId: 'multi-correct',
        questionText: 'Select all that apply',
        options: [
          { optionId: 'opt-1', optionText: 'A' },
          { optionId: 'opt-2', optionText: 'B' },
          { optionId: 'opt-3', optionText: 'C' },
        ],
        correctOptionIds: ['opt-1', 'opt-3'],
        explanationText: 'A and C are correct',
      };

      expect(question.correctOptionIds).toHaveLength(2);
      expect(question.correctOptionIds).toContain('opt-1');
      expect(question.correctOptionIds).toContain('opt-3');
    });

    it('should handle QuizQuestion with empty options array', () => {
      const question: QuizQuestion = {
        questionId: 'empty-options',
        questionText: 'No options',
        options: [],
        correctOptionIds: [],
        explanationText: 'N/A',
      };

      expect(question.options).toHaveLength(0);
      expect(question.correctOptionIds).toHaveLength(0);
    });

    it('should allow deeply nested quizModule structure', () => {
      const quizModule: QuizModule = {
        name: 'Deep Module',
        chapters: [
          {
            id: 'ch-1',
            name: 'Chapter 1',
            questions: [
              {
                questionId: 'q-1',
                questionText: 'Q1',
                options: [{ optionId: 'opt-1', optionText: 'A' }],
                correctOptionIds: ['opt-1'],
                explanationText: 'Exp',
              },
            ],
            totalQuestions: 1,
            answeredQuestions: 0,
            correctAnswers: 0,
            isCompleted: false,
          },
        ],
      };

      expect(quizModule.chapters[0].questions[0].options[0].optionText).toBe('A');
    });

    it('should handle SRS level boundary values', () => {
      const srsLevels = [0, 1, 2];

      srsLevels.forEach((level) => {
        const question: QuizQuestion = {
          questionId: `srs-${level}`,
          questionText: `SRS Level ${level}`,
          options: [],
          correctOptionIds: [],
          explanationText: '',
          srsLevel: level,
        };
        expect(question.srsLevel).toBe(level);
      });
    });

    it('should handle special characters in text fields', () => {
      const question: QuizQuestion = {
        questionId: 'special-chars',
        questionText: 'What is the result of `console.log("Hello, World!")`?',
        options: [
          { optionId: 'opt-1', optionText: '"Hello, World!"' },
          { optionId: 'opt-2', optionText: '<script>alert("XSS")</script>' },
        ],
        correctOptionIds: ['opt-1'],
        explanationText: 'The `console.log` function prints to the console.',
      };

      expect(question.questionText).toContain('`console.log');
      expect(question.options[1].optionText).toContain('<script>');
    });

    it('should handle unicode in text fields', () => {
      const question: QuizQuestion = {
        questionId: 'unicode-test',
        questionText: '什么是变量？ ¿Qué es una variable? 変数とは何ですか？',
        options: [
          { optionId: 'opt-1', optionText: 'A container for data 🗃️' },
          { optionId: 'opt-2', optionText: 'Eine Behälter für Daten' },
        ],
        correctOptionIds: ['opt-1'],
        explanationText: '变量 = Variable = 変数 = متغير',
      };

      expect(question.questionText).toContain('什么是');
      expect(question.options[0].optionText).toContain('🗃️');
    });
  });
});
