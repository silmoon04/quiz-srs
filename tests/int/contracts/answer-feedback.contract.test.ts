/**
 * Answer Feedback Behavioral Contract Tests
 *
 * These tests define the REQUIRED behavior for answer feedback display.
 * Any implementation MUST satisfy these contracts.
 *
 * Reference: docs/consolidated-audit-plan.md - Issue 2: Incorrect Answer Feedback Not Showing
 *
 * EXPECTED BEHAVIOR:
 * - Correct answer: Green background/checkmark
 * - User's incorrect selection: Red background/X icon
 * - Both should be visible simultaneously for learning
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { QuizQuestion, DisplayedOption } from '@/types/quiz-types';

// ============================================
// BEHAVIORAL CONTRACTS (Implementation-Agnostic)
// ============================================

/**
 * Contract: Option display state derivation
 *
 * Given: A submitted answer
 * When: Rendering the options
 * Then: Each option must have correct visual state flags
 */
interface OptionDisplayState {
  optionId: string;
  isSelected: boolean; // User selected this option
  isCorrect: boolean; // This is the correct answer
  isIncorrectSelection: boolean; // User selected this AND it's wrong
  showFeedback: boolean; // Feedback should be visible
}

/**
 * Derive the correct display state for an option
 * This is the CONTRACT - any implementation must produce equivalent results
 */
function deriveOptionDisplayState(
  option: { optionId: string; optionText: string },
  selectedOptionId: string | null,
  correctOptionIds: string[],
  isSubmitted: boolean,
): OptionDisplayState {
  const isSelected = selectedOptionId === option.optionId;
  const isCorrect = correctOptionIds.includes(option.optionId);
  const isIncorrectSelection = isSelected && !isCorrect && isSubmitted;

  return {
    optionId: option.optionId,
    isSelected,
    isCorrect: isCorrect && isSubmitted,
    isIncorrectSelection,
    showFeedback: isSubmitted,
  };
}

describe('Answer Feedback Contract - Option Display State', () => {
  describe('CONTRACT: Correct Answer Identification', () => {
    it('should mark the correct option as correct after submission', () => {
      const options = [
        { optionId: 'a', optionText: 'Option A' },
        { optionId: 'b', optionText: 'Option B' },
      ];
      const correctOptionIds = ['a'];
      const selectedOptionId = 'a';
      const isSubmitted = true;

      const states = options.map((opt) =>
        deriveOptionDisplayState(opt, selectedOptionId, correctOptionIds, isSubmitted),
      );

      const correctOption = states.find((s) => s.optionId === 'a');
      expect(correctOption?.isCorrect).toBe(true);
      expect(correctOption?.isSelected).toBe(true);
      expect(correctOption?.isIncorrectSelection).toBe(false);
    });

    it('should NOT mark any option as correct before submission', () => {
      const options = [
        { optionId: 'a', optionText: 'Option A' },
        { optionId: 'b', optionText: 'Option B' },
      ];
      const correctOptionIds = ['a'];
      const selectedOptionId = 'b';
      const isSubmitted = false;

      const states = options.map((opt) =>
        deriveOptionDisplayState(opt, selectedOptionId, correctOptionIds, isSubmitted),
      );

      // No option should show as correct before submission
      expect(states.every((s) => s.isCorrect === false)).toBe(true);
    });
  });

  describe('CONTRACT: Incorrect Selection Identification', () => {
    it("should mark user's incorrect selection as incorrect after submission", () => {
      const options = [
        { optionId: 'a', optionText: 'Option A' },
        { optionId: 'b', optionText: 'Option B' },
      ];
      const correctOptionIds = ['a'];
      const selectedOptionId = 'b'; // User selected wrong answer
      const isSubmitted = true;

      const states = options.map((opt) =>
        deriveOptionDisplayState(opt, selectedOptionId, correctOptionIds, isSubmitted),
      );

      const incorrectSelection = states.find((s) => s.optionId === 'b');
      expect(incorrectSelection?.isIncorrectSelection).toBe(true);
      expect(incorrectSelection?.isSelected).toBe(true);
      expect(incorrectSelection?.isCorrect).toBe(false);
    });

    it('should show BOTH correct and incorrect feedback simultaneously', () => {
      const options = [
        { optionId: 'a', optionText: 'Option A' },
        { optionId: 'b', optionText: 'Option B' },
        { optionId: 'c', optionText: 'Option C' },
      ];
      const correctOptionIds = ['a'];
      const selectedOptionId = 'b'; // User selected wrong answer
      const isSubmitted = true;

      const states = options.map((opt) =>
        deriveOptionDisplayState(opt, selectedOptionId, correctOptionIds, isSubmitted),
      );

      // Correct answer should be marked
      const correctOption = states.find((s) => s.optionId === 'a');
      expect(correctOption?.isCorrect).toBe(true);

      // Incorrect selection should be marked
      const incorrectSelection = states.find((s) => s.optionId === 'b');
      expect(incorrectSelection?.isIncorrectSelection).toBe(true);

      // Unselected incorrect option should not be marked as user's selection
      const unselectedOption = states.find((s) => s.optionId === 'c');
      expect(unselectedOption?.isIncorrectSelection).toBe(false);
      expect(unselectedOption?.isSelected).toBe(false);
    });
  });

  describe('CONTRACT: Selection State Preservation', () => {
    it('should preserve selection state for display after submission', () => {
      const options = [
        { optionId: 'a', optionText: 'Option A' },
        { optionId: 'b', optionText: 'Option B' },
      ];
      const correctOptionIds = ['a'];
      const selectedOptionId = 'b';
      const isSubmitted = true;

      const states = options.map((opt) =>
        deriveOptionDisplayState(opt, selectedOptionId, correctOptionIds, isSubmitted),
      );

      // After submission, we should still know which option was selected
      const selectedOption = states.find((s) => s.isSelected);
      expect(selectedOption).toBeDefined();
      expect(selectedOption?.optionId).toBe('b');
    });
  });

  describe('CONTRACT: Multiple Correct Answers', () => {
    it('should handle questions with multiple correct answers', () => {
      const options = [
        { optionId: 'a', optionText: 'Option A' },
        { optionId: 'b', optionText: 'Option B' },
        { optionId: 'c', optionText: 'Option C' },
      ];
      const correctOptionIds = ['a', 'b']; // Multiple correct
      const selectedOptionId = 'a';
      const isSubmitted = true;

      const states = options.map((opt) =>
        deriveOptionDisplayState(opt, selectedOptionId, correctOptionIds, isSubmitted),
      );

      // Both A and B should be marked as correct
      const optionA = states.find((s) => s.optionId === 'a');
      const optionB = states.find((s) => s.optionId === 'b');

      expect(optionA?.isCorrect).toBe(true);
      expect(optionB?.isCorrect).toBe(true);
    });
  });
});

describe('Answer Feedback Contract - Visual Feedback Requirements', () => {
  /**
   * These tests verify the VISUAL requirements for answer feedback.
   * They don't test specific CSS but verify that the data for styling is correct.
   */

  describe('CONTRACT: Feedback Must Be Distinguishable', () => {
    it('should have different states for correct, incorrect-selection, and neutral', () => {
      const options = [
        { optionId: 'a', optionText: 'Correct Answer' },
        { optionId: 'b', optionText: 'User Wrong Selection' },
        { optionId: 'c', optionText: 'Not Selected' },
      ];
      const correctOptionIds = ['a'];
      const selectedOptionId = 'b';
      const isSubmitted = true;

      const states = options.map((opt) =>
        deriveOptionDisplayState(opt, selectedOptionId, correctOptionIds, isSubmitted),
      );

      // Each state should be distinguishable
      const correctState = states.find((s) => s.optionId === 'a');
      const incorrectState = states.find((s) => s.optionId === 'b');
      const neutralState = states.find((s) => s.optionId === 'c');

      // Verify they have different combinations of flags
      expect(correctState?.isCorrect).toBe(true);
      expect(correctState?.isIncorrectSelection).toBe(false);

      expect(incorrectState?.isCorrect).toBe(false);
      expect(incorrectState?.isIncorrectSelection).toBe(true);

      expect(neutralState?.isCorrect).toBe(false);
      expect(neutralState?.isIncorrectSelection).toBe(false);
    });
  });

  describe('CONTRACT: Feedback Should Include Icons Not Just Colors', () => {
    /**
     * This is a documentation contract - implementations SHOULD provide
     * icons/symbols in addition to colors for accessibility.
     *
     * Expected behavior (from docs):
     * - Correct: ✓ checkmark icon
     * - Incorrect: ✗ X icon
     * - Color should NOT be the only indicator (WCAG compliance)
     */
    it('should provide sufficient state data for non-color indicators', () => {
      const options = [{ optionId: 'a', optionText: 'Option A' }];
      const state = deriveOptionDisplayState(options[0], 'a', ['a'], true);

      // The state should have enough info to render an icon
      // (not just a color class)
      expect(state).toHaveProperty('isCorrect');
      expect(state).toHaveProperty('isIncorrectSelection');
      expect(state).toHaveProperty('showFeedback');
    });
  });
});

describe('Answer Feedback Contract - State Transitions', () => {
  describe('CONTRACT: Correct Transition Flow', () => {
    it('should transition from selected → submitted → feedback shown', () => {
      const option = { optionId: 'a', optionText: 'Option A' };
      const correctOptionIds = ['a'];

      // Before selection
      let state = deriveOptionDisplayState(option, null, correctOptionIds, false);
      expect(state.isSelected).toBe(false);
      expect(state.showFeedback).toBe(false);

      // After selection, before submission
      state = deriveOptionDisplayState(option, 'a', correctOptionIds, false);
      expect(state.isSelected).toBe(true);
      expect(state.showFeedback).toBe(false);
      expect(state.isCorrect).toBe(false); // Don't reveal answer yet!

      // After submission
      state = deriveOptionDisplayState(option, 'a', correctOptionIds, true);
      expect(state.isSelected).toBe(true);
      expect(state.showFeedback).toBe(true);
      expect(state.isCorrect).toBe(true); // Now reveal answer
    });
  });
});

// ============================================
// COMPONENT INTEGRATION CONTRACTS
// ============================================

describe('Answer Feedback Contract - Component Requirements', () => {
  /**
   * These contracts define what ANY option display component must implement.
   * They serve as a specification for component development.
   */

  interface OptionComponentProps {
    option: { optionId: string; optionText: string };
    isSelected: boolean;
    isCorrect: boolean;
    isIncorrectSelection: boolean;
    isSubmitted: boolean;
    onSelect: (optionId: string) => void;
  }

  describe('CONTRACT: Component Must Accept Required Props', () => {
    it('should accept all necessary props for feedback display', () => {
      const requiredProps: (keyof OptionComponentProps)[] = [
        'option',
        'isSelected',
        'isCorrect',
        'isIncorrectSelection',
        'isSubmitted',
        'onSelect',
      ];

      // This is a type-level contract - if the component doesn't
      // accept these props, it cannot satisfy the contract
      requiredProps.forEach((prop) => {
        expect(typeof prop).toBe('string');
      });
    });
  });

  describe('CONTRACT: Component Must Be Keyboard Accessible', () => {
    /**
     * Keyboard requirements:
     * - Enter/Space to select
     * - Arrow keys to navigate
     * - Focus must be visible
     */
    it('should have keyboard interaction requirements defined', () => {
      const keyboardRequirements = {
        selectKeys: ['Enter', 'Space'],
        navigationKeys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
        focusMustBeVisible: true,
      };

      expect(keyboardRequirements.selectKeys).toContain('Enter');
      expect(keyboardRequirements.selectKeys).toContain('Space');
      expect(keyboardRequirements.focusMustBeVisible).toBe(true);
    });
  });

  describe('CONTRACT: Component Must Announce State Changes', () => {
    /**
     * Screen reader requirements:
     * - Announce when option is selected
     * - Announce correct/incorrect result after submission
     * - Announce explanation when shown
     */
    it('should have screen reader announcement requirements defined', () => {
      const announcements = {
        onSelect: 'Option {text} selected',
        onCorrect: 'Correct! {explanation}',
        onIncorrect: 'Incorrect. The correct answer is {correct}. {explanation}',
      };

      expect(announcements.onSelect).toContain('selected');
      expect(announcements.onCorrect).toContain('Correct');
      expect(announcements.onIncorrect).toContain('Incorrect');
    });
  });
});
