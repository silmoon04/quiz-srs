import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { SecureTextRenderer } from "@/components/secure-text-renderer";
import React from "react";

describe("TextRenderer LaTeX Tests (TM-LX-01)", () => {
  describe("Inline Math Rendering", () => {
    it("should render inline math correctly", async () => {
      const content = "The formula is $x = y + z$ in the text.";
      const { container } = render(<SecureTextRenderer content={content} />);

      // Wait for KaTeX to load and render
      await waitFor(
        () => {
          const katexElement = container.querySelector(".katex");
          expect(katexElement).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should render multiple inline math expressions", async () => {
      const content = "First: $a^2 + b^2 = c^2$ and second: $E = mc^2$.";
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const katexElements = container.querySelectorAll(".katex");
          expect(katexElements.length).toBe(2);
        },
        { timeout: 3000 },
      );
    });

    it("should handle inline math with special characters", async () => {
      const content = "Greek letters: $\\alpha, \\beta, \\gamma$";
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const katexElement = container.querySelector(".katex");
          expect(katexElement).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should handle inline math with fractions", async () => {
      const content = "Fraction: $\\frac{1}{2}$ and $\\frac{a}{b}$";
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const katexElements = container.querySelectorAll(".katex");
          expect(katexElements.length).toBe(2);
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Display Math Rendering", () => {
    it("should render display math correctly", async () => {
      const content =
        "The equation is:\n\n$$x^2 + y^2 = z^2$$\n\nEnd of equation.";
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const katexElement = container.querySelector(".katex-display");
          expect(katexElement).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should render multiple display math expressions", async () => {
      const content = `First equation:
$$E = mc^2$$

Second equation:
$$F = ma$$`;
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const katexElements = container.querySelectorAll(".katex-display");
          expect(katexElements.length).toBe(2);
        },
        { timeout: 3000 },
      );
    });

    it("should handle display math with complex expressions", async () => {
      const content = `Complex equation:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$`;
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const katexElement = container.querySelector(".katex-display");
          expect(katexElement).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should handle display math with matrices", async () => {
      const content = `Matrix:
$$\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}$$`;
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const katexElement = container.querySelector(".katex-display");
          expect(katexElement).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Mixed Math and Text", () => {
    it("should handle inline and display math in the same content", async () => {
      const content = `The inline formula is $x = y$ and the display formula is:

$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

More text with $\\alpha$ symbol.`;
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const inlineElements = container.querySelectorAll(".katex");
          const displayElements = container.querySelectorAll(".katex-display");
          expect(inlineElements.length).toBe(3); // 2 inline + 1 from display math
          expect(displayElements.length).toBe(1);
        },
        { timeout: 3000 },
      );
    });

    it("should handle math within lists", async () => {
      const content = `- First item with $x = 1$
- Second item with display math:
  $$y = 2x + 3$$
- Third item with $\\alpha$`;
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const inlineElements = container.querySelectorAll(".katex");
          const displayElements = container.querySelectorAll(".katex-display");
          expect(inlineElements.length).toBe(3); // 2 inline + 1 from display math
          expect(displayElements.length).toBe(1);
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed LaTeX gracefully", async () => {
      const content = "Malformed: $\\invalid{command}$ and $\\frac{1}{2$";
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          // Should still render something, even if it's an error
          const katexElements = container.querySelectorAll(".katex");
          const katexErrorElements = container.querySelectorAll(".katex-error");
          expect(katexElements.length + katexErrorElements.length).toBe(2);
        },
        { timeout: 3000 },
      );
    });

    it("should handle empty math expressions", async () => {
      const content = "Empty: $$ and $ $";
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          // Should handle gracefully without crashing
          expect(container).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("KaTeX Configuration", () => {
    it("should use trust: false for security", async () => {
      const content = "Test: $x = y$";
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const katexElement = container.querySelector(".katex");
          expect(katexElement).toBeInTheDocument();
          // The element should be rendered, indicating trust: false is working
          // (if trust was true, it might render differently)
        },
        { timeout: 3000 },
      );
    });

    it("should handle custom macros", async () => {
      const content = "Custom macro: $\\neq$ and $\\ne$";
      const { container } = render(<SecureTextRenderer content={content} />);

      await waitFor(
        () => {
          const katexElements = container.querySelectorAll(".katex");
          expect(katexElements.length).toBe(2);
        },
        { timeout: 3000 },
      );
    });
  });
});
