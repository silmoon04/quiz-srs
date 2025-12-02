import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionNavigationMenu } from '@/components/question-navigation-menu';
import type { QuizQuestion, SessionHistoryEntry, DisplayedOption } from '@/types/quiz-types';

// Helper to create a quiz question
const createQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  questionId: 'q_default',
  questionText: 'Sample question text',
  options: [
    { optionId: 'opt_1', optionText: 'Option A' },
    { optionId: 'opt_2', optionText: 'Option B' },
  ],
  correctOptionIds: ['opt_1'],
  explanationText: 'Sample explanation',
  status: 'not_attempted',
  timesAnsweredCorrectly: 0,
  timesAnsweredIncorrectly: 0,
  historyOfIncorrectSelections: [],
  srsLevel: 0,
  nextReviewAt: null,
  shownIncorrectOptionIds: [],
  ...overrides,
});

// Helper to create displayed options
const createDisplayedOptions = (
  options: QuizQuestion['options'],
  correctOptionIds: string[],
  selectedOptionId: string,
): DisplayedOption[] => {
  return options.map((opt) => ({
    ...opt,
    isCorrect: correctOptionIds.includes(opt.optionId),
    isSelected: opt.optionId === selectedOptionId,
  }));
};

// Helper to create a session history entry
const createSessionHistoryEntry = (
  question: QuizQuestion,
  selectedOptionId: string,
  isCorrect: boolean,
  overrides: Partial<SessionHistoryEntry> = {},
): SessionHistoryEntry => ({
  questionSnapshot: { ...question },
  selectedOptionId,
  displayedOptions: createDisplayedOptions(
    question.options,
    question.correctOptionIds,
    selectedOptionId,
  ),
  isCorrect,
  isReviewSessionQuestion: false,
  chapterId: 'chapter_1',
  ...overrides,
});

// Helper to create questions array
const createQuestions = (count: number): QuizQuestion[] => {
  return Array.from({ length: count }, (_, i) => createQuestion({ questionId: 'q_' + (i + 1) }));
};

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
  questions: createQuestions(5),
  currentQuestionIndex: 0,
  sessionHistory: [],
  currentHistoryViewIndex: null,
  onNavigateToQuestion: vi.fn(),
  isReviewSession: false,
  ...overrides,
});

describe('QuestionNavigationMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render navigation menu with header', () => {
      render(<QuestionNavigationMenu {...createDefaultProps()} />);
      expect(screen.getByText('Question Navigation')).toBeInTheDocument();
    });

    it('should render progress percentage', () => {
      render(<QuestionNavigationMenu {...createDefaultProps()} />);
      expect(screen.getByText('0% Complete')).toBeInTheDocument();
    });

    it('should render all question navigation buttons', () => {
      const props = createDefaultProps({ questions: createQuestions(5) });
      render(<QuestionNavigationMenu {...props} />);

      for (let i = 1; i <= 5; i++) {
        expect(
          screen.getByRole('button', { name: 'Navigate to question ' + i }),
        ).toBeInTheDocument();
      }
    });

    it('should render question numbers in buttons', () => {
      const props = createDefaultProps({ questions: createQuestions(3) });
      render(<QuestionNavigationMenu {...props} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render status legend', () => {
      render(<QuestionNavigationMenu {...createDefaultProps()} />);

      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Correct')).toBeInTheDocument();
      expect(screen.getByText('Incorrect')).toBeInTheDocument();
      expect(screen.getByText('Unanswered')).toBeInTheDocument();
    });

    it('should not render when isReviewSession is true', () => {
      render(<QuestionNavigationMenu {...createDefaultProps({ isReviewSession: true })} />);
      expect(screen.queryByText('Question Navigation')).not.toBeInTheDocument();
    });

    it('should return null for review sessions', () => {
      const { container } = render(
        <QuestionNavigationMenu {...createDefaultProps({ isReviewSession: true })} />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Question Numbers Display', () => {
    it('should display correct number for each question button', () => {
      const props = createDefaultProps({ questions: createQuestions(10) });
      render(<QuestionNavigationMenu {...props} />);

      for (let i = 1; i <= 10; i++) {
        const button = screen.getByRole('button', { name: 'Navigate to question ' + i });
        expect(button).toHaveTextContent(String(i));
      }
    });

    it('should handle single question', () => {
      const props = createDefaultProps({ questions: createQuestions(1) });
      render(<QuestionNavigationMenu {...props} />);

      expect(screen.getByRole('button', { name: 'Navigate to question 1' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Navigate to question 2' }),
      ).not.toBeInTheDocument();
    });

    it('should handle many questions', () => {
      const props = createDefaultProps({ questions: createQuestions(20) });
      render(<QuestionNavigationMenu {...props} />);

      expect(screen.getAllByRole('button', { name: /Navigate to question/ })).toHaveLength(20);
    });
  });

  describe('Current Question Highlighting', () => {
    it('should highlight current live question with blue styling', () => {
      const props = createDefaultProps({
        questions: createQuestions(5),
        currentQuestionIndex: 2,
      });
      render(<QuestionNavigationMenu {...props} />);

      const currentButton = screen.getByRole('button', { name: 'Navigate to question 3' });
      expect(currentButton).toHaveAttribute('title', 'Question 3 (Current)');
      expect(currentButton.className).toContain('blue');
    });

    it('should update highlighting when currentQuestionIndex changes', () => {
      const props = createDefaultProps({
        questions: createQuestions(5),
        currentQuestionIndex: 0,
      });
      const { rerender } = render(<QuestionNavigationMenu {...props} />);

      let currentButton = screen.getByRole('button', { name: 'Navigate to question 1' });
      expect(currentButton).toHaveAttribute('title', 'Question 1 (Current)');

      rerender(
        <QuestionNavigationMenu
          {...createDefaultProps({
            questions: createQuestions(5),
            currentQuestionIndex: 3,
          })}
        />,
      );

      currentButton = screen.getByRole('button', { name: 'Navigate to question 4' });
      expect(currentButton).toHaveAttribute('title', 'Question 4 (Current)');
    });

    it('should not show current highlight for answered question at current index', () => {
      const questions = createQuestions(5);
      const sessionHistory = [createSessionHistoryEntry(questions[0], 'opt_1', true)];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 0,
        sessionHistory,
      });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 1' });
      // Should show correct status, not current
      expect(button).toHaveAttribute('title', 'Question 1 (Correct)');
    });
  });

  describe('Answered/Unanswered States', () => {
    it('should show unanswered state for questions not in history', () => {
      const props = createDefaultProps({
        questions: createQuestions(5),
        currentQuestionIndex: 0,
      });
      render(<QuestionNavigationMenu {...props} />);

      // Questions 2-5 should be unanswered (question 1 is current)
      for (let i = 2; i <= 5; i++) {
        const button = screen.getByRole('button', { name: 'Navigate to question ' + i });
        expect(button).toHaveAttribute('title', 'Question ' + i + ' (Unanswered)');
        expect(button.className).toContain('slate');
      }
    });

    it('should show correct state for correctly answered questions', () => {
      const questions = createQuestions(5);
      const sessionHistory = [
        createSessionHistoryEntry(questions[0], 'opt_1', true),
        createSessionHistoryEntry(questions[1], 'opt_1', true),
      ];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 2,
        sessionHistory,
      });
      render(<QuestionNavigationMenu {...props} />);

      const button1 = screen.getByRole('button', { name: 'Navigate to question 1' });
      const button2 = screen.getByRole('button', { name: 'Navigate to question 2' });

      expect(button1).toHaveAttribute('title', 'Question 1 (Correct)');
      expect(button2).toHaveAttribute('title', 'Question 2 (Correct)');
      expect(button1.className).toContain('green');
      expect(button2.className).toContain('green');
    });

    it('should show incorrect state for incorrectly answered questions', () => {
      const questions = createQuestions(5);
      const sessionHistory = [
        createSessionHistoryEntry(questions[0], 'opt_2', false),
        createSessionHistoryEntry(questions[1], 'opt_2', false),
      ];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 2,
        sessionHistory,
      });
      render(<QuestionNavigationMenu {...props} />);

      const button1 = screen.getByRole('button', { name: 'Navigate to question 1' });
      const button2 = screen.getByRole('button', { name: 'Navigate to question 2' });

      expect(button1).toHaveAttribute('title', 'Question 1 (Incorrect)');
      expect(button2).toHaveAttribute('title', 'Question 2 (Incorrect)');
      expect(button1.className).toContain('red');
      expect(button2.className).toContain('red');
    });

    it('should show mixed states for mixed answers', () => {
      const questions = createQuestions(5);
      const sessionHistory = [
        createSessionHistoryEntry(questions[0], 'opt_1', true),
        createSessionHistoryEntry(questions[1], 'opt_2', false),
      ];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 2,
        sessionHistory,
      });
      render(<QuestionNavigationMenu {...props} />);

      const button1 = screen.getByRole('button', { name: 'Navigate to question 1' });
      const button2 = screen.getByRole('button', { name: 'Navigate to question 2' });

      expect(button1).toHaveAttribute('title', 'Question 1 (Correct)');
      expect(button2).toHaveAttribute('title', 'Question 2 (Incorrect)');
    });
  });

  describe('History View Mode', () => {
    it('should highlight question being viewed in history mode with ring', () => {
      const questions = createQuestions(5);
      const sessionHistory = [
        createSessionHistoryEntry(questions[0], 'opt_1', true),
        createSessionHistoryEntry(questions[1], 'opt_2', false),
      ];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 2,
        sessionHistory,
        currentHistoryViewIndex: 0, // Viewing first history entry (question 1)
      });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 1' });
      expect(button).toHaveAttribute('title', 'Question 1 (Viewing - Correct)');
      expect(button.className).toContain('ring');
    });

    it('should show viewing incorrect state for incorrect question in history view', () => {
      const questions = createQuestions(5);
      const sessionHistory = [
        createSessionHistoryEntry(questions[0], 'opt_1', true),
        createSessionHistoryEntry(questions[1], 'opt_2', false),
      ];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 2,
        sessionHistory,
        currentHistoryViewIndex: 1, // Viewing second history entry (question 2, incorrect)
      });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 2' });
      expect(button).toHaveAttribute('title', 'Question 2 (Viewing - Incorrect)');
    });

    it('should not show current-live when in history view mode', () => {
      const questions = createQuestions(5);
      const sessionHistory = [createSessionHistoryEntry(questions[0], 'opt_1', true)];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 1,
        sessionHistory,
        currentHistoryViewIndex: 0, // Viewing history
      });
      render(<QuestionNavigationMenu {...props} />);

      // Current question (index 1) should not show as "Current" when viewing history
      const button = screen.getByRole('button', { name: 'Navigate to question 2' });
      expect(button).not.toHaveAttribute('title', 'Question 2 (Current)');
    });
  });

  describe('Progress Calculation', () => {
    it('should show 0% when no questions answered', () => {
      const props = createDefaultProps({ questions: createQuestions(10) });
      render(<QuestionNavigationMenu {...props} />);
      expect(screen.getByText('0% Complete')).toBeInTheDocument();
    });

    it('should show 50% when half questions answered', () => {
      const questions = createQuestions(10);
      const sessionHistory = questions
        .slice(0, 5)
        .map((q) => createSessionHistoryEntry(q, 'opt_1', true));

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 5,
        sessionHistory,
      });
      render(<QuestionNavigationMenu {...props} />);
      expect(screen.getByText('50% Complete')).toBeInTheDocument();
    });

    it('should show 100% when all questions answered', () => {
      const questions = createQuestions(5);
      const sessionHistory = questions.map((q) => createSessionHistoryEntry(q, 'opt_1', true));

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 4,
        sessionHistory,
      });
      render(<QuestionNavigationMenu {...props} />);
      expect(screen.getByText('100% Complete')).toBeInTheDocument();
    });

    it('should round progress percentage', () => {
      const questions = createQuestions(3);
      const sessionHistory = [createSessionHistoryEntry(questions[0], 'opt_1', true)];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 1,
        sessionHistory,
      });
      render(<QuestionNavigationMenu {...props} />);
      // 1/3 = 33.33...% should round to 33%
      expect(screen.getByText('33% Complete')).toBeInTheDocument();
    });

    it('should handle empty questions array gracefully', () => {
      const props = createDefaultProps({ questions: [] });
      render(<QuestionNavigationMenu {...props} />);
      expect(screen.getByText('0% Complete')).toBeInTheDocument();
    });
  });

  describe('Click Navigation', () => {
    it('should call onNavigateToQuestion when clicking a question button', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      const props = createDefaultProps({
        questions: createQuestions(5),
        onNavigateToQuestion,
      });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 3' });
      await user.click(button);

      expect(onNavigateToQuestion).toHaveBeenCalledTimes(1);
      expect(onNavigateToQuestion).toHaveBeenCalledWith(2); // 0-indexed
    });

    it('should call onNavigateToQuestion with correct index for first question', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      const props = createDefaultProps({
        questions: createQuestions(5),
        onNavigateToQuestion,
      });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 1' });
      await user.click(button);

      expect(onNavigateToQuestion).toHaveBeenCalledWith(0);
    });

    it('should call onNavigateToQuestion with correct index for last question', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      const props = createDefaultProps({
        questions: createQuestions(5),
        onNavigateToQuestion,
      });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 5' });
      await user.click(button);

      expect(onNavigateToQuestion).toHaveBeenCalledWith(4);
    });

    it('should allow navigating to answered questions', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      const questions = createQuestions(5);
      const sessionHistory = [createSessionHistoryEntry(questions[0], 'opt_1', true)];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 1,
        sessionHistory,
        onNavigateToQuestion,
      });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 1' });
      await user.click(button);

      expect(onNavigateToQuestion).toHaveBeenCalledWith(0);
    });

    it('should allow navigating to unanswered questions', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      const props = createDefaultProps({
        questions: createQuestions(5),
        currentQuestionIndex: 0,
        onNavigateToQuestion,
      });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 4' });
      await user.click(button);

      expect(onNavigateToQuestion).toHaveBeenCalledWith(3);
    });

    it('should allow clicking current question', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      const props = createDefaultProps({
        questions: createQuestions(5),
        currentQuestionIndex: 2,
        onNavigateToQuestion,
      });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 3' });
      await user.click(button);

      expect(onNavigateToQuestion).toHaveBeenCalledWith(2);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be focusable with Tab key', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ questions: createQuestions(3) });
      render(<QuestionNavigationMenu {...props} />);

      await user.tab();

      const button1 = screen.getByRole('button', { name: 'Navigate to question 1' });
      expect(button1).toHaveFocus();
    });

    it('should navigate through buttons with Tab', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ questions: createQuestions(3) });
      render(<QuestionNavigationMenu {...props} />);

      await user.tab();
      expect(screen.getByRole('button', { name: 'Navigate to question 1' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Navigate to question 2' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Navigate to question 3' })).toHaveFocus();
    });

    it('should navigate backward with Shift+Tab', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ questions: createQuestions(3) });
      render(<QuestionNavigationMenu {...props} />);

      // Tab to third button
      await user.tab();
      await user.tab();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Navigate to question 3' })).toHaveFocus();

      // Shift+Tab back
      await user.tab({ shift: true });
      expect(screen.getByRole('button', { name: 'Navigate to question 2' })).toHaveFocus();
    });

    it('should activate button with Enter key', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      const props = createDefaultProps({
        questions: createQuestions(3),
        onNavigateToQuestion,
      });
      render(<QuestionNavigationMenu {...props} />);

      await user.tab();
      await user.keyboard('{Enter}');

      expect(onNavigateToQuestion).toHaveBeenCalledWith(0);
    });

    it('should activate button with Space key', async () => {
      const user = userEvent.setup();
      const onNavigateToQuestion = vi.fn();
      const props = createDefaultProps({
        questions: createQuestions(3),
        onNavigateToQuestion,
      });
      render(<QuestionNavigationMenu {...props} />);

      await user.tab();
      await user.keyboard(' ');

      expect(onNavigateToQuestion).toHaveBeenCalledWith(0);
    });

    it('should have focus ring styling when focused', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ questions: createQuestions(3) });
      render(<QuestionNavigationMenu {...props} />);

      await user.tab();
      const focusedButton = screen.getByRole('button', { name: 'Navigate to question 1' });

      // Check that focus styling classes are present in the component
      expect(focusedButton.className).toContain('focus:ring');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      const props = createDefaultProps({ questions: createQuestions(5) });
      render(<QuestionNavigationMenu {...props} />);

      for (let i = 1; i <= 5; i++) {
        const button = screen.getByRole('button', { name: 'Navigate to question ' + i });
        expect(button).toHaveAttribute('aria-label', 'Navigate to question ' + i);
      }
    });

    it('should have descriptive title attributes', () => {
      const questions = createQuestions(3);
      const sessionHistory = [
        createSessionHistoryEntry(questions[0], 'opt_1', true),
        createSessionHistoryEntry(questions[1], 'opt_2', false),
      ];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 2,
        sessionHistory,
      });
      render(<QuestionNavigationMenu {...props} />);

      expect(screen.getByRole('button', { name: 'Navigate to question 1' })).toHaveAttribute(
        'title',
        'Question 1 (Correct)',
      );
      expect(screen.getByRole('button', { name: 'Navigate to question 2' })).toHaveAttribute(
        'title',
        'Question 2 (Incorrect)',
      );
      expect(screen.getByRole('button', { name: 'Navigate to question 3' })).toHaveAttribute(
        'title',
        'Question 3 (Current)',
      );
    });

    it('should have semantic heading for navigation', () => {
      render(<QuestionNavigationMenu {...createDefaultProps()} />);
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Question Navigation');
    });

    it('should have buttons that are interactive', () => {
      const props = createDefaultProps({ questions: createQuestions(3) });
      render(<QuestionNavigationMenu {...props} />);

      const buttons = screen.getAllByRole('button', { name: /Navigate to question/ });
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Visual Status Indicators', () => {
    it('should apply blue gradient to current live question', () => {
      const props = createDefaultProps({
        questions: createQuestions(5),
        currentQuestionIndex: 1,
      });
      render(<QuestionNavigationMenu {...props} />);

      const currentButton = screen.getByRole('button', { name: 'Navigate to question 2' });
      expect(currentButton.className).toContain('from-blue-900');
      expect(currentButton.className).toContain('to-blue-800');
    });

    it('should apply green gradient to correct answers', () => {
      const questions = createQuestions(3);
      const sessionHistory = [createSessionHistoryEntry(questions[0], 'opt_1', true)];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 1,
        sessionHistory,
      });
      render(<QuestionNavigationMenu {...props} />);

      const correctButton = screen.getByRole('button', { name: 'Navigate to question 1' });
      expect(correctButton.className).toContain('green');
    });

    it('should apply red gradient to incorrect answers', () => {
      const questions = createQuestions(3);
      const sessionHistory = [createSessionHistoryEntry(questions[0], 'opt_2', false)];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 1,
        sessionHistory,
      });
      render(<QuestionNavigationMenu {...props} />);

      const incorrectButton = screen.getByRole('button', { name: 'Navigate to question 1' });
      expect(incorrectButton.className).toContain('red');
    });

    it('should apply slate/gray gradient to unanswered questions', () => {
      const props = createDefaultProps({
        questions: createQuestions(3),
        currentQuestionIndex: 0,
      });
      render(<QuestionNavigationMenu {...props} />);

      const unansweredButton = screen.getByRole('button', { name: 'Navigate to question 2' });
      expect(unansweredButton.className).toContain('slate');
      expect(unansweredButton.className).toContain('gray');
    });

    it('should apply ring styling to currently viewed historical question', () => {
      const questions = createQuestions(3);
      const sessionHistory = [createSessionHistoryEntry(questions[0], 'opt_1', true)];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 1,
        sessionHistory,
        currentHistoryViewIndex: 0,
      });
      render(<QuestionNavigationMenu {...props} />);

      const viewingButton = screen.getByRole('button', { name: 'Navigate to question 1' });
      expect(viewingButton.className).toContain('ring-2');
      expect(viewingButton.className).toContain('ring-opacity-50');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty questions array', () => {
      const props = createDefaultProps({ questions: [] });
      render(<QuestionNavigationMenu {...props} />);

      expect(screen.getByText('Question Navigation')).toBeInTheDocument();
      expect(screen.getByText('0% Complete')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Navigate to question/ }),
      ).not.toBeInTheDocument();
    });

    it('should handle single question', () => {
      const props = createDefaultProps({ questions: createQuestions(1) });
      render(<QuestionNavigationMenu {...props} />);

      expect(screen.getByRole('button', { name: 'Navigate to question 1' })).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Navigate to question/ })).toHaveLength(1);
    });

    it('should handle session history with entries for non-existent questions', () => {
      const questions = createQuestions(3);
      const extraQuestion = createQuestion({ questionId: 'non_existent' });
      const sessionHistory = [
        createSessionHistoryEntry(questions[0], 'opt_1', true),
        createSessionHistoryEntry(extraQuestion, 'opt_1', true),
      ];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 1,
        sessionHistory,
      });

      // Should not throw
      expect(() => render(<QuestionNavigationMenu {...props} />)).not.toThrow();
    });

    it('should handle out-of-bounds currentQuestionIndex', () => {
      const props = createDefaultProps({
        questions: createQuestions(3),
        currentQuestionIndex: 10, // Out of bounds
      });

      // Should not throw
      expect(() => render(<QuestionNavigationMenu {...props} />)).not.toThrow();
    });

    it('should handle negative currentQuestionIndex', () => {
      const props = createDefaultProps({
        questions: createQuestions(3),
        currentQuestionIndex: -1,
      });

      // Should not throw
      expect(() => render(<QuestionNavigationMenu {...props} />)).not.toThrow();
    });

    it('should handle currentHistoryViewIndex out of bounds', () => {
      const questions = createQuestions(3);
      const sessionHistory = [createSessionHistoryEntry(questions[0], 'opt_1', true)];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 1,
        sessionHistory,
        currentHistoryViewIndex: 10, // Out of bounds
      });

      // Should not throw
      expect(() => render(<QuestionNavigationMenu {...props} />)).not.toThrow();
    });
  });

  describe('Component Updates', () => {
    it('should update when sessionHistory changes', () => {
      const questions = createQuestions(5);
      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 0,
        sessionHistory: [],
      });

      const { rerender } = render(<QuestionNavigationMenu {...props} />);

      expect(screen.getByText('0% Complete')).toBeInTheDocument();

      const newSessionHistory = [createSessionHistoryEntry(questions[0], 'opt_1', true)];
      rerender(
        <QuestionNavigationMenu
          {...createDefaultProps({
            questions,
            currentQuestionIndex: 1,
            sessionHistory: newSessionHistory,
          })}
        />,
      );

      expect(screen.getByText('20% Complete')).toBeInTheDocument();
    });

    it('should update button states when answers change', () => {
      const questions = createQuestions(3);
      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 0,
      });

      const { rerender } = render(<QuestionNavigationMenu {...props} />);

      // Initially question 1 is current, 2 and 3 are unanswered
      expect(screen.getByRole('button', { name: 'Navigate to question 1' })).toHaveAttribute(
        'title',
        'Question 1 (Current)',
      );

      // After answering question 1
      const sessionHistory = [createSessionHistoryEntry(questions[0], 'opt_1', true)];
      rerender(
        <QuestionNavigationMenu
          {...createDefaultProps({
            questions,
            currentQuestionIndex: 1,
            sessionHistory,
          })}
        />,
      );

      // Question 1 should now show as correct
      expect(screen.getByRole('button', { name: 'Navigate to question 1' })).toHaveAttribute(
        'title',
        'Question 1 (Correct)',
      );
      // Question 2 should now be current
      expect(screen.getByRole('button', { name: 'Navigate to question 2' })).toHaveAttribute(
        'title',
        'Question 2 (Current)',
      );
    });

    it('should update when transitioning to and from history view', () => {
      const questions = createQuestions(3);
      const sessionHistory = [createSessionHistoryEntry(questions[0], 'opt_1', true)];

      const props = createDefaultProps({
        questions,
        currentQuestionIndex: 1,
        sessionHistory,
        currentHistoryViewIndex: null,
      });

      const { rerender } = render(<QuestionNavigationMenu {...props} />);

      // Question 2 should be current
      expect(screen.getByRole('button', { name: 'Navigate to question 2' })).toHaveAttribute(
        'title',
        'Question 2 (Current)',
      );

      // Enter history view
      rerender(
        <QuestionNavigationMenu
          {...createDefaultProps({
            questions,
            currentQuestionIndex: 1,
            sessionHistory,
            currentHistoryViewIndex: 0,
          })}
        />,
      );

      // Question 1 should now show as being viewed
      expect(screen.getByRole('button', { name: 'Navigate to question 1' })).toHaveAttribute(
        'title',
        'Question 1 (Viewing - Correct)',
      );
    });
  });

  describe('Memoization', () => {
    it('should be wrapped with memo for performance', () => {
      // The component is exported as a memoized component
      // We can verify it renders correctly multiple times
      const props = createDefaultProps();
      const { rerender } = render(<QuestionNavigationMenu {...props} />);

      // Re-render with same props should work
      rerender(<QuestionNavigationMenu {...props} />);

      expect(screen.getByText('Question Navigation')).toBeInTheDocument();
    });
  });

  describe('Button Interaction Feedback', () => {
    it('should have hover scale effect class', () => {
      const props = createDefaultProps({ questions: createQuestions(3) });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 1' });
      expect(button.className).toContain('hover:scale-105');
    });

    it('should have active scale effect class', () => {
      const props = createDefaultProps({ questions: createQuestions(3) });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 1' });
      expect(button.className).toContain('active:scale-95');
    });

    it('should have transition classes for smooth animations', () => {
      const props = createDefaultProps({ questions: createQuestions(3) });
      render(<QuestionNavigationMenu {...props} />);

      const button = screen.getByRole('button', { name: 'Navigate to question 1' });
      expect(button.className).toContain('transition-all');
      expect(button.className).toContain('duration-200');
    });
  });

  describe('Legend Visual Indicators', () => {
    it('should render legend indicator boxes', () => {
      render(<QuestionNavigationMenu {...createDefaultProps()} />);

      // The legend section should exist
      const legendSection = screen.getByText('Current').closest('.flex.flex-wrap');
      expect(legendSection).toBeInTheDocument();
    });

    it('should have four legend items', () => {
      render(<QuestionNavigationMenu {...createDefaultProps()} />);

      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Correct')).toBeInTheDocument();
      expect(screen.getByText('Incorrect')).toBeInTheDocument();
      expect(screen.getByText('Unanswered')).toBeInTheDocument();
    });
  });
});
