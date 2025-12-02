import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import React from 'react';

describe('TextRenderer Security Tests (TM-RN-01)', () => {
  describe('XSS Sanitization', () => {
    it('should sanitize script tags and prevent XSS', async () => {
      const maliciousContent = '<script>alert("XSS")</script>';
      const { container } = render(<MarkdownRenderer markdown={maliciousContent} />);

      await waitFor(
        () => {
          // Should not contain script tags
          expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
          expect(container.querySelector('script')).toBeNull();
        },
        { timeout: 3000 },
      );
    });

    it('should sanitize event handlers and prevent XSS', async () => {
      const maliciousContent = '<img src="x" onerror="alert(\'XSS\')">';
      const { container } = render(<MarkdownRenderer markdown={maliciousContent} />);

      await waitFor(
        () => {
          // The img tag with onerror should be sanitized - either the img is removed
          // or the onerror attribute is stripped
          const img = container.querySelector('img');
          if (img) {
            expect(img.getAttribute('onerror')).toBeNull();
          }
          // If img doesn't exist, that's also safe sanitization
        },
        { timeout: 3000 },
      );
    });

    it('should sanitize javascript: URLs and prevent XSS', async () => {
      const maliciousContent = '<a href="javascript:alert(\'XSS\')">Click me</a>';
      const { container } = render(<MarkdownRenderer markdown={maliciousContent} />);

      await waitFor(
        () => {
          // Should not contain javascript: URLs
          const link = container.querySelector('a');
          if (link) {
            expect(link.getAttribute('href')).not.toContain('javascript:');
          }
        },
        { timeout: 3000 },
      );
    });

    it('should sanitize dangerous HTML attributes', async () => {
      const maliciousContent =
        '<div onclick="alert(\'XSS\')" onload="alert(\'XSS\')">Content</div>';
      const { container } = render(<MarkdownRenderer markdown={maliciousContent} />);

      await waitFor(
        () => {
          // Should not contain event handlers
          const allDivs = container.querySelectorAll('div');
          allDivs.forEach((div) => {
            expect(div.getAttribute('onclick')).toBeNull();
            expect(div.getAttribute('onload')).toBeNull();
          });
        },
        { timeout: 3000 },
      );
    });

    it('should allow safe HTML attributes via markdown links', async () => {
      // Use markdown link syntax which is properly supported
      const safeContent = '[Link](https://example.com)';
      const { container } = render(<MarkdownRenderer markdown={safeContent} />);

      await waitFor(
        () => {
          const link = container.querySelector('a');
          expect(link).toBeInTheDocument();
          expect(link?.getAttribute('href')).toBe('https://example.com');
        },
        { timeout: 3000 },
      );
    });

    it('should sanitize iframe elements', async () => {
      const maliciousContent = '<iframe src="javascript:alert(\'XSS\')"></iframe>';
      const { container } = render(<MarkdownRenderer markdown={maliciousContent} />);

      await waitFor(
        () => {
          // Should not contain iframe elements
          expect(container.querySelector('iframe')).toBeNull();
        },
        { timeout: 3000 },
      );
    });

    it('should sanitize form elements', async () => {
      const maliciousContent = '<form action="javascript:alert(\'XSS\')"><input></form>';
      const { container } = render(<MarkdownRenderer markdown={maliciousContent} />);

      await waitFor(
        () => {
          // Should not contain form elements
          expect(container.querySelector('form')).toBeNull();
          expect(container.querySelector('input')).toBeNull();
        },
        { timeout: 3000 },
      );
    });

    it('should sanitize style attributes with dangerous content', async () => {
      const maliciousContent =
        '<div style="background: url(javascript:alert(\'XSS\'))">Content</div>';
      const { container } = render(<MarkdownRenderer markdown={maliciousContent} />);

      await waitFor(
        () => {
          const allDivs = container.querySelectorAll('div');
          allDivs.forEach((div) => {
            const style = div.getAttribute('style');
            if (style) {
              expect(style).not.toContain('javascript:');
            }
          });
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Safe HTML Elements', () => {
    it('should allow basic formatting elements via markdown', async () => {
      // Use markdown syntax instead of raw HTML
      const content = '**Bold** *Italic* _Emphasis_ **Strong**';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(
        () => {
          expect(screen.getByText('Bold')).toBeInTheDocument();
          expect(screen.getByText('Italic')).toBeInTheDocument();
          expect(screen.getByText('Emphasis')).toBeInTheDocument();
          expect(screen.getByText('Strong')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('should allow code elements via markdown', async () => {
      // Use markdown syntax for code
      const content = '`inline code`\n\n```\ncode block\n```';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(
        () => {
          expect(screen.getByText('inline code')).toBeInTheDocument();
          expect(screen.getByText('code block')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('should allow list elements via markdown', async () => {
      // Use markdown syntax for lists
      const content = '- Item 1\n- Item 2';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(
        () => {
          expect(screen.getByText('Item 1')).toBeInTheDocument();
          expect(screen.getByText('Item 2')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('should allow table elements via markdown', async () => {
      // Use GFM table syntax
      const content = '| Header |\n|--------|\n| Cell |';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(
        () => {
          expect(screen.getByText('Header')).toBeInTheDocument();
          expect(screen.getByText('Cell')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('should allow paragraph and line break elements', async () => {
      const content = 'Paragraph';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(
        () => {
          expect(screen.getByText('Paragraph')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });
});
