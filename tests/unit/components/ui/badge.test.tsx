import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  describe('rendering content', () => {
    it('renders children correctly', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge.tagName).toBe('DIV');
    });
  });

  describe('variants', () => {
    it('renders with default variant when no variant is specified', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-primary');
      expect(badge).toHaveClass('text-primary-foreground');
    });

    it('renders with default variant explicitly', () => {
      render(<Badge variant="default">Default Explicit</Badge>);
      const badge = screen.getByText('Default Explicit');
      expect(badge).toHaveClass('bg-primary');
      expect(badge).toHaveClass('text-primary-foreground');
    });

    it('renders with secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass('bg-secondary');
      expect(badge).toHaveClass('text-secondary-foreground');
    });

    it('renders with destructive variant', () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      const badge = screen.getByText('Destructive');
      expect(badge).toHaveClass('bg-destructive');
      expect(badge).toHaveClass('text-destructive-foreground');
    });

    it('renders with outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('text-foreground');
      expect(badge).not.toHaveClass('bg-primary');
      expect(badge).not.toHaveClass('bg-secondary');
      expect(badge).not.toHaveClass('bg-destructive');
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('inline-flex');
    });

    it('allows overriding default styles with custom className', () => {
      render(<Badge className="px-4 py-2">Override Padding</Badge>);
      const badge = screen.getByText('Override Padding');
      expect(badge).toHaveClass('px-4');
      expect(badge).toHaveClass('py-2');
    });

    it('merges className with variant classes', () => {
      render(
        <Badge variant="secondary" className="mt-2">
          Merged
        </Badge>,
      );
      const badge = screen.getByText('Merged');
      expect(badge).toHaveClass('bg-secondary');
      expect(badge).toHaveClass('mt-2');
    });
  });

  describe('base styles', () => {
    it('has rounded-full class for pill shape', () => {
      render(<Badge>Pill</Badge>);
      const badge = screen.getByText('Pill');
      expect(badge).toHaveClass('rounded-full');
    });

    it('has border class', () => {
      render(<Badge>Border</Badge>);
      const badge = screen.getByText('Border');
      expect(badge).toHaveClass('border');
    });

    it('has proper font styling', () => {
      render(<Badge>Font</Badge>);
      const badge = screen.getByText('Font');
      expect(badge).toHaveClass('text-xs');
      expect(badge).toHaveClass('font-semibold');
    });
  });

  describe('HTML attributes', () => {
    it('passes through additional props', () => {
      render(<Badge data-testid="test-badge">Props</Badge>);
      expect(screen.getByTestId('test-badge')).toBeInTheDocument();
    });

    it('supports id attribute', () => {
      render(<Badge id="my-badge">ID Badge</Badge>);
      const badge = screen.getByText('ID Badge');
      expect(badge).toHaveAttribute('id', 'my-badge');
    });

    it('supports aria attributes', () => {
      render(<Badge aria-label="Status badge">Aria</Badge>);
      const badge = screen.getByText('Aria');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });
  });
});
