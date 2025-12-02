import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizSession } from '@/components/quiz-session';
import { ScreenReaderAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';
import type {
  QuizChapter,
  QuizQuestion,
  QuizModule,
  SessionHistoryEntry,
} from '@/types/quiz-types';

// Mock the MarkdownRenderer component to avoid complex markdown parsing in tests
vi.mock('@/components/rendering/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ markdown, className }: { markdown: string; className?: string }) => (
    <div data-testid="markdown-renderer" className={className}>
      {markdown}
    </div>
  ),
}));

// Mock lucide-react icons to simplify testing
vi.mock('lucide-react', () => ({
  ArrowLeft: () => (
    <span data-testid="arrow-left-icon" aria-hidden="true">
      ←
    </span>
  ),
  ArrowRight: () => (
    <span data-testid="arrow-right-icon" aria-hidden="true">
      →
    </span>
  ),
  Send: () => <span data-testid="send-icon" aria-hidden="true"></span>,
  Clock: () => <span data-testid="clock-icon" aria-hidden="true"></span>,
  Brain: () => <span data-testid="brain-icon" aria-hidden="true"></span>,
  Download: () => <span data-testid="download-icon" aria-hidden="true"></span>,
  Upload: () => <span data-testid="upload-icon" aria-hidden="true"></span>,
  RotateCcw: () => <span data-testid="rotate-icon" aria-hidden="true"></span>,
  Edit: () => <span data-testid="edit-icon" aria-hidden="true"></span>,
  Plus: () => <span data-testid="plus-icon" aria-hidden="true"></span>,
  Home: () => <span data-testid="home-icon" aria-hidden="true"></span>,
  List: () => <span data-testid="list-icon" aria-hidden="true"></span>,
  Check: () => (
    <span data-testid="check-icon" aria-hidden="true">
      ✓
    </span>
  ),
  X: () => (
    <span data-testid="x-icon" aria-hidden="true">
      ✗
    </span>
  ),
  Eye: () => <span data-testid="eye-icon" aria-hidden="true"></span>,
  EyeOff: () => <span data-testid="eye-off-icon" aria-hidden="true"></span>,
  Trash2: () => <span data-testid="trash-icon" aria-hidden="true"></span>,
  Save: () => <span data-testid="save-icon" aria-hidden="true"></span>,
  XCircle: () => <span data-testid="x-circle-icon" aria-hidden="true"></span>,
  GripVertical: () => <span data-testid="grip-icon" aria-hidden="true"></span>,
  AlertCircle: () => <span data-testid="alert-icon" aria-hidden="true"></span>,
}));

// Helper function to create a basic question
const createMockQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  questionId: 'q1',
  questionText: 'What is 2 + 2?',
  options: [
    { optionId: 'opt1', optionText: '3' },
    { optionId: 'opt2', optionText: '4' },
    { optionId: 'opt3', optionText: '5' },
    { optionId: 'opt4', optionText: '6' },
  ],
  correctOptionIds: ['opt2'],
  explanationText: 'The correct answer is 4 because 2 + 2 = 4.',
  status: 'not_attempted',
  timesAnsweredCorrectly: 0,
  timesAnsweredIncorrectly: 0,
  historyOfIncorrectSelections: [],
  srsLevel: 0,
  nextReviewAt: null,
  shownIncorrectOptionIds: [],
  ...overrides,
});

// Helper function to create a basic chapter
const createMockChapter = (overrides: Partial<QuizChapter> = {}): QuizChapter => ({
  id: 'ch1',
  name: 'Chapter 1: Basic Mathematics',
  description: 'Fundamental math concepts',
  questions: [createMockQuestion()],
  totalQuestions: 1,
  answeredQuestions: 0,
  correctAnswers: 0,
  isCompleted: false,
  ...overrides,
});

// Helper function to create a basic module
const createMockModule = (overrides: Partial<QuizModule> = {}): QuizModule => ({
  name: 'Math Module',
  description: 'A math module',
  chapters: [createMockChapter()],
  ...overrides,
});

// Helper function to create mock session history entry
const createMockHistoryEntry = (
  overrides: Partial<SessionHistoryEntry> = {},
): SessionHistoryEntry => ({
  questionSnapshot: createMockQuestion(),
  selectedOptionId: 'opt2',
  displayedOptions: [
    { optionId: 'opt1', optionText: '3', isCorrect: false },
    { optionId: 'opt2', optionText: '4', isCorrect: true },
    { optionId: 'opt3', optionText: '5', isCorrect: false },
  ],
  isCorrect: true,
  isReviewSessionQuestion: false,
  chapterId: 'ch1',
  ...overrides,
});

// Default props for QuizSession
const createDefaultProps = () => ({
  chapter: createMockChapter(),
  question: createMockQuestion(),
  currentQuestionIndex: 0,
  totalQuestions: 1,
  selectedOptionId: null as string | null,
  isSubmitted: false,
  isReviewSession: false,
  sessionHistory: [] as SessionHistoryEntry[],
  currentHistoryViewIndex: null as number | null,
  onSelectOption: vi.fn(),
  onSubmitAnswer: vi.fn(),
  onNextQuestion: vi.fn(),
  onBackToDashboard: vi.fn(),
  onExportCurrentQuestionState: vi.fn(),
  onImportQuestionStateFromFile: vi.fn(),
  onRetryChapter: vi.fn(),
  onNavigateToQuestion: vi.fn(),
});

// Wrapper component that provides required context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ScreenReaderAnnouncer>{children}</ScreenReaderAnnouncer>
);

// Helper function to render QuizSession with all required context
const renderQuizSession = (props = createDefaultProps()) => {
  return render(<QuizSession {...props} />, { wrapper: TestWrapper });
};

describe('QuizSession Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the component with all required elements', () => {
      renderQuizSession();
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Choose your answer:')).toBeInTheDocument();
      expect(screen.getByText('Question Navigation')).toBeInTheDocument();
    });

    it('should render the question text', () => {
      renderQuizSession();
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    it('should render the chapter name correctly', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({ name: 'Chapter 1: Basic Mathematics' });
      renderQuizSession(props);
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('Basic Mathematics')).toBeInTheDocument();
    });

    it('should render chapter name without chapter number format', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({ name: 'Introduction to Algebra' });
      renderQuizSession(props);
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
    });

    it('should render all answer options', () => {
      renderQuizSession();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('should render the progress bar', () => {
      const props = createDefaultProps();
      props.totalQuestions = 10;
      props.currentQuestionIndex = 4;
      renderQuizSession(props);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render the home button', () => {
      renderQuizSession();
      const homeIcon = screen.getByTestId('home-icon');
      expect(homeIcon.closest('button')).toBeInTheDocument();
    });

    it('should render the retry chapter button for non-review sessions', () => {
      const props = createDefaultProps();
      props.isReviewSession = false;
      renderQuizSession(props);
      const retryIcon = screen.getByTestId('rotate-icon');
      expect(retryIcon.closest('button')).toBeInTheDocument();
    });
  });

  describe('Review Session Mode', () => {
    it('should render review session header when in review mode', () => {
      const props = createDefaultProps();
      props.isReviewSession = true;
      renderQuizSession(props);
      expect(screen.getByText('Review Session')).toBeInTheDocument();
      expect(screen.getByText('Review Question')).toBeInTheDocument();
    });

    it('should not render retry chapter button in review mode', () => {
      const props = createDefaultProps();
      props.isReviewSession = true;
      renderQuizSession(props);
      expect(screen.queryByTestId('rotate-icon')).not.toBeInTheDocument();
    });

    it('should display SRS level when available', () => {
      const props = createDefaultProps();
      props.isReviewSession = true;
      props.question = createMockQuestion({ srsLevel: 2 });
      renderQuizSession(props);
      expect(screen.getByText(/SRS Level: 2/)).toBeInTheDocument();
    });

    it('should render SRS progress counts when provided', () => {
      const props = createDefaultProps();
      props.question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Option A' },
          { optionId: 'opt2', optionText: 'Option B' },
        ],
      });
      props.isReviewSession = true;
      props.srsProgressCounts = {
        newOrLapsingDue: 8,
        learningReviewDue: 4,
        totalNonMastered: 15,
      };
      renderQuizSession(props);
      expect(screen.getByText('Review Progress')).toBeInTheDocument();
      const eightElements = screen.getAllByText('8');
      expect(eightElements.length).toBeGreaterThan(0);
    });
  });

  describe('Option Selection', () => {
    it('should call onSelectOption when an option is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      renderQuizSession(props);
      const option = screen.getByText('4');
      await user.click(option);
      expect(props.onSelectOption).toHaveBeenCalled();
    });

    it('should render submit button when no option is selected', () => {
      renderQuizSession();
      const submitButton = screen.getByRole('button', { name: /submit answer/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when an option is selected', () => {
      const props = createDefaultProps();
      props.selectedOptionId = 'opt2';
      renderQuizSession(props);
      const submitButton = screen.getByRole('button', { name: /submit answer/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should call onSubmitAnswer when submit button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.selectedOptionId = 'opt2';
      renderQuizSession(props);
      const submitButton = screen.getByRole('button', { name: /submit answer/i });
      await user.click(submitButton);
      expect(props.onSubmitAnswer).toHaveBeenCalled();
    });
  });

  describe('Answer Submission and Feedback', () => {
    it('should display explanation after submission', () => {
      const props = createDefaultProps();
      props.isSubmitted = true;
      props.selectedOptionId = 'opt2';
      renderQuizSession(props);
      expect(screen.getByText('Explanation')).toBeInTheDocument();
    });

    it('should show next question button after submission', () => {
      const props = createDefaultProps();
      props.isSubmitted = true;
      props.selectedOptionId = 'opt2';
      renderQuizSession(props);
      const nextButton = screen.getByRole('button', { name: /next question/i });
      expect(nextButton).toBeInTheDocument();
    });

    it('should call onNextQuestion when next button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.isSubmitted = true;
      props.selectedOptionId = 'opt2';
      renderQuizSession(props);
      const nextButton = screen.getByRole('button', { name: /next question/i });
      await user.click(nextButton);
      expect(props.onNextQuestion).toHaveBeenCalled();
    });

    it('should hide submit button after submission', () => {
      const props = createDefaultProps();
      props.isSubmitted = true;
      props.selectedOptionId = 'opt2';
      renderQuizSession(props);
      expect(screen.queryByRole('button', { name: /submit answer/i })).not.toBeInTheDocument();
    });

    it('should display Next Review button in review mode', () => {
      const props = createDefaultProps();
      props.isReviewSession = true;
      props.isSubmitted = true;
      props.selectedOptionId = 'opt2';
      renderQuizSession(props);
      expect(screen.getByRole('button', { name: /next review/i })).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onBackToDashboard when home button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      renderQuizSession(props);
      const homeIcon = screen.getByTestId('home-icon');
      const homeButton = homeIcon.closest('button');
      expect(homeButton).not.toBeNull();
      await user.click(homeButton!);
      expect(props.onBackToDashboard).toHaveBeenCalled();
    });

    it('should call onRetryChapter when retry button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      renderQuizSession(props);
      const retryIcon = screen.getByTestId('rotate-icon');
      const retryButton = retryIcon.closest('button');
      expect(retryButton).not.toBeNull();
      await user.click(retryButton!);
      expect(props.onRetryChapter).toHaveBeenCalled();
    });

    it('should render question navigation grid', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({
        questions: [
          createMockQuestion({ questionId: 'q1' }),
          createMockQuestion({ questionId: 'q2', questionText: 'Question 2' }),
          createMockQuestion({ questionId: 'q3', questionText: 'Question 3' }),
        ],
      });
      props.totalQuestions = 3;
      renderQuizSession(props);
      expect(screen.getByRole('grid', { name: /question navigation/i })).toBeInTheDocument();
    });

    it('should call onNavigateToQuestion when grid button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.chapter = createMockChapter({
        questions: [
          createMockQuestion({ questionId: 'q1' }),
          createMockQuestion({ questionId: 'q2', questionText: 'Question 2' }),
        ],
      });
      props.totalQuestions = 2;
      renderQuizSession(props);
      const question2Button = screen.getByRole('gridcell', { name: /navigate to question 2/i });
      await user.click(question2Button);
      expect(props.onNavigateToQuestion).toHaveBeenCalledWith(1);
    });
  });

  describe('Session History Navigation', () => {
    it('should show previous answer button when history is available and answer is submitted', () => {
      const props = createDefaultProps();
      props.isSubmitted = true;
      props.sessionHistory = [createMockHistoryEntry()];
      props.onViewPrevious = vi.fn();
      renderQuizSession(props);
      const prevButton = screen.getByRole('button', { name: /previous answer/i });
      expect(prevButton).toBeInTheDocument();
    });

    it('should call onViewPrevious when previous button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.isSubmitted = true;
      props.sessionHistory = [createMockHistoryEntry()];
      props.onViewPrevious = vi.fn();
      renderQuizSession(props);
      const prevButton = screen.getByRole('button', { name: /previous answer/i });
      await user.click(prevButton);
      expect(props.onViewPrevious).toHaveBeenCalled();
    });

    it('should show next answer button when viewing historical entry and not at end', () => {
      const props = createDefaultProps();
      props.sessionHistory = [
        createMockHistoryEntry({ selectedOptionId: 'opt1' }),
        createMockHistoryEntry({ selectedOptionId: 'opt2' }),
      ];
      props.currentHistoryViewIndex = 0;
      props.onViewNextInHistory = vi.fn();
      renderQuizSession(props);
      const nextAnswerButton = screen.getByRole('button', { name: /next answer/i });
      expect(nextAnswerButton).toBeInTheDocument();
    });

    it('should call onViewNextInHistory when next answer button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.sessionHistory = [
        createMockHistoryEntry({ selectedOptionId: 'opt1' }),
        createMockHistoryEntry({ selectedOptionId: 'opt2' }),
      ];
      props.currentHistoryViewIndex = 0;
      props.onViewNextInHistory = vi.fn();
      renderQuizSession(props);
      const nextAnswerButton = screen.getByRole('button', { name: /next answer/i });
      await user.click(nextAnswerButton);
      expect(props.onViewNextInHistory).toHaveBeenCalled();
    });

    it('should display historical question data when viewing history', () => {
      const historicalQuestion = createMockQuestion({
        questionId: 'historical-q1',
        questionText: 'Historical question text',
      });
      const props = createDefaultProps();
      props.sessionHistory = [
        createMockHistoryEntry({
          questionSnapshot: historicalQuestion,
          displayedOptions: [
            { optionId: 'opt1', optionText: 'Historical option 1', isCorrect: false },
            { optionId: 'opt2', optionText: 'Historical option 2', isCorrect: true },
          ],
        }),
      ];
      props.currentHistoryViewIndex = 0;
      renderQuizSession(props);
      expect(screen.getByText('Historical question text')).toBeInTheDocument();
    });

    it('should disable previous button when at first history entry', () => {
      const props = createDefaultProps();
      props.sessionHistory = [createMockHistoryEntry()];
      props.currentHistoryViewIndex = 0;
      props.onViewPrevious = vi.fn();
      renderQuizSession(props);
      const prevButton = screen.getByRole('button', { name: /previous answer/i });
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Import/Export Functionality', () => {
    it('should render export button', () => {
      renderQuizSession();
      const exportIcon = screen.getByTestId('download-icon');
      expect(exportIcon.closest('button')).toBeInTheDocument();
    });

    it('should call onExportCurrentQuestionState when export button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      renderQuizSession(props);
      const exportIcon = screen.getByTestId('download-icon');
      const exportButton = exportIcon.closest('button');
      expect(exportButton).not.toBeNull();
      await user.click(exportButton!);
      expect(props.onExportCurrentQuestionState).toHaveBeenCalled();
    });

    it('should render import button', () => {
      renderQuizSession();
      const importIcon = screen.getByTestId('upload-icon');
      expect(importIcon.closest('button')).toBeInTheDocument();
    });

    it('should not show import/export buttons when viewing history', () => {
      const props = createDefaultProps();
      props.sessionHistory = [createMockHistoryEntry()];
      props.currentHistoryViewIndex = 0;
      renderQuizSession(props);
      expect(screen.queryByTestId('download-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('upload-icon')).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should render edit button when edit mode props are provided', () => {
      const props = createDefaultProps();
      props.onSetEditMode = vi.fn();
      props.onSaveQuestion = vi.fn();
      props.onDeleteQuestion = vi.fn();
      renderQuizSession(props);
      const editIcon = screen.getByTestId('edit-icon');
      expect(editIcon.closest('button')).toBeInTheDocument();
    });

    it('should render add question button when edit mode props are provided', () => {
      const props = createDefaultProps();
      props.onSetEditMode = vi.fn();
      props.onSaveQuestion = vi.fn();
      props.onDeleteQuestion = vi.fn();
      props.generateUniqueQuestionId = vi.fn().mockReturnValue('new-q1');
      renderQuizSession(props);
      const addIcon = screen.getByTestId('plus-icon');
      expect(addIcon.closest('button')).toBeInTheDocument();
    });

    it('should call onSetEditMode when edit button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.onSetEditMode = vi.fn();
      props.onSaveQuestion = vi.fn();
      props.onDeleteQuestion = vi.fn();
      renderQuizSession(props);
      const editIcon = screen.getByTestId('edit-icon');
      const editButton = editIcon.closest('button');
      expect(editButton).not.toBeNull();
      await user.click(editButton!);
      expect(props.onSetEditMode).toHaveBeenCalledWith(props.question);
    });

    it('should disable edit button when edit mode is active', () => {
      const props = createDefaultProps();
      props.isEditModeActive = true;
      props.onSetEditMode = vi.fn();
      props.onSaveQuestion = vi.fn();
      props.onDeleteQuestion = vi.fn();
      renderQuizSession(props);
      const editIcon = screen.getByTestId('edit-icon');
      const editButton = editIcon.closest('button');
      expect(editButton).toBeDisabled();
    });
  });

  describe('View All Questions', () => {
    it('should render view all questions button when handler is provided', () => {
      const props = createDefaultProps();
      props.onViewAllQuestions = vi.fn();
      renderQuizSession(props);
      const listIcon = screen.getByTestId('list-icon');
      expect(listIcon.closest('button')).toBeInTheDocument();
    });

    it('should not render view all questions button in review mode', () => {
      const props = createDefaultProps();
      props.isReviewSession = true;
      props.onViewAllQuestions = vi.fn();
      renderQuizSession(props);
      expect(screen.queryByTestId('list-icon')).not.toBeInTheDocument();
    });

    it('should call onViewAllQuestions when button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.onViewAllQuestions = vi.fn();
      renderQuizSession(props);
      const listIcon = screen.getByTestId('list-icon');
      const viewAllButton = listIcon.closest('button');
      expect(viewAllButton).not.toBeNull();
      await user.click(viewAllButton!);
      expect(props.onViewAllQuestions).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array gracefully', () => {
      const props = createDefaultProps();
      props.question = createMockQuestion({ options: [] });
      expect(() => renderQuizSession(props)).not.toThrow();
    });

    it('should handle single question chapter', () => {
      const props = createDefaultProps();
      props.totalQuestions = 1;
      props.currentQuestionIndex = 0;
      renderQuizSession(props);
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle question with multiple correct options', () => {
      const props = createDefaultProps();
      props.question = createMockQuestion({
        correctOptionIds: ['opt1', 'opt2'],
      });
      renderQuizSession(props);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should handle question without SRS fields', () => {
      const props = createDefaultProps();
      props.question = {
        questionId: 'q1',
        questionText: 'Simple question',
        options: [
          { optionId: 'opt1', optionText: 'A' },
          { optionId: 'opt2', optionText: 'B' },
        ],
        correctOptionIds: ['opt1'],
        explanationText: 'A is correct',
      } as QuizQuestion;
      expect(() => renderQuizSession(props)).not.toThrow();
    });

    it('should handle empty session history', () => {
      const props = createDefaultProps();
      props.sessionHistory = [];
      props.currentHistoryViewIndex = null;
      expect(() => renderQuizSession(props)).not.toThrow();
    });

    it('should handle chapter with very long name', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({
        name: 'Chapter 1: This is a very long chapter name that might cause layout issues',
      });
      renderQuizSession(props);
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    });

    it('should handle question with special characters in text', () => {
      const props = createDefaultProps();
      props.question = createMockQuestion({
        questionText: 'What is the result of x < y && y > z?',
      });
      renderQuizSession(props);
      expect(screen.getByText('What is the result of x < y && y > z?')).toBeInTheDocument();
    });
  });

  describe('Multiple Questions Navigation', () => {
    it('should display correct question number in multi-question chapter', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({
        questions: [
          createMockQuestion({ questionId: 'q1' }),
          createMockQuestion({ questionId: 'q2' }),
          createMockQuestion({ questionId: 'q3' }),
        ],
      });
      props.totalQuestions = 3;
      props.currentQuestionIndex = 1;
      renderQuizSession(props);
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });

    it('should show correct progress percentage', () => {
      const props = createDefaultProps();
      props.totalQuestions = 4;
      props.currentQuestionIndex = 1;
      renderQuizSession(props);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render all navigation grid buttons for multi-question chapter', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({
        questions: [
          createMockQuestion({ questionId: 'q1' }),
          createMockQuestion({ questionId: 'q2' }),
          createMockQuestion({ questionId: 'q3' }),
          createMockQuestion({ questionId: 'q4' }),
        ],
      });
      props.totalQuestions = 4;
      renderQuizSession(props);
      const grid = screen.getByRole('grid', { name: /question navigation/i });
      const buttons = within(grid).getAllByRole('gridcell');
      expect(buttons).toHaveLength(4);
    });
  });

  describe('Score Display', () => {
    it('should display score section', () => {
      renderQuizSession();
      expect(screen.getByText('Score:')).toBeInTheDocument();
    });

    it('should calculate score percentage from module data', () => {
      const props = createDefaultProps();
      props.currentModule = createMockModule({
        chapters: [
          createMockChapter({
            id: 'ch1',
            correctAnswers: 3,
            totalQuestions: 10,
          }),
        ],
      });
      renderQuizSession(props);
      expect(screen.getByText('Score:')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper radiogroup role for options', () => {
      renderQuizSession();
      const radiogroup = screen.getByRole('radiogroup', { name: /answer options/i });
      expect(radiogroup).toBeInTheDocument();
    });

    it('should have proper grid role for question navigation', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({
        questions: [
          createMockQuestion({ questionId: 'q1' }),
          createMockQuestion({ questionId: 'q2' }),
        ],
      });
      props.totalQuestions = 2;
      renderQuizSession(props);
      const grid = screen.getByRole('grid', { name: /question navigation/i });
      expect(grid).toBeInTheDocument();
    });

    it('should have accessible icon buttons', () => {
      const props = createDefaultProps();
      props.onViewAllQuestions = vi.fn();
      renderQuizSession(props);
      expect(screen.getByTestId('home-icon').closest('button')).toBeInTheDocument();
      expect(screen.getByTestId('rotate-icon').closest('button')).toBeInTheDocument();
      expect(screen.getByTestId('list-icon').closest('button')).toBeInTheDocument();
    });

    it('should have status legend for question navigation', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({
        questions: [
          createMockQuestion({ questionId: 'q1' }),
          createMockQuestion({ questionId: 'q2' }),
        ],
      });
      props.totalQuestions = 2;
      renderQuizSession(props);
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Correct')).toBeInTheDocument();
      expect(screen.getByText('Incorrect')).toBeInTheDocument();
      expect(screen.getByText('Unanswered')).toBeInTheDocument();
    });
  });

  describe('Question Editor Modal', () => {
    it('should attempt to render QuestionEditor when edit mode is active', () => {
      const props = createDefaultProps();
      props.isEditModeActive = true;
      props.editingQuestionData = createMockQuestion();
      props.onSetEditMode = vi.fn();
      props.onSaveQuestion = vi.fn();
      props.onDeleteQuestion = vi.fn();
      expect(() => renderQuizSession(props)).not.toThrow();
    });

    it('should not show QuestionEditor when edit mode is inactive', () => {
      const props = createDefaultProps();
      props.isEditModeActive = false;
      props.editingQuestionData = null;
      props.onSetEditMode = vi.fn();
      props.onSaveQuestion = vi.fn();
      props.onDeleteQuestion = vi.fn();
      renderQuizSession(props);
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
  });

  describe('SRS Progress Display', () => {
    it('should display SRS progress bars in review session', () => {
      const props = createDefaultProps();
      props.question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Option A' },
          { optionId: 'opt2', optionText: 'Option B' },
        ],
      });
      props.isReviewSession = true;
      props.srsProgressCounts = {
        newOrLapsingDue: 10,
        learningReviewDue: 7,
        totalNonMastered: 20,
      };
      renderQuizSession(props);
      expect(screen.getByText('New/Lapsing (Due Now)')).toBeInTheDocument();
      expect(screen.getByText('Learning Pipeline')).toBeInTheDocument();
      const tenElements = screen.getAllByText('10');
      expect(tenElements.length).toBeGreaterThan(0);
    });

    it('should display active workload summary', () => {
      const props = createDefaultProps();
      props.question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Option A' },
          { optionId: 'opt2', optionText: 'Option B' },
        ],
      });
      props.isReviewSession = true;
      props.srsProgressCounts = {
        newOrLapsingDue: 10,
        learningReviewDue: 5,
        totalNonMastered: 20,
      };
      renderQuizSession(props);
      expect(screen.getByText(/Active Workload: 15 of 20 non-mastered/)).toBeInTheDocument();
    });

    it('should handle zero progress counts', () => {
      const props = createDefaultProps();
      props.question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Option A' },
          { optionId: 'opt2', optionText: 'Option B' },
        ],
      });
      props.isReviewSession = true;
      props.srsProgressCounts = {
        newOrLapsingDue: 0,
        learningReviewDue: 0,
        totalNonMastered: 0,
      };
      renderQuizSession(props);
      expect(screen.getByText(/Active Workload: 0 of 0 non-mastered/)).toBeInTheDocument();
    });
  });

  describe('Completion Status', () => {
    it('should display completion percentage in navigation', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({
        questions: [
          createMockQuestion({ questionId: 'q1' }),
          createMockQuestion({ questionId: 'q2' }),
          createMockQuestion({ questionId: 'q3' }),
          createMockQuestion({ questionId: 'q4' }),
        ],
      });
      props.sessionHistory = [
        createMockHistoryEntry({ questionSnapshot: createMockQuestion({ questionId: 'q1' }) }),
        createMockHistoryEntry({ questionSnapshot: createMockQuestion({ questionId: 'q2' }) }),
      ];
      renderQuizSession(props);
      expect(screen.getByText('50% Complete')).toBeInTheDocument();
    });

    it('should show 0% complete when no questions answered', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({
        questions: [
          createMockQuestion({ questionId: 'q1' }),
          createMockQuestion({ questionId: 'q2' }),
        ],
      });
      props.sessionHistory = [];
      renderQuizSession(props);
      expect(screen.getByText('0% Complete')).toBeInTheDocument();
    });
  });

  describe('Explanation Processing', () => {
    it('should render explanation with processed text after submission', () => {
      const props = createDefaultProps();
      props.isSubmitted = true;
      props.selectedOptionId = 'opt2';
      props.question = createMockQuestion({
        explanationText: 'The answer is opt2 because it equals 4.',
        options: [
          { optionId: 'opt1', optionText: '3' },
          { optionId: 'opt2', optionText: '4' },
        ],
      });
      renderQuizSession(props);
      expect(screen.getByText('Explanation')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard interaction on option cards', () => {
      renderQuizSession();
      const radiogroup = screen.getByRole('radiogroup');
      const firstOption = within(radiogroup).getAllByRole('radio')[0];
      firstOption.focus();
      expect(firstOption).toHaveFocus();
    });

    it('should support keyboard interaction on navigation grid', () => {
      const props = createDefaultProps();
      props.chapter = createMockChapter({
        questions: [
          createMockQuestion({ questionId: 'q1' }),
          createMockQuestion({ questionId: 'q2' }),
        ],
      });
      props.totalQuestions = 2;
      renderQuizSession(props);
      const grid = screen.getByRole('grid');
      const buttons = within(grid).getAllByRole('gridcell');
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();
    });
  });
});
