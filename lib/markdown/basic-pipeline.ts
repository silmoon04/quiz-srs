/**
 * Basic Markdown Pipeline with XSS Protection
 *
 * This module provides a simple markdown processing pipeline with XSS sanitization.
 */

/**
 * Process markdown content through a basic safe pipeline
 */
export async function processMarkdown(content: string): Promise<string> {
  try {
    console.log('Processing markdown:', content.substring(0, 100) + '...');

    // For now, just return basic HTML escaping as a working fallback
    // This ensures the component works while we debug the remark/rehype pipeline
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br>');

    console.log('Processed HTML (basic):', escaped.substring(0, 200) + '...');
    return escaped;
  } catch (error) {
    console.error('Markdown processing error:', error);
    // Return basic HTML escaping as fallback
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br>');
  }
}

/**
 * Check if content contains mermaid diagrams
 */
export function hasMermaidContent(content: string): boolean {
  return /```mermaid\s*[\s\S]*?```/i.test(content);
}

/**
 * Extract mermaid diagrams from content
 */
export function extractMermaidDiagrams(content: string): string[] {
  const mermaidRegex = /```mermaid\s*([\s\S]*?)```/gi;
  const diagrams: string[] = [];
  let match;

  while ((match = mermaidRegex.exec(content)) !== null) {
    diagrams.push(match[1].trim());
  }

  return diagrams;
}

/**
 * Process content and return both HTML and mermaid diagrams
 */
export async function processContentWithMermaid(content: string): Promise<{
  html: string;
  mermaidDiagrams: string[];
}> {
  const mermaidDiagrams = extractMermaidDiagrams(content);
  const html = await processMarkdown(content);

  return {
    html,
    mermaidDiagrams,
  };
}
