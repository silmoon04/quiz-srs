import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SecureTextRenderer } from '@/components/secure-text-renderer';
import React from 'react';

describe('TextRenderer Security Tests (TM-RN-01)', () => {
  describe('XSS Sanitization', () => {
    it('should sanitize script tags and prevent XSS', () => {
      const maliciousContent = '<script>alert("XSS")</script>';
      const { container } = render(<SecureTextRenderer content={maliciousContent} />);

      // Should not contain script tags
      expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
      expect(container.querySelector('script')).toBeNull();
    });

    it('should sanitize event handlers and prevent XSS', () => {
      const maliciousContent = '<img src="x" onerror="alert(\'XSS\')">';
      const { container } = render(<SecureTextRenderer content={maliciousContent} />);

      // Should not contain onerror attributes
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument(); // Should still be there but safe
      expect(img?.getAttribute('onerror')).toBeNull(); // But without dangerous attributes
    });

    it('should sanitize javascript: URLs and prevent XSS', () => {
      const maliciousContent = '<a href="javascript:alert(\'XSS\')">Click me</a>';
      const { container } = render(<SecureTextRenderer content={maliciousContent} />);

      // Should not contain javascript: URLs
      const link = container.querySelector('a');
      if (link) {
        expect(link.getAttribute('href')).not.toContain('javascript:');
      }
    });

    it('should sanitize dangerous HTML attributes', () => {
      const maliciousContent =
        '<div onclick="alert(\'XSS\')" onload="alert(\'XSS\')">Content</div>';
      const { container } = render(<SecureTextRenderer content={maliciousContent} />);

      // Should not contain event handlers
      const div = container.querySelector('div');
      if (div) {
        expect(div.getAttribute('onclick')).toBeNull();
        expect(div.getAttribute('onload')).toBeNull();
      }
    });

    it('should allow safe HTML attributes', () => {
      const safeContent = '<a href="https://example.com" title="Safe link">Link</a>';
      const { container } = render(<SecureTextRenderer content={safeContent} />);

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link?.getAttribute('href')).toBe('https://example.com');
      expect(link?.getAttribute('title')).toBe('Safe link');
    });

    it('should sanitize iframe elements', () => {
      const maliciousContent = '<iframe src="javascript:alert(\'XSS\')"></iframe>';
      const { container } = render(<SecureTextRenderer content={maliciousContent} />);

      // Should not contain iframe elements
      expect(container.querySelector('iframe')).toBeNull();
    });

    it('should sanitize form elements', () => {
      const maliciousContent = '<form action="javascript:alert(\'XSS\')"><input></form>';
      const { container } = render(<SecureTextRenderer content={maliciousContent} />);

      // Should not contain form elements
      expect(container.querySelector('form')).toBeNull();
      expect(container.querySelector('input')).toBeNull();
    });

    it('should sanitize style attributes with dangerous content', () => {
      const maliciousContent =
        '<div style="background: url(javascript:alert(\'XSS\'))">Content</div>';
      const { container } = render(<SecureTextRenderer content={maliciousContent} />);

      const div = container.querySelector('div');
      if (div) {
        const style = div.getAttribute('style');
        if (style) {
          expect(style).not.toContain('javascript:');
        }
      }
    });
  });

  describe('Safe HTML Elements', () => {
    it('should allow basic formatting elements', () => {
      const content = '<b>Bold</b> <i>Italic</i> <em>Emphasis</em> <strong>Strong</strong>';
      render(<SecureTextRenderer content={content} />);

      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('Italic')).toBeInTheDocument();
      expect(screen.getByText('Emphasis')).toBeInTheDocument();
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    it('should allow code elements', () => {
      const content = '<code>inline code</code> <pre>code block</pre>';
      render(<SecureTextRenderer content={content} />);

      expect(screen.getByText('inline code')).toBeInTheDocument();
      expect(screen.getByText('code block')).toBeInTheDocument();
    });

    it('should allow list elements', () => {
      const content = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      render(<SecureTextRenderer content={content} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should allow table elements', () => {
      const content =
        '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
      render(<SecureTextRenderer content={content} />);

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Cell')).toBeInTheDocument();
    });

    it('should allow paragraph and line break elements', () => {
      const content = '<p>Paragraph</p><br>';
      render(<SecureTextRenderer content={content} />);

      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });
  });
});
