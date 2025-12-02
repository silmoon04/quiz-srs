import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from '@/components/ui/select';

// Mock pointer capture APIs for Radix UI compatibility with JSDOM
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Select Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });

    it('renders trigger with correct role', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders chevron icon inside trigger', () => {
      const { container } = render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders trigger as a button', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveAttribute('type', 'button');
    });
  });

  describe('Placeholder', () => {
    it('displays placeholder text when no value is selected', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('displays custom placeholder', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose your item" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByText('Choose your item')).toBeInTheDocument();
    });

    it('does not display placeholder when value is set', () => {
      render(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.queryByText('Select an option')).not.toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('shows placeholder attribute on trigger when no value', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('data-placeholder');
    });
  });

  describe('Opening and Closing', () => {
    it('opens dropdown when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('shows all items when opened', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">First Option</SelectItem>
            <SelectItem value="option2">Second Option</SelectItem>
            <SelectItem value="option3">Third Option</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      expect(screen.getByText('First Option')).toBeInTheDocument();
      expect(screen.getByText('Second Option')).toBeInTheDocument();
      expect(screen.getByText('Third Option')).toBeInTheDocument();
    });

    it('has correct data-state attribute when closed', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('data-state', 'closed');
    });

    it('updates data-state when opened', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('data-state', 'open');
    });
  });

  describe('Selection', () => {
    it('selects an item when clicked', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));
      await user.click(screen.getByText('Option 2'));

      expect(screen.getByTestId('select-trigger')).toHaveTextContent('Option 2');
    });

    it('calls onValueChange when selection changes', async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));
      await user.click(screen.getByText('Option 1'));

      expect(handleValueChange).toHaveBeenCalledWith('option1');
    });

    it('displays selected value after selection', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));
      await user.click(screen.getByText('Apple'));

      expect(screen.getByTestId('select-trigger')).toHaveTextContent('Apple');
    });

    it('renders with defaultValue selected', () => {
      render(
        <Select defaultValue="option2">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-trigger')).toHaveTextContent('Option 2');
    });

    it('renders controlled component with value prop', () => {
      render(
        <Select value="option1">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Controlled Value</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-trigger')).toHaveTextContent('Controlled Value');
    });

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByText('Option 1'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('renders disabled trigger with correct styling', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeDisabled();
    });

    it('has disabled styling classes', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('disabled:cursor-not-allowed');
      expect(trigger).toHaveClass('disabled:opacity-50');
    });

    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select disabled>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('renders disabled item with correct attribute', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2" disabled>
              Disabled Option
            </SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      const disabledItem = screen.getByText('Disabled Option');
      expect(disabledItem.closest('[data-disabled]')).toBeInTheDocument();
    });
  });

  describe('className Merging', () => {
    it('applies custom className to SelectTrigger', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger" className="custom-trigger-class">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-trigger')).toHaveClass('custom-trigger-class');
    });

    it('preserves default classes when custom className is added', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger" className="custom-class">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('flex');
      expect(trigger).toHaveClass('custom-class');
    });

    it('applies multiple custom classes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger" className="class-one class-two">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('class-one');
      expect(trigger).toHaveClass('class-two');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards data attributes to SelectTrigger', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger" data-custom="value">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-trigger')).toHaveAttribute('data-custom', 'value');
    });

    it('forwards aria-label to SelectTrigger', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger" aria-label="Select an option">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-trigger')).toHaveAttribute(
        'aria-label',
        'Select an option',
      );
    });

    it('forwards id to SelectTrigger', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger" id="my-select">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-trigger')).toHaveAttribute('id', 'my-select');
    });

    it('forwards dir attribute', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('SelectGroup and SelectLabel', () => {
    it('renders grouped items with labels', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    it('renders multiple groups', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select item" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });

    it('can select items from groups', async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group</SelectLabel>
              <SelectItem value="item1">Item 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));
      await user.click(screen.getByText('Item 1'));

      expect(handleValueChange).toHaveBeenCalledWith('item1');
    });
  });

  describe('SelectSeparator', () => {
    it('renders separator between items', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator data-testid="separator" />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('separator has correct styling classes', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator data-testid="separator" />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('bg-muted');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes on trigger', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-autocomplete', 'none');
    });

    it('updates aria-expanded when opened', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('renders listbox when opened', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('renders options with correct role', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
    });

    it('has aria-controls attribute linking to listbox', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-controls');
    });
  });

  describe('Component Exports', () => {
    it('exports SelectScrollUpButton component', () => {
      expect(SelectScrollUpButton).toBeDefined();
    });

    it('exports SelectScrollDownButton component', () => {
      expect(SelectScrollDownButton).toBeDefined();
    });

    it('exports SelectGroup component', () => {
      expect(SelectGroup).toBeDefined();
    });

    it('exports SelectLabel component', () => {
      expect(SelectLabel).toBeDefined();
    });

    it('exports SelectSeparator component', () => {
      expect(SelectSeparator).toBeDefined();
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens with Enter key', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens with Space key', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      trigger.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes with Escape key', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      await user.click(screen.getByTestId('select-trigger'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
