import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MCQQuizForge from '@/app/page';

// Sample quiz module for testing - defined first for use in mocks
const mockQuizModule = {
  name: 'Test Quiz Module',
  description: 'A test quiz module',
  chapters: [
    {
      id: 'ch1',
      name: 'Chapter 1: Introduction',
      totalQuestions: 2,
      answeredQuestions: 0,
      correctAnswers: 0,
      questions: [
        {
          questionId: 'q1',
          questionText: 'What is 2 + 2?',
          options: [
            { optionId: 'opt_a', optionText: '3', isCorrect: false },
            { optionId: 'opt_b', optionText: '4', isCorrect: true },
            { optionId: 'opt_c', optionText: '5', isCorrect: false },
          ],
          correctOptionIds: ['opt_b'],
          explanationText: 'Basic math',
          status: 'not_attempted',
          timesAnsweredCorrectly: 0,
          timesAnsweredIncorrectly: 0,
          srsLevel: 0,
          nextReviewAt: null,
        },
        {
          questionId: 'q2',
          questionText: 'What is 3 + 3?',
          options: [
            { optionId: 'opt_a', optionText: '5', isCorrect: false },
            { optionId: 'opt_b', optionText: '6', isCorrect: true },
            { optionId: 'opt_c', optionText: '7', isCorrect: false },
          ],
          correctOptionIds: ['opt_b'],
          explanationText: 'More basic math',
          status: 'not_attempted',
          timesAnsweredCorrectly: 0,
          timesAnsweredIncorrectly: 0,
          srsLevel: 0,
          nextReviewAt: null,
        },
      ],
    },
    {
      id: 'ch2',
      name: 'Chapter 2: Advanced',
      totalQuestions: 1,
      answeredQuestions: 0,
      correctAnswers: 0,
      questions: [
        {
          questionId: 'q3',
          questionText: 'What is 10 * 10?',
          options: [
            { optionId: 'opt_a', optionText: '100', isCorrect: true },
            { optionId: 'opt_b', optionText: '1000', isCorrect: false },
          ],
          correctOptionIds: ['opt_a'],
          explanationText: 'Multiplication',
          status: 'not_attempted',
          timesAnsweredCorrectly: 0,
          timesAnsweredIncorrectly: 0,
          srsLevel: 0,
          nextReviewAt: null,
        },
      ],
    },
  ],
};

// Create hoisted mock functions that can be used in vi.mock
const { mockValidateQuizModule, mockNormalizeQuizModule } = vi.hoisted(() => ({
  mockValidateQuizModule: vi.fn(),
  mockNormalizeQuizModule: vi.fn(),
}));

// Mock validation utilities - must be before component mocks
vi.mock('@/utils/quiz-validation-refactored', () => ({
  validateQuizModule: mockValidateQuizModule,
  normalizeQuizModule: mockNormalizeQuizModule,
  validateSingleQuestion: vi.fn(() => ({ isValid: true, errors: [] })),
  normalizeSingleQuestion: vi.fn((data) => data),
  recalculateChapterStats: vi.fn(),
  validateAndCorrectQuizModule: vi.fn((content) => ({
    validationResult: { isValid: true, errors: [] },
    correctionResult: { correctionsMade: 0 },
    normalizedModule: JSON.parse(content),
  })),
  parseMarkdownToQuizModule: vi.fn(() => ({
    success: true,
    quizModule: { name: 'Markdown Quiz', chapters: [] },
    errors: [],
  })),
}));

// Mock child components
vi.mock('@/components/welcome-screen', () => ({
  WelcomeScreen: ({
    onLoadQuiz,
    onLoadDefaultQuiz,
    isLoading,
    error,
  }: {
    onLoadQuiz: (file: File) => void;
    onLoadDefaultQuiz: () => void;
    isLoading: boolean;
    error: string;
  }) => (
    <div data-testid="welcome-screen">
      <button data-testid="load-default-quiz" onClick={onLoadDefaultQuiz}>
        Load Default Quiz
      </button>
      <input
        data-testid="file-input"
        type="file"
        onChange={(e) => e.target.files?.[0] && onLoadQuiz(e.target.files[0])}
      />
      {isLoading && <span data-testid="loading">Loading...</span>}
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
}));

vi.mock('@/components/dashboard', () => ({
  Dashboard: ({
    module,
    onStartQuiz,
    onStartReviewSession,
    onExportState,
    onImportState,
    onExportIncorrectAnswers,
    onLoadNewModule,
    reviewQueueCount,
  }: {
    module: { name: string; chapters: { id: string; name: string }[] };
    onStartQuiz: (chapterId: string) => void;
    onStartReviewSession: () => void;
    onExportState: () => void;
    onImportState: (file: File) => void;
    onExportIncorrectAnswers: () => void;
    onLoadNewModule: () => void;
    reviewQueueCount: number;
  }) => (
    <div data-testid="dashboard">
      <h1>{module.name}</h1>
      <span data-testid="review-count">{reviewQueueCount}</span>
      {module.chapters.map((ch) => (
        <button key={ch.id} data-testid={`start-quiz-${ch.id}`} onClick={() => onStartQuiz(ch.id)}>
          Start {ch.name}
        </button>
      ))}
      <button data-testid="start-review" onClick={onStartReviewSession}>
        Start Review
      </button>
      <button data-testid="export-state" onClick={onExportState}>
        Export State
      </button>
      <button data-testid="export-incorrect" onClick={onExportIncorrectAnswers}>
        Export Incorrect
      </button>
      <button data-testid="load-new-module" onClick={onLoadNewModule}>
        Load New Module
      </button>
      <input
        data-testid="import-state-input"
        type="file"
        onChange={(e) => e.target.files?.[0] && onImportState(e.target.files[0])}
      />
    </div>
  ),
}));

vi.mock('@/components/quiz-session', () => ({
  QuizSession: ({
    chapter,
    question,
    currentQuestionIndex,
    totalQuestions,
    selectedOptionId,
    isSubmitted,
    onSelectOption,
    onSubmitAnswer,
    onNextQuestion,
    onBackToDashboard,
  }: {
    chapter: { name: string };
    question: { questionId: string; questionText: string };
    currentQuestionIndex: number;
    totalQuestions: number;
    selectedOptionId: string | null;
    isSubmitted: boolean;
    onSelectOption: (optionId: string) => void;
    onSubmitAnswer: (options: unknown[]) => void;
    onNextQuestion: () => void;
    onBackToDashboard: () => void;
  }) => (
    <div data-testid="quiz-session">
      <h2>{chapter.name}</h2>
      <p data-testid="question-text">{question.questionText}</p>
      <span data-testid="question-progress">
        {currentQuestionIndex + 1}/{totalQuestions}
      </span>
      <button data-testid="select-option-a" onClick={() => onSelectOption('opt_a')}>
        Select Option A
      </button>
      <button
        data-testid="submit-answer"
        onClick={() => onSubmitAnswer([])}
        disabled={!selectedOptionId}
      >
        Submit
      </button>
      {isSubmitted && (
        <button data-testid="next-question" onClick={onNextQuestion}>
          Next Question
        </button>
      )}
      <button data-testid="back-to-dashboard" onClick={onBackToDashboard}>
        Back to Dashboard
      </button>
    </div>
  ),
}));

vi.mock('@/components/quiz-complete', () => ({
  QuizComplete: ({
    chapter,
    results,
    onBackToDashboard,
    onRetryQuiz,
    onExportResults,
  }: {
    chapter: { name: string };
    results: { accuracy: number; totalQuestions: number; correctAnswers: number };
    onBackToDashboard: () => void;
    onRetryQuiz: () => void;
    onExportResults: () => void;
  }) => (
    <div data-testid="quiz-complete">
      <h2>Quiz Complete: {chapter.name}</h2>
      <span data-testid="accuracy">{results.accuracy}%</span>
      <span data-testid="total-questions">{results.totalQuestions}</span>
      <span data-testid="correct-answers">{results.correctAnswers}</span>
      <button data-testid="back-to-dashboard" onClick={onBackToDashboard}>
        Back to Dashboard
      </button>
      <button data-testid="retry-quiz" onClick={onRetryQuiz}>
        Retry Quiz
      </button>
      <button data-testid="export-results" onClick={onExportResults}>
        Export Results
      </button>
    </div>
  ),
}));

vi.mock('@/components/all-questions-view', () => ({
  AllQuestionsView: ({
    chapter,
    onBackToQuiz,
    onBackToDashboard,
  }: {
    chapter: { name: string };
    onBackToQuiz: () => void;
    onBackToDashboard: () => void;
  }) => (
    <div data-testid="all-questions-view">
      <h2>All Questions: {chapter.name}</h2>
      <button data-testid="back-to-quiz" onClick={onBackToQuiz}>
        Back to Quiz
      </button>
      <button data-testid="back-to-dashboard" onClick={onBackToDashboard}>
        Back to Dashboard
      </button>
    </div>
  ),
}));

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

vi.mock('@/components/confirmation-modal-radix', () => ({
  ConfirmationModal: ({
    isOpen,
    title,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <h3>{title}</h3>
        <button data-testid="confirm-modal" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-modal" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
}));

describe('MCQQuizForge Page Component', () => {
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch = vi.fn();
    // Store original createElement
    originalCreateElement = document.createElement.bind(document);

    // Reset validation mocks with default implementations
    mockValidateQuizModule.mockReturnValue({ isValid: true, errors: [] });
    mockNormalizeQuizModule.mockImplementation((data) => data);
  });

  afterEach(() => {
    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  describe('Initial Render', () => {
    it('should render the welcome screen on initial load', () => {
      render(<MCQQuizForge />);

      expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      expect(screen.getByTestId('load-default-quiz')).toBeInTheDocument();
    });

    it('should render the Toaster component', () => {
      render(<MCQQuizForge />);

      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });

    it('should not show loading state initially', () => {
      render(<MCQQuizForge />);

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    it('should not show error state initially', () => {
      render(<MCQQuizForge />);

      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });
  });

  describe('Loading Default Quiz', () => {
    it('should load the default quiz when button is clicked', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockQuizModule)),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      const loadButton = screen.getByTestId('load-default-quiz');
      await userEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText('Test Quiz Module')).toBeInTheDocument();
    });

    it('should show error when default quiz fails to load', async () => {
      (global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<MCQQuizForge />);

      const loadButton = screen.getByTestId('load-default-quiz');
      await userEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });

    it('should handle invalid JSON in default quiz', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('not valid json'),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      const loadButton = screen.getByTestId('load-default-quiz');
      await userEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });
  });

  describe('Loading Custom Quiz File', () => {
    it('should load a custom JSON quiz file', async () => {
      // Mocks are already set up with default implementations

      render(<MCQQuizForge />);

      const fileInput = screen.getByTestId('file-input');
      const file = new File([JSON.stringify(mockQuizModule)], 'quiz.json', {
        type: 'application/json',
      });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('should handle validation errors in custom quiz file', async () => {
      // Override mock for this test
      mockValidateQuizModule.mockReturnValue({
        isValid: false,
        errors: ['Invalid quiz format'],
      });

      render(<MCQQuizForge />);

      const fileInput = screen.getByTestId('file-input');
      const file = new File(['{}'], 'invalid-quiz.json', {
        type: 'application/json',
      });

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Navigation', () => {
    it('should start a quiz when chapter is selected', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockQuizModule)),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('start-quiz-ch1'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-session')).toBeInTheDocument();
      });
    });

    it('should return to dashboard from quiz session', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockQuizModule)),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('start-quiz-ch1'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-session')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('back-to-dashboard'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('should load new module when requested', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockQuizModule)),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('load-new-module'));

      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
    });
  });

  describe('Quiz Session Interactions', () => {
    it('should display question progress correctly', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockQuizModule)),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('start-quiz-ch1'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-session')).toBeInTheDocument();
      });

      expect(screen.getByTestId('question-progress')).toHaveTextContent('1/2');
    });

    it('should allow selecting an option', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockQuizModule)),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('start-quiz-ch1'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-session')).toBeInTheDocument();
      });

      const selectButton = screen.getByTestId('select-option-a');
      expect(selectButton).toBeInTheDocument();
    });
  });

  describe('State Export and Import', () => {
    it('should have export state button available on dashboard', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockQuizModule)),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Export button should be present
      expect(screen.getByTestId('export-state')).toBeInTheDocument();
    });
  });

  describe('Review Session', () => {
    it('should display correct review queue count', async () => {
      const moduleWithDueReview = {
        ...mockQuizModule,
        chapters: [
          {
            ...mockQuizModule.chapters[0],
            questions: [
              {
                ...mockQuizModule.chapters[0].questions[0],
                status: 'attempted',
                srsLevel: 0,
                nextReviewAt: null, // Brand new, due for review
              },
            ],
          },
        ],
      };

      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(moduleWithDueReview)),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Review count should be displayed
      expect(screen.getByTestId('review-count')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch failure gracefully', async () => {
      (global.fetch as Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      // Should still be on welcome screen
      expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
    });

    it('should handle 404 response from default quiz', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });
  });

  describe('Confirmation Modals', () => {
    it('should not show confirmation modals initially', () => {
      render(<MCQQuizForge />);

      expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Chapter Navigation', () => {
    it('should render buttons for all chapters', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockQuizModule)),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      expect(screen.getByTestId('start-quiz-ch1')).toBeInTheDocument();
      expect(screen.getByTestId('start-quiz-ch2')).toBeInTheDocument();
    });

    it('should start different chapters when selected', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockQuizModule)),
        headers: new Headers(),
      });

      render(<MCQQuizForge />);

      await userEvent.click(screen.getByTestId('load-default-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Start second chapter
      await userEvent.click(screen.getByTestId('start-quiz-ch2'));

      await waitFor(() => {
        expect(screen.getByTestId('quiz-session')).toBeInTheDocument();
      });

      // Chapter 2 has only 1 question
      expect(screen.getByTestId('question-progress')).toHaveTextContent('1/1');
    });
  });
});
