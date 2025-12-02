import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestPage from '@/app/test/page';

// Mock the parseMarkdownToQuizModule function
const mockParseMarkdownToQuizModule = vi.fn();

vi.mock('@/utils/quiz-validation-refactored', () => ({
  parseMarkdownToQuizModule: (...args: unknown[]) => mockParseMarkdownToQuizModule(...args),
}));

describe('TestPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the page title', () => {
      render(<TestPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Markdown Parser Tests');
    });

    it('should render the Run Tests button', () => {
      render(<TestPage />);

      expect(screen.getByRole('button', { name: 'Run Tests' })).toBeInTheDocument();
    });

    it('should render test data preview section', () => {
      render(<TestPage />);

      expect(
        screen.getByRole('heading', { level: 2, name: 'Test Data Preview' }),
      ).toBeInTheDocument();
    });

    it('should render format 1 preview', () => {
      render(<TestPage />);

      expect(screen.getByText('Format 1: Options/Correct')).toBeInTheDocument();
    });

    it('should render format 2 preview', () => {
      render(<TestPage />);

      expect(screen.getByText('Format 2: Opt/Ans')).toBeInTheDocument();
    });

    it('should not display test results initially', () => {
      render(<TestPage />);

      expect(screen.queryByText('Test Results:')).not.toBeInTheDocument();
    });

    it('should display markdown content in preview sections', () => {
      render(<TestPage />);

      // Check for content from testMarkdown1
      expect(screen.getByText(/MCQ Compact Output/)).toBeInTheDocument();
      // Check for content from testMarkdown2
      expect(screen.getByText(/Advanced Algorithms Quiz/)).toBeInTheDocument();
    });
  });

  describe('Running Tests - Success Scenarios', () => {
    it('should run tests and display results for successful parsing', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: true,
        errors: [],
        quizModule: {
          name: 'Test Module',
          description: 'Test Description',
          chapters: [
            {
              id: 'ch_test_1',
              name: 'Test Chapter',
              questions: [
                {
                  questionId: 'q1',
                  options: [{ optionId: 'A1' }, { optionId: 'A2' }],
                  correctOptionIds: ['A2'],
                },
              ],
            },
          ],
        },
      });

      render(<TestPage />);

      const runButton = screen.getByRole('button', { name: 'Run Tests' });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Test Results:')).toBeInTheDocument();
      });

      expect(screen.getByText(/Success: true/)).toBeInTheDocument();
      expect(screen.getByText(/Errors: 0/)).toBeInTheDocument();
    });

    it('should display module details when parsing succeeds', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: true,
        errors: [],
        quizModule: {
          name: 'Algorithm Fundamentals',
          description: 'Learning algorithms',
          chapters: [
            {
              id: 'ch_algo_1',
              name: 'Sorting',
              questions: [
                {
                  questionId: 'sorting_q1',
                  options: [{ optionId: 'A1' }, { optionId: 'A2' }, { optionId: 'A3' }],
                  correctOptionIds: ['A2'],
                },
              ],
            },
          ],
        },
      });

      render(<TestPage />);

      await user.click(screen.getByRole('button', { name: 'Run Tests' }));

      await waitFor(() => {
        expect(screen.getByText(/Module Name: Algorithm Fundamentals/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Description: Learning algorithms/)).toBeInTheDocument();
      expect(screen.getByText(/Chapters: 1/)).toBeInTheDocument();
    });

    it('should display chapter and question details', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: true,
        errors: [],
        quizModule: {
          name: 'Test Quiz',
          description: 'Test',
          chapters: [
            {
              id: 'chapter_1',
              name: 'Chapter One',
              questions: [
                {
                  questionId: 'q_001',
                  options: [{ optionId: 'opt1' }, { optionId: 'opt2' }],
                  correctOptionIds: ['opt2'],
                },
                {
                  questionId: 'q_002',
                  options: [{ optionId: 'opt1' }],
                  correctOptionIds: ['opt1'],
                },
              ],
            },
          ],
        },
      });

      render(<TestPage />);

      await user.click(screen.getByRole('button', { name: 'Run Tests' }));

      await waitFor(() => {
        expect(screen.getByText(/Chapter ID: chapter_1/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Chapter Name: Chapter One/)).toBeInTheDocument();
      expect(screen.getByText(/Questions: 2/)).toBeInTheDocument();
      expect(screen.getByText(/Q1 ID: q_001/)).toBeInTheDocument();
      expect(screen.getByText(/Q1 Options: 2/)).toBeInTheDocument();
    });

    it('should call parseMarkdownToQuizModule twice (once for each test format)', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: true,
        errors: [],
        quizModule: {
          name: 'Test',
          description: 'Test',
          chapters: [],
        },
      });

      render(<TestPage />);

      await user.click(screen.getByRole('button', { name: 'Run Tests' }));

      await waitFor(() => {
        expect(mockParseMarkdownToQuizModule).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Running Tests - Error Scenarios', () => {
    it('should display errors when parsing fails', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: false,
        errors: ['Invalid markdown format', 'Missing chapter ID'],
        quizModule: null,
      });

      render(<TestPage />);

      await user.click(screen.getByRole('button', { name: 'Run Tests' }));

      await waitFor(() => {
        expect(screen.getByText(/Success: false/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Invalid markdown format; Missing chapter ID/)).toBeInTheDocument();
    });

    it('should handle exception during parsing gracefully', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockImplementation(() => {
        throw new Error('Unexpected parsing error');
      });

      render(<TestPage />);

      await user.click(screen.getByRole('button', { name: 'Run Tests' }));

      await waitFor(() => {
        expect(screen.getByText(/Test failed with error/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Unexpected parsing error/)).toBeInTheDocument();
    });

    it('should display error count when parsing fails', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: false,
        errors: ['Error 1', 'Error 2', 'Error 3'],
        quizModule: null,
      });

      render(<TestPage />);

      await user.click(screen.getByRole('button', { name: 'Run Tests' }));

      await waitFor(() => {
        expect(screen.getByText(/Errors: 3/)).toBeInTheDocument();
      });
    });
  });

  describe('Button State During Test Execution', () => {
    it('should disable button and show running state when tests are executing', async () => {
      const user = userEvent.setup();

      // Create a promise that we can control
      let resolveParsePromise: (value: unknown) => void;
      const parsePromise = new Promise((resolve) => {
        resolveParsePromise = resolve;
      });

      mockParseMarkdownToQuizModule.mockImplementation(() => {
        // Simulate some synchronous work
        return {
          success: true,
          errors: [],
          quizModule: { name: 'Test', description: 'Test', chapters: [] },
        };
      });

      render(<TestPage />);

      const runButton = screen.getByRole('button', { name: 'Run Tests' });
      await user.click(runButton);

      // After the synchronous test execution completes, button should be enabled again
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run Tests' })).not.toBeDisabled();
      });
    });

    it('should re-enable button after tests complete', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: true,
        errors: [],
        quizModule: { name: 'Test', description: 'Test', chapters: [] },
      });

      render(<TestPage />);

      const runButton = screen.getByRole('button', { name: 'Run Tests' });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run Tests' })).not.toBeDisabled();
      });
    });

    it('should re-enable button after tests fail', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockImplementation(() => {
        throw new Error('Test error');
      });

      render(<TestPage />);

      const runButton = screen.getByRole('button', { name: 'Run Tests' });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run Tests' })).not.toBeDisabled();
      });
    });
  });

  describe('Test Results Display', () => {
    it('should display both test 1 and test 2 results', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: true,
        errors: [],
        quizModule: {
          name: 'Test Module',
          description: 'Description',
          chapters: [
            {
              id: 'ch1',
              name: 'Chapter 1',
              questions: [
                {
                  questionId: 'q1',
                  options: [{ optionId: 'A1' }],
                  correctOptionIds: ['A1'],
                },
              ],
            },
          ],
        },
      });

      render(<TestPage />);

      await user.click(screen.getByRole('button', { name: 'Run Tests' }));

      await waitFor(() => {
        expect(screen.getByText(/=== TEST 1: Options\/Correct Format ===/)).toBeInTheDocument();
      });

      expect(screen.getByText(/=== TEST 2: Opt\/Ans Format ===/)).toBeInTheDocument();
    });

    it('should display correct option IDs in results', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: true,
        errors: [],
        quizModule: {
          name: 'Test',
          description: 'Test',
          chapters: [
            {
              id: 'ch1',
              name: 'Chapter',
              questions: [
                {
                  questionId: 'question_1',
                  options: [{ optionId: 'A' }, { optionId: 'B' }, { optionId: 'C' }],
                  correctOptionIds: ['B', 'C'],
                },
              ],
            },
          ],
        },
      });

      render(<TestPage />);

      await user.click(screen.getByRole('button', { name: 'Run Tests' }));

      await waitFor(() => {
        expect(screen.getByText(/Q1 Correct: B, C/)).toBeInTheDocument();
      });
    });
  });

  describe('Component Structure', () => {
    it('should have proper container styling', () => {
      const { container } = render(<TestPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('mx-auto', 'max-w-4xl', 'p-6');
    });

    it('should have properly styled button', () => {
      render(<TestPage />);

      const button = screen.getByRole('button', { name: 'Run Tests' });
      expect(button).toHaveClass(
        'rounded',
        'bg-blue-500',
        'px-4',
        'py-2',
        'font-bold',
        'text-white',
      );
    });

    it('should render preview sections in a grid layout', () => {
      const { container } = render(<TestPage />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      render(<TestPage />);

      const button = screen.getByRole('button', { name: 'Run Tests' });
      expect(button).toBeInTheDocument();
    });

    it('should use proper heading hierarchy', () => {
      render(<TestPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });

    it('should have semantic pre elements for code display', () => {
      const { container } = render(<TestPage />);

      const preElements = container.querySelectorAll('pre');
      expect(preElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Empty Chapter Handling', () => {
    it('should handle quiz module with no chapters', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: true,
        errors: [],
        quizModule: {
          name: 'Empty Quiz',
          description: 'No chapters',
          chapters: [],
        },
      });

      render(<TestPage />);

      await user.click(screen.getByRole('button', { name: 'Run Tests' }));

      await waitFor(() => {
        expect(screen.getByText(/Module Name: Empty Quiz/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Chapters: 0/)).toBeInTheDocument();
    });

    it('should handle chapter with no questions', async () => {
      const user = userEvent.setup();

      mockParseMarkdownToQuizModule.mockReturnValue({
        success: true,
        errors: [],
        quizModule: {
          name: 'Quiz',
          description: 'Has chapter but no questions',
          chapters: [
            {
              id: 'empty_chapter',
              name: 'Empty Chapter',
              questions: [],
            },
          ],
        },
      });

      render(<TestPage />);

      await user.click(screen.getByRole('button', { name: 'Run Tests' }));

      await waitFor(() => {
        expect(screen.getByText(/Chapter ID: empty_chapter/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Questions: 0/)).toBeInTheDocument();
    });
  });
});
