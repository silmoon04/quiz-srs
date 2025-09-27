import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Process LaTeX math expressions in text
 * @param text - The text containing LaTeX expressions
 * @returns HTML with KaTeX-rendered math
 */
export function processLatex(text: string): string {
  // Process display math first: $$...$$
  text = text.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
    try {
      const rendered = katex.renderToString(math, {
        throwOnError: false,
        trust: false, // Security: don't trust user input
        displayMode: true,
      });
      // KaTeX already includes the katex-display class, so we don't need to wrap it
      return rendered;
    } catch {
      // If KaTeX fails, return the original text
      return match;
    }
  });

  // Process inline math: $...$ (but not $$...$$)
  text = text.replace(/(?<!\$)\$([^$]+)\$(?!\$)/g, (match, math) => {
    try {
      const rendered = katex.renderToString(math, {
        throwOnError: false,
        trust: false, // Security: don't trust user input
        displayMode: false,
      });
      // KaTeX already includes the katex-inline class, so we don't need to wrap it
      return rendered;
    } catch {
      // If KaTeX fails, return the original text
      return match;
    }
  });

  return text;
}

/**
 * Check if text contains LaTeX expressions
 * @param text - The text to check
 * @returns true if LaTeX expressions are found
 */
export function hasLatex(text: string): boolean {
  return /\$[^$]+\$|\$\$[^$]+\$\$/.test(text);
}
