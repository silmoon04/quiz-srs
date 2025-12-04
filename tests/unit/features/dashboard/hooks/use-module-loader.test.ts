/**
 * Unit tests for useModuleLoader hook
 *
 * Tests follow TDD approach - written before implementation.
 * The hook handles loading quiz modules from various sources.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useModuleLoader } from '@/features/dashboard/hooks/use-module-loader';
import { useQuizStore } from '@/store';
import type { QuizModule } from '@/types/quiz-types';

// ============================================
// MOCKS
// ============================================

// Mock the validation module
vi.mock('@/utils/quiz-validation-refactored', () => ({
  validateAndCorrectQuizModule: vi.fn(),
  parseMarkdownToQuizModule: vi.fn(),
}));

// Mock the markdown pipeline
vi.mock('@/lib/markdown/pipeline', () => ({
  processMarkdown: vi.fn(),
}));

// Import mocked modules for type-safe access
import {
  validateAndCorrectQuizModule,
  parseMarkdownToQuizModule,
} from '@/utils/quiz-validation-refactored';
import { processMarkdown } from '@/lib/markdown/pipeline';

// ============================================
// TEST FIXTURES
// ============================================

const createMockModule = (): QuizModule => ({
  name: 'Test Module',
  description: 'A test module',
  chapters: [
    {
      id: 'ch1',
      name: 'Chapter 1',
      description: 'First chapter',
      questions: [
        {
          questionId: 'q1',
          questionText: 'What is 2+2?',
          options: [
            { optionId: 'a', optionText: '3' },
            { optionId: 'b', optionText: '4' },
          ],
          correctOptionIds: ['b'],
          explanationText: '2+2=4',
          status: 'not_attempted',
          srsLevel: 0,
        },
      ],
      totalQuestions: 1,
      answeredQuestions: 0,
      correctAnswers: 0,
      isCompleted: false,
    },
  ],
});

const validJsonString = JSON.stringify(createMockModule());

const validMarkdownContent = `# Test Module
_A test module_

---

## Chapter 1
<!-- CH_ID: ch1 -->
_First chapter_

---

### Q: What is 2+2?
<!-- Q_ID: q1 -->

**Options:**
**A1:** 3
**A2:** 4

**Correct:** A2

**Exp:**
2+2=4

---
`;

// ============================================
// TEST HELPERS
// ============================================

const resetStore = () => {
  const initialState = (useQuizStore as any).getInitialState?.() ?? {};
  useQuizStore.setState({
    ...initialState,
    currentModule: null,
    isLoading: false,
    error: '',
  });
};

const createMockFile = (content: string, filename: string): File => {
  // Create a mock File object that works in Vitest/JSDOM environment
  return {
    name: filename,
    text: () => Promise.resolve(content),
    size: content.length,
    type: 'text/plain',
  } as unknown as File;
};

// ============================================
// TESTS
// ============================================

describe('useModuleLoader', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();

    // Default mock implementations
    (validateAndCorrectQuizModule as any).mockReturnValue({
      validationResult: { isValid: true, errors: [] },
      normalizedModule: createMockModule(),
    });

    (parseMarkdownToQuizModule as any).mockReturnValue({
      success: true,
      quizModule: createMockModule(),
      errors: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // STATE SELECTORS
  // ============================================

  describe('State Selectors', () => {
    describe('currentModule', () => {
      it('should return null when no module is loaded', () => {
        const { result } = renderHook(() => useModuleLoader());

        expect(result.current.currentModule).toBeNull();
      });

      it('should return the current module when loaded', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({ currentModule: mockModule });

        const { result } = renderHook(() => useModuleLoader());

        expect(result.current.currentModule).toEqual(mockModule);
      });
    });

    describe('isLoading', () => {
      it('should return false by default', () => {
        const { result } = renderHook(() => useModuleLoader());

        expect(result.current.isLoading).toBe(false);
      });

      it('should return true when loading is in progress', () => {
        useQuizStore.setState({ isLoading: true });

        const { result } = renderHook(() => useModuleLoader());

        expect(result.current.isLoading).toBe(true);
      });
    });

    describe('error', () => {
      it('should return empty string by default', () => {
        const { result } = renderHook(() => useModuleLoader());

        expect(result.current.error).toBe('');
      });

      it('should return error message when set', () => {
        useQuizStore.setState({ error: 'Failed to load module' });

        const { result } = renderHook(() => useModuleLoader());

        expect(result.current.error).toBe('Failed to load module');
      });
    });
  });

  // ============================================
  // loadFromJson
  // ============================================

  describe('loadFromJson', () => {
    it('should load a valid JSON module', async () => {
      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromJson(validJsonString);
      });

      expect(result.current.currentModule).not.toBeNull();
      expect(result.current.currentModule?.name).toBe('Test Module');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('');
    });

    it('should set isLoading to true during load', async () => {
      const { result } = renderHook(() => useModuleLoader());

      let loadingDuringExecution = false;

      // Mock to capture loading state
      (validateAndCorrectQuizModule as any).mockImplementation(() => {
        loadingDuringExecution = useQuizStore.getState().isLoading;
        return {
          validationResult: { isValid: true, errors: [] },
          normalizedModule: createMockModule(),
        };
      });

      await act(async () => {
        await result.current.loadFromJson(validJsonString);
      });

      expect(loadingDuringExecution).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error for invalid JSON syntax', async () => {
      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromJson('{ invalid json }');
      });

      expect(result.current.error).toContain('Invalid JSON');
      expect(result.current.currentModule).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error for validation failures', async () => {
      (validateAndCorrectQuizModule as any).mockReturnValue({
        validationResult: { isValid: false, errors: ['Missing required field: name'] },
      });

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromJson('{}');
      });

      expect(result.current.error).toContain('Missing required field: name');
      expect(result.current.currentModule).toBeNull();
    });

    it('should clear previous error on successful load', async () => {
      useQuizStore.setState({ error: 'Previous error' });

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromJson(validJsonString);
      });

      expect(result.current.error).toBe('');
    });

    it('should call validateAndCorrectQuizModule with parsed data', async () => {
      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromJson(validJsonString);
      });

      expect(validateAndCorrectQuizModule).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  // ============================================
  // loadFromFile - JSON
  // ============================================

  describe('loadFromFile - JSON', () => {
    it('should load a JSON file successfully', async () => {
      const file = createMockFile(validJsonString, 'quiz.json');

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromFile(file);
      });

      expect(result.current.currentModule).not.toBeNull();
      expect(result.current.currentModule?.name).toBe('Test Module');
      expect(result.current.error).toBe('');
    });

    it('should detect JSON by .json extension', async () => {
      const file = createMockFile(validJsonString, 'my-quiz.JSON');

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromFile(file);
      });

      expect(validateAndCorrectQuizModule).toHaveBeenCalled();
      expect(parseMarkdownToQuizModule).not.toHaveBeenCalled();
    });

    it('should set error for file read failures', async () => {
      // Create a mock file that will fail to read
      const mockFile = {
        name: 'quiz.json',
        text: () => Promise.reject(new Error('File read error')),
      } as unknown as File;

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromFile(mockFile);
      });

      expect(result.current.error).toContain('Failed to read file');
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ============================================
  // loadFromFile - Markdown
  // ============================================

  describe('loadFromFile - Markdown', () => {
    it('should load a Markdown file successfully', async () => {
      const file = createMockFile(validMarkdownContent, 'quiz.md');

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromFile(file);
      });

      expect(result.current.currentModule).not.toBeNull();
      expect(parseMarkdownToQuizModule).toHaveBeenCalled();
    });

    it('should detect Markdown by .md extension', async () => {
      const file = createMockFile(validMarkdownContent, 'quiz.MD');

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromFile(file);
      });

      expect(parseMarkdownToQuizModule).toHaveBeenCalled();
      expect(validateAndCorrectQuizModule).not.toHaveBeenCalled();
    });

    it('should detect Markdown by .markdown extension', async () => {
      const file = createMockFile(validMarkdownContent, 'quiz.markdown');

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromFile(file);
      });

      expect(parseMarkdownToQuizModule).toHaveBeenCalled();
    });

    it('should set error for Markdown parsing failures', async () => {
      (parseMarkdownToQuizModule as any).mockReturnValue({
        success: false,
        errors: ['[Error] Invalid Markdown structure'],
      });

      const file = createMockFile('# Invalid\nNo proper structure', 'quiz.md');

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromFile(file);
      });

      expect(result.current.error).toContain('Invalid Markdown structure');
    });
  });

  // ============================================
  // loadFromFile - Unsupported Format
  // ============================================

  describe('loadFromFile - Unsupported Format', () => {
    it('should set error for unsupported file types', async () => {
      const file = createMockFile('some content', 'quiz.txt');

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromFile(file);
      });

      expect(result.current.error).toContain('Unsupported file format');
      expect(result.current.currentModule).toBeNull();
    });

    it('should handle files without extension', async () => {
      const file = createMockFile('some content', 'quizfile');

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromFile(file);
      });

      expect(result.current.error).toContain('Unsupported file format');
    });
  });

  // ============================================
  // loadDefault
  // ============================================

  describe('loadDefault', () => {
    beforeEach(() => {
      // Mock global fetch
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should load default JSON quiz successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockModule()),
      });

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadDefault();
      });

      expect(global.fetch).toHaveBeenCalledWith('/default-quiz.json');
      expect(result.current.currentModule).not.toBeNull();
      expect(result.current.error).toBe('');
    });

    it('should fallback to Markdown if JSON fails', async () => {
      // First call (JSON) fails
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        })
        // Second call (Markdown) succeeds
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(validMarkdownContent),
        });

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadDefault();
      });

      expect(global.fetch).toHaveBeenCalledWith('/default-quiz.json');
      expect(global.fetch).toHaveBeenCalledWith('/qs_default.md');
      expect(parseMarkdownToQuizModule).toHaveBeenCalled();
      expect(result.current.currentModule).not.toBeNull();
    });

    it('should set error if both default sources fail', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 404 })
        .mockResolvedValueOnce({ ok: false, status: 404 });

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadDefault();
      });

      expect(result.current.error).toContain('Failed to load default quiz');
      expect(result.current.currentModule).toBeNull();
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadDefault();
      });

      expect(result.current.error).toContain('Failed to load default quiz');
    });

    it('should set isLoading during fetch', async () => {
      let loadingDuringFetch = false;

      (global.fetch as any).mockImplementation(() => {
        loadingDuringFetch = useQuizStore.getState().isLoading;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(createMockModule()),
        });
      });

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadDefault();
      });

      expect(loadingDuringFetch).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ============================================
  // clearModule
  // ============================================

  describe('clearModule', () => {
    it('should clear the current module', () => {
      useQuizStore.setState({ currentModule: createMockModule() });

      const { result } = renderHook(() => useModuleLoader());

      expect(result.current.currentModule).not.toBeNull();

      act(() => {
        result.current.clearModule();
      });

      expect(result.current.currentModule).toBeNull();
    });

    it('should also clear any existing error', () => {
      useQuizStore.setState({
        currentModule: createMockModule(),
        error: 'Some error',
      });

      const { result } = renderHook(() => useModuleLoader());

      act(() => {
        result.current.clearModule();
      });

      expect(result.current.currentModule).toBeNull();
      expect(result.current.error).toBe('');
    });
  });

  // ============================================
  // clearError
  // ============================================

  describe('clearError', () => {
    it('should clear the error message', () => {
      useQuizStore.setState({ error: 'Some error message' });

      const { result } = renderHook(() => useModuleLoader());

      expect(result.current.error).toBe('Some error message');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe('');
    });

    it('should not affect the current module', () => {
      const mockModule = createMockModule();
      useQuizStore.setState({
        currentModule: mockModule,
        error: 'Some error',
      });

      const { result } = renderHook(() => useModuleLoader());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.currentModule).toEqual(mockModule);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    it('should handle empty JSON string', async () => {
      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromJson('');
      });

      expect(result.current.error).toContain('Invalid JSON');
    });

    it('should handle concurrent load calls', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockModule()),
      });

      const { result } = renderHook(() => useModuleLoader());

      // Start two concurrent loads
      await act(async () => {
        await Promise.all([
          result.current.loadDefault(),
          result.current.loadFromJson(validJsonString),
        ]);
      });

      // Should have a module loaded (last one wins or first one)
      expect(result.current.currentModule).not.toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should preserve module name from normalized module', async () => {
      const customModule = {
        ...createMockModule(),
        name: 'Custom Quiz Name',
      };

      (validateAndCorrectQuizModule as any).mockReturnValue({
        validationResult: { isValid: true, errors: [] },
        normalizedModule: customModule,
      });

      const { result } = renderHook(() => useModuleLoader());

      await act(async () => {
        await result.current.loadFromJson(JSON.stringify(customModule));
      });

      expect(result.current.currentModule?.name).toBe('Custom Quiz Name');
    });
  });
});
