import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';

describe('Label', () => {
  it('renders label with text content', () => {
    render(<Label>Username</Label>);

    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders as a label element', () => {
    render(<Label>Email</Label>);

    const label = screen.getByText('Email');
    expect(label.tagName).toBe('LABEL');
  });

  it('applies htmlFor attribute correctly', () => {
    render(<Label htmlFor="email-input">Email</Label>);

    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('merges custom className with default styles', () => {
    render(<Label className="custom-class">Custom Label</Label>);

    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-class');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
  });

  it('applies default label variant styles', () => {
    render(<Label>Styled Label</Label>);

    const label = screen.getByText('Styled Label');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
    expect(label).toHaveClass('leading-none');
  });

  it('applies disabled styling classes for peer-disabled state', () => {
    render(<Label>Disabled Peer Label</Label>);

    const label = screen.getByText('Disabled Peer Label');
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
    expect(label).toHaveClass('peer-disabled:opacity-70');
  });

  it('forwards ref to the label element', () => {
    const ref = { current: null } as React.RefObject<HTMLLabelElement>;
    render(<Label ref={ref}>Ref Label</Label>);

    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    expect(ref.current?.textContent).toBe('Ref Label');
  });

  it('passes through additional props', () => {
    render(<Label data-testid="test-label">Props Label</Label>);

    expect(screen.getByTestId('test-label')).toBeInTheDocument();
  });

  it('handles data-disabled attribute', () => {
    render(<Label data-disabled="true">Disabled Label</Label>);

    const label = screen.getByText('Disabled Label');
    expect(label).toHaveAttribute('data-disabled', 'true');
  });

  it('renders children correctly', () => {
    render(
      <Label>
        <span>Nested</span> Content
      </Label>,
    );

    expect(screen.getByText('Nested')).toBeInTheDocument();
    expect(screen.getByText(/Content/)).toBeInTheDocument();
  });
});
