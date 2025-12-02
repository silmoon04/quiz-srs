import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import React from 'react';

describe('TextRenderer Markdown Tests (TM-RN-02)', () => {
  describe('Rich Markdown Support', () => {
    it('should render unordered lists correctly', async () => {
      const content = `- Item 1
- Item 2
- Item 3`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('ul')).toBeInTheDocument();
      });
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render ordered lists correctly', async () => {
      const content = `1. First item
2. Second item
3. Third item`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('ol')).toBeInTheDocument();
      });
      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByText('Second item')).toBeInTheDocument();
      expect(screen.getByText('Third item')).toBeInTheDocument();
    });

    it('should render nested lists correctly', async () => {
      const content = `- Main item
  - Sub item 1
  - Sub item 2
- Another main item`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelectorAll('ul').length).toBeGreaterThanOrEqual(1);
      });
      expect(screen.getByText('Main item')).toBeInTheDocument();
      expect(screen.getByText('Sub item 1')).toBeInTheDocument();
      expect(screen.getByText('Sub item 2')).toBeInTheDocument();
    });

    it('should render tables correctly', async () => {
      const content = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('table')).toBeInTheDocument();
      });

      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
      expect(screen.getByText('Header 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
    });

    it('should render inline code correctly', async () => {
      const content = 'This is `inline code` in a sentence.';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('code')).toBeInTheDocument();
      });
      expect(container.querySelector('code')?.textContent).toBe('inline code');
    });

    it('should render code blocks correctly', async () => {
      const content = `\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\``;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('pre')).toBeInTheDocument();
      });

      const code = container.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code?.textContent).toContain('function hello()');
    });

    it('should render bold text correctly', async () => {
      const content = 'This is **bold text** and __also bold__.';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelectorAll('strong').length).toBe(2);
      });
      const strongElements = container.querySelectorAll('strong');
      expect(strongElements[0].textContent).toBe('bold text');
      expect(strongElements[1].textContent).toBe('also bold');
    });

    it('should render italic text correctly', async () => {
      const content = 'This is *italic text* and _also italic_.';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelectorAll('em').length).toBe(2);
      });
      const emElements = container.querySelectorAll('em');
      expect(emElements[0].textContent).toBe('italic text');
      expect(emElements[1].textContent).toBe('also italic');
    });

    it('should render links correctly', async () => {
      const content = '[Link text](https://example.com)';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('a')).toBeInTheDocument();
      });
      const link = container.querySelector('a');
      expect(link?.getAttribute('href')).toBe('https://example.com');
      expect(link?.textContent).toBe('Link text');
    });

    it('should render images correctly', async () => {
      const content = '![Alt text](https://example.com/image.jpg)';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('img')).toBeInTheDocument();
      });
      const img = container.querySelector('img');
      expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg');
      expect(img?.getAttribute('alt')).toBe('Alt text');
    });

    it('should render blockquotes correctly', async () => {
      const content = `> This is a blockquote
> with multiple lines`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('blockquote')).toBeInTheDocument();
      });
      expect(container.querySelector('blockquote')?.textContent).toContain('This is a blockquote');
    });

    it('should render horizontal rules correctly', async () => {
      const content = `Line above

---

Line below`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('hr')).toBeInTheDocument();
      });
    });

    it('should render strikethrough text correctly', async () => {
      const content = 'This is ~~strikethrough~~ text.';
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelector('del')).toBeInTheDocument();
      });
      expect(container.querySelector('del')?.textContent).toBe('strikethrough');
    });

    it('should render task lists correctly', async () => {
      const content = `- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task`;
      const { container } = render(<MarkdownRenderer markdown={content} />);

      await waitFor(() => {
        expect(container.querySelectorAll('input[type="checkbox"]').length).toBe(3);
      });

      const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
      expect(checkedBoxes.length).toBe(2);
    });
  });

  describe('Complex Markdown Combinations', () => {
    it('should handle mixed content with lists, code, and formatting', async () => {
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

      // Wait for initial render
      await waitFor(() => {
        expect(container.querySelector('ol')).toBeInTheDocument();
      });

      // Check for various elements
      expect(container.querySelector('ul')).toBeInTheDocument();
      expect(container.querySelector('pre')).toBeInTheDocument();
      expect(container.querySelector('blockquote')).toBeInTheDocument();
      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.querySelector('em')).toBeInTheDocument();
      expect(container.querySelector('code')).toBeInTheDocument();
    });
  });
});
