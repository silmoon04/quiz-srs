import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

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

describe('Collapsible Component', () => {
  describe('Rendering', () => {
    it('renders CollapsibleTrigger without crashing', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('collapsible-trigger')).toBeInTheDocument();
    });

    it('renders trigger with correct text content', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Click to expand</CollapsibleTrigger>
          <CollapsibleContent>Hidden content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByText('Click to expand')).toBeInTheDocument();
    });

    it('does not show collapsible content initially when closed', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Hidden content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('renders trigger as a button by default', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="collapsible-trigger">Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      const trigger = screen.getByTestId('collapsible-trigger');
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('renders with asChild prop for custom trigger elements', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger asChild>
            <span data-testid="custom-trigger">Custom trigger</span>
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger.tagName).toBe('SPAN');
    });
  });

  describe('Expand/Collapse Behavior', () => {
    it('shows content on click', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Expanded content</CollapsibleContent>
        </Collapsible>,
      );

      await user.click(screen.getByTestId('collapsible-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Expanded content')).toBeInTheDocument();
      });
    });

    it('hides content when clicking again (toggle behavior)', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Toggle content</CollapsibleContent>
        </Collapsible>,
      );

      // First click - expand
      await user.click(screen.getByTestId('collapsible-trigger'));
      await waitFor(() => {
        expect(screen.getByText('Toggle content')).toBeInTheDocument();
      });

      // Second click - collapse
      await user.click(screen.getByTestId('collapsible-trigger'));
      await waitFor(() => {
        expect(screen.queryByText('Toggle content')).not.toBeInTheDocument();
      });
    });

    it('shows content with defaultOpen prop', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Default open content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByText('Default open content')).toBeInTheDocument();
    });

    it('can collapse content that was defaultOpen', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Collapsible content</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.getByText('Collapsible content')).toBeInTheDocument();

      await user.click(screen.getByTestId('collapsible-trigger'));

      await waitFor(() => {
        expect(screen.queryByText('Collapsible content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Controlled Mode', () => {
    it('shows content with open={true} (controlled)', () => {
      render(
        <Collapsible open={true}>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Controlled open content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByText('Controlled open content')).toBeInTheDocument();
    });

    it('hides content with open={false} (controlled)', () => {
      render(
        <Collapsible open={false}>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Hidden content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('updates content visibility when controlled open state changes', () => {
      const { rerender } = render(
        <Collapsible open={true}>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Controlled content</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.getByText('Controlled content')).toBeInTheDocument();

      rerender(
        <Collapsible open={false}>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Controlled content</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();
    });

    it('calls onOpenChange when trigger is clicked', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Collapsible open={false} onOpenChange={handleOpenChange}>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      await user.click(screen.getByTestId('collapsible-trigger'));

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it('calls onOpenChange with false when closing', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Collapsible open={true} onOpenChange={handleOpenChange}>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      await user.click(screen.getByTestId('collapsible-trigger'));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('respects controlled state and ignores clicks when handler does not update state', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Collapsible open={false} onOpenChange={handleOpenChange}>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      await user.click(screen.getByTestId('collapsible-trigger'));

      // Content should still be hidden since we don't update the state
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Content Rendering', () => {
    it('renders content with custom text', () => {
      render(
        <Collapsible open>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Custom content text</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByText('Custom content text')).toBeInTheDocument();
    });

    it('renders content with JSX elements', () => {
      render(
        <Collapsible open>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>
            <span data-testid="inner-span">Inner element</span>
          </CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('inner-span')).toBeInTheDocument();
    });

    it('renders complex content structure', () => {
      render(
        <Collapsible open>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>
            <div data-testid="content-container">
              <h3>Heading</h3>
              <p>Paragraph text</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('content-container')).toBeInTheDocument();
      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('Paragraph text')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  describe('Keyboard Interaction', () => {
    it('expands on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Keyboard content</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByTestId('collapsible-trigger');
      trigger.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Keyboard content')).toBeInTheDocument();
      });
    });

    it('expands on Space key', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Space content</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByTestId('collapsible-trigger');
      trigger.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByText('Space content')).toBeInTheDocument();
      });
    });

    it('collapses on Enter key when open', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content to close</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.getByText('Content to close')).toBeInTheDocument();

      const trigger = screen.getByTestId('collapsible-trigger');
      trigger.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.queryByText('Content to close')).not.toBeInTheDocument();
      });
    });

    it('trigger receives focus on tab', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="collapsible-trigger">Focus me</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      await user.tab();
      expect(screen.getByTestId('collapsible-trigger')).toHaveFocus();
    });
  });

  describe('Disabled State', () => {
    it('does not expand when disabled', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible disabled>
          <CollapsibleTrigger data-testid="collapsible-trigger">
            Disabled trigger
          </CollapsibleTrigger>
          <CollapsibleContent>Should not show</CollapsibleContent>
        </Collapsible>,
      );

      await user.click(screen.getByTestId('collapsible-trigger'));

      expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
    });

    it('trigger has disabled attribute when collapsible is disabled', () => {
      render(
        <Collapsible disabled>
          <CollapsibleTrigger data-testid="collapsible-trigger">
            Disabled trigger
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByTestId('collapsible-trigger');
      expect(trigger).toHaveAttribute('data-disabled');
    });

    it('does not call onOpenChange when disabled', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Collapsible disabled onOpenChange={handleOpenChange}>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      await user.click(screen.getByTestId('collapsible-trigger'));

      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards data attributes to Collapsible root', () => {
      render(
        <Collapsible data-testid="collapsible-root" data-custom="value">
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('collapsible-root')).toHaveAttribute('data-custom', 'value');
    });

    it('forwards data attributes to CollapsibleTrigger', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="trigger" data-custom="trigger-value">
            Trigger
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-custom', 'trigger-value');
    });

    it('forwards data attributes to CollapsibleContent', () => {
      render(
        <Collapsible open>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent data-testid="content" data-custom="content-value">
            Content
          </CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('content')).toHaveAttribute('data-custom', 'content-value');
    });

    it('forwards className to Collapsible root', () => {
      render(
        <Collapsible data-testid="collapsible-root" className="custom-class">
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('collapsible-root')).toHaveClass('custom-class');
    });

    it('forwards className to CollapsibleTrigger', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="trigger" className="trigger-class">
            Trigger
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('trigger')).toHaveClass('trigger-class');
    });

    it('forwards className to CollapsibleContent', () => {
      render(
        <Collapsible open>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent data-testid="content" className="content-class">
            Content
          </CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('content')).toHaveClass('content-class');
    });
  });

  describe('Accessibility', () => {
    it('trigger has aria-expanded attribute when closed', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="collapsible-trigger">Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      const trigger = screen.getByTestId('collapsible-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('trigger has aria-expanded attribute when open', () => {
      render(
        <Collapsible open>
          <CollapsibleTrigger data-testid="collapsible-trigger">Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      const trigger = screen.getByTestId('collapsible-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('trigger has aria-controls attribute', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="collapsible-trigger">Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      const trigger = screen.getByTestId('collapsible-trigger');
      expect(trigger).toHaveAttribute('aria-controls');
    });

    it('content has correct id matching aria-controls', () => {
      render(
        <Collapsible open>
          <CollapsibleTrigger data-testid="collapsible-trigger">Trigger</CollapsibleTrigger>
          <CollapsibleContent data-testid="content">Content</CollapsibleContent>
        </Collapsible>,
      );
      const trigger = screen.getByTestId('collapsible-trigger');
      const content = screen.getByTestId('content');
      const ariaControls = trigger.getAttribute('aria-controls');
      expect(content).toHaveAttribute('id', ariaControls);
    });

    it('updates aria-expanded when toggled', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByTestId('collapsible-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Data State Attributes', () => {
    it('root has data-state="closed" when collapsed', () => {
      render(
        <Collapsible data-testid="collapsible-root">
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('collapsible-root')).toHaveAttribute('data-state', 'closed');
    });

    it('root has data-state="open" when expanded', () => {
      render(
        <Collapsible data-testid="collapsible-root" open>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('collapsible-root')).toHaveAttribute('data-state', 'open');
    });

    it('trigger has data-state="closed" when collapsed', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger data-testid="trigger">Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-state', 'closed');
    });

    it('trigger has data-state="open" when expanded', () => {
      render(
        <Collapsible open>
          <CollapsibleTrigger data-testid="trigger">Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-state', 'open');
    });

    it('content has data-state="open" when expanded', () => {
      render(
        <Collapsible open>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent data-testid="content">Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('content')).toHaveAttribute('data-state', 'open');
    });
  });

  describe('Component Exports', () => {
    it('exports Collapsible component', () => {
      expect(Collapsible).toBeDefined();
    });

    it('exports CollapsibleTrigger component', () => {
      expect(CollapsibleTrigger).toBeDefined();
    });

    it('exports CollapsibleContent component', () => {
      expect(CollapsibleContent).toBeDefined();
    });
  });

  describe('Callback Functions', () => {
    it('calls onOpenChange when expanding', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Collapsible onOpenChange={handleOpenChange}>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      await user.click(screen.getByTestId('collapsible-trigger'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('calls onOpenChange when collapsing', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Collapsible defaultOpen onOpenChange={handleOpenChange}>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      await user.click(screen.getByTestId('collapsible-trigger'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('calls onOpenChange on each toggle', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Collapsible onOpenChange={handleOpenChange}>
          <CollapsibleTrigger data-testid="collapsible-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );

      await user.click(screen.getByTestId('collapsible-trigger'));
      await user.click(screen.getByTestId('collapsible-trigger'));
      await user.click(screen.getByTestId('collapsible-trigger'));

      expect(handleOpenChange).toHaveBeenCalledTimes(3);
      expect(handleOpenChange).toHaveBeenNthCalledWith(1, true);
      expect(handleOpenChange).toHaveBeenNthCalledWith(2, false);
      expect(handleOpenChange).toHaveBeenNthCalledWith(3, true);
    });
  });
});
