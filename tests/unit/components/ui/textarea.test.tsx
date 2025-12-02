import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('displays initial value', () => {
    render(<Textarea defaultValue="Hello World" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveValue('Hello World');
  });

  it('updates value on user input', async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');

    await user.type(textarea, 'New text');
    expect(textarea).toHaveValue('New text');
  });

  it('handles controlled value changes', async () => {
    const user = userEvent.setup();
    render(<Textarea defaultValue="Initial" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');

    await user.clear(textarea);
    await user.type(textarea, 'Updated value');
    expect(textarea).toHaveValue('Updated value');
  });

  it('renders in disabled state', () => {
    render(<Textarea disabled data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeDisabled();
  });

  it('does not allow input when disabled', async () => {
    const user = userEvent.setup();
    render(<Textarea disabled defaultValue="Original" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');

    await user.type(textarea, 'New text');
    expect(textarea).toHaveValue('Original');
  });

  it('displays placeholder text', () => {
    render(<Textarea placeholder="Enter your message" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter your message');
  });

  it('finds textarea by placeholder', () => {
    render(<Textarea placeholder="Type here..." />);
    const textarea = screen.getByPlaceholderText('Type here...');
    expect(textarea).toBeInTheDocument();
  });

  it('applies rows attribute', () => {
    render(<Textarea rows={5} data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('applies custom rows count', () => {
    render(<Textarea rows={10} data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('rows', '10');
  });

  it('merges custom className with default styles', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('custom-class');
    expect(textarea).toHaveClass('flex');
    expect(textarea).toHaveClass('w-full');
  });

  it('preserves default classes when adding custom className', () => {
    render(<Textarea className="my-textarea" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('my-textarea');
    expect(textarea).toHaveClass('rounded-md');
    expect(textarea).toHaveClass('border');
  });

  it('forwards ref to textarea element', () => {
    const ref = { current: null } as React.RefObject<HTMLTextAreaElement>;
    render(<Textarea ref={ref} data-testid="textarea" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('passes through additional props', () => {
    render(<Textarea name="message" id="msg-input" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('name', 'message');
    expect(textarea).toHaveAttribute('id', 'msg-input');
  });
});
