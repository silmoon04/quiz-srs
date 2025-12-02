import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

describe('Accordion Component', () => {
  describe('Rendering', () => {
    it('renders accordion without crashing', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByText('Trigger 1')).toBeInTheDocument();
    });

    it('renders multiple accordion items', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Trigger 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Trigger 3</AccordionTrigger>
            <AccordionContent>Content 3</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByText('Trigger 1')).toBeInTheDocument();
      expect(screen.getByText('Trigger 2')).toBeInTheDocument();
      expect(screen.getByText('Trigger 3')).toBeInTheDocument();
    });

    it('renders content hidden by default', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger 1</AccordionTrigger>
            <AccordionContent>Hidden Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    });

    it('renders content visible when defaultValue is set', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger 1</AccordionTrigger>
            <AccordionContent>Visible Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByText('Visible Content')).toBeVisible();
    });
  });

  describe('Expand/Collapse Behavior', () => {
    it('expands content when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Click Me</AccordionTrigger>
            <AccordionContent>Expanded Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByText('Click Me'));

      await waitFor(() => {
        expect(screen.getByText('Expanded Content')).toBeVisible();
      });
    });

    it('collapses content when trigger is clicked again in collapsible mode', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Toggle Me</AccordionTrigger>
            <AccordionContent>Collapsible Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Collapsible Content')).toBeVisible();

      await user.click(screen.getByText('Toggle Me'));

      await waitFor(() => {
        expect(screen.queryByText('Collapsible Content')).not.toBeInTheDocument();
      });
    });

    it('does not collapse in non-collapsible single mode', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Non-Collapsible</AccordionTrigger>
            <AccordionContent>Stays Open</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Stays Open')).toBeVisible();

      await user.click(screen.getByText('Non-Collapsible'));

      await waitFor(() => {
        expect(screen.getByText('Stays Open')).toBeVisible();
      });
    });

    it('calls onValueChange when accordion value changes', async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible onValueChange={handleValueChange}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByText('Trigger'));

      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith('item-1');
      });
    });
  });

  describe('Single vs Multiple Mode', () => {
    it('only one item can be open at a time in single mode', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Trigger 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByText('Trigger 1'));
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
      });

      await user.click(screen.getByText('Trigger 2'));
      await waitFor(() => {
        expect(screen.getByText('Content 2')).toBeVisible();
        expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      });
    });

    it('multiple items can be open at the same time in multiple mode', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Trigger 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByText('Trigger 1'));
      await user.click(screen.getByText('Trigger 2'));

      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
        expect(screen.getByText('Content 2')).toBeVisible();
      });
    });

    it('can close items independently in multiple mode', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Trigger 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Content 1')).toBeVisible();
      expect(screen.getByText('Content 2')).toBeVisible();

      await user.click(screen.getByText('Trigger 1'));

      await waitFor(() => {
        expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
        expect(screen.getByText('Content 2')).toBeVisible();
      });
    });

    it('supports defaultValue as array in multiple mode', () => {
      render(
        <Accordion type="multiple" defaultValue={['item-1', 'item-3']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Trigger 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Trigger 3</AccordionTrigger>
            <AccordionContent>Content 3</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Content 1')).toBeVisible();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      expect(screen.getByText('Content 3')).toBeVisible();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('trigger can be focused with Tab key', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="trigger">Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.tab();

      expect(screen.getByTestId('trigger')).toHaveFocus();
    });

    it('expands on Enter key press', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="trigger">Trigger</AccordionTrigger>
            <AccordionContent>Keyboard Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByTestId('trigger');
      trigger.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Keyboard Content')).toBeVisible();
      });
    });

    it('expands on Space key press', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="trigger">Trigger</AccordionTrigger>
            <AccordionContent>Space Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByTestId('trigger');
      trigger.focus();

      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByText('Space Content')).toBeVisible();
      });
    });

    it('navigates between triggers with arrow keys', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="trigger-1">Trigger 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger data-testid="trigger-2">Trigger 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger1 = screen.getByTestId('trigger-1');
      trigger1.focus();

      await user.keyboard('{ArrowDown}');

      expect(screen.getByTestId('trigger-2')).toHaveFocus();
    });

    it('navigates to previous trigger with ArrowUp', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="trigger-1">Trigger 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger data-testid="trigger-2">Trigger 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger2 = screen.getByTestId('trigger-2');
      trigger2.focus();

      await user.keyboard('{ArrowUp}');

      expect(screen.getByTestId('trigger-1')).toHaveFocus();
    });

    it('wraps focus from last to first with ArrowDown', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="trigger-1">Trigger 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger data-testid="trigger-2">Trigger 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger2 = screen.getByTestId('trigger-2');
      trigger2.focus();

      await user.keyboard('{ArrowDown}');

      expect(screen.getByTestId('trigger-1')).toHaveFocus();
    });
  });
});

describe('AccordionItem Component', () => {
  describe('Rendering', () => {
    it('renders accordion item with border-b class by default', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" data-testid="item">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByTestId('item')).toHaveClass('border-b');
    });

    it('renders children correctly', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item Trigger</AccordionTrigger>
            <AccordionContent>Item Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Item Trigger')).toBeInTheDocument();
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="custom-item" data-testid="item">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass('custom-item');
      expect(item).toHaveClass('border-b');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(AccordionItem.displayName).toBe('AccordionItem');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to item element', () => {
      const ref = vi.fn();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" ref={ref}>
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('AccordionTrigger Component', () => {
  describe('Rendering', () => {
    it('renders trigger as a button', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Click to Toggle</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: 'Click to Toggle' })).toBeInTheDocument();
    });

    it('renders chevron icon', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="trigger">Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByTestId('trigger');
      const svg = trigger.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="trigger">Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass(
        'flex',
        'flex-1',
        'items-center',
        'justify-between',
        'py-4',
        'font-medium',
      );
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="custom-trigger" data-testid="trigger">
              Trigger
            </AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toHaveClass('flex', 'flex-1');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(AccordionTrigger.displayName).toBe('AccordionTrigger');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to trigger element', () => {
      const ref = vi.fn();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger ref={ref}>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('aria attributes', () => {
    it('has aria-expanded false when collapsed', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="trigger">Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-expanded true when expanded', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger data-testid="trigger">Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'true');
    });
  });
});

describe('AccordionContent Component', () => {
  describe('Rendering', () => {
    it('renders content with animation classes', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent data-testid="content">Visible Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('overflow-hidden', 'text-sm', 'transition-all');
    });

    it('renders children wrapped in div with padding', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>
              <span data-testid="child">Child Content</span>
            </AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const child = screen.getByTestId('child');
      expect(child.parentElement).toHaveClass('pb-4', 'pt-0');
    });
  });

  describe('className merging', () => {
    it('merges custom className with default padding classes', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent className="custom-content">
              <span data-testid="child">Content</span>
            </AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const child = screen.getByTestId('child');
      expect(child.parentElement).toHaveClass('custom-content');
      expect(child.parentElement).toHaveClass('pb-4', 'pt-0');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(AccordionContent.displayName).toBe('AccordionContent');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to content element', () => {
      const ref = vi.fn();
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent ref={ref}>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('Props Forwarding', () => {
  it('forwards data attributes to AccordionItem', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" data-testid="item" data-custom="value">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId('item')).toHaveAttribute('data-custom', 'value');
  });

  it('forwards aria attributes to AccordionTrigger', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger aria-label="Custom label" data-testid="trigger">
            Trigger
          </AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId('trigger')).toHaveAttribute('aria-label', 'Custom label');
  });

  it('forwards id attribute to AccordionContent', () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent id="content-1" data-testid="content">
            Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId('content')).toHaveAttribute('id', 'content-1');
  });
});

describe('Controlled Accordion', () => {
  it('supports controlled value in single mode', () => {
    const { rerender } = render(
      <Accordion type="single" collapsible value="">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Controlled Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();

    rerender(
      <Accordion type="single" collapsible value="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Controlled Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByText('Controlled Content')).toBeVisible();
  });

  it('supports controlled value in multiple mode', () => {
    const { rerender } = render(
      <Accordion type="multiple" value={[]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

    rerender(
      <Accordion type="multiple" value={['item-1', 'item-2']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });
});
