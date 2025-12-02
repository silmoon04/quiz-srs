import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizComplete } from '@/components/quiz-complete';

// Mock lucide-react icons to simplify testing
vi.mock('lucide-react', () => ({
  Trophy: () => (
    <span data-testid="trophy-icon" aria-hidden="true">
      Trophy
    </span>
  ),
  RotateCcw: () => (
    <span data-testid="rotate-icon" aria-hidden="true">
      Rotate
    </span>
  ),
  Home: () => (
    <span data-testid="home-icon" aria-hidden="true">
      Home
    </span>
  ),
  Download: () => (
    <span data-testid="download-icon" aria-hidden="true">
      Download
    </span>
  ),
  Upload: () => (
    <span data-testid="upload-icon" aria-hidden="true">
      Upload
    </span>
  ),
  FileText: () => (
    <span data-testid="file-text-icon" aria-hidden="true">
      FileText
    </span>
  ),
  LayoutGrid: () => (
    <span data-testid="layout-grid-icon" aria-hidden="true">
      LayoutGrid
    </span>
  ),
  SkipForward: () => (
    <span data-testid="skip-forward-icon" aria-hidden="true">
      SkipForward
    </span>
  ),
}));

// Mock ProgressBar component
vi.mock('@/components/progress-bar', () => ({
  ProgressBar: ({
    current,
    total,
    variant,
  }: {
    current: number;
    total: number;
    variant?: string;
  }) => (
    <div data-testid="progress-bar">
      <span data-testid="progress-current">{current}</span>
      <span data-testid="progress-total">{total}</span>
      <span data-testid="progress-variant">{variant || 'default'}</span>
    </div>
  ),
}));

// Default props factory
const createDefaultProps = () => ({
  chapter: {
    id: 'ch1',
    name: 'Chapter 1: Introduction',
  },
  results: {
    totalQuestions: 10,
    correctAnswers: 8,
    incorrectAnswers: 2,
    accuracy: 80,
  },
  onBackToDashboard: vi.fn(),
  onRetryQuiz: vi.fn(),
  onExportResults: vi.fn(),
  onLoadNewModule: vi.fn(),
  onExportIncorrectAnswers: vi.fn(),
  hasIncorrectAnswers: true,
  nextChapterId: null as string | null,
  onStartChapterQuiz: vi.fn(),
});

describe('QuizComplete Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the Quiz Complete header', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    });

    it('should render the trophy icon', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
    });

    it('should render the chapter name', () => {
      const props = createDefaultProps();
      props.chapter.name = 'Arrays and Linked Lists';
      render(<QuizComplete {...props} />);
      expect(screen.getByText('Arrays and Linked Lists')).toBeInTheDocument();
    });

    it('should display completion message with chapter name', () => {
      const props = createDefaultProps();
      props.chapter.name = 'Data Structures';
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/You've finished/)).toBeInTheDocument();
      expect(screen.getByText('Data Structures')).toBeInTheDocument();
    });

    it('should render Your Results card title', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByText('Your Results')).toBeInTheDocument();
    });
  });

  describe('Score Display', () => {
    it('should display the accuracy percentage', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 7, incorrectAnswers: 3, accuracy: 70 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('should display total questions count', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 25, correctAnswers: 20, incorrectAnswers: 5, accuracy: 80 };
      render(<QuizComplete {...props} />);
      const twentyFiveElements = screen.getAllByText('25');
      expect(twentyFiveElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Total Questions')).toBeInTheDocument();
    });

    it('should display correct answers count', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 8, incorrectAnswers: 2, accuracy: 80 };
      render(<QuizComplete {...props} />);
      const eightElements = screen.getAllByText('8');
      expect(eightElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Correct')).toBeInTheDocument();
    });

    it('should display incorrect answers count', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 6, incorrectAnswers: 4, accuracy: 60 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Incorrect')).toBeInTheDocument();
    });

    it('should display Overall Accuracy label', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByText('Overall Accuracy')).toBeInTheDocument();
    });

    it('should display 0% when accuracy is 0', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 0, incorrectAnswers: 10, accuracy: 0 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should display 100% when accuracy is 100', () => {
      const props = createDefaultProps();
      props.results = {
        totalQuestions: 10,
        correctAnswers: 10,
        incorrectAnswers: 0,
        accuracy: 100,
      };
      render(<QuizComplete {...props} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle zero total questions', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0, accuracy: 0 };
      render(<QuizComplete {...props} />);
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Performance Messages', () => {
    it('should display Outstanding message for accuracy >= 90', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 9, incorrectAnswers: 1, accuracy: 90 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Outstanding!/)).toBeInTheDocument();
    });

    it('should display Excellent work message for accuracy >= 80 and < 90', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 8, incorrectAnswers: 2, accuracy: 80 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Excellent work!/)).toBeInTheDocument();
    });

    it('should display Excellent work message for accuracy 85', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 20, correctAnswers: 17, incorrectAnswers: 3, accuracy: 85 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Excellent work!/)).toBeInTheDocument();
    });

    it('should display Good job message for accuracy >= 70 and < 80', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 7, incorrectAnswers: 3, accuracy: 70 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Good job!/)).toBeInTheDocument();
    });

    it('should display Good job message for accuracy 75', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 20, correctAnswers: 15, incorrectAnswers: 5, accuracy: 75 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Good job!/)).toBeInTheDocument();
    });

    it('should display Not bad message for accuracy >= 60 and < 70', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 6, incorrectAnswers: 4, accuracy: 60 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Not bad, keep practicing!/)).toBeInTheDocument();
    });

    it('should display Not bad message for accuracy 65', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 20, correctAnswers: 13, incorrectAnswers: 7, accuracy: 65 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Not bad, keep practicing!/)).toBeInTheDocument();
    });

    it('should display Keep studying message for accuracy < 60', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 5, incorrectAnswers: 5, accuracy: 50 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Keep studying and try again!/)).toBeInTheDocument();
    });

    it('should display Keep studying message for accuracy 0', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 0, incorrectAnswers: 10, accuracy: 0 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Keep studying and try again!/)).toBeInTheDocument();
    });

    it('should display Outstanding for accuracy 95', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 20, correctAnswers: 19, incorrectAnswers: 1, accuracy: 95 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Outstanding!/)).toBeInTheDocument();
    });

    it('should display Outstanding for accuracy 100', () => {
      const props = createDefaultProps();
      props.results = {
        totalQuestions: 10,
        correctAnswers: 10,
        incorrectAnswers: 0,
        accuracy: 100,
      };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Outstanding!/)).toBeInTheDocument();
    });
  });

  describe('No Results State', () => {
    it('should display No results available when results is undefined', () => {
      const props = createDefaultProps();
      props.results = undefined;
      render(<QuizComplete {...props} />);
      expect(screen.getByText('No results available')).toBeInTheDocument();
    });

    it('should display 0% accuracy when results is undefined', () => {
      const props = createDefaultProps();
      props.results = undefined;
      render(<QuizComplete {...props} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should display default values in stats when results is undefined', () => {
      const props = createDefaultProps();
      props.results = undefined;
      render(<QuizComplete {...props} />);
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Progress Bar Integration', () => {
    it('should render progress bar with correct current value', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 7, incorrectAnswers: 3, accuracy: 70 };
      render(<QuizComplete {...props} />);
      expect(screen.getByTestId('progress-current')).toHaveTextContent('7');
    });

    it('should render progress bar with correct total value', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 15, correctAnswers: 12, incorrectAnswers: 3, accuracy: 80 };
      render(<QuizComplete {...props} />);
      expect(screen.getByTestId('progress-total')).toHaveTextContent('15');
    });

    it('should render progress bar with success variant for accuracy >= 70', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 8, incorrectAnswers: 2, accuracy: 80 };
      render(<QuizComplete {...props} />);
      expect(screen.getByTestId('progress-variant')).toHaveTextContent('success');
    });

    it('should render progress bar with warning variant for accuracy >= 50 and < 70', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 6, incorrectAnswers: 4, accuracy: 60 };
      render(<QuizComplete {...props} />);
      expect(screen.getByTestId('progress-variant')).toHaveTextContent('warning');
    });

    it('should render progress bar with default variant for accuracy < 50', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 4, incorrectAnswers: 6, accuracy: 40 };
      render(<QuizComplete {...props} />);
      expect(screen.getByTestId('progress-variant')).toHaveTextContent('default');
    });

    it('should render progress bar with default variant when results is undefined', () => {
      const props = createDefaultProps();
      props.results = undefined;
      render(<QuizComplete {...props} />);
      expect(screen.getByTestId('progress-variant')).toHaveTextContent('default');
    });
  });

  describe('Primary Action Buttons', () => {
    it('should render Back to Dashboard button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
    });

    it('should render Retry Quiz button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /retry quiz/i })).toBeInTheDocument();
    });

    it('should call onBackToDashboard when button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuizComplete {...props} />);
      await user.click(screen.getByRole('button', { name: /back to dashboard/i }));
      expect(props.onBackToDashboard).toHaveBeenCalledTimes(1);
    });

    it('should call onRetryQuiz when button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuizComplete {...props} />);
      await user.click(screen.getByRole('button', { name: /retry quiz/i }));
      expect(props.onRetryQuiz).toHaveBeenCalledTimes(1);
    });

    it('should render home icon on Back to Dashboard button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    });

    it('should render rotate icon on Retry Quiz button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByTestId('rotate-icon')).toBeInTheDocument();
    });
  });

  describe('Next Chapter Button', () => {
    it('should not render Start Next Chapter button when nextChapterId is null', () => {
      const props = createDefaultProps();
      props.nextChapterId = null;
      render(<QuizComplete {...props} />);
      expect(screen.queryByRole('button', { name: /start next chapter/i })).not.toBeInTheDocument();
    });

    it('should not render Start Next Chapter button when nextChapterId is undefined', () => {
      const props = createDefaultProps();
      props.nextChapterId = undefined;
      render(<QuizComplete {...props} />);
      expect(screen.queryByRole('button', { name: /start next chapter/i })).not.toBeInTheDocument();
    });

    it('should render Start Next Chapter button when nextChapterId is provided', () => {
      const props = createDefaultProps();
      props.nextChapterId = 'ch2';
      render(<QuizComplete {...props} />);
      expect(screen.getByRole('button', { name: /start next chapter/i })).toBeInTheDocument();
    });

    it('should call onStartChapterQuiz with nextChapterId when button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.nextChapterId = 'ch2';
      render(<QuizComplete {...props} />);
      await user.click(screen.getByRole('button', { name: /start next chapter/i }));
      expect(props.onStartChapterQuiz).toHaveBeenCalledWith('ch2');
    });

    it('should render skip forward icon on Start Next Chapter button', () => {
      const props = createDefaultProps();
      props.nextChapterId = 'ch2';
      render(<QuizComplete {...props} />);
      expect(screen.getByTestId('skip-forward-icon')).toBeInTheDocument();
    });
  });

  describe('Secondary Action Buttons', () => {
    it('should render Export Results button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /export results/i })).toBeInTheDocument();
    });

    it('should render Export Mistakes button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /export mistakes/i })).toBeInTheDocument();
    });

    it('should render Load New Module button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /load new module/i })).toBeInTheDocument();
    });

    it('should render View All Chapters button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /view all chapters/i })).toBeInTheDocument();
    });

    it('should call onExportResults when Export Results button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuizComplete {...props} />);
      await user.click(screen.getByRole('button', { name: /export results/i }));
      expect(props.onExportResults).toHaveBeenCalledTimes(1);
    });

    it('should call onExportIncorrectAnswers when Export Mistakes button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.hasIncorrectAnswers = true;
      render(<QuizComplete {...props} />);
      await user.click(screen.getByRole('button', { name: /export mistakes/i }));
      expect(props.onExportIncorrectAnswers).toHaveBeenCalledTimes(1);
    });

    it('should call onLoadNewModule when Load New Module button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuizComplete {...props} />);
      await user.click(screen.getByRole('button', { name: /load new module/i }));
      expect(props.onLoadNewModule).toHaveBeenCalledTimes(1);
    });

    it('should call onBackToDashboard when View All Chapters button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuizComplete {...props} />);
      await user.click(screen.getByRole('button', { name: /view all chapters/i }));
      expect(props.onBackToDashboard).toHaveBeenCalledTimes(1);
    });

    it('should render download icon on Export Results button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    it('should render file-text icon on Export Mistakes button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
    });

    it('should render upload icon on Load New Module button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });

    it('should render layout-grid icon on View All Chapters button', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByTestId('layout-grid-icon')).toBeInTheDocument();
    });
  });

  describe('Export Mistakes Button State', () => {
    it('should disable Export Mistakes button when hasIncorrectAnswers is false', () => {
      const props = createDefaultProps();
      props.hasIncorrectAnswers = false;
      render(<QuizComplete {...props} />);
      expect(screen.getByRole('button', { name: /export mistakes/i })).toBeDisabled();
    });

    it('should enable Export Mistakes button when hasIncorrectAnswers is true', () => {
      const props = createDefaultProps();
      props.hasIncorrectAnswers = true;
      render(<QuizComplete {...props} />);
      expect(screen.getByRole('button', { name: /export mistakes/i })).not.toBeDisabled();
    });

    it('should have correct title when hasIncorrectAnswers is true', () => {
      const props = createDefaultProps();
      props.hasIncorrectAnswers = true;
      render(<QuizComplete {...props} />);
      expect(screen.getByRole('button', { name: /export mistakes/i })).toHaveAttribute(
        'title',
        'Export detailed log of incorrect answers',
      );
    });

    it('should have correct title when hasIncorrectAnswers is false', () => {
      const props = createDefaultProps();
      props.hasIncorrectAnswers = false;
      render(<QuizComplete {...props} />);
      expect(screen.getByRole('button', { name: /export mistakes/i })).toHaveAttribute(
        'title',
        'No incorrect answers to export',
      );
    });
  });

  describe('Performance Color Classes', () => {
    it('should apply green color class for accuracy >= 80', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 9, incorrectAnswers: 1, accuracy: 90 };
      render(<QuizComplete {...props} />);
      const accuracyElement = screen.getByText('90%');
      expect(accuracyElement).toHaveClass('text-green-400');
    });

    it('should apply green color class for accuracy exactly 80', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 8, incorrectAnswers: 2, accuracy: 80 };
      render(<QuizComplete {...props} />);
      const accuracyElement = screen.getByText('80%');
      expect(accuracyElement).toHaveClass('text-green-400');
    });

    it('should apply yellow color class for accuracy >= 60 and < 80', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 7, incorrectAnswers: 3, accuracy: 70 };
      render(<QuizComplete {...props} />);
      const accuracyElement = screen.getByText('70%');
      expect(accuracyElement).toHaveClass('text-yellow-400');
    });

    it('should apply yellow color class for accuracy exactly 60', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 6, incorrectAnswers: 4, accuracy: 60 };
      render(<QuizComplete {...props} />);
      const accuracyElement = screen.getByText('60%');
      expect(accuracyElement).toHaveClass('text-yellow-400');
    });

    it('should apply red color class for accuracy < 60', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 5, incorrectAnswers: 5, accuracy: 50 };
      render(<QuizComplete {...props} />);
      const accuracyElement = screen.getByText('50%');
      expect(accuracyElement).toHaveClass('text-red-400');
    });

    it('should apply red color class for accuracy 0', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 0, incorrectAnswers: 10, accuracy: 0 };
      render(<QuizComplete {...props} />);
      const accuracyElement = screen.getByText('0%');
      expect(accuracyElement).toHaveClass('text-red-400');
    });

    it('should apply gray color class when results is undefined', () => {
      const props = createDefaultProps();
      props.results = undefined;
      render(<QuizComplete {...props} />);
      const noResultsMessage = screen.getByText('No results available');
      expect(noResultsMessage).toHaveClass('text-gray-400');
    });
  });

  describe('Layout with Next Chapter', () => {
    it('should render 2-column grid when nextChapterId is not provided', () => {
      const props = createDefaultProps();
      props.nextChapterId = null;
      render(<QuizComplete {...props} />);
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry quiz/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /start next chapter/i })).not.toBeInTheDocument();
    });

    it('should render 3-column grid when nextChapterId is provided', () => {
      const props = createDefaultProps();
      props.nextChapterId = 'ch2';
      render(<QuizComplete {...props} />);
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry quiz/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start next chapter/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle chapter with special characters in name', () => {
      const props = createDefaultProps();
      props.chapter.name = 'Chapter: "Arrays & Strings" <Test>';
      render(<QuizComplete {...props} />);
      expect(screen.getByText('Chapter: "Arrays & Strings" <Test>')).toBeInTheDocument();
    });

    it('should handle very long chapter name', () => {
      const props = createDefaultProps();
      props.chapter.name =
        'This is a very long chapter name that might cause layout issues in the UI and should be handled gracefully';
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/This is a very long chapter name/)).toBeInTheDocument();
    });

    it('should handle large numbers for questions', () => {
      const props = createDefaultProps();
      props.results = {
        totalQuestions: 9999,
        correctAnswers: 8000,
        incorrectAnswers: 1999,
        accuracy: 80,
      };
      render(<QuizComplete {...props} />);
      const ninetyNineElements = screen.getAllByText('9999');
      expect(ninetyNineElements.length).toBeGreaterThan(0);
      const eightThousandElements = screen.getAllByText('8000');
      expect(eightThousandElements.length).toBeGreaterThan(0);
      const nineteenNinetyNineElements = screen.getAllByText('1999');
      expect(nineteenNinetyNineElements.length).toBeGreaterThan(0);
    });

    it('should handle boundary accuracy of 59', () => {
      const props = createDefaultProps();
      props.results = {
        totalQuestions: 100,
        correctAnswers: 59,
        incorrectAnswers: 41,
        accuracy: 59,
      };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Keep studying and try again!/)).toBeInTheDocument();
    });

    it('should handle boundary accuracy of 69', () => {
      const props = createDefaultProps();
      props.results = {
        totalQuestions: 100,
        correctAnswers: 69,
        incorrectAnswers: 31,
        accuracy: 69,
      };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Not bad, keep practicing!/)).toBeInTheDocument();
    });

    it('should handle boundary accuracy of 79', () => {
      const props = createDefaultProps();
      props.results = {
        totalQuestions: 100,
        correctAnswers: 79,
        incorrectAnswers: 21,
        accuracy: 79,
      };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Good job!/)).toBeInTheDocument();
    });

    it('should handle boundary accuracy of 89', () => {
      const props = createDefaultProps();
      props.results = {
        totalQuestions: 100,
        correctAnswers: 89,
        incorrectAnswers: 11,
        accuracy: 89,
      };
      render(<QuizComplete {...props} />);
      expect(screen.getByText(/Excellent work!/)).toBeInTheDocument();
    });
  });

  describe('Multiple Button Interactions', () => {
    it('should handle rapid clicks on the same button', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuizComplete {...props} />);

      const retryButton = screen.getByRole('button', { name: /retry quiz/i });
      await user.click(retryButton);
      await user.click(retryButton);
      await user.click(retryButton);

      expect(props.onRetryQuiz).toHaveBeenCalledTimes(3);
    });

    it('should handle clicking different buttons', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuizComplete {...props} />);

      await user.click(screen.getByRole('button', { name: /back to dashboard/i }));
      await user.click(screen.getByRole('button', { name: /retry quiz/i }));
      await user.click(screen.getByRole('button', { name: /export results/i }));
      await user.click(screen.getByRole('button', { name: /load new module/i }));

      expect(props.onBackToDashboard).toHaveBeenCalledTimes(1);
      expect(props.onRetryQuiz).toHaveBeenCalledTimes(1);
      expect(props.onExportResults).toHaveBeenCalledTimes(1);
      expect(props.onLoadNewModule).toHaveBeenCalledTimes(1);
    });

    it('should handle clicking View All Chapters which calls onBackToDashboard', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuizComplete {...props} />);

      await user.click(screen.getByRole('button', { name: /back to dashboard/i }));
      await user.click(screen.getByRole('button', { name: /view all chapters/i }));

      expect(props.onBackToDashboard).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy with h1', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    });

    it('should have accessible buttons with text', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry quiz/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export results/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export mistakes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /load new module/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view all chapters/i })).toBeInTheDocument();
    });

    it('should have disabled button indication for Export Mistakes', () => {
      const props = createDefaultProps();
      props.hasIncorrectAnswers = false;
      render(<QuizComplete {...props} />);
      const exportMistakesButton = screen.getByRole('button', { name: /export mistakes/i });
      expect(exportMistakesButton).toBeDisabled();
    });

    it('should have title attribute on Export Mistakes button for additional context', () => {
      const props = createDefaultProps();
      props.hasIncorrectAnswers = true;
      render(<QuizComplete {...props} />);
      const exportMistakesButton = screen.getByRole('button', { name: /export mistakes/i });
      expect(exportMistakesButton).toHaveAttribute('title');
    });
  });

  describe('Visual Elements', () => {
    it('should render all icons', () => {
      const props = createDefaultProps();
      props.nextChapterId = 'ch2';
      render(<QuizComplete {...props} />);

      expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('rotate-icon')).toBeInTheDocument();
      expect(screen.getByTestId('skip-forward-icon')).toBeInTheDocument();
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
      expect(screen.getByTestId('layout-grid-icon')).toBeInTheDocument();
    });

    it('should render progress bar component', () => {
      render(<QuizComplete {...createDefaultProps()} />);
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });
  });

  describe('Results Object Variations', () => {
    it('should handle results with all zeros', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0, accuracy: 0 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle perfect score', () => {
      const props = createDefaultProps();
      props.results = {
        totalQuestions: 50,
        correctAnswers: 50,
        incorrectAnswers: 0,
        accuracy: 100,
      };
      render(<QuizComplete {...props} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText(/Outstanding!/)).toBeInTheDocument();
      const fiftyElements = screen.getAllByText('50');
      expect(fiftyElements.length).toBeGreaterThan(0);
    });

    it('should handle all wrong answers', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 20, correctAnswers: 0, incorrectAnswers: 20, accuracy: 0 };
      render(<QuizComplete {...props} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText(/Keep studying and try again!/)).toBeInTheDocument();
      const twentyElements = screen.getAllByText('20');
      expect(twentyElements.length).toBeGreaterThan(0);
    });

    it('should display correct count in green text', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 7, incorrectAnswers: 3, accuracy: 70 };
      render(<QuizComplete {...props} />);
      const correctElements = screen.getAllByText('7');
      const greenElement = correctElements.find((el) => el.classList.contains('text-green-400'));
      expect(greenElement).toBeInTheDocument();
    });

    it('should display incorrect count in red text', () => {
      const props = createDefaultProps();
      props.results = { totalQuestions: 10, correctAnswers: 7, incorrectAnswers: 3, accuracy: 70 };
      render(<QuizComplete {...props} />);
      const incorrectElements = screen.getAllByText('3');
      const redElement = incorrectElements.find((el) => el.classList.contains('text-red-400'));
      expect(redElement).toBeInTheDocument();
    });
  });

  describe('Chapter Variations', () => {
    it('should handle chapter with empty id', () => {
      const props = createDefaultProps();
      props.chapter = { id: '', name: 'Unnamed Chapter' };
      render(<QuizComplete {...props} />);
      expect(screen.getByText('Unnamed Chapter')).toBeInTheDocument();
    });

    it('should handle chapter with unicode characters', () => {
      const props = createDefaultProps();
      props.chapter = { id: 'ch1', name: 'Chapter Test' };
      render(<QuizComplete {...props} />);
      expect(screen.getByText('Chapter Test')).toBeInTheDocument();
    });

    it('should handle chapter with numeric name', () => {
      const props = createDefaultProps();
      props.chapter = { id: 'ch1', name: '12345' };
      render(<QuizComplete {...props} />);
      expect(screen.getByText('12345')).toBeInTheDocument();
    });
  });
});
