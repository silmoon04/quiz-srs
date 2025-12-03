'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { QuizModule, SessionHistoryEntry } from '@/types/quiz-types';

const STORAGE_KEY = 'quiz-state';
const STORAGE_VERSION = 1;

/**
 * Persisted state structure
 */
export interface PersistedQuizState {
  version: number;
  timestamp: string;
  module: QuizModule | null;
  appState: 'welcome' | 'dashboard' | 'quiz' | 'complete' | 'all-questions';
  currentChapterId: string;
  currentQuestionIndex: number;
  answerRecords: Record<
    string,
    {
      selectedOptionId: string | null;
      isCorrect: boolean;
      displayedOptionIds: string[];
      timestamp: string;
    }
  >;
  sessionHistory: SessionHistoryEntry[];
}

/**
 * Check if we're running in the browser
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Safely get item from localStorage
 */
function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
function safeSetItem(key: string, value: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    // Handle quota exceeded or other errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, attempting cleanup...');
      // Try to clear old data and retry
      try {
        localStorage.removeItem(key);
        localStorage.setItem(key, value);
        return true;
      } catch {
        console.error('Failed to save to localStorage even after cleanup');
        return false;
      }
    }
    console.error('Failed to write to localStorage:', error);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
function safeRemoveItem(key: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
    return false;
  }
}

/**
 * Validate the structure of persisted state
 */
function isValidPersistedState(data: unknown): data is PersistedQuizState {
  if (!data || typeof data !== 'object') return false;

  const state = data as Record<string, unknown>;

  // Check version
  if (typeof state.version !== 'number') return false;

  // Check required fields
  if (typeof state.appState !== 'string') return false;
  if (
    !['welcome', 'dashboard', 'quiz', 'complete', 'all-questions'].includes(
      state.appState as string,
    )
  ) {
    return false;
  }

  if (typeof state.currentChapterId !== 'string') return false;
  if (typeof state.currentQuestionIndex !== 'number') return false;

  // Module can be null
  if (state.module !== null && typeof state.module !== 'object') return false;

  // Answer records should be an object
  if (typeof state.answerRecords !== 'object' || state.answerRecords === null) return false;

  // Session history should be an array
  if (!Array.isArray(state.sessionHistory)) return false;

  return true;
}

/**
 * Load persisted state from localStorage
 */
export function loadPersistedState(): PersistedQuizState | null {
  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (!isValidPersistedState(parsed)) {
      console.warn('Invalid persisted state structure, ignoring');
      return null;
    }

    // Check version compatibility
    if (parsed.version > STORAGE_VERSION) {
      console.warn('Persisted state version is newer than supported, ignoring');
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to parse persisted state:', error);
    // Clear corrupted data
    safeRemoveItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Save state to localStorage
 */
export function savePersistedState(
  state: Omit<PersistedQuizState, 'version' | 'timestamp'>,
): boolean {
  const persistedState: PersistedQuizState = {
    ...state,
    version: STORAGE_VERSION,
    timestamp: new Date().toISOString(),
  };

  try {
    const serialized = JSON.stringify(persistedState);
    return safeSetItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to serialize state:', error);
    return false;
  }
}

/**
 * Clear persisted state from localStorage
 */
export function clearPersistedState(): boolean {
  return safeRemoveItem(STORAGE_KEY);
}

/**
 * Hook for quiz state persistence
 *
 * @param currentState - Current state to persist
 * @param onRestore - Callback when state is restored from localStorage
 * @param debounceMs - Debounce time for saves (default 1000ms)
 */
export function useQuizPersistence(
  currentState: Omit<PersistedQuizState, 'version' | 'timestamp'> | null,
  onRestore?: (state: PersistedQuizState) => void,
  debounceMs: number = 1000,
) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredRef = useRef(false);
  const lastSavedRef = useRef<string>('');

  // Restore state on mount (only once)
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const persisted = loadPersistedState();
    if (persisted && onRestore) {
      onRestore(persisted);
    }
  }, [onRestore]);

  // Debounced save function
  const save = useCallback(() => {
    if (!currentState) return;

    // Don't save if nothing has changed
    const serialized = JSON.stringify(currentState);
    if (serialized === lastSavedRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const success = savePersistedState(currentState);
      if (success) {
        lastSavedRef.current = serialized;
      }
    }, debounceMs);
  }, [currentState, debounceMs]);

  // Save state when it changes
  useEffect(() => {
    if (currentState) {
      save();
    }
  }, [currentState, save]);

  // Save immediately on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (currentState) {
        savePersistedState(currentState);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentState]);

  // Immediate save function (for critical moments)
  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (currentState) {
      const success = savePersistedState(currentState);
      if (success) {
        lastSavedRef.current = JSON.stringify(currentState);
      }
      return success;
    }
    return false;
  }, [currentState]);

  // Clear function
  const clear = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    lastSavedRef.current = '';
    return clearPersistedState();
  }, []);

  return {
    saveNow,
    clear,
  };
}

/**
 * Hook for listening to storage events from other tabs
 */
export function useStorageSync(onSync: (state: PersistedQuizState) => void) {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (!event.newValue) return;

      try {
        const parsed = JSON.parse(event.newValue);
        if (isValidPersistedState(parsed)) {
          onSync(parsed);
        }
      } catch (error) {
        console.warn('Failed to parse storage event:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [onSync]);
}
