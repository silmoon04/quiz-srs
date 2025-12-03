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
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

// Custom sanitization schema for safe HTML - extends defaultSchema to preserve KaTeX
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    // KaTeX MathML elements
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
  ],
  attributes: {
    ...(defaultSchema.attributes || {}),
    // Allow className on all elements (critical for KaTeX)
    '*': [
      ...(defaultSchema.attributes?.['*'] || []),
      'className',
      'style', // KaTeX needs inline styles
    ],
    // KaTeX MathML attributes
    math: ['xmlns', 'display'],
    semantics: [],
    mrow: [],
    mi: ['mathvariant'],
    mo: ['stretchy', 'symmetric', 'lspace', 'rspace', 'minsize', 'maxsize'],
    mn: [],
    msup: [],
    msub: [],
    mfrac: ['linethickness'],
    mtable: ['columnalign', 'rowspacing', 'columnspacing'],
    mtr: [],
    mtd: ['columnalign'],
    annotation: ['encoding'],
    'annotation-xml': ['encoding'],
    mtext: [],
    mspace: ['width', 'height', 'depth'],
    msqrt: [],
    mroot: [],
    munder: [],
    mover: [],
    munderover: [],
    mpadded: ['width', 'height', 'depth', 'lspace', 'voffset'],
    mphantom: [],
    menclose: ['notation'],
    // Ensure span can have aria-hidden for accessibility
    span: [...(defaultSchema.attributes?.span || []), 'aria-hidden'],
  },
};

/**
 * Pre-process markdown to normalize display math delimiters
 * remarkMath requires $$ to be on separate lines, but many users write $$...$$
 * inline. This function converts inline display math to the expected format.
 */
function preprocessDisplayMath(content: string): string {
  // Defensive check: return empty string if content is null/undefined
  if (content == null) {
    return '';
  }
  // Convert inline $$...$$ to newline-separated format
  // Match $$...$$  but not $...$
  return content.replace(/\$\$([^$]+?)\$\$/g, (match, math) => {
    // If the math already has the $$ on separate lines, don't change it
    if (match.startsWith('$$\n') || match.endsWith('\n$$')) {
      return match;
    }
    // Otherwise, add newlines around the math content
    return `$$\n${math}\n$$`;
  });
}

/**
 * Process markdown content through the safe pipeline
 */
export async function processMarkdown(content: string): Promise<string> {
  // Validate input: treat null/undefined as empty string
  if (content == null) {
    return '';
  }
  try {
    // Pre-process display math to ensure remarkMath can parse it correctly
    const normalizedContent = preprocessDisplayMath(content);

    const processor = unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // GitHub Flavored Markdown (tables, strikethrough, task lists)
      .use(remarkMath) // Math support
      .use(remarkRehype) // Convert to HTML AST
      .use(rehypeRaw) // Allow raw HTML
      .use(rehypeKatex) // Render math with KaTeX
      .use(rehypeSanitize, sanitizeSchema) // Sanitize HTML
      .use(rehypeStringify); // Convert to HTML string

    const result = await processor.process(normalizedContent);
    return String(result);
  } catch (error) {
    console.error('Markdown processing error:', error);
    // Return basic error message instead of trying to render potentially broken content
    throw new Error(
      `Failed to process markdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
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
