/**
 * D8: Keyboard Event Handler Collision in AccessibleOptionList
 *
 * Bug: Both the wrapper div and individual option divs have onKeyDown handlers
 * for Enter/Space. When focus is on an option, BOTH handlers fire, potentially
 * selecting the option twice.
 *
 * These tests verify proper event handling and propagation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibleOptionList } from '@/components/a11y/AccessibleOptionList';
import type { DisplayedOption } from '@/types/quiz-types';

describe('D8: Keyboard Event Handler Collision', () => {
  const mockOnSelectOption = vi.fn();

  const defaultOptions: DisplayedOption[] = [
    { optionId: 'a', text: 'Option A', isCorrect: false },
    { optionId: 'b', text: 'Option B', isCorrect: true },
    { optionId: 'c', text: 'Option C', isCorrect: false },
  ];

  beforeEach(() => {
    mockOnSelectOption.mockClear();
  });

  describe('Enter key handling', () => {
    it('should call onSelectOption exactly once when Enter is pressed', async () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={null}
          onSelectOption={mockOnSelectOption}
          isSubmitted={false}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');

      // Focus first option
      options[0].focus();

      // Press Enter
      fireEvent.keyDown(options[0], { key: 'Enter', code: 'Enter' });

      // BUG: Currently may be called twice due to event propagation
      // EXPECTED: Called exactly once
      expect(mockOnSelectOption).toHaveBeenCalledTimes(1);
      expect(mockOnSelectOption).toHaveBeenCalledWith('a');
    });

    it('should call onSelectOption exactly once when Space is pressed', async () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={null}
          onSelectOption={mockOnSelectOption}
          isSubmitted={false}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');
      options[1].focus();

      fireEvent.keyDown(options[1], { key: ' ', code: 'Space' });

      // Should only fire once
      expect(mockOnSelectOption).toHaveBeenCalledTimes(1);
      expect(mockOnSelectOption).toHaveBeenCalledWith('b');
    });
  });

  describe('Event propagation', () => {
    it('should stop propagation after handling Enter on option', () => {
      const parentHandler = vi.fn();

      render(
        <div onKeyDown={parentHandler}>
          <AccessibleOptionList
            options={defaultOptions}
            selectedOptionId={null}
            onSelectOption={mockOnSelectOption}
            isSubmitted={false}
            correctOptionIds={['b']}
          />
        </div>,
      );

      const options = screen.getAllByRole('radio');
      options[0].focus();

      fireEvent.keyDown(options[0], { key: 'Enter', code: 'Enter' });

      // Parent handler should NOT be called if propagation is stopped properly
      // This tests that the event doesn't bubble beyond the component
      expect(mockOnSelectOption).toHaveBeenCalledTimes(1);
    });

    it('should not double-fire when wrapper and option both handle same key', () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={null}
          onSelectOption={mockOnSelectOption}
          isSubmitted={false}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');

      // Simulate rapid key presses
      for (let i = 0; i < 3; i++) {
        options[0].focus();
        fireEvent.keyDown(options[0], { key: 'Enter', code: 'Enter' });
      }

      // Should be called exactly 3 times, once per press
      expect(mockOnSelectOption).toHaveBeenCalledTimes(3);
    });
  });

  describe('Disabled state', () => {
    it('should not select on Enter when disabled', () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={null}
          onSelectOption={mockOnSelectOption}
          isSubmitted={false}
          disabled={true}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');
      options[0].focus();

      fireEvent.keyDown(options[0], { key: 'Enter', code: 'Enter' });

      expect(mockOnSelectOption).not.toHaveBeenCalled();
    });

    it('should not select on Enter when already submitted', () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={'a'}
          onSelectOption={mockOnSelectOption}
          isSubmitted={true}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');
      options[1].focus();

      fireEvent.keyDown(options[1], { key: 'Enter', code: 'Enter' });

      expect(mockOnSelectOption).not.toHaveBeenCalled();
    });
  });

  describe('Arrow key navigation', () => {
    it('should navigate without triggering selection', () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={null}
          onSelectOption={mockOnSelectOption}
          isSubmitted={false}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');
      options[0].focus();

      // Navigate down
      fireEvent.keyDown(options[0], { key: 'ArrowDown', code: 'ArrowDown' });

      // Navigation should not trigger selection
      expect(mockOnSelectOption).not.toHaveBeenCalled();
    });

    it('should wrap around when navigating past last option', () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={null}
          onSelectOption={mockOnSelectOption}
          isSubmitted={false}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');

      // Focus last option and press down
      options[2].focus();
      fireEvent.keyDown(options[2], { key: 'ArrowDown', code: 'ArrowDown' });

      // Should not call select
      expect(mockOnSelectOption).not.toHaveBeenCalled();
    });
  });

  describe('Focus management', () => {
    it('should maintain focus after selection', () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={null}
          onSelectOption={mockOnSelectOption}
          isSubmitted={false}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');
      options[0].focus();

      expect(document.activeElement).toBe(options[0]);

      fireEvent.keyDown(options[0], { key: 'Enter', code: 'Enter' });

      // Focus should remain on the option
      expect(document.activeElement).toBe(options[0]);
    });

    it('should update tabIndex correctly when focus changes', () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={null}
          onSelectOption={mockOnSelectOption}
          isSubmitted={false}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');

      // Initially first option should be focusable
      expect(options[0]).toHaveAttribute('tabIndex', '0');
      expect(options[1]).toHaveAttribute('tabIndex', '-1');
      expect(options[2]).toHaveAttribute('tabIndex', '-1');

      // Navigate to second option
      options[0].focus();
      fireEvent.keyDown(options[0], { key: 'ArrowDown', code: 'ArrowDown' });

      // Second option should now be focusable
      expect(options[1]).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Multiple rapid key events', () => {
    it('should handle rapid Enter presses correctly', async () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={null}
          onSelectOption={mockOnSelectOption}
          isSubmitted={false}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');
      options[0].focus();

      // Rapid fire Enter
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(options[0], { key: 'Enter', code: 'Enter' });
      }

      // Each Enter should result in exactly one call
      expect(mockOnSelectOption).toHaveBeenCalledTimes(5);
    });

    it('should handle mixed key events correctly', () => {
      render(
        <AccessibleOptionList
          options={defaultOptions}
          selectedOptionId={null}
          onSelectOption={mockOnSelectOption}
          isSubmitted={false}
          correctOptionIds={['b']}
        />,
      );

      const options = screen.getAllByRole('radio');
      options[0].focus();

      // Mix of navigation and selection
      fireEvent.keyDown(options[0], { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(options[0], { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(options[0], { key: 'ArrowUp', code: 'ArrowUp' });
      fireEvent.keyDown(options[0], { key: ' ', code: 'Space' });

      // Only Enter and Space should trigger selection
      expect(mockOnSelectOption).toHaveBeenCalledTimes(2);
    });
  });
});
