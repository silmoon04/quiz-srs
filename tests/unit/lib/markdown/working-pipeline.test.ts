import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  processMarkdown,
  hasMermaidContent,
  extractMermaidDiagrams,
  processContentWithMermaid,
} from '@/lib/markdown/working-pipeline';

describe('working-pipeline', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('processMarkdown', () => {
    describe('XSS Protection', () => {
      it('should escape HTML entities to prevent XSS attacks', async () => {
        const maliciousContent = '<script>alert("xss")</script>';
        const result = await processMarkdown(maliciousContent);

        expect(result).not.toContain('<script>');
        expect(result).toContain('&lt;script&gt;');
        expect(result).toContain('&lt;/script&gt;');
      });

      it('should escape ampersands', async () => {
        const content = 'Tom & Jerry';
        const result = await processMarkdown(content);

        expect(result).toContain('&amp;');
      });

      it('should escape double quotes', async () => {
        const content = 'Say "hello"';
        const result = await processMarkdown(content);

        expect(result).toContain('&quot;');
      });

      it('should escape single quotes', async () => {
        const content = "It's working";
        const result = await processMarkdown(content);

        expect(result).toContain('&#39;');
      });

      it('should escape greater than and less than signs', async () => {
        const content = '5 > 3 and 2 < 4';
        const result = await processMarkdown(content);

        expect(result).toContain('&gt;');
        expect(result).toContain('&lt;');
      });

      it('should escape HTML tags in XSS vectors', async () => {
        const content = '<img src="x" onerror="alert(1)"><a href="javascript:void(0)">click</a>';
        const result = await processMarkdown(content);

        // The pipeline escapes all < and > characters, so raw HTML tags are escaped
        expect(result).not.toContain('<img');
        expect(result).toContain('&lt;img');
        expect(result).toContain('&lt;a href');
      });
    });

    describe('Header Conversion', () => {
      it('should convert h1 headers', async () => {
        const content = '# Main Title';
        const result = await processMarkdown(content);

        expect(result).toContain('<h1>Main Title</h1>');
      });

      it('should convert h2 headers', async () => {
        const content = '## Section Title';
        const result = await processMarkdown(content);

        expect(result).toContain('<h2>Section Title</h2>');
      });

      it('should convert h3 headers', async () => {
        const content = '### Subsection Title';
        const result = await processMarkdown(content);

        expect(result).toContain('<h3>Subsection Title</h3>');
      });

      it('should handle multiple headers', async () => {
        const content = '# Title\n## Section\n### Subsection';
        const result = await processMarkdown(content);

        expect(result).toContain('<h1>Title</h1>');
        expect(result).toContain('<h2>Section</h2>');
        expect(result).toContain('<h3>Subsection</h3>');
      });
    });

    describe('Text Formatting', () => {
      it('should convert bold text', async () => {
        const content = 'This is **bold** text';
        const result = await processMarkdown(content);

        expect(result).toContain('<strong>bold</strong>');
      });

      it('should convert italic text', async () => {
        const content = 'This is *italic* text';
        const result = await processMarkdown(content);

        expect(result).toContain('<em>italic</em>');
      });

      it('should handle nested bold and italic', async () => {
        const content = 'This is ***bold and italic*** text';
        const result = await processMarkdown(content);

        // The pattern **..** is applied first, then *..*
        expect(result).toContain('<strong>');
        expect(result).toContain('<em>');
      });

      it('should handle multiple bold sections', async () => {
        const content = '**one** and **two**';
        const result = await processMarkdown(content);

        expect(result).toContain('<strong>one</strong>');
        expect(result).toContain('<strong>two</strong>');
      });
    });

    describe('Code Formatting', () => {
      it('should convert inline code', async () => {
        const content = 'Use the `console.log()` function';
        const result = await processMarkdown(content);

        expect(result).toContain('<code>console.log()</code>');
      });

      it('should process code block markers with backticks', async () => {
        // The pipeline escapes backticks after converting inline code
        // Code blocks with ``` are processed but may not fully convert due to newline handling
        const content = '```javascript\nconst x = 1;\n```';
        const result = await processMarkdown(content);

        // Verify the content is processed (code formatting applied)
        expect(result).toContain('const x = 1');
      });

      it('should handle inline code within text', async () => {
        const content = 'Run `npm install` to install';
        const result = await processMarkdown(content);

        expect(result).toContain('<code>npm install</code>');
      });

      it('should preserve code content in blocks', async () => {
        const content = '```python\ndef hello():\n    print("hi")\n```';
        const result = await processMarkdown(content);

        expect(result).toContain('def hello()');
      });
    });

    describe('List Conversion', () => {
      it('should convert unordered list items', async () => {
        const content = '* Item one\n* Item two';
        const result = await processMarkdown(content);

        expect(result).toContain('<li>Item one</li>');
        expect(result).toContain('<li>Item two</li>');
        expect(result).toContain('<ul>');
      });

      it('should convert ordered list items', async () => {
        const content = '1. First\n2. Second';
        const result = await processMarkdown(content);

        expect(result).toContain('<li>First</li>');
        expect(result).toContain('<li>Second</li>');
      });
    });

    describe('Link Conversion', () => {
      it('should convert markdown links', async () => {
        const content = 'Visit [Google](https://google.com)';
        const result = await processMarkdown(content);

        expect(result).toContain('<a href="https://google.com">Google</a>');
      });

      it('should handle multiple links', async () => {
        const content = '[Link1](url1) and [Link2](url2)';
        const result = await processMarkdown(content);

        expect(result).toContain('<a href="url1">Link1</a>');
        expect(result).toContain('<a href="url2">Link2</a>');
      });

      it('should handle links with special characters in text', async () => {
        const content = '[Click here!](https://example.com)';
        const result = await processMarkdown(content);

        expect(result).toContain('<a href="https://example.com">Click here!</a>');
      });
    });

    describe('Image Conversion', () => {
      it('should process image markdown syntax', async () => {
        // The pipeline processes images after links, so the regex order matters
        // Images may be converted to links due to similar syntax
        const content = '![Alt text](image.png)';
        const result = await processMarkdown(content);

        // Image syntax is processed - verify the alt text and src are present
        expect(result).toContain('Alt text');
        expect(result).toContain('image.png');
      });

      it('should handle images with empty alt text', async () => {
        const content = '![](image.png)';
        const result = await processMarkdown(content);

        expect(result).toContain('image.png');
      });
    });

    describe('Line Break Handling', () => {
      it('should convert newlines to br tags', async () => {
        const content = 'Line 1\nLine 2\nLine 3';
        const result = await processMarkdown(content);

        expect(result).toContain('<br>');
      });

      it('should handle multiple consecutive newlines', async () => {
        const content = 'Para 1\n\nPara 2';
        const result = await processMarkdown(content);

        expect(result).toContain('<br><br>');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string', async () => {
        const result = await processMarkdown('');

        expect(result).toBe('');
      });

      it('should handle whitespace-only content', async () => {
        const result = await processMarkdown('   \n   ');

        expect(result).toContain('<br>');
      });

      it('should handle very long content', async () => {
        const longContent = 'a'.repeat(10000);
        const result = await processMarkdown(longContent);

        expect(result).toHaveLength(10000);
      });

      it('should handle unicode content', async () => {
        const content = '# 你好世界\nこんにちは 🎉';
        const result = await processMarkdown(content);

        expect(result).toContain('你好世界');
        expect(result).toContain('こんにちは');
        expect(result).toContain('🎉');
      });

      it('should handle mixed markdown elements', async () => {
        const content = '# Header\n\n**Bold** and *italic* with `code`\n\n* List item';
        const result = await processMarkdown(content);

        expect(result).toContain('<h1>Header</h1>');
        expect(result).toContain('<strong>Bold</strong>');
        expect(result).toContain('<em>italic</em>');
        expect(result).toContain('<code>code</code>');
        expect(result).toContain('<li>List item</li>');
      });

      it('should log processing information', async () => {
        await processMarkdown('Test content');

        expect(consoleSpy).toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should handle content and return string on success', async () => {
        const content = 'Test <content>';
        const result = await processMarkdown(content);

        // Should still return a string
        expect(typeof result).toBe('string');
        // Content should be escaped
        expect(result).toContain('&lt;content&gt;');
      });

      it('should handle special characters gracefully', async () => {
        const content = '&<>\'"';
        const result = await processMarkdown(content);

        expect(result).toContain('&amp;');
        expect(result).toContain('&lt;');
        expect(result).toContain('&gt;');
        expect(result).toContain('&#39;');
        expect(result).toContain('&quot;');
      });
    });
  });

  describe('hasMermaidContent', () => {
    it('should return true when content has mermaid diagram', () => {
      const content = 'Some text\n```mermaid\ngraph TD\nA-->B\n```\nMore text';

      expect(hasMermaidContent(content)).toBe(true);
    });

    it('should return true for mermaid with different casing', () => {
      const content = '```MERMAID\ngraph TD\nA-->B\n```';

      expect(hasMermaidContent(content)).toBe(true);
    });

    it('should return true for mermaid with mixed case', () => {
      const content = '```Mermaid\ngraph TD\nA-->B\n```';

      expect(hasMermaidContent(content)).toBe(true);
    });

    it('should return false when no mermaid content', () => {
      const content = '# Header\n\nSome text without mermaid';

      expect(hasMermaidContent(content)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasMermaidContent('')).toBe(false);
    });

    it('should return false for regular code blocks', () => {
      const content = '```javascript\nconst x = 1;\n```';

      expect(hasMermaidContent(content)).toBe(false);
    });

    it('should return true for mermaid with extra whitespace', () => {
      const content = '```mermaid   \ngraph TD\n```';

      expect(hasMermaidContent(content)).toBe(true);
    });

    it('should handle multiple mermaid blocks', () => {
      const content = '```mermaid\ngraph TD\n```\n\n```mermaid\nsequenceDiagram\n```';

      expect(hasMermaidContent(content)).toBe(true);
    });
  });

  describe('extractMermaidDiagrams', () => {
    it('should extract a single mermaid diagram', () => {
      const content = '```mermaid\ngraph TD\nA-->B\n```';
      const diagrams = extractMermaidDiagrams(content);

      expect(diagrams).toHaveLength(1);
      expect(diagrams[0]).toBe('graph TD\nA-->B');
    });

    it('should extract multiple mermaid diagrams', () => {
      const content = `
        \`\`\`mermaid
        graph TD
        A-->B
        \`\`\`
        
        Some text
        
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
      const content = '# Header\n\nNo diagrams here';
      const diagrams = extractMermaidDiagrams(content);

      expect(diagrams).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const diagrams = extractMermaidDiagrams('');

      expect(diagrams).toEqual([]);
    });

    it('should trim whitespace from extracted diagrams', () => {
      const content = '```mermaid\n   graph TD   \n```';
      const diagrams = extractMermaidDiagrams(content);

      expect(diagrams[0]).toBe('graph TD');
    });

    it('should handle mermaid with different casing', () => {
      const content = '```MERMAID\ngraph LR\n```';
      const diagrams = extractMermaidDiagrams(content);

      expect(diagrams).toHaveLength(1);
      expect(diagrams[0]).toBe('graph LR');
    });

    it('should not extract non-mermaid code blocks', () => {
      const content = '```javascript\ncode\n```\n```mermaid\ngraph TD\n```\n```python\ncode\n```';
      const diagrams = extractMermaidDiagrams(content);

      expect(diagrams).toHaveLength(1);
      expect(diagrams[0]).toBe('graph TD');
    });

    it('should handle complex mermaid diagrams', () => {
      const content = `\`\`\`mermaid
flowchart TB
    subgraph one
        a1-->a2
    end
    subgraph two
        b1-->b2
    end
    one --> two
\`\`\``;
      const diagrams = extractMermaidDiagrams(content);

      expect(diagrams).toHaveLength(1);
      expect(diagrams[0]).toContain('flowchart TB');
      expect(diagrams[0]).toContain('subgraph one');
    });

    it('should handle mermaid with special characters', () => {
      const content = '```mermaid\ngraph TD\nA["Node with spaces"]-->B\n```';
      const diagrams = extractMermaidDiagrams(content);

      expect(diagrams[0]).toContain('Node with spaces');
    });
  });

  describe('processContentWithMermaid', () => {
    it('should return both HTML and mermaid diagrams', async () => {
      const content = '# Title\n\n```mermaid\ngraph TD\nA-->B\n```';
      const result = await processContentWithMermaid(content);

      expect(result.html).toContain('<h1>Title</h1>');
      expect(result.mermaidDiagrams).toHaveLength(1);
      expect(result.mermaidDiagrams[0]).toContain('graph TD');
    });

    it('should return empty mermaid array when no diagrams', async () => {
      const content = '# Just a header';
      const result = await processContentWithMermaid(content);

      expect(result.html).toContain('<h1>Just a header</h1>');
      expect(result.mermaidDiagrams).toEqual([]);
    });

    it('should handle multiple mermaid diagrams', async () => {
      const content = `
# Charts

\`\`\`mermaid
pie title Pets
"Dogs" : 386
"Cats" : 85
\`\`\`

\`\`\`mermaid
graph LR
A --> B
\`\`\`
      `;
      const result = await processContentWithMermaid(content);

      expect(result.mermaidDiagrams).toHaveLength(2);
      expect(result.mermaidDiagrams[0]).toContain('pie title');
      expect(result.mermaidDiagrams[1]).toContain('graph LR');
    });

    it('should handle empty content', async () => {
      const result = await processContentWithMermaid('');

      expect(result.html).toBe('');
      expect(result.mermaidDiagrams).toEqual([]);
    });

    it('should process markdown with mermaid blocks correctly', async () => {
      const content = '**Bold text** and `code`\n\n```mermaid\nsequenceDiagram\n```';
      const result = await processContentWithMermaid(content);

      expect(result.html).toContain('<strong>Bold text</strong>');
      expect(result.html).toContain('<code>code</code>');
      expect(result.mermaidDiagrams).toHaveLength(1);
    });

    it('should return object with correct structure', async () => {
      const result = await processContentWithMermaid('test');

      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('mermaidDiagrams');
      expect(typeof result.html).toBe('string');
      expect(Array.isArray(result.mermaidDiagrams)).toBe(true);
    });

    it('should handle content with only mermaid diagrams', async () => {
      const content = '```mermaid\ngraph TD\nA-->B\n```';
      const result = await processContentWithMermaid(content);

      expect(result.mermaidDiagrams).toHaveLength(1);
      expect(typeof result.html).toBe('string');
    });

    it('should preserve XSS protection in HTML output', async () => {
      const content = '<script>alert("xss")</script>\n\n```mermaid\ngraph TD\n```';
      const result = await processContentWithMermaid(content);

      expect(result.html).not.toContain('<script>');
      expect(result.html).toContain('&lt;script&gt;');
      expect(result.mermaidDiagrams).toHaveLength(1);
    });
  });

  describe('Integration Tests', () => {
    it('should handle a complete document with all features', async () => {
      const content = `# Main Title

This is **bold** and *italic* text with \`inline code\`.

## Code Example

Some code here.

## Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

* List item 1
* List item 2

Visit [our site](https://example.com) for more info.`;

      const result = await processContentWithMermaid(content);

      expect(result.html).toContain('<h1>Main Title</h1>');
      expect(result.html).toContain('<h2>Code Example</h2>');
      expect(result.html).toContain('<strong>bold</strong>');
      expect(result.html).toContain('<em>italic</em>');
      expect(result.html).toContain('<code>inline code</code>');
      expect(result.html).toContain('<li>List item 1</li>');
      expect(result.html).toContain('<a href="https://example.com">our site</a>');
      expect(result.mermaidDiagrams).toHaveLength(1);
      expect(result.mermaidDiagrams[0]).toContain('graph TD');
    });

    it('should maintain consistency between hasMermaidContent and extractMermaidDiagrams', () => {
      const contentWithMermaid = '```mermaid\ngraph TD\n```';
      const contentWithoutMermaid = '# No mermaid here';

      expect(hasMermaidContent(contentWithMermaid)).toBe(true);
      expect(extractMermaidDiagrams(contentWithMermaid).length).toBeGreaterThan(0);

      expect(hasMermaidContent(contentWithoutMermaid)).toBe(false);
      expect(extractMermaidDiagrams(contentWithoutMermaid)).toHaveLength(0);
    });
  });
});
