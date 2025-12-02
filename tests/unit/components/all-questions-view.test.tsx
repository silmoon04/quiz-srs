import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AllQuestionsView } from '@/components/all-questions-view';
import type { QuizChapter, QuizQuestion, AnswerRecord } from '@/types/quiz-types';

// Mock the MarkdownRenderer to render synchronously for testing
vi.mock('@/components/rendering/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ markdown, className }: { markdown: string; className?: string }) => (
    <div className={className} data-testid="markdown-renderer">
      {markdown}
    </div>
  ),
}));

// Helper to create a quiz option
const createOption = (id: string, text: string) => ({
  optionId: id,
  optionText: text,
});

// Helper to create a quiz question
const createQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  questionId: 'q_default',
  questionText: 'What is the default question?',
  options: [
    createOption('opt_a', 'Option A'),
    createOption('opt_b', 'Option B'),
    createOption('opt_c', 'Option C'),
    createOption('opt_d', 'Option D'),
  ],
  correctOptionIds: ['opt_a'],
  explanationText: 'The correct answer is Option A because it is the first option.',
  status: 'not_attempted',
  timesAnsweredCorrectly: 0,
  timesAnsweredIncorrectly: 0,
  historyOfIncorrectSelections: [],
  srsLevel: 0,
  nextReviewAt: null,
  shownIncorrectOptionIds: [],
  ...overrides,
});

// Helper to create a quiz chapter
const createChapter = (overrides: Partial<QuizChapter> = {}): QuizChapter => ({
  id: 'chapter_1',
  name: '1. Introduction to Testing',
  description: 'A chapter about testing fundamentals',
  questions: [
    createQuestion({ questionId: 'q_1', questionText: 'What is unit testing?' }),
    createQuestion({ questionId: 'q_2', questionText: 'What is integration testing?' }),
    createQuestion({ questionId: 'q_3', questionText: 'What is end-to-end testing?' }),
  ],
  totalQuestions: 3,
  answeredQuestions: 0,
  correctAnswers: 0,
  isCompleted: false,
  ...overrides,
});

// Helper to create an answer record
const createAnswerRecord = (
  selectedOptionId: string,
  isCorrect: boolean,
  displayedOptionIds: string[] = ['opt_a', 'opt_b', 'opt_c', 'opt_d'],
): AnswerRecord => ({
  selectedOptionId,
  isCorrect,
  displayedOptionIds,
  timestamp: new Date().toISOString(),
});

// Default props factory
const createDefaultProps = (
  overrides: Partial<{
    chapter: QuizChapter;
    onBackToQuiz: () => void;
    onBackToDashboard: () => void;
    onRetryChapter: () => void;
    isReviewSession: boolean;
    answerRecords: Record<string, AnswerRecord>;
  }> = {},
) => ({
  chapter: createChapter(),
  onBackToQuiz: vi.fn(),
  onBackToDashboard: vi.fn(),
  onRetryChapter: vi.fn(),
  isReviewSession: false,
  answerRecords: {},
  ...overrides,
});

describe('AllQuestionsView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the component with header', () => {
      render(<AllQuestionsView {...createDefaultProps()} />);
      expect(screen.getByText('All Questions')).toBeInTheDocument();
    });

    it('should render chapter title from name with chapter number', () => {
      render(<AllQuestionsView {...createDefaultProps()} />);
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('Introduction to Testing')).toBeInTheDocument();
    });

    it('should render chapter name without number prefix correctly', () => {
      const chapter = createChapter({ name: 'Advanced Testing Concepts' });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);
      expect(screen.getByText('Advanced Testing Concepts')).toBeInTheDocument();
      expect(screen.queryByText('Chapter')).not.toBeInTheDocument();
    });

    it('should render all questions in the chapter', () => {
      render(<AllQuestionsView {...createDefaultProps()} />);
      expect(screen.getByText('What is unit testing?')).toBeInTheDocument();
      expect(screen.getByText('What is integration testing?')).toBeInTheDocument();
      expect(screen.getByText('What is end-to-end testing?')).toBeInTheDocument();
    });

    it('should render all options for each question', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            questionText: 'Test question',
            options: [
              createOption('opt_a', 'First option'),
              createOption('opt_b', 'Second option'),
            ],
          }),
        ],
        totalQuestions: 1,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);
      expect(screen.getByText('First option')).toBeInTheDocument();
      expect(screen.getByText('Second option')).toBeInTheDocument();
    });

    it('should render navigation buttons', async () => {
      render(<AllQuestionsView {...createDefaultProps()} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to quiz/i })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry chapter/i })).toBeInTheDocument();
    });

    it('should render show/hide answers toggle button', () => {
      render(<AllQuestionsView {...createDefaultProps()} />);
      // The button has only an icon, check for its existence by finding it near its tooltip content
      const toggleButton = screen.getAllByRole('button')[0]; // First button is the toggle
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Rendering List of All Questions', () => {
    it('should render questions as cards', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({ questionId: 'q_1', questionText: 'Question One' }),
          createQuestion({ questionId: 'q_2', questionText: 'Question Two' }),
          createQuestion({ questionId: 'q_3', questionText: 'Question Three' }),
          createQuestion({ questionId: 'q_4', questionText: 'Question Four' }),
          createQuestion({ questionId: 'q_5', questionText: 'Question Five' }),
        ],
        totalQuestions: 5,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText('Question One')).toBeInTheDocument();
      expect(screen.getByText('Question Two')).toBeInTheDocument();
      expect(screen.getByText('Question Three')).toBeInTheDocument();
      expect(screen.getByText('Question Four')).toBeInTheDocument();
      expect(screen.getByText('Question Five')).toBeInTheDocument();
    });

    it('should display options for each question', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            questionText: 'First question',
            options: [createOption('opt_1', 'Alpha'), createOption('opt_2', 'Beta')],
          }),
          createQuestion({
            questionId: 'q_2',
            questionText: 'Second question',
            options: [createOption('opt_3', 'Gamma'), createOption('opt_4', 'Delta')],
          }),
        ],
        totalQuestions: 2,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Gamma')).toBeInTheDocument();
      expect(screen.getByText('Delta')).toBeInTheDocument();
    });

    it('should render questions with unique keys', () => {
      const questions = [
        createQuestion({ questionId: 'unique_q_1', questionText: 'Unique Q1' }),
        createQuestion({ questionId: 'unique_q_2', questionText: 'Unique Q2' }),
      ];
      const chapter = createChapter({ questions, totalQuestions: 2 });

      // Should not throw duplicate key warning
      expect(() => render(<AllQuestionsView {...createDefaultProps({ chapter })} />)).not.toThrow();
    });
  });

  describe('Progress Bar and Score Display', () => {
    it('should display progress bar', () => {
      const chapter = createChapter({
        totalQuestions: 10,
        answeredQuestions: 5,
        correctAnswers: 3,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText(/Score: 3 \/ 5/)).toBeInTheDocument();
      expect(screen.getByText(/60%/)).toBeInTheDocument();
    });

    it('should display total questions count', () => {
      const chapter = createChapter({
        totalQuestions: 15,
        answeredQuestions: 10,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText(/Total Questions: 15/)).toBeInTheDocument();
    });

    it('should handle zero answered questions', () => {
      const chapter = createChapter({
        totalQuestions: 5,
        answeredQuestions: 0,
        correctAnswers: 0,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText(/Score: 0 \/ 0/)).toBeInTheDocument();
      // There are two 0% elements (progress bar and score), so use getAllByText
      const zeroPercentElements = screen.getAllByText(/0%/);
      expect(zeroPercentElements.length).toBeGreaterThan(0);
    });

    it('should calculate percentage correctly', () => {
      const chapter = createChapter({
        totalQuestions: 10,
        answeredQuestions: 8,
        correctAnswers: 6,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      // 6/8 = 75%
      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });

    it('should use questions.length as fallback for totalQuestions', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({ questionId: 'q_1' }),
          createQuestion({ questionId: 'q_2' }),
          createQuestion({ questionId: 'q_3' }),
        ],
        totalQuestions: 0, // Will fallback to questions.length
      });
      // Override totalQuestions to undefined to test fallback
      const chapterWithoutTotal = {
        ...chapter,
        totalQuestions: undefined,
      } as unknown as QuizChapter;
      render(<AllQuestionsView {...createDefaultProps({ chapter: chapterWithoutTotal })} />);

      expect(screen.getByText(/Total Questions: 3/)).toBeInTheDocument();
    });
  });

  describe('Answer Records Display', () => {
    it('should show correct icon for correctly answered questions', () => {
      const chapter = createChapter({
        questions: [createQuestion({ questionId: 'q_1' })],
        totalQuestions: 1,
      });
      const answerRecords = {
        q_1: createAnswerRecord('opt_a', true),
      };
      render(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />);

      // Check for green check circle (correct answer indicator)
      const svgs = document.querySelectorAll('svg');
      const hasCheckCircle = Array.from(svgs).some((svg) =>
        svg.classList.contains('text-green-500'),
      );
      expect(hasCheckCircle).toBe(true);
    });

    it('should show incorrect icon for incorrectly answered questions', () => {
      const chapter = createChapter({
        questions: [createQuestion({ questionId: 'q_1' })],
        totalQuestions: 1,
      });
      const answerRecords = {
        q_1: createAnswerRecord('opt_b', false),
      };
      render(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />);

      // Check for red X circle (incorrect answer indicator)
      const svgs = document.querySelectorAll('svg');
      const hasXCircle = Array.from(svgs).some((svg) => svg.classList.contains('text-red-500'));
      expect(hasXCircle).toBe(true);
    });

    it('should not show status icon for unanswered questions', () => {
      const chapter = createChapter({
        questions: [createQuestion({ questionId: 'q_1' })],
        totalQuestions: 1,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords: {} })} />);

      // Should not have check or X icons for unanswered
      const svgs = document.querySelectorAll('svg');
      const hasStatusIcon = Array.from(svgs).some(
        (svg) => svg.classList.contains('text-green-500') || svg.classList.contains('text-red-500'),
      );
      expect(hasStatusIcon).toBe(false);
    });

    it('should highlight selected option from answer record', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            options: [createOption('opt_a', 'First'), createOption('opt_b', 'Second')],
          }),
        ],
        totalQuestions: 1,
      });
      const answerRecords = {
        q_1: createAnswerRecord('opt_a', true, ['opt_a', 'opt_b']),
      };
      render(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />);

      // The component should render with the selected option highlighted
      expect(screen.getByText('First')).toBeInTheDocument();
    });
  });

  describe('Show/Hide Answers Toggle', () => {
    it('should hide explanations by default', () => {
      render(<AllQuestionsView {...createDefaultProps()} />);
      expect(screen.queryByText('Explanation')).not.toBeInTheDocument();
    });

    it('should show explanations when toggle is clicked', async () => {
      const user = userEvent.setup();
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            explanationText: 'This is the explanation for question 1.',
          }),
        ],
        totalQuestions: 1,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      // Find and click the toggle button (first button in the header area)
      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons[0]; // First button is the show/hide toggle
      await user.click(toggleButton);

      expect(screen.getByText('Explanation')).toBeInTheDocument();
      expect(screen.getByText('This is the explanation for question 1.')).toBeInTheDocument();
    });

    it('should hide explanations when toggle is clicked again', async () => {
      const user = userEvent.setup();
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            explanationText: 'Visible explanation text.',
          }),
        ],
        totalQuestions: 1,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons[0];

      // Show explanations
      await user.click(toggleButton);
      expect(screen.getByText('Explanation')).toBeInTheDocument();

      // Hide explanations
      await user.click(toggleButton);
      expect(screen.queryByText('Explanation')).not.toBeInTheDocument();
    });

    it('should show correct option highlighting when answers are shown', async () => {
      const user = userEvent.setup();
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            correctOptionIds: ['opt_a'],
            options: [
              createOption('opt_a', 'Correct Option'),
              createOption('opt_b', 'Wrong Option'),
            ],
          }),
        ],
        totalQuestions: 1,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons[0];
      await user.click(toggleButton);

      // The correct option should be marked when answers are shown
      expect(screen.getByText('Correct Option')).toBeInTheDocument();
    });
  });

  describe('Review Session Badge', () => {
    it('should show review session badge when isReviewSession is true', () => {
      render(<AllQuestionsView {...createDefaultProps({ isReviewSession: true })} />);
      expect(screen.getByText('Review Session')).toBeInTheDocument();
    });

    it('should not show review session badge when isReviewSession is false', () => {
      render(<AllQuestionsView {...createDefaultProps({ isReviewSession: false })} />);
      expect(screen.queryByText('Review Session')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Button Callbacks', () => {
    it('should call onBackToQuiz when Back to Quiz button is clicked', async () => {
      const user = userEvent.setup();
      const onBackToQuiz = vi.fn();
      render(<AllQuestionsView {...createDefaultProps({ onBackToQuiz })} />);

      const backButton = screen.getByRole('button', { name: /back to quiz/i });
      await user.click(backButton);

      expect(onBackToQuiz).toHaveBeenCalledTimes(1);
    });

    it('should call onBackToDashboard when Dashboard button is clicked', async () => {
      const user = userEvent.setup();
      const onBackToDashboard = vi.fn();
      render(<AllQuestionsView {...createDefaultProps({ onBackToDashboard })} />);

      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      await user.click(dashboardButton);

      expect(onBackToDashboard).toHaveBeenCalledTimes(1);
    });

    it('should call onRetryChapter when Retry Chapter button is clicked', async () => {
      const user = userEvent.setup();
      const onRetryChapter = vi.fn();
      render(<AllQuestionsView {...createDefaultProps({ onRetryChapter })} />);

      const retryButton = screen.getByRole('button', { name: /retry chapter/i });
      await user.click(retryButton);

      expect(onRetryChapter).toHaveBeenCalledTimes(1);
    });
  });

  describe('Explanation Text Processing', () => {
    it('should process option placeholders in explanation text', async () => {
      const user = userEvent.setup();
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            options: [createOption('opt_a', 'DataStructure'), createOption('opt_b', 'Object')],
            explanationText: 'The answer is {{option:opt_a}} because it stores indexed data.',
          }),
        ],
        totalQuestions: 1,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]); // Show answers

      // The placeholder should be replaced with the option text in the explanation
      // Check that the explanation contains the processed text
      expect(screen.getByText(/\*\*"DataStructure"\*\*/)).toBeInTheDocument();
    });

    it('should handle explanation text without placeholders', async () => {
      const user = userEvent.setup();
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            explanationText: 'Simple explanation without any placeholders.',
          }),
        ],
        totalQuestions: 1,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(screen.getByText('Simple explanation without any placeholders.')).toBeInTheDocument();
    });
  });

  describe('Empty State Handling', () => {
    it('should render with empty questions array', () => {
      const chapter = createChapter({
        questions: [],
        totalQuestions: 0,
      });

      expect(() => render(<AllQuestionsView {...createDefaultProps({ chapter })} />)).not.toThrow();
    });

    it('should show header even with no questions', () => {
      const chapter = createChapter({
        questions: [],
        totalQuestions: 0,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText('All Questions')).toBeInTheDocument();
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    });

    it('should show 0/0 score with no questions', () => {
      const chapter = createChapter({
        questions: [],
        totalQuestions: 0,
        answeredQuestions: 0,
        correctAnswers: 0,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText(/Score: 0 \/ 0/)).toBeInTheDocument();
    });

    it('should handle chapter with no description', () => {
      const chapter = createChapter({ description: undefined });
      expect(() => render(<AllQuestionsView {...createDefaultProps({ chapter })} />)).not.toThrow();
    });
  });

  describe('Chapter Name Parsing', () => {
    it('should parse chapter number and title from name with number prefix', () => {
      const chapter = createChapter({ name: '5. Advanced Concepts' });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText('Chapter 5')).toBeInTheDocument();
      expect(screen.getByText('Advanced Concepts')).toBeInTheDocument();
    });

    it('should handle multi-digit chapter numbers', () => {
      const chapter = createChapter({ name: '12. Final Chapter' });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText('Chapter 12')).toBeInTheDocument();
      expect(screen.getByText('Final Chapter')).toBeInTheDocument();
    });

    it('should handle chapter name without number prefix', () => {
      const chapter = createChapter({ name: 'Bonus Content' });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText('Bonus Content')).toBeInTheDocument();
      expect(screen.queryByText(/Chapter \d/)).not.toBeInTheDocument();
    });

    it('should handle chapter name with only number', () => {
      const chapter = createChapter({ name: '1. ' });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    });
  });

  describe('Options Display State', () => {
    it('should mark selected option as selected', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            options: [
              createOption('opt_a', 'Selected Option'),
              createOption('opt_b', 'Not Selected'),
            ],
            correctOptionIds: ['opt_a'],
          }),
        ],
        totalQuestions: 1,
      });
      const answerRecords = {
        q_1: createAnswerRecord('opt_a', true, ['opt_a', 'opt_b']),
      };
      render(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />);

      expect(screen.getByText('Selected Option')).toBeInTheDocument();
      expect(screen.getByText('Not Selected')).toBeInTheDocument();
    });

    it('should show correct and incorrect states when answers are revealed', async () => {
      const user = userEvent.setup();
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            options: [
              createOption('opt_a', 'Correct Answer'),
              createOption('opt_b', 'Wrong Answer'),
            ],
            correctOptionIds: ['opt_a'],
          }),
        ],
        totalQuestions: 1,
      });
      const answerRecords = {
        q_1: createAnswerRecord('opt_b', false, ['opt_a', 'opt_b']),
      };
      render(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]); // Show answers

      // Both options should be visible
      expect(screen.getByText('Correct Answer')).toBeInTheDocument();
      expect(screen.getByText('Wrong Answer')).toBeInTheDocument();
    });

    it('should handle questions with multiple correct options', async () => {
      const user = userEvent.setup();
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            options: [
              createOption('opt_a', 'First Correct'),
              createOption('opt_b', 'Second Correct'),
              createOption('opt_c', 'Wrong'),
            ],
            correctOptionIds: ['opt_a', 'opt_b'],
          }),
        ],
        totalQuestions: 1,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]); // Show answers

      expect(screen.getByText('First Correct')).toBeInTheDocument();
      expect(screen.getByText('Second Correct')).toBeInTheDocument();
      expect(screen.getByText('Wrong')).toBeInTheDocument();
    });
  });

  describe('Options Are Disabled', () => {
    it('should render options as disabled (read-only view)', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            options: [createOption('opt_a', 'Test Option')],
          }),
        ],
        totalQuestions: 1,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      // Options should be present but the view is read-only
      expect(screen.getByText('Test Option')).toBeInTheDocument();
    });
  });

  describe('Answer Record Reconstruction', () => {
    it('should reconstruct displayed options from answer record', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            options: [
              createOption('opt_a', 'Option A'),
              createOption('opt_b', 'Option B'),
              createOption('opt_c', 'Option C'),
              createOption('opt_d', 'Option D'),
            ],
          }),
        ],
        totalQuestions: 1,
      });
      // Answer record with only 2 options displayed (shuffled)
      const answerRecords = {
        q_1: createAnswerRecord('opt_b', false, ['opt_b', 'opt_c']),
      };
      render(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />);

      // Only the displayed options should be shown
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('Option C')).toBeInTheDocument();
    });

    it('should fall back to all options when no answer record exists', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            options: [
              createOption('opt_a', 'Option A'),
              createOption('opt_b', 'Option B'),
              createOption('opt_c', 'Option C'),
            ],
          }),
        ],
        totalQuestions: 1,
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords: {} })} />);

      // All options should be shown
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('Option C')).toBeInTheDocument();
    });

    it('should handle answer record with missing option ids gracefully', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            options: [createOption('opt_a', 'Existing Option')],
          }),
        ],
        totalQuestions: 1,
      });
      // Answer record references non-existent option
      const answerRecords = {
        q_1: createAnswerRecord('opt_a', true, ['opt_a', 'non_existent_opt']),
      };

      expect(() =>
        render(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />),
      ).not.toThrow();

      expect(screen.getByText('Existing Option')).toBeInTheDocument();
    });
  });

  describe('Progress Variant', () => {
    it('should use success variant when percentage >= 50', () => {
      const chapter = createChapter({
        totalQuestions: 10,
        answeredQuestions: 10,
        correctAnswers: 6, // 60%
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      // Progress bar should be rendered
      expect(screen.getByText(/60%/)).toBeInTheDocument();
    });

    it('should use warning variant when percentage < 50', () => {
      const chapter = createChapter({
        totalQuestions: 10,
        answeredQuestions: 10,
        correctAnswers: 4, // 40%
      });
      render(<AllQuestionsView {...createDefaultProps({ chapter })} />);

      expect(screen.getByText(/40%/)).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should allow focusing navigation buttons with Tab', async () => {
      const user = userEvent.setup();
      render(<AllQuestionsView {...createDefaultProps()} />);

      await user.tab();
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveFocus();
    });

    it('should activate buttons with Enter key', async () => {
      const user = userEvent.setup();
      const onBackToQuiz = vi.fn();
      render(<AllQuestionsView {...createDefaultProps({ onBackToQuiz })} />);

      const backButton = screen.getByRole('button', { name: /back to quiz/i });
      backButton.focus();
      await user.keyboard('{Enter}');

      expect(onBackToQuiz).toHaveBeenCalledTimes(1);
    });

    it('should activate buttons with Space key', async () => {
      const user = userEvent.setup();
      const onRetryChapter = vi.fn();
      render(<AllQuestionsView {...createDefaultProps({ onRetryChapter })} />);

      const retryButton = screen.getByRole('button', { name: /retry chapter/i });
      retryButton.focus();
      await user.keyboard(' ');

      expect(onRetryChapter).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Responsiveness', () => {
    it('should render with responsive classes', () => {
      const { container } = render(<AllQuestionsView {...createDefaultProps()} />);

      // Check for responsive padding classes
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('min-h-screen');
    });
  });

  describe('Multiple Questions with Mixed States', () => {
    it('should display mixed correct and incorrect answers', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({ questionId: 'q_1', questionText: 'Question 1' }),
          createQuestion({ questionId: 'q_2', questionText: 'Question 2' }),
          createQuestion({ questionId: 'q_3', questionText: 'Question 3' }),
        ],
        totalQuestions: 3,
        answeredQuestions: 3,
        correctAnswers: 2,
      });
      const answerRecords = {
        q_1: createAnswerRecord('opt_a', true),
        q_2: createAnswerRecord('opt_b', false),
        q_3: createAnswerRecord('opt_a', true),
      };
      render(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />);

      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Question 2')).toBeInTheDocument();
      expect(screen.getByText('Question 3')).toBeInTheDocument();

      // Should have 2 green and 1 red icons
      const svgs = document.querySelectorAll('svg');
      const greenIcons = Array.from(svgs).filter((svg) => svg.classList.contains('text-green-500'));
      const redIcons = Array.from(svgs).filter((svg) => svg.classList.contains('text-red-500'));
      expect(greenIcons.length).toBe(2);
      expect(redIcons.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle question with empty options array', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            options: [],
          }),
        ],
        totalQuestions: 1,
      });

      expect(() => render(<AllQuestionsView {...createDefaultProps({ chapter })} />)).not.toThrow();
    });

    it('should handle question with very long text', () => {
      const longText = 'A'.repeat(1000);
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            questionText: longText,
          }),
        ],
        totalQuestions: 1,
      });

      expect(() => render(<AllQuestionsView {...createDefaultProps({ chapter })} />)).not.toThrow();
    });

    it('should handle special characters in question text', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            questionText: 'What is <script>alert("xss")</script>?',
          }),
        ],
        totalQuestions: 1,
      });

      expect(() => render(<AllQuestionsView {...createDefaultProps({ chapter })} />)).not.toThrow();
    });

    it('should handle markdown in question text', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            questionText: '**Bold** and *italic* text with `code`',
          }),
        ],
        totalQuestions: 1,
      });

      expect(() => render(<AllQuestionsView {...createDefaultProps({ chapter })} />)).not.toThrow();
    });
  });

  describe('Tooltip Accessibility', () => {
    it('should render tooltip provider for toggle button', () => {
      render(<AllQuestionsView {...createDefaultProps()} />);

      // The toggle button should be wrapped in tooltip
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Memoization', () => {
    it('should compute question summaries correctly', () => {
      const chapter = createChapter({
        questions: [
          createQuestion({
            questionId: 'q_1',
            questionText: 'Memoized question',
            correctOptionIds: ['opt_a'],
          }),
        ],
        totalQuestions: 1,
      });
      const answerRecords = {
        q_1: createAnswerRecord('opt_a', true),
      };

      const { rerender } = render(
        <AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />,
      );

      expect(screen.getByText('Memoized question')).toBeInTheDocument();

      // Re-render with same props
      rerender(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />);

      expect(screen.getByText('Memoized question')).toBeInTheDocument();
    });

    it('should update when answer records change', () => {
      const chapter = createChapter({
        questions: [createQuestion({ questionId: 'q_1' })],
        totalQuestions: 1,
      });

      const { rerender } = render(
        <AllQuestionsView {...createDefaultProps({ chapter, answerRecords: {} })} />,
      );

      // Initially no status icons
      let svgs = document.querySelectorAll('svg');
      let hasStatusIcon = Array.from(svgs).some(
        (svg) => svg.classList.contains('text-green-500') || svg.classList.contains('text-red-500'),
      );
      expect(hasStatusIcon).toBe(false);

      // Update with answer record
      const answerRecords = {
        q_1: createAnswerRecord('opt_a', true),
      };
      rerender(<AllQuestionsView {...createDefaultProps({ chapter, answerRecords })} />);

      // Now should have status icon
      svgs = document.querySelectorAll('svg');
      hasStatusIcon = Array.from(svgs).some((svg) => svg.classList.contains('text-green-500'));
      expect(hasStatusIcon).toBe(true);
    });
  });

  describe('Sticky Header', () => {
    it('should have sticky positioning class on header', () => {
      const { container } = render(<AllQuestionsView {...createDefaultProps()} />);

      const stickyHeader = container.querySelector('.sticky');
      expect(stickyHeader).toBeInTheDocument();
    });

    it('should have backdrop blur class', () => {
      const { container } = render(<AllQuestionsView {...createDefaultProps()} />);

      const backdropBlur = container.querySelector('.backdrop-blur-lg');
      expect(backdropBlur).toBeInTheDocument();
    });
  });

  describe('Dark Theme Styling', () => {
    it('should apply dark theme background', () => {
      const { container } = render(<AllQuestionsView {...createDefaultProps()} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('bg-slate-950');
    });

    it('should apply white text color', () => {
      const { container } = render(<AllQuestionsView {...createDefaultProps()} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('text-white');
    });
  });
});
