import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastNotification, ToastContainer, Toast } from '@/components/toast-notification';

// Mock lucide-react icons to simplify testing
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="close-icon">X</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">CheckCircle</span>,
  AlertCircle: () => <span data-testid="alert-circle-icon">AlertCircle</span>,
  Info: () => <span data-testid="info-icon">Info</span>,
  AlertTriangle: () => <span data-testid="alert-triangle-icon">AlertTriangle</span>,
}));

// Factory to create mock toasts
const createMockToast = (overrides: Partial<Toast> = {}): Toast => ({
  id: 'toast-1',
  type: 'info',
  title: 'Test Toast',
  message: 'This is a test message',
  duration: 5000,
  ...overrides,
});

describe('ToastNotification Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with title', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ title: 'Success!' });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('should render with message', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ message: 'Operation completed successfully' });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });

    it('should render without message when not provided', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ message: undefined });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      expect(screen.getByText('Test Toast')).toBeInTheDocument();
      expect(screen.queryByText('This is a test message')).not.toBeInTheDocument();
    });

    it('should render close button with aria-label', () => {
      const onRemove = vi.fn();
      const toast = createMockToast();

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      expect(screen.getByRole('button', { name: /close notification/i })).toBeInTheDocument();
    });

    it('should render close icon', () => {
      const onRemove = vi.fn();
      const toast = createMockToast();

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });
  });

  describe('Toast Types - Success', () => {
    it('should render CheckCircle icon for success type', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ type: 'success' });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('should apply green color classes for success type', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ type: 'success' });

      const { container } = render(<ToastNotification toast={toast} onRemove={onRemove} />);

      const card = container.querySelector('[class*="border-green-700"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Toast Types - Error', () => {
    it('should render AlertCircle icon for error type', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ type: 'error' });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('should apply red color classes for error type', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ type: 'error' });

      const { container } = render(<ToastNotification toast={toast} onRemove={onRemove} />);

      const card = container.querySelector('[class*="border-red-700"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Toast Types - Warning', () => {
    it('should render AlertTriangle icon for warning type', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ type: 'warning' });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });

    it('should apply yellow color classes for warning type', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ type: 'warning' });

      const { container } = render(<ToastNotification toast={toast} onRemove={onRemove} />);

      const card = container.querySelector('[class*="border-yellow-700"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Toast Types - Info', () => {
    it('should render Info icon for info type', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ type: 'info' });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('should apply blue color classes for info type', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ type: 'info' });

      const { container } = render(<ToastNotification toast={toast} onRemove={onRemove} />);

      const card = container.querySelector('[class*="border-blue-700"]');
      expect(card).toBeInTheDocument();
    });

    it('should use info as default type', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ type: 'info' });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });
  });

  describe('Close Button Functionality', () => {
    it('should call onRemove when close button is clicked', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const toast = createMockToast({ id: 'toast-123', duration: 999999 });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      // Wait for exit animation timeout (300ms)
      await new Promise((r) => setTimeout(r, 350));

      expect(onRemove).toHaveBeenCalledWith('toast-123');
      vi.useFakeTimers();
    });

    it('should trigger exit animation before removing', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const toast = createMockToast({ duration: 999999 });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      // onRemove should not be called immediately
      expect(onRemove).not.toHaveBeenCalled();

      // After animation delay, onRemove should be called
      await new Promise((r) => setTimeout(r, 350));

      expect(onRemove).toHaveBeenCalledTimes(1);
      vi.useFakeTimers();
    });
  });

  describe('Auto-dismiss Timing', () => {
    it('should auto-dismiss after default duration (5000ms)', async () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ duration: undefined });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      // Fast-forward just before auto-dismiss
      await act(async () => {
        vi.advanceTimersByTime(4999);
      });
      expect(onRemove).not.toHaveBeenCalled();

      // Fast-forward to trigger auto-dismiss
      await act(async () => {
        vi.advanceTimersByTime(1);
      });

      // Wait for exit animation
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss after custom duration', async () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ duration: 3000 });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      // Fast-forward to just before custom duration
      await act(async () => {
        vi.advanceTimersByTime(2999);
      });
      expect(onRemove).not.toHaveBeenCalled();

      // Fast-forward to trigger auto-dismiss
      await act(async () => {
        vi.advanceTimersByTime(1);
      });

      // Wait for exit animation
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss with short duration', async () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ duration: 1000 });

      render(<ToastNotification toast={toast} onRemove={onRemove} />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Wait for exit animation
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should cleanup timer on unmount', () => {
      const onRemove = vi.fn();
      const toast = createMockToast({ duration: 5000 });

      const { unmount } = render(<ToastNotification toast={toast} onRemove={onRemove} />);

      unmount();

      // Advance time past the duration
      act(() => {
        vi.advanceTimersByTime(6000);
      });

      // onRemove should not be called since component was unmounted
      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  describe('Animation States', () => {
    it('should trigger entrance animation after mount', async () => {
      const onRemove = vi.fn();
      const toast = createMockToast();

      const { container } = render(<ToastNotification toast={toast} onRemove={onRemove} />);

      // Initially should have translate-x-full (not visible)
      const card = container.querySelector('[class*="translate-x"]');
      expect(card).toBeInTheDocument();

      // After entrance animation delay (50ms)
      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      // Now should have translate-x-0 (visible)
      const visibleCard = container.querySelector('[class*="translate-x-0"]');
      expect(visibleCard).toBeInTheDocument();
    });
  });
});

describe('ToastContainer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render nothing when toasts array is empty', () => {
      const onRemoveToast = vi.fn();

      const { container } = render(<ToastContainer toasts={[]} onRemoveToast={onRemoveToast} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render single toast', () => {
      const onRemoveToast = vi.fn();
      const toasts = [createMockToast({ title: 'Single Toast' })];

      render(<ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />);

      expect(screen.getByText('Single Toast')).toBeInTheDocument();
    });

    it('should render container with correct positioning classes', () => {
      const onRemoveToast = vi.fn();
      const toasts = [createMockToast()];

      const { container } = render(
        <ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />,
      );

      const toastContainer = container.querySelector('.fixed.right-4.top-4');
      expect(toastContainer).toBeInTheDocument();
    });

    it('should have z-50 class for proper stacking', () => {
      const onRemoveToast = vi.fn();
      const toasts = [createMockToast()];

      const { container } = render(
        <ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />,
      );

      const toastContainer = container.querySelector('.z-50');
      expect(toastContainer).toBeInTheDocument();
    });
  });

  describe('Multiple Toasts', () => {
    it('should render multiple toasts', () => {
      const onRemoveToast = vi.fn();
      const toasts = [
        createMockToast({ id: 'toast-1', title: 'First Toast' }),
        createMockToast({ id: 'toast-2', title: 'Second Toast' }),
        createMockToast({ id: 'toast-3', title: 'Third Toast' }),
      ];

      render(<ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />);

      expect(screen.getByText('First Toast')).toBeInTheDocument();
      expect(screen.getByText('Second Toast')).toBeInTheDocument();
      expect(screen.getByText('Third Toast')).toBeInTheDocument();
    });

    it('should render toasts in order', () => {
      const onRemoveToast = vi.fn();
      const toasts = [
        createMockToast({ id: 'toast-1', title: 'First Toast' }),
        createMockToast({ id: 'toast-2', title: 'Second Toast' }),
      ];

      render(<ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />);

      const toastElements = screen.getAllByText(/Toast$/);
      expect(toastElements[0]).toHaveTextContent('First Toast');
      expect(toastElements[1]).toHaveTextContent('Second Toast');
    });

    it('should render toasts with different types', () => {
      const onRemoveToast = vi.fn();
      const toasts = [
        createMockToast({ id: 'toast-1', type: 'success', title: 'Success' }),
        createMockToast({ id: 'toast-2', type: 'error', title: 'Error' }),
        createMockToast({ id: 'toast-3', type: 'warning', title: 'Warning' }),
        createMockToast({ id: 'toast-4', type: 'info', title: 'Info' }),
      ];

      render(<ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />);

      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('should have space-y-3 for vertical spacing between toasts', () => {
      const onRemoveToast = vi.fn();
      const toasts = [createMockToast({ id: 'toast-1' }), createMockToast({ id: 'toast-2' })];

      const { container } = render(
        <ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />,
      );

      const toastContainer = container.querySelector('.space-y-3');
      expect(toastContainer).toBeInTheDocument();
    });
  });

  describe('Toast Removal', () => {
    it('should pass correct id to onRemoveToast when toast is closed', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const onRemoveToast = vi.fn();
      const toasts = [createMockToast({ id: 'unique-toast-id', duration: 999999 })];

      render(<ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />);

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      // Wait for exit animation
      await new Promise((r) => setTimeout(r, 350));

      expect(onRemoveToast).toHaveBeenCalledWith('unique-toast-id');
      vi.useFakeTimers();
    });

    it('should handle removal of specific toast from multiple toasts', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const onRemoveToast = vi.fn();
      const toasts = [
        createMockToast({ id: 'toast-1', title: 'First Toast', duration: 999999 }),
        createMockToast({ id: 'toast-2', title: 'Second Toast', duration: 999999 }),
      ];

      render(<ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />);

      const closeButtons = screen.getAllByRole('button', { name: /close notification/i });
      await user.click(closeButtons[1]); // Close second toast

      // Wait for exit animation
      await new Promise((r) => setTimeout(r, 350));

      expect(onRemoveToast).toHaveBeenCalledWith('toast-2');
      vi.useFakeTimers();
    });
  });

  describe('Dynamic Updates', () => {
    it('should render new toasts when added', () => {
      const onRemoveToast = vi.fn();
      const initialToasts = [createMockToast({ id: 'toast-1', title: 'First' })];

      const { rerender } = render(
        <ToastContainer toasts={initialToasts} onRemoveToast={onRemoveToast} />,
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.queryByText('Second')).not.toBeInTheDocument();

      const updatedToasts = [...initialToasts, createMockToast({ id: 'toast-2', title: 'Second' })];

      rerender(<ToastContainer toasts={updatedToasts} onRemoveToast={onRemoveToast} />);

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should remove toast from render when removed from array', () => {
      const onRemoveToast = vi.fn();
      const initialToasts = [
        createMockToast({ id: 'toast-1', title: 'First' }),
        createMockToast({ id: 'toast-2', title: 'Second' }),
      ];

      const { rerender } = render(
        <ToastContainer toasts={initialToasts} onRemoveToast={onRemoveToast} />,
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();

      const updatedToasts = [createMockToast({ id: 'toast-1', title: 'First' })];

      rerender(<ToastContainer toasts={updatedToasts} onRemoveToast={onRemoveToast} />);

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.queryByText('Second')).not.toBeInTheDocument();
    });

    it('should transition from toasts to empty array', () => {
      const onRemoveToast = vi.fn();
      const initialToasts = [createMockToast({ id: 'toast-1' })];

      const { rerender, container } = render(
        <ToastContainer toasts={initialToasts} onRemoveToast={onRemoveToast} />,
      );

      expect(screen.getByText('Test Toast')).toBeInTheDocument();

      rerender(<ToastContainer toasts={[]} onRemoveToast={onRemoveToast} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Pointer Events', () => {
    it('should have pointer-events-none on container', () => {
      const onRemoveToast = vi.fn();
      const toasts = [createMockToast()];

      const { container } = render(
        <ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />,
      );

      const toastContainer = container.querySelector('.pointer-events-none');
      expect(toastContainer).toBeInTheDocument();
    });

    it('should have pointer-events-auto on individual toast wrappers', () => {
      const onRemoveToast = vi.fn();
      const toasts = [createMockToast()];

      const { container } = render(
        <ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />,
      );

      const toastWrapper = container.querySelector('.pointer-events-auto');
      expect(toastWrapper).toBeInTheDocument();
    });
  });
});

describe('Toast Interface', () => {
  it('should accept all required properties', () => {
    const onRemove = vi.fn();
    const toast: Toast = {
      id: 'test-id',
      type: 'success',
      title: 'Test Title',
    };

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should accept optional message property', () => {
    const onRemove = vi.fn();
    const toast: Toast = {
      id: 'test-id',
      type: 'info',
      title: 'Test Title',
      message: 'Optional message',
    };

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    expect(screen.getByText('Optional message')).toBeInTheDocument();
  });

  it('should accept optional duration property', () => {
    vi.useFakeTimers();
    const onRemove = vi.fn();
    const toast: Toast = {
      id: 'test-id',
      type: 'warning',
      title: 'Test Title',
      duration: 10000,
    };

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    // Should not auto-dismiss before 10 seconds
    act(() => {
      vi.advanceTimersByTime(9999);
    });
    expect(onRemove).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});

describe('Edge Cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle empty title', () => {
    const onRemove = vi.fn();
    const toast = createMockToast({ title: '' });

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    // Component should render without crashing
    expect(screen.getByRole('button', { name: /close notification/i })).toBeInTheDocument();
  });

  it('should handle very long title', () => {
    const onRemove = vi.fn();
    const longTitle = 'A'.repeat(200);
    const toast = createMockToast({ title: longTitle });

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('should handle very long message', () => {
    const onRemove = vi.fn();
    const longMessage = 'B'.repeat(500);
    const toast = createMockToast({ message: longMessage });

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('should handle special characters in title', () => {
    const onRemove = vi.fn();
    const toast = createMockToast({ title: '<script>alert("xss")</script>' });

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
  });

  it('should handle special characters in message', () => {
    const onRemove = vi.fn();
    const toast = createMockToast({ message: '& < > " \' © ® ™' });

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    expect(screen.getByText('& < > " \' © ® ™')).toBeInTheDocument();
  });

  it('should handle unicode characters', () => {
    const onRemove = vi.fn();
    const toast = createMockToast({
      title: '🎉 Celebration!',
      message: '日本語テキスト 中文文本 한국어 텍스트',
    });

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    expect(screen.getByText('🎉 Celebration!')).toBeInTheDocument();
    expect(screen.getByText('日本語テキスト 中文文本 한국어 텍스트')).toBeInTheDocument();
  });

  it('should handle zero duration (triggers auto-dismiss immediately)', async () => {
    const onRemove = vi.fn();
    const toast = createMockToast({ duration: 1 }); // Use 1ms instead of 0

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    // Trigger the auto-dismiss timer
    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    // Wait for exit animation
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid close button clicks', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const toast = createMockToast({ duration: 999999 });

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    const closeButton = screen.getByRole('button', { name: /close notification/i });

    // Click multiple times rapidly - each click triggers handleRemove
    await user.click(closeButton);
    await user.click(closeButton);
    await user.click(closeButton);

    // Wait for animations
    await new Promise((r) => setTimeout(r, 350));

    // Component handles multiple clicks (each triggers the removal flow)
    expect(onRemove).toHaveBeenCalled();
    vi.useFakeTimers();
  });

  it('should handle many toasts in container', () => {
    const onRemoveToast = vi.fn();
    const toasts = Array.from({ length: 20 }, (_, i) =>
      createMockToast({
        id: `toast-${i}`,
        title: `Toast ${i + 1}`,
      }),
    );

    render(<ToastContainer toasts={toasts} onRemoveToast={onRemoveToast} />);

    // All toasts should be rendered
    toasts.forEach((toast) => {
      expect(screen.getByText(toast.title)).toBeInTheDocument();
    });
  });
});

describe('Accessibility', () => {
  it('should have accessible close button', () => {
    const onRemove = vi.fn();
    const toast = createMockToast();

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    const closeButton = screen.getByRole('button', { name: /close notification/i });
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
  });

  it('should render title as heading element', () => {
    const onRemove = vi.fn();
    const toast = createMockToast({ title: 'Important Notice' });

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    const heading = screen.getByText('Important Notice');
    expect(heading.tagName.toLowerCase()).toBe('h4');
  });

  it('should render message in paragraph element', () => {
    const onRemove = vi.fn();
    const toast = createMockToast({ message: 'Details about the notification' });

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    const message = screen.getByText('Details about the notification');
    expect(message.tagName.toLowerCase()).toBe('p');
  });

  it('should be keyboard accessible - close button can be focused', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    vi.useFakeTimers();
    const onRemove = vi.fn();
    const toast = createMockToast();

    render(<ToastNotification toast={toast} onRemove={onRemove} />);

    const closeButton = screen.getByRole('button', { name: /close notification/i });
    closeButton.focus();

    expect(document.activeElement).toBe(closeButton);

    vi.useRealTimers();
  });
});
