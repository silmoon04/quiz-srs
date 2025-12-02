import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardWithInlineErrors } from '@/components/a11y/DashboardWithInlineErrors';
import type { QuizModule, QuizChapter, QuizQuestion } from '@/types/quiz-types';

// Helper to create a quiz question
const createQuestion = (id: string, text: string = `Question ${id}`): QuizQuestion => ({
  questionId: id,
  questionText: text,
  options: [
    { optionId: 'opt-a', optionText: 'Option A' },
    { optionId: 'opt-b', optionText: 'Option B' },
  ],
  correctOptionIds: ['opt-a'],
  explanationText: `Explanation for ${id}`,
});

// Helper to create a chapter
const createChapter = (
  id: string,
  name: string,
  questionCount: number = 5,
  answeredCount: number = 0,
  correctCount: number = 0,
): QuizChapter => ({
  id,
  name,
  questions: Array.from({ length: questionCount }, (_, i) =>
    createQuestion(`${id}-q-${i + 1}`, `${name} Question ${i + 1}`),
  ),
  totalQuestions: questionCount,
  answeredQuestions: answeredCount,
  correctAnswers: correctCount,
});

// Helper to create a quizModule
const createModule = (
  name: string = 'Test Module',
  chapters: QuizChapter[] = [createChapter('ch-1', 'Chapter 1')],
): QuizModule => ({
  name,
  description: 'Test quizModule description',
  chapters,
});

// Create default props factory
const createDefaultProps = (
  overrides: Partial<{
    quizModule: QuizModule;
    onStartQuiz: (chapterId: string) => void;
    onStartReviewSession: () => void;
    onLoadNewModule: () => void;
    onExportState: () => void;
    onImportState: (file: File) => Promise<void>;
    onExportIncorrectAnswers: () => void;
    reviewQueueCount: number;
  }> = {},
) => ({
  quizModule: createModule(),
  onStartQuiz: vi.fn(),
  onStartReviewSession: vi.fn(),
  onLoadNewModule: vi.fn(),
  onExportState: vi.fn(),
  onImportState: vi.fn().mockResolvedValue(undefined),
  onExportIncorrectAnswers: vi.fn(),
  reviewQueueCount: 0,
  ...overrides,
});

// Helper to create a mock file
const createMockFile = (name: string = 'test.json', content: string = '{}'): File => {
  return new File([content], name, { type: 'application/json' });
};

describe('DashboardWithInlineErrors Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render the dashboard with quizModule information', () => {
      const quizModule = createModule('My Quiz Module');
      render(<DashboardWithInlineErrors {...createDefaultProps({ quizModule })} />);

      expect(screen.getByText('My Quiz Module')).toBeInTheDocument();
      expect(screen.getByText('Test quizModule description')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<DashboardWithInlineErrors {...createDefaultProps()} />);

      expect(screen.getByRole('button', { name: /import state/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export state/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /load new quizModule/i })).toBeInTheDocument();
    });

    it('should render chapters from the quizModule', () => {
      const quizModule = createModule('Test', [
        createChapter('ch-1', 'First Chapter'),
        createChapter('ch-2', 'Second Chapter'),
      ]);
      render(<DashboardWithInlineErrors {...createDefaultProps({ quizModule })} />);

      expect(screen.getByText('First Chapter')).toBeInTheDocument();
      expect(screen.getByText('Second Chapter')).toBeInTheDocument();
    });

    it('should render review session card when reviewQueueCount is greater than 0', () => {
      render(<DashboardWithInlineErrors {...createDefaultProps({ reviewQueueCount: 5 })} />);

      expect(screen.getByText('Spaced Repetition Review')).toBeInTheDocument();
      // Check for the specific review queue count in the correct context
      expect(screen.getByText(/5.*question/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start review session/i })).toBeInTheDocument();
    });

    it('should not render review session card when reviewQueueCount is 0', () => {
      render(<DashboardWithInlineErrors {...createDefaultProps({ reviewQueueCount: 0 })} />);

      expect(screen.queryByText('Spaced Repetition Review')).not.toBeInTheDocument();
    });
  });

  describe('Hidden file input with ARIA attributes', () => {
    it('should render hidden file input with correct attributes', () => {
      render(<DashboardWithInlineErrors {...createDefaultProps()} />);

      // There are two file inputs - one in DashboardWithInlineErrors and one in Dashboard
      // We look for the one with aria-label
      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      );

      expect(enhancedInput).toBeInTheDocument();
      expect(enhancedInput).toHaveAttribute('accept', '.json,application/json');
      expect(enhancedInput).toHaveClass('hidden');
    });

    it('should have aria-invalid set to false when no error exists', () => {
      render(<DashboardWithInlineErrors {...createDefaultProps()} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      );

      expect(enhancedInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should not have aria-describedby when no error exists', () => {
      render(<DashboardWithInlineErrors {...createDefaultProps()} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      );

      // When no error, aria-describedby should be undefined/not present
      expect(enhancedInput?.getAttribute('aria-describedby')).toBeFalsy();
    });
  });

  describe('File import functionality', () => {
    it('should call onImportState when a file is selected', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockResolvedValue(undefined);
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      const testFile = createMockFile('quiz-state.json', '{"state": "test"}');
      await user.upload(enhancedInput, testFile);

      await waitFor(() => {
        expect(onImportState).toHaveBeenCalledWith(testFile);
      });
    });

    it('should reset file input value after file selection', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockResolvedValue(undefined);
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      const testFile = createMockFile('quiz-state.json');
      await user.upload(enhancedInput, testFile);

      await waitFor(() => {
        expect(enhancedInput.value).toBe('');
      });
    });

    it('should allow re-selecting the same file after reset', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockResolvedValue(undefined);
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      const testFile = createMockFile('quiz-state.json');

      // Select file first time
      await user.upload(enhancedInput, testFile);
      await waitFor(() => {
        expect(onImportState).toHaveBeenCalledTimes(1);
      });

      // Select same file again
      await user.upload(enhancedInput, testFile);
      await waitFor(() => {
        expect(onImportState).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error display and accessibility', () => {
    it('should display error message when import fails', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockRejectedValue(new Error('Invalid JSON format'));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      const testFile = createMockFile('invalid.json', 'not valid json');
      await user.upload(enhancedInput, testFile);

      await waitFor(() => {
        // May have multiple elements due to ErrorMessage + InlineErrorHandler
        expect(screen.getAllByText('Invalid JSON format').length).toBeGreaterThan(0);
      });
    });

    it('should display generic error message for non-Error rejections', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockRejectedValue('string error');
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      const testFile = createMockFile('test.json');
      await user.upload(enhancedInput, testFile);

      await waitFor(() => {
        // May have multiple elements due to ErrorMessage + InlineErrorHandler
        expect(screen.getAllByText('Import failed').length).toBeGreaterThan(0);
      });
    });

    it('should set aria-invalid to true when error exists', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockRejectedValue(new Error('Import error'));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      const testFile = createMockFile('test.json');
      await user.upload(enhancedInput, testFile);

      await waitFor(() => {
        expect(enhancedInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should set aria-describedby to error element ID when error exists', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockRejectedValue(new Error('Import error'));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      const testFile = createMockFile('test.json');
      await user.upload(enhancedInput, testFile);

      await waitFor(() => {
        const describedBy = enhancedInput.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        expect(describedBy).toMatch(/^error-\d+$/);
      });
    });

    it('should have error message element with matching ID', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockRejectedValue(new Error('Import error'));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      const testFile = createMockFile('test.json');
      await user.upload(enhancedInput, testFile);

      await waitFor(() => {
        const describedBy = enhancedInput.getAttribute('aria-describedby');
        const errorElement = document.getElementById(describedBy!);
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent('Import error');
      });
    });
  });

  describe('Error clearing', () => {
    it('should clear error when successful import occurs', async () => {
      const user = userEvent.setup();
      let importAttempt = 0;
      const onImportState = vi.fn().mockImplementation(() => {
        importAttempt++;
        if (importAttempt === 1) {
          return Promise.reject(new Error('First import failed'));
        }
        return Promise.resolve();
      });

      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      // First import - should fail and show error
      const failFile = createMockFile('fail.json');
      await user.upload(enhancedInput, failFile);

      await waitFor(() => {
        // May have multiple elements due to ErrorMessage + InlineErrorHandler
        expect(screen.getAllByText('First import failed').length).toBeGreaterThan(0);
      });

      // Second import - should succeed and clear error
      const successFile = createMockFile('success.json');
      await user.upload(enhancedInput, successFile);

      await waitFor(() => {
        expect(screen.queryByText('First import failed')).not.toBeInTheDocument();
      });
    });

    it('should reset aria-invalid to false after successful import', async () => {
      const user = userEvent.setup();
      let importAttempt = 0;
      const onImportState = vi.fn().mockImplementation(() => {
        importAttempt++;
        if (importAttempt === 1) {
          return Promise.reject(new Error('Error'));
        }
        return Promise.resolve();
      });

      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      // First import - fail
      await user.upload(enhancedInput, createMockFile('fail.json'));
      await waitFor(() => {
        expect(enhancedInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Second import - succeed
      await user.upload(enhancedInput, createMockFile('success.json'));
      await waitFor(() => {
        expect(enhancedInput).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('should remove aria-describedby after error is cleared', async () => {
      const user = userEvent.setup();
      let importAttempt = 0;
      const onImportState = vi.fn().mockImplementation(() => {
        importAttempt++;
        if (importAttempt === 1) {
          return Promise.reject(new Error('Error'));
        }
        return Promise.resolve();
      });

      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      // First import - fail
      await user.upload(enhancedInput, createMockFile('fail.json'));
      await waitFor(() => {
        expect(enhancedInput.getAttribute('aria-describedby')).toBeTruthy();
      });

      // Second import - succeed
      await user.upload(enhancedInput, createMockFile('success.json'));
      await waitFor(() => {
        expect(enhancedInput.getAttribute('aria-describedby')).toBeFalsy();
      });
    });
  });

  describe('ARIA live regions', () => {
    it('should have role="alert" on error message element', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockRejectedValue(new Error('Test error'));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      await user.upload(enhancedInput, createMockFile('test.json'));

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const errorAlert = alerts.find((alert) => alert.textContent === 'Test error');
        expect(errorAlert).toBeInTheDocument();
      });
    });

    it('should have aria-live="polite" on error message', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockRejectedValue(new Error('Live region error'));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      await user.upload(enhancedInput, createMockFile('test.json'));

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const errorAlert = alerts.find((alert) => alert.textContent === 'Live region error');
        expect(errorAlert).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should announce error to screen readers via live region', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockRejectedValue(new Error('Screen reader announcement'));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      await user.upload(enhancedInput, createMockFile('test.json'));

      await waitFor(() => {
        // The ErrorMessage and InlineErrorHandler both render with role="alert" and aria-live="polite"
        const errorElements = screen.getAllByText('Screen reader announcement');
        expect(errorElements.length).toBeGreaterThan(0);
        // All should have role="alert"
        errorElements.forEach((el) => {
          expect(el).toHaveAttribute('role', 'alert');
        });
      });
    });
  });

  describe('Error association with form fields', () => {
    it('should associate error with correct field via aria-describedby', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockRejectedValue(new Error('Associated error'));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      await user.upload(enhancedInput, createMockFile('test.json'));

      await waitFor(() => {
        const describedById = enhancedInput.getAttribute('aria-describedby');
        expect(describedById).toBeTruthy();

        const describedByElement = document.getElementById(describedById!);
        expect(describedByElement).toHaveTextContent('Associated error');
      });
    });

    it('should use unique error IDs for each error instance', async () => {
      const user = userEvent.setup();
      let errorCount = 0;
      const onImportState = vi.fn().mockImplementation(() => {
        errorCount++;
        return Promise.reject(new Error(`Error ${errorCount}`));
      });

      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      // First error
      await user.upload(enhancedInput, createMockFile('test1.json'));
      let firstErrorId: string | null = null;
      await waitFor(() => {
        firstErrorId = enhancedInput.getAttribute('aria-describedby');
        expect(firstErrorId).toBeTruthy();
      });

      // Second error
      await user.upload(enhancedInput, createMockFile('test2.json'));
      await waitFor(() => {
        const secondErrorId = enhancedInput.getAttribute('aria-describedby');
        expect(secondErrorId).toBeTruthy();
        expect(secondErrorId).not.toBe(firstErrorId);
      });
    });
  });

  describe('Dashboard callback integration', () => {
    it('should call onStartQuiz when chapter quiz is started', async () => {
      const user = userEvent.setup();
      const onStartQuiz = vi.fn();
      const quizModule = createModule('Test', [createChapter('ch-1', 'Chapter 1')]);
      render(<DashboardWithInlineErrors {...createDefaultProps({ quizModule, onStartQuiz })} />);

      const startButton = screen.getByRole('button', { name: /start quiz/i });
      await user.click(startButton);

      expect(onStartQuiz).toHaveBeenCalledWith('ch-1');
    });

    it('should call onStartReviewSession when review button is clicked', async () => {
      const user = userEvent.setup();
      const onStartReviewSession = vi.fn();
      render(
        <DashboardWithInlineErrors
          {...createDefaultProps({ onStartReviewSession, reviewQueueCount: 3 })}
        />,
      );

      const reviewButton = screen.getByRole('button', { name: /start review session/i });
      await user.click(reviewButton);

      expect(onStartReviewSession).toHaveBeenCalled();
    });

    it('should call onExportState when export button is clicked', async () => {
      const user = userEvent.setup();
      const onExportState = vi.fn();
      render(<DashboardWithInlineErrors {...createDefaultProps({ onExportState })} />);

      const exportButton = screen.getByRole('button', { name: /export state/i });
      await user.click(exportButton);

      expect(onExportState).toHaveBeenCalled();
    });

    it('should call onLoadNewModule when load new quizModule button is clicked', async () => {
      const user = userEvent.setup();
      const onLoadNewModule = vi.fn();
      render(<DashboardWithInlineErrors {...createDefaultProps({ onLoadNewModule })} />);

      const loadButton = screen.getByRole('button', { name: /load new quizModule/i });
      await user.click(loadButton);

      expect(onLoadNewModule).toHaveBeenCalled();
    });
  });

  describe('Component wrapper structure', () => {
    it('should wrap dashboard content in InlineErrorHandler context', () => {
      render(<DashboardWithInlineErrors {...createDefaultProps()} />);

      // The component should render without throwing an error about missing context
      expect(screen.getByText('Test Module')).toBeInTheDocument();
    });

    it('should render dashboard within a relative container', () => {
      const { container } = render(<DashboardWithInlineErrors {...createDefaultProps()} />);

      const relativeContainer = container.querySelector('.relative');
      expect(relativeContainer).toBeInTheDocument();
    });

    it('should render ErrorMessage component for import-state-file field', async () => {
      const user = userEvent.setup();
      const onImportState = vi.fn().mockRejectedValue(new Error('Visible error'));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      await user.upload(enhancedInput, createMockFile('test.json'));

      await waitFor(() => {
        const errorMessages = screen.getAllByText('Visible error');
        expect(errorMessages.length).toBeGreaterThan(0);
        // At least one should have text-red-400 class (the visible ErrorMessage component)
        const visibleError = errorMessages.find((el) => el.classList.contains('text-red-400'));
        expect(visibleError).toBeInTheDocument();
      });
    });
  });

  describe('Multiple consecutive errors', () => {
    it('should replace previous error with new error', async () => {
      const user = userEvent.setup();
      let errorCount = 0;
      const onImportState = vi.fn().mockImplementation(() => {
        errorCount++;
        return Promise.reject(new Error(`Error message ${errorCount}`));
      });

      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      // First error
      await user.upload(enhancedInput, createMockFile('test1.json'));
      await waitFor(() => {
        // Error message 1 appears (may have multiple elements due to ErrorMessage + InlineErrorHandler)
        expect(screen.getAllByText('Error message 1').length).toBeGreaterThan(0);
      });

      // Second error - should replace first
      await user.upload(enhancedInput, createMockFile('test2.json'));
      await waitFor(() => {
        expect(screen.queryByText('Error message 1')).not.toBeInTheDocument();
        expect(screen.getAllByText('Error message 2').length).toBeGreaterThan(0);
      });
    });

    it('should only show one error at a time for the same field', async () => {
      const user = userEvent.setup();
      let errorCount = 0;
      const onImportState = vi.fn().mockImplementation(() => {
        errorCount++;
        return Promise.reject(new Error(`Error ${errorCount}`));
      });

      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      // Trigger multiple errors sequentially
      await user.upload(enhancedInput, createMockFile('test1.json'));
      await waitFor(() => {
        expect(screen.getAllByText('Error 1').length).toBeGreaterThan(0);
      });

      await user.upload(enhancedInput, createMockFile('test2.json'));
      await waitFor(() => {
        expect(screen.queryByText('Error 1')).not.toBeInTheDocument();
        expect(screen.getAllByText('Error 2').length).toBeGreaterThan(0);
      });

      await user.upload(enhancedInput, createMockFile('test3.json'));
      await waitFor(() => {
        // Only the last error should be visible (may have 2 elements due to ErrorMessage + InlineErrorHandler)
        expect(screen.queryByText('Error 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Error 2')).not.toBeInTheDocument();
        const error3Elements = screen.getAllByText('Error 3');
        // Should have exactly 2 elements (ErrorMessage visible + InlineErrorHandler sr-only)
        expect(error3Elements.length).toBe(2);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty file selection gracefully', async () => {
      const onImportState = vi.fn().mockResolvedValue(undefined);
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      // Simulate change event without files (user cancelled)
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: null },
        writable: false,
      });

      enhancedInput.dispatchEvent(event);

      // onImportState should not have been called
      expect(onImportState).not.toHaveBeenCalled();
    });

    it('should handle quizModule with no chapters', () => {
      const quizModule = createModule('Empty Module', []);
      render(<DashboardWithInlineErrors {...createDefaultProps({ quizModule })} />);

      expect(screen.getByText('Empty Module')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Chapters' })).toBeInTheDocument();
    });

    it('should handle quizModule with no description', () => {
      const quizModule: QuizModule = {
        name: 'No Description Module',
        chapters: [createChapter('ch-1', 'Chapter 1')],
      };
      render(<DashboardWithInlineErrors {...createDefaultProps({ quizModule })} />);

      expect(screen.getByText('No Description Module')).toBeInTheDocument();
    });

    it('should handle very long error messages', async () => {
      const user = userEvent.setup();
      const longError = 'A'.repeat(500);
      const onImportState = vi.fn().mockRejectedValue(new Error(longError));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      await user.upload(enhancedInput, createMockFile('test.json'));

      await waitFor(() => {
        // May have multiple elements due to ErrorMessage + InlineErrorHandler
        expect(screen.getAllByText(longError).length).toBeGreaterThan(0);
      });
    });

    it('should handle special characters in error messages', async () => {
      const user = userEvent.setup();
      const specialError = '<script>alert("xss")</script> & "quotes" \'apostrophe\'';
      const onImportState = vi.fn().mockRejectedValue(new Error(specialError));
      render(<DashboardWithInlineErrors {...createDefaultProps({ onImportState })} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      ) as HTMLInputElement;

      await user.upload(enhancedInput, createMockFile('test.json'));

      await waitFor(() => {
        // May have multiple elements due to ErrorMessage + InlineErrorHandler
        expect(screen.getAllByText(specialError).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility compliance', () => {
    it('should have proper ARIA attributes for file input field', () => {
      render(<DashboardWithInlineErrors {...createDefaultProps()} />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const enhancedInput = Array.from(fileInputs).find(
        (input) => input.getAttribute('aria-label') === 'Import quiz state file',
      );

      expect(enhancedInput).toHaveAttribute('aria-label', 'Import quiz state file');
      expect(enhancedInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should maintain keyboard accessibility for all buttons', async () => {
      const user = userEvent.setup();
      const onExportState = vi.fn();
      render(<DashboardWithInlineErrors {...createDefaultProps({ onExportState })} />);

      const exportButton = screen.getByRole('button', { name: /export state/i });
      exportButton.focus();
      expect(exportButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onExportState).toHaveBeenCalled();
    });

    it('should have focusable action buttons', () => {
      render(<DashboardWithInlineErrors {...createDefaultProps()} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });
});
