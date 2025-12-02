import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '@/components/ui/checkbox';
import React from 'react';

describe('Checkbox', () => {
  describe('rendering', () => {
    it('renders unchecked by default', () => {
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('renders with checkbox role', () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('merges custom className with default styles', () => {
      render(<Checkbox className="custom-class" data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('custom-class');
      expect(checkbox).toHaveClass('peer');
      expect(checkbox).toHaveClass('h-4');
      expect(checkbox).toHaveClass('w-4');
    });

    it('applies default styles', () => {
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('peer');
      expect(checkbox).toHaveClass('h-4');
      expect(checkbox).toHaveClass('w-4');
      expect(checkbox).toHaveClass('shrink-0');
      expect(checkbox).toHaveClass('rounded-sm');
      expect(checkbox).toHaveClass('border');
      expect(checkbox).toHaveClass('border-primary');
    });

    it('forwards ref to the checkbox element', () => {
      const ref = { current: null } as React.RefObject<HTMLButtonElement>;
      render(<Checkbox ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('passes through additional props', () => {
      render(<Checkbox data-testid="test-checkbox" aria-label="Accept terms" />);

      const checkbox = screen.getByTestId('test-checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Accept terms');
    });
  });

  describe('checked/unchecked states', () => {
    it('renders checked when defaultChecked is true', () => {
      render(<Checkbox defaultChecked data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('renders unchecked when defaultChecked is false', () => {
      render(<Checkbox defaultChecked={false} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('shows check icon when checked', () => {
      render(<Checkbox defaultChecked data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      const indicator = checkbox.querySelector('[data-state="checked"]');
      expect(indicator).toBeInTheDocument();
    });

    it('hides check icon when unchecked', () => {
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      // When unchecked, the indicator should have data-state="unchecked"
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });
  });

  describe('click handling', () => {
    it('toggles from unchecked to checked on click', async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      await user.click(checkbox);

      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('toggles from checked to unchecked on click', async () => {
      const user = userEvent.setup();
      render(<Checkbox defaultChecked data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');

      await user.click(checkbox);

      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('calls onCheckedChange when clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox onCheckedChange={handleChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('calls onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox defaultChecked onCheckedChange={handleChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(false);
    });
  });

  describe('disabled state', () => {
    it('renders with disabled attribute when disabled', () => {
      render(<Checkbox disabled data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<Checkbox disabled data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-disabled', '');
    });

    it('does not toggle when disabled and clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Checkbox disabled onCheckedChange={handleChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('remains checked when disabled and clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Checkbox disabled defaultChecked onCheckedChange={handleChange} data-testid="checkbox" />,
      );

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('controlled mode', () => {
    it('respects controlled checked prop as true', () => {
      render(<Checkbox checked={true} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('respects controlled checked prop as false', () => {
      render(<Checkbox checked={false} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('does not change state without onCheckedChange in controlled mode', async () => {
      const user = userEvent.setup();
      render(<Checkbox checked={false} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);

      // State should remain unchanged since it's controlled
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('updates state via onCheckedChange in controlled mode', async () => {
      const user = userEvent.setup();

      function ControlledCheckbox() {
        const [checked, setChecked] = React.useState(false);
        return (
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
            data-testid="checkbox"
          />
        );
      }

      render(<ControlledCheckbox />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      await user.click(checkbox);

      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('uncontrolled mode', () => {
    it('manages its own state in uncontrolled mode', async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'checked');

      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('starts with defaultChecked value in uncontrolled mode', async () => {
      const user = userEvent.setup();
      render(<Checkbox defaultChecked data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');

      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });
  });

  describe('keyboard interaction', () => {
    it('toggles on space key press', async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();

      await user.keyboard(' ');

      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('can be focused', () => {
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();

      expect(checkbox).toHaveFocus();
    });

    it('cannot be focused when disabled', () => {
      render(<Checkbox disabled data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();

      expect(checkbox).not.toHaveFocus();
    });
  });
});
