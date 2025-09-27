/**
 * Working Markdown Pipeline with XSS Protection
 *
 * This module provides a basic markdown processing pipeline with XSS sanitization.
 */

/**
 * Basic markdown to HTML converter with XSS protection
 */
export async function processMarkdown(content: string): Promise<string> {
  try {
    console.log('Processing markdown:', content.substring(0, 100) + '...');

    // Basic XSS protection - escape HTML
    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // Basic markdown processing
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // Lists
    html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    console.log('Processed HTML (basic):', html.substring(0, 200) + '...');
    return html;
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
