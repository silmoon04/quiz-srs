import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

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

describe('DropdownMenu Component', () => {
  describe('Rendering', () => {
    it('renders DropdownMenuTrigger without crashing', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
    });

    it('renders trigger with correct text content', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu Button</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText('Menu Button')).toBeInTheDocument();
    });

    it('does not show dropdown content initially', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Hidden item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.queryByText('Hidden item')).not.toBeInTheDocument();
    });

    it('renders trigger as a button by default', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('renders with asChild prop for custom trigger elements', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span data-testid="custom-trigger">Custom trigger</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger.tagName).toBe('SPAN');
    });
  });

  describe('Open/Close Behavior', () => {
    it('shows dropdown content on click', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Click me</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Menu item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Menu item')).toBeInTheDocument();
      });
    });

    it('closes dropdown when pressing Escape', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Menu item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Menu item')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Menu item')).not.toBeInTheDocument();
      });
    });

    it('shows dropdown with defaultOpen prop', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Visible item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText('Visible item')).toBeInTheDocument();
    });

    it('shows dropdown with open prop (controlled)', () => {
      render(
        <DropdownMenu open={true}>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Controlled item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText('Controlled item')).toBeInTheDocument();
    });

    it('hides dropdown with open={false} (controlled)', () => {
      render(
        <DropdownMenu open={false}>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Hidden item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.queryByText('Hidden item')).not.toBeInTheDocument();
    });

    it('hides dropdown when controlled open state changes to false', () => {
      const { rerender } = render(
        <DropdownMenu open={true}>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Menu item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(screen.getByText('Menu item')).toBeInTheDocument();

      rerender(
        <DropdownMenu open={false}>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Menu item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(screen.queryByText('Menu item')).not.toBeInTheDocument();
    });
  });

  describe('Item Selection', () => {
    it('calls onSelect when menu item is clicked', async () => {
      const handleSelect = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleSelect}>Click me</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Click me')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Click me'));

      expect(handleSelect).toHaveBeenCalled();
    });

    it('closes dropdown after item selection by default', async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Select me</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Select me')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Select me'));

      await waitFor(() => {
        expect(screen.queryByText('Select me')).not.toBeInTheDocument();
      });
    });

    it('renders multiple menu items', async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
      });
    });

    it('supports disabled menu items', async () => {
      const handleSelect = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onSelect={handleSelect}>
              Disabled item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Disabled item')).toBeInTheDocument();
      });

      const disabledItem = screen.getByText('Disabled item');
      expect(disabledItem).toHaveAttribute('data-disabled');
    });
  });

  describe('DropdownMenuContent Rendering', () => {
    it('renders dropdown content with custom text', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Custom menu text</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText('Custom menu text')).toBeInTheDocument();
    });

    it('renders dropdown content with JSX elements', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <span data-testid="inner-span">Inner element</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('inner-span')).toBeInTheDocument();
    });

    it('renders complex content structure with labels and separators', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText('My Account')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuLabel', () => {
    it('renders label with correct text', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel data-testid="menu-label">Section Label</DropdownMenuLabel>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('menu-label')).toHaveTextContent('Section Label');
    });

    it('applies inset prop to label', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel data-testid="menu-label" inset>
              Inset Label
            </DropdownMenuLabel>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('menu-label')).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuSeparator', () => {
    it('renders separator element', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator data-testid="menu-separator" />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('menu-separator')).toBeInTheDocument();
    });

    it('separator has correct role', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator data-testid="menu-separator" />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('menu-separator')).toHaveAttribute('role', 'separator');
    });
  });

  describe('DropdownMenuShortcut', () => {
    it('renders shortcut text', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Save
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText('⌘S')).toBeInTheDocument();
    });

    it('applies custom className to shortcut', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Copy
              <DropdownMenuShortcut data-testid="shortcut" className="custom-shortcut">
                ⌘C
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('shortcut')).toHaveClass('custom-shortcut');
    });
  });

  describe('DropdownMenuGroup', () => {
    it('renders group with items', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup data-testid="menu-group">
              <DropdownMenuItem>Group Item 1</DropdownMenuItem>
              <DropdownMenuItem>Group Item 2</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('menu-group')).toBeInTheDocument();
      expect(screen.getByText('Group Item 1')).toBeInTheDocument();
      expect(screen.getByText('Group Item 2')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuCheckboxItem', () => {
    it('renders checkbox item', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>Checkbox Item</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText('Checkbox Item')).toBeInTheDocument();
    });

    it('renders checked checkbox item', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked data-testid="checkbox-item">
              Checked Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('checkbox-item')).toHaveAttribute('data-state', 'checked');
    });

    it('renders unchecked checkbox item', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={false} data-testid="checkbox-item">
              Unchecked Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('checkbox-item')).toHaveAttribute('data-state', 'unchecked');
    });

    it('calls onCheckedChange when checkbox item is clicked', async () => {
      const handleCheckedChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={handleCheckedChange}>
              Toggle me
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Toggle me')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Toggle me'));

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('DropdownMenuRadioGroup and RadioItem', () => {
    it('renders radio group with items', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('marks selected radio item as checked', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1" data-testid="radio-1">
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2" data-testid="radio-2">
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('radio-1')).toHaveAttribute('data-state', 'checked');
      expect(screen.getByTestId('radio-2')).toHaveAttribute('data-state', 'unchecked');
    });

    it('calls onValueChange when radio item is selected', async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1" onValueChange={handleValueChange}>
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Option 2'));

      expect(handleValueChange).toHaveBeenCalledWith('option2');
    });
  });

  describe('Submenu', () => {
    it('renders submenu trigger', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid="sub-trigger">
                More options
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('sub-trigger')).toBeInTheDocument();
      expect(screen.getByText('More options')).toBeInTheDocument();
    });

    it('applies inset prop to submenu trigger', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid="sub-trigger" inset>
                Inset Submenu
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('sub-trigger')).toHaveClass('pl-8');
    });
  });

  describe('className Merging', () => {
    it('applies custom className to DropdownMenuContent', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content" className="custom-dropdown-class">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('dropdown-content')).toHaveClass('custom-dropdown-class');
    });

    it('preserves default classes when custom className is added', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content" className="custom-class">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveClass('z-50');
      expect(content).toHaveClass('custom-class');
    });

    it('applies custom className to DropdownMenuItem', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="menu-item" className="custom-item-class">
              Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('menu-item')).toHaveClass('custom-item-class');
    });

    it('applies inset prop to DropdownMenuItem', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="menu-item" inset>
              Inset Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('menu-item')).toHaveClass('pl-8');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards data attributes to DropdownMenuContent', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content" data-custom="value">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('dropdown-content')).toHaveAttribute('data-custom', 'value');
    });

    it('forwards data attributes to DropdownMenuTrigger', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger" data-custom="trigger-value">
            Trigger
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute(
        'data-custom',
        'trigger-value',
      );
    });

    it('forwards aria attributes to DropdownMenuItem', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="menu-item" aria-label="Menu action">
              Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('menu-item')).toHaveAttribute('aria-label', 'Menu action');
    });
  });

  describe('Callback Functions', () => {
    it('calls onOpenChange when dropdown opens', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Click me</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('calls onOpenChange when dropdown closes', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DropdownMenu onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Keyboard Interaction', () => {
    it('opens dropdown on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Menu item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const trigger = screen.getByTestId('dropdown-trigger');
      trigger.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Menu item')).toBeInTheDocument();
      });
    });

    it('opens dropdown on Space key', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Menu item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const trigger = screen.getByTestId('dropdown-trigger');
      trigger.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByText('Menu item')).toBeInTheDocument();
      });
    });

    it('opens dropdown on ArrowDown key', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Menu item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const trigger = screen.getByTestId('dropdown-trigger');
      trigger.focus();
      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        expect(screen.getByText('Menu item')).toBeInTheDocument();
      });
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Menu item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Menu item')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Menu item')).not.toBeInTheDocument();
      });
    });

    it('navigates items with arrow keys', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="item-1">Item 1</DropdownMenuItem>
            <DropdownMenuItem data-testid="item-2">Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toHaveAttribute('data-highlighted');
      });
    });

    it('selects item with Enter key', async () => {
      const handleSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleSelect}>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.click(screen.getByTestId('dropdown-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(handleSelect).toHaveBeenCalled();
    });

    it('trigger receives focus on tab', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Focus me</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await user.tab();
      expect(screen.getByTestId('dropdown-trigger')).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('trigger has aria-expanded attribute when closed', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('trigger has aria-expanded attribute when open', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('trigger has aria-haspopup attribute', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="dropdown-trigger">Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('dropdown content has correct role', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveAttribute('role', 'menu');
    });

    it('menu item has correct role', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="menu-item">Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const item = screen.getByTestId('menu-item');
      expect(item).toHaveAttribute('role', 'menuitem');
    });

    it('checkbox item has correct role', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem data-testid="checkbox-item">
              Checkbox
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const item = screen.getByTestId('checkbox-item');
      expect(item).toHaveAttribute('role', 'menuitemcheckbox');
    });

    it('radio item has correct role', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem data-testid="radio-item" value="option1">
                Radio
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const item = screen.getByTestId('radio-item');
      expect(item).toHaveAttribute('role', 'menuitemradio');
    });
  });

  describe('Component Exports', () => {
    it('exports DropdownMenu component', () => {
      expect(DropdownMenu).toBeDefined();
    });

    it('exports DropdownMenuTrigger component', () => {
      expect(DropdownMenuTrigger).toBeDefined();
    });

    it('exports DropdownMenuContent component', () => {
      expect(DropdownMenuContent).toBeDefined();
    });

    it('exports DropdownMenuItem component', () => {
      expect(DropdownMenuItem).toBeDefined();
    });

    it('exports DropdownMenuCheckboxItem component', () => {
      expect(DropdownMenuCheckboxItem).toBeDefined();
    });

    it('exports DropdownMenuRadioItem component', () => {
      expect(DropdownMenuRadioItem).toBeDefined();
    });

    it('exports DropdownMenuRadioGroup component', () => {
      expect(DropdownMenuRadioGroup).toBeDefined();
    });

    it('exports DropdownMenuLabel component', () => {
      expect(DropdownMenuLabel).toBeDefined();
    });

    it('exports DropdownMenuSeparator component', () => {
      expect(DropdownMenuSeparator).toBeDefined();
    });

    it('exports DropdownMenuShortcut component', () => {
      expect(DropdownMenuShortcut).toBeDefined();
    });

    it('exports DropdownMenuGroup component', () => {
      expect(DropdownMenuGroup).toBeDefined();
    });

    it('exports DropdownMenuSub component', () => {
      expect(DropdownMenuSub).toBeDefined();
    });

    it('exports DropdownMenuSubTrigger component', () => {
      expect(DropdownMenuSubTrigger).toBeDefined();
    });

    it('exports DropdownMenuSubContent component', () => {
      expect(DropdownMenuSubContent).toBeDefined();
    });
  });

  describe('displayName', () => {
    it('DropdownMenuContent has correct displayName', () => {
      expect(DropdownMenuContent.displayName).toBe('DropdownMenuContent');
    });

    it('DropdownMenuItem has correct displayName', () => {
      expect(DropdownMenuItem.displayName).toBe('DropdownMenuItem');
    });

    it('DropdownMenuLabel has correct displayName', () => {
      expect(DropdownMenuLabel.displayName).toBe('DropdownMenuLabel');
    });

    it('DropdownMenuSeparator has correct displayName', () => {
      expect(DropdownMenuSeparator.displayName).toBe('DropdownMenuSeparator');
    });

    it('DropdownMenuShortcut has correct displayName', () => {
      expect(DropdownMenuShortcut.displayName).toBe('DropdownMenuShortcut');
    });

    it('DropdownMenuSubTrigger has correct displayName', () => {
      expect(DropdownMenuSubTrigger.displayName).toBe('DropdownMenuSubTrigger');
    });

    it('DropdownMenuSubContent has correct displayName', () => {
      expect(DropdownMenuSubContent.displayName).toBe('DropdownMenuSubContent');
    });

    it('DropdownMenuCheckboxItem has correct displayName', () => {
      expect(DropdownMenuCheckboxItem.displayName).toBe('DropdownMenuCheckboxItem');
    });

    it('DropdownMenuRadioItem has correct displayName', () => {
      expect(DropdownMenuRadioItem.displayName).toBe('DropdownMenuRadioItem');
    });
  });

  describe('Modal Behavior', () => {
    it('supports modal prop for modal behavior', () => {
      render(
        <DropdownMenu open modal>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content">
            <DropdownMenuItem>Modal item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    });

    it('supports non-modal behavior', () => {
      render(
        <DropdownMenu open modal={false}>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content">
            <DropdownMenuItem>Non-modal item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    });
  });
});
