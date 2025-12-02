import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton', () => {
  describe('rendering', () => {
    it('renders a div element', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.tagName).toBe('DIV');
    });

    it('renders with default classes', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted');
    });
  });

  describe('sizes', () => {
    it('renders with small width', () => {
      render(<Skeleton className="w-16" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-16');
    });

    it('renders with medium width', () => {
      render(<Skeleton className="w-32" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-32');
    });

    it('renders with large width', () => {
      render(<Skeleton className="w-64" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-64');
    });

    it('renders with custom height', () => {
      render(<Skeleton className="h-4" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-4');
    });

    it('renders with full width', () => {
      render(<Skeleton className="w-full" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-full');
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(<Skeleton className="custom-class" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', 'custom-class');
    });

    it('allows overriding rounded class', () => {
      render(<Skeleton className="rounded-full" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('allows overriding background class', () => {
      render(<Skeleton className="bg-primary" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('bg-primary');
    });

    it('accepts multiple custom classes', () => {
      render(<Skeleton className="h-20 w-20 rounded-lg" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-20', 'h-20', 'rounded-lg');
    });
  });

  describe('animation classes', () => {
    it('has animate-pulse class by default', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('allows custom animation class', () => {
      render(<Skeleton className="animate-bounce" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-bounce');
    });

    it('allows disabling animation via className', () => {
      render(<Skeleton className="animate-none" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-none');
    });
  });

  describe('HTML attributes', () => {
    it('passes through data attributes', () => {
      render(<Skeleton data-testid="skeleton" data-custom="value" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('data-custom', 'value');
    });

    it('passes through aria attributes', () => {
      render(<Skeleton data-testid="skeleton" aria-label="Loading content" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    });

    it('passes through id attribute', () => {
      render(<Skeleton id="my-skeleton" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('id', 'my-skeleton');
    });

    it('passes through role attribute', () => {
      render(<Skeleton role="status" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('role', 'status');
    });

    it('passes through style attribute', () => {
      render(<Skeleton style={{ opacity: 0.5 }} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ opacity: '0.5' });
    });
  });
});
