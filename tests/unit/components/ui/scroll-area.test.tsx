import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

describe('ScrollArea Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ScrollArea data-testid="scroll-area">Content</ScrollArea>);
      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <ScrollArea>
          <p>Test content</p>
        </ScrollArea>,
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <ScrollArea>
          <p>First child</p>
          <p>Second child</p>
          <p>Third child</p>
        </ScrollArea>,
      );
      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });

    it('renders complex nested content', () => {
      render(
        <ScrollArea>
          <div>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </ScrollArea>,
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders viewport with correct class', () => {
      const { container } = render(<ScrollArea>Content</ScrollArea>);
      const viewport = container.querySelector('[data-radix-scroll-area-viewport]');
      expect(viewport).toBeInTheDocument();
      expect(viewport).toHaveClass('h-full', 'w-full');
    });
  });

  describe('className Merging', () => {
    it('applies default className', () => {
      render(<ScrollArea data-testid="scroll-area">Content</ScrollArea>);
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('relative', 'overflow-hidden');
    });

    it('merges custom className with default classes', () => {
      render(
        <ScrollArea data-testid="scroll-area" className="custom-class">
          Content
        </ScrollArea>,
      );
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('relative', 'overflow-hidden', 'custom-class');
    });

    it('merges multiple custom classNames', () => {
      render(
        <ScrollArea data-testid="scroll-area" className="class-one class-two">
          Content
        </ScrollArea>,
      );
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('class-one', 'class-two');
    });

    it('does not lose default classes when custom class is applied', () => {
      render(
        <ScrollArea data-testid="scroll-area" className="my-custom">
          Content
        </ScrollArea>,
      );
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('relative');
      expect(scrollArea).toHaveClass('overflow-hidden');
      expect(scrollArea).toHaveClass('my-custom');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards data attributes', () => {
      render(
        <ScrollArea data-testid="scroll-area" data-custom="value">
          Content
        </ScrollArea>,
      );
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('data-custom', 'value');
    });

    it('forwards aria attributes', () => {
      render(
        <ScrollArea data-testid="scroll-area" aria-label="Scrollable content">
          Content
        </ScrollArea>,
      );
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('aria-label', 'Scrollable content');
    });

    it('forwards id attribute', () => {
      render(
        <ScrollArea data-testid="scroll-area" id="my-scroll-area">
          Content
        </ScrollArea>,
      );
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('id', 'my-scroll-area');
    });

    it('forwards dir attribute', () => {
      render(
        <ScrollArea data-testid="scroll-area" dir="rtl">
          Content
        </ScrollArea>,
      );
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Structure', () => {
    it('contains viewport element', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>,
      );
      const viewport = container.querySelector('[data-radix-scroll-area-viewport]');
      expect(viewport).toBeInTheDocument();
    });

    it('renders children inside viewport', () => {
      const { container } = render(
        <ScrollArea>
          <div data-testid="child">Child content</div>
        </ScrollArea>,
      );
      const viewport = container.querySelector('[data-radix-scroll-area-viewport]');
      const child = screen.getByTestId('child');
      expect(viewport).toContainElement(child);
    });
  });
});

describe('ScrollBar Component', () => {
  describe('Rendering', () => {
    it('renders without crashing when inside ScrollArea', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div style={{ height: '1000px' }}>Tall content</div>
        </ScrollArea>,
      );
      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });

    it('renders content correctly within ScrollArea', () => {
      render(
        <ScrollArea>
          <div style={{ height: '1000px' }}>Content that needs scrolling</div>
        </ScrollArea>,
      );
      expect(screen.getByText('Content that needs scrolling')).toBeInTheDocument();
    });

    it('component is exported and can be used', () => {
      // Test that ScrollBar component is properly exported
      expect(ScrollBar).toBeDefined();
      expect(typeof ScrollBar).toBe('object'); // forwardRef returns an object
    });
  });
});

describe('ScrollArea Integration', () => {
  it('renders ScrollArea with content', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div style={{ height: '1000px' }}>Tall content for scrolling</div>
      </ScrollArea>,
    );
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    expect(screen.getByText('Tall content for scrolling')).toBeInTheDocument();
  });

  it('renders ScrollArea with viewport containing content', () => {
    const { container } = render(
      <ScrollArea data-testid="scroll-area">
        <div style={{ height: '1000px', width: '1000px' }}>Large content</div>
      </ScrollArea>,
    );
    const viewport = container.querySelector('[data-radix-scroll-area-viewport]');
    expect(viewport).toBeInTheDocument();
  });

  it('renders content inside viewport', () => {
    render(
      <ScrollArea>
        <div data-testid="inner-content">Scrollable content here</div>
      </ScrollArea>,
    );
    const content = screen.getByTestId('inner-content');
    expect(content).toBeInTheDocument();
    expect(content.textContent).toBe('Scrollable content here');
  });

  it('applies dir attribute correctly', () => {
    render(
      <ScrollArea data-testid="scroll-area" dir="rtl">
        Content
      </ScrollArea>,
    );
    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveAttribute('dir', 'rtl');
  });

  it('applies ltr dir by default', () => {
    render(<ScrollArea data-testid="scroll-area">Content</ScrollArea>);
    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveAttribute('dir', 'ltr');
  });

  it('maintains nested structure correctly', () => {
    const { container } = render(
      <ScrollArea data-testid="scroll-area">
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </ScrollArea>,
    );
    const scrollArea = screen.getByTestId('scroll-area');
    const viewport = container.querySelector('[data-radix-scroll-area-viewport]');
    const list = screen.getByRole('list');

    expect(scrollArea).toContainElement(viewport as HTMLElement);
    expect(viewport).toContainElement(list);
  });

  it('renders with wide content', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div style={{ width: '2000px' }}>Wide content that may need horizontal scrolling</div>
      </ScrollArea>,
    );
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    expect(screen.getByText('Wide content that may need horizontal scrolling')).toBeInTheDocument();
  });
});
