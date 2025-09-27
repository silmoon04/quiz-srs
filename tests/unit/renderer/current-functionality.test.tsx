import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import React from 'react';

describe.skip('Current SecureTextRenderer Functionality', () => {
  describe('Basic Text Rendering', () => {
    it('should render plain text', () => {
      const content = 'This is plain text';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText('This is plain text')).toBeInTheDocument();
      expect(container.querySelector('.secure-text-renderer')).toBeInTheDocument();
    });

    it('should render markdown bold text', () => {
      const content = 'This is **bold text** and normal text';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText(/This is/)).toBeInTheDocument();
      expect(screen.getByText('bold text')).toBeInTheDocument();
      expect(screen.getByText(/and normal text/)).toBeInTheDocument();

      const strongElement = container.querySelector('strong');
      expect(strongElement).toBeInTheDocument();
      expect(strongElement?.textContent).toBe('bold text');
    });

    it('should render markdown italic text', () => {
      const content = 'This is *italic text* and normal text';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText(/This is/)).toBeInTheDocument();
      expect(screen.getByText('italic text')).toBeInTheDocument();
      expect(screen.getByText(/and normal text/)).toBeInTheDocument();

      const emElement = container.querySelector('em');
      expect(emElement).toBeInTheDocument();
      expect(emElement?.textContent).toBe('italic text');
    });

    it('should render inline code', () => {
      const content = 'This is `inline code` and normal text';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText(/This is/)).toBeInTheDocument();
      expect(screen.getByText('inline code')).toBeInTheDocument();
      expect(screen.getByText(/and normal text/)).toBeInTheDocument();

      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement?.textContent).toBe('inline code');
    });

    it('should render headers', () => {
      const content = '# Header 1\n## Header 2\n### Header 3';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText('Header 1')).toBeInTheDocument();
      expect(screen.getByText('Header 2')).toBeInTheDocument();
      expect(screen.getByText('Header 3')).toBeInTheDocument();

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });

    it('should render lists', () => {
      const content = 'Unordered list:\n- Item 1\n- Item 2\n\nOrdered list:\n1. First\n2. Second';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText(/Unordered list:/)).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText(/Ordered list:/)).toBeInTheDocument();
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();

      const ul = container.querySelector('ul');
      const ol = container.querySelector('ol');

      expect(ul).toBeInTheDocument();
      expect(ol).toBeInTheDocument();
    });

    it('should render links safely', () => {
      const content = 'Visit [Google](https://google.com) for search';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText(/Visit/)).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText(/for search/)).toBeInTheDocument();

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link?.getAttribute('href')).toBe('https://google.com');
    });
  });

  describe('Security Features', () => {
    it('should escape script tags', () => {
      const content = '<script>alert("XSS")</script>';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      // Should not contain executable script
      expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
      expect(container.querySelector('script')).toBeNull();

      // Should contain escaped content
      expect(container.innerHTML).toContain('&lt;script&gt;');
    });

    it('should reject javascript: URLs', () => {
      const content = '[Click me](javascript:alert("XSS"))';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      // Should not render as a link, just as text
      expect(screen.getByText(/Click me/)).toBeInTheDocument();
      // Should not contain javascript: in the HTML
      expect(container.innerHTML).not.toContain('javascript:');
    });

    it('should escape event handlers', () => {
      const content = '<img src="x" onerror="alert(\'XSS\')">';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      // Should contain escaped content (the content is detected as raw HTML and escaped)
      expect(container.innerHTML).toContain('&lt;img');
      expect(container.innerHTML).toContain('&gt;');
      // Should not contain actual executable onerror
      expect(container.innerHTML).not.toContain('<img');
    });

    it('should escape dangerous HTML attributes', () => {
      const content = '<div onclick="alert(\'XSS\')">Click me</div>';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      // Should contain escaped content
      expect(container.innerHTML).toContain('&lt;div');
      expect(container.innerHTML).toContain('&gt;');
      // Should not contain actual executable onclick (but the wrapper div is allowed)
      expect(container.innerHTML).not.toContain('onclick=&quot;alert');
    });
  });

  describe('Current Limitations', () => {
    it('should render LaTeX correctly', () => {
      const content = 'The formula is $x = y + z$';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      // Should render LaTeX properly
      expect(screen.getByText(/The formula is/)).toBeInTheDocument();

      // Should have KaTeX elements
      const katexElements = container.querySelectorAll('.katex');
      expect(katexElements.length).toBe(1);
    });

    it('should not render code blocks yet', () => {
      const content = '```javascript\nfunction test() {}\n```';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      // Should render as plain text for now
      expect(screen.getByText(/javascript/)).toBeInTheDocument();

      // Should not have code block elements yet
      const preElement = container.querySelector('pre');
      expect(preElement).toBeNull();
    });

    it('should not render tables yet', () => {
      const content = '| Header | Value |\n|--------|-------|\n| Test   | Data  |';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      // Should render as plain text for now
      expect(screen.getByText(/Header/)).toBeInTheDocument();

      // Should not have table elements yet
      const tableElement = container.querySelector('table');
      expect(tableElement).toBeNull();
    });
  });
});
