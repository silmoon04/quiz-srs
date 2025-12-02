import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from '@/components/ui/input';

describe('Input', () => {
  describe('rendering with different types', () => {
    it('renders with type text by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with type text explicitly', () => {
      render(<Input type="text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with type email', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders with type password', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders with type number', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('value changes', () => {
    it('allows user to type in the input', async () => {
      const user = userEvent.setup();
      render(<Input type="text" />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Hello World');
      expect(input).toHaveValue('Hello World');
    });

    it('calls onChange handler when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input type="text" onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalledTimes(4);
    });

    it('supports controlled value', () => {
      render(<Input type="text" value="controlled value" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('controlled value');
    });

    it('supports default value', () => {
      render(<Input type="text" defaultValue="default value" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('default value');
    });
  });

  describe('disabled state', () => {
    it('renders in disabled state when disabled prop is true', () => {
      render(<Input type="text" disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('does not allow user input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input type="text" disabled defaultValue="" />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');
      expect(input).toHaveValue('');
    });

    it('is not disabled by default', () => {
      render(<Input type="text" />);
      const input = screen.getByRole('textbox');
      expect(input).not.toBeDisabled();
    });
  });

  describe('placeholder', () => {
    it('renders with placeholder text', () => {
      render(<Input type="text" placeholder="Enter your name" />);
      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
    });

    it('placeholder is visible when input is empty', () => {
      render(<Input type="text" placeholder="Search..." />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toHaveAttribute('placeholder', 'Search...');
    });
  });

  describe('className merging', () => {
    it('applies default classes', () => {
      render(<Input type="text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md');
    });

    it('merges custom className with default classes', () => {
      render(<Input type="text" className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('flex', 'h-10', 'w-full');
    });

    it('allows overriding default classes with custom className', () => {
      render(<Input type="text" className="h-12" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-12');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the input element', () => {
      const ref = { current: null } as React.RefObject<HTMLInputElement>;
      render(<Input type="text" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('additional props', () => {
    it('passes through additional HTML attributes', () => {
      render(<Input type="text" aria-label="Custom input" data-testid="custom-input" />);
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('aria-label', 'Custom input');
    });

    it('supports name attribute', () => {
      render(<Input type="text" name="username" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('supports required attribute', () => {
      render(<Input type="text" required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('supports readOnly attribute', () => {
      render(<Input type="text" readOnly defaultValue="read only" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });
});
