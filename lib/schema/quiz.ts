import { z } from 'zod';

// Base schemas
export const QuizOptionSchema = z.object({
  optionId: z.string().min(1, 'Option ID is required'),
  optionText: z.string().min(1, 'Option text is required'),
});

export const QuizQuestionSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  questionText: z.string().min(1, 'Question text is required'),
  options: z.array(QuizOptionSchema).min(2, 'At least 2 options are required'),
  correctOptionIds: z.array(z.string()).min(1, 'At least one correct option is required'),
  explanationText: z.string().min(1, 'Explanation text is required'),
  type: z.enum(['mcq', 'true_false']).optional(),
  // Performance tracking fields
  status: z
    .enum(['not_attempted', 'attempted', 'passed_once', 'review_soon', 'review_later', 'mastered'])
    .optional(),
  timesAnsweredCorrectly: z.number().int().min(0).optional(),
  timesAnsweredIncorrectly: z.number().int().min(0).optional(),
  lastSelectedOptionId: z.string().optional(),
  historyOfIncorrectSelections: z.array(z.string()).optional(),
  lastAttemptedAt: z.string().optional(),
  // SRS fields
  srsLevel: z.number().int().min(0).max(2).optional(),
  nextReviewAt: z.string().nullable().optional(),
  shownIncorrectOptionIds: z.array(z.string()).optional(),
});

export const QuizChapterSchema = z.object({
  id: z.string().min(1, 'Chapter ID is required'),
  name: z.string().min(1, 'Chapter name is required'),
  description: z.string().optional(),
  questions: z.array(QuizQuestionSchema).min(1, 'At least one question is required'),
  totalQuestions: z.number().int().min(0),
  answeredQuestions: z.number().int().min(0),
  correctAnswers: z.number().int().min(0),
  isCompleted: z.boolean(),
});

export const QuizModuleSchema = z.object({
  name: z.string().min(1, 'Module name is required'),
  description: z.string().optional(),
  chapters: z.array(QuizChapterSchema).min(1, 'At least one chapter is required'),
});

// Additional schemas for extended functionality
export const DisplayedOptionSchema = QuizOptionSchema.extend({
  isCorrect: z.boolean().optional(),
  isSelected: z.boolean().optional(),
});

export const ReviewQueueItemSchema = z.object({
  chapterId: z.string().min(1, 'Chapter ID is required'),
  questionId: z.string().min(1, 'Question ID is required'),
  question: QuizQuestionSchema,
});

export const IncorrectAnswerLogEntrySchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  questionText: z.string().min(1, 'Question text is required'),
  chapterId: z.string().min(1, 'Chapter ID is required'),
  chapterName: z.string().min(1, 'Chapter name is required'),
  incorrectSelections: z.array(
    z.object({
      selectedOptionId: z.string().min(1, 'Selected option ID is required'),
      selectedOptionText: z.string().min(1, 'Selected option text is required'),
    }),
  ),
  correctOptionIds: z.array(z.string()).min(1, 'At least one correct option is required'),
  correctOptionTexts: z.array(z.string()).min(1, 'At least one correct option text is required'),
  explanationText: z.string().min(1, 'Explanation text is required'),
  totalTimesCorrect: z.number().int().min(0),
  totalTimesIncorrect: z.number().int().min(0),
  currentSrsLevel: z.number().int().min(0).max(2),
  lastAttemptedAt: z.string().optional(),
});

export const SrsProgressCountsSchema = z.object({
  newOrLapsingDue: z.number().int().min(0),
  learningReviewDue: z.number().int().min(0),
  totalNonMastered: z.number().int().min(0),
});

export const SessionHistoryEntrySchema = z.object({
  questionSnapshot: QuizQuestionSchema,
  selectedOptionId: z.string().min(1, 'Selected option ID is required'),
  displayedOptions: z.array(DisplayedOptionSchema),
  isCorrect: z.boolean(),
  isReviewSessionQuestion: z.boolean(),
  chapterId: z.string().min(1, 'Chapter ID is required'),
});

// Type exports
export type QuizOption = z.infer<typeof QuizOptionSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizChapter = z.infer<typeof QuizChapterSchema>;
export type QuizModule = z.infer<typeof QuizModuleSchema>;
export type DisplayedOption = z.infer<typeof DisplayedOptionSchema>;
export type ReviewQueueItem = z.infer<typeof ReviewQueueItemSchema>;
export type IncorrectAnswerLogEntry = z.infer<typeof IncorrectAnswerLogEntrySchema>;
export type SrsProgressCounts = z.infer<typeof SrsProgressCountsSchema>;
export type SessionHistoryEntry = z.infer<typeof SessionHistoryEntrySchema>;

// Parser functions
export const parseQuizOption = (data: unknown): QuizOption => QuizOptionSchema.parse(data);
export const parseQuizQuestion = (data: unknown): QuizQuestion => QuizQuestionSchema.parse(data);
export const parseQuizChapter = (data: unknown): QuizChapter => QuizChapterSchema.parse(data);
export const parseQuizModule = (data: unknown): QuizModule => QuizModuleSchema.parse(data);

// Assertion function for QuizModule
export function assertQuizModule(value: unknown): asserts value is QuizModule {
  QuizModuleSchema.parse(value);
}

// Validation helpers
export const validateQuizModule = (
  data: unknown,
): { success: true; data: QuizModule } | { success: false; error: z.ZodError } => {
  try {
    const result = QuizModuleSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};

// Safe parsing with error handling
export const safeParseQuizModule = (data: unknown) => QuizModuleSchema.safeParse(data);
export const safeParseQuizQuestion = (data: unknown) => QuizQuestionSchema.safeParse(data);
export const safeParseQuizChapter = (data: unknown) => QuizChapterSchema.safeParse(data);
