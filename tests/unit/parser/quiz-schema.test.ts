import { describe, it, expect } from 'vitest'
import {
  QuizOptionSchema,
  QuizQuestionSchema,
  QuizChapterSchema,
  QuizModuleSchema,
  parseQuizModule,
  assertQuizModule,
  validateQuizModule,
  safeParseQuizModule,
} from '@/lib/schema/quiz'

describe('Quiz Schema Validation', () => {
  describe('QuizOptionSchema', () => {
    it('should validate a valid quiz option', () => {
      const validOption = {
        optionId: 'opt1',
        optionText: 'Option 1',
      }
      expect(() => QuizOptionSchema.parse(validOption)).not.toThrow()
    })

    it('should reject option with empty optionId', () => {
      const invalidOption = {
        optionId: '',
        optionText: 'Option 1',
      }
      expect(() => QuizOptionSchema.parse(invalidOption)).toThrow()
    })

    it('should reject option with empty optionText', () => {
      const invalidOption = {
        optionId: 'opt1',
        optionText: '',
      }
      expect(() => QuizOptionSchema.parse(invalidOption)).toThrow()
    })
  })

  describe('QuizQuestionSchema', () => {
    it('should validate a valid MCQ question', () => {
      const validQuestion = {
        questionId: 'q1',
        questionText: 'What is 2+2?',
        options: [
          { optionId: 'opt1', optionText: '3' },
          { optionId: 'opt2', optionText: '4' },
          { optionId: 'opt3', optionText: '5' },
        ],
        correctOptionIds: ['opt2'],
        explanationText: '2+2 equals 4',
        type: 'mcq' as const,
      }
      expect(() => QuizQuestionSchema.parse(validQuestion)).not.toThrow()
    })

    it('should validate a true/false question', () => {
      const validQuestion = {
        questionId: 'q1',
        questionText: 'The sky is blue.',
        options: [
          { optionId: 'opt1', optionText: 'True' },
          { optionId: 'opt2', optionText: 'False' },
        ],
        correctOptionIds: ['opt1'],
        explanationText: 'The sky appears blue due to Rayleigh scattering.',
        type: 'true_false' as const,
      }
      expect(() => QuizQuestionSchema.parse(validQuestion)).not.toThrow()
    })

    it('should reject question with less than 2 options', () => {
      const invalidQuestion = {
        questionId: 'q1',
        questionText: 'What is 2+2?',
        options: [{ optionId: 'opt1', optionText: '3' }],
        correctOptionIds: ['opt1'],
        explanationText: 'Only one option',
      }
      expect(() => QuizQuestionSchema.parse(invalidQuestion)).toThrow()
    })

    it('should reject question with no correct options', () => {
      const invalidQuestion = {
        questionId: 'q1',
        questionText: 'What is 2+2?',
        options: [
          { optionId: 'opt1', optionText: '3' },
          { optionId: 'opt2', optionText: '4' },
        ],
        correctOptionIds: [],
        explanationText: 'No correct options',
      }
      expect(() => QuizQuestionSchema.parse(invalidQuestion)).toThrow()
    })
  })

  describe('QuizChapterSchema', () => {
    it('should validate a valid chapter', () => {
      const validChapter = {
        id: 'ch1',
        name: 'Basic Math',
        description: 'Introduction to basic mathematics',
        questions: [
          {
            questionId: 'q1',
            questionText: 'What is 2+2?',
            options: [
              { optionId: 'opt1', optionText: '3' },
              { optionId: 'opt2', optionText: '4' },
            ],
            correctOptionIds: ['opt2'],
            explanationText: '2+2 equals 4',
          },
        ],
        totalQuestions: 1,
        answeredQuestions: 0,
        correctAnswers: 0,
        isCompleted: false,
      }
      expect(() => QuizChapterSchema.parse(validChapter)).not.toThrow()
    })

    it('should reject chapter with no questions', () => {
      const invalidChapter = {
        id: 'ch1',
        name: 'Empty Chapter',
        questions: [],
        totalQuestions: 0,
        answeredQuestions: 0,
        correctAnswers: 0,
        isCompleted: false,
      }
      expect(() => QuizChapterSchema.parse(invalidChapter)).toThrow()
    })
  })

  describe('QuizModuleSchema', () => {
    it('should validate a valid module', () => {
      const validModule = {
        name: 'Mathematics 101',
        description: 'Basic mathematics course',
        chapters: [
          {
            id: 'ch1',
            name: 'Basic Math',
            questions: [
              {
                questionId: 'q1',
                questionText: 'What is 2+2?',
                options: [
                  { optionId: 'opt1', optionText: '3' },
                  { optionId: 'opt2', optionText: '4' },
                ],
                correctOptionIds: ['opt2'],
                explanationText: '2+2 equals 4',
              },
            ],
            totalQuestions: 1,
            answeredQuestions: 0,
            correctAnswers: 0,
            isCompleted: false,
          },
        ],
      }
      expect(() => QuizModuleSchema.parse(validModule)).not.toThrow()
    })

    it('should reject module with no chapters', () => {
      const invalidModule = {
        name: 'Empty Module',
        chapters: [],
      }
      expect(() => QuizModuleSchema.parse(invalidModule)).toThrow()
    })
  })

  describe('Parser Functions', () => {
    const validModule = {
      name: 'Test Module',
      chapters: [
        {
          id: 'ch1',
          name: 'Test Chapter',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Test question?',
              options: [
                { optionId: 'opt1', optionText: 'Option 1' },
                { optionId: 'opt2', optionText: 'Option 2' },
              ],
              correctOptionIds: ['opt1'],
              explanationText: 'Test explanation',
            },
          ],
          totalQuestions: 1,
          answeredQuestions: 0,
          correctAnswers: 0,
          isCompleted: false,
        },
      ],
    }

    it('should parse valid module with parseQuizModule', () => {
      expect(() => parseQuizModule(validModule)).not.toThrow()
    })

    it('should assert valid module with assertQuizModule', () => {
      expect(() => assertQuizModule(validModule)).not.toThrow()
    })

    it('should validate module with validateQuizModule', () => {
      const result = validateQuizModule(validModule)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Test Module')
      }
    })

    it('should safely parse module with safeParseQuizModule', () => {
      const result = safeParseQuizModule(validModule)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Test Module')
      }
    })

    it('should handle invalid data gracefully', () => {
      const invalidData = { name: '', chapters: [] }
      const result = safeParseQuizModule(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2) // name and chapters errors
      }
    })
  })
})
