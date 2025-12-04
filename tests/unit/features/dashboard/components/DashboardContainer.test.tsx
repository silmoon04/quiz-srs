/**
 * Unit tests for DashboardContainer component
 *
 * Tests the container component that manages Dashboard state and data flow.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardContainer } from '@/features/dashboard/components/DashboardContainer';
import { useQuizStore } from '@/store';
import type { QuizModule } from '@/types/quiz-types';

// ============================================
// MOCKS
// ============================================

// Mock the useModuleLoader hook
vi.mock('@/features/dashboard/hooks/use-module-loader', () => ({
  useModuleLoader: vi.fn(),
}));

// Mock the Dashboard component
vi.mock('@/components/dashboard', () => ({
  Dashboard: vi.fn(
    ({ module, onStartQuiz, onStartReviewSession, onLoadNewModule, reviewQueueCount }) => (
      <div data-testid="dashboard-mock">
        <span data-testid="module-name">{module.name}</span>
        <span data-testid="review-count">{reviewQueueCount}</span>
        <button onClick={() => onStartQuiz('ch1')} data-testid="start-quiz-btn">
          Start Quiz
        </button>
        <button onClick={onStartReviewSession} data-testid="start-review-btn">
          Start Review
        </button>
        <button onClick={onLoadNewModule} data-testid="load-module-btn">
          Load Module
        </button>
      </div>
    ),
  ),
}));

// Import mocked hook for type-safe access
import { useModuleLoader } from '@/features/dashboard/hooks/use-module-loader';

// ============================================
// TEST FIXTURES
// ============================================

const createMockModule = (overrides?: Partial<QuizModule>): QuizModule => ({
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
          nextReviewAt: null,
        },
        {
          questionId: 'q2',
          questionText: 'What is 3+3?',
          options: [
            { optionId: 'a', optionText: '5' },
            { optionId: 'b', optionText: '6' },
          ],
          correctOptionIds: ['b'],
          explanationText: '3+3=6',
          status: 'mastered',
          srsLevel: 5,
          nextReviewAt: null,
        },
      ],
      totalQuestions: 2,
      answeredQuestions: 1,
      correctAnswers: 1,
      isCompleted: false,
    },
  ],
  ...overrides,
});

const createMockModuleLoaderReturn = (overrides?: Partial<ReturnType<typeof useModuleLoader>>) => ({
  currentModule: null as QuizModule | null,
  isLoading: false,
  error: '',
  loadFromFile: vi.fn(),
  loadDefault: vi.fn(),
  loadFromJson: vi.fn(),
  clearModule: vi.fn(),
  clearError: vi.fn(),
  ...overrides,
});

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

// ============================================
// TESTS
// ============================================

describe('DashboardContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();

    // Default mock implementation
    (useModuleLoader as any).mockReturnValue(createMockModuleLoaderReturn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // LOADING STATE
  // ============================================

  describe('Loading State', () => {
    it('should display loading state when isLoading is true', () => {
      (useModuleLoader as any).mockReturnValue(createMockModuleLoaderReturn({ isLoading: true }));

      render(<DashboardContainer />);

      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not display Dashboard when loading', () => {
      (useModuleLoader as any).mockReturnValue(createMockModuleLoaderReturn({ isLoading: true }));

      render(<DashboardContainer />);

      expect(screen.queryByTestId('dashboard-mock')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // ERROR STATE
  // ============================================

  describe('Error State', () => {
    it('should display error message when error is present', () => {
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ error: 'Failed to load module' }),
      );

      render(<DashboardContainer />);

      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load module/)).toBeInTheDocument();
    });

    it('should show Try Again button on error', () => {
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ error: 'Some error' }),
      );

      render(<DashboardContainer />);

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should have hidden file input on error state', () => {
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ error: 'Some error' }),
      );

      render(<DashboardContainer />);

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveClass('hidden');
    });
  });

  // ============================================
  // EMPTY STATE (No Module)
  // ============================================

  describe('Empty State', () => {
    it('should display empty state when no module is loaded', () => {
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: null }),
      );

      render(<DashboardContainer />);

      expect(screen.getByTestId('dashboard-empty')).toBeInTheDocument();
      expect(screen.getByText('No module loaded')).toBeInTheDocument();
    });

    it('should show Load Module button on empty state', () => {
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: null }),
      );

      render(<DashboardContainer />);

      expect(screen.getByRole('button', { name: /load module/i })).toBeInTheDocument();
    });
  });

  // ============================================
  // RENDERING WITH MODULE
  // ============================================

  describe('Rendering with Module', () => {
    it('should render Dashboard when module is loaded', () => {
      const mockModule = createMockModule();
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
    });

    it('should pass module name to Dashboard', () => {
      const mockModule = createMockModule({ name: 'My Quiz Module' });
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      expect(screen.getByTestId('module-name')).toHaveTextContent('My Quiz Module');
    });

    it('should calculate and pass reviewQueueCount', () => {
      // Module with 1 question due for review (srsLevel 0, not mastered)
      const mockModule = createMockModule();
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      // q1 is srsLevel 0, not mastered, nextReviewAt null -> due
      // q2 is mastered -> not due
      expect(screen.getByTestId('review-count')).toHaveTextContent('1');
    });

    it('should calculate reviewQueueCount as 0 when no questions due', () => {
      const mockModule = createMockModule({
        chapters: [
          {
            id: 'ch1',
            name: 'Chapter 1',
            description: 'First chapter',
            questions: [
              {
                questionId: 'q1',
                questionText: 'What is 2+2?',
                options: [{ optionId: 'a', optionText: '4' }],
                correctOptionIds: ['a'],
                explanationText: '2+2=4',
                status: 'mastered',
                srsLevel: 5,
                nextReviewAt: null,
              },
            ],
            totalQuestions: 1,
            answeredQuestions: 1,
            correctAnswers: 1,
            isCompleted: true,
          },
        ],
      });
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      expect(screen.getByTestId('review-count')).toHaveTextContent('0');
    });

    it('should count scheduled questions that are past due', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // 1 hour ago
      const mockModule = createMockModule({
        chapters: [
          {
            id: 'ch1',
            name: 'Chapter 1',
            description: 'First chapter',
            questions: [
              {
                questionId: 'q1',
                questionText: 'What is 2+2?',
                options: [{ optionId: 'a', optionText: '4' }],
                correctOptionIds: ['a'],
                explanationText: '2+2=4',
                status: 'review_soon',
                srsLevel: 1,
                nextReviewAt: pastDate,
              },
            ],
            totalQuestions: 1,
            answeredQuestions: 0,
            correctAnswers: 0,
            isCompleted: false,
          },
        ],
      });
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      expect(screen.getByTestId('review-count')).toHaveTextContent('1');
    });
  });

  // ============================================
  // ACTION CALLBACKS
  // ============================================

  describe('Action Callbacks', () => {
    it('should call onStartQuiz with chapterId when quiz is started', async () => {
      const user = userEvent.setup();
      const mockModule = createMockModule();
      const onStartQuiz = vi.fn();

      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer onStartQuiz={onStartQuiz} />);

      await user.click(screen.getByTestId('start-quiz-btn'));

      expect(onStartQuiz).toHaveBeenCalledWith('ch1');
    });

    it('should call onStartReview when review session is started', async () => {
      const user = userEvent.setup();
      const mockModule = createMockModule();
      const onStartReview = vi.fn();

      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer onStartReview={onStartReview} />);

      await user.click(screen.getByTestId('start-review-btn'));

      expect(onStartReview).toHaveBeenCalledTimes(1);
    });

    it('should not throw when onStartQuiz is not provided', async () => {
      const user = userEvent.setup();
      const mockModule = createMockModule();

      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      // Should not throw
      await user.click(screen.getByTestId('start-quiz-btn'));
    });

    it('should not throw when onStartReview is not provided', async () => {
      const user = userEvent.setup();
      const mockModule = createMockModule();

      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      // Should not throw
      await user.click(screen.getByTestId('start-review-btn'));
    });
  });

  // ============================================
  // FILE UPLOAD HANDLING
  // ============================================

  describe('File Upload Handling', () => {
    it('should have hidden file input element', () => {
      const mockModule = createMockModule();
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveClass('hidden');
    });

    it('should accept JSON and Markdown files', () => {
      const mockModule = createMockModule();
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
      expect(fileInput.accept).toBe('.json,.md,.markdown');
    });

    it('should call loadFromFile when file is selected', async () => {
      const loadFromFile = vi.fn();
      const mockModule = createMockModule();

      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({
          currentModule: mockModule,
          loadFromFile,
        }),
      );

      render(<DashboardContainer />);

      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['{"name": "Test"}'], 'test.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      await waitFor(() => {
        expect(loadFromFile).toHaveBeenCalledWith(testFile);
      });
    });

    it('should not call loadFromFile when no file is selected', async () => {
      const loadFromFile = vi.fn();
      const mockModule = createMockModule();

      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({
          currentModule: mockModule,
          loadFromFile,
        }),
      );

      render(<DashboardContainer />);

      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(loadFromFile).not.toHaveBeenCalled();
    });

    it('should trigger file input when Load Module button is clicked in empty state', async () => {
      const user = userEvent.setup();

      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: null }),
      );

      render(<DashboardContainer />);

      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      await user.click(screen.getByRole('button', { name: /load module/i }));

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should trigger file input when Try Again button is clicked in error state', async () => {
      const user = userEvent.setup();

      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ error: 'Some error' }),
      );

      render(<DashboardContainer />);

      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      await user.click(screen.getByRole('button', { name: /try again/i }));

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  // ============================================
  // LOAD NEW MODULE
  // ============================================

  describe('Load New Module', () => {
    it('should trigger file input when onLoadNewModule is called', async () => {
      const user = userEvent.setup();
      const mockModule = createMockModule();

      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      await user.click(screen.getByTestId('load-module-btn'));

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    it('should handle module with empty chapters array', () => {
      const mockModule = createMockModule({ chapters: [] });
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      expect(screen.getByTestId('review-count')).toHaveTextContent('0');
    });

    it('should handle module with chapter but no questions', () => {
      const mockModule = createMockModule({
        chapters: [
          {
            id: 'ch1',
            name: 'Empty Chapter',
            description: 'No questions',
            questions: [],
            totalQuestions: 0,
            answeredQuestions: 0,
            correctAnswers: 0,
            isCompleted: false,
          },
        ],
      });
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      expect(screen.getByTestId('review-count')).toHaveTextContent('0');
    });

    it('should handle multiple chapters with mixed question states', () => {
      const mockModule = createMockModule({
        chapters: [
          {
            id: 'ch1',
            name: 'Chapter 1',
            description: 'First chapter',
            questions: [
              {
                questionId: 'q1',
                questionText: 'Q1',
                options: [{ optionId: 'a', optionText: 'A' }],
                correctOptionIds: ['a'],
                explanationText: 'E1',
                status: 'not_attempted',
                srsLevel: 0,
                nextReviewAt: null,
              },
            ],
            totalQuestions: 1,
            answeredQuestions: 0,
            correctAnswers: 0,
            isCompleted: false,
          },
          {
            id: 'ch2',
            name: 'Chapter 2',
            description: 'Second chapter',
            questions: [
              {
                questionId: 'q2',
                questionText: 'Q2',
                options: [{ optionId: 'a', optionText: 'A' }],
                correctOptionIds: ['a'],
                explanationText: 'E2',
                status: 'not_attempted',
                srsLevel: 0,
                nextReviewAt: null,
              },
              {
                questionId: 'q3',
                questionText: 'Q3',
                options: [{ optionId: 'a', optionText: 'A' }],
                correctOptionIds: ['a'],
                explanationText: 'E3',
                status: 'mastered',
                srsLevel: 5,
                nextReviewAt: null,
              },
            ],
            totalQuestions: 2,
            answeredQuestions: 1,
            correctAnswers: 1,
            isCompleted: false,
          },
        ],
      });
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      render(<DashboardContainer />);

      // q1 (not_attempted, srsLevel 0) + q2 (not_attempted, srsLevel 0) = 2 due
      // q3 is mastered, not due
      expect(screen.getByTestId('review-count')).toHaveTextContent('2');
    });
  });

  // ============================================
  // PROPS VALIDATION
  // ============================================

  describe('Props Validation', () => {
    it('should work with all optional props omitted', () => {
      const mockModule = createMockModule();
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      // Should not throw
      expect(() => render(<DashboardContainer />)).not.toThrow();
    });

    it('should work with all optional props provided', () => {
      const mockModule = createMockModule();
      (useModuleLoader as any).mockReturnValue(
        createMockModuleLoaderReturn({ currentModule: mockModule }),
      );

      const onStartQuiz = vi.fn();
      const onStartReview = vi.fn();

      // Should not throw
      expect(() =>
        render(<DashboardContainer onStartQuiz={onStartQuiz} onStartReview={onStartReview} />),
      ).not.toThrow();
    });
  });
});
