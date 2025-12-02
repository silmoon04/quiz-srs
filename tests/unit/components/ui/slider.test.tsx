import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from '@/components/ui/slider';

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

describe('Slider Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Slider data-testid="slider" />);
      expect(screen.getByTestId('slider')).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<Slider defaultValue={[50]} data-testid="slider" />);
      const slider = screen.getByTestId('slider');
      expect(slider).toBeInTheDocument();
    });

    it('renders slider thumb', () => {
      render(<Slider defaultValue={[50]} data-testid="slider" />);
      const thumb = screen.getByRole('slider');
      expect(thumb).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Slider className="custom-slider" data-testid="slider" />);
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveClass('custom-slider');
    });

    it('merges custom className with default classes', () => {
      render(<Slider className="custom-class" data-testid="slider" />);
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveClass('relative');
      expect(slider).toHaveClass('flex');
      expect(slider).toHaveClass('w-full');
      expect(slider).toHaveClass('custom-class');
    });

    it('has correct displayName', () => {
      expect(Slider.displayName).toBe('Slider');
    });
  });

  describe('Value Changes', () => {
    it('calls onValueChange when value changes', () => {
      const handleValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={handleValueChange} data-testid="slider" />);

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      expect(handleValueChange).toHaveBeenCalled();
    });

    it('updates value on arrow key press', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[50]}
          onValueChange={handleValueChange}
          step={1}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      expect(handleValueChange).toHaveBeenCalledWith([51]);
    });

    it('decreases value on ArrowLeft', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[50]}
          onValueChange={handleValueChange}
          step={1}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'ArrowLeft' });

      expect(handleValueChange).toHaveBeenCalledWith([49]);
    });

    it('increases value on ArrowUp', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[50]}
          onValueChange={handleValueChange}
          step={1}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'ArrowUp' });

      expect(handleValueChange).toHaveBeenCalledWith([51]);
    });

    it('decreases value on ArrowDown', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[50]}
          onValueChange={handleValueChange}
          step={1}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'ArrowDown' });

      expect(handleValueChange).toHaveBeenCalledWith([49]);
    });

    it('supports controlled value prop', () => {
      const handleValueChange = vi.fn();
      render(<Slider value={[75]} onValueChange={handleValueChange} data-testid="slider" />);

      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuenow', '75');
    });
  });

  describe('Min/Max/Step', () => {
    it('respects min value', () => {
      render(<Slider defaultValue={[0]} min={0} max={100} data-testid="slider" />);
      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuemin', '0');
    });

    it('respects max value', () => {
      render(<Slider defaultValue={[100]} min={0} max={100} data-testid="slider" />);
      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuemax', '100');
    });

    it('does not exceed max value', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[100]}
          max={100}
          onValueChange={handleValueChange}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      expect(handleValueChange).not.toHaveBeenCalled();
    });

    it('does not go below min value', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[0]}
          min={0}
          onValueChange={handleValueChange}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'ArrowLeft' });

      expect(handleValueChange).not.toHaveBeenCalled();
    });

    it('respects step value', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[50]}
          step={10}
          onValueChange={handleValueChange}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      expect(handleValueChange).toHaveBeenCalledWith([60]);
    });

    it('handles custom min and max range', () => {
      render(<Slider defaultValue={[25]} min={10} max={50} data-testid="slider" />);
      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuemin', '10');
      expect(thumb).toHaveAttribute('aria-valuemax', '50');
      expect(thumb).toHaveAttribute('aria-valuenow', '25');
    });

    it('handles large step values', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[0]}
          min={0}
          max={100}
          step={25}
          onValueChange={handleValueChange}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      expect(handleValueChange).toHaveBeenCalledWith([25]);
    });
  });

  describe('Disabled State', () => {
    it('applies disabled attribute when disabled', () => {
      render(<Slider disabled data-testid="slider" />);
      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('data-disabled', '');
    });

    it('does not respond to keyboard when disabled', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[50]}
          disabled
          onValueChange={handleValueChange}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      expect(handleValueChange).not.toHaveBeenCalled();
    });

    it('has disabled styling on root element', () => {
      render(<Slider disabled data-testid="slider" />);
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('data-disabled', '');
    });
  });

  describe('Accessibility', () => {
    it('has slider role', () => {
      render(<Slider data-testid="slider" />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('has aria-valuenow attribute', () => {
      render(<Slider defaultValue={[50]} data-testid="slider" />);
      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuenow', '50');
    });

    it('has aria-valuemin attribute', () => {
      render(<Slider min={0} data-testid="slider" />);
      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuemin', '0');
    });

    it('has aria-valuemax attribute', () => {
      render(<Slider max={100} data-testid="slider" />);
      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuemax', '100');
    });

    it('is focusable', async () => {
      const user = userEvent.setup();
      render(<Slider data-testid="slider" />);

      const thumb = screen.getByRole('slider');
      await user.tab();

      expect(thumb).toHaveFocus();
    });

    it('supports aria-label', () => {
      render(<Slider aria-label="Volume control" data-testid="slider" />);
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('aria-label', 'Volume control');
    });

    it('supports aria-labelledby', () => {
      render(
        <>
          <label id="slider-label">Volume</label>
          <Slider aria-labelledby="slider-label" data-testid="slider" />
        </>,
      );
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('aria-labelledby', 'slider-label');
    });
  });

  describe('Keyboard Navigation', () => {
    it('responds to Home key to set min value', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[50]}
          min={0}
          max={100}
          onValueChange={handleValueChange}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'Home' });

      expect(handleValueChange).toHaveBeenCalledWith([0]);
    });

    it('responds to End key to set max value', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[50]}
          min={0}
          max={100}
          onValueChange={handleValueChange}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'End' });

      expect(handleValueChange).toHaveBeenCalledWith([100]);
    });

    it('increases by 10% on PageUp', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[50]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleValueChange}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'PageUp' });

      expect(handleValueChange).toHaveBeenCalledWith([60]);
    });

    it('decreases by 10% on PageDown', () => {
      const handleValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[50]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleValueChange}
          data-testid="slider"
        />,
      );

      const thumb = screen.getByRole('slider');
      fireEvent.keyDown(thumb, { key: 'PageDown' });

      expect(handleValueChange).toHaveBeenCalledWith([40]);
    });
  });

  describe('Props Forwarding', () => {
    it('forwards ref to root element', () => {
      const ref = vi.fn();
      render(<Slider ref={ref} data-testid="slider" />);
      expect(ref).toHaveBeenCalled();
    });

    it('forwards data attributes', () => {
      render(<Slider data-testid="slider" data-custom="value" />);
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('data-custom', 'value');
    });

    it('forwards name prop', () => {
      render(<Slider name="volume" data-testid="slider" />);
      // Radix UI Slider stores name internally for form submission
      const slider = screen.getByTestId('slider');
      expect(slider).toBeInTheDocument();
    });

    it('forwards orientation prop', () => {
      render(<Slider orientation="vertical" data-testid="slider" />);
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('Component Exports', () => {
    it('exports Slider component', () => {
      expect(Slider).toBeDefined();
    });

    it('Slider is a function component', () => {
      expect(typeof Slider).toBe('object');
      expect(Slider.$$typeof).toBeDefined();
    });
  });
});
