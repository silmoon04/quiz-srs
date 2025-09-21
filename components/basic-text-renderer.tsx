'use client';

import { memo } from 'react';

interface BasicTextRendererProps {
  content: string;
  className?: string;
}

/**
 * Basic Text Renderer that handles XSS sanitization
 * This is a simplified version for testing the core functionality
 */
export const BasicTextRenderer = memo(function BasicTextRenderer({
  content,
  className = '',
}: BasicTextRendererProps) {
  // Basic XSS sanitization - escape dangerous characters
  let sanitizedContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Basic markdown processing
  // Bold text
  sanitizedContent = sanitizedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic text
  sanitizedContent = sanitizedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline code
  sanitizedContent = sanitizedContent.replace(/`(.*?)`/g, '<code>$1</code>');

  // Line breaks
  sanitizedContent = sanitizedContent.replace(/\n/g, '<br>');

  // Headers
  sanitizedContent = sanitizedContent.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  sanitizedContent = sanitizedContent.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  sanitizedContent = sanitizedContent.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Lists
  sanitizedContent = sanitizedContent.replace(/^\* (.*$)/gm, '<li>$1</li>');
  sanitizedContent = sanitizedContent.replace(/^- (.*$)/gm, '<li>$1</li>');

  // Wrap lists
  sanitizedContent = sanitizedContent.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

  // Basic links (safe ones only)
  sanitizedContent = sanitizedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // Only allow safe URLs
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return `<a href="${url}">${text}</a>`;
    }
    return text; // If URL is not safe, just return the text
  });

  return (
    <div
      className={`basic-text-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
});
