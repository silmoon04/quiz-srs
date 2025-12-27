'use client';

import { useEffect } from 'react';
import { useQuizStore } from '@/store';

type LegacyQuizState = {
  currentModule: unknown;
  appState: string;
  currentChapterId: string;
  currentQuestionIndex: number;
  answerRecords: unknown;
  sessionHistory: unknown;
  updatedAt: string;
};

function safeJsonParse(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function LegacyStorageBridge() {
  useEffect(() => {
    // Hydrate from legacy key if present and store is empty.
    const legacy = safeJsonParse(localStorage.getItem('quiz-state')) as LegacyQuizState | null;
    if (legacy && typeof legacy === 'object') {
      const state = useQuizStore.getState();
      const hasModule = Boolean(state.currentModule);

      if (!hasModule && legacy.currentModule) {
        try {
          useQuizStore.setState(
            {
              currentModule: legacy.currentModule,
              appState: legacy.appState ?? state.appState,
              currentChapterId: legacy.currentChapterId ?? state.currentChapterId,
              currentQuestionIndex: legacy.currentQuestionIndex ?? state.currentQuestionIndex,
              answerRecords: legacy.answerRecords ?? state.answerRecords,
              sessionHistory: legacy.sessionHistory ?? state.sessionHistory,
            },
            false,
          );
        } catch {
          // Ignore legacy hydration errors
        }
      }
    }

    // Always keep legacy key updated for older E2E suites.
    const unsubscribe = useQuizStore.subscribe((state) => {
      const legacyState: LegacyQuizState = {
        currentModule: state.currentModule,
        appState: state.appState,
        currentChapterId: state.currentChapterId,
        currentQuestionIndex: state.currentQuestionIndex,
        answerRecords: state.answerRecords,
        sessionHistory: state.sessionHistory,
        updatedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('quiz-state', JSON.stringify(legacyState));
      } catch {
        // Ignore storage write failures (e.g., private mode)
      }
    });

    const onStorage = (event: StorageEvent) => {
      // Sync when either the primary persisted key or legacy key changes.
      if (event.key !== 'quiz-store' && event.key !== 'quiz-state') return;
      try {
        // Zustand persist middleware exposes a rehydrate() helper.
        const persistMiddleware = (
          useQuizStore as unknown as { persist: { rehydrate: () => void } }
        ).persist;
        persistMiddleware?.rehydrate?.();
      } catch {
        // Ignore sync failures
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      unsubscribe();
    };
  }, []);

  return null;
}
