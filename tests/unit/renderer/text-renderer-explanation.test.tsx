import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock the markdown pipeline
vi.mock('@/lib/markdown/pipeline', () => ({
  processMarkdown: vi.fn(),
  processMarkdownSync: vi.fn(),
}));

import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import { processMarkdownSync } from '@/lib/markdown/pipeline';

const mockProcessMarkdownSync = processMarkdownSync as ReturnType<typeof vi.fn>;

describe('TextRenderer Explanation Mapping Tests (TM-RN-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default behavior: wrap in p tag
    mockProcessMarkdownSync.mockImplementation((text: string) => `<p>${text}</p>`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Explanation Content Stability', () => {
    it('should preserve explanation text exactly', async () => {
      const explanation = 'This is a detailed explanation with **bold text** and `code`.';
      mockProcessMarkdownSync.mockReturnValue(
        '<p>This is a detailed explanation with <strong>bold text</strong> and <code>code</code>.</p>',
      );

      render(<MarkdownRenderer markdown={explanation} />);

      await waitFor(() => {
        expect(screen.getByText(/This is a detailed explanation with/)).toBeInTheDocument();
      });
      expect(screen.getByText('bold text')).toBeInTheDocument();
      expect(screen.getByText('code')).toBeInTheDocument();
    });

    it('should preserve explanation with LaTeX', async () => {
      const explanation = 'The formula is $x = y + z$ and the result is $\\alpha$.';
      mockProcessMarkdownSync.mockReturnValue(
        '<p>The formula is <span class="katex">x = y + z</span> and the result is <span class="katex">α</span>.</p>',
      );

      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      // Should contain the text parts
      await waitFor(() => {
        expect(screen.getByText(/The formula is/)).toBeInTheDocument();
      });
      expect(screen.getByText(/and the result is/)).toBeInTheDocument();

      // Should contain LaTeX elements (rehype-katex uses .katex class)
      const katexElements = container.querySelectorAll('.katex');
      expect(katexElements.length).toBe(2);
    });

    it('should preserve explanation with code blocks', async () => {
      const explanation = `Here's the algorithm:

\`\`\`javascript
function calculate(x) {
  return x * 2;
}
\`\`\`

This explains the calculation.`;

      mockProcessMarkdownSync.mockReturnValue(
        `<p>Here's the algorithm:</p>
         <pre><code class="language-javascript">function calculate(x) {
  return x * 2;
}</code></pre>
         <p>This explains the calculation.</p>`,
      );

      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      await waitFor(() => {
        expect(screen.getByText(/Here's the algorithm:/)).toBeInTheDocument();
      });
      expect(screen.getByText(/This explains the calculation./)).toBeInTheDocument();

      const codeBlock = container.querySelector('pre code');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock?.textContent).toContain('function calculate(x)');
    });

    it('should preserve explanation with lists', async () => {
      const explanation = `The steps are:

1. First step
2. Second step
3. Third step

This completes the process.`;

      mockProcessMarkdownSync.mockReturnValue(
        `<p>The steps are:</p>
         <ol>
           <li>First step</li>
           <li>Second step</li>
           <li>Third step</li>
         </ol>
         <p>This completes the process.</p>`,
      );

      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      await waitFor(() => {
        expect(screen.getByText(/The steps are:/)).toBeInTheDocument();
      });
      expect(screen.getByText(/This completes the process./)).toBeInTheDocument();

      const orderedList = container.querySelector('ol');
      expect(orderedList).toBeInTheDocument();
      expect(screen.getByText('First step')).toBeInTheDocument();
      expect(screen.getByText('Second step')).toBeInTheDocument();
      expect(screen.getByText('Third step')).toBeInTheDocument();
    });

    it('should preserve explanation with tables', async () => {
      const explanation = `Here's the comparison:

| Feature | Value |
|---------|-------|
| Speed   | Fast  |
| Memory  | Low   |

This table shows the results.`;

      mockProcessMarkdownSync.mockReturnValue(
        `<p>Here's the comparison:</p>
         <table>
           <thead>
             <tr><th>Feature</th><th>Value</th></tr>
           </thead>
           <tbody>
             <tr><td>Speed</td><td>Fast</td></tr>
             <tr><td>Memory</td><td>Low</td></tr>
           </tbody>
         </table>
         <p>This table shows the results.</p>`,
      );

      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      await waitFor(() => {
        expect(screen.getByText(/Here's the comparison:/)).toBeInTheDocument();
      });
      expect(screen.getByText(/This table shows the results./)).toBeInTheDocument();

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
      expect(screen.getByText('Feature')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('Speed')).toBeInTheDocument();
      expect(screen.getByText('Fast')).toBeInTheDocument();
    });
  });

  describe('Complex Explanation Scenarios', () => {
    it('should handle mixed content in explanations', async () => {
      const explanation = `**Algorithm Explanation:**

The algorithm works as follows:

1. **Input**: Get value $x$
2. **Process**: Calculate $y = f(x)$ where $f(x) = x^2 + 1$
3. **Output**: Return $y$

\`\`\`javascript
function algorithm(x) {
  return x * x + 1;
}
\`\`\`

> **Note**: This is a simple quadratic function.

The complexity is $O(1)$.`;

      mockProcessMarkdownSync.mockReturnValue(
        `<p><strong>Algorithm Explanation:</strong></p>
         <p>The algorithm works as follows:</p>
         <ol>
           <li><strong>Input</strong>: Get value <span class="katex">x</span></li>
           <li><strong>Process</strong>: Calculate <span class="katex">y = f(x)</span> where <span class="katex">f(x) = x^2 + 1</span></li>
           <li><strong>Output</strong>: Return <span class="katex">y</span></li>
         </ol>
         <pre><code class="language-javascript">function algorithm(x) {
  return x * x + 1;
}</code></pre>
         <blockquote><p><strong>Note</strong>: This is a simple quadratic function.</p></blockquote>
         <p>The complexity is <span class="katex">O(1)</span>.</p>`,
      );

      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      // Check for various elements
      await waitFor(() => {
        expect(screen.getByText('Algorithm Explanation:')).toBeInTheDocument();
      });
      expect(screen.getByText(/The algorithm works as follows:/)).toBeInTheDocument();
      expect(screen.getByText(/Input/)).toBeInTheDocument();
      expect(screen.getByText(/Process/)).toBeInTheDocument();
      expect(screen.getByText(/Output/)).toBeInTheDocument();
      expect(screen.getByText(/Note/)).toBeInTheDocument();
      expect(screen.getByText(/The complexity is/)).toBeInTheDocument();

      // Check for structured elements
      expect(container.querySelector('ol')).toBeInTheDocument();
      expect(container.querySelector('pre')).toBeInTheDocument();
      expect(container.querySelector('blockquote')).toBeInTheDocument();
    });

    it('should handle explanation with mermaid diagrams', async () => {
      const explanation = `Here's the flow:

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

This diagram shows the process flow.`;

      mockProcessMarkdownSync.mockReturnValue(
        `<p>Here's the flow:</p>
         <div class="mermaid">graph TD
    A[Start] --> B[Process]
    B --> C[End]</div>
         <p>This diagram shows the process flow.</p>`,
      );

      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      await waitFor(() => {
        expect(screen.getByText(/Here's the flow:/)).toBeInTheDocument();
      });
      expect(screen.getByText(/This diagram shows the process flow./)).toBeInTheDocument();

      const mermaidElement = container.querySelector('.mermaid');
      expect(mermaidElement).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty explanations', async () => {
      const explanation = '';
      mockProcessMarkdownSync.mockReturnValue('');
      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      // Wait for async rendering to complete
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    it('should handle explanations with only whitespace', async () => {
      const explanation = '   \n\n  \t  \n  ';
      mockProcessMarkdownSync.mockReturnValue('');
      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    it('should handle explanations with special characters', async () => {
      const explanation = 'Special chars: <>&"\' and unicode: αβγδε';
      mockProcessMarkdownSync.mockReturnValue(
        "<p>Special chars: &lt;&gt;&amp;&quot;' and unicode: αβγδε</p>",
      );
      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      await waitFor(() => {
        expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
      });
      expect(screen.getByText(/and unicode:/)).toBeInTheDocument();
      expect(screen.getByText(/αβγδε/)).toBeInTheDocument();
    });

    it('should handle very long explanations', async () => {
      const longExplanation = 'A'.repeat(10000) + ' with some **bold** text.';
      mockProcessMarkdownSync.mockReturnValue(
        `<p>${'A'.repeat(10000)} with some <strong>bold</strong> text.</p>`,
      );
      const { container } = render(<MarkdownRenderer markdown={longExplanation} />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
      expect(screen.getByText('bold')).toBeInTheDocument();
    });
  });

  describe('Consistency Tests', () => {
    it('should render the same content consistently', async () => {
      const explanation = 'This is a **test** with $x = y$ and `code`.';
      const output =
        '<p>This is a <strong>test</strong> with <span class="katex">x = y</span> and <code>code</code>.</p>';
      mockProcessMarkdownSync.mockReturnValue(output);

      const { container: container1 } = render(<MarkdownRenderer markdown={explanation} />);
      const { container: container2 } = render(<MarkdownRenderer markdown={explanation} />);

      // Wait for async rendering for BOTH containers
      await waitFor(() => {
        expect(container1.querySelectorAll('strong').length).toBeGreaterThan(0);
      });
      await waitFor(() => {
        expect(container2.querySelectorAll('strong').length).toBeGreaterThan(0);
      });

      // Both should have the same structure
      expect(container1.querySelectorAll('strong').length).toBe(
        container2.querySelectorAll('strong').length,
      );
      expect(container1.querySelectorAll('.katex').length).toBe(
        container2.querySelectorAll('.katex').length,
      );
      expect(container1.querySelectorAll('code').length).toBe(
        container2.querySelectorAll('code').length,
      );
    });

    it('should handle the same content with different whitespace', async () => {
      const explanation1 = 'Text with   multiple   spaces.';
      const explanation2 = 'Text with multiple spaces.';
      mockProcessMarkdownSync.mockReturnValue('<p>Text with multiple spaces.</p>');

      const { container: container1 } = render(<MarkdownRenderer markdown={explanation1} />);
      const { container: container2 } = render(<MarkdownRenderer markdown={explanation2} />);

      // Wait for async rendering
      await waitFor(() => {
        expect(container1.textContent).toBeTruthy();
      });

      // Both should render similarly (whitespace may be preserved differently)
      expect(container1.textContent?.replace(/\s+/g, ' ').trim()).toBe(
        container2.textContent?.replace(/\s+/g, ' ').trim(),
      );
    });
  });
});
