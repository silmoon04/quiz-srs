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

      renderQuizSession(mockProps);

      // Should have a radiogroup container
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();

      // Should have radio buttons for each option
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(4);
    });

    it('should handle arrow key navigation between options', async () => {
      const mockOnSelectOption = vi.fn();
      const mockProps = {
        chapter: mockChapter.chapters[0] as any,
        question: mockQuestion as any,
        currentQuestionIndex: 0,
        totalQuestions: 1,
        selectedOptionId: null,
        isSubmitted: false,
        onSelectOption: mockOnSelectOption,
        onSubmitAnswer: vi.fn(),
        onNextQuestion: vi.fn(),
        onBackToDashboard: vi.fn(),
        onExportCurrentQuestionState: vi.fn(),
        onImportQuestionStateFromFile: vi.fn(),
        onRetryChapter: vi.fn(),
        onNavigateToQuestion: vi.fn(),
      };

      renderQuizSession(mockProps);

      // Get all radio options
      const radioOptions = screen.getAllByRole('radio');
      expect(radioOptions).toHaveLength(4);

      // Focus the first option
      const firstOption = radioOptions[0];
      firstOption.focus();
      expect(firstOption).toHaveFocus();

      // Arrow down should move to next option
      await userEvent.keyboard('{ArrowDown}');
      const secondOption = radioOptions[1];
      expect(secondOption).toHaveFocus();

      // Arrow up should move to previous option
      await userEvent.keyboard('{ArrowUp}');
      expect(firstOption).toHaveFocus();

      // Arrow down to last option
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');
      const lastOption = radioOptions[3];
      expect(lastOption).toHaveFocus();

      // Arrow down from last should wrap to first
      await userEvent.keyboard('{ArrowDown}');
      expect(firstOption).toHaveFocus();
    });

    it('should handle space and enter key selection', async () => {
      const mockOnSelectOption = vi.fn();
      const mockProps = {
        chapter: mockChapter.chapters[0] as any,
        question: mockQuestion as any,
        currentQuestionIndex: 0,
        totalQuestions: 1,
        selectedOptionId: null,
        isSubmitted: false,
        onSelectOption: mockOnSelectOption,
        onSubmitAnswer: vi.fn(),
        onNextQuestion: vi.fn(),
        onBackToDashboard: vi.fn(),
        onExportCurrentQuestionState: vi.fn(),
        onImportQuestionStateFromFile: vi.fn(),
        onRetryChapter: vi.fn(),
        onNavigateToQuestion: vi.fn(),
      };

      renderQuizSession(mockProps);

      // Get all radio options
      const radioOptions = screen.getAllByRole('radio');
      const firstOption = radioOptions[0];
      firstOption.focus();

      // Space should select the option
      await userEvent.keyboard(' ');
      expect(mockOnSelectOption).toHaveBeenCalled();

      // Move to second option and use Enter
      await userEvent.keyboard('{ArrowDown}');
      const secondOption = radioOptions[1];
      expect(secondOption).toHaveFocus();

      await userEvent.keyboard('{Enter}');
      expect(mockOnSelectOption).toHaveBeenCalledTimes(2);
    });

    it('should maintain roving tabindex behavior', async () => {
      const mockProps = {
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

      renderQuizSession(mockProps);

      const radioButtons = screen.getAllByRole('radio');

      // Only one option should have tabIndex 0 (the focused one)
      const tabbableOptions = radioButtons.filter((btn) => btn.getAttribute('tabIndex') === '0');
      expect(tabbableOptions).toHaveLength(1);

      // Arrow navigation should update tabindex
      await userEvent.keyboard('{ArrowDown}');

      const newTabbableOptions = radioButtons.filter((btn) => btn.getAttribute('tabIndex') === '0');
      expect(newTabbableOptions).toHaveLength(1);
      expect(newTabbableOptions[0]).toHaveFocus();
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

    it('should handle arrow key navigation in question grid', async () => {
      const mockOnNavigateToQuestion = vi.fn();
      const mockProps = {
        chapter: mockChapterWithMultipleQuestions.chapters[0] as any,
        question: mockChapterWithMultipleQuestions.chapters[0].questions[0] as any,
        currentQuestionIndex: 0,
        totalQuestions: 4,
        selectedOptionId: null,
        isSubmitted: false,
        onSelectOption: vi.fn(),
        onSubmitAnswer: vi.fn(),
        onNextQuestion: vi.fn(),
        onBackToDashboard: vi.fn(),
        onNavigateToQuestion: mockOnNavigateToQuestion,
      };

      renderQuizSession(mockProps);

      // Focus the question navigation grid
      const questionGrid = screen.getByRole('grid');
      expect(questionGrid).toBeInTheDocument();

      // Get the current question button (should be focused)
      const currentQuestionButton = screen.getByRole('gridcell', {
        name: /navigate to question 1/i,
      });
      currentQuestionButton.focus();

      // Arrow right should move focus to next question
      await userEvent.keyboard('{ArrowRight}');
      const secondQuestionButton = screen.getByRole('gridcell', {
        name: /navigate to question 2/i,
      });
      expect(secondQuestionButton).toHaveFocus();

      // Arrow left should move focus to previous question
      await userEvent.keyboard('{ArrowLeft}');
      expect(currentQuestionButton).toHaveFocus();
    });

    it('should handle Home and End keys in question grid', async () => {
      const mockOnNavigateToQuestion = vi.fn();
      const mockProps = {
        chapter: mockChapterWithMultipleQuestions.chapters[0] as any,
        question: mockChapterWithMultipleQuestions.chapters[0].questions[1] as any, // Start at question 2
        currentQuestionIndex: 1,
        totalQuestions: 4,
        selectedOptionId: null,
        isSubmitted: false,
        onSelectOption: vi.fn(),
        onSubmitAnswer: vi.fn(),
        onNextQuestion: vi.fn(),
        onBackToDashboard: vi.fn(),
        onNavigateToQuestion: mockOnNavigateToQuestion,
      };

      renderQuizSession(mockProps);

      const currentQuestionButton = screen.getByRole('gridcell', {
        name: /navigate to question 2/i,
      });
      currentQuestionButton.focus();

      // Home should focus first question
      await userEvent.keyboard('{Home}');
      const firstQuestionButton = screen.getByRole('gridcell', { name: /navigate to question 1/i });
      expect(firstQuestionButton).toHaveFocus();

      // End should focus last question
      await userEvent.keyboard('{End}');
      const lastQuestionButton = screen.getByRole('gridcell', { name: /navigate to question 4/i });
      expect(lastQuestionButton).toHaveFocus();
    });

    it('should wrap around at grid boundaries', async () => {
      const mockOnNavigateToQuestion = vi.fn();
      const mockProps = {
        chapter: mockChapterWithMultipleQuestions.chapters[0] as any,
        question: mockChapterWithMultipleQuestions.chapters[0].questions[0] as any, // First question
        currentQuestionIndex: 0,
        totalQuestions: 4,
        selectedOptionId: null,
        isSubmitted: false,
        onSelectOption: vi.fn(),
        onSubmitAnswer: vi.fn(),
        onNextQuestion: vi.fn(),
        onBackToDashboard: vi.fn(),
        onNavigateToQuestion: mockOnNavigateToQuestion,
      };

      const { rerender } = renderQuizSession(mockProps);

      const currentQuestionButton = screen.getByRole('gridcell', {
        name: /navigate to question 1/i,
      });
      currentQuestionButton.focus();

      // Arrow left from first should wrap to last
      await userEvent.keyboard('{ArrowLeft}');
      const lastQuestionButton = screen.getByRole('gridcell', { name: /navigate to question 4/i });
      expect(lastQuestionButton).toHaveFocus();

      // Reset to last question
      const lastQuestionProps = {
        ...mockProps,
        question: mockChapterWithMultipleQuestions.chapters[0].questions[3] as any,
        currentQuestionIndex: 3,
        onExportCurrentQuestionState: vi.fn(),
        onImportQuestionStateFromFile: vi.fn(),
        onRetryChapter: vi.fn(),
      };

      // Re-render with the new props
      rerender(
        <ScreenReaderAnnouncer>
          <QuizSession {...lastQuestionProps} />
        </ScreenReaderAnnouncer>,
      );

      const lastQuestionButton2 = screen.getByRole('gridcell', { name: /navigate to question 4/i });
      lastQuestionButton2.focus();

      // Arrow right from last should wrap to first
      await userEvent.keyboard('{ArrowRight}');
      const firstQuestionButton = screen.getByRole('gridcell', { name: /navigate to question 1/i });
      expect(firstQuestionButton).toHaveFocus();
    });

    it('should handle space and enter to navigate to questions', async () => {
      const mockOnNavigateToQuestion = vi.fn();
      const mockProps = {
        chapter: mockChapterWithMultipleQuestions.chapters[0] as any,
        question: mockChapterWithMultipleQuestions.chapters[0].questions[0] as any,
        currentQuestionIndex: 0,
        totalQuestions: 4,
        selectedOptionId: null,
        isSubmitted: false,
        onSelectOption: vi.fn(),
        onSubmitAnswer: vi.fn(),
        onNextQuestion: vi.fn(),
        onBackToDashboard: vi.fn(),
        onNavigateToQuestion: mockOnNavigateToQuestion,
      };

      renderQuizSession(mockProps);

      const questionButton = screen.getByRole('gridcell', { name: /navigate to question 1/i });
      questionButton.focus();

      // Space should navigate to the question
      await userEvent.keyboard(' ');
      expect(mockOnNavigateToQuestion).toHaveBeenCalledWith(0);

      // Enter should also navigate to the question
      await userEvent.keyboard('{Enter}');
      expect(mockOnNavigateToQuestion).toHaveBeenCalledWith(0);
    });
  });
});
