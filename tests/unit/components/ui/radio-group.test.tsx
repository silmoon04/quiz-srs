import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import React from 'react';

describe('RadioGroup', () => {
  describe('rendering', () => {
    it('renders a radio group', () => {
      render(
        <RadioGroup data-testid="radio-group">
          <RadioGroupItem value="option1" data-testid="option1" />
        </RadioGroup>,
      );

      const group = screen.getByTestId('radio-group');
      expect(group).toBeInTheDocument();
    });

    it('renders with radiogroup role', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>,
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toBeInTheDocument();
    });

    it('applies default grid gap styles', () => {
      render(
        <RadioGroup data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>,
      );

      const group = screen.getByTestId('radio-group');
      expect(group).toHaveClass('grid');
      expect(group).toHaveClass('gap-2');
    });

    it('merges custom className with default styles', () => {
      render(
        <RadioGroup className="custom-class" data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>,
      );

      const group = screen.getByTestId('radio-group');
      expect(group).toHaveClass('custom-class');
      expect(group).toHaveClass('grid');
    });

    it('forwards ref to the radio group element', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(
        <RadioGroup ref={ref}>
          <RadioGroupItem value="option1" />
        </RadioGroup>,
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('passes through additional props', () => {
      render(
        <RadioGroup data-testid="radio-group" aria-label="Select an option">
          <RadioGroupItem value="option1" />
        </RadioGroup>,
      );

      const group = screen.getByTestId('radio-group');
      expect(group).toHaveAttribute('aria-label', 'Select an option');
    });
  });
});

describe('RadioGroupItem', () => {
  describe('rendering', () => {
    it('renders a radio button', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-item" />
        </RadioGroup>,
      );

      const item = screen.getByTestId('radio-item');
      expect(item).toBeInTheDocument();
    });

    it('renders with radio role', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>,
      );

      const item = screen.getByRole('radio');
      expect(item).toBeInTheDocument();
    });

    it('applies default styles', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-item" />
        </RadioGroup>,
      );

      const item = screen.getByTestId('radio-item');
      expect(item).toHaveClass('aspect-square');
      expect(item).toHaveClass('h-4');
      expect(item).toHaveClass('w-4');
      expect(item).toHaveClass('rounded-full');
      expect(item).toHaveClass('border');
      expect(item).toHaveClass('border-primary');
    });

    it('merges custom className with default styles', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" className="custom-class" data-testid="radio-item" />
        </RadioGroup>,
      );

      const item = screen.getByTestId('radio-item');
      expect(item).toHaveClass('custom-class');
      expect(item).toHaveClass('rounded-full');
    });

    it('forwards ref to the radio item element', () => {
      const ref = { current: null } as React.RefObject<HTMLButtonElement>;
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" ref={ref} />
        </RadioGroup>,
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('passes through additional props', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-item" aria-label="Option 1" />
        </RadioGroup>,
      );

      const item = screen.getByTestId('radio-item');
      expect(item).toHaveAttribute('aria-label', 'Option 1');
    });
  });

  describe('unchecked/checked states', () => {
    it('renders unchecked by default', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-item" />
        </RadioGroup>,
      );

      const item = screen.getByTestId('radio-item');
      expect(item).toHaveAttribute('data-state', 'unchecked');
    });

    it('renders checked when defaultValue matches', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" data-testid="radio-item" />
        </RadioGroup>,
      );

      const item = screen.getByTestId('radio-item');
      expect(item).toHaveAttribute('data-state', 'checked');
    });

    it('renders unchecked when defaultValue does not match', () => {
      render(
        <RadioGroup defaultValue="option2">
          <RadioGroupItem value="option1" data-testid="radio-item" />
        </RadioGroup>,
      );

      const item = screen.getByTestId('radio-item');
      expect(item).toHaveAttribute('data-state', 'unchecked');
    });

    it('shows indicator when checked', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" data-testid="radio-item" />
        </RadioGroup>,
      );

      const item = screen.getByTestId('radio-item');
      const indicator = item.querySelector('[data-state="checked"]');
      expect(indicator).toBeInTheDocument();
    });
  });
});

describe('RadioGroup selection changes', () => {
  it('selects an option on click', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    expect(option1).toHaveAttribute('data-state', 'unchecked');

    await user.click(option1);

    expect(option1).toHaveAttribute('data-state', 'checked');
  });

  it('deselects previous option when another is selected', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup defaultValue="option1">
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    expect(option1).toHaveAttribute('data-state', 'checked');
    expect(option2).toHaveAttribute('data-state', 'unchecked');

    await user.click(option2);

    expect(option1).toHaveAttribute('data-state', 'unchecked');
    expect(option2).toHaveAttribute('data-state', 'checked');
  });

  it('calls onValueChange when selection changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioGroup onValueChange={handleChange}>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    await user.click(option1);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('option1');
  });

  it('calls onValueChange with new value when switching selection', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioGroup defaultValue="option1" onValueChange={handleChange}>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option2 = screen.getByTestId('option2');
    await user.click(option2);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('only allows one selection at a time', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
        <RadioGroupItem value="option3" data-testid="option3" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');
    const option3 = screen.getByTestId('option3');

    await user.click(option1);
    expect(option1).toHaveAttribute('data-state', 'checked');
    expect(option2).toHaveAttribute('data-state', 'unchecked');
    expect(option3).toHaveAttribute('data-state', 'unchecked');

    await user.click(option3);
    expect(option1).toHaveAttribute('data-state', 'unchecked');
    expect(option2).toHaveAttribute('data-state', 'unchecked');
    expect(option3).toHaveAttribute('data-state', 'checked');
  });
});

describe('RadioGroup disabled states', () => {
  it('disables all items when group is disabled', () => {
    render(
      <RadioGroup disabled>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    expect(option1).toBeDisabled();
    expect(option2).toBeDisabled();
  });

  it('applies disabled styles when group is disabled', () => {
    render(
      <RadioGroup disabled>
        <RadioGroupItem value="option1" data-testid="option1" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    expect(option1).toHaveAttribute('data-disabled', '');
  });

  it('does not change selection when group is disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioGroup disabled onValueChange={handleChange}>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    await user.click(option1);

    expect(handleChange).not.toHaveBeenCalled();
    expect(option1).toHaveAttribute('data-state', 'unchecked');
  });

  it('disables individual items when item is disabled', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" disabled />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    expect(option1).not.toBeDisabled();
    expect(option2).toBeDisabled();
  });

  it('does not select a disabled item on click', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioGroup onValueChange={handleChange}>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" disabled />
      </RadioGroup>,
    );

    const option2 = screen.getByTestId('option2');
    await user.click(option2);

    expect(handleChange).not.toHaveBeenCalled();
    expect(option2).toHaveAttribute('data-state', 'unchecked');
  });

  it('maintains selection on disabled item', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup defaultValue="option1">
        <RadioGroupItem value="option1" data-testid="option1" disabled />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    expect(option1).toHaveAttribute('data-state', 'checked');

    await user.click(option2);
    expect(option2).toHaveAttribute('data-state', 'checked');
    expect(option1).toHaveAttribute('data-state', 'unchecked');
  });
});

describe('RadioGroup keyboard navigation', () => {
  it('can be focused', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    option1.focus();

    expect(option1).toHaveFocus();
  });

  it('has tabindex -1 when disabled preventing tab focus', () => {
    render(
      <RadioGroup disabled>
        <RadioGroupItem value="option1" data-testid="option1" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    expect(option1).toHaveAttribute('tabindex', '-1');
    expect(option1).toBeDisabled();
  });

  it('navigates with arrow down key', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
        <RadioGroupItem value="option3" data-testid="option3" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    option1.focus();
    expect(option1).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    expect(option2).toHaveFocus();
  });

  it('navigates with arrow up key', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
        <RadioGroupItem value="option3" data-testid="option3" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    option2.focus();
    expect(option2).toHaveFocus();

    await user.keyboard('{ArrowUp}');

    expect(option1).toHaveFocus();
  });

  it('navigates with arrow right key', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    option1.focus();
    await user.keyboard('{ArrowRight}');

    expect(option2).toHaveFocus();
  });

  it('navigates with arrow left key', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    option2.focus();
    await user.keyboard('{ArrowLeft}');

    expect(option1).toHaveFocus();
  });

  it('wraps navigation from last to first item', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    option2.focus();
    await user.keyboard('{ArrowDown}');

    expect(option1).toHaveFocus();
  });

  it('wraps navigation from first to last item', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    option1.focus();
    await user.keyboard('{ArrowUp}');

    expect(option2).toHaveFocus();
  });

  it('selects item on space key press', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    option1.focus();

    await user.keyboard(' ');

    expect(option1).toHaveAttribute('data-state', 'checked');
  });

  it('skips disabled items during navigation', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" disabled />
        <RadioGroupItem value="option3" data-testid="option3" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option3 = screen.getByTestId('option3');

    option1.focus();
    await user.keyboard('{ArrowDown}');

    expect(option3).toHaveFocus();
  });
});

describe('RadioGroup controlled mode', () => {
  it('respects controlled value prop', () => {
    render(
      <RadioGroup value="option2">
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    expect(option1).toHaveAttribute('data-state', 'unchecked');
    expect(option2).toHaveAttribute('data-state', 'checked');
  });

  it('does not change state without onValueChange in controlled mode', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup value="option1">
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    await user.click(option2);

    expect(option1).toHaveAttribute('data-state', 'checked');
    expect(option2).toHaveAttribute('data-state', 'unchecked');
  });

  it('updates state via onValueChange in controlled mode', async () => {
    const user = userEvent.setup();

    function ControlledRadioGroup() {
      const [value, setValue] = React.useState('option1');
      return (
        <RadioGroup value={value} onValueChange={setValue}>
          <RadioGroupItem value="option1" data-testid="option1" />
          <RadioGroupItem value="option2" data-testid="option2" />
        </RadioGroup>
      );
    }

    render(<ControlledRadioGroup />);

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    expect(option1).toHaveAttribute('data-state', 'checked');
    expect(option2).toHaveAttribute('data-state', 'unchecked');

    await user.click(option2);

    expect(option1).toHaveAttribute('data-state', 'unchecked');
    expect(option2).toHaveAttribute('data-state', 'checked');
  });
});

describe('RadioGroup uncontrolled mode', () => {
  it('manages its own state in uncontrolled mode', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    expect(option1).toHaveAttribute('data-state', 'unchecked');
    expect(option2).toHaveAttribute('data-state', 'unchecked');

    await user.click(option1);
    expect(option1).toHaveAttribute('data-state', 'checked');

    await user.click(option2);
    expect(option1).toHaveAttribute('data-state', 'unchecked');
    expect(option2).toHaveAttribute('data-state', 'checked');
  });

  it('starts with defaultValue in uncontrolled mode', () => {
    render(
      <RadioGroup defaultValue="option2">
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    expect(option1).toHaveAttribute('data-state', 'unchecked');
    expect(option2).toHaveAttribute('data-state', 'checked');
  });
});

describe('RadioGroup accessibility', () => {
  it('supports aria-labelledby', () => {
    render(
      <>
        <span id="label">Choose an option</span>
        <RadioGroup aria-labelledby="label" data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      </>,
    );

    const group = screen.getByTestId('radio-group');
    expect(group).toHaveAttribute('aria-labelledby', 'label');
  });

  it('supports aria-describedby', () => {
    render(
      <>
        <RadioGroup aria-describedby="description" data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
        <span id="description">Additional description</span>
      </>,
    );

    const group = screen.getByTestId('radio-group');
    expect(group).toHaveAttribute('aria-describedby', 'description');
  });

  it('supports required attribute', () => {
    render(
      <RadioGroup required data-testid="radio-group">
        <RadioGroupItem value="option1" />
      </RadioGroup>,
    );

    const group = screen.getByTestId('radio-group');
    expect(group).toHaveAttribute('aria-required', 'true');
  });

  it('has correct aria-checked state for items', () => {
    render(
      <RadioGroup defaultValue="option1">
        <RadioGroupItem value="option1" data-testid="option1" />
        <RadioGroupItem value="option2" data-testid="option2" />
      </RadioGroup>,
    );

    const option1 = screen.getByTestId('option1');
    const option2 = screen.getByTestId('option2');

    expect(option1).toHaveAttribute('aria-checked', 'true');
    expect(option2).toHaveAttribute('aria-checked', 'false');
  });
});
