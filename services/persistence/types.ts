import type { QuizModule, SessionHistoryEntry, AnswerRecord } from '@/types/quiz-types';

export interface PersistedQuizState {
  currentModule: QuizModule | null;
  currentChapterId: string;
  currentQuestionIndex: number;
  answerRecords: Record<string, AnswerRecord>;
  sessionHistory: SessionHistoryEntry[];
  appState: 'welcome' | 'dashboard' | 'quiz' | 'complete' | 'all-questions';
  lastSaved: string;
}

export interface PersistenceService {
  saveState(state: PersistedQuizState): Promise<void>;
  loadState(): Promise<PersistedQuizState | null>;
  clearState(): Promise<void>;
}
