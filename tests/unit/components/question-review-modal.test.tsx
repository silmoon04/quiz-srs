import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionReviewModal } from '@/components/question-review-modal';
import type { QuizQuestion } from '@/types/quiz-types';

// Mock lucide-react icons to simplify testing
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left-icon">ChevronLeft</span>,
  ChevronRight: () => <span data-testid="chevron-right-icon">ChevronRight</span>,
  X: () => <span data-testid="close-icon">X</span>,
  Plus: () => <span data-testid="plus-icon">Plus</span>,
  Minus: () => <span data-testid="minus-icon">Minus</span>,
  Save: () => <span data-testid="save-icon">Save</span>,
  FileText: () => <span data-testid="file-text-icon">FileText</span>,
}));

// Mock MarkdownRenderer component
vi.mock('@/components/rendering/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ markdown, className }: { markdown: string; className?: string }) => (
    <div data-testid="markdown-renderer" className={className}>
      {markdown}
    </div>
  ),
}));

// Factory to create mock questions
const createMockQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  questionId: 'q1',
  questionText: 'What is the capital of France?',
  options: [
    { optionId: 'opt1', optionText: 'Paris' },
    { optionId: 'opt2', optionText: 'London' },
    { optionId: 'opt3', optionText: 'Berlin' },
    { optionId: 'opt4', optionText: 'Madrid' },
  ],
  correctOptionIds: ['opt1'],
  explanationText: 'Paris is the capital and most populous city of France.',
  ...overrides,
});

const createMultipleQuestions = (): QuizQuestion[] => [
  createMockQuestion({
    questionId: 'q1',
    questionText: 'Question 1: What is 2+2?',
    options: [
      { optionId: 'q1-opt1', optionText: '4' },
      { optionId: 'q1-opt2', optionText: '5' },
    ],
    correctOptionIds: ['q1-opt1'],
    explanationText: 'Basic arithmetic: 2+2=4',
  }),
  createMockQuestion({
    questionId: 'q2',
    questionText: 'Question 2: What is the color of the sky?',
    options: [
      { optionId: 'q2-opt1', optionText: 'Blue' },
      { optionId: 'q2-opt2', optionText: 'Green' },
    ],
    correctOptionIds: ['q2-opt1'],
    explanationText: 'The sky appears blue due to Rayleigh scattering.',
  }),
  createMockQuestion({
    questionId: 'q3',
    questionText: 'Question 3: What planet is closest to the sun?',
    options: [
      { optionId: 'q3-opt1', optionText: 'Mercury' },
      { optionId: 'q3-opt2', optionText: 'Venus' },
    ],
    correctOptionIds: ['q3-opt1'],
    explanationText: 'Mercury is the closest planet to the sun.',
  }),
];

// Default props factory
const createDefaultProps = () => ({
  isOpen: true,
  questionsToReview: [createMockQuestion()],
  onSaveSelected: vi.fn(),
  onCancel: vi.fn(),
});

describe('QuestionReviewModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the modal when isOpen is true', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByText('Review Questions for Addition')).toBeInTheDocument();
    });

    it('should not render the modal when isOpen is false', () => {
      const props = createDefaultProps();
      props.isOpen = false;
      render(<QuestionReviewModal {...props} />);
      expect(screen.queryByText('Review Questions for Addition')).not.toBeInTheDocument();
    });

    it('should not render the modal when questionsToReview is empty', () => {
      const props = createDefaultProps();
      props.questionsToReview = [];
      render(<QuestionReviewModal {...props} />);
      expect(screen.queryByText('Review Questions for Addition')).not.toBeInTheDocument();
    });

    it('should render the modal title and subtitle', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByText('Review Questions for Addition')).toBeInTheDocument();
      expect(
        screen.getByText('Review and select questions to add to the current chapter'),
      ).toBeInTheDocument();
    });

    it('should render the FileText icon in header', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
    });

    it('should render the close button', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });
  });

  describe('Question Display', () => {
    it('should display question text through MarkdownRenderer', () => {
      const question = createMockQuestion({ questionText: 'Test question text' });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);

      const markdownRenderers = screen.getAllByTestId('markdown-renderer');
      const questionRenderer = markdownRenderers.find(
        (r) => r.textContent === 'Test question text',
      );
      expect(questionRenderer).toBeInTheDocument();
    });

    it('should display question ID', () => {
      const question = createMockQuestion({ questionId: 'unique-question-id' });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.getByText('unique-question-id')).toBeInTheDocument();
    });

    it('should display SRS level when provided', () => {
      const question = createMockQuestion({ srsLevel: 2 });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('SRS Level:')).toBeInTheDocument();
    });

    it('should display times answered correctly when provided', () => {
      const question = createMockQuestion({ timesAnsweredCorrectly: 5 });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Correct:')).toBeInTheDocument();
    });

    it('should display times answered incorrectly when provided', () => {
      const question = createMockQuestion({ timesAnsweredIncorrectly: 3 });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Incorrect:')).toBeInTheDocument();
    });

    it('should not display SRS metadata when not provided', () => {
      const question = createMockQuestion();
      delete question.srsLevel;
      delete question.timesAnsweredCorrectly;
      delete question.timesAnsweredIncorrectly;
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.queryByText('SRS Level:')).not.toBeInTheDocument();
    });
  });

  describe('Options Display - Correct/Incorrect Feedback', () => {
    it('should display correct options with "Correct Answer(s):" label', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByText('Correct Answer(s):')).toBeInTheDocument();
    });

    it('should display correct option text', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'correct-opt', optionText: 'This is the correct answer' },
          { optionId: 'wrong-opt', optionText: 'This is wrong' },
        ],
        correctOptionIds: ['correct-opt'],
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);

      const markdownRenderers = screen.getAllByTestId('markdown-renderer');
      const correctRenderer = markdownRenderers.find(
        (r) => r.textContent === 'This is the correct answer',
      );
      expect(correctRenderer).toBeInTheDocument();
    });

    it('should display multiple correct options', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Correct option 1' },
          { optionId: 'opt2', optionText: 'Correct option 2' },
          { optionId: 'opt3', optionText: 'Wrong option' },
        ],
        correctOptionIds: ['opt1', 'opt2'],
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);

      const markdownRenderers = screen.getAllByTestId('markdown-renderer');
      expect(
        markdownRenderers.find((r) => r.textContent === 'Correct option 1'),
      ).toBeInTheDocument();
      expect(
        markdownRenderers.find((r) => r.textContent === 'Correct option 2'),
      ).toBeInTheDocument();
    });

    it('should display incorrect options with "Other Options" label', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByText(/Other Options/)).toBeInTheDocument();
    });

    it('should show count of incorrect options', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Correct' },
          { optionId: 'opt2', optionText: 'Wrong 1' },
          { optionId: 'opt3', optionText: 'Wrong 2' },
          { optionId: 'opt4', optionText: 'Wrong 3' },
        ],
        correctOptionIds: ['opt1'],
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.getByText('Other Options (3):')).toBeInTheDocument();
    });

    it('should display "... and X more options" when there are more than 3 incorrect options', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Correct' },
          { optionId: 'opt2', optionText: 'Wrong 1' },
          { optionId: 'opt3', optionText: 'Wrong 2' },
          { optionId: 'opt4', optionText: 'Wrong 3' },
          { optionId: 'opt5', optionText: 'Wrong 4' },
          { optionId: 'opt6', optionText: 'Wrong 5' },
        ],
        correctOptionIds: ['opt1'],
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.getByText('... and 2 more options')).toBeInTheDocument();
    });

    it('should not show "more options" message when 3 or fewer incorrect options', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Correct' },
          { optionId: 'opt2', optionText: 'Wrong 1' },
          { optionId: 'opt3', optionText: 'Wrong 2' },
        ],
        correctOptionIds: ['opt1'],
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.queryByText(/and.*more options/)).not.toBeInTheDocument();
    });
  });

  describe('Explanation Display', () => {
    it('should display "Explanation" section header', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByText('Explanation')).toBeInTheDocument();
    });

    it('should display explanation text through MarkdownRenderer', () => {
      const question = createMockQuestion({
        explanationText: 'This is the detailed explanation for the answer.',
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);

      const markdownRenderers = screen.getAllByTestId('markdown-renderer');
      const explanationRenderer = markdownRenderers.find(
        (r) => r.textContent === 'This is the detailed explanation for the answer.',
      );
      expect(explanationRenderer).toBeInTheDocument();
    });
  });

  describe('Navigation Between Questions', () => {
    it('should display current question index', () => {
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );
      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    });

    it('should navigate to next question when clicking next button', async () => {
      const user = userEvent.setup();
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();

      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;
      await user.click(nextButton);

      expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
    });

    it('should navigate to previous question when clicking previous button', async () => {
      const user = userEvent.setup();
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      // Go to question 2 first
      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;
      await user.click(nextButton);
      expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();

      // Go back to question 1
      const prevButton = screen.getByTestId('chevron-left-icon').closest('button')!;
      await user.click(prevButton);
      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    });

    it('should wrap around to last question when clicking previous on first question', async () => {
      const user = userEvent.setup();
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();

      const prevButton = screen.getByTestId('chevron-left-icon').closest('button')!;
      await user.click(prevButton);

      expect(screen.getByText('Question 3 of 3')).toBeInTheDocument();
    });

    it('should wrap around to first question when clicking next on last question', async () => {
      const user = userEvent.setup();
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;

      // Go to question 3
      await user.click(nextButton);
      await user.click(nextButton);
      expect(screen.getByText('Question 3 of 3')).toBeInTheDocument();

      // Go to question 1 (wrap around)
      await user.click(nextButton);
      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    });

    it('should disable navigation buttons when only one question', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);

      const prevButton = screen.getByTestId('chevron-left-icon').closest('button')!;
      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('should enable navigation buttons when multiple questions', () => {
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      const prevButton = screen.getByTestId('chevron-left-icon').closest('button')!;
      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;

      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });

    it('should update displayed question content when navigating', async () => {
      const user = userEvent.setup();
      const questions = createMultipleQuestions();
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={questions} />);

      // Check first question text
      let markdownRenderers = screen.getAllByTestId('markdown-renderer');
      expect(markdownRenderers.some((r) => r.textContent === 'Question 1: What is 2+2?')).toBe(
        true,
      );

      // Navigate to second question
      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;
      await user.click(nextButton);

      // Check second question text
      markdownRenderers = screen.getAllByTestId('markdown-renderer');
      expect(
        markdownRenderers.some(
          (r) => r.textContent === 'Question 2: What is the color of the sky?',
        ),
      ).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate to previous question with ArrowLeft key', async () => {
      const user = userEvent.setup();
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      // Navigate to question 2 first using button click
      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;
      await user.click(nextButton);
      expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();

      // Focus the modal overlay and use ArrowLeft to go back
      const overlay = screen.getByText('Review Questions for Addition').closest('.fixed')!;
      overlay.focus();
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    });

    it('should navigate to next question with ArrowRight key', async () => {
      const user = userEvent.setup();
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();

      // Focus the modal overlay and use ArrowRight
      const overlay = screen.getByText('Review Questions for Addition').closest('.fixed')!;
      overlay.focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
    });

    it('should close modal with Escape key', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionReviewModal {...props} />);

      // Focus the modal overlay and press Escape
      const overlay = screen.getByText('Review Questions for Addition').closest('.fixed')!;
      overlay.focus();
      await user.keyboard('{Escape}');

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should toggle question selection with Space key', async () => {
      const user = userEvent.setup();
      render(<QuestionReviewModal {...createDefaultProps()} />);

      expect(screen.getByText('0 selected for addition')).toBeInTheDocument();

      // Focus the modal overlay and press Space
      const overlay = screen.getByText('Review Questions for Addition').closest('.fixed')!;
      overlay.focus();
      await user.keyboard(' ');

      expect(screen.getByText('1 selected for addition')).toBeInTheDocument();
    });
  });

  describe('Question Selection (Add/Remove)', () => {
    it('should show "Add to Selection" button initially', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /add to selection/i })).toBeInTheDocument();
    });

    it('should show "0 selected for addition" initially', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByText('0 selected for addition')).toBeInTheDocument();
    });

    it('should add question to selection when clicking "Add to Selection"', async () => {
      const user = userEvent.setup();
      render(<QuestionReviewModal {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: /add to selection/i }));

      expect(screen.getByText('1 selected for addition')).toBeInTheDocument();
    });

    it('should change button to "Remove from Selection" after adding', async () => {
      const user = userEvent.setup();
      render(<QuestionReviewModal {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: /add to selection/i }));

      expect(screen.getByRole('button', { name: /remove from selection/i })).toBeInTheDocument();
    });

    it('should remove question from selection when clicking "Remove from Selection"', async () => {
      const user = userEvent.setup();
      render(<QuestionReviewModal {...createDefaultProps()} />);

      // Add first
      await user.click(screen.getByRole('button', { name: /add to selection/i }));
      expect(screen.getByText('1 selected for addition')).toBeInTheDocument();

      // Remove
      await user.click(screen.getByRole('button', { name: /remove from selection/i }));
      expect(screen.getByText('0 selected for addition')).toBeInTheDocument();
    });

    it('should show Plus icon when question is not selected', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('should show Minus icon when question is selected', async () => {
      const user = userEvent.setup();
      render(<QuestionReviewModal {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: /add to selection/i }));

      expect(screen.getByTestId('minus-icon')).toBeInTheDocument();
    });

    it('should maintain selection state when navigating between questions', async () => {
      const user = userEvent.setup();
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      // Select question 1
      await user.click(screen.getByRole('button', { name: /add to selection/i }));
      expect(screen.getByText('1 selected for addition')).toBeInTheDocument();

      // Navigate to question 2
      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;
      await user.click(nextButton);

      // Selection count should still be 1
      expect(screen.getByText('1 selected for addition')).toBeInTheDocument();

      // Question 2 should show "Add to Selection" (not selected yet)
      expect(screen.getByRole('button', { name: /add to selection/i })).toBeInTheDocument();
    });

    it('should track multiple question selections', async () => {
      const user = userEvent.setup();
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      // Select question 1
      await user.click(screen.getByRole('button', { name: /add to selection/i }));

      // Navigate and select question 2
      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;
      await user.click(nextButton);
      await user.click(screen.getByRole('button', { name: /add to selection/i }));

      expect(screen.getByText('2 selected for addition')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onCancel when clicking close button', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionReviewModal {...props} />);

      await user.click(screen.getByRole('button', { name: /close modal/i }));

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when clicking "Cancel All Additions" button', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionReviewModal {...props} />);

      await user.click(screen.getByRole('button', { name: /cancel all additions/i }));

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when clicking backdrop', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionReviewModal {...props} />);

      // Click on the backdrop (the outer div)
      const backdrop = screen.getByText('Review Questions for Addition').closest('.fixed');
      await user.click(backdrop!);

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel when clicking inside the modal card', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionReviewModal {...props} />);

      // Click on the question text area (inside the card)
      const questionTextCard = screen.getByText('Question Text');
      await user.click(questionTextCard);

      expect(props.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Save Functionality', () => {
    it('should render save button', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /save.*added question/i })).toBeInTheDocument();
    });

    it('should show Save icon in save button', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByTestId('save-icon')).toBeInTheDocument();
    });

    it('should disable save button when no questions selected', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /save.*added question/i })).toBeDisabled();
    });

    it('should enable save button when questions are selected', async () => {
      const user = userEvent.setup();
      render(<QuestionReviewModal {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: /add to selection/i }));

      expect(screen.getByRole('button', { name: /save.*added question/i })).not.toBeDisabled();
    });

    it('should call onSaveSelected with selected questions when save is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionReviewModal {...props} />);

      await user.click(screen.getByRole('button', { name: /add to selection/i }));
      await user.click(screen.getByRole('button', { name: /save.*added question/i }));

      expect(props.onSaveSelected).toHaveBeenCalledTimes(1);
      expect(props.onSaveSelected).toHaveBeenCalledWith([props.questionsToReview[0]]);
    });

    it('should call onSaveSelected with multiple selected questions', async () => {
      const user = userEvent.setup();
      const questions = createMultipleQuestions();
      const props = { ...createDefaultProps(), questionsToReview: questions };
      render(<QuestionReviewModal {...props} />);

      // Select question 1
      await user.click(screen.getByRole('button', { name: /add to selection/i }));

      // Navigate and select question 3
      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(screen.getByRole('button', { name: /add to selection/i }));

      // Save
      await user.click(screen.getByRole('button', { name: /save.*added question/i }));

      expect(props.onSaveSelected).toHaveBeenCalledWith([questions[0], questions[2]]);
    });

    it('should show singular "Question" when 1 selected', async () => {
      const user = userEvent.setup();
      render(<QuestionReviewModal {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: /add to selection/i }));

      expect(screen.getByRole('button', { name: /save 1 added question$/i })).toBeInTheDocument();
    });

    it('should show plural "Questions" when multiple selected', async () => {
      const user = userEvent.setup();
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      await user.click(screen.getByRole('button', { name: /add to selection/i }));
      const nextButton = screen.getByTestId('chevron-right-icon').closest('button')!;
      await user.click(nextButton);
      await user.click(screen.getByRole('button', { name: /add to selection/i }));

      expect(screen.getByRole('button', { name: /save 2 added questions/i })).toBeInTheDocument();
    });
  });

  describe('Footer Information', () => {
    it('should display keyboard shortcut help text', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(
        screen.getByText('Use arrow keys to navigate, spacebar to toggle selection'),
      ).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle question with empty options array', () => {
      const question = createMockQuestion({
        options: [],
        correctOptionIds: [],
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.getByText('Review Questions for Addition')).toBeInTheDocument();
    });

    it('should handle question with empty explanation', () => {
      const question = createMockQuestion({ explanationText: '' });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.getByText('Explanation')).toBeInTheDocument();
    });

    it('should handle question with very long text', () => {
      const question = createMockQuestion({
        questionText: 'This is a very long question text '.repeat(50),
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);
      expect(screen.getByText('Review Questions for Addition')).toBeInTheDocument();
    });

    it('should handle question with special characters in text', () => {
      const question = createMockQuestion({
        questionText: 'What is <script>alert("test")</script> & "quotes"?',
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);

      const markdownRenderers = screen.getAllByTestId('markdown-renderer');
      const questionRenderer = markdownRenderers.find((r) => r.textContent?.includes('<script>'));
      expect(questionRenderer).toBeInTheDocument();
    });

    it('should handle question with markdown in text', () => {
      const question = createMockQuestion({
        questionText: '**Bold** and *italic* with `code`',
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);

      const markdownRenderers = screen.getAllByTestId('markdown-renderer');
      const questionRenderer = markdownRenderers.find(
        (r) => r.textContent === '**Bold** and *italic* with `code`',
      );
      expect(questionRenderer).toBeInTheDocument();
    });

    it('should handle all options being correct', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'All correct 1' },
          { optionId: 'opt2', optionText: 'All correct 2' },
        ],
        correctOptionIds: ['opt1', 'opt2'],
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);

      expect(screen.getByText('Correct Answer(s):')).toBeInTheDocument();
      expect(screen.queryByText(/Other Options/)).not.toBeInTheDocument();
    });

    it('should handle no correct options', () => {
      const question = createMockQuestion({
        options: [
          { optionId: 'opt1', optionText: 'Option 1' },
          { optionId: 'opt2', optionText: 'Option 2' },
        ],
        correctOptionIds: [],
      });
      render(<QuestionReviewModal {...createDefaultProps()} questionsToReview={[question]} />);

      expect(screen.queryByText('Correct Answer(s):')).not.toBeInTheDocument();
      expect(screen.getByText('Other Options (2):')).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('should reset state when modal reopens with different questions', async () => {
      const user = userEvent.setup();
      const questions1 = [createMockQuestion({ questionId: 'set1-q1' })];
      const questions2 = [
        createMockQuestion({ questionId: 'set2-q1', questionText: 'New question' }),
      ];

      const props = { ...createDefaultProps(), questionsToReview: questions1 };
      const { rerender } = render(<QuestionReviewModal {...props} />);

      // Select the question
      await user.click(screen.getByRole('button', { name: /add to selection/i }));
      expect(screen.getByText('1 selected for addition')).toBeInTheDocument();

      // Rerender with new questions - component should show first question
      rerender(<QuestionReviewModal {...props} questionsToReview={questions2} />);

      // New question ID should be visible
      expect(screen.getByText('set2-q1')).toBeInTheDocument();
    });

    it('should handle transition from closed to open', () => {
      const props = createDefaultProps();
      props.isOpen = false;
      const { rerender } = render(<QuestionReviewModal {...props} />);

      expect(screen.queryByText('Review Questions for Addition')).not.toBeInTheDocument();

      rerender(<QuestionReviewModal {...props} isOpen={true} />);

      expect(screen.getByText('Review Questions for Addition')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button with aria-label', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });

    it('should have accessible navigation buttons', () => {
      render(
        <QuestionReviewModal
          {...createDefaultProps()}
          questionsToReview={createMultipleQuestions()}
        />,
      );

      // Navigation buttons should be clickable
      const prevButton = screen.getByTestId('chevron-left-icon').closest('button');
      const nextButton = screen.getByTestId('chevron-right-icon').closest('button');

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it('should have focusable modal overlay', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);

      const overlay = screen.getByText('Review Questions for Addition').closest('.fixed');
      expect(overlay).toHaveAttribute('tabindex', '-1');
    });

    it('should provide keyboard navigation instructions', () => {
      render(<QuestionReviewModal {...createDefaultProps()} />);
      expect(
        screen.getByText('Use arrow keys to navigate, spacebar to toggle selection'),
      ).toBeInTheDocument();
    });
  });
});
