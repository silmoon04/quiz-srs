import { PersistenceService, PersistedQuizState } from './types';

const STORAGE_KEY = 'quiz-srs-state';

export class LocalStoragePersistenceService implements PersistenceService {
  async saveState(state: PersistedQuizState): Promise<void> {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
      throw error;
    }
  }

  async loadState(): Promise<PersistedQuizState | null> {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) return null;
      return JSON.parse(serialized) as PersistedQuizState;
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
      return null;
    }
  }

  async clearState(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear state from localStorage:', error);
      throw error;
    }
  }
}

export const localStorageService = new LocalStoragePersistenceService();
