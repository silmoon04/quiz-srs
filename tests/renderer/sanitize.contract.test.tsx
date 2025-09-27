import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { XSS_PAYLOADS, SAFE_CONTENT } from '../fixtures/xss/payloads';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';

describe.skip('MarkdownRenderer sanitization', () => {
  it.each(XSS_PAYLOADS)('blocks %s', async (payload) => {
    const { container } = render(<MarkdownRenderer markdown={payload} />);
    const html = container.innerHTML;

    // Contract: no scripts, no on* handlers, no javascript: URLs
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/\son\w+=/i);
    expect(html).not.toMatch(/javascript:/i);

    // Should not contain the original dangerous content
    expect(html).not.toContain(payload);
  });

  it('shows helpful note when content is stripped', () => {
    const dangerousContent = `<img src=x onerror=1>`;
    const { container } = render(<MarkdownRenderer markdown={dangerousContent} />);

    // Should show a note about unsafe content being removed
    expect(container.innerHTML).toContain('unsafe content was removed');
  });

  it.each(SAFE_CONTENT)('allows safe content: %s', (content) => {
    const { container } = render(<MarkdownRenderer markdown={content} />);
    const html = container.innerHTML;

    // Safe content should pass through
    expect(html).toContain(content);
  });

  it('preserves LaTeX content', () => {
    const latexContent = `$$\\frac{a}{b}$$`;
    const { container } = render(<MarkdownRenderer markdown={latexContent} />);
    const html = container.innerHTML;

    // LaTeX should be preserved
    expect(html).toContain('\\frac{a}{b}');
  });

  it('preserves Mermaid diagrams', () => {
    const mermaidContent = `
\`\`\`mermaid
graph TD
    A[Start] --> B[End]
\`\`\`
`;
    const { container } = render(<MarkdownRenderer markdown={mermaidContent} />);
    const html = container.innerHTML;

    // Mermaid content should be preserved
    expect(html).toContain('mermaid');
    expect(html).toContain('graph TD');
  });
});
