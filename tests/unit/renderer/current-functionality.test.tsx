import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import React from 'react';

describe('Current SecureTextRenderer Functionality', () => {
  describe('Basic Text Rendering', () => {
    it('should render plain text', async () => {
      const content = 'This is plain text';
      render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('This is plain text')).toBeInTheDocument();
      });
    });

    it('should render markdown bold text', async () => {
      const content = 'This is **bold text** and normal text';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('bold text')).toBeInTheDocument();
      });

      const strongElement = container.querySelector('strong');
      expect(strongElement).toBeInTheDocument();
      expect(strongElement?.textContent).toBe('bold text');
    });

    it('should render markdown italic text', async () => {
      const content = 'This is *italic text* and normal text';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('italic text')).toBeInTheDocument();
      });

      const emElement = container.querySelector('em');
      expect(emElement).toBeInTheDocument();
      expect(emElement?.textContent).toBe('italic text');
    });

    it('should render inline code', async () => {
      const content = 'This is `inline code` and normal text';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('inline code')).toBeInTheDocument();
      });

      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement?.textContent).toBe('inline code');
    });

    it('should render headers', async () => {
      const content = '# Header 1\n## Header 2\n### Header 3';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('h1')).toBeInTheDocument();
      });

      expect(screen.getByText('Header 1')).toBeInTheDocument();
      expect(screen.getByText('Header 2')).toBeInTheDocument();
      expect(screen.getByText('Header 3')).toBeInTheDocument();

      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelector('h3')).toBeInTheDocument();
    });

    it('should render lists', async () => {
      const content = 'Unordered list:\n- Item 1\n- Item 2\n\nOrdered list:\n1. First\n2. Second';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('ul')).toBeInTheDocument();
      });

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();

      expect(container.querySelector('ol')).toBeInTheDocument();
    });

    it('should render links safely', async () => {
      const content = 'Visit [Google](https://google.com) for search';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('Google')).toBeInTheDocument();
      });

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link?.getAttribute('href')).toBe('https://google.com');
    });
  });

  describe('Security Features', () => {
    it('should sanitize script tags', async () => {
      const content = '<script>alert("XSS")</script>';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        // Should not contain executable script element
        expect(container.querySelector('script')).toBeNull();
      });
    });

    it('should reject javascript: URLs', async () => {
      const content = '[Click me](javascript:alert("XSS"))';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(screen.getByText('Click me')).toBeInTheDocument();
      });

      // Should not contain javascript: in the HTML
      expect(container.innerHTML).not.toContain('javascript:');
    });

    it('should sanitize event handlers on images', async () => {
      const content = '<img src="x" onerror="alert(\'XSS\')">';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });

      // The sanitizer should either remove the image or strip the onerror
      const img = container.querySelector('img');
      if (img) {
        expect(img.getAttribute('onerror')).toBeNull();
      }
    });

    it('should sanitize dangerous HTML attributes', async () => {
      const content = '<div onclick="alert(\'XSS\')">Click me</div>';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });

      // Divs should have onclick removed if present
      const divs = container.querySelectorAll('div');
      divs.forEach((div) => {
        expect(div.getAttribute('onclick')).toBeNull();
      });
    });
  });

  describe('Advanced Features', () => {
    it('should render LaTeX correctly', async () => {
      const content = 'The formula is $x = y + z$';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        const katexElements = container.querySelectorAll('.katex');
        expect(katexElements.length).toBe(1);
      });
    });

    it('should render code blocks', async () => {
      const content = '```javascript\nfunction test() {}\n```';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        const preElement = container.querySelector('pre');
        expect(preElement).toBeInTheDocument();
      });

      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement?.textContent).toContain('function test()');
    });

    it('should render tables', async () => {
      const content = '| Header | Value |\n|--------|-------|\n| Test   | Data  |';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        const tableElement = container.querySelector('table');
        expect(tableElement).toBeInTheDocument();
      });

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Data')).toBeInTheDocument();
    });
  });
});
