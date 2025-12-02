import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircularProgress } from '@/components/ui/circular-progress';

// Default props factory
const createDefaultProps = (
  overrides: Partial<{
    value: number;
    size: number;
    strokeWidth: number;
    className: string;
  }> = {},
) => ({
  value: 50,
  size: 40,
  strokeWidth: 3,
  className: '',
  ...overrides,
});

describe('CircularProgress Component', () => {
  describe('Basic Rendering', () => {
    it('should render the circular progress component', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render an SVG element', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render two circle elements (background and progress)', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2);
    });

    it('should render the percentage text', () => {
      render(<CircularProgress {...createDefaultProps({ value: 50 })} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <CircularProgress {...createDefaultProps({ className: 'custom-class' })} />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-class');
    });
  });

  describe('Progress Values', () => {
    it('should render 0% progress correctly', () => {
      render(<CircularProgress {...createDefaultProps({ value: 0 })} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should render 50% progress correctly', () => {
      render(<CircularProgress {...createDefaultProps({ value: 50 })} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render 100% progress correctly', () => {
      render(<CircularProgress {...createDefaultProps({ value: 100 })} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should render 25% progress correctly', () => {
      render(<CircularProgress {...createDefaultProps({ value: 25 })} />);
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should render 75% progress correctly', () => {
      render(<CircularProgress {...createDefaultProps({ value: 75 })} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should render single digit progress correctly', () => {
      render(<CircularProgress {...createDefaultProps({ value: 5 })} />);
      expect(screen.getByText('5%')).toBeInTheDocument();
    });

    it('should render decimal value correctly', () => {
      render(<CircularProgress {...createDefaultProps({ value: 33.5 })} />);
      expect(screen.getByText('33.5%')).toBeInTheDocument();
    });
  });

  describe('Size Variations', () => {
    it('should render with default size (40)', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '40');
      expect(svg).toHaveAttribute('height', '40');
    });

    it('should render with small size (24)', () => {
      const { container } = render(<CircularProgress {...createDefaultProps({ size: 24 })} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('should render with medium size (48)', () => {
      const { container } = render(<CircularProgress {...createDefaultProps({ size: 48 })} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '48');
      expect(svg).toHaveAttribute('height', '48');
    });

    it('should render with large size (80)', () => {
      const { container } = render(<CircularProgress {...createDefaultProps({ size: 80 })} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '80');
      expect(svg).toHaveAttribute('height', '80');
    });

    it('should render with extra large size (120)', () => {
      const { container } = render(<CircularProgress {...createDefaultProps({ size: 120 })} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '120');
    });

    it('should calculate correct circle center for different sizes', () => {
      const { container } = render(<CircularProgress {...createDefaultProps({ size: 60 })} />);
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('cx', '30'); // size / 2
        expect(circle).toHaveAttribute('cy', '30'); // size / 2
      });
    });
  });

  describe('Stroke Width Variations', () => {
    it('should render with default strokeWidth (3)', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '3');
      });
    });

    it('should render with thin strokeWidth (1)', () => {
      const { container } = render(
        <CircularProgress {...createDefaultProps({ strokeWidth: 1 })} />,
      );
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '1');
      });
    });

    it('should render with thick strokeWidth (5)', () => {
      const { container } = render(
        <CircularProgress {...createDefaultProps({ strokeWidth: 5 })} />,
      );
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '5');
      });
    });

    it('should render with very thick strokeWidth (8)', () => {
      const { container } = render(
        <CircularProgress {...createDefaultProps({ strokeWidth: 8 })} />,
      );
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '8');
      });
    });

    it('should calculate correct radius based on size and strokeWidth', () => {
      const size = 40;
      const strokeWidth = 4;
      const expectedRadius = (size - strokeWidth) / 2; // (40 - 4) / 2 = 18

      const { container } = render(
        <CircularProgress {...createDefaultProps({ size, strokeWidth })} />,
      );
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('r', String(expectedRadius));
      });
    });
  });

  describe('SVG Circle Attributes', () => {
    it('should have correct fill attribute on circles', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('fill', 'none');
      });
    });

    it('should have stroke="currentColor" on circles', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke', 'currentColor');
      });
    });

    it('should have strokeLinecap="round" on progress circle', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1]; // Second circle is progress
      expect(progressCircle).toHaveAttribute('stroke-linecap', 'round');
    });

    it('should have correct strokeDasharray on progress circle', () => {
      const size = 40;
      const strokeWidth = 3;
      const radius = (size - strokeWidth) / 2;
      const circumference = radius * 2 * Math.PI;

      const { container } = render(
        <CircularProgress {...createDefaultProps({ size, strokeWidth })} />,
      );
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1];
      expect(progressCircle).toHaveAttribute('stroke-dasharray', String(circumference));
    });

    it('should have correct strokeDashoffset at 0%', () => {
      const size = 40;
      const strokeWidth = 3;
      const radius = (size - strokeWidth) / 2;
      const circumference = radius * 2 * Math.PI;
      const expectedOffset = circumference; // Full offset at 0%

      const { container } = render(
        <CircularProgress {...createDefaultProps({ value: 0, size, strokeWidth })} />,
      );
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1];
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', String(expectedOffset));
    });

    it('should have correct strokeDashoffset at 50%', () => {
      const size = 40;
      const strokeWidth = 3;
      const radius = (size - strokeWidth) / 2;
      const circumference = radius * 2 * Math.PI;
      const expectedOffset = circumference - (50 / 100) * circumference;

      const { container } = render(
        <CircularProgress {...createDefaultProps({ value: 50, size, strokeWidth })} />,
      );
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1];
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', String(expectedOffset));
    });

    it('should have correct strokeDashoffset at 100%', () => {
      const size = 40;
      const strokeWidth = 3;
      const radius = (size - strokeWidth) / 2;
      const circumference = radius * 2 * Math.PI;
      const expectedOffset = 0; // No offset at 100%

      const { container } = render(
        <CircularProgress {...createDefaultProps({ value: 100, size, strokeWidth })} />,
      );
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1];
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', String(expectedOffset));
    });
  });

  describe('Styling Classes', () => {
    it('should have relative positioning on wrapper', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('relative');
    });

    it('should have inline-flex on wrapper', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('inline-flex');
    });

    it('should have items-center and justify-center on wrapper', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('items-center');
      expect(wrapper.className).toContain('justify-center');
    });

    it('should have rotation transform on SVG', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const svg = container.querySelector('svg');
      expect(svg?.className.baseVal).toContain('-rotate-90');
      expect(svg?.className.baseVal).toContain('transform');
    });

    it('should have gray background circle styling', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const circles = container.querySelectorAll('circle');
      const backgroundCircle = circles[0];
      expect(backgroundCircle.className.baseVal).toContain('text-gray-700');
    });

    it('should have transition animation on progress circle', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1];
      expect(progressCircle.className.baseVal).toContain('transition-all');
      expect(progressCircle.className.baseVal).toContain('duration-300');
      expect(progressCircle.className.baseVal).toContain('ease-in-out');
    });

    it('should have text-current on progress circle', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1];
      expect(progressCircle.className.baseVal).toContain('text-current');
    });

    it('should have absolute positioning on percentage text container', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const textContainer = container.querySelector('.absolute');
      expect(textContainer).toBeInTheDocument();
      expect(textContainer?.className).toContain('inset-0');
    });

    it('should have centered text styling', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const textContainer = container.querySelector('.absolute');
      expect(textContainer?.className).toContain('flex');
      expect(textContainer?.className).toContain('items-center');
      expect(textContainer?.className).toContain('justify-center');
    });

    it('should have font styling on percentage text', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const percentageText = container.querySelector('.text-xs');
      expect(percentageText).toBeInTheDocument();
      expect(percentageText?.className).toContain('font-light');
      expect(percentageText?.className).toContain('text-current');
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative value', () => {
      render(<CircularProgress {...createDefaultProps({ value: -10 })} />);
      expect(screen.getByText('-10%')).toBeInTheDocument();
    });

    it('should handle value greater than 100', () => {
      render(<CircularProgress {...createDefaultProps({ value: 150 })} />);
      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('should handle very small size', () => {
      const { container } = render(<CircularProgress {...createDefaultProps({ size: 16 })} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });

    it('should handle very large size', () => {
      const { container } = render(<CircularProgress {...createDefaultProps({ size: 200 })} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '200');
      expect(svg).toHaveAttribute('height', '200');
    });

    it('should handle strokeWidth equal to size/2', () => {
      const { container } = render(
        <CircularProgress {...createDefaultProps({ size: 40, strokeWidth: 20 })} />,
      );
      const circles = container.querySelectorAll('circle');
      const expectedRadius = (40 - 20) / 2; // 10
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('r', String(expectedRadius));
      });
    });
  });

  describe('Props Defaults', () => {
    it('should use default size when not provided', () => {
      const { container } = render(<CircularProgress value={50} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '40');
      expect(svg).toHaveAttribute('height', '40');
    });

    it('should use default strokeWidth when not provided', () => {
      const { container } = render(<CircularProgress value={50} />);
      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '3');
      });
    });

    it('should render without className', () => {
      const { container } = render(<CircularProgress value={50} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Re-rendering and Updates', () => {
    it('should update percentage text when value changes', () => {
      const { rerender } = render(<CircularProgress {...createDefaultProps({ value: 30 })} />);
      expect(screen.getByText('30%')).toBeInTheDocument();

      rerender(<CircularProgress {...createDefaultProps({ value: 70 })} />);
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('should update SVG size when size prop changes', () => {
      const { rerender, container } = render(
        <CircularProgress {...createDefaultProps({ size: 40 })} />,
      );
      let svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '40');

      rerender(<CircularProgress {...createDefaultProps({ size: 60 })} />);
      svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '60');
    });

    it('should update strokeWidth when prop changes', () => {
      const { rerender, container } = render(
        <CircularProgress {...createDefaultProps({ strokeWidth: 3 })} />,
      );
      let circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '3');
      });

      rerender(<CircularProgress {...createDefaultProps({ strokeWidth: 5 })} />);
      circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '5');
      });
    });

    it('should update className when prop changes', () => {
      const { rerender, container } = render(
        <CircularProgress {...createDefaultProps({ className: 'class-a' })} />,
      );
      let wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('class-a');

      rerender(<CircularProgress {...createDefaultProps({ className: 'class-b' })} />);
      wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('class-b');
    });
  });

  describe('Accessibility', () => {
    it('should render semantic HTML structure', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const divs = container.querySelectorAll('div');
      expect(divs.length).toBeGreaterThan(0);
    });

    it('should have readable percentage text for screen readers', () => {
      render(<CircularProgress {...createDefaultProps({ value: 75 })} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should render SVG with proper width and height attributes', () => {
      const { container } = render(<CircularProgress {...createDefaultProps({ size: 50 })} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '50');
      expect(svg).toHaveAttribute('height', '50');
    });

    it('should display text at different progress values', () => {
      const { rerender } = render(<CircularProgress value={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();

      rerender(<CircularProgress value={50} />);
      expect(screen.getByText('50%')).toBeInTheDocument();

      rerender(<CircularProgress value={100} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should have visible text element inside the component', () => {
      const { container } = render(<CircularProgress {...createDefaultProps({ value: 42 })} />);
      const spanElement = container.querySelector('span');
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveTextContent('42%');
    });

    it('should maintain text visibility with different sizes', () => {
      render(<CircularProgress {...createDefaultProps({ value: 50, size: 80 })} />);
      expect(screen.getByText('50%')).toBeVisible();
    });
  });

  describe('Visual Representation', () => {
    it('should show empty progress circle at 0%', () => {
      const size = 40;
      const strokeWidth = 3;
      const radius = (size - strokeWidth) / 2;
      const circumference = radius * 2 * Math.PI;

      const { container } = render(<CircularProgress {...createDefaultProps({ value: 0 })} />);
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1];
      // At 0%, stroke-dashoffset equals circumference (full offset, no visible stroke)
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', String(circumference));
    });

    it('should show half-filled progress circle at 50%', () => {
      const size = 40;
      const strokeWidth = 3;
      const radius = (size - strokeWidth) / 2;
      const circumference = radius * 2 * Math.PI;
      const expectedOffset = circumference / 2;

      const { container } = render(<CircularProgress {...createDefaultProps({ value: 50 })} />);
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1];
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', String(expectedOffset));
    });

    it('should show fully filled progress circle at 100%', () => {
      const { container } = render(<CircularProgress {...createDefaultProps({ value: 100 })} />);
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1];
      // At 100%, stroke-dashoffset is 0 (no offset, full visible stroke)
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', '0');
    });

    it('should have consistent circle structure', () => {
      const { container } = render(<CircularProgress {...createDefaultProps()} />);
      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2);
      // Both circles should have same center
      expect(circles[0].getAttribute('cx')).toBe(circles[1].getAttribute('cx'));
      expect(circles[0].getAttribute('cy')).toBe(circles[1].getAttribute('cy'));
      // Both circles should have same radius
      expect(circles[0].getAttribute('r')).toBe(circles[1].getAttribute('r'));
    });
  });

  describe('Mathematical Calculations', () => {
    it('should calculate radius correctly for various sizes', () => {
      const testCases = [
        { size: 40, strokeWidth: 3, expectedRadius: 18.5 },
        { size: 60, strokeWidth: 4, expectedRadius: 28 },
        { size: 100, strokeWidth: 10, expectedRadius: 45 },
      ];

      testCases.forEach(({ size, strokeWidth, expectedRadius }) => {
        const { container } = render(
          <CircularProgress value={50} size={size} strokeWidth={strokeWidth} />,
        );
        const circles = container.querySelectorAll('circle');
        expect(circles[0]).toHaveAttribute('r', String(expectedRadius));
      });
    });

    it('should calculate circumference correctly', () => {
      const size = 40;
      const strokeWidth = 3;
      const radius = (size - strokeWidth) / 2;
      const expectedCircumference = radius * 2 * Math.PI;

      const { container } = render(
        <CircularProgress {...createDefaultProps({ size, strokeWidth })} />,
      );
      const circles = container.querySelectorAll('circle');
      const progressCircle = circles[1];
      expect(progressCircle).toHaveAttribute('stroke-dasharray', String(expectedCircumference));
    });

    it('should calculate stroke-dashoffset proportionally to value', () => {
      const size = 40;
      const strokeWidth = 3;
      const radius = (size - strokeWidth) / 2;
      const circumference = radius * 2 * Math.PI;

      const testValues = [0, 25, 50, 75, 100];

      testValues.forEach((value) => {
        const { container } = render(
          <CircularProgress value={value} size={size} strokeWidth={strokeWidth} />,
        );
        const circles = container.querySelectorAll('circle');
        const progressCircle = circles[1];
        const expectedOffset = circumference - (value / 100) * circumference;
        expect(progressCircle).toHaveAttribute('stroke-dashoffset', String(expectedOffset));
      });
    });
  });
});
