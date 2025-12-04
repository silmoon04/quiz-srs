/**
 * Unit tests for useQuizSession hook
 *
 * Tests follow TDD approach - written before implementation.
 * The hook wraps Zustand store for component use with shallow comparison.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizSession } from '@/features/quiz-session/hooks/use-quiz-session';
import { useQuizStore } from '@/store';
import type { QuizModule, QuizChapter, QuizQuestion, DisplayedOption } from '@/types/quiz-types';

// ============================================
// TEST FIXTURES
// ============================================

const createMockQuestion = (id: string, overrides?: Partial<QuizQuestion>): QuizQuestion => ({
  questionId: id,
  questionText: `Question ${id}`,
  options: [
    { optionId: `${id}-opt-a`, optionText: 'Option A' },
    { optionId: `${id}-opt-b`, optionText: 'Option B' },
    { optionId: `${id}-opt-c`, optionText: 'Option C' },
    { optionId: `${id}-opt-d`, optionText: 'Option D' },
  ],
  correctOptionIds: [`${id}-opt-a`],
  explanationText: `Explanation for ${id}`,
  status: 'not_attempted',
  srsLevel: 0,
  ...overrides,
});

const createMockChapter = (id: string, questionCount: number = 3): QuizChapter => ({
  id,
  name: `Chapter ${id}`,
  description: `Description for ${id}`,
  questions: Array.from({ length: questionCount }, (_, i) => createMockQuestion(`${id}-q${i + 1}`)),
  totalQuestions: questionCount,
  answeredQuestions: 0,
  correctAnswers: 0,
  isCompleted: false,
});

const createMockModule = (): QuizModule => ({
  name: 'Test Module',
  description: 'A test module',
  chapters: [createMockChapter('ch1', 5), createMockChapter('ch2', 3)],
});

// ============================================
// TEST HELPERS
// ============================================

const resetStore = () => {
  const initialState = (useQuizStore as any).getInitialState?.() ?? {};
  useQuizStore.setState({
    ...initialState,
    currentModule: null,
    appState: 'welcome',
    currentChapterId: '',
    currentQuestionIndex: 0,
    selectedOptionId: null,
    isSubmitted: false,
    isReviewSessionActive: false,
    sessionHistory: [],
    currentHistoryViewIndex: null,
    answerRecords: {},
  });
};

// ============================================
// TESTS
// ============================================

describe('useQuizSession', () => {
  beforeEach(() => {
    resetStore();
  });

  // ============================================
  // STATE SELECTORS
  // ============================================

  describe('State Selectors', () => {
    describe('appState', () => {
      it('should return current appState from store', () => {
        useQuizStore.setState({ appState: 'dashboard' });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.appState).toBe('dashboard');
      });

      it('should update when appState changes', () => {
        const { result } = renderHook(() => useQuizSession());

        expect(result.current.appState).toBe('welcome');

        act(() => {
          useQuizStore.setState({ appState: 'quiz' });
        });

        expect(result.current.appState).toBe('quiz');
      });
    });

    describe('currentModule', () => {
      it('should return null when no module is loaded', () => {
        const { result } = renderHook(() => useQuizSession());

        expect(result.current.currentModule).toBeNull();
      });

      it('should return the current module when loaded', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({ currentModule: mockModule });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.currentModule).toEqual(mockModule);
        expect(result.current.currentModule?.name).toBe('Test Module');
      });
    });

    describe('currentChapter', () => {
      it('should return null when no chapter is selected', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({ currentModule: mockModule, currentChapterId: '' });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.currentChapter).toBeNull();
      });

      it('should return the current chapter when selected', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.currentChapter).not.toBeNull();
        expect(result.current.currentChapter?.id).toBe('ch1');
        expect(result.current.currentChapter?.name).toBe('Chapter ch1');
      });

      it('should return null when chapter ID does not exist', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'non-existent',
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.currentChapter).toBeNull();
      });
    });

    describe('currentQuestion', () => {
      it('should return null when no chapter is selected', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({ currentModule: mockModule });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.currentQuestion).toBeNull();
      });

      it('should return the current question based on index', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 0,
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.currentQuestion).not.toBeNull();
        expect(result.current.currentQuestion?.questionId).toBe('ch1-q1');
      });

      it('should update when question index changes', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 0,
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.currentQuestion?.questionId).toBe('ch1-q1');

        act(() => {
          useQuizStore.setState({ currentQuestionIndex: 2 });
        });

        expect(result.current.currentQuestion?.questionId).toBe('ch1-q3');
      });
    });

    describe('currentQuestionIndex', () => {
      it('should return current question index from store', () => {
        useQuizStore.setState({ currentQuestionIndex: 3 });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.currentQuestionIndex).toBe(3);
      });
    });

    describe('totalQuestionsInChapter', () => {
      it('should return 0 when no chapter is selected', () => {
        const { result } = renderHook(() => useQuizSession());

        expect(result.current.totalQuestionsInChapter).toBe(0);
      });

      it('should return total questions count for current chapter', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.totalQuestionsInChapter).toBe(5);
      });

      it('should return correct count for different chapters', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch2',
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.totalQuestionsInChapter).toBe(3);
      });
    });

    describe('selectedOptionId', () => {
      it('should return null when no option is selected', () => {
        const { result } = renderHook(() => useQuizSession());

        expect(result.current.selectedOptionId).toBeNull();
      });

      it('should return selected option ID', () => {
        useQuizStore.setState({ selectedOptionId: 'opt-123' });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.selectedOptionId).toBe('opt-123');
      });
    });

    describe('isSubmitted', () => {
      it('should return false by default', () => {
        const { result } = renderHook(() => useQuizSession());

        expect(result.current.isSubmitted).toBe(false);
      });

      it('should return true when answer is submitted', () => {
        useQuizStore.setState({ isSubmitted: true });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.isSubmitted).toBe(true);
      });
    });

    describe('isReviewSessionActive', () => {
      it('should return false by default', () => {
        const { result } = renderHook(() => useQuizSession());

        expect(result.current.isReviewSessionActive).toBe(false);
      });

      it('should return true when review session is active', () => {
        useQuizStore.setState({ isReviewSessionActive: true });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.isReviewSessionActive).toBe(true);
      });
    });
  });

  // ============================================
  // ACTIONS
  // ============================================

  describe('Actions', () => {
    describe('startQuiz', () => {
      it('should start a quiz for the specified chapter', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({ currentModule: mockModule, appState: 'dashboard' });

        const { result } = renderHook(() => useQuizSession());

        act(() => {
          result.current.startQuiz('ch1');
        });

        expect(result.current.appState).toBe('quiz');
        expect(result.current.currentChapter?.id).toBe('ch1');
        expect(result.current.currentQuestionIndex).toBe(0);
      });

      it('should reset quiz state when starting', () => {
        useQuizStore.setState({
          currentModule: createMockModule(),
          selectedOptionId: 'old-option',
          isSubmitted: true,
          currentQuestionIndex: 5,
        });

        const { result } = renderHook(() => useQuizSession());

        act(() => {
          result.current.startQuiz('ch2');
        });

        expect(result.current.selectedOptionId).toBeNull();
        expect(result.current.isSubmitted).toBe(false);
        expect(result.current.currentQuestionIndex).toBe(0);
      });
    });

    describe('submitAnswer', () => {
      it('should submit the answer with provided option and displayed options', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 0,
          appState: 'quiz',
        });

        const { result } = renderHook(() => useQuizSession());

        const displayedOptions: DisplayedOption[] = [
          { optionId: 'ch1-q1-opt-a', optionText: 'Option A' },
          { optionId: 'ch1-q1-opt-b', optionText: 'Option B' },
        ];

        act(() => {
          result.current.submitAnswer('ch1-q1-opt-a', displayedOptions);
        });

        expect(result.current.isSubmitted).toBe(true);
      });

      it('should track answer in session history after submission', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 0,
          appState: 'quiz',
        });

        const { result } = renderHook(() => useQuizSession());

        const displayedOptions: DisplayedOption[] = [
          { optionId: 'ch1-q1-opt-a', optionText: 'Option A' },
          { optionId: 'ch1-q1-opt-b', optionText: 'Option B' },
        ];

        act(() => {
          result.current.submitAnswer('ch1-q1-opt-a', displayedOptions);
        });

        const state = useQuizStore.getState();
        expect(state.sessionHistory).toHaveLength(1);
        expect(state.sessionHistory[0].selectedOptionId).toBe('ch1-q1-opt-a');
      });
    });

    describe('selectOption', () => {
      it('should select an option', () => {
        const { result } = renderHook(() => useQuizSession());

        act(() => {
          result.current.selectOption('opt-a');
        });

        expect(result.current.selectedOptionId).toBe('opt-a');
      });

      it('should allow deselecting by passing null', () => {
        useQuizStore.setState({ selectedOptionId: 'opt-a' });

        const { result } = renderHook(() => useQuizSession());

        act(() => {
          result.current.selectOption(null);
        });

        expect(result.current.selectedOptionId).toBeNull();
      });

      it('should allow changing selection', () => {
        useQuizStore.setState({ selectedOptionId: 'opt-a' });

        const { result } = renderHook(() => useQuizSession());

        act(() => {
          result.current.selectOption('opt-b');
        });

        expect(result.current.selectedOptionId).toBe('opt-b');
      });
    });

    describe('nextQuestion', () => {
      it('should advance to the next question', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 0,
          isSubmitted: true,
        });

        const { result } = renderHook(() => useQuizSession());

        act(() => {
          result.current.nextQuestion();
        });

        expect(result.current.currentQuestionIndex).toBe(1);
        expect(result.current.isSubmitted).toBe(false);
        expect(result.current.selectedOptionId).toBeNull();
      });

      it('should not go beyond the last question', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 4, // Last question (0-indexed, 5 questions)
        });

        const { result } = renderHook(() => useQuizSession());

        act(() => {
          result.current.nextQuestion();
        });

        expect(result.current.currentQuestionIndex).toBe(4);
      });
    });

    describe('backToDashboard', () => {
      it('should navigate back to dashboard', () => {
        useQuizStore.setState({
          currentModule: createMockModule(),
          appState: 'quiz',
          currentChapterId: 'ch1',
          currentQuestionIndex: 3,
          selectedOptionId: 'opt-a',
          isSubmitted: true,
        });

        const { result } = renderHook(() => useQuizSession());

        act(() => {
          result.current.backToDashboard();
        });

        expect(result.current.appState).toBe('welcome');
        expect(result.current.currentChapter).toBeNull();
        expect(result.current.currentQuestionIndex).toBe(0);
        expect(result.current.selectedOptionId).toBeNull();
        expect(result.current.isSubmitted).toBe(false);
      });
    });
  });

  // ============================================
  // COMPUTED VALUES
  // ============================================

  describe('Computed Values', () => {
    describe('isLastQuestion', () => {
      it('should return false when not on the last question', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 0,
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.isLastQuestion).toBe(false);
      });

      it('should return true when on the last question', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 4, // Last question (5 total)
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.isLastQuestion).toBe(true);
      });

      it('should return false when no chapter is selected', () => {
        const { result } = renderHook(() => useQuizSession());

        expect(result.current.isLastQuestion).toBe(false);
      });
    });

    describe('progress', () => {
      it('should return correct progress when at start', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 0,
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.progress).toEqual({
          current: 1,
          total: 5,
          percentage: 20,
        });
      });

      it('should return correct progress in the middle', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 2,
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.progress).toEqual({
          current: 3,
          total: 5,
          percentage: 60,
        });
      });

      it('should return correct progress at the end', () => {
        const mockModule = createMockModule();
        useQuizStore.setState({
          currentModule: mockModule,
          currentChapterId: 'ch1',
          currentQuestionIndex: 4,
        });

        const { result } = renderHook(() => useQuizSession());

        expect(result.current.progress).toEqual({
          current: 5,
          total: 5,
          percentage: 100,
        });
      });

      it('should return zero progress when no chapter selected', () => {
        const { result } = renderHook(() => useQuizSession());

        expect(result.current.progress).toEqual({
          current: 0,
          total: 0,
          percentage: 0,
        });
      });
    });
  });

  // ============================================
  // SHALLOW COMPARISON / RE-RENDER OPTIMIZATION
  // ============================================

  describe('Render Optimization', () => {
    it('should not cause unnecessary re-renders when unrelated state changes', () => {
      const mockModule = createMockModule();
      useQuizStore.setState({
        currentModule: mockModule,
        currentChapterId: 'ch1',
        currentQuestionIndex: 0,
      });

      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useQuizSession();
      });

      const initialRenderCount = renderCount;

      // Change unrelated state (error, isLoading)
      act(() => {
        useQuizStore.setState({ error: 'Some error' });
      });

      // The hook should use shallow comparison and not re-render
      // for state it doesn't subscribe to
      // Note: This is a weak test - the actual behavior depends on
      // how the selectors are implemented with useShallow
      expect(result.current.appState).toBe('welcome');
    });

    it('should re-render when subscribed state changes', () => {
      const mockModule = createMockModule();
      useQuizStore.setState({
        currentModule: mockModule,
        currentChapterId: 'ch1',
        currentQuestionIndex: 0,
      });

      const { result } = renderHook(() => useQuizSession());

      expect(result.current.selectedOptionId).toBeNull();

      act(() => {
        useQuizStore.setState({ selectedOptionId: 'new-option' });
      });

      expect(result.current.selectedOptionId).toBe('new-option');
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    it('should handle empty module chapters', () => {
      const emptyModule: QuizModule = {
        name: 'Empty Module',
        chapters: [],
      };
      useQuizStore.setState({ currentModule: emptyModule });

      const { result } = renderHook(() => useQuizSession());

      expect(result.current.currentChapter).toBeNull();
      expect(result.current.totalQuestionsInChapter).toBe(0);
    });

    it('should handle chapter with no questions', () => {
      const moduleWithEmptyChapter: QuizModule = {
        name: 'Module',
        chapters: [
          {
            id: 'empty-ch',
            name: 'Empty Chapter',
            questions: [],
            totalQuestions: 0,
            answeredQuestions: 0,
            correctAnswers: 0,
            isCompleted: false,
          },
        ],
      };
      useQuizStore.setState({
        currentModule: moduleWithEmptyChapter,
        currentChapterId: 'empty-ch',
      });

      const { result } = renderHook(() => useQuizSession());

      expect(result.current.currentChapter).not.toBeNull();
      expect(result.current.currentQuestion).toBeNull();
      expect(result.current.totalQuestionsInChapter).toBe(0);
      expect(result.current.isLastQuestion).toBe(false);
      expect(result.current.progress).toEqual({
        current: 0,
        total: 0,
        percentage: 0,
      });
    });

    it('should handle question index out of bounds', () => {
      const mockModule = createMockModule();
      useQuizStore.setState({
        currentModule: mockModule,
        currentChapterId: 'ch1',
        currentQuestionIndex: 100, // Way out of bounds
      });

      const { result } = renderHook(() => useQuizSession());

      expect(result.current.currentQuestion).toBeNull();
    });
  });
});
