/**
 * Quiz Store Unit Tests
 *
 * TDD Step 1: Write tests first (RED)
 * Tests the Zustand store slices in isolation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useQuizStore, type QuizState } from '@/store/quiz-store';
import type { QuizModule, QuizQuestion, DisplayedOption } from '@/types/quiz-types';
import * as srsEngine from '@/lib/engine/srs';

// Mock quiz data for testing
const createMockQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  questionId: 'q1',
  questionText: 'Test question?',
  options: [
    { optionId: 'a', optionText: 'Option A' },
    { optionId: 'b', optionText: 'Option B' },
  ],
  correctOptionIds: ['a'],
  explanationText: 'Explanation',
  status: 'not_attempted',
  srsLevel: 0,
  timesAnsweredCorrectly: 0,
  timesAnsweredIncorrectly: 0,
  ...overrides,
});

const createMockModule = (overrides: Partial<QuizModule> = {}): QuizModule => ({
  name: 'Test Quiz',
  description: 'Test description',
  chapters: [
    {
      id: 'ch1',
      name: 'Chapter 1',
      questions: [createMockQuestion(), createMockQuestion({ questionId: 'q2' })],
      totalQuestions: 2,
      answeredQuestions: 0,
      correctAnswers: 0,
      isCompleted: false,
    },
  ],
  ...overrides,
});

describe('Quiz Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useQuizStore.setState(useQuizStore.getInitialState());
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useQuizStore.getState();

      expect(state.appState).toBe('welcome');
      expect(state.currentModule).toBeNull();
      expect(state.currentChapterId).toBe('');
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.selectedOptionId).toBeNull();
      expect(state.isSubmitted).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('');
      expect(state.editingQuestionData).toBeNull();
    });
  });

  describe('Quiz Data Actions', () => {
    it('should set current module', () => {
      const testModule = createMockModule();

      act(() => {
        useQuizStore.getState().setCurrentModule(testModule);
      });

      expect(useQuizStore.getState().currentModule).toEqual(testModule);
    });

    it('should clear quiz data', () => {
      // Set some data first
      act(() => {
        useQuizStore.getState().setCurrentModule(createMockModule());
        useQuizStore.getState().setAppState('quiz');
      });

      // Clear
      act(() => {
        useQuizStore.getState().clearQuizData();
      });

      const state = useQuizStore.getState();
      expect(state.currentModule).toBeNull();
      expect(state.appState).toBe('welcome');
    });
  });

  describe('Session Actions', () => {
    beforeEach(() => {
      // Setup a quiz before session tests
      act(() => {
        useQuizStore.getState().setCurrentModule(createMockModule());
        useQuizStore.getState().setCurrentChapterId('ch1');
      });
    });

    it('should set app state', () => {
      act(() => {
        useQuizStore.getState().setAppState('dashboard');
      });

      expect(useQuizStore.getState().appState).toBe('dashboard');
    });

    it('should navigate to next question', () => {
      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);

      act(() => {
        useQuizStore.getState().nextQuestion();
      });

      expect(useQuizStore.getState().currentQuestionIndex).toBe(1);
    });

    it('should not exceed question count when navigating next', () => {
      // Move to last question
      act(() => {
        useQuizStore.getState().setCurrentQuestionIndex(1); // Last question (index 1 of 2)
        useQuizStore.getState().nextQuestion();
      });

      // Should stay at last question or handle gracefully
      expect(useQuizStore.getState().currentQuestionIndex).toBeLessThanOrEqual(1);
    });

    it('should navigate to previous question', () => {
      act(() => {
        useQuizStore.getState().setCurrentQuestionIndex(1);
        useQuizStore.getState().previousQuestion();
      });

      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
    });

    it('should not go below 0 when navigating previous', () => {
      act(() => {
        useQuizStore.getState().previousQuestion();
      });

      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
    });

    it('should select an option', () => {
      act(() => {
        useQuizStore.getState().selectOption('a');
      });

      expect(useQuizStore.getState().selectedOptionId).toBe('a');
    });

    it('should submit answer', () => {
      act(() => {
        useQuizStore.getState().selectOption('a');
        useQuizStore.getState().submitAnswer();
      });

      expect(useQuizStore.getState().isSubmitted).toBe(true);
    });

    it('should reset question state on next question', () => {
      act(() => {
        useQuizStore.getState().selectOption('a');
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().nextQuestion();
      });

      expect(useQuizStore.getState().selectedOptionId).toBeNull();
      expect(useQuizStore.getState().isSubmitted).toBe(false);
    });
  });

  describe('UI Actions', () => {
    it('should set loading state', () => {
      act(() => {
        useQuizStore.getState().setIsLoading(true);
      });

      expect(useQuizStore.getState().isLoading).toBe(true);
    });

    it('should set error', () => {
      act(() => {
        useQuizStore.getState().setError('Test error');
      });

      expect(useQuizStore.getState().error).toBe('Test error');
    });

    it('should clear error', () => {
      act(() => {
        useQuizStore.getState().setError('Test error');
        useQuizStore.getState().clearError();
      });

      expect(useQuizStore.getState().error).toBe('');
    });

    describe('Editing Question Data', () => {
      it('should initialize editingQuestionData as null', () => {
        const state = useQuizStore.getState();
        expect(state.editingQuestionData).toBeNull();
      });

      it('should set editingQuestionData to a question', () => {
        const mockQuestion = createMockQuestion({ questionId: 'edit-q1' });

        act(() => {
          useQuizStore.getState().setEditingQuestionData(mockQuestion);
        });

        const state = useQuizStore.getState();
        expect(state.editingQuestionData).toEqual(mockQuestion);
        expect(state.editingQuestionData?.questionId).toBe('edit-q1');
      });

      it('should set editingQuestionData to null using setEditingQuestionData', () => {
        const mockQuestion = createMockQuestion();

        act(() => {
          useQuizStore.getState().setEditingQuestionData(mockQuestion);
        });

        expect(useQuizStore.getState().editingQuestionData).not.toBeNull();

        act(() => {
          useQuizStore.getState().setEditingQuestionData(null);
        });

        expect(useQuizStore.getState().editingQuestionData).toBeNull();
      });

      it('should clear editingQuestionData using clearEditingQuestionData', () => {
        const mockQuestion = createMockQuestion({ questionId: 'clear-test' });

        act(() => {
          useQuizStore.getState().setEditingQuestionData(mockQuestion);
        });

        expect(useQuizStore.getState().editingQuestionData).not.toBeNull();

        act(() => {
          useQuizStore.getState().clearEditingQuestionData();
        });

        expect(useQuizStore.getState().editingQuestionData).toBeNull();
      });

      it('should preserve other state when setting editingQuestionData', () => {
        const mockQuestion = createMockQuestion();

        act(() => {
          useQuizStore.getState().setIsLoading(true);
          useQuizStore.getState().setError('Some error');
          useQuizStore.getState().setEditingQuestionData(mockQuestion);
        });

        const state = useQuizStore.getState();
        expect(state.isLoading).toBe(true);
        expect(state.error).toBe('Some error');
        expect(state.editingQuestionData).toEqual(mockQuestion);
      });
    });
  });

  describe('SRS Session Actions', () => {
    it('should start review session', () => {
      act(() => {
        useQuizStore.getState().startReviewSession();
      });

      expect(useQuizStore.getState().isReviewSessionActive).toBe(true);
    });

    it('should end review session', () => {
      act(() => {
        useQuizStore.getState().startReviewSession();
        useQuizStore.getState().endReviewSession();
      });

      expect(useQuizStore.getState().isReviewSessionActive).toBe(false);
      expect(useQuizStore.getState().currentReviewQuestion).toBeNull();
    });
  });

  describe('Computed Values (Selectors)', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setCurrentModule(createMockModule());
        useQuizStore.getState().setCurrentChapterId('ch1');
      });
    });

    it('should get current chapter', () => {
      const state = useQuizStore.getState();
      const chapter = state.getCurrentChapter();

      expect(chapter).not.toBeNull();
      expect(chapter?.id).toBe('ch1');
    });

    it('should get current question', () => {
      const state = useQuizStore.getState();
      const question = state.getCurrentQuestion();

      expect(question).not.toBeNull();
      expect(question?.questionId).toBe('q1');
    });

    it('should return null for current question when no module', () => {
      act(() => {
        useQuizStore.getState().clearQuizData();
      });

      const question = useQuizStore.getState().getCurrentQuestion();
      expect(question).toBeNull();
    });

    it('should get total questions in chapter', () => {
      const state = useQuizStore.getState();
      const total = state.getTotalQuestionsInChapter();

      expect(total).toBe(2);
    });
  });

  describe('startQuiz Action', () => {
    beforeEach(() => {
      // Setup module and dirty state before each test
      act(() => {
        useQuizStore.getState().setCurrentModule(createMockModule());
        // Set dirty state to ensure startQuiz resets everything
        useQuizStore.getState().setCurrentChapterId('old-chapter');
        useQuizStore.getState().setCurrentQuestionIndex(5);
        useQuizStore.getState().selectOption('some-option');
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().setAnswerRecord('q1', {
          selectedOptionId: 'a',
          isCorrect: true,
          displayedOptionIds: ['a', 'b'],
          timestamp: new Date().toISOString(),
        });
        useQuizStore.getState().startReviewSession();
        useQuizStore.getState().setCurrentReviewQuestion({
          chapterId: 'ch1',
          question: createMockQuestion(),
        });
        useQuizStore.getState().addToSessionHistory({
          questionSnapshot: createMockQuestion(),
          selectedOptionId: 'a',
          displayedOptions: [
            { optionId: 'a', optionText: 'Option A' },
            { optionId: 'b', optionText: 'Option B' },
          ],
          isCorrect: true,
          isReviewSessionQuestion: false,
          chapterId: 'ch1',
        });
        useQuizStore.getState().setHistoryViewIndex(0);
        useQuizStore.getState().setAppState('dashboard');
      });
    });

    it('should set currentChapterId to provided chapterId', () => {
      act(() => {
        useQuizStore.getState().startQuiz('new-chapter');
      });

      expect(useQuizStore.getState().currentChapterId).toBe('new-chapter');
    });

    it('should reset currentQuestionIndex to 0', () => {
      expect(useQuizStore.getState().currentQuestionIndex).toBe(5);

      act(() => {
        useQuizStore.getState().startQuiz('ch1');
      });

      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
    });

    it('should clear selectedOptionId to null', () => {
      expect(useQuizStore.getState().selectedOptionId).not.toBeNull();

      act(() => {
        useQuizStore.getState().startQuiz('ch1');
      });

      expect(useQuizStore.getState().selectedOptionId).toBeNull();
    });

    it('should set isSubmitted to false', () => {
      expect(useQuizStore.getState().isSubmitted).toBe(true);

      act(() => {
        useQuizStore.getState().startQuiz('ch1');
      });

      expect(useQuizStore.getState().isSubmitted).toBe(false);
    });

    it('should clear answerRecords to empty object', () => {
      expect(Object.keys(useQuizStore.getState().answerRecords).length).toBeGreaterThan(0);

      act(() => {
        useQuizStore.getState().startQuiz('ch1');
      });

      expect(useQuizStore.getState().answerRecords).toEqual({});
    });

    it('should set isReviewSessionActive to false', () => {
      expect(useQuizStore.getState().isReviewSessionActive).toBe(true);

      act(() => {
        useQuizStore.getState().startQuiz('ch1');
      });

      expect(useQuizStore.getState().isReviewSessionActive).toBe(false);
    });

    it('should clear currentReviewQuestion to null', () => {
      expect(useQuizStore.getState().currentReviewQuestion).not.toBeNull();

      act(() => {
        useQuizStore.getState().startQuiz('ch1');
      });

      expect(useQuizStore.getState().currentReviewQuestion).toBeNull();
    });

    it('should clear sessionHistory to empty array', () => {
      expect(useQuizStore.getState().sessionHistory.length).toBeGreaterThan(0);

      act(() => {
        useQuizStore.getState().startQuiz('ch1');
      });

      expect(useQuizStore.getState().sessionHistory).toEqual([]);
    });

    it('should set currentHistoryViewIndex to null', () => {
      expect(useQuizStore.getState().currentHistoryViewIndex).not.toBeNull();

      act(() => {
        useQuizStore.getState().startQuiz('ch1');
      });

      expect(useQuizStore.getState().currentHistoryViewIndex).toBeNull();
    });

    it('should set appState to quiz', () => {
      expect(useQuizStore.getState().appState).toBe('dashboard');

      act(() => {
        useQuizStore.getState().startQuiz('ch1');
      });

      expect(useQuizStore.getState().appState).toBe('quiz');
    });

    it('should reset all session state in a single call', () => {
      act(() => {
        useQuizStore.getState().startQuiz('new-chapter-id');
      });

      const state = useQuizStore.getState();
      expect(state.currentChapterId).toBe('new-chapter-id');
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.selectedOptionId).toBeNull();
      expect(state.isSubmitted).toBe(false);
      expect(state.answerRecords).toEqual({});
      expect(state.isReviewSessionActive).toBe(false);
      expect(state.currentReviewQuestion).toBeNull();
      expect(state.sessionHistory).toEqual([]);
      expect(state.currentHistoryViewIndex).toBeNull();
      expect(state.appState).toBe('quiz');
    });
  });

  describe('backToDashboard Action', () => {
    beforeEach(() => {
      // Setup module and dirty state before each test
      act(() => {
        useQuizStore.getState().setCurrentModule(createMockModule());
        useQuizStore.getState().setAppState('quiz');
        useQuizStore.getState().setCurrentChapterId('ch1');
        useQuizStore.getState().setCurrentQuestionIndex(3);
        useQuizStore.getState().selectOption('option-a');
        useQuizStore.getState().submitAnswer();
        useQuizStore.getState().startReviewSession();
        useQuizStore.getState().setCurrentReviewQuestion({
          chapterId: 'ch1',
          question: createMockQuestion(),
        });
        useQuizStore.getState().addToSessionHistory({
          questionSnapshot: createMockQuestion(),
          selectedOptionId: 'a',
          displayedOptions: [
            { optionId: 'a', optionText: 'Option A' },
            { optionId: 'b', optionText: 'Option B' },
          ],
          isCorrect: true,
          isReviewSessionQuestion: false,
          chapterId: 'ch1',
        });
        useQuizStore.getState().setHistoryViewIndex(0);
        useQuizStore.getState().setEditModeActive(true);
        useQuizStore.getState().setEditingQuestionData(createMockQuestion());
      });
    });

    it('should set appState to welcome', () => {
      expect(useQuizStore.getState().appState).toBe('quiz');

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().appState).toBe('welcome');
    });

    it('should clear currentChapterId to empty string', () => {
      expect(useQuizStore.getState().currentChapterId).toBe('ch1');

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().currentChapterId).toBe('');
    });

    it('should reset currentQuestionIndex to 0', () => {
      expect(useQuizStore.getState().currentQuestionIndex).toBe(3);

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
    });

    it('should clear selectedOptionId to null', () => {
      expect(useQuizStore.getState().selectedOptionId).not.toBeNull();

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().selectedOptionId).toBeNull();
    });

    it('should set isSubmitted to false', () => {
      expect(useQuizStore.getState().isSubmitted).toBe(true);

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().isSubmitted).toBe(false);
    });

    it('should set isReviewSessionActive to false', () => {
      expect(useQuizStore.getState().isReviewSessionActive).toBe(true);

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().isReviewSessionActive).toBe(false);
    });

    it('should clear currentReviewQuestion to null', () => {
      expect(useQuizStore.getState().currentReviewQuestion).not.toBeNull();

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().currentReviewQuestion).toBeNull();
    });

    it('should clear sessionHistory to empty array', () => {
      expect(useQuizStore.getState().sessionHistory.length).toBeGreaterThan(0);

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().sessionHistory).toEqual([]);
    });

    it('should set currentHistoryViewIndex to null', () => {
      expect(useQuizStore.getState().currentHistoryViewIndex).not.toBeNull();

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().currentHistoryViewIndex).toBeNull();
    });

    it('should set isEditModeActive to false', () => {
      expect(useQuizStore.getState().isEditModeActive).toBe(true);

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().isEditModeActive).toBe(false);
    });

    it('should clear editingQuestionData to null', () => {
      expect(useQuizStore.getState().editingQuestionData).not.toBeNull();

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().editingQuestionData).toBeNull();
    });

    it('should reset all session state in a single call', () => {
      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      const state = useQuizStore.getState();
      expect(state.appState).toBe('welcome');
      expect(state.currentChapterId).toBe('');
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.selectedOptionId).toBeNull();
      expect(state.isSubmitted).toBe(false);
      expect(state.isReviewSessionActive).toBe(false);
      expect(state.currentReviewQuestion).toBeNull();
      expect(state.sessionHistory).toEqual([]);
      expect(state.currentHistoryViewIndex).toBeNull();
      expect(state.isEditModeActive).toBe(false);
      expect(state.editingQuestionData).toBeNull();
    });

    it('should preserve currentModule when going back to dashboard', () => {
      const currentModule = useQuizStore.getState().currentModule;
      expect(currentModule).not.toBeNull();

      act(() => {
        useQuizStore.getState().backToDashboard();
      });

      expect(useQuizStore.getState().currentModule).toEqual(currentModule);
    });
  });

  describe('submitAnswer Action (with SRS)', () => {
    const mockDisplayedOptions: DisplayedOption[] = [
      { optionId: 'a', optionText: 'Option A', isCorrect: true },
      { optionId: 'b', optionText: 'Option B', isCorrect: false },
      { optionId: 'c', optionText: 'Option C', isCorrect: false },
    ];

    beforeEach(() => {
      // Reset store and set up a quiz session
      useQuizStore.setState(useQuizStore.getInitialState());

      const testModule = createMockModule({
        chapters: [
          {
            id: 'ch1',
            name: 'Chapter 1',
            questions: [
              createMockQuestion({
                questionId: 'q1',
                correctOptionIds: ['a'],
                srsLevel: 0,
                status: 'not_attempted',
                timesAnsweredCorrectly: 0,
                timesAnsweredIncorrectly: 0,
              }),
              createMockQuestion({
                questionId: 'q2',
                correctOptionIds: ['b'],
                srsLevel: 1,
                status: 'passed_once',
                timesAnsweredCorrectly: 1,
                timesAnsweredIncorrectly: 0,
              }),
            ],
            totalQuestions: 2,
            answeredQuestions: 0,
            correctAnswers: 0,
            isCompleted: false,
          },
        ],
      });

      act(() => {
        useQuizStore.getState().setCurrentModule(testModule);
        useQuizStore.getState().setCurrentChapterId('ch1');
        useQuizStore.getState().setCurrentQuestionIndex(0);
        useQuizStore.getState().selectOption('a');
      });
    });

    describe('Basic Submission', () => {
      it('should set isSubmitted to true', () => {
        expect(useQuizStore.getState().isSubmitted).toBe(false);

        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        expect(useQuizStore.getState().isSubmitted).toBe(true);
      });

      it('should do nothing if no current question exists', () => {
        act(() => {
          useQuizStore.getState().setCurrentChapterId('nonexistent');
        });

        const stateBefore = useQuizStore.getState();

        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        // Should only set isSubmitted, nothing else should change
        expect(useQuizStore.getState().currentModule).toEqual(stateBefore.currentModule);
      });
    });

    describe('Correct Answer Handling', () => {
      it('should correctly identify a correct answer', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const answerRecord = useQuizStore.getState().answerRecords['q1'];
        expect(answerRecord).toBeDefined();
        expect(answerRecord.isCorrect).toBe(true);
      });

      it('should call calculateNextReview with correct parameters for correct answer', () => {
        const spy = vi.spyOn(srsEngine, 'calculateNextReview');

        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            srsLevel: 0,
            status: 'not_attempted',
            timesAnsweredCorrectly: 0,
            timesAnsweredIncorrectly: 0,
          }),
          true, // isCorrect
        );

        spy.mockRestore();
      });

      it('should update question srsLevel after correct answer', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q1');

        expect(question?.srsLevel).toBe(1); // Should increase from 0 to 1
      });

      it('should update question status after correct answer', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q1');

        expect(question?.status).toBe('passed_once');
      });

      it('should update timesAnsweredCorrectly after correct answer', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q1');

        expect(question?.timesAnsweredCorrectly).toBe(1);
      });

      it('should set nextReviewAt after correct answer (not mastered)', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q1');

        expect(question?.nextReviewAt).toBeDefined();
        expect(question?.nextReviewAt).not.toBeNull();
      });
    });

    describe('Incorrect Answer Handling', () => {
      it('should correctly identify an incorrect answer', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('b', mockDisplayedOptions); // 'b' is wrong, 'a' is correct
        });

        const answerRecord = useQuizStore.getState().answerRecords['q1'];
        expect(answerRecord).toBeDefined();
        expect(answerRecord.isCorrect).toBe(false);
      });

      it('should call calculateNextReview with correct parameters for incorrect answer', () => {
        const spy = vi.spyOn(srsEngine, 'calculateNextReview');

        act(() => {
          useQuizStore.getState().submitAnswer('b', mockDisplayedOptions);
        });

        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            srsLevel: 0,
          }),
          false, // isCorrect
        );

        spy.mockRestore();
      });

      it('should reset srsLevel to 0 after incorrect answer', () => {
        // First, set up a question with srsLevel 1
        act(() => {
          useQuizStore.getState().setCurrentQuestionIndex(1); // q2 has srsLevel 1
          useQuizStore.getState().selectOption('a'); // Wrong answer for q2 (correct is 'b')
        });

        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q2');

        expect(question?.srsLevel).toBe(0); // Should reset to 0
      });

      it('should update timesAnsweredIncorrectly after incorrect answer', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('b', mockDisplayedOptions);
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q1');

        expect(question?.timesAnsweredIncorrectly).toBe(1);
      });

      it('should set nextReviewAt for retry after incorrect answer', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('b', mockDisplayedOptions);
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q1');

        expect(question?.nextReviewAt).toBeDefined();
        expect(question?.nextReviewAt).not.toBeNull();
      });
    });

    describe('Answer Records', () => {
      it('should add an AnswerRecord for the question', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const answerRecords = useQuizStore.getState().answerRecords;
        expect(answerRecords['q1']).toBeDefined();
      });

      it('should store correct selectedOptionId in AnswerRecord', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const answerRecord = useQuizStore.getState().answerRecords['q1'];
        expect(answerRecord.selectedOptionId).toBe('a');
      });

      it('should store displayedOptionIds in AnswerRecord', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const answerRecord = useQuizStore.getState().answerRecords['q1'];
        expect(answerRecord.displayedOptionIds).toEqual(['a', 'b', 'c']);
      });

      it('should store timestamp in AnswerRecord', () => {
        const beforeTime = new Date().toISOString();

        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const afterTime = new Date().toISOString();
        const answerRecord = useQuizStore.getState().answerRecords['q1'];

        expect(answerRecord.timestamp).toBeDefined();
        expect(answerRecord.timestamp >= beforeTime).toBe(true);
        expect(answerRecord.timestamp <= afterTime).toBe(true);
      });
    });

    describe('Session History', () => {
      it('should add entry to sessionHistory', () => {
        expect(useQuizStore.getState().sessionHistory.length).toBe(0);

        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        expect(useQuizStore.getState().sessionHistory.length).toBe(1);
      });

      it('should store correct data in sessionHistory entry', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const historyEntry = useQuizStore.getState().sessionHistory[0];
        expect(historyEntry.selectedOptionId).toBe('a');
        expect(historyEntry.isCorrect).toBe(true);
        expect(historyEntry.chapterId).toBe('ch1');
        expect(historyEntry.displayedOptions).toEqual(mockDisplayedOptions);
        expect(historyEntry.questionSnapshot).toBeDefined();
        expect(historyEntry.questionSnapshot.questionId).toBe('q1');
      });

      it('should include isReviewSessionQuestion flag in history entry', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const historyEntry = useQuizStore.getState().sessionHistory[0];
        expect(historyEntry.isReviewSessionQuestion).toBe(false);
      });

      it('should set isReviewSessionQuestion to true when in review session', () => {
        act(() => {
          useQuizStore.getState().startReviewSession();
        });

        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const historyEntry = useQuizStore.getState().sessionHistory[0];
        expect(historyEntry.isReviewSessionQuestion).toBe(true);
      });
    });

    describe('Question Update in Module', () => {
      it('should update lastAttemptedAt on the question', () => {
        const beforeTime = new Date().toISOString();

        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const afterTime = new Date().toISOString();
        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q1');

        expect(question?.lastAttemptedAt).toBeDefined();
        if (question?.lastAttemptedAt) {
          expect(question.lastAttemptedAt >= beforeTime).toBe(true);
          expect(question.lastAttemptedAt <= afterTime).toBe(true);
        }
      });

      it('should update lastSelectedOptionId on the question', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions);
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q1');

        expect(question?.lastSelectedOptionId).toBe('a');
      });

      it('should add to historyOfIncorrectSelections for wrong answers', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('b', mockDisplayedOptions); // Wrong answer
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q1');

        expect(question?.historyOfIncorrectSelections).toContain('b');
      });

      it('should not add to historyOfIncorrectSelections for correct answers', () => {
        act(() => {
          useQuizStore.getState().submitAnswer('a', mockDisplayedOptions); // Correct answer
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q1');

        expect(question?.historyOfIncorrectSelections || []).not.toContain('a');
      });
    });

    describe('Mastery Path', () => {
      it('should set status to mastered when reaching max SRS level', () => {
        // Set up a question at level 1 (one more correct = mastered at level 2)
        act(() => {
          useQuizStore.getState().setCurrentQuestionIndex(1); // q2 has srsLevel 1
          useQuizStore.getState().selectOption('b'); // Correct answer for q2
        });

        act(() => {
          useQuizStore.getState().submitAnswer('b', [
            { optionId: 'a', optionText: 'Option A', isCorrect: false },
            { optionId: 'b', optionText: 'Option B', isCorrect: true },
          ]);
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q2');

        expect(question?.srsLevel).toBe(2);
        expect(question?.status).toBe('mastered');
      });

      it('should set nextReviewAt to null when mastered', () => {
        // Set up a question at level 1
        act(() => {
          useQuizStore.getState().setCurrentQuestionIndex(1);
          useQuizStore.getState().selectOption('b');
        });

        act(() => {
          useQuizStore.getState().submitAnswer('b', [
            { optionId: 'a', optionText: 'Option A', isCorrect: false },
            { optionId: 'b', optionText: 'Option B', isCorrect: true },
          ]);
        });

        const chapter = useQuizStore.getState().currentModule?.chapters.find((c) => c.id === 'ch1');
        const question = chapter?.questions.find((q) => q.questionId === 'q2');

        expect(question?.nextReviewAt).toBeNull();
      });
    });
  });
});
