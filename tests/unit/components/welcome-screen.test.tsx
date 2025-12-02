import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WelcomeScreen } from '@/components/welcome-screen';

// Mock lucide-react icons to simplify testing
vi.mock('lucide-react', () => ({
  Upload: () => <span data-testid="upload-icon">Upload</span>,
  BookOpen: () => <span data-testid="book-open-icon">BookOpen</span>,
  Brain: () => <span data-testid="brain-icon">Brain</span>,
  Check: () => <span data-testid="check-icon">Check</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  FileText: () => <span data-testid="file-text-icon">FileText</span>,
  Sparkles: () => <span data-testid="sparkles-icon">Sparkles</span>,
}));

// Default props factory
const createDefaultProps = () => ({
  onLoadQuiz: vi.fn(),
  onLoadDefaultQuiz: vi.fn(),
  isLoading: false,
  error: undefined as string | undefined,
});

describe('WelcomeScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the main title MCQ Master', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('MCQ Master')).toBeInTheDocument();
    });

    it('should render the tagline description', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(
        screen.getByText(/Transform your learning with interactive multiple-choice quizzes/i),
      ).toBeInTheDocument();
    });

    it('should render the Brain icon in header', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      const brainIcons = screen.getAllByTestId('brain-icon');
      expect(brainIcons.length).toBeGreaterThan(0);
    });

    it('should render the Get Started card title', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should render the BookOpen icon next to Get Started', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      const bookOpenIcons = screen.getAllByTestId('book-open-icon');
      expect(bookOpenIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('should render helper text about beginning experience', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(
        screen.getByText(/Choose how you'd like to begin your learning experience/i),
      ).toBeInTheDocument();
    });
  });

  describe('Primary Action Button - Try Algorithm Quiz', () => {
    it('should render Try Algorithm Quiz button', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /try algorithm quiz/i })).toBeInTheDocument();
    });

    it('should render Sparkles icon on primary button', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
    });

    it('should call onLoadDefaultQuiz when Try Algorithm Quiz is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      await user.click(screen.getByRole('button', { name: /try algorithm quiz/i }));

      expect(props.onLoadDefaultQuiz).toHaveBeenCalledTimes(1);
    });

    it('should disable primary button when isLoading is true', () => {
      const props = createDefaultProps();
      props.isLoading = true;
      render(<WelcomeScreen {...props} />);

      const loadingButtons = screen.getAllByRole('button', { name: /loading/i });
      expect(loadingButtons[0]).toBeDisabled();
    });

    it('should show Loading text when isLoading is true', () => {
      const props = createDefaultProps();
      props.isLoading = true;
      render(<WelcomeScreen {...props} />);

      const loadingButtons = screen.getAllByText('Loading...');
      expect(loadingButtons.length).toBeGreaterThan(0);
    });

    it('should not call onLoadDefaultQuiz when disabled', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.isLoading = true;
      render(<WelcomeScreen {...props} />);

      const loadingButtons = screen.getAllByRole('button', { name: /loading/i });
      await user.click(loadingButtons[0]);

      expect(props.onLoadDefaultQuiz).not.toHaveBeenCalled();
    });
  });

  describe('Secondary Action Button - Load Quiz', () => {
    it('should render Load Quiz button', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /load quiz/i })).toBeInTheDocument();
    });

    it('should render Upload icon on Load Quiz button', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });

    it('should render or separator text', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('or')).toBeInTheDocument();
    });

    it('should disable Load Quiz button when isLoading is true', () => {
      const props = createDefaultProps();
      props.isLoading = true;
      render(<WelcomeScreen {...props} />);

      const loadQuizButtons = screen.getAllByRole('button', { name: /loading/i });
      expect(loadQuizButtons.length).toBe(2);
    });
  });

  describe('File Input Functionality', () => {
    it('should have a hidden file input element', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });

    it('should accept JSON and Markdown files', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput.accept).toBe('.json,.md,.markdown,application/json,text/markdown');
    });

    it('should trigger file input click when Load Quiz button is clicked', async () => {
      const user = userEvent.setup();
      render(<WelcomeScreen {...createDefaultProps()} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      await user.click(screen.getByRole('button', { name: /load quiz/i }));

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should call onLoadQuiz when a file is selected', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['{"name": "Test Quiz"}'], 'test.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(props.onLoadQuiz).toHaveBeenCalledTimes(1);
      expect(props.onLoadQuiz).toHaveBeenCalledWith(testFile);
    });

    it('should call onLoadQuiz with Markdown file', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['# Quiz Title'], 'test.md', { type: 'text/markdown' });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(props.onLoadQuiz).toHaveBeenCalledWith(testFile);
    });

    it('should not call onLoadQuiz when no file is selected', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [] } });

      expect(props.onLoadQuiz).not.toHaveBeenCalled();
    });

    it('should reset file input value after file selection', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['{"name": "Test Quiz"}'], 'test.json', {
        type: 'application/json',
      });

      Object.defineProperty(fileInput, 'files', {
        value: [testFile],
        writable: true,
      });
      fireEvent.change(fileInput);

      expect(fileInput.value).toBe('');
    });

    it('should disable file input when isLoading is true', () => {
      const props = createDefaultProps();
      props.isLoading = true;
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeDisabled();
    });

    it('should not trigger file input when isLoading is true', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.isLoading = true;
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      const loadQuizButtons = screen.getAllByRole('button', { name: /loading/i });
      await user.click(loadQuizButtons[1]);

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should display processing message when isLoading is true', () => {
      const props = createDefaultProps();
      props.isLoading = true;
      render(<WelcomeScreen {...props} />);

      expect(screen.getByText('Processing your quiz module...')).toBeInTheDocument();
    });

    it('should not display processing message when isLoading is false', () => {
      const props = createDefaultProps();
      props.isLoading = false;
      render(<WelcomeScreen {...props} />);

      expect(screen.queryByText('Processing your quiz module...')).not.toBeInTheDocument();
    });

    it('should update button text when loading', () => {
      const props = createDefaultProps();
      props.isLoading = true;
      render(<WelcomeScreen {...props} />);

      expect(screen.queryByText('Try Algorithm Quiz')).not.toBeInTheDocument();
      expect(screen.queryByText('Load Quiz (JSON/MD)')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error prop is provided', () => {
      const props = createDefaultProps();
      props.error = 'Failed to parse quiz file';
      render(<WelcomeScreen {...props} />);

      expect(screen.getByText('Error Loading Quiz Module')).toBeInTheDocument();
      expect(screen.getByText('Failed to parse quiz file')).toBeInTheDocument();
    });

    it('should not display error section when error is undefined', () => {
      const props = createDefaultProps();
      props.error = undefined;
      render(<WelcomeScreen {...props} />);

      expect(screen.queryByText('Error Loading Quiz Module')).not.toBeInTheDocument();
    });

    it('should not display error section when error is empty string', () => {
      const props = createDefaultProps();
      props.error = '';
      render(<WelcomeScreen {...props} />);

      expect(screen.queryByText('Error Loading Quiz Module')).not.toBeInTheDocument();
    });

    it('should display multi-line error messages correctly', () => {
      const props = createDefaultProps();
      props.error = 'Line 1: Error\nLine 2: Details';
      render(<WelcomeScreen {...props} />);

      expect(screen.getByText(/Line 1: Error/)).toBeInTheDocument();
      expect(screen.getByText(/Line 2: Details/)).toBeInTheDocument();
    });

    it('should display long error messages', () => {
      const props = createDefaultProps();
      props.error =
        'This is a very long error message that explains in detail what went wrong with the quiz file parsing and provides suggestions for fixing the issue.';
      render(<WelcomeScreen {...props} />);

      expect(screen.getByText(/This is a very long error message/)).toBeInTheDocument();
    });
  });

  describe('Feature Cards', () => {
    it('should render Interactive Learning feature', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('Interactive Learning')).toBeInTheDocument();
      expect(screen.getByText('Engage with dynamic quizzes')).toBeInTheDocument();
    });

    it('should render Smart Feedback feature', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('Smart Feedback')).toBeInTheDocument();
      expect(screen.getByText('Get detailed explanations')).toBeInTheDocument();
    });

    it('should render Progress Tracking feature', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('Progress Tracking')).toBeInTheDocument();
      expect(screen.getByText('Monitor your learning journey')).toBeInTheDocument();
    });

    it('should render Spaced Repetition feature', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('Spaced Repetition')).toBeInTheDocument();
      expect(screen.getByText('Master topics with smart review schedules')).toBeInTheDocument();
    });

    it('should render Markdown and JSON feature', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('Markdown & JSON')).toBeInTheDocument();
      expect(
        screen.getByText('Support for both JSON and Markdown quiz formats'),
      ).toBeInTheDocument();
    });

    it('should render feature icons', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
    });
  });

  describe('Supported Formats Section', () => {
    it('should render Supported Formats heading', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('Supported Formats:')).toBeInTheDocument();
    });

    it('should render JSON Format section', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText(/JSON Format/)).toBeInTheDocument();
      expect(
        screen.getByText('Traditional structured quiz data with full feature support'),
      ).toBeInTheDocument();
    });

    it('should render JSON format features', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText(/Complete quiz modules with chapters/)).toBeInTheDocument();
      expect(screen.getByText(/Progress tracking and SRS data/)).toBeInTheDocument();
    });

    it('should render Markdown Format section', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('📝 Markdown Format')).toBeInTheDocument();
      expect(
        screen.getByText('Human-readable format with LaTeX, code blocks, and more'),
      ).toBeInTheDocument();
    });

    it('should render Markdown format features', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText(/Easy to write and edit/)).toBeInTheDocument();
      expect(screen.getByText(/Code blocks and rich formatting/)).toBeInTheDocument();
      expect(screen.getByText(/Optional progress state tracking/)).toBeInTheDocument();
    });

    it('should render Markdown Format Example heading', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText('Markdown Format Example:')).toBeInTheDocument();
    });

    it('should render example markdown content', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);
      expect(screen.getByText(/# Quiz Title/)).toBeInTheDocument();
    });
  });

  describe('Multiple Button Interactions', () => {
    it('should handle rapid clicks on Try Algorithm Quiz button', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const button = screen.getByRole('button', { name: /try algorithm quiz/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(props.onLoadDefaultQuiz).toHaveBeenCalledTimes(3);
    });

    it('should allow switching between default quiz and custom file', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      await user.click(screen.getByRole('button', { name: /try algorithm quiz/i }));
      expect(props.onLoadDefaultQuiz).toHaveBeenCalledTimes(1);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['{"name": "Test"}'], 'test.json', { type: 'application/json' });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(props.onLoadQuiz).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);

      expect(screen.getByRole('button', { name: /try algorithm quiz/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /load quiz/i })).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);

      const mainTitle = screen.getByText('MCQ Master');
      expect(mainTitle.tagName).toBe('H1');
    });

    it('should have descriptive text for all interactive elements', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);

      expect(screen.getByText('Try Algorithm Quiz')).toBeInTheDocument();
      expect(screen.getByText('Load Quiz (JSON/MD)')).toBeInTheDocument();
    });

    it('should indicate disabled state clearly', () => {
      const props = createDefaultProps();
      props.isLoading = true;
      render(<WelcomeScreen {...props} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined isLoading defaults to false', () => {
      const props = {
        onLoadQuiz: vi.fn(),
        onLoadDefaultQuiz: vi.fn(),
      };
      render(<WelcomeScreen {...props} />);

      expect(screen.getByRole('button', { name: /try algorithm quiz/i })).not.toBeDisabled();
    });

    it('should handle file selection with null files', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: null } });

      expect(props.onLoadQuiz).not.toHaveBeenCalled();
    });

    it('should handle file with special characters in name', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['{}'], 'test quiz (1).json', { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(props.onLoadQuiz).toHaveBeenCalledWith(testFile);
    });

    it('should handle large file names', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const longFileName = 'a'.repeat(255) + '.json';
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['{}'], longFileName, { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(props.onLoadQuiz).toHaveBeenCalledWith(testFile);
    });

    it('should handle error with special characters', () => {
      const props = createDefaultProps();
      props.error = 'Error: <script>alert("xss")</script>';
      render(<WelcomeScreen {...props} />);

      expect(screen.getByText('Error: <script>alert("xss")</script>')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render all feature icons', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);

      const brainIcons = screen.getAllByTestId('brain-icon');
      expect(brainIcons.length).toBeGreaterThanOrEqual(1);

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      const bookOpenIcons = screen.getAllByTestId('book-open-icon');
      expect(bookOpenIcons.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });
  });

  describe('File Type Handling', () => {
    it('should accept json files', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const jsonFile = new File(['{}'], 'quiz.json', { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [jsonFile] } });

      expect(props.onLoadQuiz).toHaveBeenCalledWith(jsonFile);
    });

    it('should accept md files', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mdFile = new File(['# Quiz'], 'quiz.md', { type: 'text/markdown' });

      fireEvent.change(fileInput, { target: { files: [mdFile] } });

      expect(props.onLoadQuiz).toHaveBeenCalledWith(mdFile);
    });

    it('should accept markdown files', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const markdownFile = new File(['# Quiz'], 'quiz.markdown', { type: 'text/markdown' });

      fireEvent.change(fileInput, { target: { files: [markdownFile] } });

      expect(props.onLoadQuiz).toHaveBeenCalledWith(markdownFile);
    });

    it('should handle empty file', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const emptyFile = new File([''], 'empty.json', { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [emptyFile] } });

      expect(props.onLoadQuiz).toHaveBeenCalledWith(emptyFile);
    });

    it('should handle file with large content', () => {
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const largeContent = JSON.stringify({ data: 'x'.repeat(1000000) });
      const largeFile = new File([largeContent], 'large.json', { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(props.onLoadQuiz).toHaveBeenCalledWith(largeFile);
    });
  });

  describe('Simultaneous States', () => {
    it('should show both loading and error states correctly', () => {
      const props = createDefaultProps();
      props.isLoading = true;
      props.error = 'Previous error';
      render(<WelcomeScreen {...props} />);

      expect(screen.getByText('Processing your quiz module...')).toBeInTheDocument();
      expect(screen.getByText('Previous error')).toBeInTheDocument();
    });

    it('should keep buttons disabled when loading even with error', () => {
      const props = createDefaultProps();
      props.isLoading = true;
      props.error = 'Some error';
      render(<WelcomeScreen {...props} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Console Logging', () => {
    it('should log file selection details', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const props = createDefaultProps();
      render(<WelcomeScreen {...props} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['{}'], 'test.json', { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(consoleSpy).toHaveBeenCalledWith(
        'File selected:',
        'test.json',
        'Type:',
        'application/json',
        'Size:',
        2,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Component Structure', () => {
    it('should have proper container structure', () => {
      const { container } = render(<WelcomeScreen {...createDefaultProps()} />);

      const mainContainer = container.querySelector('.flex.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should render Card component', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);

      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should render pre element with markdown example', () => {
      render(<WelcomeScreen {...createDefaultProps()} />);

      const preElement = document.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toContain('# Quiz Title');
    });
  });

  describe('Props Default Values', () => {
    it('should work with minimal required props', () => {
      const minimalProps = {
        onLoadQuiz: vi.fn(),
        onLoadDefaultQuiz: vi.fn(),
      };

      expect(() => render(<WelcomeScreen {...minimalProps} />)).not.toThrow();
    });

    it('should default isLoading to false when not provided', () => {
      const props = {
        onLoadQuiz: vi.fn(),
        onLoadDefaultQuiz: vi.fn(),
      };
      render(<WelcomeScreen {...props} />);

      expect(screen.getByRole('button', { name: /try algorithm quiz/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /load quiz/i })).not.toBeDisabled();
    });
  });
});
