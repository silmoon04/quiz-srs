import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizSession } from '@/components/quiz-session';
import { QuizModule, QuizQuestion } from '@/lib/schema/quiz';
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

describe('Announcer Smoke Tests', () => {
  let userEvent: ReturnType<typeof user.setup>;

  beforeEach(() => {
    userEvent = user.setup();
  });

  it('announces correctness via live region', async () => {
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

    render(
      <ScreenReaderAnnouncer>
        <QuizSession {...mockProps} />
      </ScreenReaderAnnouncer>,
    );

    // Select the correct option (option 2 with text "4")
    const correctOption = screen.getByRole('radio', { name: '4' });
    await userEvent.click(correctOption);

    // Submit the answer
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // Check that announcement appears in live region
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
});
