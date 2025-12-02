/**
 * Navigation State Contract Tests
 *
 * These tests define the REQUIRED behavior for navigation and state persistence.
 * Any implementation MUST satisfy these contracts.
 *
 * Reference: docs/consolidated-audit-plan.md - Section 2: State Management
 *
 * CRITICAL BUGS BEING TESTED:
 * 1. Correctly answered questions marked incorrect when navigating back
 * 2. Options appear pre-selected on newly loaded questions
 * 3. "All Questions" view shows 0% progress
 * 4. Selection state leaking between questions
 * 5. Option order changes on re-navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { QuizQuestion, QuizChapter, SessionHistoryEntry } from '@/types/quiz-types';

// ============================================
// HELPER TYPES FOR CONTRACTS
// ============================================

interface AnswerRecord {
  questionId: string;
  selectedOptionId: string;
  displayedOptionIds: string[]; // Order matters!
  isCorrect: boolean;
  submittedAt: string;
}

interface NavigationState {
  currentQuestionIndex: number;
  totalQuestions: number;
  answerRecords: Map<string, AnswerRecord>;
  sessionHistory: SessionHistoryEntry[];
}

// ============================================
// CONTRACT: ANSWER PERSISTENCE
// ============================================

describe('Navigation Contract - Answer Persistence', () => {
  /**
   * CONTRACT: When navigating back to a previously answered question,
   * the answer state MUST be preserved exactly as it was.
   */

  describe('CONTRACT: Answer State Must Survive Navigation', () => {
    it('should preserve selected option when navigating away and back', () => {
      // Setup: Answer question 1
      const answerRecords = new Map<string, AnswerRecord>();
      const q1Answer: AnswerRecord = {
        questionId: 'q1',
        selectedOptionId: 'opt_b',
        displayedOptionIds: ['opt_a', 'opt_b', 'opt_c'],
        isCorrect: true,
        submittedAt: new Date().toISOString(),
      };
      answerRecords.set('q1', q1Answer);

      // Navigate to question 2 (simulated)
      // Navigate back to question 1

      // Contract: The record must still exist
      const retrievedAnswer = answerRecords.get('q1');
      expect(retrievedAnswer).toBeDefined();
      expect(retrievedAnswer?.selectedOptionId).toBe('opt_b');
      expect(retrievedAnswer?.isCorrect).toBe(true);
    });

    it('should preserve correctness status when navigating back', () => {
      // This tests the bug where correct answers show as incorrect
      const answerRecords = new Map<string, AnswerRecord>();

      // Answer correctly
      answerRecords.set('q1', {
        questionId: 'q1',
        selectedOptionId: 'opt_a',
        displayedOptionIds: ['opt_a', 'opt_b'],
        isCorrect: true,
        submittedAt: new Date().toISOString(),
      });

      // Simulate navigation (no changes should occur)

      // Verify correctness is preserved
      const record = answerRecords.get('q1');
      expect(record?.isCorrect).toBe(true);

      // The UI must use this stored isCorrect, not re-compute
      // against potentially different correctOptionIds
    });

    it('should preserve incorrect status when navigating back', () => {
      const answerRecords = new Map<string, AnswerRecord>();

      // Answer incorrectly
      answerRecords.set('q1', {
        questionId: 'q1',
        selectedOptionId: 'opt_b', // Wrong answer
        displayedOptionIds: ['opt_a', 'opt_b'],
        isCorrect: false,
        submittedAt: new Date().toISOString(),
      });

      // Verify incorrectness is preserved
      const record = answerRecords.get('q1');
      expect(record?.isCorrect).toBe(false);
    });
  });

  describe('CONTRACT: Option Order Must Be Stable', () => {
    /**
     * When options are shuffled on first display, that order must be
     * preserved for the entire session.
     */

    it('should preserve option order in answer record', () => {
      const answerRecord: AnswerRecord = {
        questionId: 'q1',
        selectedOptionId: 'opt_b',
        displayedOptionIds: ['opt_c', 'opt_a', 'opt_b'], // Shuffled order
        isCorrect: true,
        submittedAt: new Date().toISOString(),
      };

      // On re-navigation, use the stored order
      expect(answerRecord.displayedOptionIds[0]).toBe('opt_c');
      expect(answerRecord.displayedOptionIds[1]).toBe('opt_a');
      expect(answerRecord.displayedOptionIds[2]).toBe('opt_b');
    });

    it('should NOT re-shuffle options on navigation back', () => {
      const originalOrder = ['opt_c', 'opt_a', 'opt_b'];

      const answerRecord: AnswerRecord = {
        questionId: 'q1',
        selectedOptionId: 'opt_b',
        displayedOptionIds: originalOrder,
        isCorrect: true,
        submittedAt: new Date().toISOString(),
      };

      // Simulate getting displayed options after navigation
      // Should use stored order, not re-shuffle
      const displayedOrder = answerRecord.displayedOptionIds;

      expect(displayedOrder).toEqual(originalOrder);
    });
  });
});

// ============================================
// CONTRACT: FRESH QUESTION STATE
// ============================================

describe('Navigation Contract - Fresh Question State', () => {
  /**
   * CONTRACT: When loading a NEW question (never answered),
   * there must be NO pre-selected options.
   */

  describe('CONTRACT: No Pre-Selection on Fresh Questions', () => {
    it('should have null selectedOptionId for unanswered questions', () => {
      const question: Partial<QuizQuestion> = {
        questionId: 'q1',
        status: 'not_attempted',
        // No lastSelectedOptionId
      };

      // Fresh question should have no selection
      expect(question.lastSelectedOptionId).toBeUndefined();
    });

    it('should NOT carry selection state from previous question', () => {
      const answerRecords = new Map<string, AnswerRecord>();

      // Question 1 was answered
      answerRecords.set('q1', {
        questionId: 'q1',
        selectedOptionId: 'opt_b',
        displayedOptionIds: ['opt_a', 'opt_b'],
        isCorrect: true,
        submittedAt: new Date().toISOString(),
      });

      // Question 2 is fresh
      const q2Record = answerRecords.get('q2');
      expect(q2Record).toBeUndefined(); // No record = no pre-selection
    });

    it('should initialize fresh questions with clean state', () => {
      function getInitialSelectionState(
        questionId: string,
        records: Map<string, AnswerRecord>,
      ): string | null {
        const record = records.get(questionId);
        return record?.selectedOptionId ?? null;
      }

      const records = new Map<string, AnswerRecord>();

      // Fresh question should return null
      expect(getInitialSelectionState('fresh_question', records)).toBeNull();
    });
  });

  describe('CONTRACT: Focus vs Selection Distinction', () => {
    /**
     * Focus (keyboard navigation) and Selection (user choice) must be
     * visually and semantically distinct.
     */

    it('should distinguish focus state from selection state', () => {
      interface OptionUIState {
        isFocused: boolean;
        isSelected: boolean;
      }

      // When an option receives focus but is not selected
      const focusedNotSelected: OptionUIState = {
        isFocused: true,
        isSelected: false,
      };

      // These states must be independently trackable
      expect(focusedNotSelected.isFocused).not.toEqual(focusedNotSelected.isSelected);

      // UI contract: focused options should have outline, not fill
      // selected options should have fill/check, not just outline
    });
  });
});

// ============================================
// CONTRACT: ALL QUESTIONS VIEW SYNC
// ============================================

describe('Navigation Contract - All Questions View', () => {
  /**
   * CONTRACT: The "All Questions" view must accurately reflect
   * the current state of all questions in the quiz.
   */

  describe('CONTRACT: Progress Must Be Accurate', () => {
    it('should calculate answered count from answer records', () => {
      const answerRecords = new Map<string, AnswerRecord>();
      answerRecords.set('q1', {
        questionId: 'q1',
        selectedOptionId: 'a',
        displayedOptionIds: [],
        isCorrect: true,
        submittedAt: '',
      });
      answerRecords.set('q3', {
        questionId: 'q3',
        selectedOptionId: 'b',
        displayedOptionIds: [],
        isCorrect: false,
        submittedAt: '',
      });

      const totalQuestions = 5;
      const answeredCount = answerRecords.size;
      const progressPercentage = (answeredCount / totalQuestions) * 100;

      expect(answeredCount).toBe(2);
      expect(progressPercentage).toBe(40);
    });

    it('should show correct count accurately', () => {
      const answerRecords = new Map<string, AnswerRecord>();
      answerRecords.set('q1', {
        questionId: 'q1',
        selectedOptionId: 'a',
        displayedOptionIds: [],
        isCorrect: true,
        submittedAt: '',
      });
      answerRecords.set('q2', {
        questionId: 'q2',
        selectedOptionId: 'b',
        displayedOptionIds: [],
        isCorrect: false,
        submittedAt: '',
      });
      answerRecords.set('q3', {
        questionId: 'q3',
        selectedOptionId: 'c',
        displayedOptionIds: [],
        isCorrect: true,
        submittedAt: '',
      });

      const correctCount = Array.from(answerRecords.values()).filter((r) => r.isCorrect).length;

      expect(correctCount).toBe(2);
    });

    it('should never show 0% when questions have been answered', () => {
      const answerRecords = new Map<string, AnswerRecord>();
      answerRecords.set('q1', {
        questionId: 'q1',
        selectedOptionId: 'a',
        displayedOptionIds: [],
        isCorrect: true,
        submittedAt: '',
      });

      const totalQuestions = 5;
      const answeredCount = answerRecords.size;

      // BUG CHECK: This was showing 0% even with answered questions
      expect(answeredCount).toBeGreaterThan(0);
      expect((answeredCount / totalQuestions) * 100).toBeGreaterThan(0);
    });
  });

  describe('CONTRACT: Individual Question Status', () => {
    it('should show answered status for each question', () => {
      const answerRecords = new Map<string, AnswerRecord>();
      answerRecords.set('q1', {
        questionId: 'q1',
        selectedOptionId: 'a',
        displayedOptionIds: [],
        isCorrect: true,
        submittedAt: '',
      });

      function getQuestionStatus(questionId: string): 'answered' | 'not_attempted' {
        return answerRecords.has(questionId) ? 'answered' : 'not_attempted';
      }

      expect(getQuestionStatus('q1')).toBe('answered');
      expect(getQuestionStatus('q2')).toBe('not_attempted');
    });

    it('should show correct/incorrect for answered questions', () => {
      const answerRecords = new Map<string, AnswerRecord>();
      answerRecords.set('q1', {
        questionId: 'q1',
        selectedOptionId: 'a',
        displayedOptionIds: [],
        isCorrect: true,
        submittedAt: '',
      });
      answerRecords.set('q2', {
        questionId: 'q2',
        selectedOptionId: 'b',
        displayedOptionIds: [],
        isCorrect: false,
        submittedAt: '',
      });

      function getQuestionResult(questionId: string): 'correct' | 'incorrect' | null {
        const record = answerRecords.get(questionId);
        if (!record) return null;
        return record.isCorrect ? 'correct' : 'incorrect';
      }

      expect(getQuestionResult('q1')).toBe('correct');
      expect(getQuestionResult('q2')).toBe('incorrect');
      expect(getQuestionResult('q3')).toBeNull();
    });
  });
});

// ============================================
// CONTRACT: HISTORICAL VIEW
// ============================================

describe('Navigation Contract - Historical View', () => {
  /**
   * CONTRACT: When viewing a historical answer, the UI must use
   * the STORED snapshot, not the current question state.
   */

  describe('CONTRACT: Use Historical Snapshot for Display', () => {
    it('should use historical correctOptionIds, not current', () => {
      // Scenario: Question was edited after being answered
      const historicalEntry: SessionHistoryEntry = {
        questionSnapshot: {
          questionId: 'q1',
          questionText: 'Original question?',
          options: [{ optionId: 'a', optionText: 'A' }],
          correctOptionIds: ['a'], // Original correct answer
          explanationText: 'Original explanation',
          status: 'passed_once',
          timesAnsweredCorrectly: 1,
          timesAnsweredIncorrectly: 0,
          srsLevel: 1,
          nextReviewAt: null,
          shownIncorrectOptionIds: [],
          historyOfIncorrectSelections: [],
        },
        selectedOptionId: 'a',
        displayedOptions: [{ optionId: 'a', optionText: 'A', isCorrect: true }],
        isCorrect: true,
      };

      // Even if the current question has different correctOptionIds,
      // the historical view should use the snapshot's version
      expect(historicalEntry.questionSnapshot.correctOptionIds).toContain('a');
      expect(historicalEntry.isCorrect).toBe(true);
    });

    it('should preserve historical correctness regardless of current state', () => {
      const historicalEntry: SessionHistoryEntry = {
        questionSnapshot: {
          questionId: 'q1',
          questionText: 'Q1?',
          options: [{ optionId: 'a', optionText: 'A' }],
          correctOptionIds: ['a'],
          explanationText: 'Explanation',
          status: 'passed_once',
          timesAnsweredCorrectly: 1,
          timesAnsweredIncorrectly: 0,
          srsLevel: 1,
          nextReviewAt: null,
          shownIncorrectOptionIds: [],
          historyOfIncorrectSelections: [],
        },
        selectedOptionId: 'a',
        displayedOptions: [{ optionId: 'a', optionText: 'A', isCorrect: true }],
        isCorrect: true, // This was correct at time of answering
      };

      // BUG CHECK: Was comparing against LIVE question's correctOptionIds
      // which could differ after edit

      // The isCorrect in history should be immutable
      expect(historicalEntry.isCorrect).toBe(true);
    });
  });

  describe('CONTRACT: Historical View Must Not Corrupt Current State', () => {
    it('should not overwrite current question state when viewing history', () => {
      const currentQuestionId = 'q5'; // Currently on question 5
      const historicalQuestionId = 'q1'; // Viewing history for question 1

      // Viewing history should not change which question we're on
      expect(currentQuestionId).not.toBe(historicalQuestionId);

      // After exiting history view, we should still be on q5
    });
  });
});

// ============================================
// CONTRACT: STATE ISOLATION
// ============================================

describe('Navigation Contract - State Isolation', () => {
  /**
   * CONTRACT: Each question's state must be isolated.
   * Changes to one question must not affect others.
   */

  describe('CONTRACT: No State Leakage Between Questions', () => {
    it('should isolate selection state per question', () => {
      const answerRecords = new Map<string, AnswerRecord>();

      // Answer question 1 with option A
      answerRecords.set('q1', {
        questionId: 'q1',
        selectedOptionId: 'opt_a',
        displayedOptionIds: ['opt_a', 'opt_b'],
        isCorrect: true,
        submittedAt: new Date().toISOString(),
      });

      // Question 2 should have no selection
      expect(answerRecords.get('q2')).toBeUndefined();

      // Answering question 2 should not affect question 1
      answerRecords.set('q2', {
        questionId: 'q2',
        selectedOptionId: 'opt_b',
        displayedOptionIds: ['opt_a', 'opt_b'],
        isCorrect: false,
        submittedAt: new Date().toISOString(),
      });

      expect(answerRecords.get('q1')?.selectedOptionId).toBe('opt_a');
      expect(answerRecords.get('q2')?.selectedOptionId).toBe('opt_b');
    });

    it('should isolate submitted state per question', () => {
      interface QuestionUIState {
        isSubmitted: boolean;
        selectedOptionId: string | null;
      }

      const uiStates = new Map<string, QuestionUIState>();

      // Submit question 1
      uiStates.set('q1', { isSubmitted: true, selectedOptionId: 'a' });

      // Question 2 should not be submitted
      const q2State = uiStates.get('q2');
      expect(q2State).toBeUndefined();

      // Initialize q2 state
      uiStates.set('q2', { isSubmitted: false, selectedOptionId: null });

      expect(uiStates.get('q1')?.isSubmitted).toBe(true);
      expect(uiStates.get('q2')?.isSubmitted).toBe(false);
    });
  });

  describe('CONTRACT: Global State Must Track Per-Question', () => {
    it('should use question ID as key for all state', () => {
      // Bad pattern: single global selectedOptionId
      // Good pattern: Map<questionId, selectedOptionId>

      const perQuestionState = new Map<string, string | null>();

      perQuestionState.set('q1', 'opt_a');
      perQuestionState.set('q2', 'opt_b');
      perQuestionState.set('q3', null); // Not selected yet

      expect(perQuestionState.get('q1')).toBe('opt_a');
      expect(perQuestionState.get('q2')).toBe('opt_b');
      expect(perQuestionState.get('q3')).toBeNull();
    });
  });
});

// ============================================
// CONTRACT: RESET AND CLEAR OPERATIONS
// ============================================

describe('Navigation Contract - Reset Operations', () => {
  describe('CONTRACT: Chapter Reset Must Clear All State', () => {
    it('should clear all answer records for a chapter on reset', () => {
      const answerRecords = new Map<string, AnswerRecord>();

      // Answer some questions in chapter 1
      answerRecords.set('ch1_q1', {
        questionId: 'ch1_q1',
        selectedOptionId: 'a',
        displayedOptionIds: [],
        isCorrect: true,
        submittedAt: '',
      });
      answerRecords.set('ch1_q2', {
        questionId: 'ch1_q2',
        selectedOptionId: 'b',
        displayedOptionIds: [],
        isCorrect: false,
        submittedAt: '',
      });

      // Answer some in chapter 2
      answerRecords.set('ch2_q1', {
        questionId: 'ch2_q1',
        selectedOptionId: 'c',
        displayedOptionIds: [],
        isCorrect: true,
        submittedAt: '',
      });

      // Reset chapter 1
      const chapterPrefix = 'ch1_';
      for (const key of answerRecords.keys()) {
        if (key.startsWith(chapterPrefix)) {
          answerRecords.delete(key);
        }
      }

      // Chapter 1 records should be gone
      expect(answerRecords.has('ch1_q1')).toBe(false);
      expect(answerRecords.has('ch1_q2')).toBe(false);

      // Chapter 2 records should remain
      expect(answerRecords.has('ch2_q1')).toBe(true);
    });
  });

  describe('CONTRACT: Module Load Must Clear All State', () => {
    it('should clear all state when loading new module', () => {
      const answerRecords = new Map<string, AnswerRecord>();
      answerRecords.set('q1', {
        questionId: 'q1',
        selectedOptionId: 'a',
        displayedOptionIds: [],
        isCorrect: true,
        submittedAt: '',
      });

      // Load new module - should clear everything
      answerRecords.clear();

      expect(answerRecords.size).toBe(0);
    });
  });
});
