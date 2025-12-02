import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/components/progress-bar';

// Default props factory
const createDefaultProps = (
  overrides: Partial<{
    current: number;
    total: number;
    className: string;
    showText: boolean;
    variant: 'default' | 'success' | 'warning';
    label: string;
    showPercentage: boolean;
    compact: boolean;
  }> = {},
) => ({
  current: 5,
  total: 10,
  className: '',
  showText: true,
  variant: 'default' as const,
  label: 'questions completed',
  showPercentage: true,
  compact: false,
  ...overrides,
});

describe('ProgressBar Component', () => {
  describe('Basic Rendering', () => {
    it('should render the progress bar', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ className: 'custom-class' })} />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-class');
    });

    it('should render the label when showText is true', () => {
      render(
        <ProgressBar {...createDefaultProps({ showText: true, label: 'questions completed' })} />,
      );
      expect(screen.getByText('questions completed')).toBeInTheDocument();
    });

    it('should not render the label when showText is false', () => {
      render(
        <ProgressBar {...createDefaultProps({ showText: false, label: 'questions completed' })} />,
      );
      expect(screen.queryByText('questions completed')).not.toBeInTheDocument();
    });

    it('should render custom label text', () => {
      render(<ProgressBar {...createDefaultProps({ label: 'tasks finished' })} />);
      expect(screen.getByText('tasks finished')).toBeInTheDocument();
    });
  });

  describe('Progress Values', () => {
    it('should render 0% progress correctly', () => {
      render(<ProgressBar {...createDefaultProps({ current: 0, total: 10 })} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('0/10')).toBeInTheDocument();
    });

    it('should render 50% progress correctly', () => {
      render(<ProgressBar {...createDefaultProps({ current: 5, total: 10 })} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('should render 100% progress correctly', () => {
      render(<ProgressBar {...createDefaultProps({ current: 10, total: 10 })} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('10/10')).toBeInTheDocument();
    });

    it('should render progress with non-divisible values', () => {
      render(<ProgressBar {...createDefaultProps({ current: 3, total: 7 })} />);
      // 3/7 = 0.428... rounds to 43%
      expect(screen.getByText('43%')).toBeInTheDocument();
      expect(screen.getByText('3/7')).toBeInTheDocument();
    });

    it('should round percentage correctly', () => {
      render(<ProgressBar {...createDefaultProps({ current: 1, total: 3 })} />);
      // 1/3 = 0.333... rounds to 33%
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('should round percentage up when needed', () => {
      render(<ProgressBar {...createDefaultProps({ current: 2, total: 3 })} />);
      // 2/3 = 0.666... rounds to 67%
      expect(screen.getByText('67%')).toBeInTheDocument();
    });
  });

  describe('Visual Progress Bar Width', () => {
    it('should set progress bar width to 0% when current is 0', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ current: 0, total: 10 })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '0%' });
    });

    it('should set progress bar width to 50% when half complete', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ current: 5, total: 10 })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '50%' });
    });

    it('should set progress bar width to 100% when complete', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ current: 10, total: 10 })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '100%' });
    });

    it('should set progress bar width correctly for 25% progress', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ current: 25, total: 100 })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '25%' });
    });

    it('should set progress bar width correctly for 75% progress', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ current: 75, total: 100 })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '75%' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle total of 0 (prevent division by zero)', () => {
      render(<ProgressBar {...createDefaultProps({ current: 5, total: 0 })} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('5/0')).toBeInTheDocument();
    });

    it('should handle negative current value', () => {
      render(<ProgressBar {...createDefaultProps({ current: -5, total: 10 })} />);
      // Negative values result in negative percentage display
      expect(screen.getByText('-50%')).toBeInTheDocument();
      expect(screen.getByText('-5/10')).toBeInTheDocument();
    });

    it('should handle current value greater than total (over 100%)', () => {
      render(<ProgressBar {...createDefaultProps({ current: 15, total: 10 })} />);
      expect(screen.getByText('150%')).toBeInTheDocument();
      expect(screen.getByText('15/10')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      render(<ProgressBar {...createDefaultProps({ current: 500000, total: 1000000 })} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('500000/1000000')).toBeInTheDocument();
    });

    it('should handle decimal values in current', () => {
      render(<ProgressBar {...createDefaultProps({ current: 5.5, total: 10 })} />);
      expect(screen.getByText('55%')).toBeInTheDocument();
    });

    it('should handle both current and total as 0', () => {
      render(<ProgressBar {...createDefaultProps({ current: 0, total: 0 })} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Variant Styling', () => {
    it('should apply default variant styling (blue)', () => {
      const { container } = render(<ProgressBar {...createDefaultProps({ variant: 'default' })} />);
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill?.className).toContain('bg-blue-500');
    });

    it('should apply success variant styling (green)', () => {
      const { container } = render(<ProgressBar {...createDefaultProps({ variant: 'success' })} />);
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill?.className).toContain('bg-green-500');
    });

    it('should apply warning variant styling (yellow)', () => {
      const { container } = render(<ProgressBar {...createDefaultProps({ variant: 'warning' })} />);
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill?.className).toContain('bg-yellow-500');
    });

    it('should have transition animation classes', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill?.className).toContain('transition-all');
      expect(progressFill?.className).toContain('duration-300');
    });

    it('should have rounded corners on progress bar', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill?.className).toContain('rounded-full');
    });

    it('should have correct background color on progress track', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      // Find the parent element with bg-gray-700 (the track)
      const progressTrack = container.querySelector('.bg-gray-700');
      expect(progressTrack).toBeInTheDocument();
    });
  });

  describe('Text Display Options', () => {
    it('should show percentage when showPercentage is true', () => {
      render(
        <ProgressBar {...createDefaultProps({ showPercentage: true, current: 5, total: 10 })} />,
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should not show percentage when showPercentage is false', () => {
      render(
        <ProgressBar {...createDefaultProps({ showPercentage: false, current: 5, total: 10 })} />,
      );
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('should show score text when showText is true', () => {
      render(<ProgressBar {...createDefaultProps({ showText: true, current: 5, total: 10 })} />);
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('should not show score text when showText is false', () => {
      render(<ProgressBar {...createDefaultProps({ showText: false, current: 5, total: 10 })} />);
      expect(screen.queryByText('5/10')).not.toBeInTheDocument();
    });

    it('should show both percentage and score when both options are true', () => {
      render(
        <ProgressBar
          {...createDefaultProps({ showText: true, showPercentage: true, current: 3, total: 10 })}
        />,
      );
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('3/10')).toBeInTheDocument();
    });

    it('should show neither percentage nor score when both options are false', () => {
      render(
        <ProgressBar
          {...createDefaultProps({ showText: false, showPercentage: false, current: 3, total: 10 })}
        />,
      );
      expect(screen.queryByText('30%')).not.toBeInTheDocument();
      expect(screen.queryByText('3/10')).not.toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode when compact is true', () => {
      const { container } = render(<ProgressBar {...createDefaultProps({ compact: true })} />);
      // Compact mode should not show the label
      expect(screen.queryByText('questions completed')).not.toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should show percentage in compact mode when showPercentage is true', () => {
      render(
        <ProgressBar
          {...createDefaultProps({ compact: true, showPercentage: true, current: 7, total: 10 })}
        />,
      );
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('should not show percentage in compact mode when showPercentage is false', () => {
      render(
        <ProgressBar
          {...createDefaultProps({ compact: true, showPercentage: false, current: 7, total: 10 })}
        />,
      );
      expect(screen.queryByText('70%')).not.toBeInTheDocument();
    });

    it('should not show score text in compact mode', () => {
      render(
        <ProgressBar
          {...createDefaultProps({ compact: true, showText: true, current: 7, total: 10 })}
        />,
      );
      // Compact mode doesn't show the current/total score
      expect(screen.queryByText('7/10')).not.toBeInTheDocument();
    });

    it('should apply correct height in compact mode', () => {
      const { container } = render(<ProgressBar {...createDefaultProps({ compact: true })} />);
      const progressTrack = container.querySelector('.bg-gray-700');
      expect(progressTrack?.className).toContain('h-2.5');
    });

    it('should render progress bar correctly in compact mode at 0%', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ compact: true, current: 0, total: 10 })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '0%' });
    });

    it('should render progress bar correctly in compact mode at 100%', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ compact: true, current: 10, total: 10 })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '100%' });
    });

    it('should apply correct variant in compact mode', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ compact: true, variant: 'success' })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill?.className).toContain('bg-green-500');
    });
  });

  describe('Full Mode (non-compact)', () => {
    it('should render in full mode by default', () => {
      render(<ProgressBar {...createDefaultProps()} />);
      expect(screen.getByText('questions completed')).toBeInTheDocument();
    });

    it('should show label above the progress bar', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ label: 'progress status' })} />,
      );
      expect(screen.getByText('progress status')).toBeInTheDocument();
      // Check that label has correct styling
      const labelElement = container.querySelector('.text-gray-400');
      expect(labelElement).toBeInTheDocument();
    });

    it('should show score text in full mode', () => {
      render(<ProgressBar {...createDefaultProps({ showText: true, current: 8, total: 20 })} />);
      expect(screen.getByText('8/20')).toBeInTheDocument();
    });

    it('should have correct layout structure in full mode', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      // Check for flex layout
      const flexRow = container.querySelector('.flex.items-start.space-x-3');
      expect(flexRow).toBeInTheDocument();
    });
  });

  describe('Styling Classes', () => {
    it('should have full width on wrapper', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('w-full');
    });

    it('should apply tabular-nums class to percentage text', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      const percentageElement = container.querySelector('.tabular-nums');
      expect(percentageElement).toBeInTheDocument();
    });

    it('should apply correct text color to percentage', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      const percentageElement = container.querySelector('.text-gray-300');
      expect(percentageElement).toBeInTheDocument();
    });

    it('should have flex-grow on progress bar container', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      const progressContainer = container.querySelector('.flex-grow');
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe('Props Defaults', () => {
    it('should use default className when not provided', () => {
      const { container } = render(<ProgressBar current={5} total={10} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should use default showText=true when not provided', () => {
      render(<ProgressBar current={5} total={10} />);
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('should use default variant="default" when not provided', () => {
      const { container } = render(<ProgressBar current={5} total={10} />);
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill?.className).toContain('bg-blue-500');
    });

    it('should use default label when not provided', () => {
      render(<ProgressBar current={5} total={10} />);
      expect(screen.getByText('questions completed')).toBeInTheDocument();
    });

    it('should use default showPercentage=true when not provided', () => {
      render(<ProgressBar current={5} total={10} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should use default compact=false when not provided', () => {
      render(<ProgressBar current={5} total={10} />);
      // Non-compact mode shows the label
      expect(screen.getByText('questions completed')).toBeInTheDocument();
    });
  });

  describe('Re-rendering and Updates', () => {
    it('should update percentage when current changes', () => {
      const { rerender } = render(
        <ProgressBar {...createDefaultProps({ current: 3, total: 10 })} />,
      );
      expect(screen.getByText('30%')).toBeInTheDocument();

      rerender(<ProgressBar {...createDefaultProps({ current: 7, total: 10 })} />);
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('should update percentage when total changes', () => {
      const { rerender } = render(
        <ProgressBar {...createDefaultProps({ current: 5, total: 10 })} />,
      );
      expect(screen.getByText('50%')).toBeInTheDocument();

      rerender(<ProgressBar {...createDefaultProps({ current: 5, total: 20 })} />);
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should update variant styling when variant changes', () => {
      const { rerender, container } = render(
        <ProgressBar {...createDefaultProps({ variant: 'default' })} />,
      );
      let progressFill = container.querySelector('[style*="width"]');
      expect(progressFill?.className).toContain('bg-blue-500');

      rerender(<ProgressBar {...createDefaultProps({ variant: 'success' })} />);
      progressFill = container.querySelector('[style*="width"]');
      expect(progressFill?.className).toContain('bg-green-500');
    });

    it('should switch between compact and full mode', () => {
      const { rerender } = render(<ProgressBar {...createDefaultProps({ compact: false })} />);
      expect(screen.getByText('questions completed')).toBeInTheDocument();

      rerender(<ProgressBar {...createDefaultProps({ compact: true })} />);
      expect(screen.queryByText('questions completed')).not.toBeInTheDocument();
    });

    it('should update label text when label changes', () => {
      const { rerender } = render(<ProgressBar {...createDefaultProps({ label: 'tasks done' })} />);
      expect(screen.getByText('tasks done')).toBeInTheDocument();

      rerender(<ProgressBar {...createDefaultProps({ label: 'steps completed' })} />);
      expect(screen.getByText('steps completed')).toBeInTheDocument();
      expect(screen.queryByText('tasks done')).not.toBeInTheDocument();
    });
  });

  describe('Percentage Calculation Edge Cases', () => {
    it('should calculate 1% correctly', () => {
      render(<ProgressBar {...createDefaultProps({ current: 1, total: 100 })} />);
      expect(screen.getByText('1%')).toBeInTheDocument();
    });

    it('should calculate 99% correctly', () => {
      render(<ProgressBar {...createDefaultProps({ current: 99, total: 100 })} />);
      expect(screen.getByText('99%')).toBeInTheDocument();
    });

    it('should round 0.4% to 0%', () => {
      render(<ProgressBar {...createDefaultProps({ current: 1, total: 250 })} />);
      // 1/250 = 0.004 = 0.4% rounds to 0%
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should round 0.6% to 1%', () => {
      render(<ProgressBar {...createDefaultProps({ current: 1, total: 150 })} />);
      // 1/150 = 0.00666... = 0.666...% rounds to 1%
      expect(screen.getByText('1%')).toBeInTheDocument();
    });

    it('should handle single item total', () => {
      render(<ProgressBar {...createDefaultProps({ current: 1, total: 1 })} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('1/1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render semantic HTML structure', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      // The component uses div elements for structure
      const divs = container.querySelectorAll('div');
      expect(divs.length).toBeGreaterThan(0);
    });

    it('should have readable text for screen readers', () => {
      render(
        <ProgressBar
          {...createDefaultProps({ current: 5, total: 10, label: 'questions completed' })}
        />,
      );
      // All text should be visible and readable
      expect(screen.getByText('questions completed')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('should have sufficient color contrast in progress fill', () => {
      const { container } = render(<ProgressBar {...createDefaultProps({ variant: 'default' })} />);
      const progressFill = container.querySelector('.bg-blue-500');
      expect(progressFill).toBeInTheDocument();
    });

    it('should display text with appropriate font weight', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      const fontMediumElements = container.querySelectorAll('.font-medium');
      expect(fontMediumElements.length).toBeGreaterThan(0);
    });
  });

  describe('Visual Representation', () => {
    it('should show empty bar at 0 progress', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ current: 0, total: 10 })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '0%' });
    });

    it('should show partial fill at 30% progress', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ current: 3, total: 10 })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '30%' });
    });

    it('should show full bar at 100% progress', () => {
      const { container } = render(
        <ProgressBar {...createDefaultProps({ current: 10, total: 10 })} />,
      );
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '100%' });
    });

    it('should have consistent height for progress bar', () => {
      const { container } = render(<ProgressBar {...createDefaultProps()} />);
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill?.className).toContain('h-2.5');
    });
  });
});
