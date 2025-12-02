import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, buttonVariants } from '@/components/ui/button';

describe('Button', () => {
  describe('variants', () => {
    it('renders default variant', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button', { name: 'Default Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('renders destructive variant', () => {
      render(<Button variant="destructive">Destructive Button</Button>);
      const button = screen.getByRole('button', { name: 'Destructive Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline Button</Button>);
      const button = screen.getByRole('button', { name: 'Outline Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('border', 'border-input', 'bg-background');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button', { name: 'Secondary Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost Button</Button>);
      const button = screen.getByRole('button', { name: 'Ghost Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    });

    it('renders link variant', () => {
      render(<Button variant="link">Link Button</Button>);
      const button = screen.getByRole('button', { name: 'Link Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });
  });

  describe('sizes', () => {
    it('renders default size', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button', { name: 'Default Size' });
      expect(button).toHaveClass('h-10', 'px-4', 'py-2');
    });

    it('renders sm size', () => {
      render(<Button size="sm">Small Button</Button>);
      const button = screen.getByRole('button', { name: 'Small Button' });
      expect(button).toHaveClass('h-9', 'px-3');
    });

    it('renders lg size', () => {
      render(<Button size="lg">Large Button</Button>);
      const button = screen.getByRole('button', { name: 'Large Button' });
      expect(button).toHaveClass('h-11', 'px-8');
    });

    it('renders icon size', () => {
      render(
        <Button size="icon" aria-label="Icon Button">
          🔍
        </Button>,
      );
      const button = screen.getByRole('button', { name: 'Icon Button' });
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('click handling', () => {
    it('calls onClick handler when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button', { name: 'Click Me' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick handler multiple times on multiple clicks', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button', { name: 'Click Me' });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('disabled state', () => {
    it('renders disabled button', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: 'Disabled Button' });
      expect(button).toBeDisabled();
    });

    it('has disabled styling classes', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: 'Disabled Button' });
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Disabled Button' });
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('asChild prop', () => {
    it('renders as a slot when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link as Button</a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Link as Button' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('applies button styles to child element', () => {
      render(
        <Button asChild variant="destructive">
          <a href="/test">Styled Link</a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Styled Link' });
      expect(link).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('applies size styles to child element', () => {
      render(
        <Button asChild size="lg">
          <a href="/test">Large Link</a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Large Link' });
      expect(link).toHaveClass('h-11', 'px-8');
    });
  });

  describe('custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      const button = screen.getByRole('button', { name: 'Custom Button' });
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('inline-flex', 'items-center');
    });
  });

  describe('buttonVariants utility', () => {
    it('generates correct classes for default variant and size', () => {
      const classes = buttonVariants();
      expect(classes).toContain('bg-primary');
      expect(classes).toContain('h-10');
    });

    it('generates correct classes for specific variant', () => {
      const classes = buttonVariants({ variant: 'destructive' });
      expect(classes).toContain('bg-destructive');
    });

    it('generates correct classes for specific size', () => {
      const classes = buttonVariants({ size: 'sm' });
      expect(classes).toContain('h-9');
    });

    it('generates correct classes for variant and size combination', () => {
      const classes = buttonVariants({ variant: 'outline', size: 'lg' });
      expect(classes).toContain('border');
      expect(classes).toContain('h-11');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the button element', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('HTML attributes', () => {
    it('passes through type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('passes through aria-label attribute', () => {
      render(<Button aria-label="Custom Label">Button</Button>);
      const button = screen.getByRole('button', { name: 'Custom Label' });
      expect(button).toBeInTheDocument();
    });

    it('passes through data attributes', () => {
      render(<Button data-testid="test-button">Button</Button>);
      const button = screen.getByTestId('test-button');
      expect(button).toBeInTheDocument();
    });
  });
});
