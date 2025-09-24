import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfirmationModal } from '@/components/confirmation-modal-radix';

// Mock component to simulate a trigger for the modal
const MockTrigger = ({ onOpen }: { onOpen: () => void }) => (
  <button onClick={onOpen}>Edit Question</button>
);

describe('Modal Focus Trap Smoke Tests', () => {
  let userEvent: ReturnType<typeof user.setup>;

  beforeEach(() => {
    userEvent = user.setup();
  });

  it('focus traps and restores', async () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <>
        <MockTrigger onOpen={() => {}} />
        <ConfirmationModal
          isOpen={true}
          title="Edit Question"
          message="Are you sure you want to edit this question?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </>,
    );

    // Modal should be open
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Focus should be trapped within the modal
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });

    // Initial focus should be on the cancel button (first in tab order)
    expect(cancelButton).toHaveFocus();

    // Tab forward and backward to test focus trapping
    await userEvent.tab();
    expect(confirmButton).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(cancelButton).toHaveFocus();

    // Escape key should close the modal
    await userEvent.keyboard('{Escape}');
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
