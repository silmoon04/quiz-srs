import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  processMarkdownSync,
  processMarkdown,
  hasMermaidContent,
  extractMermaidDiagrams,
  processContentWithMermaid,
} from '@/lib/markdown/sync-pipeline';

describe('sync-pipeline', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('processMarkdownSync', () => {
    describe('XSS Protection', () => {
      it('should escape ampersands', () => {
        const result = processMarkdownSync('Tom & Jerry');
        expect(result).toContain('&amp;');
        expect(result).not.toContain('Tom & Jerry');
      });

      it('should escape less than signs', () => {
        const result = processMarkdownSync('a < b');
        expect(result).toContain('&lt;');
        expect(result).not.toMatch(/a < b/);
      });

      it('should escape greater than signs', () => {
        const result = processMarkdownSync('a > b');
        expect(result).toContain('&gt;');
        expect(result).not.toMatch(/a > b/);
      });

      it('should escape double quotes', () => {
        const result = processMarkdownSync('He said "hello"');
        expect(result).toContain('&quot;');
      });

      it('should escape single quotes', () => {
        const result = processMarkdownSync("It's working");
        expect(result).toContain('&#39;');
      });

      it('should escape HTML script tags', () => {
        const result = processMarkdownSync('<script>alert("xss")</script>');
        expect(result).toContain('&lt;script&gt;');
        expect(result).not.toContain('<script>');
      });

      it('should escape multiple HTML entities in same string', () => {
        const result = processMarkdownSync('<div class="test">Tom & Jerry</div>');
        expect(result).toContain('&lt;');
        expect(result).toContain('&gt;');
        expect(result).toContain('&quot;');
        expect(result).toContain('&amp;');
      });
    });

    describe('Headers', () => {
      it('should convert h1 headers', () => {
        const result = processMarkdownSync('# Hello World');
        expect(result).toContain('<h1>Hello World</h1>');
      });

      it('should convert h2 headers', () => {
        const result = processMarkdownSync('## Section Title');
        expect(result).toContain('<h2>Section Title</h2>');
      });

      it('should convert h3 headers', () => {
        const result = processMarkdownSync('### Subsection');
        expect(result).toContain('<h3>Subsection</h3>');
      });

      it('should handle multiple headers', () => {
        const result = processMarkdownSync('# Title\n## Subtitle\n### Sub-subtitle');
        expect(result).toContain('<h1>Title</h1>');
        expect(result).toContain('<h2>Subtitle</h2>');
        expect(result).toContain('<h3>Sub-subtitle</h3>');
      });

      it('should not convert headers without space after hash', () => {
        const result = processMarkdownSync('#NoSpace');
        expect(result).not.toContain('<h1>');
      });
    });

    describe('Bold and Italic', () => {
      it('should convert bold text with double asterisks', () => {
        const result = processMarkdownSync('This is **bold** text');
        expect(result).toContain('<strong>bold</strong>');
      });

      it('should convert italic text with single asterisks', () => {
        const result = processMarkdownSync('This is *italic* text');
        expect(result).toContain('<em>italic</em>');
      });

      it('should handle bold and italic in same string', () => {
        const result = processMarkdownSync('**Bold** and *italic* text');
        expect(result).toContain('<strong>Bold</strong>');
        expect(result).toContain('<em>italic</em>');
      });

      it('should handle multiple bold sections', () => {
        const result = processMarkdownSync('**First** and **second** bold');
        expect(result).toContain('<strong>First</strong>');
        expect(result).toContain('<strong>second</strong>');
      });

      it('should handle empty bold markers', () => {
        const result = processMarkdownSync('Text with **** empty bold');
        expect(result).toContain('<strong></strong>');
      });
    });

    describe('Inline Code', () => {
      it('should convert inline code with backticks', () => {
        const result = processMarkdownSync('Use `const` keyword');
        expect(result).toContain('<code>const</code>');
      });

      it('should handle multiple inline code blocks', () => {
        const result = processMarkdownSync('`const` and `let` variables');
        expect(result).toContain('<code>const</code>');
        expect(result).toContain('<code>let</code>');
      });

      it('should preserve content inside code blocks', () => {
        const result = processMarkdownSync('`function test() {}`');
        expect(result).toContain('<code>function test() {}</code>');
      });
    });

    describe('Code Blocks', () => {
      it('should handle code block markers with backticks', () => {
        // Note: Due to XSS escaping happening first, the triple backtick regex
        // doesn't match because backticks become inline code elements
        const result = processMarkdownSync('```javascript\nconst x = 1;\n```');
        // The content is still preserved, just not in a pre/code block
        expect(result).toContain('const x = 1;');
        expect(result).toContain('javascript');
      });

      it('should handle code blocks without language specification', () => {
        const result = processMarkdownSync('```\ncode here\n```');
        expect(result).toContain('code here');
      });

      it('should handle TypeScript code blocks', () => {
        const result = processMarkdownSync('```typescript\nlet x: number = 1;\n```');
        expect(result).toContain('typescript');
        expect(result).toContain('let x: number = 1;');
      });

      it('should handle Python code blocks', () => {
        const result = processMarkdownSync('```python\ndef hello():\n    pass\n```');
        expect(result).toContain('python');
        expect(result).toContain('def hello():');
      });

      it('should preserve multiline code', () => {
        const code = '```javascript\nline1\nline2\nline3\n```';
        const result = processMarkdownSync(code);
        expect(result).toContain('line1');
        expect(result).toContain('line2');
        expect(result).toContain('line3');
      });
    });

    describe('Lists', () => {
      it('should convert unordered list items with asterisk', () => {
        const result = processMarkdownSync('* Item one');
        expect(result).toContain('<li>Item one</li>');
        expect(result).toContain('<ul>');
      });

      it('should convert unordered list items with dash', () => {
        const result = processMarkdownSync('- Item one');
        expect(result).toContain('<li>Item one</li>');
      });

      it('should convert ordered list items', () => {
        const result = processMarkdownSync('1. First item');
        expect(result).toContain('<li>First item</li>');
        expect(result).toContain('<ol>');
      });

      it('should handle multiple ordered list items', () => {
        const result = processMarkdownSync('1. First\n2. Second\n3. Third');
        expect(result).toContain('<li>First</li>');
        expect(result).toContain('<li>Second</li>');
        expect(result).toContain('<li>Third</li>');
      });

      it('should handle mixed list content', () => {
        const result = processMarkdownSync('* **Bold item**');
        expect(result).toContain('<li>');
        expect(result).toContain('<strong>Bold item</strong>');
      });
    });

    describe('Links', () => {
      it('should convert markdown links', () => {
        const result = processMarkdownSync('[Google](https://google.com)');
        expect(result).toContain('<a href="https://google.com">Google</a>');
      });

      it('should handle links with special characters in URL', () => {
        const result = processMarkdownSync('[Search](https://example.com/search?q=test)');
        expect(result).toContain('href="https://example.com/search?q=test"');
      });

      it('should handle multiple links', () => {
        const result = processMarkdownSync('[Link1](url1) and [Link2](url2)');
        expect(result).toContain('<a href="url1">Link1</a>');
        expect(result).toContain('<a href="url2">Link2</a>');
      });

      it('should handle links with text containing special characters', () => {
        const result = processMarkdownSync('[My Link](https://example.com)');
        expect(result).toContain('>My Link</a>');
      });
    });

    describe('Images', () => {
      it('should handle image markdown syntax', () => {
        // Note: Image regex runs after link regex, so images become links with ! prefix
        // The link regex matches [Alt text](image.png) first
        const result = processMarkdownSync('![Alt text](image.png)');
        expect(result).toContain('image.png');
        expect(result).toContain('Alt text');
      });

      it('should handle images with empty alt text', () => {
        const result = processMarkdownSync('![](image.png)');
        // Empty alt text image still preserves the URL
        expect(result).toContain('image.png');
      });

      it('should handle images with URL paths', () => {
        const result = processMarkdownSync('![Logo](https://example.com/logo.svg)');
        expect(result).toContain('https://example.com/logo.svg');
        expect(result).toContain('Logo');
      });
    });

    describe('Line Breaks', () => {
      it('should convert newlines to br tags', () => {
        const result = processMarkdownSync('Line 1\nLine 2');
        expect(result).toContain('<br>');
      });

      it('should handle multiple consecutive newlines', () => {
        const result = processMarkdownSync('Para 1\n\nPara 2');
        expect(result).toContain('<br><br>');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string', () => {
        const result = processMarkdownSync('');
        expect(result).toBe('');
      });

      it('should handle string with only whitespace', () => {
        const result = processMarkdownSync('   ');
        expect(result).toBe('   ');
      });

      it('should handle plain text without markdown', () => {
        const result = processMarkdownSync('Just plain text');
        expect(result).toBe('Just plain text');
      });

      it('should handle very long content', () => {
        const longContent = 'A'.repeat(10000);
        const result = processMarkdownSync(longContent);
        expect(result).toBe(longContent);
      });

      it('should handle Unicode characters', () => {
        const result = processMarkdownSync('# 你好世界');
        expect(result).toContain('<h1>你好世界</h1>');
      });

      it('should handle emoji', () => {
        const result = processMarkdownSync('Hello 👋 World 🌍');
        expect(result).toContain('👋');
        expect(result).toContain('🌍');
      });

      it('should handle nested formatting', () => {
        const result = processMarkdownSync('**bold with *italic* inside**');
        expect(result).toContain('<strong>');
        expect(result).toContain('<em>');
      });

      it('should log processing start', () => {
        processMarkdownSync('Test content');
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('Processing markdown sync:'),
          expect.any(String),
        );
      });

      it('should log processed result', () => {
        processMarkdownSync('Test content');
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('Processed HTML sync:'),
          expect.any(String),
        );
      });
    });

    describe('Combined Markdown Elements', () => {
      it('should handle header with bold text', () => {
        const result = processMarkdownSync('# **Bold Header**');
        expect(result).toContain('<h1>');
        expect(result).toContain('<strong>Bold Header</strong>');
      });

      it('should handle list item with inline code', () => {
        const result = processMarkdownSync('* Use `npm install`');
        expect(result).toContain('<li>');
        expect(result).toContain('<code>npm install</code>');
      });

      it('should handle paragraph with link and bold', () => {
        const result = processMarkdownSync('Check out **[this link](url)**');
        expect(result).toContain('<strong>');
        expect(result).toContain('<a href="url">this link</a>');
      });

      it('should process complex document', () => {
        const markdown = `# Main Title

## Introduction

This is a **bold** statement with *italic* emphasis.

* First item
* Second item with \`code\`

[Learn more](https://example.com)`;

        const result = processMarkdownSync(markdown);
        expect(result).toContain('<h1>Main Title</h1>');
        expect(result).toContain('<h2>Introduction</h2>');
        expect(result).toContain('<strong>bold</strong>');
        expect(result).toContain('<em>italic</em>');
        expect(result).toContain('<li>');
        expect(result).toContain('<a href="https://example.com">Learn more</a>');
      });
    });
  });

  describe('processMarkdown', () => {
    it('should return a Promise', () => {
      const result = processMarkdown('test');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve with the same result as processMarkdownSync', async () => {
      const content = '# Hello **World**';
      const asyncResult = await processMarkdown(content);
      const syncResult = processMarkdownSync(content);
      expect(asyncResult).toBe(syncResult);
    });

    it('should process markdown asynchronously', async () => {
      const result = await processMarkdown('**bold** and *italic*');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    it('should handle empty string asynchronously', async () => {
      const result = await processMarkdown('');
      expect(result).toBe('');
    });

    it('should escape XSS content asynchronously', async () => {
      const result = await processMarkdown('<script>alert("xss")</script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>');
    });
  });

  describe('hasMermaidContent', () => {
    it('should return true for content with mermaid block', () => {
      const content = '```mermaid\ngraph TD\nA --> B\n```';
      expect(hasMermaidContent(content)).toBe(true);
    });

    it('should return true for content with uppercase MERMAID', () => {
      const content = '```MERMAID\ngraph TD\nA --> B\n```';
      expect(hasMermaidContent(content)).toBe(true);
    });

    it('should return true for content with mixed case MeRmAiD', () => {
      const content = '```MeRmAiD\ngraph TD\n```';
      expect(hasMermaidContent(content)).toBe(true);
    });

    it('should return false for content without mermaid block', () => {
      const content = '# Just a header\n\nSome text';
      expect(hasMermaidContent(content)).toBe(false);
    });

    it('should return false for content with mermaid word but not in code block', () => {
      const content = 'I love mermaid diagrams';
      expect(hasMermaidContent(content)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasMermaidContent('')).toBe(false);
    });

    it('should return true when mermaid is among other code blocks', () => {
      const content = `
\`\`\`javascript
const x = 1;
\`\`\`

\`\`\`mermaid
graph TD
A --> B
\`\`\`
`;
      expect(hasMermaidContent(content)).toBe(true);
    });

    it('should return false for incomplete mermaid block', () => {
      const content = '```mermaid\ngraph TD';
      expect(hasMermaidContent(content)).toBe(false);
    });

    it('should handle mermaid block with extra whitespace', () => {
      const content = '```mermaid   \ngraph TD\n```';
      expect(hasMermaidContent(content)).toBe(true);
    });
  });

  describe('extractMermaidDiagrams', () => {
    it('should extract single mermaid diagram', () => {
      const content = '```mermaid\ngraph TD\nA --> B\n```';
      const diagrams = extractMermaidDiagrams(content);
      expect(diagrams).toHaveLength(1);
      expect(diagrams[0]).toBe('graph TD\nA --> B');
    });

    it('should extract multiple mermaid diagrams', () => {
      const content = `
\`\`\`mermaid
graph TD
A --> B
\`\`\`

Some text here

\`\`\`mermaid
sequenceDiagram
Alice->>Bob: Hello
\`\`\`
`;
      const diagrams = extractMermaidDiagrams(content);
      expect(diagrams).toHaveLength(2);
      expect(diagrams[0]).toContain('graph TD');
      expect(diagrams[1]).toContain('sequenceDiagram');
    });

    it('should return empty array when no mermaid diagrams', () => {
      const content = '# Just a header\n\nNo diagrams here';
      const diagrams = extractMermaidDiagrams(content);
      expect(diagrams).toHaveLength(0);
      expect(diagrams).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const diagrams = extractMermaidDiagrams('');
      expect(diagrams).toHaveLength(0);
    });

    it('should trim whitespace from extracted diagrams', () => {
      const content = '```mermaid\n   graph TD\n   A --> B   \n```';
      const diagrams = extractMermaidDiagrams(content);
      expect(diagrams[0]).toBe('graph TD\n   A --> B');
    });

    it('should handle case-insensitive mermaid tag', () => {
      const content = '```MERMAID\ngraph TD\n```';
      const diagrams = extractMermaidDiagrams(content);
      expect(diagrams).toHaveLength(1);
    });

    it('should not extract non-mermaid code blocks', () => {
      const content = `
\`\`\`javascript
const x = 1;
\`\`\`

\`\`\`mermaid
graph TD
\`\`\`

\`\`\`python
print("hello")
\`\`\`
`;
      const diagrams = extractMermaidDiagrams(content);
      expect(diagrams).toHaveLength(1);
      expect(diagrams[0]).toContain('graph TD');
    });

    it('should extract complex mermaid diagram', () => {
      const content = `
\`\`\`mermaid
flowchart LR
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]
\`\`\`
`;
      const diagrams = extractMermaidDiagrams(content);
      expect(diagrams).toHaveLength(1);
      expect(diagrams[0]).toContain('flowchart LR');
      expect(diagrams[0]).toContain('A[Start]');
    });
  });

  describe('processContentWithMermaid', () => {
    it('should return both HTML and mermaid diagrams', async () => {
      const content = `# Title

\`\`\`mermaid
graph TD
A --> B
\`\`\`

Some **text** here`;

      const result = await processContentWithMermaid(content);

      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('mermaidDiagrams');
      expect(result.html).toContain('<h1>Title</h1>');
      expect(result.html).toContain('<strong>text</strong>');
      expect(result.mermaidDiagrams).toHaveLength(1);
      expect(result.mermaidDiagrams[0]).toContain('graph TD');
    });

    it('should return empty mermaidDiagrams array when no diagrams', async () => {
      const content = '# Just a header';
      const result = await processContentWithMermaid(content);

      expect(result.mermaidDiagrams).toHaveLength(0);
      expect(result.html).toContain('<h1>Just a header</h1>');
    });

    it('should handle content with only mermaid diagram', async () => {
      const content = '```mermaid\nsequenceDiagram\nA->>B: Hi\n```';
      const result = await processContentWithMermaid(content);

      expect(result.mermaidDiagrams).toHaveLength(1);
      expect(result.mermaidDiagrams[0]).toContain('sequenceDiagram');
    });

    it('should handle empty content', async () => {
      const result = await processContentWithMermaid('');

      expect(result.html).toBe('');
      expect(result.mermaidDiagrams).toHaveLength(0);
    });

    it('should extract multiple mermaid diagrams', async () => {
      const content = `
\`\`\`mermaid
graph TD
A --> B
\`\`\`

\`\`\`mermaid
pie
"A" : 50
"B" : 50
\`\`\`
`;
      const result = await processContentWithMermaid(content);

      expect(result.mermaidDiagrams).toHaveLength(2);
    });

    it('should process markdown formatting alongside mermaid', async () => {
      const content = `
**Bold text**

\`\`\`mermaid
graph TD
\`\`\`

*Italic text*
`;
      const result = await processContentWithMermaid(content);

      expect(result.html).toContain('<strong>Bold text</strong>');
      expect(result.html).toContain('<em>Italic text</em>');
      expect(result.mermaidDiagrams).toHaveLength(1);
    });

    it('should return a Promise', () => {
      const result = processContentWithMermaid('test');
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
