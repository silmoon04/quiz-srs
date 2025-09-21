/**
 * Simple Markdown Pipeline with XSS Protection
 *
 * This module provides a basic markdown processing pipeline with XSS sanitization.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';

// Basic sanitization schema
const sanitizeSchema = {
  tagNames: [
    'b',
    'i',
    'em',
    'strong',
    'code',
    'pre',
    'br',
    'ul',
    'ol',
    'li',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'p',
    'div',
    'span',
    'blockquote',
    'a',
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'del',
    's',
    'input',
  ],
  attributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class'],
    span: ['data-katex', 'data-katex-display'],
    div: ['data-katex', 'data-katex-display'],
    input: ['type', 'checked', 'disabled'],
    code: ['class'],
    pre: ['class'],
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https', 'data'],
  },
};

/**
 * Process markdown content through the safe pipeline
 */
export async function processMarkdown(content: string): Promise<string> {
  try {
    console.log('Processing markdown:', content.substring(0, 100) + '...');

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(rehypeRaw, false)
      .use(rehypeKatex, false)
      .use(rehypeSanitize, sanitizeSchema);

    const result = await processor.process(content);
    const html = String(result);

    console.log('Processed HTML:', html.substring(0, 200) + '...');
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
