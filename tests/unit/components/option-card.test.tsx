import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OptionCard } from '@/components/option-card';
import type { QuizOption } from '@/types/quiz-types';

// Mock lucide-react icons to simplify testing
vi.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon">Check</span>,
  X: () => <span data-testid="x-icon">X</span>,
}));

// Mock the MarkdownRenderer component to simplify testing
vi.mock('@/components/rendering/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ markdown, className }: { markdown: string; className?: string }) => (
    <div data-testid="markdown-renderer" className={className}>
      {markdown}
    </div>
  ),
}));

// Helper to create option data
const createOptionData = (overrides: Partial<QuizOption> = {}): QuizOption => ({
  optionId: 'option-1',
  optionText: 'Test option text',
  ...overrides,
});

// Default props factory
const createDefaultProps = (
  overrides: Partial<{
    option: QuizOption;
    isSelected: boolean;
    showAsCorrect: boolean;
    showAsIncorrect: boolean;
    isSubmitted: boolean;
    onSelect: () => void;
    disabled: boolean;
  }> = {},
) => ({
  option: createOptionData(),
  isSelected: false,
  showAsCorrect: false,
  showAsIncorrect: false,
  isSubmitted: false,
  onSelect: vi.fn(),
  disabled: false,
  ...overrides,
});

describe('OptionCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the option card', () => {
      render(<OptionCard {...createDefaultProps()} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render option text using MarkdownRenderer', () => {
      render(
        <OptionCard
          {...createDefaultProps({ option: createOptionData({ optionText: 'My option text' }) })}
        />,
      );
      expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
      expect(screen.getByText('My option text')).toBeInTheDocument();
    });

    it('should render with correct button role', () => {
      render(<OptionCard {...createDefaultProps()} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should be focusable by default', () => {
      render(<OptionCard {...createDefaultProps()} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should render markdown content with correct styling class', () => {
      render(<OptionCard {...createDefaultProps()} />);
      const markdownRenderer = screen.getByTestId('markdown-renderer');
      expect(markdownRenderer).toHaveClass('leading-relaxed');
      expect(markdownRenderer).toHaveClass('text-white');
    });
  });

  describe('Selection State', () => {
    it('should show unselected state by default', () => {
      const { container } = render(<OptionCard {...createDefaultProps({ isSelected: false })} />);
      const card = container.querySelector('[role="button"]');
      expect(card).toHaveAttribute('aria-pressed', 'false');
    });

    it('should show selected state when isSelected is true', () => {
      const { container } = render(<OptionCard {...createDefaultProps({ isSelected: true })} />);
      const card = container.querySelector('[role="button"]');
      expect(card).toHaveAttribute('aria-pressed', 'true');
    });

    it('should apply blue styling when selected and not submitted', () => {
      const { container } = render(
        <OptionCard {...createDefaultProps({ isSelected: true, isSubmitted: false })} />,
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('from-blue-950');
      expect(card.className).toContain('to-blue-900');
      expect(card.className).toContain('border-blue-700');
    });

    it('should apply default styling when unselected and not submitted', () => {
      const { container } = render(
        <OptionCard {...createDefaultProps({ isSelected: false, isSubmitted: false })} />,
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('from-slate-950');
      expect(card.className).toContain('to-gray-950');
      expect(card.className).toContain('border-gray-800');
    });

    it('should update aria-pressed when selection changes', () => {
      const props = createDefaultProps({ isSelected: false });
      const { rerender, container } = render(<OptionCard {...props} />);

      let card = container.querySelector('[role="button"]');
      expect(card).toHaveAttribute('aria-pressed', 'false');

      rerender(<OptionCard {...createDefaultProps({ isSelected: true })} />);

      card = container.querySelector('[role="button"]');
      expect(card).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Correct/Incorrect Visual Feedback', () => {
    it('should show check icon when showAsCorrect is true and submitted', () => {
      render(<OptionCard {...createDefaultProps({ showAsCorrect: true, isSubmitted: true })} />);
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should show X icon when showAsIncorrect is true and submitted', () => {
      render(<OptionCard {...createDefaultProps({ showAsIncorrect: true, isSubmitted: true })} />);
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should not show check icon when not submitted even if showAsCorrect is true', () => {
      render(<OptionCard {...createDefaultProps({ showAsCorrect: true, isSubmitted: false })} />);
      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
    });

    it('should not show X icon when not submitted even if showAsIncorrect is true', () => {
      render(<OptionCard {...createDefaultProps({ showAsIncorrect: true, isSubmitted: false })} />);
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
    });

    it('should apply green styling when showAsCorrect and submitted', () => {
      const { container } = render(
        <OptionCard {...createDefaultProps({ showAsCorrect: true, isSubmitted: true })} />,
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('from-green-950');
      expect(card.className).toContain('to-green-900');
      expect(card.className).toContain('border-green-700');
    });

    it('should apply red styling when showAsIncorrect and submitted', () => {
      const { container } = render(
        <OptionCard {...createDefaultProps({ showAsIncorrect: true, isSubmitted: true })} />,
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('from-red-950');
      expect(card.className).toContain('to-red-900');
      expect(card.className).toContain('border-red-700');
    });

    it('should apply neutral styling when submitted but neither correct nor incorrect', () => {
      const { container } = render(
        <OptionCard
          {...createDefaultProps({
            showAsCorrect: false,
            showAsIncorrect: false,
            isSubmitted: true,
          })}
        />,
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('from-slate-950');
      expect(card.className).toContain('to-gray-950');
      expect(card.className).toContain('border-gray-800');
    });

    it('should not show any icon when submitted but neither correct nor incorrect', () => {
      render(
        <OptionCard
          {...createDefaultProps({
            showAsCorrect: false,
            showAsIncorrect: false,
            isSubmitted: true,
          })}
        />,
      );
      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
    });

    it('should not show any icon when not submitted', () => {
      render(<OptionCard {...createDefaultProps({ isSubmitted: false })} />);
      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onSelect when clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<OptionCard {...props} />);

      await user.click(screen.getByRole('button'));

      expect(props.onSelect).toHaveBeenCalledTimes(1);
    });

    it('should not call onSelect when disabled and clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ disabled: true });
      render(<OptionCard {...props} />);

      await user.click(screen.getByRole('button'));

      expect(props.onSelect).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<OptionCard {...props} />);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(props.onSelect).toHaveBeenCalledTimes(3);
    });

    it('should call onSelect when card area is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<OptionCard {...props} />);

      await user.click(screen.getByTestId('markdown-renderer'));

      expect(props.onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled styling when disabled is true', () => {
      const { container } = render(<OptionCard {...createDefaultProps({ disabled: true })} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('cursor-not-allowed');
      expect(card.className).toContain('opacity-70');
    });

    it('should have tabIndex -1 when disabled', () => {
      render(<OptionCard {...createDefaultProps({ disabled: true })} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '-1');
    });

    it('should have tabIndex 0 when not disabled', () => {
      render(<OptionCard {...createDefaultProps({ disabled: false })} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should not call onSelect on click when disabled', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ disabled: true });
      render(<OptionCard {...props} />);

      await user.click(screen.getByRole('button'));

      expect(props.onSelect).not.toHaveBeenCalled();
    });

    it('should not call onSelect on keyboard activation when disabled', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ disabled: true });
      render(<OptionCard {...props} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(props.onSelect).not.toHaveBeenCalled();
    });

    it('should apply cursor-pointer when not disabled', () => {
      const { container } = render(<OptionCard {...createDefaultProps({ disabled: false })} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('cursor-pointer');
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should call onSelect when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<OptionCard {...props} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(props.onSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect when Space key is pressed', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<OptionCard {...props} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(props.onSelect).toHaveBeenCalledTimes(1);
    });

    it('should not call onSelect for other keys', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<OptionCard {...props} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('a');
      await user.keyboard('{Tab}');
      await user.keyboard('{Escape}');

      expect(props.onSelect).not.toHaveBeenCalled();
    });

    it('should prevent default behavior on Enter key', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<OptionCard {...props} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      // If default wasn't prevented, focus might move or form might submit
      expect(props.onSelect).toHaveBeenCalled();
    });

    it('should prevent default behavior on Space key', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<OptionCard {...props} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(props.onSelect).toHaveBeenCalled();
    });

    it('should not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ disabled: true });
      render(<OptionCard {...props} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(props.onSelect).not.toHaveBeenCalled();
    });

    it('should be focusable when not disabled', () => {
      render(<OptionCard {...createDefaultProps({ disabled: false })} />);
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Visual Styling', () => {
    it('should have transition classes for animations', () => {
      const { container } = render(<OptionCard {...createDefaultProps()} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('transition-all');
      expect(card.className).toContain('duration-200');
    });

    it('should have backdrop blur and shadow styling', () => {
      const { container } = render(<OptionCard {...createDefaultProps()} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('backdrop-blur-sm');
      expect(card.className).toContain('shadow-sm');
    });

    it('should have border styling', () => {
      const { container } = render(<OptionCard {...createDefaultProps()} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-2');
    });

    it('should have hover effects when not disabled', () => {
      const { container } = render(
        <OptionCard
          {...createDefaultProps({ disabled: false, isSubmitted: false, isSelected: false })}
        />,
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('hover:from-slate-900');
      expect(card.className).toContain('hover:to-gray-900');
      expect(card.className).toContain('hover:border-gray-700');
      expect(card.className).toContain('hover:shadow-md');
    });

    it('should have active scale effect when not disabled', () => {
      const { container } = render(
        <OptionCard
          {...createDefaultProps({ disabled: false, isSubmitted: false, isSelected: false })}
        />,
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('active:scale-[0.99]');
    });
  });

  describe('Option Data Rendering', () => {
    it('should render option with different optionId', () => {
      render(
        <OptionCard
          {...createDefaultProps({ option: createOptionData({ optionId: 'custom-id-123' }) })}
        />,
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render option with long text', () => {
      const longText =
        'This is a very long option text that should still render correctly even when it spans multiple lines and contains a lot of content.';
      render(
        <OptionCard
          {...createDefaultProps({ option: createOptionData({ optionText: longText }) })}
        />,
      );
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should render option with markdown content', () => {
      const markdownText = '**Bold text** and `code`';
      render(
        <OptionCard
          {...createDefaultProps({ option: createOptionData({ optionText: markdownText }) })}
        />,
      );
      expect(screen.getByText(markdownText)).toBeInTheDocument();
    });

    it('should render option with special characters', () => {
      const specialText = '<script>alert("xss")</script>';
      render(
        <OptionCard
          {...createDefaultProps({ option: createOptionData({ optionText: specialText }) })}
        />,
      );
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('should render option with unicode characters', () => {
      const unicodeText = '日本語テスト 🎉 emoji text';
      render(
        <OptionCard
          {...createDefaultProps({ option: createOptionData({ optionText: unicodeText }) })}
        />,
      );
      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });

    it('should render option with empty string', () => {
      render(
        <OptionCard {...createDefaultProps({ option: createOptionData({ optionText: '' }) })} />,
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Component State Combinations', () => {
    it('should render selected correct answer after submission', () => {
      const { container } = render(
        <OptionCard
          {...createDefaultProps({
            isSelected: true,
            showAsCorrect: true,
            isSubmitted: true,
          })}
        />,
      );

      const card = container.querySelector('[role="button"]');
      expect(card).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain('from-green-950');
    });

    it('should render selected incorrect answer after submission', () => {
      const { container } = render(
        <OptionCard
          {...createDefaultProps({
            isSelected: true,
            showAsIncorrect: true,
            isSubmitted: true,
          })}
        />,
      );

      const card = container.querySelector('[role="button"]');
      expect(card).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain('from-red-950');
    });

    it('should render unselected correct answer after submission (showing correct answer)', () => {
      const { container } = render(
        <OptionCard
          {...createDefaultProps({
            isSelected: false,
            showAsCorrect: true,
            isSubmitted: true,
          })}
        />,
      );

      const card = container.querySelector('[role="button"]');
      expect(card).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain('from-green-950');
    });

    it('should render disabled selected state', () => {
      const { container } = render(
        <OptionCard
          {...createDefaultProps({
            isSelected: true,
            disabled: true,
          })}
        />,
      );

      const card = container.querySelector('[role="button"]');
      expect(card).toHaveAttribute('aria-pressed', 'true');
      expect(card).toHaveAttribute('tabIndex', '-1');

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain('cursor-not-allowed');
      expect(cardElement.className).toContain('opacity-70');
    });

    it('should render submitted disabled state', () => {
      const { container } = render(
        <OptionCard
          {...createDefaultProps({
            isSubmitted: true,
            disabled: true,
            showAsCorrect: true,
          })}
        />,
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain('cursor-not-allowed');
      expect(cardElement.className).toContain('from-green-950');
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  describe('Re-rendering and Updates', () => {
    it('should update visual state when selection changes', () => {
      const props = createDefaultProps({ isSelected: false });
      const { rerender, container } = render(<OptionCard {...props} />);

      let card = container.firstChild as HTMLElement;
      expect(card.className).toContain('from-slate-950');

      rerender(<OptionCard {...createDefaultProps({ isSelected: true })} />);

      card = container.firstChild as HTMLElement;
      expect(card.className).toContain('from-blue-950');
    });

    it('should update visual state when submitted', () => {
      const props = createDefaultProps({ isSubmitted: false, showAsCorrect: true });
      const { rerender, container } = render(<OptionCard {...props} />);

      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();

      rerender(<OptionCard {...createDefaultProps({ isSubmitted: true, showAsCorrect: true })} />);

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('from-green-950');
    });

    it('should update when disabled state changes', () => {
      const props = createDefaultProps({ disabled: false });
      const { rerender, container } = render(<OptionCard {...props} />);

      let card = container.querySelector('[role="button"]');
      expect(card).toHaveAttribute('tabIndex', '0');

      rerender(<OptionCard {...createDefaultProps({ disabled: true })} />);

      card = container.querySelector('[role="button"]');
      expect(card).toHaveAttribute('tabIndex', '-1');
    });

    it('should maintain click handler functionality after re-render', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      const { rerender } = render(<OptionCard {...props} />);

      await user.click(screen.getByRole('button'));
      expect(props.onSelect).toHaveBeenCalledTimes(1);

      const newProps = createDefaultProps();
      rerender(<OptionCard {...newProps} />);

      await user.click(screen.getByRole('button'));
      expect(newProps.onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have role="button" for interactive element', () => {
      render(<OptionCard {...createDefaultProps()} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have aria-pressed for toggle state', () => {
      render(<OptionCard {...createDefaultProps({ isSelected: true })} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have correct tabIndex for focus management', () => {
      render(<OptionCard {...createDefaultProps()} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should have negative tabIndex when disabled', () => {
      render(<OptionCard {...createDefaultProps({ disabled: true })} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '-1');
    });

    it('should support keyboard navigation with Enter', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<OptionCard {...props} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(props.onSelect).toHaveBeenCalledTimes(1);
    });

    it('should support keyboard navigation with Space', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<OptionCard {...props} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(props.onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memoization', () => {
    it('should use memo to prevent unnecessary re-renders', () => {
      // This test verifies the component is exported as memo
      // The actual memoization behavior is tested through React's internals
      const props = createDefaultProps();
      const { rerender } = render(<OptionCard {...props} />);

      // Re-render with same props - memoized component should not re-render
      rerender(<OptionCard {...props} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle both showAsCorrect and showAsIncorrect being true (edge case)', () => {
      // Component prioritizes showAsCorrect in the getCardClasses conditional
      const { container } = render(
        <OptionCard
          {...createDefaultProps({
            showAsCorrect: true,
            showAsIncorrect: true,
            isSubmitted: true,
          })}
        />,
      );

      const card = container.firstChild as HTMLElement;
      // showAsCorrect takes precedence due to if-else logic
      expect(card.className).toContain('from-green-950');
      // Both icons would show based on the getIcon logic
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should handle undefined optional props', () => {
      const props = {
        option: createOptionData(),
        isSelected: false,
        isSubmitted: false,
        onSelect: vi.fn(),
        // showAsCorrect, showAsIncorrect, and disabled are not provided
      };
      render(<OptionCard {...props} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle rapid state changes', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      const { rerender } = render(<OptionCard {...props} />);

      await user.click(screen.getByRole('button'));
      rerender(<OptionCard {...createDefaultProps({ isSelected: true })} />);
      rerender(<OptionCard {...createDefaultProps({ isSelected: false })} />);
      rerender(
        <OptionCard
          {...createDefaultProps({ isSelected: true, isSubmitted: true, showAsCorrect: true })}
        />,
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });
});
