/**
 * useModuleLoader Hook
 *
 * Handles loading quiz modules from various sources:
 * - JSON files
 * - Markdown files
 * - Default quiz files
 *
 * Integrates with Zustand store for state management.
 *
 * @module features/dashboard/hooks/use-module-loader
 */

import { useCallback } from 'react';
import { useQuizStore } from '@/store';
import type { QuizModule } from '@/types/quiz-types';
import { validateAndCorrectQuizModule } from '@/utils/quiz-validation-refactored';
import { parseMarkdownToQuizModule } from '@/lib/quiz/parser';

// ============================================
// TYPES
// ============================================

export interface UseModuleLoaderReturn {
  // State
  currentModule: QuizModule | null;
  isLoading: boolean;
  error: string;

  // Actions
  loadFromFile: (file: File) => Promise<void>;
  loadDefault: () => Promise<void>;
  loadFromJson: (json: string) => Promise<void>;
  clearModule: () => void;
  clearError: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Detect file type based on extension
 */
function getFileType(filename: string): 'json' | 'markdown' | 'unknown' {
  const extension = filename.split('.').pop()?.toLowerCase();

  if (extension === 'json') {
    return 'json';
  }

  if (extension === 'md' || extension === 'markdown') {
    return 'markdown';
  }

  return 'unknown';
}

/**
 * Process JSON content and return validated module
 */
function processJsonContent(jsonString: string): {
  success: boolean;
  module?: QuizModule;
  error?: string;
} {
  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return {
      success: false,
      error: `Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`,
    };
  }

  // Validate and normalize
  const result = validateAndCorrectQuizModule(parsed);

  if (!result.validationResult.isValid) {
    return {
      success: false,
      error: `Validation failed: ${result.validationResult.errors.join(', ')}`,
    };
  }

  if (!result.normalizedModule) {
    return {
      success: false,
      error: 'Validation passed but no normalized module returned',
    };
  }

  return {
    success: true,
    module: result.normalizedModule,
  };
}

/**
 * Process Markdown content and return validated module
 */
function processMarkdownContent(markdownContent: string): {
  success: boolean;
  module?: QuizModule;
  error?: string;
} {
  const result = parseMarkdownToQuizModule(markdownContent);

  if (!result.success) {
    const errorMessages = result.errors.filter((e) => e.startsWith('[Error]'));
    return {
      success: false,
      error: `Markdown parsing failed: ${errorMessages.join(', ') || 'Unknown error'}`,
    };
  }

  if (!result.quizModule) {
    return {
      success: false,
      error: 'Parsing succeeded but no module returned',
    };
  }

  return {
    success: true,
    module: result.quizModule,
  };
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useModuleLoader(): UseModuleLoaderReturn {
  // Select state from store
  const currentModule = useQuizStore((state) => state.currentModule);
  const isLoading = useQuizStore((state) => state.isLoading);
  const error = useQuizStore((state) => state.error);

  // Get actions from store
  const setCurrentModule = useQuizStore((state) => state.setCurrentModule);
  const setIsLoading = useQuizStore((state) => state.setIsLoading);
  const setError = useQuizStore((state) => state.setError);
  const clearErrorAction = useQuizStore((state) => state.clearError);

  /**
   * Load module from JSON string
   */
  const loadFromJson = useCallback(
    async (jsonString: string): Promise<void> => {
      setIsLoading(true);
      clearErrorAction();

      try {
        const result = processJsonContent(jsonString);

        if (!result.success) {
          setError(result.error || 'Unknown error');
          setCurrentModule(null);
          return;
        }

        setCurrentModule(result.module!);
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, clearErrorAction, setError, setCurrentModule],
  );

  /**
   * Load module from file (JSON or Markdown)
   */
  const loadFromFile = useCallback(
    async (file: File): Promise<void> => {
      setIsLoading(true);
      clearErrorAction();

      try {
        // Read file content
        let content: string;
        try {
          content = await file.text();
        } catch (e) {
          setError(`Failed to read file: ${e instanceof Error ? e.message : 'Unknown error'}`);
          setCurrentModule(null);
          return;
        }

        // Detect file type
        const fileType = getFileType(file.name);

        if (fileType === 'unknown') {
          setError('Unsupported file format. Please use .json or .md files.');
          setCurrentModule(null);
          return;
        }

        // Process based on file type
        let result: { success: boolean; module?: QuizModule; error?: string };

        if (fileType === 'json') {
          result = processJsonContent(content);
        } else {
          result = processMarkdownContent(content);
        }

        if (!result.success) {
          setError(result.error || 'Unknown error');
          setCurrentModule(null);
          return;
        }

        setCurrentModule(result.module!);
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, clearErrorAction, setError, setCurrentModule],
  );

  /**
   * Load default quiz module
   * Tries /default-quiz.md first, then falls back to /default-quiz.json
   */
  const loadDefault = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    clearErrorAction();

    const errors: string[] = [];

    try {
      // Try loading Markdown first (Primary)
      try {
        const mdResponse = await fetch('/default-quiz.md');

        if (mdResponse.ok) {
          const mdContent = await mdResponse.text();
          const result = processMarkdownContent(mdContent);

          if (result.success && result.module) {
            setCurrentModule(result.module);
            return;
          } else {
            errors.push(`Markdown parsing failed: ${result.error || 'Unknown error'}`);
          }
        } else {
          errors.push(`Markdown fetch failed: ${mdResponse.status} ${mdResponse.statusText}`);
        }
      } catch (mdError) {
        errors.push(
          `Markdown fetch error: ${mdError instanceof Error ? mdError.message : 'Network error'}`,
        );
      }

      // Try loading JSON fallback
      try {
        const jsonResponse = await fetch('/default-quiz.json');

        if (jsonResponse.ok) {
          const jsonData = await jsonResponse.json();
          const result = validateAndCorrectQuizModule(jsonData);

          if (result.validationResult.isValid && result.normalizedModule) {
            setCurrentModule(result.normalizedModule);
            return;
          } else {
            errors.push(`JSON validation failed: ${result.validationResult.errors.join(', ')}`);
          }
        } else {
          errors.push(`JSON fetch failed: ${jsonResponse.status} ${jsonResponse.statusText}`);
        }
      } catch (jsonError) {
        errors.push(
          `JSON fetch error: ${jsonError instanceof Error ? jsonError.message : 'Network error'}`,
        );
      }

      // Both sources failed - show detailed error
      const errorDetail = errors.length > 0 ? errors.join('; ') : 'Unknown error';
      console.error('[useModuleLoader] Failed to load default quiz:', errorDetail);
      setError(`Failed to load default quiz: ${errorDetail}`);
      setCurrentModule(null);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      console.error('[useModuleLoader] Unexpected error:', errorMsg);
      setError(`Failed to load default quiz: ${errorMsg}`);
      setCurrentModule(null);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, clearErrorAction, setError, setCurrentModule]);

  /**
   * Clear the current module and any errors
   */
  const clearModule = useCallback((): void => {
    setCurrentModule(null);
    clearErrorAction();
  }, [setCurrentModule, clearErrorAction]);

  /**
   * Clear error message
   */
  const clearError = useCallback((): void => {
    clearErrorAction();
  }, [clearErrorAction]);

  return {
    // State
    currentModule,
    isLoading,
    error,

    // Actions
    loadFromFile,
    loadDefault,
    loadFromJson,
    clearModule,
    clearError,
  };
}
