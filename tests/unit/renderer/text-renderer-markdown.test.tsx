import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import React from 'react';

describe.skip('TextRenderer Markdown Tests (TM-RN-02)', () => {
  describe('Rich Markdown Support', () => {
    it('should render unordered lists correctly', () => {
      const content = `- Item 1
- Item 2
- Item 3`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render ordered lists correctly', () => {
      const content = `1. First item
2. Second item
3. Third item`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const list = container.querySelector('ol');
      expect(list).toBeInTheDocument();
      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByText('Second item')).toBeInTheDocument();
      expect(screen.getByText('Third item')).toBeInTheDocument();
    });

    it('should render nested lists correctly', () => {
      const content = `- Main item
  - Sub item 1
  - Sub item 2
- Another main item`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const lists = container.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(1); // Should have nested lists
      expect(screen.getByText('Main item')).toBeInTheDocument();
      expect(screen.getByText('Sub item 1')).toBeInTheDocument();
      expect(screen.getByText('Sub item 2')).toBeInTheDocument();
    });

    it('should render tables correctly', () => {
      const content = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();

      const thead = container.querySelector('thead');
      expect(thead).toBeInTheDocument();

      const tbody = container.querySelector('tbody');
      expect(tbody).toBeInTheDocument();

      expect(screen.getByText('Header 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
    });

    it('should render inline code correctly', () => {
      const content = 'This is `inline code` in a sentence.';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const code = container.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code?.textContent).toBe('inline code');
    });

    it('should render code blocks correctly', () => {
      const content = `\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\``;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const pre = container.querySelector('pre');
      expect(pre).toBeInTheDocument();

      const code = container.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code?.textContent).toContain('function hello()');
    });

    it('should render bold text correctly', () => {
      const content = 'This is **bold text** and __also bold__.';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const strongElements = container.querySelectorAll('strong');
      expect(strongElements.length).toBe(2);
      expect(strongElements[0].textContent).toBe('bold text');
      expect(strongElements[1].textContent).toBe('also bold');
    });

    it('should render italic text correctly', () => {
      const content = 'This is *italic text* and _also italic_.';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const emElements = container.querySelectorAll('em');
      expect(emElements.length).toBe(2);
      expect(emElements[0].textContent).toBe('italic text');
      expect(emElements[1].textContent).toBe('also italic');
    });

    it('should render links correctly', () => {
      const content = '[Link text](https://example.com)';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link?.getAttribute('href')).toBe('https://example.com');
      expect(link?.textContent).toBe('Link text');
    });

    it('should render images correctly', () => {
      const content = '![Alt text](https://example.com/image.jpg)';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg');
      expect(img?.getAttribute('alt')).toBe('Alt text');
    });

    it('should render blockquotes correctly', () => {
      const content = `> This is a blockquote
> with multiple lines`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const blockquote = container.querySelector('blockquote');
      expect(blockquote).toBeInTheDocument();
      expect(blockquote?.textContent).toContain('This is a blockquote');
    });

    it('should render horizontal rules correctly', () => {
      const content = `Line above

---

Line below`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const hr = container.querySelector('hr');
      expect(hr).toBeInTheDocument();
    });

    it('should render strikethrough text correctly', () => {
      const content = 'This is ~~strikethrough~~ text.';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const del = container.querySelector('del');
      expect(del).toBeInTheDocument();
      expect(del?.textContent).toBe('strikethrough');
    });

    it('should render task lists correctly', () => {
      const content = `- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(3);

      const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
      expect(checkedBoxes.length).toBe(2);
    });
  });

  describe('Complex Markdown Combinations', () => {
    it('should handle mixed content with lists, code, and formatting', () => {
      const content = `Here's a **complex** example:

1. First item with \`inline code\`
2. Second item with *italic* text
   - Nested item
   - Another nested item

\`\`\`javascript
// Code block
function example() {
  return "Hello";
}
\`\`\`

> This is a blockquote with **bold** text.`;

      const { container } = render(<MarkdownRenderer markdown={content} />);

      // Check for various elements
      expect(container.querySelector('ol')).toBeInTheDocument();
      expect(container.querySelector('ul')).toBeInTheDocument();
      expect(container.querySelector('pre')).toBeInTheDocument();
      expect(container.querySelector('blockquote')).toBeInTheDocument();
      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.querySelector('em')).toBeInTheDocument();
      expect(container.querySelector('code')).toBeInTheDocument();
    });
  });
});
