import { describe, it, expect } from 'vitest';
import { processMarkdownSync } from '@/lib/markdown/pipeline';

describe('Markdown Pipeline - Mermaid Reproduction', () => {
  it('should preserve mermaid code blocks for the renderer to transform', () => {
    const markdown = `
\`\`\`mermaid
graph TD;
    A-->B;
\`\`\`
    `;

    const html = processMarkdownSync(markdown);

    // The pipeline now transforms it into a div with class mermaid
    console.log('Generated HTML:', html);

    // We expect it to contain the class mermaid
    expect(html).toContain('<div class="mermaid"');
  });
});
