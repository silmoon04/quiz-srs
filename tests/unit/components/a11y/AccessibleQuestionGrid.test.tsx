import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibleQuestionGrid } from '@/components/a11y/AccessibleQuestionGrid';
import type { QuizQuestion, SessionHistoryEntry, DisplayedOption } from '@/types/quiz-types';

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

// Helper to create session history entry
const createHistoryEntry = (
  question: QuizQuestion,
  selectedOptionId: string,
  isCorrect: boolean,
  chapterId: string = 'chapter-1',
): SessionHistoryEntry => ({
  questionSnapshot: { ...question },
  selectedOptionId,
  displayedOptions: question.options.map((opt) => ({
    ...opt,
    isCorrect: question.correctOptionIds.includes(opt.optionId),
    isSelected: opt.optionId === selectedOptionId,
  })) as DisplayedOption[],
  isCorrect,
  isReviewSessionQuestion: false,
  chapterId,
});

// Create default questions for testing
const createDefaultQuestions = (): QuizQuestion[] => [
  createQuestion('q-1', 'Question 1'),
  createQuestion('q-2', 'Question 2'),
  createQuestion('q-3', 'Question 3'),
  createQuestion('q-4', 'Question 4'),
];

// Default props factory
const createDefaultProps = (
  overrides: Partial<{
    questions: QuizQuestion[];
    currentQuestionIndex: number;
    sessionHistory: SessionHistoryEntry[];
    currentHistoryViewIndex: number | null;
    onNavigateToQuestion: (questionIndex: number) => void;
    isReviewSession: boolean;
  }> = {},
) => ({
  questions: createDefaultQuestions(),
  currentQuestionIndex: 0,
  sessionHistory: [],
  currentHistoryViewIndex: null,
  onNavigateToQuestion: vi.fn(),
  isReviewSession: false,
  ...overrides,
});

describe('AccessibleQuestionGrid Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to get gridcell buttons (they have role="gridcell" which overrides button role)
  const getGridButtons = () => screen.getAllByRole('gridcell');

  describe('Grid rendering with questions', () => {
    it('should render all question buttons', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      expect(screen.getByRole('gridcell', { name: /question 1/i })).toBeInTheDocument();
      expect(screen.getByRole('gridcell', { name: /question 2/i })).toBeInTheDocument();
      expect(screen.getByRole('gridcell', { name: /question 3/i })).toBeInTheDocument();
      expect(screen.getByRole('gridcell', { name: /question 4/i })).toBeInTheDocument();
    });

    it('should render question numbers in buttons', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveTextContent('1');
      expect(buttons[1]).toHaveTextContent('2');
      expect(buttons[2]).toHaveTextContent('3');
      expect(buttons[3]).toHaveTextContent('4');
    });

    it('should render with single question', () => {
      const singleQuestion = [createQuestion('single-q')];
      render(<AccessibleQuestionGrid {...createDefaultProps({ questions: singleQuestion })} />);

      const buttons = getGridButtons();
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent('1');
    });

    it('should render with many questions', () => {
      const manyQuestions = Array.from({ length: 20 }, (_, i) =>
        createQuestion(`q-${i + 1}`, `Question ${i + 1}`),
      );
      render(<AccessibleQuestionGrid {...createDefaultProps({ questions: manyQuestions })} />);

      const buttons = getGridButtons();
      expect(buttons).toHaveLength(20);
    });

    it('should not render when isReviewSession is true', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps({ isReviewSession: true })} />);

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(screen.queryByRole('gridcell')).not.toBeInTheDocument();
    });

    it('should render correctly with empty questions array', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps({ questions: [] })} />);

      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('ARIA grid role and attributes', () => {
    it('should have grid role on container', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });

    it('should have aria-label on grid', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', 'Question navigation');
    });

    it('should have gridcell role on each button', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const gridcells = screen.getAllByRole('gridcell');
      expect(gridcells).toHaveLength(4);
    });

    it('should have aria-label on each button describing the question', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('aria-label', 'Navigate to question 1');
      expect(buttons[1]).toHaveAttribute('aria-label', 'Navigate to question 2');
      expect(buttons[2]).toHaveAttribute('aria-label', 'Navigate to question 3');
      expect(buttons[3]).toHaveAttribute('aria-label', 'Navigate to question 4');
    });

    it('should have aria-describedby referencing question status', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('aria-describedby', 'question-status-0');
      expect(buttons[1]).toHaveAttribute('aria-describedby', 'question-status-1');
      expect(buttons[2]).toHaveAttribute('aria-describedby', 'question-status-2');
      expect(buttons[3]).toHaveAttribute('aria-describedby', 'question-status-3');
    });

    it('should have correct tabIndex for roving focus - first button focused by default', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 0 })} />);

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('tabIndex', '0');
      expect(buttons[1]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[2]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[3]).toHaveAttribute('tabIndex', '-1');
    });

    it('should set tabIndex=0 on current question button', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 2 })} />);

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[1]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[2]).toHaveAttribute('tabIndex', '0');
      expect(buttons[3]).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Keyboard navigation (arrow keys)', () => {
    it('should navigate to next button with ArrowRight', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      await user.keyboard('{ArrowRight}');

      expect(buttons[1]).toHaveFocus();
    });

    it('should navigate to previous button with ArrowLeft', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 2 })} />);

      const buttons = getGridButtons();
      buttons[2].focus();

      await user.keyboard('{ArrowLeft}');

      expect(buttons[1]).toHaveFocus();
    });

    it('should wrap from last to first with ArrowRight', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 3 })} />);

      const buttons = getGridButtons();
      buttons[3].focus();

      await user.keyboard('{ArrowRight}');

      expect(buttons[0]).toHaveFocus();
    });

    it('should wrap from first to last with ArrowLeft', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      await user.keyboard('{ArrowLeft}');

      expect(buttons[3]).toHaveFocus();
    });

    it('should navigate to first button with Home key', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 2 })} />);

      const buttons = getGridButtons();
      buttons[2].focus();

      await user.keyboard('{Home}');

      expect(buttons[0]).toHaveFocus();
    });

    it('should navigate to last button with End key', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      await user.keyboard('{End}');

      expect(buttons[3]).toHaveFocus();
    });

    it('should handle multiple consecutive arrow key presses', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');

      expect(buttons[3]).toHaveFocus();
    });

    it('should handle mixed arrow key navigation', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowLeft}');

      expect(buttons[1]).toHaveFocus();
    });

    it('should update tabIndex after keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      await user.keyboard('{ArrowRight}');

      expect(buttons[0]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[1]).toHaveAttribute('tabIndex', '0');
    });

    it('should not respond to keyboard when isReviewSession is true', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps({ isReviewSession: true })} />);

      // Component returns null for review sessions
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
  });

  describe('Selection handling', () => {
    it('should call onNavigateToQuestion when button is clicked', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      render(<AccessibleQuestionGrid {...createDefaultProps({ onNavigateToQuestion })} />);

      await user.click(getGridButtons()[2]);

      expect(onNavigateToQuestion).toHaveBeenCalledWith(2);
    });

    it('should call onNavigateToQuestion with Enter key', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      render(<AccessibleQuestionGrid {...createDefaultProps({ onNavigateToQuestion })} />);

      const buttons = getGridButtons();
      buttons[1].focus();

      await user.keyboard('{Enter}');

      expect(onNavigateToQuestion).toHaveBeenCalledWith(1);
    });

    it('should call onNavigateToQuestion with Space key', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      render(<AccessibleQuestionGrid {...createDefaultProps({ onNavigateToQuestion })} />);

      const buttons = getGridButtons();
      buttons[2].focus();

      await user.keyboard(' ');

      expect(onNavigateToQuestion).toHaveBeenCalledWith(2);
    });

    it('should navigate then select with keyboard', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      render(<AccessibleQuestionGrid {...createDefaultProps({ onNavigateToQuestion })} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');

      expect(onNavigateToQuestion).toHaveBeenCalledWith(2);
    });

    it('should call onNavigateToQuestion for each button click', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      render(<AccessibleQuestionGrid {...createDefaultProps({ onNavigateToQuestion })} />);

      const buttons = getGridButtons();

      await user.click(buttons[0]);
      expect(onNavigateToQuestion).toHaveBeenCalledWith(0);

      await user.click(buttons[1]);
      expect(onNavigateToQuestion).toHaveBeenCalledWith(1);

      await user.click(buttons[3]);
      expect(onNavigateToQuestion).toHaveBeenCalledWith(3);

      expect(onNavigateToQuestion).toHaveBeenCalledTimes(3);
    });
  });

  describe('Focus management', () => {
    it('should focus current question button on mount', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 1 })} />);

      const buttons = getGridButtons();
      expect(buttons[1]).toHaveAttribute('tabIndex', '0');
    });

    it('should update focused index when focus changes via click', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();

      // Focus third button
      await user.click(buttons[2]);

      expect(buttons[2]).toHaveAttribute('tabIndex', '0');
    });

    it('should update tabIndex when button receives focus', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();

      // Tab to focus grid, then use arrow to navigate
      buttons[0].focus();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');

      expect(buttons[0]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[1]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[2]).toHaveAttribute('tabIndex', '0');
    });

    it('should maintain roving tabindex pattern', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      // Initially first has tabIndex 0
      expect(buttons[0]).toHaveAttribute('tabIndex', '0');
      expect(buttons[1]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[2]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[3]).toHaveAttribute('tabIndex', '-1');

      // Navigate to third button
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');

      // Now third has tabIndex 0
      expect(buttons[0]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[1]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[2]).toHaveAttribute('tabIndex', '0');
      expect(buttons[3]).toHaveAttribute('tabIndex', '-1');
    });

    it('should sync focused index with currentQuestionIndex on update', () => {
      const { rerender } = render(
        <AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 0 })} />,
      );

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('tabIndex', '0');

      rerender(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 2 })} />);

      expect(buttons[0]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[2]).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Question status styling and titles', () => {
    it('should show current-live status for unanswered current question', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 0 })} />);

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Current)');
    });

    it('should show unanswered status for non-current unanswered questions', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 0 })} />);

      const buttons = getGridButtons();
      expect(buttons[1]).toHaveAttribute('title', 'Question 2 (Unanswered)');
      expect(buttons[2]).toHaveAttribute('title', 'Question 3 (Unanswered)');
      expect(buttons[3]).toHaveAttribute('title', 'Question 4 (Unanswered)');
    });

    it('should show correct status for answered correct questions', () => {
      const questions = createDefaultQuestions();
      const sessionHistory = [createHistoryEntry(questions[0], 'opt-a', true)];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentQuestionIndex: 1,
          })}
        />,
      );

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Correct)');
    });

    it('should show incorrect status for answered incorrect questions', () => {
      const questions = createDefaultQuestions();
      const sessionHistory = [createHistoryEntry(questions[0], 'opt-b', false)];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentQuestionIndex: 1,
          })}
        />,
      );

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Incorrect)');
    });

    it('should show viewing status when viewing historical correct answer', () => {
      const questions = createDefaultQuestions();
      const sessionHistory = [createHistoryEntry(questions[0], 'opt-a', true)];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentHistoryViewIndex: 0,
            currentQuestionIndex: 1,
          })}
        />,
      );

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Viewing - Correct)');
    });

    it('should show viewing status when viewing historical incorrect answer', () => {
      const questions = createDefaultQuestions();
      const sessionHistory = [createHistoryEntry(questions[0], 'opt-b', false)];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentHistoryViewIndex: 0,
            currentQuestionIndex: 1,
          })}
        />,
      );

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Viewing - Incorrect)');
    });

    it('should show mixed statuses for multiple questions with different states', () => {
      const questions = createDefaultQuestions();
      const sessionHistory = [
        createHistoryEntry(questions[0], 'opt-a', true),
        createHistoryEntry(questions[1], 'opt-b', false),
      ];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentQuestionIndex: 2,
          })}
        />,
      );

      const buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Correct)');
      expect(buttons[1]).toHaveAttribute('title', 'Question 2 (Incorrect)');
      expect(buttons[2]).toHaveAttribute('title', 'Question 3 (Current)');
      expect(buttons[3]).toHaveAttribute('title', 'Question 4 (Unanswered)');
    });
  });

  describe('CSS classes and styling', () => {
    it('should have correct base classes on buttons', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons.forEach((button) => {
        expect(button).toHaveClass('rounded-md');
        expect(button).toHaveClass('border-2');
        expect(button).toHaveClass('font-medium');
        expect(button).toHaveClass('text-white');
      });
    });

    it('should have focus ring classes on buttons', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons.forEach((button) => {
        expect(button).toHaveClass('focus:outline-none');
        expect(button).toHaveClass('focus:ring-2');
        expect(button).toHaveClass('focus:ring-blue-500');
        expect(button).toHaveClass('focus:ring-offset-2');
      });
    });

    it('should have transition classes on buttons', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons.forEach((button) => {
        expect(button).toHaveClass('transition-all');
        expect(button).toHaveClass('duration-200');
      });
    });

    it('should apply correct gradient classes for current live question', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 0 })} />);

      const button = getGridButtons()[0];
      expect(button.className).toContain('from-blue-900');
      expect(button.className).toContain('to-blue-800');
      expect(button.className).toContain('border-blue-600');
    });

    it('should apply correct gradient classes for unanswered questions', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 0 })} />);

      const button = getGridButtons()[1];
      expect(button.className).toContain('from-slate-800');
      expect(button.className).toContain('to-gray-800');
      expect(button.className).toContain('border-gray-600');
    });

    it('should apply correct gradient classes for correct answered questions', () => {
      const questions = createDefaultQuestions();
      const sessionHistory = [createHistoryEntry(questions[0], 'opt-a', true)];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentQuestionIndex: 1,
          })}
        />,
      );

      const button = getGridButtons()[0];
      expect(button.className).toContain('from-green-950');
      expect(button.className).toContain('to-green-900');
      expect(button.className).toContain('border-green-700');
    });

    it('should apply correct gradient classes for incorrect answered questions', () => {
      const questions = createDefaultQuestions();
      const sessionHistory = [createHistoryEntry(questions[0], 'opt-b', false)];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentQuestionIndex: 1,
          })}
        />,
      );

      const button = getGridButtons()[0];
      expect(button.className).toContain('from-red-950');
      expect(button.className).toContain('to-red-900');
      expect(button.className).toContain('border-red-700');
    });
  });

  describe('Props updates handling', () => {
    it('should update when questions array changes', () => {
      const { rerender } = render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      expect(getGridButtons()).toHaveLength(4);

      const newQuestions = [createQuestion('new-1'), createQuestion('new-2')];
      rerender(<AccessibleQuestionGrid {...createDefaultProps({ questions: newQuestions })} />);

      expect(getGridButtons()).toHaveLength(2);
    });

    it('should update when currentQuestionIndex changes', () => {
      const { rerender } = render(
        <AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 0 })} />,
      );

      let buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Current)');

      rerender(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 2 })} />);

      buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Unanswered)');
      expect(buttons[2]).toHaveAttribute('title', 'Question 3 (Current)');
    });

    it('should update when sessionHistory changes', () => {
      const questions = createDefaultQuestions();
      const { rerender } = render(
        <AccessibleQuestionGrid {...createDefaultProps({ questions, currentQuestionIndex: 1 })} />,
      );

      let buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Unanswered)');

      const sessionHistory = [createHistoryEntry(questions[0], 'opt-a', true)];
      rerender(
        <AccessibleQuestionGrid
          {...createDefaultProps({ questions, sessionHistory, currentQuestionIndex: 1 })}
        />,
      );

      buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Correct)');
    });

    it('should update when currentHistoryViewIndex changes', () => {
      const questions = createDefaultQuestions();
      const sessionHistory = [createHistoryEntry(questions[0], 'opt-a', true)];

      const { rerender } = render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentHistoryViewIndex: null,
            currentQuestionIndex: 1,
          })}
        />,
      );

      let buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Correct)');

      rerender(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentHistoryViewIndex: 0,
            currentQuestionIndex: 1,
          })}
        />,
      );

      buttons = getGridButtons();
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Viewing - Correct)');
    });

    it('should handle transition from normal mode to review session', () => {
      const { rerender } = render(
        <AccessibleQuestionGrid {...createDefaultProps({ isReviewSession: false })} />,
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();

      rerender(<AccessibleQuestionGrid {...createDefaultProps({ isReviewSession: true })} />);

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle question with no matching history entry', () => {
      const questions = createDefaultQuestions();
      const differentQuestion = createQuestion('different-q');
      const sessionHistory = [createHistoryEntry(differentQuestion, 'opt-a', true)];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentQuestionIndex: 0,
          })}
        />,
      );

      const buttons = getGridButtons();
      // All should show normal statuses since history entry doesn't match
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Current)');
      expect(buttons[1]).toHaveAttribute('title', 'Question 2 (Unanswered)');
    });

    it('should handle rapid navigation key presses', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      render(<AccessibleQuestionGrid {...createDefaultProps({ onNavigateToQuestion })} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      // Rapid navigation
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');

      expect(onNavigateToQuestion).toHaveBeenCalledWith(3);
    });

    it('should handle Home key when already at first position', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      await user.keyboard('{Home}');

      expect(buttons[0]).toHaveFocus();
    });

    it('should handle End key when already at last position', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps({ currentQuestionIndex: 3 })} />);

      const buttons = getGridButtons();
      buttons[3].focus();

      await user.keyboard('{End}');

      expect(buttons[3]).toHaveFocus();
    });

    it('should handle session history with multiple entries for same question', () => {
      const questions = createDefaultQuestions();
      // Multiple history entries - component uses find() so first match wins
      const sessionHistory = [
        createHistoryEntry(questions[0], 'opt-b', false),
        createHistoryEntry(questions[0], 'opt-a', true),
      ];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentQuestionIndex: 1,
          })}
        />,
      );

      const buttons = getGridButtons();
      // First match in history (incorrect) should be used
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Incorrect)');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete navigation flow', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      const questions = createDefaultQuestions();
      const sessionHistory = [
        createHistoryEntry(questions[0], 'opt-a', true),
        createHistoryEntry(questions[1], 'opt-b', false),
      ];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            onNavigateToQuestion,
            currentQuestionIndex: 2,
          })}
        />,
      );

      const buttons = getGridButtons();

      // Verify initial state
      expect(buttons[0]).toHaveAttribute('title', 'Question 1 (Correct)');
      expect(buttons[1]).toHaveAttribute('title', 'Question 2 (Incorrect)');
      expect(buttons[2]).toHaveAttribute('title', 'Question 3 (Current)');
      expect(buttons[3]).toHaveAttribute('title', 'Question 4 (Unanswered)');

      // Focus and navigate
      buttons[2].focus();
      await user.keyboard('{ArrowLeft}');
      expect(buttons[1]).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onNavigateToQuestion).toHaveBeenCalledWith(1);
    });

    it('should handle clicking through all questions', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();

      render(<AccessibleQuestionGrid {...createDefaultProps({ onNavigateToQuestion })} />);

      const buttons = getGridButtons();

      for (let i = 0; i < buttons.length; i++) {
        await user.click(buttons[i]);
        expect(onNavigateToQuestion).toHaveBeenCalledWith(i);
      }

      expect(onNavigateToQuestion).toHaveBeenCalledTimes(4);
    });

    it('should maintain accessibility after multiple interactions', async () => {
      const user = userEvent.setup();
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons[0].focus();

      // Multiple navigation operations
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{End}');
      await user.keyboard('{Home}');
      await user.keyboard('{ArrowLeft}');

      // Grid should still be accessible
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', 'Question navigation');

      // All buttons should still have proper roles
      const gridcells = screen.getAllByRole('gridcell');
      expect(gridcells).toHaveLength(4);
    });
  });

  describe('Screen reader support', () => {
    it('should have descriptive aria-label on grid for screen readers', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', 'Question navigation');
    });

    it('should have aria-label on each button for screen readers', () => {
      render(<AccessibleQuestionGrid {...createDefaultProps()} />);

      const buttons = getGridButtons();
      buttons.forEach((button, index) => {
        expect(button).toHaveAttribute('aria-label', `Navigate to question ${index + 1}`);
      });
    });

    it('should have title attribute providing status context', () => {
      const questions = createDefaultQuestions();
      const sessionHistory = [
        createHistoryEntry(questions[0], 'opt-a', true),
        createHistoryEntry(questions[1], 'opt-b', false),
      ];

      render(
        <AccessibleQuestionGrid
          {...createDefaultProps({
            questions,
            sessionHistory,
            currentQuestionIndex: 2,
          })}
        />,
      );

      const buttons = getGridButtons();
      expect(buttons[0].getAttribute('title')).toContain('Correct');
      expect(buttons[1].getAttribute('title')).toContain('Incorrect');
      expect(buttons[2].getAttribute('title')).toContain('Current');
      expect(buttons[3].getAttribute('title')).toContain('Unanswered');
    });
  });
});
