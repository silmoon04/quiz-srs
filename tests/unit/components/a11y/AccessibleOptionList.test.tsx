import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibleOptionList } from '@/components/a11y/AccessibleOptionList';
import type { DisplayedOption } from '@/types/quiz-types';

// Mock the OptionCard component to simplify testing
vi.mock('@/components/option-card', () => ({
  OptionCard: ({
    option,
    isSelected,
    showAsCorrect,
    showAsIncorrect,
    isSubmitted,
    onSelect,
    disabled,
  }: {
    option: DisplayedOption;
    isSelected: boolean;
    showAsCorrect: boolean;
    showAsIncorrect: boolean;
    isSubmitted: boolean;
    onSelect: () => void;
    disabled: boolean;
  }) => (
    <div
      data-testid={`option-card-${option.optionId}`}
      data-selected={isSelected}
      data-correct={showAsCorrect}
      data-incorrect={showAsIncorrect}
      data-submitted={isSubmitted}
      data-disabled={disabled}
      onClick={onSelect}
    >
      <span id={`option-text-${option.optionId}`}>{option.optionText}</span>
    </div>
  ),
}));

// Helper to create option data
const createOption = (id: string, text: string): DisplayedOption => ({
  optionId: id,
  optionText: text,
});

// Create default options for testing
const createDefaultOptions = (): DisplayedOption[] => [
  createOption('opt-1', 'Option 1'),
  createOption('opt-2', 'Option 2'),
  createOption('opt-3', 'Option 3'),
  createOption('opt-4', 'Option 4'),
];

// Default props factory
const createDefaultProps = (
  overrides: Partial<{
    options: DisplayedOption[];
    selectedOptionId: string | null;
    onSelectOption: (optionId: string) => void;
    isSubmitted: boolean;
    disabled: boolean;
    correctOptionIds: string[];
  }> = {},
) => ({
  options: createDefaultOptions(),
  selectedOptionId: null,
  onSelectOption: vi.fn(),
  isSubmitted: false,
  disabled: false,
  correctOptionIds: [],
  ...overrides,
});

describe('AccessibleOptionList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Renders options as accessible list', () => {
    it('should render all options', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      expect(screen.getByTestId('option-card-opt-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-card-opt-2')).toBeInTheDocument();
      expect(screen.getByTestId('option-card-opt-3')).toBeInTheDocument();
      expect(screen.getByTestId('option-card-opt-4')).toBeInTheDocument();
    });

    it('should render options with correct text content', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
      expect(screen.getByText('Option 4')).toBeInTheDocument();
    });

    it('should render empty list when no options provided', () => {
      render(<AccessibleOptionList {...createDefaultProps({ options: [] })} />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
      expect(within(radioGroup).queryAllByRole('radio')).toHaveLength(0);
    });

    it('should render single option correctly', () => {
      const singleOption = [createOption('single', 'Single Option')];
      render(<AccessibleOptionList {...createDefaultProps({ options: singleOption })} />);

      expect(screen.getByTestId('option-card-single')).toBeInTheDocument();
      expect(screen.getByText('Single Option')).toBeInTheDocument();
    });

    it('should render options with special characters', () => {
      const specialOptions = [
        createOption('special-1', 'Option with <special> characters'),
        createOption('special-2', 'Option with "quotes"'),
        createOption('special-3', 'Option with 日本語'),
      ];
      render(<AccessibleOptionList {...createDefaultProps({ options: specialOptions })} />);

      expect(screen.getByText('Option with <special> characters')).toBeInTheDocument();
      expect(screen.getByText('Option with "quotes"')).toBeInTheDocument();
      expect(screen.getByText('Option with 日本語')).toBeInTheDocument();
    });
  });

  describe('ARIA roles and attributes', () => {
    it('should have radiogroup role on container', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
    });

    it('should have aria-label on radiogroup', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-label', 'Answer options');
    });

    it('should have radio role on each option wrapper', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(4);
    });

    it('should have aria-checked="false" when option is not selected', () => {
      render(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: null })} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('should have aria-checked="true" when option is selected', () => {
      render(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-2' })} />);

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('aria-checked', 'false');
      expect(radios[1]).toHaveAttribute('aria-checked', 'true');
      expect(radios[2]).toHaveAttribute('aria-checked', 'false');
      expect(radios[3]).toHaveAttribute('aria-checked', 'false');
    });

    it('should have aria-labelledby referencing option text', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('aria-labelledby', 'option-text-opt-1');
      expect(radios[1]).toHaveAttribute('aria-labelledby', 'option-text-opt-2');
      expect(radios[2]).toHaveAttribute('aria-labelledby', 'option-text-opt-3');
      expect(radios[3]).toHaveAttribute('aria-labelledby', 'option-text-opt-4');
    });

    it('should have first option focusable by default (tabIndex=0)', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('tabIndex', '0');
      expect(radios[1]).toHaveAttribute('tabIndex', '-1');
      expect(radios[2]).toHaveAttribute('tabIndex', '-1');
      expect(radios[3]).toHaveAttribute('tabIndex', '-1');
    });

    it('should update tabIndex to focused option', () => {
      render(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-3' })} />);

      const radios = screen.getAllByRole('radio');
      // After selecting opt-3, focus should move to that option
      expect(radios[2]).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Keyboard navigation', () => {
    it('should navigate to next option with ArrowDown', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      await user.keyboard('{ArrowDown}');

      expect(radios[1]).toHaveFocus();
    });

    it('should navigate to previous option with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios[1].focus();

      await user.keyboard('{ArrowUp}');

      expect(radios[0]).toHaveFocus();
    });

    it('should wrap from last to first with ArrowDown', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios[3].focus();

      await user.keyboard('{ArrowDown}');

      expect(radios[0]).toHaveFocus();
    });

    it('should wrap from first to last with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      await user.keyboard('{ArrowUp}');

      expect(radios[3]).toHaveFocus();
    });

    it('should navigate to first option with Home key', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios[2].focus();

      await user.keyboard('{Home}');

      expect(radios[0]).toHaveFocus();
    });

    it('should navigate to last option with End key', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      await user.keyboard('{End}');

      expect(radios[3]).toHaveFocus();
    });

    it('should select option with Enter key', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      render(<AccessibleOptionList {...createDefaultProps({ onSelectOption })} />);

      const radios = screen.getAllByRole('radio');
      radios[1].focus();

      await user.keyboard('{Enter}');

      expect(onSelectOption).toHaveBeenCalledWith('opt-2');
    });

    it('should select option with Space key', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      render(<AccessibleOptionList {...createDefaultProps({ onSelectOption })} />);

      const radios = screen.getAllByRole('radio');
      radios[2].focus();

      await user.keyboard(' ');

      expect(onSelectOption).toHaveBeenCalledWith('opt-3');
    });

    it('should not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      render(<AccessibleOptionList {...createDefaultProps({ onSelectOption, disabled: true })} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelectOption).not.toHaveBeenCalled();
    });

    it('should not navigate with arrow keys when submitted', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      render(
        <AccessibleOptionList {...createDefaultProps({ onSelectOption, isSubmitted: true })} />,
      );

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      // Arrow navigation should be disabled when submitted
      await user.keyboard('{ArrowDown}');

      // Focus should remain on first element since navigation is disabled
      expect(radios[0]).toHaveFocus();
    });

    it('should handle multiple consecutive arrow key presses', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      expect(radios[3]).toHaveFocus();
    });

    it('should handle mixed arrow key navigation', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');

      expect(radios[1]).toHaveFocus();
    });

    it('should update tabIndex after keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      await user.keyboard('{ArrowDown}');

      expect(radios[0]).toHaveAttribute('tabIndex', '-1');
      expect(radios[1]).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Selection handling', () => {
    it('should call onSelectOption when option is clicked', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      render(<AccessibleOptionList {...createDefaultProps({ onSelectOption })} />);

      await user.click(screen.getByTestId('option-card-opt-2'));

      expect(onSelectOption).toHaveBeenCalledWith('opt-2');
    });

    it('should pass isSelected=true to selected option', () => {
      render(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-1' })} />);

      const optionCard = screen.getByTestId('option-card-opt-1');
      expect(optionCard).toHaveAttribute('data-selected', 'true');
    });

    it('should pass isSelected=false to non-selected options', () => {
      render(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-1' })} />);

      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-selected', 'false');
      expect(screen.getByTestId('option-card-opt-3')).toHaveAttribute('data-selected', 'false');
      expect(screen.getByTestId('option-card-opt-4')).toHaveAttribute('data-selected', 'false');
    });

    it('should update selection when selectedOptionId changes', () => {
      const { rerender } = render(
        <AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-1' })} />,
      );

      expect(screen.getByTestId('option-card-opt-1')).toHaveAttribute('data-selected', 'true');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-selected', 'false');

      rerender(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-2' })} />);

      expect(screen.getByTestId('option-card-opt-1')).toHaveAttribute('data-selected', 'false');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-selected', 'true');
    });

    it('should pass correct onSelect handler to each OptionCard', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      render(<AccessibleOptionList {...createDefaultProps({ onSelectOption })} />);

      await user.click(screen.getByTestId('option-card-opt-1'));
      expect(onSelectOption).toHaveBeenCalledWith('opt-1');

      await user.click(screen.getByTestId('option-card-opt-3'));
      expect(onSelectOption).toHaveBeenCalledWith('opt-3');
    });

    it('should handle selection with keyboard Enter', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      render(<AccessibleOptionList {...createDefaultProps({ onSelectOption })} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelectOption).toHaveBeenCalledWith('opt-2');
    });

    it('should handle selection with keyboard Space', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      render(<AccessibleOptionList {...createDefaultProps({ onSelectOption })} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard(' ');

      expect(onSelectOption).toHaveBeenCalledWith('opt-3');
    });
  });

  describe('Correct/Incorrect state handling', () => {
    it('should pass showAsCorrect=true to correct option when submitted', () => {
      render(
        <AccessibleOptionList
          {...createDefaultProps({
            isSubmitted: true,
            correctOptionIds: ['opt-2'],
          })}
        />,
      );

      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-correct', 'true');
    });

    it('should pass showAsIncorrect=true to selected wrong option when submitted', () => {
      render(
        <AccessibleOptionList
          {...createDefaultProps({
            selectedOptionId: 'opt-1',
            isSubmitted: true,
            correctOptionIds: ['opt-2'],
          })}
        />,
      );

      expect(screen.getByTestId('option-card-opt-1')).toHaveAttribute('data-incorrect', 'true');
    });

    it('should not show incorrect state for unselected wrong options', () => {
      render(
        <AccessibleOptionList
          {...createDefaultProps({
            selectedOptionId: 'opt-1',
            isSubmitted: true,
            correctOptionIds: ['opt-2'],
          })}
        />,
      );

      expect(screen.getByTestId('option-card-opt-3')).toHaveAttribute('data-incorrect', 'false');
      expect(screen.getByTestId('option-card-opt-4')).toHaveAttribute('data-incorrect', 'false');
    });

    it('should show correct state for selected correct option', () => {
      render(
        <AccessibleOptionList
          {...createDefaultProps({
            selectedOptionId: 'opt-2',
            isSubmitted: true,
            correctOptionIds: ['opt-2'],
          })}
        />,
      );

      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-correct', 'true');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-incorrect', 'false');
    });

    it('should handle multiple correct options', () => {
      render(
        <AccessibleOptionList
          {...createDefaultProps({
            isSubmitted: true,
            correctOptionIds: ['opt-1', 'opt-3'],
          })}
        />,
      );

      expect(screen.getByTestId('option-card-opt-1')).toHaveAttribute('data-correct', 'true');
      expect(screen.getByTestId('option-card-opt-3')).toHaveAttribute('data-correct', 'true');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-correct', 'false');
      expect(screen.getByTestId('option-card-opt-4')).toHaveAttribute('data-correct', 'false');
    });

    it('should not show correct/incorrect states when not submitted', () => {
      render(
        <AccessibleOptionList
          {...createDefaultProps({
            selectedOptionId: 'opt-1',
            isSubmitted: false,
            correctOptionIds: ['opt-2'],
          })}
        />,
      );

      expect(screen.getByTestId('option-card-opt-1')).toHaveAttribute('data-correct', 'false');
      expect(screen.getByTestId('option-card-opt-1')).toHaveAttribute('data-incorrect', 'false');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-correct', 'false');
    });
  });

  describe('Disabled state', () => {
    it('should pass disabled=true to all options when disabled', () => {
      render(<AccessibleOptionList {...createDefaultProps({ disabled: true })} />);

      expect(screen.getByTestId('option-card-opt-1')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('option-card-opt-3')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('option-card-opt-4')).toHaveAttribute('data-disabled', 'true');
    });

    it('should pass disabled=false to all options when not disabled', () => {
      render(<AccessibleOptionList {...createDefaultProps({ disabled: false })} />);

      expect(screen.getByTestId('option-card-opt-1')).toHaveAttribute('data-disabled', 'false');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-disabled', 'false');
      expect(screen.getByTestId('option-card-opt-3')).toHaveAttribute('data-disabled', 'false');
      expect(screen.getByTestId('option-card-opt-4')).toHaveAttribute('data-disabled', 'false');
    });

    it('should not call onSelectOption when disabled and Enter pressed', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      render(<AccessibleOptionList {...createDefaultProps({ onSelectOption, disabled: true })} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();
      await user.keyboard('{Enter}');

      expect(onSelectOption).not.toHaveBeenCalled();
    });

    it('should not call onSelectOption when disabled and Space pressed', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      render(<AccessibleOptionList {...createDefaultProps({ onSelectOption, disabled: true })} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();
      await user.keyboard(' ');

      expect(onSelectOption).not.toHaveBeenCalled();
    });
  });

  describe('Submitted state', () => {
    it('should pass isSubmitted=true to all options when submitted', () => {
      render(<AccessibleOptionList {...createDefaultProps({ isSubmitted: true })} />);

      expect(screen.getByTestId('option-card-opt-1')).toHaveAttribute('data-submitted', 'true');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-submitted', 'true');
      expect(screen.getByTestId('option-card-opt-3')).toHaveAttribute('data-submitted', 'true');
      expect(screen.getByTestId('option-card-opt-4')).toHaveAttribute('data-submitted', 'true');
    });

    it('should pass isSubmitted=false to all options when not submitted', () => {
      render(<AccessibleOptionList {...createDefaultProps({ isSubmitted: false })} />);

      expect(screen.getByTestId('option-card-opt-1')).toHaveAttribute('data-submitted', 'false');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-submitted', 'false');
    });

    it('should not navigate with arrows when submitted', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps({ isSubmitted: true })} />);

      const radios = screen.getAllByRole('radio');
      const initialFocused = radios[0];
      initialFocused.focus();

      await user.keyboard('{ArrowDown}');

      // Focus should remain on first element since navigation is disabled
      expect(initialFocused).toHaveFocus();
    });
  });

  describe('Focus management', () => {
    it('should update focused index when option receives focus', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');

      // Focus second option directly
      await user.click(radios[1]);
      radios[1].focus();

      // After focusing, tabIndex should update
      expect(radios[1]).toHaveAttribute('tabIndex', '0');
    });

    it('should focus selected option when selectedOptionId changes', () => {
      const { rerender } = render(
        <AccessibleOptionList {...createDefaultProps({ selectedOptionId: null })} />,
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('tabIndex', '0');

      rerender(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-3' })} />);

      expect(radios[2]).toHaveAttribute('tabIndex', '0');
    });

    it('should maintain roving tabindex pattern', async () => {
      const user = userEvent.setup();
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      // Initially only first has tabIndex 0
      expect(radios[0]).toHaveAttribute('tabIndex', '0');
      expect(radios[1]).toHaveAttribute('tabIndex', '-1');
      expect(radios[2]).toHaveAttribute('tabIndex', '-1');
      expect(radios[3]).toHaveAttribute('tabIndex', '-1');

      // Navigate to second option
      await user.keyboard('{ArrowDown}');

      // Now second has tabIndex 0
      expect(radios[0]).toHaveAttribute('tabIndex', '-1');
      expect(radios[1]).toHaveAttribute('tabIndex', '0');
      expect(radios[2]).toHaveAttribute('tabIndex', '-1');
      expect(radios[3]).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Options update handling', () => {
    it('should handle options being updated', () => {
      const { rerender } = render(<AccessibleOptionList {...createDefaultProps()} />);

      expect(screen.getAllByRole('radio')).toHaveLength(4);

      const newOptions = [
        createOption('new-1', 'New Option 1'),
        createOption('new-2', 'New Option 2'),
      ];

      rerender(<AccessibleOptionList {...createDefaultProps({ options: newOptions })} />);

      expect(screen.getAllByRole('radio')).toHaveLength(2);
      expect(screen.getByText('New Option 1')).toBeInTheDocument();
      expect(screen.getByText('New Option 2')).toBeInTheDocument();
    });

    it('should reset focus when options change', () => {
      const { rerender } = render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('tabIndex', '0');

      const newOptions = [
        createOption('new-1', 'New Option 1'),
        createOption('new-2', 'New Option 2'),
      ];

      rerender(<AccessibleOptionList {...createDefaultProps({ options: newOptions })} />);

      const newRadios = screen.getAllByRole('radio');
      expect(newRadios[0]).toHaveAttribute('tabIndex', '0');
    });

    it('should handle adding options', () => {
      const initialOptions = [createOption('opt-1', 'Option 1')];
      const { rerender } = render(
        <AccessibleOptionList {...createDefaultProps({ options: initialOptions })} />,
      );

      expect(screen.getAllByRole('radio')).toHaveLength(1);

      rerender(<AccessibleOptionList {...createDefaultProps()} />);

      expect(screen.getAllByRole('radio')).toHaveLength(4);
    });

    it('should handle removing options', () => {
      const { rerender } = render(<AccessibleOptionList {...createDefaultProps()} />);

      expect(screen.getAllByRole('radio')).toHaveLength(4);

      const reducedOptions = [createOption('opt-1', 'Option 1')];
      rerender(<AccessibleOptionList {...createDefaultProps({ options: reducedOptions })} />);

      expect(screen.getAllByRole('radio')).toHaveLength(1);
    });
  });

  describe('Screen reader announcements', () => {
    it('should have aria-label on radiogroup for screen readers', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-label', 'Answer options');
    });

    it('should have aria-labelledby on each radio for screen readers', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio, index) => {
        const expectedLabelId = `option-text-opt-${index + 1}`;
        expect(radio).toHaveAttribute('aria-labelledby', expectedLabelId);
      });
    });

    it('should have option text elements with correct IDs for aria-labelledby', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      expect(document.getElementById('option-text-opt-1')).toBeInTheDocument();
      expect(document.getElementById('option-text-opt-2')).toBeInTheDocument();
      expect(document.getElementById('option-text-opt-3')).toBeInTheDocument();
      expect(document.getElementById('option-text-opt-4')).toBeInTheDocument();
    });

    it('should announce selection state via aria-checked', () => {
      render(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-2' })} />);

      const radios = screen.getAllByRole('radio');
      expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('CSS classes and styling', () => {
    it('should have space-y-3 class on container', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveClass('space-y-3');
    });

    it('should have focus ring classes on radio elements', () => {
      render(<AccessibleOptionList {...createDefaultProps()} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveClass('rounded-lg');
        expect(radio).toHaveClass('focus:outline-none');
        expect(radio).toHaveClass('focus:ring-2');
        expect(radio).toHaveClass('focus:ring-blue-500');
        expect(radio).toHaveClass('focus:ring-offset-2');
        expect(radio).toHaveClass('focus:ring-offset-gray-900');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined correctOptionIds', () => {
      // TypeScript won't allow this, but testing defensive behavior
      const props = createDefaultProps();
      delete (props as any).correctOptionIds;
      render(<AccessibleOptionList {...props} correctOptionIds={undefined} />);

      expect(screen.getAllByRole('radio')).toHaveLength(4);
    });

    it('should handle null selectedOptionId', () => {
      render(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: null })} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('should handle selectedOptionId not in options', () => {
      render(
        <AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'non-existent' })} />,
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('should handle rapid prop changes', () => {
      const { rerender } = render(
        <AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-1' })} />,
      );

      rerender(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-2' })} />);
      rerender(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-3' })} />);
      rerender(<AccessibleOptionList {...createDefaultProps({ selectedOptionId: 'opt-4' })} />);

      expect(screen.getByTestId('option-card-opt-4')).toHaveAttribute('data-selected', 'true');
    });

    it('should handle empty correctOptionIds array', () => {
      render(
        <AccessibleOptionList
          {...createDefaultProps({
            isSubmitted: true,
            correctOptionIds: [],
          })}
        />,
      );

      const optionCards = screen.getAllByTestId(/^option-card-/);
      optionCards.forEach((card) => {
        expect(card).toHaveAttribute('data-correct', 'false');
      });
    });
  });

  describe('Integration tests', () => {
    it('should handle complete quiz flow: navigate, select, submit', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      const { rerender } = render(
        <AccessibleOptionList {...createDefaultProps({ onSelectOption })} />,
      );

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      // Navigate to third option
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      // Select it
      await user.keyboard('{Enter}');
      expect(onSelectOption).toHaveBeenCalledWith('opt-3');

      // Simulate submission
      rerender(
        <AccessibleOptionList
          {...createDefaultProps({
            selectedOptionId: 'opt-3',
            isSubmitted: true,
            correctOptionIds: ['opt-2'],
          })}
        />,
      );

      // Verify correct/incorrect states
      expect(screen.getByTestId('option-card-opt-3')).toHaveAttribute('data-incorrect', 'true');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-correct', 'true');
    });

    it('should handle correct answer flow', async () => {
      const user = userEvent.setup();
      const onSelectOption = vi.fn();
      const { rerender } = render(
        <AccessibleOptionList {...createDefaultProps({ onSelectOption })} />,
      );

      const radios = screen.getAllByRole('radio');
      radios[0].focus();

      // Navigate to second option (correct answer)
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelectOption).toHaveBeenCalledWith('opt-2');

      // Simulate submission with correct answer
      rerender(
        <AccessibleOptionList
          {...createDefaultProps({
            selectedOptionId: 'opt-2',
            isSubmitted: true,
            correctOptionIds: ['opt-2'],
          })}
        />,
      );

      // Verify correct state (selected and correct)
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-correct', 'true');
      expect(screen.getByTestId('option-card-opt-2')).toHaveAttribute('data-incorrect', 'false');
    });
  });
});
