import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@/components/dashboard';
import type { QuizModule, QuizChapter, QuizQuestion } from '@/types/quiz-types';

// Mock lucide-react icons to simplify testing
vi.mock('lucide-react', () => ({
  Upload: () => (
    <span data-testid="upload-icon" aria-hidden="true">
      ↑
    </span>
  ),
  Download: () => (
    <span data-testid="download-icon" aria-hidden="true">
      ↓
    </span>
  ),
  RotateCcw: () => (
    <span data-testid="rotate-icon" aria-hidden="true">
      ⟲
    </span>
  ),
  Clock: () => (
    <span data-testid="clock-icon" aria-hidden="true">
      🕐
    </span>
  ),
  FileText: () => (
    <span data-testid="file-text-icon" aria-hidden="true">
      📄
    </span>
  ),
  BookOpen: () => (
    <span data-testid="book-open-icon" aria-hidden="true">
      📖
    </span>
  ),
  HelpCircle: () => (
    <span data-testid="help-circle-icon" aria-hidden="true">
      ❓
    </span>
  ),
  CheckCircle: () => (
    <span data-testid="check-circle-icon" aria-hidden="true">
      ✓
    </span>
  ),
  TrendingUp: () => (
    <span data-testid="trending-up-icon" aria-hidden="true">
      📈
    </span>
  ),
  PlayCircle: () => (
    <span data-testid="play-circle-icon" aria-hidden="true">
      ▶
    </span>
  ),
}));

// Mock ChapterCard component
vi.mock('@/components/chapter-card', () => ({
  ChapterCard: ({
    chapter,
    onStartQuiz,
  }: {
    chapter: QuizChapter;
    onStartQuiz: (id: string) => void;
  }) => (
    <div data-testid={`chapter-card-${chapter.id}`}>
      <span data-testid="chapter-name">{chapter.name}</span>
      <span data-testid="chapter-questions">{chapter.totalQuestions} questions</span>
      <button onClick={() => onStartQuiz(chapter.id)} data-testid={`start-quiz-${chapter.id}`}>
        Start Quiz
      </button>
    </div>
  ),
}));

// Mock ProgressBar component
vi.mock('@/components/progress-bar', () => ({
  ProgressBar: ({
    current,
    total,
    label,
    showPercentage,
  }: {
    current: number;
    total: number;
    label?: string;
    showPercentage?: boolean;
  }) => (
    <div data-testid="progress-bar">
      <span data-testid="progress-label">{label}</span>
      <span data-testid="progress-current">{current}</span>
      <span data-testid="progress-total">{total}</span>
      {showPercentage && (
        <span data-testid="progress-percentage">
          {total > 0 ? Math.round((current / total) * 100) : 0}%
        </span>
      )}
    </div>
  ),
}));

// Helper function to create a mock question
const createMockQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  questionId: 'q1',
  questionText: 'What is 2 + 2?',
  options: [
    { optionId: 'opt1', optionText: '3' },
    { optionId: 'opt2', optionText: '4' },
    { optionId: 'opt3', optionText: '5' },
  ],
  correctOptionIds: ['opt2'],
  explanationText: 'The correct answer is 4.',
  status: 'not_attempted',
  timesAnsweredCorrectly: 0,
  timesAnsweredIncorrectly: 0,
  srsLevel: 0,
  nextReviewAt: null,
  ...overrides,
});

// Helper function to create a mock chapter
const createMockChapter = (overrides: Partial<QuizChapter> = {}): QuizChapter => ({
  id: 'ch1',
  name: 'Chapter 1: Introduction',
  description: 'An introductory chapter',
  questions: [createMockQuestion()],
  totalQuestions: 1,
  answeredQuestions: 0,
  correctAnswers: 0,
  isCompleted: false,
  ...overrides,
});

// Helper function to create a mock module
const createMockModule = (overrides: Partial<QuizModule> = {}): QuizModule => ({
  name: 'Test Module',
  description: 'A test module for unit testing',
  chapters: [createMockChapter()],
  ...overrides,
});

// Default props for Dashboard
const createDefaultProps = () => ({
  module: createMockModule(),
  onStartQuiz: vi.fn(),
  onStartReviewSession: vi.fn(),
  onLoadNewModule: vi.fn(),
  onExportState: vi.fn(),
  onImportState: vi.fn(),
  onExportIncorrectAnswers: vi.fn(),
  reviewQueueCount: 0,
});

describe('Dashboard Component', () => {
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
    it('should render the module name as header', () => {
      const props = createDefaultProps();
      props.module = createMockModule({ name: 'Data Structures and Algorithms' });
      render(<Dashboard {...props} />);
      expect(screen.getByText('Data Structures and Algorithms')).toBeInTheDocument();
    });

    it('should render the module description when provided', () => {
      const props = createDefaultProps();
      props.module = createMockModule({ description: 'Learn fundamental DSA concepts' });
      render(<Dashboard {...props} />);
      expect(screen.getByText('Learn fundamental DSA concepts')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const props = createDefaultProps();
      props.module = createMockModule({ description: undefined });
      render(<Dashboard {...props} />);
      expect(screen.queryByText('Learn fundamental DSA concepts')).not.toBeInTheDocument();
    });

    it('should render the Chapters heading', () => {
      render(<Dashboard {...createDefaultProps()} />);
      // Use getByRole to specifically target the h2 heading
      expect(screen.getByRole('heading', { level: 2, name: 'Chapters' })).toBeInTheDocument();
    });

    it('should render Overall Progress card', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByText('Overall Progress')).toBeInTheDocument();
    });
  });

  describe('Chapter List Display', () => {
    it('should render a single chapter', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ id: 'ch1', name: 'Chapter 1: Basics' })],
      });
      render(<Dashboard {...props} />);
      expect(screen.getByTestId('chapter-card-ch1')).toBeInTheDocument();
    });

    it('should render multiple chapters', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({ id: 'ch1', name: 'Chapter 1: Arrays' }),
          createMockChapter({ id: 'ch2', name: 'Chapter 2: Linked Lists' }),
          createMockChapter({ id: 'ch3', name: 'Chapter 3: Trees' }),
        ],
      });
      render(<Dashboard {...props} />);
      expect(screen.getByTestId('chapter-card-ch1')).toBeInTheDocument();
      expect(screen.getByTestId('chapter-card-ch2')).toBeInTheDocument();
      expect(screen.getByTestId('chapter-card-ch3')).toBeInTheDocument();
    });

    it('should pass correct props to ChapterCard', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ id: 'ch1', name: 'Chapter 1: Arrays', totalQuestions: 10 })],
      });
      render(<Dashboard {...props} />);
      expect(screen.getByText('Chapter 1: Arrays')).toBeInTheDocument();
      expect(screen.getByText('10 questions')).toBeInTheDocument();
    });

    it('should call onStartQuiz when chapter start button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ id: 'ch1' })],
      });
      render(<Dashboard {...props} />);
      await user.click(screen.getByTestId('start-quiz-ch1'));
      expect(props.onStartQuiz).toHaveBeenCalledWith('ch1');
    });
  });

  describe('Progress Indicators', () => {
    it('should display correct total questions count', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({ totalQuestions: 10 }),
          createMockChapter({ id: 'ch2', totalQuestions: 15 }),
        ],
      });
      render(<Dashboard {...props} />);
      // Use getAllByText and check at least one exists for the total
      const elements = screen.getAllByText('25');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display correct answered questions count', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({ answeredQuestions: 5 }),
          createMockChapter({ id: 'ch2', answeredQuestions: 8 }),
        ],
      });
      render(<Dashboard {...props} />);
      const elements = screen.getAllByText('13');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display correct chapter count', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({ id: 'ch1' }),
          createMockChapter({ id: 'ch2' }),
          createMockChapter({ id: 'ch3' }),
        ],
      });
      render(<Dashboard {...props} />);
      const elements = screen.getAllByText('3');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display accuracy percentage when questions are answered', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ answeredQuestions: 10, correctAnswers: 7 })],
      });
      render(<Dashboard {...props} />);
      const elements = screen.getAllByText('70%');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display 0% accuracy when no questions answered', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ answeredQuestions: 0, correctAnswers: 0 })],
      });
      render(<Dashboard {...props} />);
      const elements = screen.getAllByText('0%');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display progress bar with correct values', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ totalQuestions: 20, answeredQuestions: 15 })],
      });
      render(<Dashboard {...props} />);
      expect(screen.getByTestId('progress-current')).toHaveTextContent('15');
      expect(screen.getByTestId('progress-total')).toHaveTextContent('20');
    });

    it('should render stat cards with icons', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
      expect(screen.getByTestId('help-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    });

    it('should display Chapters stat label', () => {
      render(<Dashboard {...createDefaultProps()} />);
      // "Chapters" appears both as stat label and h2 heading
      const elements = screen.getAllByText('Chapters');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display Total Questions stat label', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByText('Total Questions')).toBeInTheDocument();
    });

    it('should display Answered stat label', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByText('Answered')).toBeInTheDocument();
    });

    it('should display Accuracy stat label', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });
  });

  describe('Review Session Card', () => {
    it('should not display review session card when reviewQueueCount is 0', () => {
      const props = createDefaultProps();
      props.reviewQueueCount = 0;
      render(<Dashboard {...props} />);
      expect(screen.queryByText('Spaced Repetition Review')).not.toBeInTheDocument();
    });

    it('should display review session card when reviewQueueCount is greater than 0', () => {
      const props = createDefaultProps();
      props.reviewQueueCount = 5;
      render(<Dashboard {...props} />);
      expect(screen.getByText('Spaced Repetition Review')).toBeInTheDocument();
    });

    it('should display correct review queue count', () => {
      const props = createDefaultProps();
      props.reviewQueueCount = 12;
      render(<Dashboard {...props} />);
      const elements = screen.getAllByText('12');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display singular "question" when count is 1', () => {
      const props = createDefaultProps();
      props.reviewQueueCount = 1;
      render(<Dashboard {...props} />);
      expect(screen.getByText(/question ready for review/)).toBeInTheDocument();
    });

    it('should display plural "questions" when count is more than 1', () => {
      const props = createDefaultProps();
      props.reviewQueueCount = 5;
      render(<Dashboard {...props} />);
      expect(screen.getByText(/questions ready for review/)).toBeInTheDocument();
    });

    it('should render Start Review Session button', () => {
      const props = createDefaultProps();
      props.reviewQueueCount = 3;
      render(<Dashboard {...props} />);
      expect(screen.getByRole('button', { name: /start review session/i })).toBeInTheDocument();
    });

    it('should call onStartReviewSession when review button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.reviewQueueCount = 3;
      render(<Dashboard {...props} />);
      await user.click(screen.getByRole('button', { name: /start review session/i }));
      expect(props.onStartReviewSession).toHaveBeenCalled();
    });

    it('should display review help text', () => {
      const props = createDefaultProps();
      props.reviewQueueCount = 5;
      render(<Dashboard {...props} />);
      expect(screen.getByText(/Review questions to strengthen your memory/)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render Import State button', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /import state/i })).toBeInTheDocument();
    });

    it('should render Export State button', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /export state/i })).toBeInTheDocument();
    });

    it('should render Export Mistakes button', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /export mistakes/i })).toBeInTheDocument();
    });

    it('should render Load New Module button', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /load new module/i })).toBeInTheDocument();
    });

    it('should call onExportState when Export State button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<Dashboard {...props} />);
      await user.click(screen.getByRole('button', { name: /export state/i }));
      expect(props.onExportState).toHaveBeenCalled();
    });

    it('should call onLoadNewModule when Load New Module button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<Dashboard {...props} />);
      await user.click(screen.getByRole('button', { name: /load new module/i }));
      expect(props.onLoadNewModule).toHaveBeenCalled();
    });

    it('should render action button icons', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
      expect(screen.getByTestId('rotate-icon')).toBeInTheDocument();
    });
  });

  describe('Export Mistakes Button State', () => {
    it('should disable Export Mistakes button when no incorrect answers exist', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({
            questions: [createMockQuestion({ timesAnsweredIncorrectly: 0 })],
          }),
        ],
      });
      render(<Dashboard {...props} />);
      expect(screen.getByRole('button', { name: /export mistakes/i })).toBeDisabled();
    });

    it('should enable Export Mistakes button when incorrect answers exist', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({
            questions: [createMockQuestion({ timesAnsweredIncorrectly: 3 })],
          }),
        ],
      });
      render(<Dashboard {...props} />);
      expect(screen.getByRole('button', { name: /export mistakes/i })).not.toBeDisabled();
    });

    it('should call onExportIncorrectAnswers when button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({
            questions: [createMockQuestion({ timesAnsweredIncorrectly: 2 })],
          }),
        ],
      });
      render(<Dashboard {...props} />);
      await user.click(screen.getByRole('button', { name: /export mistakes/i }));
      expect(props.onExportIncorrectAnswers).toHaveBeenCalled();
    });

    it('should enable Export Mistakes when any chapter has incorrect answers', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({
            id: 'ch1',
            questions: [createMockQuestion({ timesAnsweredIncorrectly: 0 })],
          }),
          createMockChapter({
            id: 'ch2',
            questions: [createMockQuestion({ questionId: 'q2', timesAnsweredIncorrectly: 1 })],
          }),
        ],
      });
      render(<Dashboard {...props} />);
      expect(screen.getByRole('button', { name: /export mistakes/i })).not.toBeDisabled();
    });
  });

  describe('File Import Functionality', () => {
    it('should render hidden file input for import', () => {
      render(<Dashboard {...createDefaultProps()} />);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });

    it('should accept JSON files', () => {
      render(<Dashboard {...createDefaultProps()} />);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', '.json,application/json');
    });

    it('should trigger file input when Import State button is clicked', async () => {
      const user = userEvent.setup();
      render(<Dashboard {...createDefaultProps()} />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');
      await user.click(screen.getByRole('button', { name: /import state/i }));
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should call onImportState when file is selected', async () => {
      const props = createDefaultProps();
      render(<Dashboard {...props} />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['{}'], 'test.json', { type: 'application/json' });

      Object.defineProperty(fileInput, 'files', {
        value: [testFile],
        writable: false,
      });

      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(props.onImportState).toHaveBeenCalledWith(testFile);
    });

    it('should reset file input value after import', () => {
      const props = createDefaultProps();
      render(<Dashboard {...props} />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['{}'], 'test.json', { type: 'application/json' });

      Object.defineProperty(fileInput, 'files', {
        value: [testFile],
        writable: false,
      });

      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(fileInput.value).toBe('');
    });
  });

  describe('Accuracy Calculation', () => {
    it('should calculate accuracy across multiple chapters', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({ id: 'ch1', answeredQuestions: 10, correctAnswers: 8 }),
          createMockChapter({ id: 'ch2', answeredQuestions: 10, correctAnswers: 6 }),
        ],
      });
      render(<Dashboard {...props} />);
      // (8 + 6) / (10 + 10) = 14/20 = 70%
      const elements = screen.getAllByText('70%');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should round accuracy to nearest integer', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ answeredQuestions: 3, correctAnswers: 2 })],
      });
      render(<Dashboard {...props} />);
      // 2/3 = 66.67% rounds to 67%
      const elements = screen.getAllByText('67%');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should handle 100% accuracy', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ answeredQuestions: 10, correctAnswers: 10 })],
      });
      render(<Dashboard {...props} />);
      const elements = screen.getAllByText('100%');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty chapters array', () => {
      const props = createDefaultProps();
      props.module = createMockModule({ chapters: [] });
      expect(() => render(<Dashboard {...props} />)).not.toThrow();
    });

    it('should handle module with very long name', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        name: 'This is a very long module name that might cause layout issues in the dashboard header',
      });
      render(<Dashboard {...props} />);
      expect(screen.getByText(/This is a very long module name/)).toBeInTheDocument();
    });

    it('should handle module with very long description', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        description:
          'This is a very long description that explains the module content in great detail and might wrap to multiple lines in the UI.',
      });
      render(<Dashboard {...props} />);
      expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
    });

    it('should handle chapter with empty questions array', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ questions: [], totalQuestions: 0 })],
      });
      expect(() => render(<Dashboard {...props} />)).not.toThrow();
    });

    it('should handle large review queue count', () => {
      const props = createDefaultProps();
      props.reviewQueueCount = 9999;
      render(<Dashboard {...props} />);
      const elements = screen.getAllByText('9999');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should handle special characters in module name', () => {
      const props = createDefaultProps();
      props.module = createMockModule({ name: 'Module: "Arrays & Strings" <Test>' });
      render(<Dashboard {...props} />);
      expect(screen.getByText('Module: "Arrays & Strings" <Test>')).toBeInTheDocument();
    });

    it('should handle chapters with all completed status', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({
            id: 'ch1',
            isCompleted: true,
            totalQuestions: 10,
            answeredQuestions: 10,
            correctAnswers: 10,
          }),
          createMockChapter({
            id: 'ch2',
            isCompleted: true,
            totalQuestions: 5,
            answeredQuestions: 5,
            correctAnswers: 5,
          }),
        ],
      });
      render(<Dashboard {...props} />);
      const elements = screen.getAllByText('15'); // total answered
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should handle zero total questions', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ totalQuestions: 0, answeredQuestions: 0 })],
      });
      render(<Dashboard {...props} />);
      const elements = screen.getAllByText('0%');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple Chapters with Various States', () => {
    it('should aggregate stats correctly across mixed chapter states', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({
            id: 'ch1',
            totalQuestions: 10,
            answeredQuestions: 10,
            correctAnswers: 8,
            isCompleted: true,
          }),
          createMockChapter({
            id: 'ch2',
            totalQuestions: 15,
            answeredQuestions: 5,
            correctAnswers: 4,
            isCompleted: false,
          }),
          createMockChapter({
            id: 'ch3',
            totalQuestions: 20,
            answeredQuestions: 0,
            correctAnswers: 0,
            isCompleted: false,
          }),
        ],
      });
      render(<Dashboard {...props} />);

      // Total questions: 10 + 15 + 20 = 45
      const totalQuestionsElements = screen.getAllByText('45');
      expect(totalQuestionsElements.length).toBeGreaterThan(0);
      // Total answered: 10 + 5 + 0 = 15
      const answeredElements = screen.getAllByText('15');
      expect(answeredElements.length).toBeGreaterThan(0);
      // Chapters: 3
      const chaptersElements = screen.getAllByText('3');
      expect(chaptersElements.length).toBeGreaterThan(0);
      // Accuracy: (8 + 4) / 15 = 80%
      const accuracyElements = screen.getAllByText('80%');
      expect(accuracyElements.length).toBeGreaterThan(0);
    });

    it('should render all chapter cards', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({ id: 'ch1', name: 'Chapter 1' }),
          createMockChapter({ id: 'ch2', name: 'Chapter 2' }),
          createMockChapter({ id: 'ch3', name: 'Chapter 3' }),
          createMockChapter({ id: 'ch4', name: 'Chapter 4' }),
        ],
      });
      render(<Dashboard {...props} />);

      expect(screen.getByTestId('chapter-card-ch1')).toBeInTheDocument();
      expect(screen.getByTestId('chapter-card-ch2')).toBeInTheDocument();
      expect(screen.getByTestId('chapter-card-ch3')).toBeInTheDocument();
      expect(screen.getByTestId('chapter-card-ch4')).toBeInTheDocument();
    });
  });

  describe('UI Layout', () => {
    it('should render header section with module info', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        name: 'Test Module',
        description: 'Test Description',
      });
      render(<Dashboard {...props} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Module');
    });

    it('should render all four stat cards', () => {
      render(<Dashboard {...createDefaultProps()} />);
      // "Chapters" appears as both stat label and h2 heading
      const chaptersElements = screen.getAllByText('Chapters');
      expect(chaptersElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Total Questions')).toBeInTheDocument();
      expect(screen.getByText('Answered')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });

    it('should render action buttons in header area', () => {
      render(<Dashboard {...createDefaultProps()} />);
      const importButton = screen.getByRole('button', { name: /import state/i });
      const exportButton = screen.getByRole('button', { name: /export state/i });
      const loadButton = screen.getByRole('button', { name: /load new module/i });

      expect(importButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();
      expect(loadButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Dashboard {...createDefaultProps()} />);
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons with text', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /import state/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export state/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export mistakes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /load new module/i })).toBeInTheDocument();
    });

    it('should have disabled button indication', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({
            questions: [createMockQuestion({ timesAnsweredIncorrectly: 0 })],
          }),
        ],
      });
      render(<Dashboard {...props} />);
      const exportMistakesButton = screen.getByRole('button', { name: /export mistakes/i });
      expect(exportMistakesButton).toBeDisabled();
    });

    it('should have title attribute on Export Mistakes button when enabled', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({
            questions: [createMockQuestion({ timesAnsweredIncorrectly: 1 })],
          }),
        ],
      });
      render(<Dashboard {...props} />);
      const exportMistakesButton = screen.getByRole('button', { name: /export mistakes/i });
      expect(exportMistakesButton).toHaveAttribute(
        'title',
        'Export detailed log of incorrect answers',
      );
    });

    it('should have title attribute on Export Mistakes button when disabled', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({
            questions: [createMockQuestion({ timesAnsweredIncorrectly: 0 })],
          }),
        ],
      });
      render(<Dashboard {...props} />);
      const exportMistakesButton = screen.getByRole('button', { name: /export mistakes/i });
      expect(exportMistakesButton).toHaveAttribute('title', 'No incorrect answers to export');
    });
  });

  describe('Console Logging', () => {
    it('should log file selection details when importing', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const props = createDefaultProps();
      render(<Dashboard {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['{}'], 'test-state.json', { type: 'application/json' });

      Object.defineProperty(fileInput, 'files', {
        value: [testFile],
        writable: false,
      });

      fileInput.dispatchEvent(new Event('change', { bubbles: true }));

      expect(consoleSpy).toHaveBeenCalledWith(
        'Import file selected:',
        'test-state.json',
        'Type:',
        'application/json',
        'Size:',
        2,
      );
    });
  });

  describe('Progress Bar Integration', () => {
    it('should pass correct label to progress bar', () => {
      render(<Dashboard {...createDefaultProps()} />);
      expect(screen.getByTestId('progress-label')).toHaveTextContent('Questions Completed');
    });

    it('should show progress percentage', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ totalQuestions: 10, answeredQuestions: 5 })],
      });
      render(<Dashboard {...props} />);
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('50%');
    });

    it('should update progress when all questions completed', () => {
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ totalQuestions: 10, answeredQuestions: 10 })],
      });
      render(<Dashboard {...props} />);
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('100%');
    });
  });

  describe('Interactive Behavior', () => {
    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<Dashboard {...props} />);

      const exportButton = screen.getByRole('button', { name: /export state/i });
      await user.click(exportButton);
      await user.click(exportButton);
      await user.click(exportButton);

      expect(props.onExportState).toHaveBeenCalledTimes(3);
    });

    it('should handle clicking different chapter start buttons', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [createMockChapter({ id: 'ch1' }), createMockChapter({ id: 'ch2' })],
      });
      render(<Dashboard {...props} />);

      await user.click(screen.getByTestId('start-quiz-ch1'));
      expect(props.onStartQuiz).toHaveBeenCalledWith('ch1');

      await user.click(screen.getByTestId('start-quiz-ch2'));
      expect(props.onStartQuiz).toHaveBeenCalledWith('ch2');
    });

    it('should maintain button state after interactions', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.module = createMockModule({
        chapters: [
          createMockChapter({
            questions: [createMockQuestion({ timesAnsweredIncorrectly: 0 })],
          }),
        ],
      });
      render(<Dashboard {...props} />);

      const exportMistakesButton = screen.getByRole('button', { name: /export mistakes/i });
      expect(exportMistakesButton).toBeDisabled();

      // Try clicking other buttons
      await user.click(screen.getByRole('button', { name: /export state/i }));

      // Export Mistakes should still be disabled
      expect(exportMistakesButton).toBeDisabled();
    });
  });
});
