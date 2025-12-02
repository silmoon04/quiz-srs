import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from '@/components/ui/progress';

describe('Progress', () => {
  it('renders with value of 0', () => {
    render(<Progress value={0} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
  });

  it('renders with value of 50', () => {
    render(<Progress value={50} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
  });

  it('renders with value of 100', () => {
    render(<Progress value={100} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
  });

  it('renders with default value when no value provided', () => {
    render(<Progress data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
  });

  it('has correct accessibility role', () => {
    render(<Progress value={50} />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
  });

  it('reflects value prop through indicator transform', () => {
    render(<Progress value={75} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    const indicator = progress.querySelector('[data-state]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' });
  });

  it('has correct aria-valuemin attribute', () => {
    render(<Progress value={50} />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
  });

  it('has correct aria-valuemax attribute', () => {
    render(<Progress value={50} />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('merges custom className with default styles', () => {
    render(<Progress value={50} className="custom-class" data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveClass('custom-class');
    expect(progress).toHaveClass('relative');
    expect(progress).toHaveClass('h-4');
    expect(progress).toHaveClass('w-full');
  });

  it('applies default styles', () => {
    render(<Progress value={50} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveClass('relative');
    expect(progress).toHaveClass('h-4');
    expect(progress).toHaveClass('w-full');
    expect(progress).toHaveClass('overflow-hidden');
    expect(progress).toHaveClass('rounded-full');
    expect(progress).toHaveClass('bg-secondary');
  });

  it('calculates indicator translateX correctly for value 0', () => {
    render(<Progress value={0} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    const indicator = progress.querySelector('[data-state]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('calculates indicator translateX correctly for value 50', () => {
    render(<Progress value={50} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    const indicator = progress.querySelector('[data-state]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
  });

  it('calculates indicator translateX correctly for value 100', () => {
    render(<Progress value={100} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    const indicator = progress.querySelector('[data-state]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
  });

  it('calculates indicator translateX correctly for undefined value', () => {
    render(<Progress data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    const indicator = progress.querySelector('[data-state]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('forwards ref to the progress element', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Progress ref={ref} value={50} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes through additional props', () => {
    render(<Progress value={50} data-testid="test-progress" aria-label="Loading progress" />);

    const progress = screen.getByTestId('test-progress');
    expect(progress).toHaveAttribute('aria-label', 'Loading progress');
  });

  it('indicator has correct styling classes', () => {
    render(<Progress value={50} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    const indicator = progress.querySelector('[data-state]');
    expect(indicator).toHaveClass('h-full');
    expect(indicator).toHaveClass('w-full');
    expect(indicator).toHaveClass('flex-1');
    expect(indicator).toHaveClass('bg-primary');
    expect(indicator).toHaveClass('transition-all');
  });
});
