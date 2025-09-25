import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import React from 'react';

describe.skip('TextRenderer Explanation Mapping Tests (TM-RN-03)', () => {
  describe('Explanation Content Stability', () => {
    it('should preserve explanation text exactly', () => {
      const explanation = 'This is a detailed explanation with **bold text** and `code`.';
      render(<MarkdownRenderer markdown={explanation} />);

      expect(screen.getByText(/This is a detailed explanation with/)).toBeInTheDocument();
      expect(screen.getByText('bold text')).toBeInTheDocument();
      expect(screen.getByText('code')).toBeInTheDocument();
    });

    it('should preserve explanation with LaTeX', () => {
      const explanation = 'The formula is $x = y + z$ and the result is $\\alpha$.';
      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      // Should contain the text parts
      expect(screen.getByText(/The formula is/)).toBeInTheDocument();
      expect(screen.getByText(/and the result is/)).toBeInTheDocument();

      // Should contain LaTeX elements
      const katexElements = container.querySelectorAll('.katex-inline');
      expect(katexElements.length).toBe(2);
    });

    it('should preserve explanation with code blocks', () => {
      const explanation = `Here's the algorithm:

\`\`\`javascript
function calculate(x) {
  return x * 2;
}
\`\`\`

This explains the calculation.`;
      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      expect(screen.getByText(/Here's the algorithm:/)).toBeInTheDocument();
      expect(screen.getByText(/This explains the calculation./)).toBeInTheDocument();

      const codeBlock = container.querySelector('pre code');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock?.textContent).toContain('function calculate(x)');
    });

    it('should preserve explanation with lists', () => {
      const explanation = `The steps are:

1. First step
2. Second step
3. Third step

This completes the process.`;
      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      expect(screen.getByText(/The steps are:/)).toBeInTheDocument();
      expect(screen.getByText(/This completes the process./)).toBeInTheDocument();

      const orderedList = container.querySelector('ol');
      expect(orderedList).toBeInTheDocument();
      expect(screen.getByText('First step')).toBeInTheDocument();
      expect(screen.getByText('Second step')).toBeInTheDocument();
      expect(screen.getByText('Third step')).toBeInTheDocument();
    });

    it('should preserve explanation with tables', () => {
      const explanation = `Here's the comparison:

| Feature | Value |
|---------|-------|
| Speed   | Fast  |
| Memory  | Low   |

This table shows the results.`;
      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      expect(screen.getByText(/Here's the comparison:/)).toBeInTheDocument();
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
    it('should handle mixed content in explanations', () => {
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

      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      // Check for various elements
      expect(screen.getByText('Algorithm Explanation:')).toBeInTheDocument();
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

    it('should handle explanation with mermaid diagrams', () => {
      const explanation = `Here's the flow:

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

This diagram shows the process flow.`;

      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      expect(screen.getByText(/Here's the flow:/)).toBeInTheDocument();
      expect(screen.getByText(/This diagram shows the process flow./)).toBeInTheDocument();

      const mermaidElement = container.querySelector('.mermaid');
      expect(mermaidElement).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty explanations', () => {
      const explanation = '';
      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      expect(container).toBeInTheDocument();
      expect(container.textContent).toBe('');
    });

    it('should handle explanations with only whitespace', () => {
      const explanation = '   \n\n  \t  \n  ';
      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      expect(container).toBeInTheDocument();
    });

    it('should handle explanations with special characters', () => {
      const explanation = 'Special chars: <>&"\' and unicode: αβγδε';
      const { container } = render(<MarkdownRenderer markdown={explanation} />);

      expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
      expect(screen.getByText(/and unicode:/)).toBeInTheDocument();
      expect(screen.getByText(/αβγδε/)).toBeInTheDocument();
    });

    it('should handle very long explanations', () => {
      const longExplanation = 'A'.repeat(10000) + ' with some **bold** text.';
      const { container } = render(<MarkdownRenderer markdown={longExplanation} />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
    });
  });

  describe('Consistency Tests', () => {
    it('should render the same content consistently', () => {
      const explanation = 'This is a **test** with $x = y$ and `code`.';

      const { container: container1 } = render(<MarkdownRenderer markdown={explanation} />);
      const { container: container2 } = render(<MarkdownRenderer markdown={explanation} />);

      // Both should have the same structure
      expect(container1.querySelectorAll('strong').length).toBe(
        container2.querySelectorAll('strong').length,
      );
      expect(container1.querySelectorAll('.katex-inline').length).toBe(
        container2.querySelectorAll('.katex-inline').length,
      );
      expect(container1.querySelectorAll('code').length).toBe(
        container2.querySelectorAll('code').length,
      );
    });

    it('should handle the same content with different whitespace', () => {
      const explanation1 = 'Text with   multiple   spaces.';
      const explanation2 = 'Text with multiple spaces.';

      const { container: container1 } = render(<MarkdownRenderer markdown={explanation1} />);
      const { container: container2 } = render(<MarkdownRenderer markdown={explanation2} />);

      // Both should render similarly (whitespace may be preserved differently)
      expect(container1.textContent?.replace(/\s+/g, ' ').trim()).toBe(
        container2.textContent?.replace(/\s+/g, ' ').trim(),
      );
    });
  });
});
