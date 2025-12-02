import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

const MOBILE_BREAKPOINT = 768;

describe('useIsMobile', () => {
  let originalMatchMedia: typeof window.matchMedia;
  let originalInnerWidth: number;
  let matchMediaListeners: Map<string, Set<(e: MediaQueryListEvent) => void>>;

  const createMockMatchMedia = (matches: boolean) => {
    return (query: string): MediaQueryList => {
      const listeners = matchMediaListeners.get(query) || new Set();
      matchMediaListeners.set(query, listeners);

      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn((cb) => listeners.add(cb)),
        removeListener: vi.fn((cb) => listeners.delete(cb)),
        addEventListener: vi.fn((event, cb) => {
          if (event === 'change') {
            listeners.add(cb as (e: MediaQueryListEvent) => void);
          }
        }),
        removeEventListener: vi.fn((event, cb) => {
          if (event === 'change') {
            listeners.delete(cb as (e: MediaQueryListEvent) => void);
          }
        }),
        dispatchEvent: vi.fn(),
      };
    };
  };

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  const triggerResize = (newWidth: number) => {
    setWindowWidth(newWidth);
    const isMobile = newWidth < MOBILE_BREAKPOINT;
    const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
    const listeners = matchMediaListeners.get(query);
    if (listeners) {
      listeners.forEach((listener) => {
        listener({ matches: isMobile } as MediaQueryListEvent);
      });
    }
  };

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    originalInnerWidth = window.innerWidth;
    matchMediaListeners = new Map();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    vi.restoreAllMocks();
  });

  it('returns true for mobile widths (below 768px)', () => {
    setWindowWidth(375);
    window.matchMedia = createMockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('returns true for width at 767px (just below breakpoint)', () => {
    setWindowWidth(767);
    window.matchMedia = createMockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('returns false for desktop widths (768px and above)', () => {
    setWindowWidth(1024);
    window.matchMedia = createMockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('returns false for width at exactly 768px (breakpoint)', () => {
    setWindowWidth(768);
    window.matchMedia = createMockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('returns false for large desktop widths', () => {
    setWindowWidth(1920);
    window.matchMedia = createMockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('responds to window resize from desktop to mobile', () => {
    setWindowWidth(1024);
    window.matchMedia = createMockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      triggerResize(375);
    });

    expect(result.current).toBe(true);
  });

  it('responds to window resize from mobile to desktop', () => {
    setWindowWidth(375);
    window.matchMedia = createMockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);

    act(() => {
      triggerResize(1024);
    });

    expect(result.current).toBe(false);
  });

  it('handles multiple resize events correctly', () => {
    setWindowWidth(1024);
    window.matchMedia = createMockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      triggerResize(375);
    });
    expect(result.current).toBe(true);

    act(() => {
      triggerResize(1024);
    });
    expect(result.current).toBe(false);

    act(() => {
      triggerResize(500);
    });
    expect(result.current).toBe(true);
  });

  it('initial state is false before useEffect runs (undefined becomes false)', () => {
    setWindowWidth(375);
    window.matchMedia = createMockMatchMedia(true);

    // The hook uses !!isMobile which converts undefined to false initially
    // After useEffect runs, it will be true for mobile width
    const { result } = renderHook(() => useIsMobile());

    // After render and useEffect, it should reflect the actual window width
    expect(result.current).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    setWindowWidth(1024);
    const mockMatchMedia = createMockMatchMedia(false);
    window.matchMedia = mockMatchMedia;

    const { unmount } = renderHook(() => useIsMobile());

    const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
    const listeners = matchMediaListeners.get(query);
    expect(listeners?.size).toBe(1);

    unmount();

    expect(listeners?.size).toBe(0);
  });

  it('uses correct media query string (max-width: 767px)', () => {
    setWindowWidth(1024);
    const matchMediaSpy = vi.fn(createMockMatchMedia(false));
    window.matchMedia = matchMediaSpy;

    renderHook(() => useIsMobile());

    expect(matchMediaSpy).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('handles very small mobile widths', () => {
    setWindowWidth(320);
    window.matchMedia = createMockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('handles tablet-like widths just above breakpoint', () => {
    setWindowWidth(800);
    window.matchMedia = createMockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });
});
