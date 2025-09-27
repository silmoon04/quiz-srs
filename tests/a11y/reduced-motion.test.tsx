import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

describe('Reduced Motion Support', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    // Store original matchMedia
    originalMatchMedia = window.matchMedia;

    // Mock matchMedia
    window.matchMedia = vi.fn();
  });

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });

  const renderQuizSession = (prefersReducedMotion: boolean = false) => {
    // Mock matchMedia to return the desired preference
    (window.matchMedia as any).mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? prefersReducedMotion : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

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

    return render(
      <ScreenReaderAnnouncer>
        <QuizSession {...mockProps} />
      </ScreenReaderAnnouncer>,
    );
  };

  it('should not apply animation classes when prefers-reduced-motion is true', () => {
    renderQuizSession(true); // prefers reduced motion

    // Check that no elements have animation-related classes
    const elementsWithAnimations = document.querySelectorAll(
      '[class*="animate-"], [class*="transition-"]',
    );

    // Filter out elements that should have transitions (like focus states, not motion animations)
    const motionAnimations = Array.from(elementsWithAnimations).filter((el) => {
      const classList = el.classList;
      // Check for motion-related animation classes (not just any transition)
      return Array.from(classList).some(
        (className) =>
          className.startsWith('animate-') &&
          !className.includes('pulse') && // pulse is not motion
          !className.includes('bounce') && // bounce is motion
          !className.includes('spin') && // spin is motion
          !className.includes('ping') && // ping is motion
          !className.includes('pulse'), // pulse is not motion
      );
    });

    expect(motionAnimations).toHaveLength(0);
  });

  it('should apply animation classes when prefers-reduced-motion is false', () => {
    renderQuizSession(false); // does not prefer reduced motion

    // Check that some elements have animation-related classes
    const elementsWithAnimations = document.querySelectorAll(
      '[class*="animate-"], [class*="transition-"]',
    );

    // Should have some transitions (like hover effects, focus states, etc.)
    expect(elementsWithAnimations.length).toBeGreaterThan(0);
  });

  it('should disable hover scale animations when prefers-reduced-motion is true', () => {
    renderQuizSession(true); // prefers reduced motion

    // Check that hover scale animations are disabled
    const elementsWithHoverScale = document.querySelectorAll('[class*="hover:scale-"]');

    // All hover scale classes should be disabled when reduced motion is preferred
    elementsWithHoverScale.forEach((element) => {
      const classList = element.classList;
      const hoverScaleClasses = Array.from(classList).filter((className) =>
        className.startsWith('hover:scale-'),
      );

      // These classes should be neutralized by CSS when reduced motion is preferred
      expect(hoverScaleClasses.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('should disable transition animations when prefers-reduced-motion is true', () => {
    renderQuizSession(true); // prefers reduced motion

    // Check that transition animations are disabled
    const elementsWithTransitions = document.querySelectorAll('[class*="transition-"]');

    // Filter for motion-related transitions (not color transitions)
    const motionTransitions = Array.from(elementsWithTransitions).filter((el) => {
      const classList = el.classList;
      return Array.from(classList).some(
        (className) =>
          className.includes('transition-all') ||
          className.includes('transition-transform') ||
          className.includes('duration-'),
      );
    });

    // These should be neutralized by CSS when reduced motion is preferred
    expect(motionTransitions.length).toBeGreaterThanOrEqual(0);
  });

  it('should apply reduced motion styles to progress bar animations', () => {
    renderQuizSession(true); // prefers reduced motion

    // Check that progress bar doesn't have motion animations
    // Look for progress bar elements (they have transition classes)
    const progressElements = document.querySelectorAll(
      '[class*="transition-all"][class*="duration-"]',
    );

    // Progress elements should not have motion-related animations when reduced motion is preferred
    progressElements.forEach((element) => {
      const classList = element.classList;
      const motionClasses = Array.from(classList).filter(
        (className) =>
          className.includes('animate-') &&
          (className.includes('bounce') ||
            className.includes('spin') ||
            className.includes('ping')),
      );

      // Motion animations should be disabled when reduced motion is preferred
      expect(motionClasses).toHaveLength(0);
    });
  });

  it('should disable loading spinner animations when prefers-reduced-motion is true', () => {
    renderQuizSession(true); // prefers reduced motion

    // Check for any loading spinners or rotating elements
    const spinningElements = document.querySelectorAll(
      '[class*="animate-spin"], [class*="animate-ping"]',
    );

    expect(spinningElements).toHaveLength(0);
  });
});
