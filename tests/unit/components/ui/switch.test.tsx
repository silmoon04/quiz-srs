import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '@/components/ui/switch';

describe('Switch', () => {
  describe('on/off states', () => {
    it('renders in unchecked state by default', () => {
      render(<Switch aria-label="Test switch" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
      expect(switchElement).not.toBeChecked();
    });

    it('renders in checked state when defaultChecked is true', () => {
      render(<Switch aria-label="Test switch" defaultChecked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
      expect(switchElement).toBeChecked();
    });

    it('applies correct styles for unchecked state', () => {
      render(<Switch aria-label="Test switch" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('applies correct styles for checked state', () => {
      render(<Switch aria-label="Test switch" defaultChecked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('click handling', () => {
    it('toggles from unchecked to checked on click', async () => {
      const user = userEvent.setup();
      render(<Switch aria-label="Test switch" />);
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('toggles from checked to unchecked on click', async () => {
      const user = userEvent.setup();
      render(<Switch aria-label="Test switch" defaultChecked />);
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('data-state', 'checked');
      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('calls onCheckedChange when toggled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch aria-label="Test switch" onCheckedChange={handleChange} />);
      const switchElement = screen.getByRole('switch');

      await user.click(switchElement);
      expect(handleChange).toHaveBeenCalledWith(true);

      await user.click(switchElement);
      expect(handleChange).toHaveBeenCalledWith(false);
      expect(handleChange).toHaveBeenCalledTimes(2);
    });

    it('toggles on keyboard space press', async () => {
      const user = userEvent.setup();
      render(<Switch aria-label="Test switch" />);
      const switchElement = screen.getByRole('switch');

      switchElement.focus();
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
      await user.keyboard(' ');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('disabled state', () => {
    it('renders with disabled attribute when disabled', () => {
      render(<Switch aria-label="Test switch" disabled />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('does not toggle when disabled and clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch aria-label="Test switch" disabled onCheckedChange={handleChange} />);
      const switchElement = screen.getByRole('switch');

      await user.click(switchElement);
      expect(handleChange).not.toHaveBeenCalled();
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('maintains checked state when disabled', () => {
      render(<Switch aria-label="Test switch" disabled defaultChecked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('controlled mode', () => {
    it('respects controlled checked prop', () => {
      const { rerender } = render(<Switch aria-label="Test switch" checked={false} />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');

      rerender(<Switch aria-label="Test switch" checked={true} />);
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('does not toggle state internally when controlled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch aria-label="Test switch" checked={false} onCheckedChange={handleChange} />);
      const switchElement = screen.getByRole('switch');

      await user.click(switchElement);
      // onCheckedChange should be called, but state should remain unchecked
      // because parent hasn't updated the checked prop
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('updates state when parent changes checked prop', () => {
      const { rerender } = render(<Switch aria-label="Test switch" checked={false} />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');

      rerender(<Switch aria-label="Test switch" checked={true} />);
      expect(switchElement).toHaveAttribute('data-state', 'checked');

      rerender(<Switch aria-label="Test switch" checked={false} />);
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });
  });

  describe('additional props', () => {
    it('accepts custom className', () => {
      render(<Switch aria-label="Test switch" className="custom-class" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Switch aria-label="Test switch" ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });

    it('supports id prop', () => {
      render(<Switch aria-label="Test switch" id="my-switch" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('id', 'my-switch');
    });

    it('supports required prop', () => {
      render(<Switch aria-label="Test switch" required />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-required', 'true');
    });

    it('supports aria-label for accessibility', () => {
      render(<Switch aria-label="Toggle notifications" />);
      const switchElement = screen.getByRole('switch', { name: 'Toggle notifications' });
      expect(switchElement).toBeInTheDocument();
    });
  });
});
