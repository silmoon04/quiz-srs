import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

describe('Tabs Component', () => {
  const renderTabs = (props?: {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => {
    return render(
      <Tabs
        defaultValue={props?.defaultValue ?? 'tab1'}
        value={props?.value}
        onValueChange={props?.onValueChange}
      >
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>,
    );
  };

  describe('Tabs', () => {
    it('renders without crashing', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders all tab triggers', () => {
      renderTabs();
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
    });
  });

  describe('TabsList', () => {
    it('renders with correct role', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-class">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole('tablist')).toHaveClass('custom-class');
    });
  });

  describe('TabsTrigger', () => {
    it('renders with correct role', () => {
      renderTabs();
      const triggers = screen.getAllByRole('tab');
      expect(triggers).toHaveLength(3);
    });

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveClass('custom-trigger');
    });

    it('can be disabled', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeDisabled();
    });
  });

  describe('TabsContent', () => {
    it('renders with correct role', () => {
      renderTabs();
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content">
            Content 1
          </TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole('tabpanel')).toHaveClass('custom-content');
    });
  });

  describe('Tab Switching', () => {
    it('switches content when clicking different tabs', async () => {
      const user = userEvent.setup();
      renderTabs();

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
      expect(screen.getByText('Content 2')).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Tab 3' }));
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('updates aria-selected attribute on tab switch', async () => {
      const user = userEvent.setup();
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab2).toHaveAttribute('aria-selected', 'false');

      await user.click(tab2);

      expect(tab1).toHaveAttribute('aria-selected', 'false');
      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });

    it('does not switch to disabled tab', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });
  });

  describe('Default Value', () => {
    it('shows first tab content by default when defaultValue matches', () => {
      renderTabs({ defaultValue: 'tab1' });
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('shows correct tab content for different defaultValue', () => {
      renderTabs({ defaultValue: 'tab2' });
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('sets correct tab as active based on defaultValue', () => {
      renderTabs({ defaultValue: 'tab3' });
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Controlled Mode', () => {
    it('respects controlled value prop', () => {
      const { rerender } = render(
        <Tabs value="tab1" onValueChange={() => {}}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      rerender(
        <Tabs value="tab2" onValueChange={() => {}}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('calls onValueChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Tabs value="tab1" onValueChange={handleChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
      expect(handleChange).toHaveBeenCalledWith('tab2');
    });

    it('does not change tab without external state update in controlled mode', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Tabs value="tab1" onValueChange={handleChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      // Content should still be tab1 since value prop didn't change
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(handleChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates to next tab with ArrowRight', async () => {
      const user = userEvent.setup();
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();
    });

    it('navigates to previous tab with ArrowLeft', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab2' });

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      tab2.focus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();
    });

    it('wraps to first tab when pressing ArrowRight on last tab', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab3' });

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      tab3.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();
    });

    it('wraps to last tab when pressing ArrowLeft on first tab', async () => {
      const user = userEvent.setup();
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();
    });

    it('navigates to first tab with Home key', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab3' });

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      tab3.focus();

      await user.keyboard('{Home}');
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();
    });

    it('navigates to last tab with End key', async () => {
      const user = userEvent.setup();
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{End}');
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();
    });

    it('activates tab with Enter key', async () => {
      const user = userEvent.setup();
      renderTabs();

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      tab2.focus();

      await user.keyboard('{Enter}');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('activates tab with Space key', async () => {
      const user = userEvent.setup();
      renderTabs();

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      tab2.focus();

      await user.keyboard(' ');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('skips disabled tabs during keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-controls relationship', () => {
      renderTabs();
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tabPanel = screen.getByRole('tabpanel');

      const controlsId = tab1.getAttribute('aria-controls');
      expect(tabPanel).toHaveAttribute('id', controlsId);
    });

    it('tabpanel has aria-labelledby pointing to active tab', () => {
      renderTabs();
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tabPanel = screen.getByRole('tabpanel');

      const tabId = tab1.getAttribute('id');
      expect(tabPanel).toHaveAttribute('aria-labelledby', tabId);
    });
  });
});
