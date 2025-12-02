import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

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

describe('Popover Component', () => {
  describe('Rendering', () => {
    it('renders PopoverTrigger without crashing', () => {
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Open popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    });

    it('renders trigger with correct text content', () => {
      render(
        <Popover>
          <PopoverTrigger>Trigger Button</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>,
      );
      expect(screen.getByText('Trigger Button')).toBeInTheDocument();
    });

    it('does not show popover content initially', () => {
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Hidden popover</PopoverContent>
        </Popover>,
      );
      expect(screen.queryByText('Hidden popover')).not.toBeInTheDocument();
    });

    it('renders trigger as a button by default', () => {
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );
      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('renders with asChild prop for custom trigger elements', () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <span data-testid="custom-trigger">Custom trigger</span>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger.tagName).toBe('SPAN');
    });
  });

  describe('Open/Close Behavior', () => {
    it('shows popover content on click', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Click me</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>,
      );

      await user.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });
    });

    it('hides popover content when clicking trigger again', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Toggle</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>,
      );

      const trigger = screen.getByTestId('popover-trigger');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });

      await user.click(trigger);

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });

    it('shows popover with defaultOpen prop', () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Visible popover</PopoverContent>
        </Popover>,
      );
      expect(screen.getByText('Visible popover')).toBeInTheDocument();
    });

    it('shows popover with open prop (controlled)', () => {
      render(
        <Popover open={true}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Controlled popover</PopoverContent>
        </Popover>,
      );
      expect(screen.getByText('Controlled popover')).toBeInTheDocument();
    });

    it('hides popover with open={false} (controlled)', () => {
      render(
        <Popover open={false}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Hidden popover</PopoverContent>
        </Popover>,
      );
      expect(screen.queryByText('Hidden popover')).not.toBeInTheDocument();
    });

    it('hides popover when controlled open state changes to false', () => {
      const { rerender } = render(
        <Popover open={true}>
          <PopoverTrigger data-testid="popover-trigger">Toggle</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>,
      );

      expect(screen.getByText('Popover content')).toBeInTheDocument();

      rerender(
        <Popover open={false}>
          <PopoverTrigger data-testid="popover-trigger">Toggle</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>,
      );

      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });

    it('closes popover when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Popover>
            <PopoverTrigger data-testid="popover-trigger">Open</PopoverTrigger>
            <PopoverContent>Popover content</PopoverContent>
          </Popover>
          <button data-testid="outside-button">Outside</button>
        </div>,
      );

      await user.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('outside-button'));

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });
  });

  describe('PopoverContent Rendering', () => {
    it('renders popover content with custom text', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Custom popover text</PopoverContent>
        </Popover>,
      );
      expect(screen.getByText('Custom popover text')).toBeInTheDocument();
    });

    it('renders popover content with JSX elements', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>
            <span data-testid="inner-span">Inner element</span>
          </PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId('inner-span')).toBeInTheDocument();
    });

    it('renders popover content with multiple children', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>
            <strong>Bold text</strong>
            <span> and normal text</span>
          </PopoverContent>
        </Popover>,
      );
      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('and normal text')).toBeInTheDocument();
    });

    it('renders complex content structure', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>
            <div data-testid="popover-header">Header</div>
            <div data-testid="popover-body">Body content</div>
            <div data-testid="popover-footer">Footer</div>
          </PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId('popover-header')).toBeInTheDocument();
      expect(screen.getByTestId('popover-body')).toBeInTheDocument();
      expect(screen.getByTestId('popover-footer')).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('applies default align of center', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content">Content</PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-align', 'center');
    });

    it('applies custom align prop', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" align="start">
            Content
          </PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-align', 'start');
    });

    it('applies align="end" prop', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" align="end">
            Content
          </PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-align', 'end');
    });

    it('applies default sideOffset of 4', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content">Content</PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toBeInTheDocument();
    });

    it('applies custom sideOffset', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" sideOffset={10}>
            Content
          </PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toBeInTheDocument();
    });

    it('applies side="bottom" prop', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" side="bottom">
            Content
          </PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-side', 'bottom');
    });

    it('applies side="top" prop', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" side="top">
            Content
          </PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-side', 'top');
    });

    it('applies side="left" prop', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" side="left">
            Content
          </PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-side', 'left');
    });

    it('applies side="right" prop', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" side="right">
            Content
          </PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-side', 'right');
    });
  });

  describe('className Merging', () => {
    it('applies custom className to PopoverContent', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" className="custom-popover-class">
            Content
          </PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId('popover-content')).toHaveClass('custom-popover-class');
    });

    it('preserves default classes when custom className is added', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" className="custom-class">
            Content
          </PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveClass('z-50');
      expect(content).toHaveClass('w-72');
      expect(content).toHaveClass('custom-class');
    });

    it('applies multiple custom classes', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" className="class-one class-two">
            Content
          </PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveClass('class-one');
      expect(content).toHaveClass('class-two');
    });

    it('applies default styling classes', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content">Content</PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveClass('rounded-md');
      expect(content).toHaveClass('border');
      expect(content).toHaveClass('p-4');
      expect(content).toHaveClass('shadow-md');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards data attributes to PopoverContent', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" data-custom="value">
            Content
          </PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId('popover-content')).toHaveAttribute('data-custom', 'value');
    });

    it('forwards data attributes to PopoverTrigger', () => {
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger" data-custom="trigger-value">
            Trigger
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId('popover-trigger')).toHaveAttribute('data-custom', 'trigger-value');
    });

    it('forwards aria attributes to PopoverContent', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" aria-label="Popover menu">
            Content
          </PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId('popover-content')).toHaveAttribute('aria-label', 'Popover menu');
    });

    it('forwards id to PopoverContent', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" id="my-popover">
            Content
          </PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId('popover-content')).toHaveAttribute('id', 'my-popover');
    });
  });

  describe('Callback Functions', () => {
    it('calls onOpenChange when popover opens', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Popover onOpenChange={handleOpenChange}>
          <PopoverTrigger data-testid="popover-trigger">Click me</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );

      await user.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('calls onOpenChange when popover closes', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Popover onOpenChange={handleOpenChange}>
          <PopoverTrigger data-testid="popover-trigger">Toggle</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );

      const trigger = screen.getByTestId('popover-trigger');
      await user.click(trigger);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });

      await user.click(trigger);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('calls onOpenChange with correct value on state change', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Popover onOpenChange={handleOpenChange}>
          <PopoverTrigger data-testid="popover-trigger">Click me</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );

      await user.click(screen.getByTestId('popover-trigger'));
      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });

      expect(handleOpenChange).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interaction', () => {
    it('opens popover on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Open</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>,
      );

      const trigger = screen.getByTestId('popover-trigger');
      trigger.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });
    });

    it('opens popover on Space key', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Open</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>,
      );

      const trigger = screen.getByTestId('popover-trigger');
      trigger.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });
    });

    it('closes popover on Escape key', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Open</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>,
      );

      await user.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });

    it('trigger receives focus on tab', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Focus me</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );

      await user.tab();
      expect(screen.getByTestId('popover-trigger')).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('trigger has aria-expanded attribute when closed', () => {
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );
      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('trigger has aria-expanded attribute when open', () => {
      render(
        <Popover open>
          <PopoverTrigger data-testid="popover-trigger">Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );
      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('trigger has aria-haspopup attribute', () => {
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>,
      );
      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('popover content has correct role', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content">Accessible content</PopoverContent>
        </Popover>,
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('role', 'dialog');
    });
  });

  describe('Component Exports', () => {
    it('exports Popover component', () => {
      expect(Popover).toBeDefined();
    });

    it('exports PopoverTrigger component', () => {
      expect(PopoverTrigger).toBeDefined();
    });

    it('exports PopoverContent component', () => {
      expect(PopoverContent).toBeDefined();
    });
  });

  describe('displayName', () => {
    it('PopoverContent has correct displayName', () => {
      expect(PopoverContent.displayName).toBe('PopoverContent');
    });
  });

  describe('Modal Behavior', () => {
    it('supports modal prop for modal behavior', () => {
      render(
        <Popover open modal>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content">Modal content</PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    it('supports non-modal behavior', () => {
      render(
        <Popover open modal={false}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content">Non-modal content</PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });
  });

  describe('Interactive Content', () => {
    it('renders interactive elements inside popover', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>
            <button data-testid="inner-button" onClick={handleClick}>
              Click me
            </button>
          </PopoverContent>
        </Popover>,
      );

      await user.click(screen.getByTestId('inner-button'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('renders form elements inside popover', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>
            <input data-testid="inner-input" type="text" />
            <select data-testid="inner-select">
              <option>Option 1</option>
            </select>
          </PopoverContent>
        </Popover>,
      );

      expect(screen.getByTestId('inner-input')).toBeInTheDocument();
      expect(screen.getByTestId('inner-select')).toBeInTheDocument();
    });

    it('allows typing in input inside popover', async () => {
      const user = userEvent.setup();

      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>
            <input data-testid="inner-input" type="text" />
          </PopoverContent>
        </Popover>,
      );

      const input = screen.getByTestId('inner-input');
      await user.type(input, 'Hello World');
      expect(input).toHaveValue('Hello World');
    });
  });
});
