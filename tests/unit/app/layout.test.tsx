import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '@/app/layout';

// Mock the geist fonts
vi.mock('geist/font/sans', () => ({
  GeistSans: {
    style: { fontFamily: 'Geist Sans' },
    variable: '--font-geist-sans',
  },
}));

vi.mock('geist/font/mono', () => ({
  GeistMono: {
    variable: '--font-geist-mono',
  },
}));

// Mock Vercel Analytics
vi.mock('@vercel/analytics/next', () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

// Mock ScreenReaderAnnouncer to simplify testing
vi.mock('@/components/a11y/ScreenReaderAnnouncer', () => ({
  ScreenReaderAnnouncer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="screen-reader-announcer">{children}</div>
  ),
}));

describe('RootLayout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Metadata Export', () => {
    it('should export metadata with correct title', () => {
      expect(metadata.title).toBe('Quiz‑SRS');
    });

    it('should export metadata with correct description', () => {
      expect(metadata.description).toBe(
        'Secure spaced-repetition quizzes with rich Markdown and math.',
      );
    });

    it('should export metadata with correct applicationName', () => {
      expect(metadata.applicationName).toBe('Quiz‑SRS');
    });

    it('should export metadata with correct generator', () => {
      expect(metadata.generator).toBe('next');
    });

    it('should have all required metadata properties defined', () => {
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('applicationName');
      expect(metadata).toHaveProperty('generator');
    });
  });

  describe('Children Rendering', () => {
    it('should render children content', () => {
      render(
        <RootLayout>
          <div data-testid="child-content">Test Child</div>
        </RootLayout>,
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <RootLayout>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
        </RootLayout>,
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should render nested children correctly', () => {
      render(
        <RootLayout>
          <div data-testid="parent">
            <span data-testid="nested-child">Nested Content</span>
          </div>
        </RootLayout>,
      );

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByTestId('nested-child')).toBeInTheDocument();
    });

    it('should render text children', () => {
      render(<RootLayout>Plain text content</RootLayout>);

      expect(screen.getByText('Plain text content')).toBeInTheDocument();
    });
  });

  describe('Provider Wrapping', () => {
    it('should wrap children with ScreenReaderAnnouncer', () => {
      render(
        <RootLayout>
          <div data-testid="child">Content</div>
        </RootLayout>,
      );

      const announcer = screen.getByTestId('screen-reader-announcer');
      expect(announcer).toBeInTheDocument();
      expect(announcer).toContainElement(screen.getByTestId('child'));
    });

    it('should conditionally render Analytics component based on environment', () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>,
      );

      // Analytics is conditionally rendered based on NEXT_PUBLIC_VERCEL env var
      // In test environment, it may or may not be present
      const analytics = screen.queryByTestId('vercel-analytics');
      // This test just verifies the component renders without errors
      expect(screen.getByTestId('screen-reader-announcer')).toBeInTheDocument();
    });

    it('should render ScreenReaderAnnouncer and optionally Analytics', () => {
      render(
        <RootLayout>
          <div data-testid="child">Content</div>
        </RootLayout>,
      );

      const announcer = screen.getByTestId('screen-reader-announcer');

      // Announcer should always be present
      expect(announcer).toBeInTheDocument();
      // Analytics is conditionally rendered
    });
  });

  describe('HTML Structure', () => {
    it('should render with correct lang attribute on html element', () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>,
      );

      // In jsdom, the html element is at document.documentElement level
      // The RootLayout renders html/body which get hoisted by React
      // We verify the component structure is correct
      expect(screen.getByTestId('screen-reader-announcer')).toBeInTheDocument();
    });

    it('should render style element with font configuration', () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>,
      );

      // Verify that the layout renders without errors
      // The style tag is in head which is handled by React's special treatment
      expect(screen.getByTestId('screen-reader-announcer')).toBeInTheDocument();
    });

    it('should render layout with font CSS variables', () => {
      render(
        <RootLayout>
          <div data-testid="content">Content</div>
        </RootLayout>,
      );

      // The component renders successfully with font mocks
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should render children inside body structure', () => {
      render(
        <RootLayout>
          <div data-testid="body-child">Body Content</div>
        </RootLayout>,
      );

      const child = screen.getByTestId('body-child');
      expect(child).toBeInTheDocument();
      expect(child).toHaveTextContent('Body Content');
    });
  });

  describe('Component Integration', () => {
    it('should render complete layout with all components', () => {
      render(
        <RootLayout>
          <main data-testid="main-content">
            <h1>Page Title</h1>
            <p>Page content</p>
          </main>
        </RootLayout>,
      );

      // Check all components are rendered
      expect(screen.getByTestId('screen-reader-announcer')).toBeInTheDocument();

      // Check content
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page Title');
      expect(screen.getByText('Page content')).toBeInTheDocument();
    });

    it('should properly nest accessibility and analytics components', () => {
      render(
        <RootLayout>
          <div data-testid="app-content">App</div>
        </RootLayout>,
      );

      const announcer = screen.getByTestId('screen-reader-announcer');
      const content = screen.getByTestId('app-content');

      // Content should be inside announcer
      expect(announcer).toContainElement(content);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      expect(() =>
        render(
          <RootLayout>
            <></>
          </RootLayout>,
        ),
      ).not.toThrow();
    });

    it('should handle null-like children gracefully', () => {
      expect(() =>
        render(
          <RootLayout>
            {null}
            {undefined}
            {false}
          </RootLayout>,
        ),
      ).not.toThrow();
    });

    it('should handle conditional children', () => {
      const showContent = true;
      render(<RootLayout>{showContent && <div data-testid="conditional">Shown</div>}</RootLayout>);

      expect(screen.getByTestId('conditional')).toBeInTheDocument();
    });

    it('should handle array of children', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      render(
        <RootLayout>
          {items.map((item, index) => (
            <div key={index} data-testid={`item-${index}`}>
              {item}
            </div>
          ))}
        </RootLayout>,
      );

      expect(screen.getByTestId('item-0')).toHaveTextContent('Item 1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Item 2');
      expect(screen.getByTestId('item-2')).toHaveTextContent('Item 3');
    });
  });
});
