import { describe, it, expect } from 'vitest';
import { validateQuizModule } from '@/utils/quiz-validation-refactored';

describe('Duplicate ID Validation', () => {
  describe('Duplicate Chapter IDs', () => {
    it('should detect duplicate chapter IDs', () => {
      const quizWithDuplicateChapters = {
        name: 'Test Quiz',
        description: 'Testing duplicate chapter IDs',
        chapters: [
          {
            id: 'chapter1',
            name: 'First Chapter',
            questions: [
              {
                questionId: 'q1',
                questionText: 'Question 1?',
                explanationText: 'Explanation 1',
                options: [
                  { optionId: 'opt1', optionText: 'Option 1' },
                  { optionId: 'opt2', optionText: 'Option 2' },
                ],
                correctOptionIds: ['opt1'],
              },
            ],
          },
          {
            id: 'chapter1', // Duplicate!
            name: 'Second Chapter',
            questions: [
              {
                questionId: 'q2',
                questionText: 'Question 2?',
                explanationText: 'Explanation 2',
                options: [
                  { optionId: 'opt1', optionText: 'Option 1' },
                  { optionId: 'opt2', optionText: 'Option 2' },
                ],
                correctOptionIds: ['opt1'],
              },
            ],
          },
        ],
      };

      const result = validateQuizModule(quizWithDuplicateChapters);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Duplicate chapter ID found: 'chapter1' (Chapter 2). Each chapter must have a unique ID.",
      );
    });

    it('should allow unique chapter IDs', () => {
      const quizWithUniqueChapters = {
        name: 'Test Quiz',
        description: 'Testing unique chapter IDs',
        chapters: [
          {
            id: 'chapter1',
            name: 'First Chapter',
            questions: [
              {
                questionId: 'q1',
                questionText: 'Question 1?',
                explanationText: 'Explanation 1',
                options: [
                  { optionId: 'opt1', optionText: 'Option 1' },
                  { optionId: 'opt2', optionText: 'Option 2' },
                ],
                correctOptionIds: ['opt1'],
              },
            ],
          },
          {
            id: 'chapter2',
            name: 'Second Chapter',
            questions: [
              {
                questionId: 'q2',
                questionText: 'Question 2?',
                explanationText: 'Explanation 2',
                options: [
                  { optionId: 'opt1', optionText: 'Option 1' },
                  { optionId: 'opt2', optionText: 'Option 2' },
                ],
                correctOptionIds: ['opt1'],
              },
            ],
          },
        ],
      };

      const result = validateQuizModule(quizWithUniqueChapters);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Duplicate Question IDs', () => {
    it('should detect duplicate question IDs within same chapter', () => {
      const quizWithDuplicateQuestions = {
        name: 'Test Quiz',
        description: 'Testing duplicate question IDs',
        chapters: [
          {
            id: 'chapter1',
            name: 'First Chapter',
            questions: [
              {
                questionId: 'q1',
                questionText: 'Question 1?',
                explanationText: 'Explanation 1',
                options: [
                  { optionId: 'opt1', optionText: 'Option 1' },
                  { optionId: 'opt2', optionText: 'Option 2' },
                ],
                correctOptionIds: ['opt1'],
              },
              {
                questionId: 'q1', // Duplicate!
                questionText: 'Question 2?',
                explanationText: 'Explanation 2',
                options: [
                  { optionId: 'opt1', optionText: 'Option 1' },
                  { optionId: 'opt2', optionText: 'Option 2' },
                ],
                correctOptionIds: ['opt1'],
              },
            ],
          },
        ],
      };

      const result = validateQuizModule(quizWithDuplicateQuestions);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (err) => err.includes("Duplicate question ID found: 'q1'") && err.includes('chapter1'),
        ),
      ).toBe(true);
    });

    it('should detect duplicate question IDs across different chapters', () => {
      const quizWithDuplicateAcrossChapters = {
        name: 'Test Quiz',
        description: 'Testing duplicate question IDs across chapters',
        chapters: [
          {
            id: 'chapter1',
            name: 'First Chapter',
            questions: [
              {
                questionId: 'ch_iterative_bigo_2_q9',
                questionText: 'Question 1?',
                explanationText: 'Explanation 1',
                options: [
                  { optionId: 'opt1', optionText: 'Option 1' },
                  { optionId: 'opt2', optionText: 'Option 2' },
                ],
                correctOptionIds: ['opt1'],
              },
            ],
          },
          {
            id: 'chapter2',
            name: 'Second Chapter',
            questions: [
              {
                questionId: 'ch_iterative_bigo_2_q9', // Duplicate across chapters!
                questionText: 'Question 2?',
                explanationText: 'Explanation 2',
                options: [
                  { optionId: 'opt1', optionText: 'Option 1' },
                  { optionId: 'opt2', optionText: 'Option 2' },
                ],
                correctOptionIds: ['opt1'],
              },
            ],
          },
        ],
      };

      const result = validateQuizModule(quizWithDuplicateAcrossChapters);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (err) =>
            err.includes("Duplicate question ID found: 'ch_iterative_bigo_2_q9'") &&
            err.includes('chapter1') &&
            err.includes('chapter2'),
        ),
      ).toBe(true);
    });

    it('should allow unique question IDs across all chapters', () => {
      const quizWithUniqueQuestions = {
        name: 'Test Quiz',
        description: 'Testing unique question IDs',
        chapters: [
          {
            id: 'chapter1',
            name: 'First Chapter',
            questions: [
              {
                questionId: 'q1',
                questionText: 'Question 1?',
                explanationText: 'Explanation 1',
                options: [
                  { optionId: 'opt1', optionText: 'Option 1' },
                  { optionId: 'opt2', optionText: 'Option 2' },
                ],
                correctOptionIds: ['opt1'],
              },
            ],
          },
          {
            id: 'chapter2',
            name: 'Second Chapter',
            questions: [
              {
                questionId: 'q2', // Unique
                questionText: 'Question 2?',
                explanationText: 'Explanation 2',
                options: [
                  { optionId: 'opt1', optionText: 'Option 1' },
                  { optionId: 'opt2', optionText: 'Option 2' },
                ],
                correctOptionIds: ['opt1'],
              },
            ],
          },
        ],
      };

      const result = validateQuizModule(quizWithUniqueQuestions);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
