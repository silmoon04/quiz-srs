import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { ScreenReaderAnnouncer, useAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';

// Test component that exposes the hook functionality
function TestComponent({
  onAnnounce,
  onGetAnnouncement,
}: {
  onAnnounce?: (announce: (message: string) => void) => void;
  onGetAnnouncement?: (announcement: string | null) => void;
}) {
  const { announce, announcement } = useAnnouncer();

  React.useEffect(() => {
    onAnnounce?.(announce);
  }, [announce, onAnnounce]);

  React.useEffect(() => {
    onGetAnnouncement?.(announcement);
  }, [announcement, onGetAnnouncement]);

  return <div data-testid="test-component">Test Component</div>;
}

// Test component that triggers announcement on mount
function AutoAnnounceComponent({ message }: { message: string }) {
  const { announce } = useAnnouncer();

  React.useEffect(() => {
    announce(message);
  }, [announce, message]);

  return <div data-testid="auto-announce">Auto Announce</div>;
}

// Test component that displays current announcement
function AnnouncementDisplay() {
  const { announcement } = useAnnouncer();
  return (
    <div data-testid="announcement-display">
      {announcement !== null ? announcement : 'No announcement'}
    </div>
  );
}

describe('ScreenReaderAnnouncer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render children correctly', () => {
      render(
        <ScreenReaderAnnouncer>
          <div data-testid="child">Child Content</div>
        </ScreenReaderAnnouncer>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ScreenReaderAnnouncer>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
        </ScreenReaderAnnouncer>,
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should render nested children', () => {
      render(
        <ScreenReaderAnnouncer>
          <div data-testid="parent">
            <div data-testid="nested-child">Nested Content</div>
          </div>
        </ScreenReaderAnnouncer>,
      );

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByTestId('nested-child')).toBeInTheDocument();
    });
  });

  describe('ARIA live region rendering', () => {
    it('should render an aria-live region', () => {
      render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should have aria-live="polite" attribute', () => {
      render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-atomic="true" attribute', () => {
      render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have role="status" attribute', () => {
      render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('role', 'status');
    });

    it('should have sr-only class for screen reader only visibility', () => {
      render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('should be empty initially', () => {
      render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeEmptyDOMElement();
    });
  });

  describe('Context provider', () => {
    it('should provide context to child components', () => {
      render(
        <ScreenReaderAnnouncer>
          <TestComponent />
        </ScreenReaderAnnouncer>,
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should throw error when useAnnouncer is used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAnnouncer must be used within a ScreenReaderAnnouncer');

      consoleError.mockRestore();
    });
  });

  describe('Announcement text updates', () => {
    it('should display announcement in the live region', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('Test announcement');
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('Test announcement');
    });

    it('should update announcement when announce is called multiple times', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('First announcement');
      });

      expect(screen.getByRole('status')).toHaveTextContent('First announcement');

      act(() => {
        announce('Second announcement');
      });

      expect(screen.getByRole('status')).toHaveTextContent('Second announcement');
    });

    it('should expose current announcement via context', () => {
      let announce: (message: string) => void = () => {};
      let currentAnnouncement: string | null = null;

      render(
        <ScreenReaderAnnouncer>
          <TestComponent
            onAnnounce={(fn) => (announce = fn)}
            onGetAnnouncement={(a) => (currentAnnouncement = a)}
          />
        </ScreenReaderAnnouncer>,
      );

      expect(currentAnnouncement).toBeNull();

      act(() => {
        announce('New announcement');
      });

      expect(currentAnnouncement).toBe('New announcement');
    });

    it('should handle empty string announcements', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('');
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('');
    });

    it('should handle announcements with special characters', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      const specialMessage = '<script>alert("xss")</script> & "quotes" \'apostrophes\'';

      act(() => {
        announce(specialMessage);
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(specialMessage);
    });

    it('should handle unicode characters in announcements', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      const unicodeMessage = '公告消息 🎉 Объявление Ανακοίνωση';

      act(() => {
        announce(unicodeMessage);
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(unicodeMessage);
    });

    it('should handle very long announcements', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      const longMessage = 'A'.repeat(1000);

      act(() => {
        announce(longMessage);
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(longMessage);
    });
  });

  describe('Clearing announcements', () => {
    it('should clear announcement after timeout', async () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('Temporary announcement');
      });

      expect(screen.getByRole('status')).toHaveTextContent('Temporary announcement');

      // Fast-forward past the 100ms timeout
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });

    it('should clear previous timeout when new announcement is made', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('First announcement');
      });

      // Advance time partially
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Make new announcement before first one clears
      act(() => {
        announce('Second announcement');
      });

      expect(screen.getByRole('status')).toHaveTextContent('Second announcement');

      // Advance past original timeout (should not clear due to reset)
      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByRole('status')).toHaveTextContent('Second announcement');

      // Advance past new timeout
      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });

    it('should set announcement to null after clearing', () => {
      let announce: (message: string) => void = () => {};
      let currentAnnouncement: string | null = 'initial';

      render(
        <ScreenReaderAnnouncer>
          <TestComponent
            onAnnounce={(fn) => (announce = fn)}
            onGetAnnouncement={(a) => (currentAnnouncement = a)}
          />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('Test');
      });

      expect(currentAnnouncement).toBe('Test');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(currentAnnouncement).toBeNull();
    });
  });

  describe('Visible status indicator', () => {
    it('should not display visible status when no announcement', () => {
      render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      // Only the sr-only live region should exist
      const statusElements = screen.getAllByText((_, element) => {
        return (
          element?.getAttribute('aria-live') === 'polite' || element?.classList.contains('fixed')
        );
      });

      // Should only find the sr-only element
      expect(statusElements).toHaveLength(1);
      expect(statusElements[0]).toHaveClass('sr-only');
    });

    it('should display visible status when announcement is made', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('Visible announcement');
      });

      // Find the visible status element (fixed position)
      const visibleStatus = document.querySelector('.fixed.right-4.top-4');
      expect(visibleStatus).toBeInTheDocument();
      expect(visibleStatus).toHaveTextContent('Visible announcement');
    });

    it('should have correct styling classes on visible status', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('Styled announcement');
      });

      const visibleStatus = document.querySelector('.fixed');
      expect(visibleStatus).toHaveClass('fixed');
      expect(visibleStatus).toHaveClass('right-4');
      expect(visibleStatus).toHaveClass('top-4');
      expect(visibleStatus).toHaveClass('z-50');
      expect(visibleStatus).toHaveClass('rounded');
      expect(visibleStatus).toHaveClass('bg-blue-600');
      expect(visibleStatus).toHaveClass('px-4');
      expect(visibleStatus).toHaveClass('py-2');
      expect(visibleStatus).toHaveClass('text-white');
      expect(visibleStatus).toHaveClass('shadow-lg');
    });

    it('should hide visible status when announcement is cleared', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('Temporary visible announcement');
      });

      expect(document.querySelector('.fixed.right-4.top-4')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(document.querySelector('.fixed.right-4.top-4')).not.toBeInTheDocument();
    });
  });

  describe('useAnnouncer Hook', () => {
    it('should throw error when used outside ScreenReaderAnnouncer', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAnnouncer must be used within a ScreenReaderAnnouncer');

      consoleError.mockRestore();
    });

    it('should provide announce function', () => {
      let announce: ((message: string) => void) | undefined;

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      expect(announce).toBeDefined();
      expect(typeof announce).toBe('function');
    });

    it('should provide announcement state', () => {
      let receivedAnnouncement = false;

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onGetAnnouncement={() => (receivedAnnouncement = true)} />
        </ScreenReaderAnnouncer>,
      );

      expect(receivedAnnouncement).toBe(true);
    });

    it('should return stable announce function reference', () => {
      const announceRefs: ((message: string) => void)[] = [];

      function CollectRefs() {
        const { announce } = useAnnouncer();
        React.useEffect(() => {
          announceRefs.push(announce);
        });
        return null;
      }

      const { rerender } = render(
        <ScreenReaderAnnouncer>
          <CollectRefs />
        </ScreenReaderAnnouncer>,
      );

      rerender(
        <ScreenReaderAnnouncer>
          <CollectRefs />
        </ScreenReaderAnnouncer>,
      );

      expect(announceRefs.length).toBeGreaterThanOrEqual(2);
      expect(announceRefs[0]).toBe(announceRefs[1]);
    });
  });

  describe('Component unmount cleanup', () => {
    it('should cleanup timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      let announce: (message: string) => void = () => {};

      const { unmount } = render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('Announcement before unmount');
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should not throw error when unmounting without pending timeout', () => {
      const { unmount } = render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should not throw error when unmounting after timeout has completed', () => {
      let announce: (message: string) => void = () => {};

      const { unmount } = render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('Test');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Multiple announcements in rapid succession', () => {
    it('should handle rapid announcements correctly', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('First');
        announce('Second');
        announce('Third');
        announce('Fourth');
        announce('Final');
      });

      expect(screen.getByRole('status')).toHaveTextContent('Final');
    });

    it('should only have one active timeout after rapid announcements', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('One');
        announce('Two');
        announce('Three');
      });

      expect(screen.getByRole('status')).toHaveTextContent('Three');

      // After timeout, should be cleared
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });
  });

  describe('Nested ScreenReaderAnnouncer components', () => {
    it('should use the nearest provider context', () => {
      let outerAnnounce: (message: string) => void = () => {};
      let innerAnnounce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (outerAnnounce = fn)} />
          <ScreenReaderAnnouncer>
            <TestComponent onAnnounce={(fn) => (innerAnnounce = fn)} />
          </ScreenReaderAnnouncer>
        </ScreenReaderAnnouncer>,
      );

      // Should have two live regions
      const liveRegions = screen.getAllByRole('status');
      expect(liveRegions).toHaveLength(2);

      act(() => {
        innerAnnounce('Inner announcement');
      });

      // One should have the announcement, one should be empty
      const withContent = liveRegions.filter((el) => el.textContent === 'Inner announcement');
      expect(withContent).toHaveLength(1);
    });
  });

  describe('Integration with child components', () => {
    it('should work with auto-announcing child components', () => {
      render(
        <ScreenReaderAnnouncer>
          <AutoAnnounceComponent message="Auto message" />
        </ScreenReaderAnnouncer>,
      );

      expect(screen.getByRole('status')).toHaveTextContent('Auto message');
    });

    it('should allow multiple components to share the announcer', () => {
      render(
        <ScreenReaderAnnouncer>
          <AnnouncementDisplay />
          <AutoAnnounceComponent message="Shared announcement" />
        </ScreenReaderAnnouncer>,
      );

      expect(screen.getByTestId('announcement-display')).toHaveTextContent('Shared announcement');
      expect(screen.getByRole('status')).toHaveTextContent('Shared announcement');
    });
  });

  describe('Politeness settings', () => {
    it('should use polite aria-live by default', () => {
      render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should use status role which is implicitly polite', () => {
      render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      // role="status" has an implicit aria-live of polite
    });
  });

  describe('Accessibility compliance', () => {
    it('should have proper ARIA attributes for screen reader compatibility', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('Accessible announcement');
      });

      const liveRegion = screen.getByRole('status');

      // Check all ARIA attributes
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveAttribute('role', 'status');
    });

    it('should be hidden visually but accessible to screen readers', () => {
      render(
        <ScreenReaderAnnouncer>
          <div>Content</div>
        </ScreenReaderAnnouncer>,
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('should announce full content atomically', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('This is a complete sentence that should be read atomically.');
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveTextContent(
        'This is a complete sentence that should be read atomically.',
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle null and undefined children gracefully', () => {
      expect(() => {
        render(
          <ScreenReaderAnnouncer>
            {null}
            {undefined}
            <div>Valid child</div>
          </ScreenReaderAnnouncer>,
        );
      }).not.toThrow();

      expect(screen.getByText('Valid child')).toBeInTheDocument();
    });

    it('should handle announcements with newlines', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      const multilineMessage = 'Line 1\nLine 2\nLine 3';

      act(() => {
        announce(multilineMessage);
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('Line 1');
      expect(liveRegion).toHaveTextContent('Line 2');
      expect(liveRegion).toHaveTextContent('Line 3');
    });

    it('should handle announcements with HTML entities', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('Price: $100 < $200 > $50 & more');
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('Price: $100 < $200 > $50 & more');
    });

    it('should handle whitespace-only announcements', () => {
      let announce: (message: string) => void = () => {};

      render(
        <ScreenReaderAnnouncer>
          <TestComponent onAnnounce={(fn) => (announce = fn)} />
        </ScreenReaderAnnouncer>,
      );

      act(() => {
        announce('   ');
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion.textContent).toBe('   ');
    });
  });
});
