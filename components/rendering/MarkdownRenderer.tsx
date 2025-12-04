'use client';

import React, { useEffect, useMemo } from 'react';
import { processMarkdownSync } from '@/lib/markdown/pipeline';

type Props = {
  markdown: string;
  className?: string;
};

// Feature flag (default ON). In Next.js client code, env is compiled in at build time.
const USE_SECURE_RENDERER: boolean =
  (process.env.NEXT_PUBLIC_USE_SECURE_RENDERER ?? 'true') !== 'false';

type RenderState = {
  html: string;
  // When pipeline prunes/rewrites dangerous content (or we detect disallowed patterns).
  sanitized: boolean;
  error?: string;
  hasMermaid?: boolean;
};

/**
 * Secure Markdown renderer (single source of dangerouslySetInnerHTML)
 * - Uses the unified pipeline in lib/markdown/pipeline (remark-parse/gfm/math → rehype-katex → rehype-sanitize).
 * - Blocks javascript: URLs / inline handlers if anything slipped past.
 * - NOW SYNCHRONOUS to prevent hydration mismatches and double-click issues.
 */
export function MarkdownRenderer({ markdown, className }: Props) {
  const state: RenderState = useMemo(() => {
    try {
      if (!USE_SECURE_RENDERER) {
        // Safety net if the flag is off: render as plaintext paragraph.
        const escaped = markdown.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return { html: `<p>${escaped}</p>`, sanitized: true };
      }

      const html = processMarkdownSync(markdown);

      // Check if the pipeline produced any mermaid divs
      const hasMermaid = html.includes('<div class="mermaid"');

      // Final belt-and-suspenders gate before HTML insertion.
      // Pattern matches: script tags, event handlers (onclick, onerror, etc.), javascript: URLs
      const disallowed = /<script\b|\s+on\w+\s*=|javascript:/i.test(html);

      return {
        html: disallowed ? '<p>Content blocked for security reasons.</p>' : html,
        sanitized: disallowed,
        hasMermaid,
      };
    } catch (e: any) {
      return {
        html: '<p>Error rendering content.</p>',
        sanitized: true,
        error: String(e?.message ?? e),
      };
    }
  }, [markdown]);

  useEffect(() => {
    if (!state.hasMermaid || !state.html) return;

    let cancelled = false;

    (async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        if (cancelled) return;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
        });

        const nodes = document.querySelectorAll<HTMLElement>('.mermaid');
        if (nodes.length > 0) {
          await mermaid.run({ nodes });
        }
      } catch (error) {
        console.error('Mermaid rendering failed', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.hasMermaid, state.html]);

  const note = useMemo(() => {
    if (!state.sanitized) return null;
    return (
      <div
        role="note"
        className="mb-2 rounded border-l-4 border-amber-400 bg-amber-50 p-2 text-sm text-amber-600"
      >
        <strong>Note:</strong> Some unsafe content was removed for security reasons.
      </div>
    );
  }, [state.sanitized]);

  return (
    <div className={className}>
      {note}
      <div dangerouslySetInnerHTML={{ __html: state.html }} />
    </div>
  );
}
