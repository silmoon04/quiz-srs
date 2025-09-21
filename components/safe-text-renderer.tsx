'use client';

import { useEffect, useRef, useState, memo } from 'react';
import 'katex/dist/katex.min.css';
import {
  processContentWithMermaid,
  hasMermaidContent,
  processMarkdownSync,
} from '@/lib/markdown/sync-pipeline';

interface SafeTextRendererProps {
  content: string;
  className?: string;
}

// Lazy load mermaid only when needed
let mermaidPromise: Promise<any> | null = null;

const loadMermaid = async () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((mermaid) => {
      // Initialize mermaid with safe defaults
      (mermaid as any).initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        fontFamily: 'inherit',
        fontSize: 14,
        theme: 'default',
        themeVariables: {},
      });
      return mermaid;
    });
  }
  return mermaidPromise;
};

export const SafeTextRenderer = memo(function SafeTextRenderer({
  content,
  className = '',
}: SafeTextRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState('');
  const [mermaidRendered, setMermaidRendered] = useState(false);

  // Process content with the safe pipeline
  useEffect(() => {
    try {
      console.log('SafeTextRenderer: Starting content processing');
      console.log('Original content:', content.substring(0, 200) + '...');

      // Process synchronously first to ensure immediate rendering
      const html = processMarkdownSync(content);

      console.log('Processed HTML:', html.substring(0, 200) + '...');
      setProcessedContent(html);
      setMermaidRendered(false); // Reset mermaid state

      console.log('SafeTextRenderer: Content processed successfully');
    } catch (error) {
      console.error('SafeTextRenderer: Content processing error:', error);
      // Fallback to basic HTML escaping
      setProcessedContent(
        content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/\n/g, '<br>'),
      );
    }
  }, [content]);

  // Lazy load and render mermaid diagrams
  useEffect(() => {
    if (processedContent && !mermaidRendered && hasMermaidContent(content)) {
      const renderMermaid = async () => {
        try {
          const mermaid = await loadMermaid();

          if (containerRef.current) {
            const mermaidElements = containerRef.current.querySelectorAll<HTMLElement>('.mermaid');

            if (mermaidElements.length > 0) {
              // Update theme if needed
              (mermaid as any).initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'strict',
                fontFamily: 'inherit',
                fontSize: 14,
                darkMode: false,
                themeVariables: {},
              });

              // Process each mermaid element
              mermaidElements.forEach((element, index) => {
                const id = `mermaid-${Date.now()}-${index}`;
                element.id = id;
              });

              await mermaid.run({
                nodes: Array.from(mermaidElements),
              });

              console.log(`Mermaid rendered ${mermaidElements.length} diagrams`);
              setMermaidRendered(true);
            }
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          setMermaidRendered(true); // Prevent infinite loops
        }
      };

      renderMermaid();
    } else if (!hasMermaidContent(content)) {
      setMermaidRendered(true); // No mermaid content, mark as rendered
    }
  }, [processedContent, mermaidRendered, content]);

  return (
    <div
      ref={containerRef}
      className={`${className} prose prose-invert max-w-none text-white`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
});
