/**
 * Unit tests for QuizSessionContainer
 *
 * Tests the container component that connects QuizSession to the store.
 * Verifies state management, action handling, and displayed options generation.
 *
 * @module tests/unit/features/quiz-session/components/QuizSessionContainer.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { QuizSessionContainer } from '@/features/quiz-session/components/QuizSessionContainer';
import { useQuizStore } from '@/store';
import type { QuizModule, QuizChapter, QuizQuestion } from '@/types/quiz-types';

// ============================================
// MOCKS
// ============================================

// Mock the QuizSession presentation component
vi.mock('@/components/quiz-session', () => ({
  QuizSession: vi.fn(
    ({
      chapter,
      question,
      currentQuestionIndex,
      totalQuestions,
      selectedOptionId,
      isSubmitted,
      isReviewSession,
      onSelectOption,
      onSubmitAnswer,
      onNextQuestion,
      onBackToDashboard,
    }) => (
      <div data-testid="mock-quiz-session">
        <div data-testid="chapter-name">{chapter?.name}</div>
        <div data-testid="question-text">{question?.questionText}</div>
        <div data-testid="question-index">{currentQuestionIndex}</div>
        <div data-testid="total-questions">{totalQuestions}</div>
        <div data-testid="selected-option">{selectedOptionId ?? 'none'}</div>
        <div data-testid="is-submitted">{String(isSubmitted)}</div>
        <div data-testid="is-review-session">{String(isReviewSession)}</div>
        <button data-testid="select-option-btn" onClick={() => onSelectOption('opt-a')}>
          Select Option
        </button>
        <button
          data-testid="submit-answer-btn"
          onClick={() =>
            onSubmitAnswer([
              { optionId: 'opt-a', optionText: 'A', isCorrect: true },
              { optionId: 'opt-b', optionText: 'B', isCorrect: false },
            ])
          }
        >
          Submit Answer
        </button>
        <button data-testid="next-question-btn" onClick={onNextQuestion}>
          Next Question
        </button>
        <button data-testid="back-dashboard-btn" onClick={onBackToDashboard}>
          Back to Dashboard
        </button>
      </div>
    ),
  ),
}));

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
  timesAnsweredCorrectly: 0,
  timesAnsweredIncorrectly: 0,
  historyOfIncorrectSelections: [],
  shownIncorrectOptionIds: [],
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

const setupQuizState = (overrides: Partial<ReturnType<typeof useQuizStore.getState>> = {}) => {
  const mockModule = createMockModule();
  useQuizStore.setState({
    currentModule: mockModule,
    appState: 'quiz',
    currentChapterId: 'ch1',
    currentQuestionIndex: 0,
    selectedOptionId: null,
    isSubmitted: false,
    isReviewSessionActive: false,
    sessionHistory: [],
    currentHistoryViewIndex: null,
    answerRecords: {},
    ...overrides,
  });
};

// ============================================
// TESTS
// ============================================

describe('QuizSessionContainer', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe('Rendering', () => {
    it('should render loading state when no chapter is selected', () => {
      render(<QuizSessionContainer />);

      expect(screen.getByTestId('quiz-session-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading question...')).toBeInTheDocument();
    });

    it('should render loading state when no question is available', () => {
      const mockModule = createMockModule();
      mockModule.chapters[0].questions = [];
      useQuizStore.setState({
        currentModule: mockModule,
        appState: 'quiz',
        currentChapterId: 'ch1',
        currentQuestionIndex: 0,
      });

      render(<QuizSessionContainer />);

      expect(screen.getByTestId('quiz-session-loading')).toBeInTheDocument();
    });

    it('should render QuizSession component with correct props when quiz is active', () => {
      setupQuizState();

      render(<QuizSessionContainer />);

      expect(screen.getByTestId('mock-quiz-session')).toBeInTheDocument();
      expect(screen.getByTestId('chapter-name')).toHaveTextContent('Chapter ch1');
      expect(screen.getByTestId('question-text')).toHaveTextContent('Question ch1-q1');
      expect(screen.getByTestId('question-index')).toHaveTextContent('0');
      expect(screen.getByTestId('total-questions')).toHaveTextContent('5');
      expect(screen.getByTestId('selected-option')).toHaveTextContent('none');
      expect(screen.getByTestId('is-submitted')).toHaveTextContent('false');
      expect(screen.getByTestId('is-review-session')).toHaveTextContent('false');
    });

    it('should render with review session mode', () => {
      setupQuizState({ isReviewSessionActive: true });

      render(<QuizSessionContainer />);

      expect(screen.getByTestId('is-review-session')).toHaveTextContent('true');
    });

    it('should render with selected option', () => {
      setupQuizState({ selectedOptionId: 'ch1-q1-opt-a' });

      render(<QuizSessionContainer />);

      expect(screen.getByTestId('selected-option')).toHaveTextContent('ch1-q1-opt-a');
    });

    it('should render with submitted state', () => {
      setupQuizState({ isSubmitted: true });

      render(<QuizSessionContainer />);

      expect(screen.getByTestId('is-submitted')).toHaveTextContent('true');
    });
  });

  // ============================================
  // ACTIONS
  // ============================================

  describe('Actions', () => {
    describe('selectOption', () => {
      it('should call selectOption action when option is selected', () => {
        setupQuizState();
        render(<QuizSessionContainer />);

        fireEvent.click(screen.getByTestId('select-option-btn'));

        expect(useQuizStore.getState().selectedOptionId).toBe('opt-a');
      });

      it('should not select option when already submitted', () => {
        setupQuizState({ isSubmitted: true, selectedOptionId: 'original-opt' });
        render(<QuizSessionContainer />);

        fireEvent.click(screen.getByTestId('select-option-btn'));

        // Should remain unchanged
        expect(useQuizStore.getState().selectedOptionId).toBe('original-opt');
      });
    });

    describe('submitAnswer', () => {
      it('should call submitAnswer action with correct parameters', () => {
        setupQuizState({ selectedOptionId: 'opt-a' });
        render(<QuizSessionContainer />);

        fireEvent.click(screen.getByTestId('submit-answer-btn'));

        const state = useQuizStore.getState();
        expect(state.isSubmitted).toBe(true);
        expect(state.sessionHistory).toHaveLength(1);
      });

      it('should not submit when no option is selected', () => {
        setupQuizState({ selectedOptionId: null });
        render(<QuizSessionContainer />);

        fireEvent.click(screen.getByTestId('submit-answer-btn'));

        expect(useQuizStore.getState().isSubmitted).toBe(false);
      });

      it('should not submit when already submitted', () => {
        setupQuizState({ isSubmitted: true, selectedOptionId: 'opt-a' });
        const initialHistory = useQuizStore.getState().sessionHistory.length;

        render(<QuizSessionContainer />);

        fireEvent.click(screen.getByTestId('submit-answer-btn'));

        // History should not change
        expect(useQuizStore.getState().sessionHistory.length).toBe(initialHistory);
      });
    });

    describe('nextQuestion', () => {
      it('should call nextQuestion action and advance question index', () => {
        setupQuizState({ isSubmitted: true });
        render(<QuizSessionContainer />);

        fireEvent.click(screen.getByTestId('next-question-btn'));

        expect(useQuizStore.getState().currentQuestionIndex).toBe(1);
        expect(useQuizStore.getState().isSubmitted).toBe(false);
        expect(useQuizStore.getState().selectedOptionId).toBeNull();
      });

      it('should call onComplete callback when on last question', () => {
        const onComplete = vi.fn();
        setupQuizState({ currentQuestionIndex: 4 }); // Last question (index 4 of 5)

        render(<QuizSessionContainer onComplete={onComplete} />);

        fireEvent.click(screen.getByTestId('next-question-btn'));

        expect(onComplete).toHaveBeenCalledTimes(1);
      });

      it('should not call onComplete when not on last question', () => {
        const onComplete = vi.fn();
        setupQuizState({ currentQuestionIndex: 0 });

        render(<QuizSessionContainer onComplete={onComplete} />);

        fireEvent.click(screen.getByTestId('next-question-btn'));

        expect(onComplete).not.toHaveBeenCalled();
      });
    });

    describe('backToDashboard', () => {
      it('should call backToDashboard action', () => {
        setupQuizState();
        render(<QuizSessionContainer />);

        fireEvent.click(screen.getByTestId('back-dashboard-btn'));

        const state = useQuizStore.getState();
        expect(state.appState).toBe('welcome');
        expect(state.currentChapterId).toBe('');
        expect(state.currentQuestionIndex).toBe(0);
      });

      it('should call onBack callback when provided', () => {
        const onBack = vi.fn();
        setupQuizState();

        render(<QuizSessionContainer onBack={onBack} />);

        fireEvent.click(screen.getByTestId('back-dashboard-btn'));

        expect(onBack).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ============================================
  // STATE SYNCHRONIZATION
  // ============================================

  describe('State Synchronization', () => {
    it('should update when store state changes', async () => {
      setupQuizState();
      render(<QuizSessionContainer />);

      expect(screen.getByTestId('question-index')).toHaveTextContent('0');

      // Update store directly (wrapped in act)
      await act(async () => {
        useQuizStore.setState({ currentQuestionIndex: 2 });
      });

      await waitFor(() => {
        expect(screen.getByTestId('question-index')).toHaveTextContent('2');
      });
    });

    it('should update question text when question changes', async () => {
      setupQuizState();
      render(<QuizSessionContainer />);

      expect(screen.getByTestId('question-text')).toHaveTextContent('Question ch1-q1');

      // Navigate to next question (wrapped in act)
      await act(async () => {
        useQuizStore.setState({ currentQuestionIndex: 1 });
      });

      await waitFor(() => {
        expect(screen.getByTestId('question-text')).toHaveTextContent('Question ch1-q2');
      });
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    it('should handle chapter change gracefully', async () => {
      setupQuizState();
      render(<QuizSessionContainer />);

      expect(screen.getByTestId('chapter-name')).toHaveTextContent('Chapter ch1');

      // Change to different chapter (wrapped in act)
      await act(async () => {
        useQuizStore.setState({ currentChapterId: 'ch2', currentQuestionIndex: 0 });
      });

      await waitFor(() => {
        expect(screen.getByTestId('chapter-name')).toHaveTextContent('Chapter ch2');
      });
    });

    it('should handle question index out of bounds', () => {
      const mockModule = createMockModule();
      useQuizStore.setState({
        currentModule: mockModule,
        appState: 'quiz',
        currentChapterId: 'ch1',
        currentQuestionIndex: 100, // Out of bounds
      });

      render(<QuizSessionContainer />);

      // Should show loading state
      expect(screen.getByTestId('quiz-session-loading')).toBeInTheDocument();
    });

    it('should handle non-existent chapter ID', () => {
      const mockModule = createMockModule();
      useQuizStore.setState({
        currentModule: mockModule,
        appState: 'quiz',
        currentChapterId: 'non-existent',
        currentQuestionIndex: 0,
      });

      render(<QuizSessionContainer />);

      // Should show loading state
      expect(screen.getByTestId('quiz-session-loading')).toBeInTheDocument();
    });
  });

  // ============================================
  // CALLBACKS
  // ============================================

  describe('Callbacks', () => {
    it('should handle undefined onComplete gracefully', () => {
      setupQuizState({ currentQuestionIndex: 4 }); // Last question

      // No callback provided
      render(<QuizSessionContainer />);

      // Should not throw
      expect(() => {
        fireEvent.click(screen.getByTestId('next-question-btn'));
      }).not.toThrow();
    });

    it('should handle undefined onBack gracefully', () => {
      setupQuizState();

      // No callback provided
      render(<QuizSessionContainer />);

      // Should not throw
      expect(() => {
        fireEvent.click(screen.getByTestId('back-dashboard-btn'));
      }).not.toThrow();
    });
  });
});
