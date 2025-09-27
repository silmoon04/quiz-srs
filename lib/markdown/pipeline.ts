/**
 * Safe Markdown Pipeline with XSS Protection
 *
 * This module provides a unified remark/rehype pipeline for processing markdown
 * with comprehensive XSS sanitization while preserving LaTeX rendering.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

// Custom sanitization schema for safe HTML
const sanitizeSchema = {
  tagNames: [
    // Text formatting
    'b',
    'i',
    'em',
    'strong',
    'code',
    'pre',
    'br',
    // Lists
    'ul',
    'ol',
    'li',
    // Tables
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    // Structure
    'p',
    'div',
    'span',
    'blockquote',
    // Links and images (with restrictions)
    'a',
    'img',
    // Headings
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // Horizontal rule
    'hr',
    // Strikethrough
    'del',
    's',
    // Task lists
    'input',
  ],
  attributes: {
    // Allow href on links but sanitize URLs
    a: ['href', 'title', 'target', 'rel'],
    // Allow src and alt on images
    img: ['src', 'alt', 'title', 'width', 'height'],
    // Allow class for styling
    '*': ['class'],
    // Allow data attributes for KaTeX
    span: ['data-katex', 'data-katex-display'],
    div: ['data-katex', 'data-katex-display'],
    // Allow type and checked for task lists
    input: ['type', 'checked', 'disabled'],
    // Allow code language classes
    code: ['class'],
    pre: ['class'],
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https', 'data'],
  },
  // Custom URL sanitization
  urlFilter: (url: string) => {
    // Block javascript: URLs
    if (url.toLowerCase().startsWith('javascript:')) {
      return false;
    }
    // Block data: URLs except for images
    if (url.toLowerCase().startsWith('data:') && !url.toLowerCase().startsWith('data:image/')) {
      return false;
    }
    return true;
  },
};

/**
 * Process markdown content through the safe pipeline
 */
export async function processMarkdown(content: string): Promise<string> {
  try {
    const processor = unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // GitHub Flavored Markdown (tables, strikethrough, task lists)
      .use(remarkMath) // Math support
      .use(remarkRehype) // Convert to HTML AST
      .use(rehypeRaw) // Allow raw HTML
      .use(rehypeKatex) // Render math with KaTeX
      .use(rehypeSanitize, sanitizeSchema) // Sanitize HTML
      .use(rehypeStringify); // Convert to HTML string

    const result = await processor.process(content);
    return String(result);
  } catch (error) {
    console.error('Markdown processing error:', error);
    // Return sanitized fallback
    return sanitizeFallback(content);
  }
}

/**
 * Fallback sanitization for when the pipeline fails
 */
function sanitizeFallback(content: string): string {
  // Basic HTML escaping
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Convert line breaks to <br>
  return escaped.replace(/\n/g, '<br>');
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
