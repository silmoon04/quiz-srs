import { describe, it, expect } from 'vitest';
import { processLatex, hasLatex } from '@/lib/markdown/latex-processor';

describe('latex-processor', () => {
  describe('processLatex', () => {
    describe('inline math processing ($...$)', () => {
      it('should render simple inline math', () => {
        const input = 'The equation $x^2$ is quadratic';
        const result = processLatex(input);

        expect(result).toContain('katex');
        expect(result).not.toContain('$x^2$');
      });

      it('should render inline fractions', () => {
        const input = 'The fraction $\\frac{1}{2}$ equals 0.5';
        const result = processLatex(input);

        expect(result).toContain('katex');
        expect(result).toContain('frac');
      });

      it('should render multiple inline math expressions', () => {
        const input = 'We have $a$ and $b$ as variables';
        const result = processLatex(input);

        // Should render both expressions
        expect(result).not.toContain('$a$');
        expect(result).not.toContain('$b$');
        expect(result).toContain('katex');
      });

      it('should render inline math with subscripts', () => {
        const input = 'The variable $x_1$ is indexed';
        const result = processLatex(input);

        expect(result).toContain('katex');
        expect(result).not.toContain('$x_1$');
      });

      it('should render inline math with superscripts', () => {
        const input = 'Calculate $2^{10}$ power';
        const result = processLatex(input);

        expect(result).toContain('katex');
        expect(result).not.toContain('$2^{10}$');
      });

      it('should preserve text before and after inline math', () => {
        const input = 'Before $x$ After';
        const result = processLatex(input);

        expect(result).toContain('Before');
        expect(result).toContain('After');
      });
    });

    describe('block math processing ($$...$$)', () => {
      it('should render simple block math', () => {
        const input = 'Equation: $$x^2 + y^2 = z^2$$';
        const result = processLatex(input);

        expect(result).toContain('katex');
        expect(result).not.toContain('$$x^2 + y^2 = z^2$$');
      });

      it('should render block math with displayMode', () => {
        const input = '$$\\sum_{i=1}^{n} i$$';
        const result = processLatex(input);

        // Display mode math should be rendered
        expect(result).toContain('katex');
        expect(result).not.toContain('$$');
      });

      it('should render block math with integrals', () => {
        const input = '$$\\int_0^1 x dx$$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should render block math with matrices', () => {
        const input = '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should preserve text around block math', () => {
        const input = 'Before $$E = mc^2$$ After';
        const result = processLatex(input);

        expect(result).toContain('Before');
        expect(result).toContain('After');
      });

      it('should handle multiple block math expressions', () => {
        const input = '$$a^2$$ and $$b^2$$';
        const result = processLatex(input);

        expect(result).not.toContain('$$a^2$$');
        expect(result).not.toContain('$$b^2$$');
        expect(result).toContain('and');
      });
    });

    describe('mixed inline and block math', () => {
      it('should handle both inline and block math in same text', () => {
        const input = 'Inline $x$ and block $$y^2$$';
        const result = processLatex(input);

        expect(result).not.toContain('$x$');
        expect(result).not.toContain('$$y^2$$');
        expect(result).toContain('katex');
      });

      it('should not confuse block math delimiters with inline', () => {
        const input = '$$a$$ $b$';
        const result = processLatex(input);

        // Both should be processed correctly
        expect(result).not.toContain('$$a$$');
        expect(result).not.toContain('$b$');
      });
    });

    describe('complex LaTeX expressions', () => {
      it('should render Greek letters', () => {
        const input = '$\\alpha + \\beta = \\gamma$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should render square roots', () => {
        const input = '$\\sqrt{x^2 + y^2}$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should render limits', () => {
        const input = '$$\\lim_{x \\to \\infty} \\frac{1}{x} = 0$$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should render complex fractions', () => {
        const input = '$\\frac{\\frac{a}{b}}{\\frac{c}{d}}$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should render binomial coefficients', () => {
        const input = '$\\binom{n}{k}$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should render trigonometric functions', () => {
        const input = '$\\sin^2(x) + \\cos^2(x) = 1$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should render logarithms', () => {
        const input = '$\\log_2(8) = 3$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should render product notation', () => {
        const input = '$$\\prod_{i=1}^{n} x_i$$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should render aligned equations', () => {
        const input = '$$\\begin{aligned} a &= b + c \\\\ d &= e + f \\end{aligned}$$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for empty input', () => {
        const result = processLatex('');

        expect(result).toBe('');
      });

      it('should return text unchanged when no LaTeX is present', () => {
        const input = 'Just regular text without math';
        const result = processLatex(input);

        expect(result).toBe(input);
      });

      it('should handle text with dollar signs that are not LaTeX', () => {
        const input = 'Price is $50';
        // Single $ followed by number might be matched but won't render as valid math
        const result = processLatex(input);

        // The regex will match $50$ if followed by $, but $50 alone may not match
        expect(result).toContain('50');
      });

      it('should handle empty math delimiters', () => {
        const input = 'Empty: $$$$';
        const result = processLatex(input);

        // Empty content between $$ should be handled gracefully
        expect(result).toBeDefined();
      });

      it('should handle whitespace-only content', () => {
        const input = '   ';
        const result = processLatex(input);

        expect(result).toBe('   ');
      });

      it('should handle LaTeX at the start of string', () => {
        const input = '$x$ is a variable';
        const result = processLatex(input);

        expect(result).toContain('katex');
        expect(result).toContain('is a variable');
      });

      it('should handle LaTeX at the end of string', () => {
        const input = 'The answer is $42$';
        const result = processLatex(input);

        expect(result).toContain('katex');
        expect(result).toContain('The answer is');
      });

      it('should handle consecutive inline math expressions', () => {
        const input = '$a$$b$$c$';
        const result = processLatex(input);

        // This should process correctly despite consecutive expressions
        expect(result).toBeDefined();
      });

      it('should handle newlines in block math', () => {
        const input = '$$a +\nb$$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should handle special characters in surrounding text', () => {
        const input = '<div>$x$</div>';
        const result = processLatex(input);

        expect(result).toContain('<div>');
        expect(result).toContain('</div>');
        expect(result).toContain('katex');
      });
    });

    describe('malformed LaTeX handling', () => {
      it('should handle unmatched opening brace gracefully', () => {
        const input = '$\\frac{1$';
        const result = processLatex(input);

        // KaTeX with throwOnError: false should not throw
        expect(result).toBeDefined();
      });

      it('should handle unmatched closing brace gracefully', () => {
        const input = '$x}$';
        const result = processLatex(input);

        expect(result).toBeDefined();
      });

      it('should handle unknown command gracefully', () => {
        const input = '$\\unknowncommand{x}$';
        const result = processLatex(input);

        // Should not throw, either renders or returns original
        expect(result).toBeDefined();
      });

      it('should handle deeply nested braces', () => {
        const input = '$\\frac{\\frac{\\frac{a}{b}}{c}}{d}$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should handle incomplete environment', () => {
        const input = '$$\\begin{matrix} a & b$$';
        const result = processLatex(input);

        // Should handle gracefully without throwing
        expect(result).toBeDefined();
      });
    });

    describe('escaping and special characters', () => {
      it('should handle backslashes in LaTeX', () => {
        const input = '$a \\cdot b$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should handle ampersands in matrices', () => {
        const input = '$$\\begin{matrix} a & b \\end{matrix}$$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should handle curly braces', () => {
        const input = '$\\{a, b, c\\}$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should handle underscores in subscripts', () => {
        const input = '$x_{ij}$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should handle carets in superscripts', () => {
        const input = '$x^{n+1}$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should handle tilde character', () => {
        const input = '$\\tilde{x}$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });

      it('should handle percent sign', () => {
        const input = '$50\\%$';
        const result = processLatex(input);

        expect(result).toContain('katex');
      });
    });

    describe('security considerations', () => {
      it('should handle potentially malicious input safely', () => {
        const input = '$<script>alert("xss")</script>$';
        const result = processLatex(input);

        // KaTeX should escape or handle this safely
        expect(result).toBeDefined();
        // Should not contain raw script tag
        expect(result).not.toMatch(/<script>/i);
      });
    });
  });

  describe('hasLatex', () => {
    describe('positive cases', () => {
      it('should return true for inline math', () => {
        expect(hasLatex('$x^2$')).toBe(true);
      });

      it('should return true for block math', () => {
        expect(hasLatex('$$x^2$$')).toBe(true);
      });

      it('should return true for inline math in text', () => {
        expect(hasLatex('The value is $n$')).toBe(true);
      });

      it('should return true for block math in text', () => {
        expect(hasLatex('Equation: $$E = mc^2$$')).toBe(true);
      });

      it('should return true for multiple expressions', () => {
        expect(hasLatex('$a$ and $b$')).toBe(true);
      });

      it('should return true for complex expressions', () => {
        expect(hasLatex('$$\\int_0^1 f(x) dx$$')).toBe(true);
      });
    });

    describe('negative cases', () => {
      it('should return false for empty string', () => {
        expect(hasLatex('')).toBe(false);
      });

      it('should return false for plain text', () => {
        expect(hasLatex('Just regular text')).toBe(false);
      });

      it('should return false for single dollar sign', () => {
        expect(hasLatex('Price is $50')).toBe(false);
      });

      it('should return false for dollar signs without content', () => {
        expect(hasLatex('$$')).toBe(false);
      });

      it('should return false for whitespace only', () => {
        expect(hasLatex('   ')).toBe(false);
      });

      it('should return false for text with numbers', () => {
        expect(hasLatex('The answer is 42')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should detect math at start of string', () => {
        expect(hasLatex('$x$ is first')).toBe(true);
      });

      it('should detect math at end of string', () => {
        expect(hasLatex('last is $x$')).toBe(true);
      });

      it('should detect math with special characters', () => {
        expect(hasLatex('$\\alpha$')).toBe(true);
      });

      it('should handle unicode characters in text', () => {
        expect(hasLatex('日本語 $x$ テスト')).toBe(true);
      });
    });
  });
});
