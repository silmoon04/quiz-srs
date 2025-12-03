/**
 * Unit tests for useQuizPersistence hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadPersistedState,
  savePersistedState,
  clearPersistedState,
  type PersistedQuizState,
} from '@/hooks/use-quiz-persistence';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useQuizPersistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('savePersistedState', () => {
    it('should save state to localStorage', () => {
      const state = {
        module: null,
        appState: 'welcome' as const,
        currentChapterId: '',
        currentQuestionIndex: 0,
        answerRecords: {},
        sessionHistory: [],
      };

      const result = savePersistedState(state);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'quiz-state',
        expect.stringContaining('"version":1'),
      );
    });

    it('should include timestamp in saved state', () => {
      const state = {
        module: null,
        appState: 'dashboard' as const,
        currentChapterId: 'ch1',
        currentQuestionIndex: 5,
        answerRecords: {},
        sessionHistory: [],
      };

      savePersistedState(state);

      const savedCall = localStorageMock.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1]) as PersistedQuizState;

      expect(savedData.timestamp).toBeDefined();
      expect(new Date(savedData.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should save quiz module data', () => {
      const mockModule = {
        name: 'Test Quiz',
        description: 'A test quiz',
        chapters: [
          {
            id: 'ch1',
            name: 'Chapter 1',
            questions: [],
            totalQuestions: 0,
            answeredQuestions: 0,
            correctAnswers: 0,
          },
        ],
      };

      const state = {
        module: mockModule as any,
        appState: 'dashboard' as const,
        currentChapterId: 'ch1',
        currentQuestionIndex: 0,
        answerRecords: {},
        sessionHistory: [],
      };

      savePersistedState(state);

      const savedCall = localStorageMock.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1]) as PersistedQuizState;

      expect(savedData.module?.name).toBe('Test Quiz');
      expect(savedData.module?.chapters).toHaveLength(1);
    });
  });

  describe('loadPersistedState', () => {
    it('should return null if no state exists', () => {
      const result = loadPersistedState();
      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      localStorageMock.setItem('quiz-state', 'not valid json');

      const result = loadPersistedState();

      expect(result).toBeNull();
    });

    it('should return null for invalid state structure', () => {
      localStorageMock.setItem('quiz-state', JSON.stringify({ invalid: true }));

      const result = loadPersistedState();

      expect(result).toBeNull();
    });

    it('should load valid persisted state', () => {
      const validState: PersistedQuizState = {
        version: 1,
        timestamp: new Date().toISOString(),
        module: null,
        appState: 'welcome',
        currentChapterId: '',
        currentQuestionIndex: 0,
        answerRecords: {},
        sessionHistory: [],
      };

      localStorageMock.setItem('quiz-state', JSON.stringify(validState));

      const result = loadPersistedState();

      expect(result).not.toBeNull();
      expect(result?.appState).toBe('welcome');
    });

    it('should return null for future version', () => {
      const futureState = {
        version: 999,
        timestamp: new Date().toISOString(),
        module: null,
        appState: 'welcome',
        currentChapterId: '',
        currentQuestionIndex: 0,
        answerRecords: {},
        sessionHistory: [],
      };

      localStorageMock.setItem('quiz-state', JSON.stringify(futureState));

      const result = loadPersistedState();

      expect(result).toBeNull();
    });
  });

  describe('clearPersistedState', () => {
    it('should remove state from localStorage', () => {
      localStorageMock.setItem('quiz-state', '{}');

      const result = clearPersistedState();

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quiz-state');
    });
  });

  describe('round-trip save/load', () => {
    it('should preserve all state properties', () => {
      const originalState = {
        module: {
          name: 'Test',
          description: 'Test description',
          chapters: [],
        } as any,
        appState: 'quiz' as const,
        currentChapterId: 'ch-123',
        currentQuestionIndex: 7,
        answerRecords: {
          q1: {
            selectedOptionId: 'opt-a',
            isCorrect: true,
            displayedOptionIds: ['opt-a', 'opt-b', 'opt-c'],
            timestamp: '2025-01-01T00:00:00.000Z',
          },
        },
        sessionHistory: [],
      };

      savePersistedState(originalState);

      // Get the saved data directly from the mock
      const savedCall = localStorageMock.setItem.mock.calls[0];
      localStorageMock.getItem.mockReturnValueOnce(savedCall[1]);

      const loaded = loadPersistedState();

      expect(loaded).not.toBeNull();
      expect(loaded?.module?.name).toBe('Test');
      expect(loaded?.appState).toBe('quiz');
      expect(loaded?.currentChapterId).toBe('ch-123');
      expect(loaded?.currentQuestionIndex).toBe(7);
      expect(loaded?.answerRecords['q1'].isCorrect).toBe(true);
    });
  });
});
