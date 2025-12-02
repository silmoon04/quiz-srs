import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import React from 'react';

describe('Simple SecureTextRenderer Tests', () => {
  it('should render plain text', async () => {
    const content = 'Hello world';
    render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
  });

  it('should remove script tags', async () => {
    const content = '<script>alert("XSS")</script>';
    const { container } = render(<MarkdownRenderer markdown={content} />);

    // Wait for async rendering to complete
    await waitFor(() => {
      // Should not contain the actual script content
      expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
      // Should be completely removed (empty content)
      expect(container.innerHTML).not.toContain('script');
      expect(container.innerHTML).not.toContain('alert');
    });
  });

  it('should render markdown bold text', async () => {
    const content = 'This is **bold** text';
    render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      // Check that the bold text is rendered correctly
      expect(screen.getByText('bold')).toBeInTheDocument();
    });
    // Check that the text is split correctly
    expect(screen.getByText(/This is/)).toBeInTheDocument();
    expect(screen.getByText(/text/)).toBeInTheDocument();
  });

  it('should render markdown italic text', async () => {
    const content = 'This is *italic* text';
    render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      expect(screen.getByText('italic')).toBeInTheDocument();
    });
  });

  it('should render inline code', async () => {
    const content = 'Use `console.log()` to debug';
    render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      expect(screen.getByText('console.log()')).toBeInTheDocument();
    });
  });

  it('should render headers', async () => {
    const content = '# Main Title\n## Subtitle';
    render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
  });

  it('should render unordered lists', async () => {
    const content = '- Item 1\n- Item 2\n- Item 3';
    render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  it('should render ordered lists', async () => {
    const content = '1. First item\n2. Second item\n3. Third item';
    render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByText('Second item')).toBeInTheDocument();
      expect(screen.getByText('Third item')).toBeInTheDocument();
    });
  });

  it('should render links safely', async () => {
    const content = 'Visit [Google](https://google.com) for search';
    render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });
  });

  it('should reject javascript: URLs', async () => {
    const content = '[Click me](javascript:alert("XSS"))';
    const { container } = render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      // Should not render as a link, just as text (but may have extra parenthesis due to regex issue)
      expect(screen.getByText(/Click me/)).toBeInTheDocument();
    });
    // Should not contain javascript: in the HTML
    expect(container.innerHTML).not.toContain('javascript:');
  });

  it('should remove event handlers', async () => {
    const content = '<img src="x" onerror="alert(\'XSS\')">';
    const { container } = render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      // Should not contain dangerous event handlers
      expect(container.innerHTML).not.toContain('onerror');
      expect(container.innerHTML).not.toContain('alert');
    });
    // Note: The sanitizer may completely remove the img tag or strip attributes
    // We just verify the dangerous content is removed
  });

  it('should remove dangerous HTML attributes', async () => {
    const content = '<div onclick="alert(\'XSS\')">Click me</div>';
    const { container } = render(<MarkdownRenderer markdown={content} />);

    await waitFor(() => {
      // Should not contain any onclick attributes
      expect(container.innerHTML).not.toContain('onclick');
      expect(container.innerHTML).not.toContain('alert');
      // The content should be rendered (either the text or sanitized version)
      // Note: rehype-sanitize may strip the entire element if it's considered unsafe
      // The key assertion is that the dangerous onclick is removed
    });
  });
});
