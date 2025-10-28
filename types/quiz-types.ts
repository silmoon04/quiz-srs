export interface QuizOption {
  optionId: string;
  optionText: string;
}

export interface QuizQuestion {
  questionId: string;
  questionText: string;
  options: QuizOption[];
  correctOptionIds: string[];
  explanationText: string;
  type?: 'mcq' | 'true_false'; // Added new type field
  // Performance tracking fields
  status?:
    | 'not_attempted'
    | 'attempted'
    | 'passed_once'
    | 'review_soon'
    | 'review_later'
    | 'mastered';
  timesAnsweredCorrectly?: number;
  timesAnsweredIncorrectly?: number;
  lastSelectedOptionId?: string;
  historyOfIncorrectSelections?: string[];
  lastAttemptedAt?: string;
  // SRS fields
  srsLevel?: number; // 0 = new/failed, 1 = passed once, 2 = mastered
  nextReviewAt?: string | null; // ISO timestamp or null if mastered
  shownIncorrectOptionIds?: string[]; // Track which incorrect options have been shown
}

export interface QuizChapter {
  id: string;
  name: string;
  description?: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  isCompleted: boolean;
}

export interface QuizModule {
  name: string;
  description?: string;
  chapters: QuizChapter[];
}

export interface DisplayedOption extends QuizOption {
  isCorrect?: boolean; // Computed at display time
  isSelected?: boolean; // UI state
}

export interface ReviewQueueItem {
  chapterId: string;
  questionId: string;
  question: QuizQuestion;
}

// NEW: Types for incorrect answers export feature
export interface IncorrectAnswerLogEntry {
  questionId: string;
  questionText: string;
  chapterId: string;
  chapterName: string;
  incorrectSelections: Array<{ selectedOptionId: string; selectedOptionText: string }>;
  correctOptionIds: string[];
  correctOptionTexts: string[];
  explanationText: string;
  totalTimesCorrect: number;
  totalTimesIncorrect: number;
  currentSrsLevel: number;
  lastAttemptedAt?: string;
}

export type IncorrectAnswersExport = IncorrectAnswerLogEntry[];

// NEW: Types for Anki-style progress tracking
export interface SrsProgressCounts {
  newOrLapsingDue: number; // srsLevel 0 questions that are due
  learningReviewDue: number; // srsLevel 1 questions that are due
  totalNonMastered: number; // Total questions not yet mastered
}

// NEW: Session History Navigation Types
export interface SessionHistoryEntry {
  questionSnapshot: QuizQuestion; // A deep copy of the question state at the time of answering
  selectedOptionId: string;
  displayedOptions: DisplayedOption[]; // The exact options shown to the user
  isCorrect: boolean;
  isReviewSessionQuestion: boolean;
  chapterId: string; // Chapter ID for context, especially for SRS reviews
}

export interface AnswerRecord {
  selectedOptionId: string;
  isCorrect: boolean;
  displayedOptionIds: string[];
  timestamp: string;
}
