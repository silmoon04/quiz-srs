'use client';

import { memo } from 'react';
import { processLatex, hasLatex } from '@/lib/markdown/latex-processor';

interface SecureTextRendererProps {
  content: string;
  className?: string;
}

/**
 * Secure Text Renderer with XSS Protection
 *
 * This component provides a basic markdown renderer with comprehensive XSS sanitization
 * while maintaining the functionality needed for quiz content rendering.
 */
export const SecureTextRenderer = memo(function SecureTextRenderer({
  content,
  className = '',
}: SecureTextRendererProps) {
  /**
   * Process markdown and sanitize HTML content to prevent XSS attacks
   */
  function processContent(text: string): string {
    // Handle null/undefined content
    if (!text || typeof text !== 'string') {
      return '';
    }

    try {
      // First, check if this looks like raw HTML (contains dangerous tags)
      // Only detect as raw HTML if it starts with HTML tags or contains actual HTML elements
      // Don't detect markdown content that contains HTML-like text in URLs or code blocks
      const hasRawHtml =
        /^<|<script\b[^>]*>|<iframe\b[^>]*>|<form\b[^>]*>|<input\b[^>]*>|<button\b[^>]*>|<img\s+[^>]*on\w+|<div\s+[^>]*on\w+|<span\s+[^>]*on\w+|<p\s+[^>]*on\w+/i.test(
          text,
        ) &&
        !/\[.*\]\([^)]*<script[^)]*\)/.test(text) && // Not in markdown links
        !/```[\s\S]*?```/.test(text) && // Not in code blocks
        !/`[^`]*<script[^`]*`/.test(text) && // Not in inline code
        !/^\s*### Q:/.test(text) && // Not markdown questions
        !/^\s*\*\*Options:\*\*/.test(text) && // Not markdown options
        !/^\s*\*\*A\d+:\*\*/.test(text); // Not markdown answers

      if (hasRawHtml) {
        // For raw HTML, remove dangerous attributes instead of escaping
        // (escaping doesn't work with dangerouslySetInnerHTML)
        let cleaned = text;

        // Remove dangerous event handlers (handle both quote types)
        cleaned = cleaned.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, ''); // double quotes
        cleaned = cleaned.replace(/\s*on\w+\s*=\s*'[^']*'/gi, ''); // single quotes

        // Remove dangerous protocols
        cleaned = cleaned.replace(/javascript:/gi, '');

        // Remove dangerous tags completely
        cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        cleaned = cleaned.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
        cleaned = cleaned.replace(/<input\b[^<]*>/gi, '');
        cleaned = cleaned.replace(/<button\b[^<]*>/gi, '');

        return cleaned;
      }
    } catch (error) {
      console.error('Error in XSS detection:', error);
      // If XSS detection fails, treat as markdown and continue processing
    }

    // Process LaTeX first (before markdown processing)
    try {
      if (hasLatex(text)) {
        text = processLatex(text);
      }
    } catch (error) {
      console.error('Error processing LaTeX:', error);
      // Continue with markdown processing even if LaTeX fails
    }

    // Step 1: Process markdown to HTML first
    let html = text;

    // Code blocks: ```code``` -> <pre><code>code</code></pre>
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Tables: Process table rows and headers
    const lines = html.split('\n');
    let inTable = false;
    let tableRows: string[] = [];
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isTableRow = line.match(/^\|(.+)\|$/);

      if (isTableRow) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }

        const content = line.slice(1, -1); // Remove leading and trailing |
        const cells = content.split('|').map((cell) => cell.trim());

        // Check if this is a header separator row (contains only dashes, equals, or pipes)
        const isHeaderSeparator = cells.every((cell) => /^[-=|\s]+$/.test(cell));

        if (isHeaderSeparator) {
          // Skip header separator rows
          continue;
        }

        // Check if this should be a header row (first row or previous row was header separator)
        const isHeader = tableRows.length === 0;
        const tag = isHeader ? 'th' : 'td';

        const rowContent = cells.map((cell) => `<${tag}>${cell}</${tag}>`).join('');
        tableRows.push(`<tr>${rowContent}</tr>`);
      } else {
        if (inTable) {
          // Close the table
          if (tableRows.length > 0) {
            // Separate header and body rows
            const headerRows = tableRows.filter((row) => row.includes('<th>'));
            const bodyRows = tableRows.filter((row) => row.includes('<td>'));

            let tableHtml = '<table>';
            if (headerRows.length > 0) {
              tableHtml += `<thead>${headerRows.join('')}</thead>`;
            }
            if (bodyRows.length > 0) {
              tableHtml += `<tbody>${bodyRows.join('')}</tbody>`;
            }
            tableHtml += '</table>';

            result.push(tableHtml);
          }
          inTable = false;
          tableRows = [];
        }
        result.push(line);
      }
    }

    // Handle case where table is at the end
    if (inTable && tableRows.length > 0) {
      // Separate header and body rows
      const headerRows = tableRows.filter((row) => row.includes('<th>'));
      const bodyRows = tableRows.filter((row) => row.includes('<td>'));

      let tableHtml = '<table>';
      if (headerRows.length > 0) {
        tableHtml += `<thead>${headerRows.join('')}</thead>`;
      }
      if (bodyRows.length > 0) {
        tableHtml += `<tbody>${bodyRows.join('')}</tbody>`;
      }
      tableHtml += '</table>';

      result.push(tableHtml);
    }

    html = result.join('\n');

    // Images: ![alt](url) -> <img src="url" alt="alt">
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      // Handle title attribute: ![alt](url "title") -> extract just the URL
      const urlMatch = url.match(/^([^\s]+)(?:\s+"[^"]*")?$/);
      const cleanUrl = urlMatch ? urlMatch[1] : url.trim();

      // Only allow safe URLs - reject javascript: and other dangerous protocols
      if (
        cleanUrl.startsWith('javascript:') ||
        cleanUrl.startsWith('data:') ||
        cleanUrl.startsWith('vbscript:')
      ) {
        return alt; // If URL is dangerous, just return the alt text
      }
      if (
        cleanUrl.startsWith('http://') ||
        cleanUrl.startsWith('https://') ||
        cleanUrl.startsWith('/') ||
        cleanUrl.startsWith('#')
      ) {
        return `<img src="${cleanUrl}" alt="${alt}">`;
      }
      return alt; // If URL is potentially dangerous, just return the alt text
    });

    // Blockquotes: > text -> <blockquote>text</blockquote>
    // Process blockquotes line by line to handle multiple blockquotes
    const blockquoteLines = html.split('\n');
    let inBlockquote = false;
    let blockquoteContent: string[] = [];
    const blockquoteResult: string[] = [];

    for (let i = 0; i < blockquoteLines.length; i++) {
      const line = blockquoteLines[i];
      const isBlockquoteLine = line.match(/^> (.+)$/);

      if (isBlockquoteLine) {
        if (!inBlockquote) {
          inBlockquote = true;
          blockquoteContent = [];
        }
        blockquoteContent.push(line.replace(/^> /, ''));
      } else {
        if (inBlockquote) {
          // Close the blockquote
          if (blockquoteContent.length > 0) {
            blockquoteResult.push(`<blockquote>${blockquoteContent.join('<br>')}</blockquote>`);
          }
          inBlockquote = false;
          blockquoteContent = [];
        }
        blockquoteResult.push(line);
      }
    }

    // Handle case where blockquote is at the end
    if (inBlockquote && blockquoteContent.length > 0) {
      blockquoteResult.push(`<blockquote>${blockquoteContent.join('<br>')}</blockquote>`);
    }

    html = blockquoteResult.join('\n');

    // Horizontal rules: --- or *** or ___ -> <hr>
    html = html.replace(/^[-*_]{3,}$/gm, '<hr>');

    // Strikethrough: ~~text~~ -> <del>text</del>
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Bold text: **text** and __text__ -> <strong>text</strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic text: *text* and _text_ -> <em>text</em>
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');

    // Inline code: `code` -> <code>code</code>
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Links: [text](url) -> <a href="url">text</a> (with URL validation)
    // Use a more robust regex that handles URLs with parentheses and titles
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      // Handle title attribute: [text](url "title") -> extract just the URL
      const urlMatch = url.match(/^([^\s]+)(?:\s+"[^"]*")?$/);
      const cleanUrl = urlMatch ? urlMatch[1] : url.trim();

      // Only allow safe URLs - reject javascript: and other dangerous protocols
      if (
        cleanUrl.startsWith('javascript:') ||
        cleanUrl.startsWith('data:') ||
        cleanUrl.startsWith('vbscript:')
      ) {
        return text; // If URL is dangerous, just return the text
      }
      if (
        cleanUrl.startsWith('http://') ||
        cleanUrl.startsWith('https://') ||
        cleanUrl.startsWith('/') ||
        cleanUrl.startsWith('#')
      ) {
        return `<a href="${cleanUrl}">${text}</a>`;
      }
      return text; // If URL is potentially dangerous, just return the text
    });

    // Process lists after table processing
    // Task lists: - [ ] and - [x] -> <li><input type="checkbox">...</li>
    html = html.replace(/^[\s]*[\*\-] \[ \] (.*$)/gm, '<li><input type="checkbox"> $1</li>');
    html = html.replace(
      /^[\s]*[\*\-] \[x\] (.*$)/gm,
      '<li><input type="checkbox" checked> $1</li>',
    );

    // Unordered lists (but not task lists) - handle indented items
    html = html.replace(/^[\s]*[\*\-] (?!\[[ x]\])(.*$)/gm, '<li>$1</li>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

    // Wrap consecutive list items in <ul> or <ol>
    const listLines = html.split('\n');
    let inList = false;
    let isOrdered = false;
    let listItems: string[] = [];
    const listResult: string[] = [];

    for (let i = 0; i < listLines.length; i++) {
      const line = listLines[i];
      const isListItem = line.match(/^<li>.*<\/li>$/);

      if (isListItem) {
        if (!inList) {
          // Check if this is an ordered list by looking at the original line
          const originalLine = text.split('\n')[i];
          isOrdered = /^\d+\./.test(originalLine);
          inList = true;
          listItems = [];
        }

        // Check if this item has a different list type than the current list
        const originalLine = text.split('\n')[i];
        const currentItemIsOrdered = /^\d+\./.test(originalLine);

        if (currentItemIsOrdered !== isOrdered) {
          // Close the current list and start a new one
          if (listItems.length > 0) {
            const listTag = isOrdered ? 'ol' : 'ul';
            listResult.push(`<${listTag}>${listItems.join('')}</${listTag}>`);
          }
          isOrdered = currentItemIsOrdered;
          listItems = [];
        }

        listItems.push(line);
      } else {
        if (inList) {
          // Close the list
          const listTag = isOrdered ? 'ol' : 'ul';
          listResult.push(`<${listTag}>${listItems.join('')}</${listTag}>`);
          inList = false;
          listItems = [];
        }
        listResult.push(line);
      }
    }

    // Handle case where list is at the end
    if (inList) {
      const listTag = isOrdered ? 'ol' : 'ul';
      listResult.push(`<${listTag}>${listItems.join('')}</${listTag}>`);
    }

    html = listResult.join('\n');

    // Line breaks - only convert single line breaks to <br>, not double line breaks
    html = html.replace(/(?<!\n)\n(?!\n)/g, '<br>');

    // Step 2: Sanitize the HTML to prevent XSS
    // Remove dangerous attributes and content
    html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove event handlers
    html = html.replace(/javascript:/gi, ''); // Remove javascript: URLs
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove script tags
    html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ''); // Remove iframe tags
    html = html.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, ''); // Remove form tags
    // Remove dangerous input tags but allow safe ones like checkboxes
    html = html.replace(/<input(?![^>]*type=["']checkbox["'])[^>]*>/gi, ''); // Remove input tags except checkboxes
    html = html.replace(/<button\b[^<]*>/gi, ''); // Remove button tags

    // Also remove escaped dangerous attributes
    html = html.replace(/&lt;script\b[^&]*(?:(?!&lt;\/script&gt;)[^&])*&lt;\/script&gt;/gi, ''); // Remove escaped script tags
    html = html.replace(/on\w+\s*=\s*&quot;[^&]*&quot;/gi, ''); // Remove escaped event handlers
    html = html.replace(/on\w+\s*=\s*&#39;[^&]*&#39;/gi, ''); // Remove escaped event handlers with single quotes
    html = html.replace(/javascript:/gi, ''); // Remove any remaining javascript: URLs

    // Remove any remaining dangerous attributes that might have been escaped
    html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove any remaining event handlers
    html = html.replace(/on\w+\s*=\s*&quot;[^&]*&quot;/gi, ''); // Remove any remaining escaped event handlers
    html = html.replace(/on\w+\s*=\s*&#39;[^&]*&#39;/gi, ''); // Remove any remaining escaped event handlers

    // Final cleanup: remove any remaining dangerous content
    html = html.replace(/on\w+\s*=\s*[^\s>]+/gi, ''); // Remove any remaining event handlers
    html = html.replace(/javascript:/gi, ''); // Remove any remaining javascript: URLs

    return html;
  }

  let processedContent: string;
  try {
    processedContent = processContent(content);
  } catch (error) {
    console.error('Error processing content in SecureTextRenderer:', error);
    // Fallback: return the original content as plain text
    processedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return (
    <div
      className={`secure-text-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
});
