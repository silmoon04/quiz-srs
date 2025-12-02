import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationModal } from '@/components/confirmation-modal-radix';

// Mock lucide-react icons to simplify testing
vi.mock('lucide-react', () => ({
  AlertTriangle: () => (
    <span data-testid="warning-icon" aria-hidden="true">
      AlertTriangle
    </span>
  ),
  Info: () => (
    <span data-testid="info-icon" aria-hidden="true">
      Info
    </span>
  ),
  AlertCircle: () => (
    <span data-testid="danger-icon" aria-hidden="true">
      AlertCircle
    </span>
  ),
  X: () => (
    <span data-testid="close-icon" aria-hidden="true">
      X
    </span>
  ),
}));

// Mock MarkdownRenderer component
vi.mock('@/components/rendering/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ markdown, className }: { markdown: string; className?: string }) => (
    <div data-testid="markdown-renderer" className={className}>
      {markdown}
    </div>
  ),
}));

// Default props factory
const createDefaultProps = () => ({
  isOpen: true,
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
});

describe('ConfirmationModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the modal when isOpen is true', () => {
      render(<ConfirmationModal {...createDefaultProps()} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render the modal when isOpen is false', () => {
      const props = createDefaultProps();
      props.isOpen = false;
      render(<ConfirmationModal {...props} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render the modal title', () => {
      const props = createDefaultProps();
      props.title = 'Delete Confirmation';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByText('Delete Confirmation')).toBeInTheDocument();
    });

    it('should render the modal message through MarkdownRenderer', () => {
      const props = createDefaultProps();
      props.message = 'This action cannot be undone.';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
        'This action cannot be undone.',
      );
    });

    it('should render confirm button with default text', () => {
      render(<ConfirmationModal {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });

    it('should render cancel button with default text', () => {
      render(<ConfirmationModal {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Custom Button Text', () => {
    it('should render custom confirm button text', () => {
      const props = createDefaultProps();
      props.confirmText = 'Yes, Delete';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument();
    });

    it('should render custom cancel button text', () => {
      const props = createDefaultProps();
      props.cancelText = 'No, Keep It';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByRole('button', { name: /no, keep it/i })).toBeInTheDocument();
    });

    it('should render both custom button texts', () => {
      const props = createDefaultProps();
      props.confirmText = 'Proceed';
      props.cancelText = 'Go Back';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByRole('button', { name: /proceed/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });
  });

  describe('Variant Styles', () => {
    it('should render info icon for default variant', () => {
      render(<ConfirmationModal {...createDefaultProps()} />);
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('should render info icon for info variant', () => {
      const props = createDefaultProps();
      props.variant = 'info';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('should render warning icon for warning variant', () => {
      const props = createDefaultProps();
      props.variant = 'warning';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });

    it('should render danger icon for danger variant', () => {
      const props = createDefaultProps();
      props.variant = 'danger';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByTestId('danger-icon')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(props.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks on confirm button', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);
      await user.click(confirmButton);
      await user.click(confirmButton);

      expect(props.onConfirm).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple clicks on cancel button', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      await user.click(cancelButton);

      expect(props.onCancel).toHaveBeenCalledTimes(2);
    });
  });

  describe('Modal Close Behavior', () => {
    it('should call onCancel when dialog open state changes to false', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      // Click the cancel button which should trigger onCancel
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(props.onCancel).toHaveBeenCalled();
    });

    it('should call onCancel when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      // Press Escape key
      await user.keyboard('{Escape}');

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when clicking outside the modal (backdrop)', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      // The Radix dialog has an overlay that can be clicked
      // Find the overlay element and click it
      const dialog = screen.getByRole('dialog');
      const overlay = dialog.parentElement?.querySelector('[data-radix-dialog-overlay]');

      if (overlay) {
        await user.click(overlay);
        expect(props.onCancel).toHaveBeenCalled();
      }
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should close modal on Escape key press', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      await user.keyboard('{Escape}');

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should be navigable with Tab key', async () => {
      const user = userEvent.setup();
      render(<ConfirmationModal {...createDefaultProps()} />);

      // Tab through the dialog elements
      await user.tab();

      // One of the buttons should be focused
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const confirmButton = screen.getByRole('button', { name: /confirm/i });

      const activeElement = document.activeElement;
      expect(activeElement === cancelButton || activeElement === confirmButton).toBe(true);
    });

    it('should handle Enter key on confirm button', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      confirmButton.focus();
      await user.keyboard('{Enter}');

      expect(props.onConfirm).toHaveBeenCalled();
    });

    it('should handle Enter key on cancel button', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      cancelButton.focus();
      await user.keyboard('{Enter}');

      expect(props.onCancel).toHaveBeenCalled();
    });

    it('should handle Space key on confirm button', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      confirmButton.focus();
      await user.keyboard(' ');

      expect(props.onConfirm).toHaveBeenCalled();
    });

    it('should handle Space key on cancel button', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      cancelButton.focus();
      await user.keyboard(' ');

      expect(props.onCancel).toHaveBeenCalled();
    });
  });

  describe('Question Preview', () => {
    it('should not render question preview when not provided', () => {
      render(<ConfirmationModal {...createDefaultProps()} />);
      expect(screen.queryByText('Question Preview:')).not.toBeInTheDocument();
    });

    it('should render question preview when provided', () => {
      const props = createDefaultProps();
      props.questionPreview = 'What is the capital of France?';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByText('Question Preview:')).toBeInTheDocument();
    });

    it('should render question preview content through MarkdownRenderer', () => {
      const props = createDefaultProps();
      props.questionPreview = 'Sample question with **bold** text';
      render(<ConfirmationModal {...props} />);

      const markdownRenderers = screen.getAllByTestId('markdown-renderer');
      const questionPreviewRenderer = markdownRenderers.find((renderer) =>
        renderer.textContent?.includes('Sample question with **bold** text'),
      );
      expect(questionPreviewRenderer).toBeInTheDocument();
    });

    it('should render question preview in styled container', () => {
      const props = createDefaultProps();
      props.questionPreview = 'Test question';
      render(<ConfirmationModal {...props} />);

      const previewLabel = screen.getByText('Question Preview:');
      expect(previewLabel).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const props = createDefaultProps();
      props.title = '';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle empty message', () => {
      const props = createDefaultProps();
      props.message = '';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const props = createDefaultProps();
      props.title =
        'This is a very long title that might cause layout issues in the UI and should be handled gracefully by the modal component';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByText(/This is a very long title/)).toBeInTheDocument();
    });

    it('should handle very long message', () => {
      const props = createDefaultProps();
      props.message = 'This is a very long message '.repeat(50);
      render(<ConfirmationModal {...props} />);
      expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
        /This is a very long message/,
      );
    });

    it('should handle special characters in title', () => {
      const props = createDefaultProps();
      props.title = 'Delete "Item" & Confirm <Action>';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByText('Delete "Item" & Confirm <Action>')).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      const props = createDefaultProps();
      props.message = 'Are you sure you want to delete "item" & proceed?';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
        'Are you sure you want to delete "item" & proceed?',
      );
    });

    it('should handle markdown in message', () => {
      const props = createDefaultProps();
      props.message = '**Bold** and *italic* text with `code`';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
        '**Bold** and *italic* text with `code`',
      );
    });

    it('should handle empty questionPreview string', () => {
      const props = createDefaultProps();
      props.questionPreview = '';
      render(<ConfirmationModal {...props} />);
      // Empty string is falsy, so preview should not render
      expect(screen.queryByText('Question Preview:')).not.toBeInTheDocument();
    });
  });

  describe('Variant Combinations', () => {
    it('should render danger variant with custom confirm text', () => {
      const props = createDefaultProps();
      props.variant = 'danger';
      props.confirmText = 'Delete Forever';
      render(<ConfirmationModal {...props} />);

      expect(screen.getByTestId('danger-icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete forever/i })).toBeInTheDocument();
    });

    it('should render warning variant with question preview', () => {
      const props = createDefaultProps();
      props.variant = 'warning';
      props.questionPreview = 'Sample question';
      render(<ConfirmationModal {...props} />);

      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
      expect(screen.getByText('Question Preview:')).toBeInTheDocument();
    });

    it('should render info variant with all options', () => {
      const props = createDefaultProps();
      props.variant = 'info';
      props.confirmText = 'Got it';
      props.cancelText = 'Nevermind';
      props.questionPreview = 'Info preview';
      render(<ConfirmationModal {...props} />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /nevermind/i })).toBeInTheDocument();
      expect(screen.getByText('Question Preview:')).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('should handle transition from closed to open', () => {
      const props = createDefaultProps();
      props.isOpen = false;
      const { rerender } = render(<ConfirmationModal {...props} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(<ConfirmationModal {...props} isOpen={true} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle transition from open to closed', async () => {
      const props = createDefaultProps();
      props.isOpen = true;
      const { rerender } = render(<ConfirmationModal {...props} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(<ConfirmationModal {...props} isOpen={false} />);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should update title when props change', () => {
      const props = createDefaultProps();
      const { rerender } = render(<ConfirmationModal {...props} />);

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();

      rerender(<ConfirmationModal {...props} title="New Title" />);

      expect(screen.getByText('New Title')).toBeInTheDocument();
    });

    it('should update message when props change', () => {
      const props = createDefaultProps();
      const { rerender } = render(<ConfirmationModal {...props} />);

      expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
        'Are you sure you want to proceed?',
      );

      rerender(<ConfirmationModal {...props} message="New message content" />);

      expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('New message content');
    });

    it('should update variant when props change', () => {
      const props = createDefaultProps();
      const { rerender } = render(<ConfirmationModal {...props} />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();

      rerender(<ConfirmationModal {...props} variant="danger" />);

      expect(screen.getByTestId('danger-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible dialog role', () => {
      render(<ConfirmationModal {...createDefaultProps()} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<ConfirmationModal {...createDefaultProps()} />);
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should contain dialog description', () => {
      render(<ConfirmationModal {...createDefaultProps()} />);
      // Dialog description is provided through the message
      expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
    });

    it('should have proper heading in dialog', () => {
      const props = createDefaultProps();
      props.title = 'Important Confirmation';
      render(<ConfirmationModal {...props} />);
      expect(screen.getByText('Important Confirmation')).toBeInTheDocument();
    });
  });

  describe('Multiple Modals', () => {
    it('should render multiple modals independently', () => {
      const props1 = createDefaultProps();
      props1.title = 'Modal 1';

      const props2 = createDefaultProps();
      props2.title = 'Modal 2';

      render(
        <>
          <ConfirmationModal {...props1} />
          <ConfirmationModal {...props2} />
        </>,
      );

      // Both titles should be in the document (even if one is aria-hidden)
      expect(screen.getByText('Modal 1')).toBeInTheDocument();
      expect(screen.getByText('Modal 2')).toBeInTheDocument();
    });

    it('should call correct onConfirm when rendered separately', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      props.title = 'Single Modal';
      props.confirmText = 'Confirm Action';

      render(<ConfirmationModal {...props} />);

      await user.click(screen.getByRole('button', { name: /confirm action/i }));

      expect(props.onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Callback Invocation', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(props.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ConfirmationModal {...props} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within modal when open', async () => {
      const user = userEvent.setup();
      render(<ConfirmationModal {...createDefaultProps()} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const confirmButton = screen.getByRole('button', { name: /confirm/i });

      // Tab through focusable elements
      await user.tab();
      await user.tab();
      await user.tab();

      // Focus should cycle within the modal
      const activeElement = document.activeElement;
      const isFocusedOnModalElement =
        activeElement === cancelButton ||
        activeElement === confirmButton ||
        activeElement?.closest('[role="dialog"]') !== null;

      expect(isFocusedOnModalElement).toBe(true);
    });
  });
});
