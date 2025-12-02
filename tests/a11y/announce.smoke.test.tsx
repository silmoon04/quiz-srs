import { render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizSession } from '@/components/quiz-session';
import type { QuizModule, QuizQuestion, QuizChapter } from '@/types/quiz-types';
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
  status: 'not_attempted',
  timesAnsweredCorrectly: 0,
  timesAnsweredIncorrectly: 0,
  historyOfIncorrectSelections: [],
  srsLevel: 0,
  nextReviewAt: null,
  shownIncorrectOptionIds: [],
};

const mockChapter: QuizChapter = {
  id: 'ch1',
  name: 'Chapter 1: Basic Math',
  description: 'Basic math questions',
  questions: [mockQuestion],
  totalQuestions: 1,
  answeredQuestions: 0,
  correctAnswers: 0,
  isCompleted: false,
};

const mockModule: QuizModule = {
  name: 'Basic Math',
  description: 'Basic math questions',
  chapters: [mockChapter],
};

describe('Announcer Smoke Tests', () => {
  let userEvent: ReturnType<typeof user.setup>;

  beforeEach(() => {
    userEvent = user.setup();
  });

  it('renders ScreenReaderAnnouncer with live region', () => {
    render(
      <ScreenReaderAnnouncer>
        <div>Test content</div>
      </ScreenReaderAnnouncer>,
    );

    // Verify the live region is present
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('has radiogroup for answer options', async () => {
    const mockProps = {
      chapter: mockChapter,
      question: mockQuestion,
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

    // Check that the radiogroup exists with proper accessible label
    const radiogroup = screen.getByRole('radiogroup', { name: /answer options/i });
    expect(radiogroup).toBeInTheDocument();

    // Check that radio buttons exist within the radiogroup
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons.length).toBeGreaterThan(0);
  });

  it('has live region in quiz session context', async () => {
    const mockProps = {
      chapter: mockChapter,
      question: mockQuestion,
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

    // Check that the live region exists with proper ARIA attributes
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });
});
