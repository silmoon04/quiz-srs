import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import React from 'react';

describe('SecureTextRenderer Tests', () => {
  describe('Basic Functionality', () => {
    it('should render plain text', async () => {
      const content = 'Hello world';
      render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeInTheDocument();
      });
    });

    it('should render markdown bold text', async () => {
      const content = 'This is **bold** text';
      render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('bold')).toBeInTheDocument();
      });
      expect(screen.getByText(/This is/)).toBeInTheDocument();
      expect(screen.getByText(/text/)).toBeInTheDocument();
    });

    it('should render markdown italic text', async () => {
      const content = 'This is *italic* text';
      render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('italic')).toBeInTheDocument();
      });
      expect(screen.getByText(/This is/)).toBeInTheDocument();
      expect(screen.getByText(/text/)).toBeInTheDocument();
    });

    it('should render inline code', async () => {
      const content = 'Use `console.log()` to debug';
      render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('console.log()')).toBeInTheDocument();
      });
    });

    it('should render headers', async () => {
      const content = '# Main Title\n## Subtitle\n### Small Title';
      render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('Main Title')).toBeInTheDocument();
        expect(screen.getByText('Subtitle')).toBeInTheDocument();
        expect(screen.getByText('Small Title')).toBeInTheDocument();
      });
    });

    it('should render safe links', async () => {
      const content = 'Visit [Google](https://google.com) for search';
      render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('Google')).toBeInTheDocument();
      });
      expect(screen.getByText(/Visit/)).toBeInTheDocument();
      expect(screen.getByText(/for search/)).toBeInTheDocument();
    });
  });

  describe('XSS Protection', () => {
    it('should remove script tags', async () => {
      const content = '<script>alert("XSS")</script>';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        // Should not contain the actual script content
        expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
        // Should be completely removed (sanitizer strips dangerous elements)
        expect(container.innerHTML).not.toContain('script');
        expect(container.innerHTML).not.toContain('alert');
      });
    });

    it('should remove event handlers', async () => {
      const content = '<img src="x" onerror="alert(\'XSS\')">';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        // Should not contain dangerous event handlers
        expect(container.innerHTML).not.toContain('onerror');
        expect(container.innerHTML).not.toContain('alert');
      });
    });

    it('should reject javascript: URLs', async () => {
      const content = '[Click me](javascript:alert("XSS"))';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        // Should render the text but not as a dangerous link
        expect(screen.getByText(/Click me/)).toBeInTheDocument();
      });
      // Should not contain javascript: in the HTML
      expect(container.innerHTML).not.toContain('javascript:');
    });

    it('should remove dangerous HTML attributes', async () => {
      const content = '<div onclick="alert(\'XSS\')">Click me</div>';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        // Should not contain any onclick attributes
        expect(container.innerHTML).not.toContain('onclick');
        expect(container.innerHTML).not.toContain('alert');
      });
    });
  });

  describe('Safe HTML Elements', () => {
    it('should allow basic formatting through markdown', async () => {
      const content = '**Bold** and *italic* text';
      render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('Bold')).toBeInTheDocument();
        expect(screen.getByText('italic')).toBeInTheDocument();
      });
    });

    it('should allow code elements through markdown', async () => {
      const content = 'Use `code` for inline code';
      render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('code')).toBeInTheDocument();
      });
    });
  });
});
