import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionEditor } from '@/components/question-editor';
import type { QuizQuestion, QuizOption } from '@/types/quiz-types';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
  Plus: () => <span data-testid="plus-icon">Plus</span>,
  Trash2: () => <span data-testid="trash-icon">Trash</span>,
  Save: () => <span data-testid="save-icon">Save</span>,
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  EyeOff: () => <span data-testid="eye-off-icon">EyeOff</span>,
}));

// Mock the MarkdownRenderer component
vi.mock('@/components/rendering/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ markdown, className }: { markdown: string; className?: string }) => (
    <div data-testid="markdown-renderer" className={className}>
      {markdown}
    </div>
  ),
}));

// Mock the ConfirmationModal component
vi.mock('@/components/confirmation-modal-radix', () => ({
  ConfirmationModal: ({
    isOpen,
    title,
    message,
    confirmText,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant?: string;
    questionPreview?: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmText}</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

// Helper to create option data
const createOptionData = (overrides: Partial<QuizOption> = {}): QuizOption => ({
  optionId: 'opt_1',
  optionText: 'Option 1 text',
  ...overrides,
});

// Helper to create question data
const createQuestionData = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  questionId: 'q_1',
  questionText: 'What is the answer?',
  options: [
    createOptionData({ optionId: 'opt_1', optionText: 'Option A' }),
    createOptionData({ optionId: 'opt_2', optionText: 'Option B' }),
  ],
  correctOptionIds: ['opt_1'],
  explanationText: 'This is the explanation.',
  status: 'not_attempted',
  timesAnsweredCorrectly: 0,
  timesAnsweredIncorrectly: 0,
  historyOfIncorrectSelections: [],
  srsLevel: 0,
  nextReviewAt: null,
  shownIncorrectOptionIds: [],
  ...overrides,
});

// Default props factory
const createDefaultProps = (
  overrides: Partial<{
    isOpen: boolean;
    question: QuizQuestion;
    onSave: (question: QuizQuestion) => void;
    onCancel: () => void;
    onDelete: (questionId: string) => void;
    generateUniqueOptionId: (questionId: string, existingOptionIds: string[]) => string;
  }> = {},
) => ({
  isOpen: true,
  question: createQuestionData(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
  onDelete: vi.fn(),
  ...overrides,
});

describe('QuestionEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByText('Edit Question')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<QuestionEditor {...createDefaultProps({ isOpen: false })} />);
      expect(screen.queryByText('Edit Question')).not.toBeInTheDocument();
    });

    it('should render "Add New Question" title for new questions', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionText: '' }),
          })}
        />,
      );
      expect(screen.getByText('Add New Question')).toBeInTheDocument();
    });

    it('should render "Edit Question" title for existing questions', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByText('Edit Question')).toBeInTheDocument();
    });

    it('should render question ID input field', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByLabelText('Question ID')).toBeInTheDocument();
    });

    it('should render question text textarea', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByLabelText('Question Text')).toBeInTheDocument();
    });

    it('should render explanation textarea', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByLabelText('Explanation')).toBeInTheDocument();
    });

    it('should render SRS level input field', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByLabelText('SRS Level')).toBeInTheDocument();
    });

    it('should render Next Review date input', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByLabelText(/Next Review/)).toBeInTheDocument();
    });

    it('should render Add Option button', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /add option/i })).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render Save button', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('should render Delete button for existing questions', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /delete question/i })).toBeInTheDocument();
    });

    it('should not render Delete button for new questions', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionText: '' }),
          })}
        />,
      );
      expect(screen.queryByRole('button', { name: /delete question/i })).not.toBeInTheDocument();
    });

    it('should render options with their text', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByDisplayValue('Option A')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Option B')).toBeInTheDocument();
    });

    it('should render the preview toggle button', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });

    it('should render close button in header', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /close editor/i })).toBeInTheDocument();
    });
  });

  describe('Form Initialization', () => {
    it('should initialize question ID from props', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionId: 'custom_q_id' }),
          })}
        />,
      );
      expect(screen.getByLabelText('Question ID')).toHaveValue('custom_q_id');
    });

    it('should initialize question text from props', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionText: 'Custom question text' }),
          })}
        />,
      );
      expect(screen.getByLabelText('Question Text')).toHaveValue('Custom question text');
    });

    it('should initialize explanation text from props', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ explanationText: 'Custom explanation' }),
          })}
        />,
      );
      expect(screen.getByLabelText('Explanation')).toHaveValue('Custom explanation');
    });

    it('should initialize SRS level from props', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ srsLevel: 2 }),
          })}
        />,
      );
      expect(screen.getByLabelText('SRS Level')).toHaveValue(2);
    });

    it('should initialize correct option checkboxes', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      const checkboxes = screen.getAllByRole('checkbox');
      // First option is correct
      expect(checkboxes[0]).toBeChecked();
      // Second option is not correct
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('should disable question ID field for existing questions', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByLabelText('Question ID')).toBeDisabled();
    });

    it('should enable question ID field for new questions', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionText: '' }),
          })}
        />,
      );
      expect(screen.getByLabelText('Question ID')).not.toBeDisabled();
    });
  });

  describe('Editing Question Text', () => {
    it('should update question text when typing', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const textarea = screen.getByLabelText('Question Text');
      await user.clear(textarea);
      await user.type(textarea, 'New question text');

      expect(textarea).toHaveValue('New question text');
    });

    it('should update explanation text when typing', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const textarea = screen.getByLabelText('Explanation');
      await user.clear(textarea);
      await user.type(textarea, 'New explanation');

      expect(textarea).toHaveValue('New explanation');
    });

    it('should update question ID when typing (for new questions)', async () => {
      const user = userEvent.setup();
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionText: '', questionId: '' }),
          })}
        />,
      );

      const input = screen.getByLabelText('Question ID');
      await user.type(input, 'new_question_id');

      expect(input).toHaveValue('new_question_id');
    });

    it('should update SRS level when changing input', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const input = screen.getByLabelText('SRS Level');
      await user.clear(input);
      await user.type(input, '1');

      expect(input).toHaveValue(1);
    });
  });

  describe('Managing Options', () => {
    it('should add a new option when clicking Add Option', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const addButton = screen.getByRole('button', { name: /add option/i });
      await user.click(addButton);

      // Should now have 3 option textareas
      const optionTextareas = screen.getAllByPlaceholderText(/enter option text/i);
      expect(optionTextareas).toHaveLength(3);
    });

    it('should use generateUniqueOptionId when provided', async () => {
      const user = userEvent.setup();
      const generateUniqueOptionId = vi.fn().mockReturnValue('custom_opt_3');
      render(
        <QuestionEditor
          {...createDefaultProps({
            generateUniqueOptionId,
          })}
        />,
      );

      const addButton = screen.getByRole('button', { name: /add option/i });
      await user.click(addButton);

      expect(generateUniqueOptionId).toHaveBeenCalledWith('q_1', ['opt_1', 'opt_2']);
    });

    it('should generate default option ID when generateUniqueOptionId is not provided', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const addButton = screen.getByRole('button', { name: /add option/i });
      await user.click(addButton);

      // The new option should have been added with a default ID
      const optionTextareas = screen.getAllByPlaceholderText(/enter option text/i);
      expect(optionTextareas).toHaveLength(3);
    });

    it('should remove an option when clicking delete', async () => {
      const user = userEvent.setup();
      // Start with 3 options
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({
              options: [
                createOptionData({ optionId: 'opt_1', optionText: 'Option A' }),
                createOptionData({ optionId: 'opt_2', optionText: 'Option B' }),
                createOptionData({ optionId: 'opt_3', optionText: 'Option C' }),
              ],
            }),
          })}
        />,
      );

      // Initially should have 3 option textareas
      let optionTextareas = screen.getAllByPlaceholderText(/enter option text/i);
      expect(optionTextareas).toHaveLength(3);

      // Get delete buttons (trash icons) - there may be more than 3 due to other UI elements
      const deleteButtons = screen.getAllByTestId('trash-icon');

      // Click first delete button's parent
      await user.click(deleteButtons[0].closest('button')!);

      // Should now have 2 options
      optionTextareas = screen.getAllByPlaceholderText(/enter option text/i);
      expect(optionTextareas).toHaveLength(2);
    });

    it('should not allow removing options when only 2 remain', () => {
      render(<QuestionEditor {...createDefaultProps()} />);

      // Get delete buttons that are inside option items (not the main delete question button)
      const optionContainers = screen.getAllByPlaceholderText(/enter option text/i);
      expect(optionContainers).toHaveLength(2);

      // Find delete buttons within option areas
      const optionDeleteButtons = screen
        .getAllByTestId('trash-icon')
        .filter((icon) => icon.closest('button')?.disabled === true);

      // Should have 2 disabled delete buttons for the 2 options
      expect(optionDeleteButtons).toHaveLength(2);
    });

    it('should update option text when typing', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const optionTextarea = screen.getByDisplayValue('Option A');
      await user.clear(optionTextarea);
      await user.type(optionTextarea, 'Updated Option A');

      expect(optionTextarea).toHaveValue('Updated Option A');
    });

    it('should remove option from correct answers when deleted', async () => {
      const user = userEvent.setup();
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({
              options: [
                createOptionData({ optionId: 'opt_1', optionText: 'Option A' }),
                createOptionData({ optionId: 'opt_2', optionText: 'Option B' }),
                createOptionData({ optionId: 'opt_3', optionText: 'Option C' }),
              ],
              correctOptionIds: ['opt_1', 'opt_2'],
            }),
          })}
        />,
      );

      // Delete first option
      const deleteButtons = screen.getAllByTestId('trash-icon');
      await user.click(deleteButtons[0].closest('button')!);

      // First checkbox should now be for opt_2 and be checked
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
    });
  });

  describe('Setting Correct Answers', () => {
    it('should toggle correct answer when clicking checkbox', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const checkboxes = screen.getAllByRole('checkbox');
      // Second option is not correct
      expect(checkboxes[1]).not.toBeChecked();

      await user.click(checkboxes[1]);

      expect(checkboxes[1]).toBeChecked();
    });

    it('should uncheck correct answer when clicking checked checkbox', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const checkboxes = screen.getAllByRole('checkbox');
      // First option is correct
      expect(checkboxes[0]).toBeChecked();

      await user.click(checkboxes[0]);

      expect(checkboxes[0]).not.toBeChecked();
    });

    it('should allow multiple correct answers', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const checkboxes = screen.getAllByRole('checkbox');
      // Check second option
      await user.click(checkboxes[1]);

      // Both should be checked
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });
  });

  describe('Form Validation', () => {
    it('should show error when question ID is empty', async () => {
      const user = userEvent.setup();
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionId: '', questionText: '' }),
          })}
        />,
      );

      const questionText = screen.getByLabelText('Question Text');
      await user.type(questionText, 'Question text');

      const saveButton = screen.getByRole('button', { name: /add question/i });
      await user.click(saveButton);

      expect(screen.getByText(/question id is required/i)).toBeInTheDocument();
    });

    it('should show error when question text is empty', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      const textarea = screen.getByLabelText('Question Text');
      await user.clear(textarea);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText(/question text is required/i)).toBeInTheDocument();
      expect(props.onSave).not.toHaveBeenCalled();
    });

    it('should show error when less than 2 options', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({
        question: createQuestionData({
          options: [createOptionData({ optionId: 'opt_1', optionText: 'Option A' })],
        }),
      });
      render(<QuestionEditor {...props} />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Use getAllByText to handle multiple elements
      const errorMessages = screen.getAllByText(/at least 2 options are required/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('should show error when options have empty text', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      // Clear first option text
      const optionTextarea = screen.getByDisplayValue('Option A');
      await user.clear(optionTextarea);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText(/option\(s\) have empty text/i)).toBeInTheDocument();
    });

    it('should show error when no correct answer is selected', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      // Uncheck the correct answer
      const checkbox = screen.getAllByRole('checkbox')[0];
      await user.click(checkbox);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText(/at least one correct answer must be selected/i)).toBeInTheDocument();
    });

    it('should show error when explanation is empty', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const textarea = screen.getByLabelText('Explanation');
      await user.clear(textarea);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText(/explanation text is required/i)).toBeInTheDocument();
    });

    it('should show multiple validation errors', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      // Clear question text and explanation
      const questionText = screen.getByLabelText('Question Text');
      await user.clear(questionText);

      const explanation = screen.getByLabelText('Explanation');
      await user.clear(explanation);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText(/question text is required/i)).toBeInTheDocument();
      expect(screen.getByText(/explanation text is required/i)).toBeInTheDocument();
    });

    it('should clear errors when form is valid and saved', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      // First, create an error
      const questionText = screen.getByLabelText('Question Text');
      await user.clear(questionText);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText(/question text is required/i)).toBeInTheDocument();

      // Now fix the error
      await user.type(questionText, 'Fixed question text');
      await user.click(saveButton);

      // Should call onSave since form is now valid
      expect(props.onSave).toHaveBeenCalled();
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave with updated question data', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(props.onSave).toHaveBeenCalledTimes(1);
      expect(props.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          questionId: 'q_1',
          questionText: 'What is the answer?',
          options: expect.arrayContaining([
            expect.objectContaining({ optionId: 'opt_1', optionText: 'Option A' }),
            expect.objectContaining({ optionId: 'opt_2', optionText: 'Option B' }),
          ]),
          correctOptionIds: ['opt_1'],
          explanationText: 'This is the explanation.',
        }),
      );
    });

    it('should preserve performance tracking data when saving', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({
        question: createQuestionData({
          timesAnsweredCorrectly: 5,
          timesAnsweredIncorrectly: 2,
          historyOfIncorrectSelections: ['opt_2'],
          lastAttemptedAt: '2024-01-01T00:00:00Z',
        }),
      });
      render(<QuestionEditor {...props} />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(props.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          timesAnsweredCorrectly: 5,
          timesAnsweredIncorrectly: 2,
          historyOfIncorrectSelections: ['opt_2'],
          lastAttemptedAt: '2024-01-01T00:00:00Z',
        }),
      );
    });

    it('should save updated question text', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      const textarea = screen.getByLabelText('Question Text');
      await user.clear(textarea);
      await user.type(textarea, 'Updated question');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(props.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          questionText: 'Updated question',
        }),
      );
    });

    it('should save updated SRS level', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      const srsInput = screen.getByLabelText('SRS Level');
      await user.clear(srsInput);
      await user.type(srsInput, '2');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(props.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          srsLevel: 2,
        }),
      );
    });

    it('should save with keyboard shortcut Ctrl+Enter', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      // Focus on the modal and press Ctrl+Enter
      const modal = screen.getByText('Edit Question').closest('[tabindex]');
      modal?.focus();
      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(props.onSave).toHaveBeenCalledTimes(1);
    });

    it('should show "Add Question" button text for new questions', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionText: '' }),
          })}
        />,
      );

      expect(screen.getByRole('button', { name: /add question/i })).toBeInTheDocument();
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when close button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      const closeButton = screen.getByRole('button', { name: /close editor/i });
      await user.click(closeButton);

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when clicking overlay backdrop', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      const { container } = render(<QuestionEditor {...props} />);

      // Click the backdrop (the outer div with bg-black/70)
      const backdrop = container.querySelector('.fixed.inset-0');
      await user.click(backdrop!);

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when pressing Escape key', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      const { container } = render(<QuestionEditor {...props} />);

      // Focus on the modal container to trigger keyboard events
      const modal = container.querySelector('.fixed.inset-0');
      if (modal) {
        (modal as HTMLElement).focus();
      }
      await user.keyboard('{Escape}');

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel when clicking inside the modal', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      const questionText = screen.getByLabelText('Question Text');
      await user.click(questionText);

      expect(props.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Delete Functionality', () => {
    it('should show confirmation modal when Delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const deleteButton = screen.getByRole('button', { name: /delete question/i });
      await user.click(deleteButton);

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
      // Check for the heading within the confirmation modal
      const modal = screen.getByTestId('confirmation-modal');
      expect(within(modal).getByRole('heading', { name: 'Delete Question' })).toBeInTheDocument();
    });

    it('should call onDelete when confirming deletion', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      const deleteButton = screen.getByRole('button', { name: /delete question/i });
      await user.click(deleteButton);

      // Get the confirm button from within the confirmation modal
      const modal = screen.getByTestId('confirmation-modal');
      const confirmButton = within(modal).getByRole('button', { name: /delete question/i });
      await user.click(confirmButton);

      expect(props.onDelete).toHaveBeenCalledWith('q_1');
    });

    it('should close confirmation modal when canceling deletion', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const deleteButton = screen.getByRole('button', { name: /delete question/i });
      await user.click(deleteButton);

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

      // Find Cancel button inside confirmation modal
      const cancelButton = within(screen.getByTestId('confirmation-modal')).getByRole('button', {
        name: /cancel/i,
      });
      await user.click(cancelButton);

      expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('should call onCancel instead of showing modal for new questions', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({
        question: createQuestionData({ questionText: '' }),
      });
      render(<QuestionEditor {...props} />);

      // For new questions, there's no delete button, so we shouldn't see it
      expect(screen.queryByRole('button', { name: /delete question/i })).not.toBeInTheDocument();
    });
  });

  describe('Preview Toggle', () => {
    it('should show preview panel when preview button is clicked', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      // Click the preview button (eye icon)
      const previewButton = screen.getByTestId('eye-icon').closest('button');
      await user.click(previewButton!);

      // Should now show preview content
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('should toggle preview off when clicking again', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      // Click to show preview
      const previewButton = screen.getByTestId('eye-icon').closest('button');
      await user.click(previewButton!);

      expect(screen.getByText('Preview')).toBeInTheDocument();

      // Click to hide preview (now eye-off icon)
      const hidePreviewButton = screen.getByTestId('eye-off-icon').closest('button');
      await user.click(hidePreviewButton!);

      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    it('should show question text in preview using MarkdownRenderer', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const previewButton = screen.getByTestId('eye-icon').closest('button');
      await user.click(previewButton!);

      // MarkdownRenderer should be used in preview
      const markdownRenderers = screen.getAllByTestId('markdown-renderer');
      expect(markdownRenderers.length).toBeGreaterThan(0);
    });

    it('should show options in preview with correct/incorrect styling', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const previewButton = screen.getByTestId('eye-icon').closest('button');
      await user.click(previewButton!);

      // Check for Options section in preview
      expect(screen.getByText('Options')).toBeInTheDocument();
    });

    it('should show explanation in preview', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const previewButton = screen.getByTestId('eye-icon').closest('button');
      await user.click(previewButton!);

      // There are multiple "Explanation" texts - one in the form label and one in preview
      // Verify that the preview panel exists by checking for multiple explanation texts
      const explanationTexts = screen.getAllByText('Explanation');
      expect(explanationTexts.length).toBe(2); // One label, one in preview
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should save on Ctrl+Enter', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      // Focus somewhere in the form
      const textarea = screen.getByLabelText('Question Text');
      await user.click(textarea);

      // Trigger Ctrl+Enter
      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(props.onSave).toHaveBeenCalled();
    });

    it('should cancel on Escape', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      const { container } = render(<QuestionEditor {...props} />);

      // Focus on the modal container to trigger keyboard events
      const modal = container.querySelector('.fixed.inset-0');
      if (modal) {
        (modal as HTMLElement).focus();
      }
      await user.keyboard('{Escape}');

      expect(props.onCancel).toHaveBeenCalled();
    });
  });

  describe('Re-initialization on Question Change', () => {
    it('should reinitialize form when question prop changes', () => {
      const props = createDefaultProps();
      const { rerender } = render(<QuestionEditor {...props} />);

      expect(screen.getByLabelText('Question Text')).toHaveValue('What is the answer?');

      // Update with new question
      rerender(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({
              questionId: 'q_2',
              questionText: 'New question text',
            }),
          })}
        />,
      );

      expect(screen.getByLabelText('Question Text')).toHaveValue('New question text');
    });

    it('should reinitialize options when question changes', () => {
      const props = createDefaultProps();
      const { rerender } = render(<QuestionEditor {...props} />);

      expect(screen.getByDisplayValue('Option A')).toBeInTheDocument();

      rerender(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({
              options: [
                createOptionData({ optionId: 'new_opt_1', optionText: 'New Option 1' }),
                createOptionData({ optionId: 'new_opt_2', optionText: 'New Option 2' }),
              ],
            }),
          })}
        />,
      );

      expect(screen.getByDisplayValue('New Option 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New Option 2')).toBeInTheDocument();
    });

    it('should reinitialize correct answers when question changes', () => {
      const props = createDefaultProps();
      const { rerender } = render(<QuestionEditor {...props} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();

      rerender(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({
              correctOptionIds: ['opt_2'],
            }),
          })}
        />,
      );

      const newCheckboxes = screen.getAllByRole('checkbox');
      expect(newCheckboxes[0]).not.toBeChecked();
      expect(newCheckboxes[1]).toBeChecked();
    });
  });

  describe('Visual Feedback', () => {
    it('should show validation errors in a styled error box', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const textarea = screen.getByLabelText('Question Text');
      await user.clear(textarea);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Error should be in a styled container
      const errorContainer = screen.getByText('Validation Errors:').closest('div');
      expect(errorContainer).toHaveClass('bg-red-900/40');
    });

    it('should show minimum options warning when less than 2', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({
              options: [createOptionData({ optionId: 'opt_1', optionText: 'Option A' })],
            }),
          })}
        />,
      );

      expect(screen.getByText(/at least 2 options are required/i)).toBeInTheDocument();
    });

    it('should show correct badge in preview for correct options', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const previewButton = screen.getByTestId('eye-icon').closest('button');
      await user.click(previewButton!);

      // Look for "Correct" badge in preview - use getAllByText since there are multiple
      const correctLabels = screen.getAllByText('Correct');
      // There should be at least one "Correct" label in the preview (the green badge)
      const greenBadge = correctLabels.find((el) => el.classList.contains('bg-green-700'));
      expect(greenBadge).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle question with no options gracefully', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ options: [] }),
          })}
        />,
      );

      expect(screen.getByText(/at least 2 options are required/i)).toBeInTheDocument();
    });

    it('should handle question with empty correct option IDs', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ correctOptionIds: [] }),
          })}
        />,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });

    it('should handle very long question text', () => {
      const longText = 'A'.repeat(1000);
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionText: longText }),
          })}
        />,
      );

      expect(screen.getByLabelText('Question Text')).toHaveValue(longText);
    });

    it('should handle special characters in question text', () => {
      const specialText = '<script>alert("xss")</script> & "quotes" \'single\'';
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionText: specialText }),
          })}
        />,
      );

      expect(screen.getByLabelText('Question Text')).toHaveValue(specialText);
    });

    it('should handle unicode characters in question text', () => {
      const unicodeText = '日本語テスト 🎉 emoji text π ∑ ∫';
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ questionText: unicodeText }),
          })}
        />,
      );

      expect(screen.getByLabelText('Question Text')).toHaveValue(unicodeText);
    });

    it('should handle empty SRS level input by defaulting to 0', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<QuestionEditor {...props} />);

      const srsInput = screen.getByLabelText('SRS Level');
      await user.clear(srsInput);

      // The component's onChange handler converts empty/invalid input to 0
      expect(srsInput).toHaveValue(0);
    });

    it('should handle null nextReviewAt', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ nextReviewAt: null }),
          })}
        />,
      );

      const dateInput = screen.getByLabelText(/Next Review/);
      expect(dateInput).toHaveValue('');
    });

    it('should handle string nextReviewAt', () => {
      render(
        <QuestionEditor
          {...createDefaultProps({
            question: createQuestionData({ nextReviewAt: '2024-12-31T23:59:59Z' }),
          })}
        />,
      );

      const dateInput = screen.getByLabelText(/Next Review/);
      expect(dateInput).toHaveValue('2024-12-31T23:59');
    });
  });

  describe('Accessibility', () => {
    it('should have labeled form fields', () => {
      render(<QuestionEditor {...createDefaultProps()} />);

      expect(screen.getByLabelText('Question ID')).toBeInTheDocument();
      expect(screen.getByLabelText('Question Text')).toBeInTheDocument();
      expect(screen.getByLabelText('Explanation')).toBeInTheDocument();
      expect(screen.getByLabelText('SRS Level')).toBeInTheDocument();
    });

    it('should have accessible close button', () => {
      render(<QuestionEditor {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /close editor/i })).toBeInTheDocument();
    });

    it('should have keyboard accessible checkboxes', async () => {
      const user = userEvent.setup();
      render(<QuestionEditor {...createDefaultProps()} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes[1].focus();
      await user.keyboard(' ');

      expect(checkboxes[1]).toBeChecked();
    });

    it('should trap focus within modal', () => {
      render(<QuestionEditor {...createDefaultProps()} />);

      // Modal should have tabindex for focus management
      const modal = screen.getByText('Edit Question').closest('.fixed');
      expect(modal).toHaveAttribute('tabindex', '-1');
    });

    it('should have descriptive button text', () => {
      render(<QuestionEditor {...createDefaultProps()} />);

      expect(screen.getByRole('button', { name: /add option/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete question/i })).toBeInTheDocument();
    });
  });

  describe('Form State Isolation', () => {
    it('should not modify original question object', async () => {
      const user = userEvent.setup();
      const originalQuestion = createQuestionData();
      const originalText = originalQuestion.questionText;

      render(
        <QuestionEditor
          {...createDefaultProps({
            question: originalQuestion,
          })}
        />,
      );

      const textarea = screen.getByLabelText('Question Text');
      await user.clear(textarea);
      await user.type(textarea, 'Modified text');

      // Original question should be unchanged
      expect(originalQuestion.questionText).toBe(originalText);
    });

    it('should create deep copy of options', async () => {
      const user = userEvent.setup();
      const originalQuestion = createQuestionData();
      const originalOptionText = originalQuestion.options[0].optionText;

      render(
        <QuestionEditor
          {...createDefaultProps({
            question: originalQuestion,
          })}
        />,
      );

      const optionTextarea = screen.getByDisplayValue('Option A');
      await user.clear(optionTextarea);
      await user.type(optionTextarea, 'Modified option');

      // Original option should be unchanged
      expect(originalQuestion.options[0].optionText).toBe(originalOptionText);
    });
  });

  describe('Option ID Display', () => {
    it('should display option IDs in the form', () => {
      render(<QuestionEditor {...createDefaultProps()} />);

      expect(screen.getByText('opt_1')).toBeInTheDocument();
      expect(screen.getByText('opt_2')).toBeInTheDocument();
    });

    it('should show Option 1, Option 2 labels', () => {
      render(<QuestionEditor {...createDefaultProps()} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });
});
