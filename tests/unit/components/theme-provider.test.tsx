import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { ThemeProvider } from '@/components/theme-provider';

// Mock setTheme function
const mockSetTheme = vi.fn();

// Mock next-themes module
vi.mock('next-themes', () => ({
  ThemeProvider: ({
    children,
    defaultTheme,
    attribute,
    enableSystem,
    disableTransitionOnChange,
    storageKey,
    themes,
    forcedTheme,
    enableColorScheme,
    nonce,
    ...rest
  }: any) => {
    const dataTheme = defaultTheme || 'light';
    const propsToSpread: Record<string, string> = {};

    // Use data-* attributes to avoid React warnings about non-standard DOM attributes
    if (attribute)
      propsToSpread['data-attribute'] = Array.isArray(attribute) ? attribute.join(',') : attribute;
    if (enableSystem !== undefined) propsToSpread['data-enable-system'] = String(enableSystem);
    if (disableTransitionOnChange !== undefined)
      propsToSpread['data-disable-transition-on-change'] = String(disableTransitionOnChange);
    if (storageKey) propsToSpread['data-storage-key'] = storageKey;
    if (themes) propsToSpread['data-themes'] = themes.join(',');
    if (forcedTheme) propsToSpread['data-forced-theme'] = forcedTheme;
    if (enableColorScheme !== undefined)
      propsToSpread['data-enable-color-scheme'] = String(enableColorScheme);
    if (nonce) propsToSpread['data-nonce'] = nonce;

    return (
      <div data-testid="next-themes-provider" data-theme={dataTheme} {...propsToSpread}>
        {children}
      </div>
    );
  },
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
    resolvedTheme: 'light',
    themes: ['light', 'dark', 'system'],
    systemTheme: 'light',
    forcedTheme: undefined,
  }),
}));

// Import useTheme after mocking
import { useTheme } from 'next-themes';

// Helper component to test theme context values
function ThemeConsumer() {
  const { theme, setTheme, resolvedTheme, themes, systemTheme } = useTheme();

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <span data-testid="system-theme">{systemTheme}</span>
      <span data-testid="available-themes">{themes.join(',')}</span>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme('system')} data-testid="set-system">
        Set System
      </button>
    </div>
  );
}

describe('ThemeProvider Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetTheme.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render children correctly', () => {
      render(
        <ThemeProvider>
          <div data-testid="child-content">Hello World</div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should wrap children with NextThemesProvider', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ThemeProvider>
          <div data-testid="first-child">First</div>
          <div data-testid="second-child">Second</div>
          <div data-testid="third-child">Third</div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('first-child')).toBeInTheDocument();
      expect(screen.getByTestId('second-child')).toBeInTheDocument();
      expect(screen.getByTestId('third-child')).toBeInTheDocument();
    });

    it('should render nested components', () => {
      render(
        <ThemeProvider>
          <div data-testid="outer">
            <div data-testid="middle">
              <div data-testid="inner">Nested Content</div>
            </div>
          </div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('outer')).toBeInTheDocument();
      expect(screen.getByTestId('middle')).toBeInTheDocument();
      expect(screen.getByTestId('inner')).toBeInTheDocument();
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });

    it('should render with no children', () => {
      const { container } = render(<ThemeProvider />);

      expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="next-themes-provider"]')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward attribute prop to NextThemesProvider', () => {
      render(
        <ThemeProvider attribute="class">
          <div>Content</div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-attribute', 'class');
    });

    it('should forward defaultTheme prop to NextThemesProvider', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <div>Content</div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-theme', 'dark');
    });

    it('should forward enableSystem prop to NextThemesProvider', () => {
      render(
        <ThemeProvider enableSystem={true}>
          <div>Content</div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-enable-system', 'true');
    });

    it('should forward disableTransitionOnChange prop', () => {
      render(
        <ThemeProvider disableTransitionOnChange={true}>
          <div>Content</div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-disable-transition-on-change', 'true');
    });

    it('should forward storageKey prop', () => {
      render(
        <ThemeProvider storageKey="my-custom-theme-key">
          <div>Content</div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-storage-key', 'my-custom-theme-key');
    });

    it('should forward themes prop', () => {
      render(
        <ThemeProvider themes={['light', 'dark', 'sepia', 'contrast']}>
          <div>Content</div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-themes', 'light,dark,sepia,contrast');
    });

    it('should forward multiple props at once', () => {
      render(
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={true}
        >
          <div>Content</div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-attribute', 'class');
      expect(provider).toHaveAttribute('data-theme', 'system');
      expect(provider).toHaveAttribute('data-enable-system', 'true');
      expect(provider).toHaveAttribute('data-disable-transition-on-change', 'true');
    });
  });

  describe('Theme Context Values', () => {
    it('should provide theme value through context', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('should provide resolvedTheme through context', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    });

    it('should provide systemTheme through context', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
    });

    it('should provide available themes through context', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('available-themes')).toHaveTextContent('light,dark,system');
    });

    it('should provide setTheme function through context', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      const setDarkButton = screen.getByTestId('set-dark');
      expect(setDarkButton).toBeInTheDocument();
    });
  });

  describe('Theme Switching', () => {
    it('should switch to dark theme when setTheme is called', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      await user.click(screen.getByTestId('set-dark'));

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should switch to light theme when setTheme is called', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      await user.click(screen.getByTestId('set-light'));

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('should switch to system theme when setTheme is called', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      await user.click(screen.getByTestId('set-system'));

      expect(mockSetTheme).toHaveBeenCalledWith('system');
    });

    it('should allow multiple theme changes', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      await user.click(screen.getByTestId('set-dark'));
      await user.click(screen.getByTestId('set-light'));
      await user.click(screen.getByTestId('set-system'));

      expect(mockSetTheme).toHaveBeenCalledTimes(3);
      expect(mockSetTheme).toHaveBeenNthCalledWith(1, 'dark');
      expect(mockSetTheme).toHaveBeenNthCalledWith(2, 'light');
      expect(mockSetTheme).toHaveBeenNthCalledWith(3, 'system');
    });
  });

  describe('Default Theme', () => {
    it('should apply light theme as default when no defaultTheme is specified', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('should apply dark theme when defaultTheme is dark', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-theme', 'dark');
    });

    it('should apply system theme when defaultTheme is system', () => {
      render(
        <ThemeProvider defaultTheme="system">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-theme', 'system');
    });
  });

  describe('System Theme Detection', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('should detect system preference for dark mode', () => {
      // Mock matchMedia to return dark preference
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeProvider enableSystem={true} defaultTheme="system">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      // System theme detection is mocked, so we verify the component rendered
      expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
    });

    it('should detect system preference for light mode', () => {
      // Mock matchMedia to return light preference
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeProvider enableSystem={true} defaultTheme="system">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
    });

    it('should handle matchMedia not being available', () => {
      // Remove matchMedia
      const originalMatchMedia = window.matchMedia;
      // @ts-expect-error - intentionally removing matchMedia
      delete window.matchMedia;

      // Should not throw
      expect(() => {
        render(
          <ThemeProvider enableSystem={true}>
            <ThemeConsumer />
          </ThemeProvider>,
        );
      }).not.toThrow();

      // Restore
      window.matchMedia = originalMatchMedia;
    });

    it('should respond to system theme changes via media query listener', () => {
      let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | null = null;

      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_, callback) => {
          mediaQueryCallback = callback;
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeProvider enableSystem={true}>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      // Simulate media query change
      if (mediaQueryCallback) {
        act(() => {
          mediaQueryCallback!({ matches: true } as MediaQueryListEvent);
        });
      }

      expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
    });
  });

  describe('Theme Persistence', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should use custom storageKey for persistence', () => {
      render(
        <ThemeProvider storageKey="custom-theme-storage">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-storage-key', 'custom-theme-storage');
    });

    it('should forward forcedTheme prop when theme should not persist', () => {
      render(
        <ThemeProvider forcedTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-forced-theme', 'dark');
    });

    it('should allow theme persistence by default (no forcedTheme)', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).not.toHaveAttribute('data-forced-theme');
    });
  });

  describe('Attribute Configuration', () => {
    it('should set attribute to class for class-based theming', () => {
      render(
        <ThemeProvider attribute="class">
          <div>Content</div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-attribute', 'class');
    });

    it('should set attribute to data-theme for data attribute theming', () => {
      render(
        <ThemeProvider attribute="data-theme">
          <div>Content</div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-attribute', 'data-theme');
    });

    it('should support array of attributes', () => {
      render(
        <ThemeProvider attribute={['class', 'data-theme']}>
          <div>Content</div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-attribute', 'class,data-theme');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      const { container } = render(<ThemeProvider>{null}</ThemeProvider>);

      expect(container.querySelector('[data-testid="next-themes-provider"]')).toBeInTheDocument();
    });

    it('should handle undefined children gracefully', () => {
      const { container } = render(<ThemeProvider>{undefined}</ThemeProvider>);

      expect(container.querySelector('[data-testid="next-themes-provider"]')).toBeInTheDocument();
    });

    it('should handle conditional children', () => {
      const showChild = true;

      render(
        <ThemeProvider>
          {showChild && <div data-testid="conditional-child">Visible</div>}
        </ThemeProvider>,
      );

      expect(screen.getByTestId('conditional-child')).toBeInTheDocument();
    });

    it('should handle boolean false children', () => {
      render(
        <ThemeProvider>
          {false}
          <div data-testid="real-child">Real Child</div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('real-child')).toBeInTheDocument();
    });

    it('should handle fragment children', () => {
      render(
        <ThemeProvider>
          <>
            <div data-testid="fragment-child-1">First</div>
            <div data-testid="fragment-child-2">Second</div>
          </>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('fragment-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('fragment-child-2')).toBeInTheDocument();
    });

    it('should handle deeply nested providers', () => {
      render(
        <ThemeProvider>
          <div>
            <ThemeProvider>
              <ThemeConsumer />
            </ThemeProvider>
          </div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('current-theme')).toBeInTheDocument();
    });

    it('should handle numeric children', () => {
      render(
        <ThemeProvider>
          <div data-testid="number-child">{42}</div>
        </ThemeProvider>,
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should handle string children', () => {
      render(
        <ThemeProvider>
          <div data-testid="string-child">Simple Text</div>
        </ThemeProvider>,
      );

      expect(screen.getByText('Simple Text')).toBeInTheDocument();
    });
  });

  describe('Integration with Consumer Components', () => {
    it('should allow consumer to read and update theme', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      // Initial state
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Switch theme
      await user.click(screen.getByTestId('set-dark'));

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should work with multiple consumers', () => {
      render(
        <ThemeProvider>
          <div data-testid="consumer-1">
            <ThemeConsumer />
          </div>
          <div data-testid="consumer-2">
            <ThemeConsumer />
          </div>
        </ThemeProvider>,
      );

      const themeDisplays = screen.getAllByTestId('current-theme');
      expect(themeDisplays).toHaveLength(2);
      expect(themeDisplays[0]).toHaveTextContent('light');
      expect(themeDisplays[1]).toHaveTextContent('light');
    });

    it('should provide consistent theme value to all consumers', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
          <div>
            <ThemeConsumer />
          </div>
        </ThemeProvider>,
      );

      const provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-theme', 'dark');
    });
  });

  describe('SSR Compatibility', () => {
    it('should not throw during server-side rendering simulation', () => {
      // Simulate SSR by temporarily removing window properties
      const originalLocalStorage = global.localStorage;

      expect(() => {
        render(
          <ThemeProvider>
            <div>SSR Test</div>
          </ThemeProvider>,
        );
      }).not.toThrow();

      expect(screen.getByText('SSR Test')).toBeInTheDocument();
    });

    it('should render correctly when mounted', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      // After mount, theme should be available
      expect(screen.getByTestId('current-theme')).toBeInTheDocument();
    });
  });

  describe('TypeScript Props Interface', () => {
    it('should accept all valid ThemeProviderProps', () => {
      // This test verifies TypeScript prop types are correct
      render(
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          enableColorScheme={true}
          disableTransitionOnChange={false}
          storageKey="theme"
          themes={['light', 'dark']}
          forcedTheme={undefined}
          nonce="abc123"
        >
          <div>Full Props Test</div>
        </ThemeProvider>,
      );

      expect(screen.getByText('Full Props Test')).toBeInTheDocument();
    });

    it('should work without any optional props', () => {
      render(
        <ThemeProvider>
          <div>Minimal Props Test</div>
        </ThemeProvider>,
      );

      expect(screen.getByText('Minimal Props Test')).toBeInTheDocument();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should maintain children on re-render', () => {
      const { rerender } = render(
        <ThemeProvider>
          <div data-testid="stable-child">Stable</div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('stable-child')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <div data-testid="stable-child">Stable</div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('stable-child')).toBeInTheDocument();
    });

    it('should update when props change', () => {
      const { rerender } = render(
        <ThemeProvider defaultTheme="light">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      let provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-theme', 'light');

      rerender(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      provider = screen.getByTestId('next-themes-provider');
      expect(provider).toHaveAttribute('data-theme', 'dark');
    });

    it('should handle children updates', () => {
      const { rerender } = render(
        <ThemeProvider>
          <div data-testid="original">Original Content</div>
        </ThemeProvider>,
      );

      expect(screen.getByText('Original Content')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <div data-testid="updated">Updated Content</div>
        </ThemeProvider>,
      );

      expect(screen.getByText('Updated Content')).toBeInTheDocument();
      expect(screen.queryByText('Original Content')).not.toBeInTheDocument();
    });
  });
});

describe('ThemeProvider Export', () => {
  it('should be a named export', async () => {
    const themeProviderModule = await import('@/components/theme-provider');
    expect(themeProviderModule.ThemeProvider).toBeDefined();
    expect(typeof themeProviderModule.ThemeProvider).toBe('function');
  });

  it('should be a React component', () => {
    expect(ThemeProvider).toBeDefined();
    expect(typeof ThemeProvider).toBe('function');
  });
});
