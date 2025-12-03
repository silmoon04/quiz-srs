import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizSession } from '@/components/quiz-session';
import { QuizModule, QuizQuestion, QuizOption } from '@/lib/schema/quiz';
import { ScreenReaderAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';

// Mock quiz data
const mockQuestion: QuizQuestion = {
  questionId: 'q1',
  questionText: 'What is 2 + 2?',
  options: [
    { optionId: 'opt1', optionText: '3' },
    { optionId: 'opt2', optionText: '4' },
    { optionId: 'opt3', optionText: '5' },
    { optionId: 'opt4', optionText: '6' },
  ],
  correctOptionIds: ['opt2'],
  explanationText: '2 + 2 = 4',
  type: 'mcq',
};

const mockChapter: QuizModule = {
  name: 'Basic Math',
  description: 'Basic math questions',
  chapters: [
    {
      id: 'ch1',
      name: 'Chapter 1: Basic Math',
      description: 'Basic math questions',
      questions: [mockQuestion],
      totalQuestions: 1,
      answeredQuestions: 0,
      correctAnswers: 0,
      isCompleted: false,
    },
  ],
} as QuizModule;

describe('Keyboardable Options + Roving Grid', () => {
  let userEvent: ReturnType<typeof user.setup>;

  beforeEach(() => {
    userEvent = user.setup();
  });

  // Default props that all tests can use
  const defaultProps = {
    chapter: mockChapter.chapters[0] as any,
    question: mockQuestion as any,
    currentQuestionIndex: 0,
    totalQuestions: 1,
    selectedOptionId: null,
    isSubmitted: false,
    onSelectOption: vi.fn(),
    onSubmitAnswer: vi.fn(),
    onNextQuestion: vi.fn(),
    onBackToDashboard: vi.fn(),
    onExportCurrentQuestionState: vi.fn(),
    onImportQuestionStateFromFile: vi.fn(),
    onRetryChapter: vi.fn(),
    onNavigateToQuestion: vi.fn(),
  };

  // Helper function to render QuizSession with ScreenReaderAnnouncer
  const renderQuizSession = (props: any) => {
    return render(
      <ScreenReaderAnnouncer>
        <QuizSession {...props} />
      </ScreenReaderAnnouncer>,
    );
  };

  describe('Option List Keyboard Navigation', () => {
    it('should have radiogroup semantics for option list', () => {
      const mockProps = {
        ...defaultProps,
        onSelectOption: vi.fn(),
      };

      renderQuizSession(mockProps);

      // Should have a radiogroup container
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();

      // Should have radio buttons for each option (limited to 5 max displayed)
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons.length).toBeGreaterThanOrEqual(1);
      expect(radioButtons.length).toBeLessThanOrEqual(5);
    });

    it('should handle arrow key navigation between options', async () => {
      const mockOnSelectOption = vi.fn();
      const mockProps = {
        ...defaultProps,
        onSelectOption: mockOnSelectOption,
      };

      renderQuizSession(mockProps);

      // Get all radio options
      const radioOptions = screen.getAllByRole('radio');
      expect(radioOptions.length).toBeGreaterThanOrEqual(1);

      // Focus the first option
      const firstOption = radioOptions[0];
      firstOption.focus();
      expect(firstOption).toHaveFocus();

      // Arrow down should move to next option
      await userEvent.keyboard('{ArrowDown}');
      if (radioOptions.length > 1) {
        const secondOption = radioOptions[1];
        expect(secondOption).toHaveFocus();

        // Arrow up should move to previous option
        await userEvent.keyboard('{ArrowUp}');
        expect(firstOption).toHaveFocus();
      }
    });

    it('should handle space and enter key selection', async () => {
      const mockOnSelectOption = vi.fn();
      const mockProps = {
        ...defaultProps,
        onSelectOption: mockOnSelectOption,
      };

      renderQuizSession(mockProps);

      // Get all radio options
      const radioOptions = screen.getAllByRole('radio');
      const firstOption = radioOptions[0];
      firstOption.focus();

      // Space should select the option
      await userEvent.keyboard(' ');
      expect(mockOnSelectOption).toHaveBeenCalled();
      const callCountAfterSpace = mockOnSelectOption.mock.calls.length;

      // Enter should also select the option (may fire multiple times due to event bubbling)
      await userEvent.keyboard('{Enter}');
      expect(mockOnSelectOption.mock.calls.length).toBeGreaterThan(callCountAfterSpace);
    });

    it('should maintain roving tabindex behavior', async () => {
      const mockProps = {
        ...defaultProps,
      };

      renderQuizSession(mockProps);

      const radioButtons = screen.getAllByRole('radio');

      // Only one option should have tabIndex 0 (the focused one)
      const tabbableOptions = radioButtons.filter((btn) => btn.getAttribute('tabIndex') === '0');
      expect(tabbableOptions).toHaveLength(1);

      // Focus the first option before arrow navigation
      const firstOption = radioButtons[0];
      firstOption.focus();

      // Arrow navigation should update tabindex
      await userEvent.keyboard('{ArrowDown}');

      const newTabbableOptions = radioButtons.filter((btn) => btn.getAttribute('tabIndex') === '0');
      expect(newTabbableOptions).toHaveLength(1);
      // After arrow down, the second option (if exists) or first (if wrap) should have focus
      if (radioButtons.length > 1) {
        expect(radioButtons[1]).toHaveFocus();
      } else {
        expect(radioButtons[0]).toHaveFocus();
      }
    });
  });

  describe('Question Navigation Grid', () => {
    const mockChapterWithMultipleQuestions: QuizModule = {
      name: 'Multiple Questions',
      description: 'Multiple questions module',
      chapters: [
        {
          id: 'ch1',
          name: 'Chapter 1: Multiple Questions',
          description: 'Multiple questions chapter',
          questions: [
            { ...mockQuestion, questionId: 'q1', questionText: 'Question 1' },
            { ...mockQuestion, questionId: 'q2', questionText: 'Question 2' },
            { ...mockQuestion, questionId: 'q3', questionText: 'Question 3' },
            { ...mockQuestion, questionId: 'q4', questionText: 'Question 4' },
          ],
          totalQuestions: 4,
          answeredQuestions: 0,
          correctAnswers: 0,
          isCompleted: false,
        },
      ],
    } as QuizModule;

    it('should have grid semantics for question navigation', async () => {
      const mockOnNavigateToQuestion = vi.fn();
      const mockProps = {
        ...defaultProps,
        chapter: mockChapterWithMultipleQuestions.chapters[0] as any,
        question: mockChapterWithMultipleQuestions.chapters[0].questions[0] as any,
        totalQuestions: 4,
        onNavigateToQuestion: mockOnNavigateToQuestion,
      };

      renderQuizSession(mockProps);

      // Should have a grid container
      const questionGrid = screen.getByRole('grid');
      expect(questionGrid).toBeInTheDocument();

      // Should have gridcell buttons
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(4);
    });

    it('should handle arrow key navigation in question grid', async () => {
      const mockOnNavigateToQuestion = vi.fn();
      const mockProps = {
        ...defaultProps,
        chapter: mockChapterWithMultipleQuestions.chapters[0] as any,
        question: mockChapterWithMultipleQuestions.chapters[0].questions[0] as any,
        totalQuestions: 4,
        onNavigateToQuestion: mockOnNavigateToQuestion,
      };

      renderQuizSession(mockProps);

      // Get the first question button
      const gridCells = screen.getAllByRole('gridcell');
      const firstButton = gridCells[0];
      firstButton.focus();
      expect(firstButton).toHaveFocus();

      // Arrow right should move focus to next question
      await userEvent.keyboard('{ArrowRight}');
      const secondButton = gridCells[1];
      expect(secondButton).toHaveFocus();

      // Arrow left should move focus to previous question
      await userEvent.keyboard('{ArrowLeft}');
      expect(firstButton).toHaveFocus();
    });

    it('should handle Home and End keys in question grid', async () => {
      const mockOnNavigateToQuestion = vi.fn();
      const mockProps = {
        ...defaultProps,
        chapter: mockChapterWithMultipleQuestions.chapters[0] as any,
        question: mockChapterWithMultipleQuestions.chapters[0].questions[1] as any, // Start at question 2
        currentQuestionIndex: 1,
        totalQuestions: 4,
        onNavigateToQuestion: mockOnNavigateToQuestion,
      };

      renderQuizSession(mockProps);

      const gridCells = screen.getAllByRole('gridcell');
      // The focused cell should be the second one initially (index 1)
      const secondButton = gridCells[1];
      secondButton.focus();

      // Home should focus first question
      await userEvent.keyboard('{Home}');
      const firstButton = gridCells[0];
      expect(firstButton).toHaveFocus();

      // End should focus last question
      await userEvent.keyboard('{End}');
      const lastButton = gridCells[3];
      expect(lastButton).toHaveFocus();
    });

    it('should wrap around at grid boundaries', async () => {
      const mockOnNavigateToQuestion = vi.fn();
      const mockProps = {
        ...defaultProps,
        chapter: mockChapterWithMultipleQuestions.chapters[0] as any,
        question: mockChapterWithMultipleQuestions.chapters[0].questions[0] as any,
        currentQuestionIndex: 0,
        totalQuestions: 4,
        onNavigateToQuestion: mockOnNavigateToQuestion,
      };

      renderQuizSession(mockProps);

      const gridCells = screen.getAllByRole('gridcell');
      const firstButton = gridCells[0];
      firstButton.focus();
      expect(firstButton).toHaveFocus();

      // Arrow left from first should wrap to last
      await userEvent.keyboard('{ArrowLeft}');
      const lastButton = gridCells[3];
      expect(lastButton).toHaveFocus();

      // Arrow right from last should wrap to first
      await userEvent.keyboard('{ArrowRight}');
      expect(firstButton).toHaveFocus();
    });

    it('should handle space and enter to navigate to questions', async () => {
      const mockOnNavigateToQuestion = vi.fn();
      const mockProps = {
        ...defaultProps,
        chapter: mockChapterWithMultipleQuestions.chapters[0] as any,
        question: mockChapterWithMultipleQuestions.chapters[0].questions[0] as any,
        totalQuestions: 4,
        onNavigateToQuestion: mockOnNavigateToQuestion,
      };

      renderQuizSession(mockProps);

      const gridCells = screen.getAllByRole('gridcell');
      const firstButton = gridCells[0];
      firstButton.focus();

      // Space should navigate to the question
      await userEvent.keyboard(' ');
      expect(mockOnNavigateToQuestion).toHaveBeenCalledWith(0);
      const callCountAfterSpace = mockOnNavigateToQuestion.mock.calls.length;

      // Enter should also navigate to the question (may fire multiple times due to event bubbling)
      await userEvent.keyboard('{Enter}');
      expect(mockOnNavigateToQuestion).toHaveBeenCalledWith(0);
      expect(mockOnNavigateToQuestion.mock.calls.length).toBeGreaterThan(callCountAfterSpace);
    });
  });
});
