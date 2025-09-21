import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScreenReaderAnnouncer, useAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';
import { ReactNode } from 'react';

// Test component that uses the announcer
function TestComponent({ message }: { message: string }) {
  const { announce } = useAnnouncer();

  return <button onClick={() => announce(message)}>Announce: {message}</button>;
}

// Wrapper component for testing
function TestWrapper({ children }: { children: ReactNode }) {
  return <ScreenReaderAnnouncer>{children}</ScreenReaderAnnouncer>;
}

describe('Screen Reader Announcer', () => {
  it('announces messages to screen readers', async () => {
    render(
      <TestWrapper>
        <TestComponent message="Answer is correct" />
      </TestWrapper>,
    );

    const button = screen.getByRole('button', { name: /announce: answer is correct/i });

    // Click to trigger announcement
    await act(async () => {
      button.click();
    });

    // Check that live region receives the message
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Answer is correct');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('shows visible status for inversion safety', async () => {
    render(
      <TestWrapper>
        <TestComponent message="Answer is incorrect" />
      </TestWrapper>,
    );

    const button = screen.getByRole('button', { name: /announce: answer is incorrect/i });

    // Click to trigger announcement
    await act(async () => {
      button.click();
    });

    // Check for visible status indicator (use getAllByText and find the visible one)
    const visibleStatuses = screen.getAllByText('Answer is incorrect');
    const visibleStatus = visibleStatuses.find(
      (el) => el.classList.contains('fixed') && el.classList.contains('top-4'),
    );
    expect(visibleStatus).toBeInTheDocument();
    expect(visibleStatus).toHaveClass('fixed', 'top-4', 'right-4');
  });

  it('clears announcements after timeout', async () => {
    vi.useFakeTimers();

    render(
      <TestWrapper>
        <TestComponent message="Question 2" />
      </TestWrapper>,
    );

    const button = screen.getByRole('button', { name: /announce: question 2/i });

    // Click to trigger announcement
    await act(async () => {
      button.click();
    });

    // Should be visible initially (check for visible status specifically)
    const visibleStatuses = screen.getAllByText('Question 2');
    const visibleStatus = visibleStatuses.find(
      (el) => el.classList.contains('fixed') && el.classList.contains('top-4'),
    );
    expect(visibleStatus).toBeInTheDocument();

    // Fast forward time
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    // Should be cleared after timeout (check that visible status is gone)
    const remainingStatuses = screen.queryAllByText('Question 2');
    const remainingVisibleStatus = remainingStatuses.find(
      (el) => el.classList.contains('fixed') && el.classList.contains('top-4'),
    );
    expect(remainingVisibleStatus).toBeUndefined();

    vi.useRealTimers();
  });

  it('provides proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>,
    );

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(liveRegion).toHaveClass('sr-only');
  });
});
