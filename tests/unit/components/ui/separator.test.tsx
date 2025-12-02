import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from '@/components/ui/separator';

describe('Separator', () => {
  describe('horizontal orientation', () => {
    it('renders with horizontal orientation by default', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('applies horizontal styling classes', () => {
      render(<Separator data-testid="separator" orientation="horizontal" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-[1px]', 'w-full');
    });
  });

  describe('vertical orientation', () => {
    it('renders with vertical orientation when specified', () => {
      render(<Separator data-testid="separator" orientation="vertical" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });

    it('applies vertical styling classes', () => {
      render(<Separator data-testid="separator" orientation="vertical" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-full', 'w-[1px]');
    });
  });

  describe('decorative vs semantic role', () => {
    it('renders as decorative by default (role="none")', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'none');
    });

    it('renders with separator role when not decorative', () => {
      render(<Separator data-testid="separator" decorative={false} />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'separator');
    });

    it('renders with decorative true explicitly', () => {
      render(<Separator data-testid="separator" decorative={true} />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'none');
    });
  });

  describe('className merging', () => {
    it('applies base classes', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('shrink-0', 'bg-border');
    });

    it('merges custom className with base classes', () => {
      render(<Separator data-testid="separator" className="my-4" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('shrink-0', 'bg-border', 'my-4');
    });

    it('allows overriding default classes with custom className', () => {
      render(<Separator data-testid="separator" className="bg-red-500" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('bg-red-500');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the underlying element', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(<Separator ref={ref} data-testid="separator" />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('additional props', () => {
    it('passes through additional props to the element', () => {
      render(<Separator data-testid="separator" aria-label="Content divider" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('aria-label', 'Content divider');
    });
  });
});
