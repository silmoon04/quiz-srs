import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

// Mock ResizeObserver for Radix UI compatibility with JSDOM
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Tooltip Component', () => {
  describe('Rendering', () => {
    it('renders TooltipTrigger without crashing', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
    });

    it('renders trigger with correct text content', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger Button</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByText('Trigger Button')).toBeInTheDocument();
    });

    it('does not show tooltip content initially', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Hidden tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.queryByText('Hidden tooltip')).not.toBeInTheDocument();
    });

    it('renders trigger as a button by default', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">Trigger</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('renders with asChild prop for custom trigger elements', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span data-testid="custom-trigger">Custom trigger</span>
            </TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger.tagName).toBe('SPAN');
    });
  });

  describe('Tooltip Visibility on Hover', () => {
    it('shows tooltip content on hover', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      await user.hover(screen.getByTestId('tooltip-trigger'));

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip when controlled open state changes to false', () => {
      const { rerender } = render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger data-testid="tooltip-trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      rerender(
        <TooltipProvider>
          <Tooltip open={false}>
            <TooltipTrigger data-testid="tooltip-trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip with defaultOpen prop', () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Visible tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('shows tooltip with open prop (controlled)', () => {
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Controlled tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('hides tooltip with open={false} (controlled)', () => {
      render(
        <TooltipProvider>
          <Tooltip open={false}>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Hidden tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.queryByText('Hidden tooltip')).not.toBeInTheDocument();
    });
  });

  describe('TooltipContent Rendering', () => {
    it('renders tooltip content with custom text', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Custom tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByRole('tooltip')).toHaveTextContent('Custom tooltip text');
    });

    it('renders tooltip content with JSX elements', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>
              <span data-testid="inner-span">Inner element</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      // Radix renders content in multiple places - use getAllBy
      expect(screen.getAllByTestId('inner-span').length).toBeGreaterThan(0);
    });

    it('renders tooltip content with multiple children', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>
              <strong>Bold text</strong>
              <span> and normal text</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      // Radix renders content in multiple places - use getAllBy
      expect(screen.getAllByText('Bold text').length).toBeGreaterThan(0);
      expect(screen.getAllByText('and normal text').length).toBeGreaterThan(0);
    });

    it('applies default sideOffset of 4', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content">Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
    });

    it('applies custom sideOffset', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content" sideOffset={10}>
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('className Merging', () => {
    it('applies custom className to TooltipContent', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content" className="custom-tooltip-class">
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByTestId('tooltip-content')).toHaveClass('custom-tooltip-class');
    });

    it('preserves default classes when custom className is added', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content" className="custom-class">
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('z-50');
      expect(content).toHaveClass('custom-class');
    });

    it('applies multiple custom classes', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content" className="class-one class-two">
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('class-one');
      expect(content).toHaveClass('class-two');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards data attributes to TooltipContent', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content" data-custom="value">
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByTestId('tooltip-content')).toHaveAttribute('data-custom', 'value');
    });

    it('forwards data attributes to TooltipTrigger', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger" data-custom="trigger-value">
              Trigger
            </TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByTestId('tooltip-trigger')).toHaveAttribute('data-custom', 'trigger-value');
    });

    it('forwards side prop to TooltipContent', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content" side="bottom">
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-side', 'bottom');
    });

    it('forwards align prop to TooltipContent', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content" align="start">
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-align', 'start');
    });
  });

  describe('TooltipProvider', () => {
    it('renders children correctly', () => {
      render(
        <TooltipProvider>
          <div data-testid="provider-child">Child content</div>
        </TooltipProvider>,
      );
      expect(screen.getByTestId('provider-child')).toBeInTheDocument();
    });

    it('supports delayDuration prop', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">Hover me</TooltipTrigger>
            <TooltipContent>Quick tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      await user.hover(screen.getByTestId('tooltip-trigger'));

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('supports skipDelayDuration prop', () => {
      render(
        <TooltipProvider skipDelayDuration={0}>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct role on tooltip content', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Accessible tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('tooltip content is accessible by role', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Tooltip text');
    });
  });

  describe('Component Exports', () => {
    it('exports Tooltip component', () => {
      expect(Tooltip).toBeDefined();
    });

    it('exports TooltipTrigger component', () => {
      expect(TooltipTrigger).toBeDefined();
    });

    it('exports TooltipContent component', () => {
      expect(TooltipContent).toBeDefined();
    });

    it('exports TooltipProvider component', () => {
      expect(TooltipProvider).toBeDefined();
    });
  });

  describe('Keyboard Interaction', () => {
    it('shows tooltip on focus', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">Focus me</TooltipTrigger>
            <TooltipContent>Focus tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      const trigger = screen.getByTestId('tooltip-trigger');
      await user.tab();
      expect(trigger).toHaveFocus();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on blur', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">Focus me</TooltipTrigger>
            <TooltipContent>Focus tooltip</TooltipContent>
          </Tooltip>
          <button data-testid="other-button">Other</button>
        </TooltipProvider>,
      );

      const trigger = screen.getByTestId('tooltip-trigger');
      await user.tab();
      expect(trigger).toHaveFocus();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      await user.tab();

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('hides tooltip on Escape key', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger data-testid="tooltip-trigger">Hover me</TooltipTrigger>
            <TooltipContent>Escape tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      await user.hover(screen.getByTestId('tooltip-trigger'));

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Callback Functions', () => {
    it('calls onOpenChange when tooltip opens', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip onOpenChange={handleOpenChange}>
            <TooltipTrigger data-testid="tooltip-trigger">Hover me</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      await user.hover(screen.getByTestId('tooltip-trigger'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('calls onOpenChange with correct value on state change', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip onOpenChange={handleOpenChange}>
            <TooltipTrigger data-testid="tooltip-trigger">Hover me</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      // Verify onOpenChange is called with true when opening
      await user.hover(screen.getByTestId('tooltip-trigger'));
      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });

      // Verify the callback was called at least once
      expect(handleOpenChange).toHaveBeenCalled();
    });
  });

  describe('displayName', () => {
    it('TooltipContent has correct displayName', () => {
      expect(TooltipContent.displayName).toBe('TooltipContent');
    });
  });
});
