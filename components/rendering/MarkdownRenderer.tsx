'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { processMarkdown } from '@/lib/markdown/pipeline';

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
};

/**
 * Secure Markdown renderer (single source of dangerouslySetInnerHTML)
 * - Uses the unified pipeline in lib/markdown/pipeline (remark-parse/gfm/math → rehype-katex → rehype-sanitize).
 * - Blocks javascript: URLs / inline handlers if anything slipped past.
 */
export function MarkdownRenderer({ markdown, className }: Props) {
  const [state, setState] = useState<RenderState>({ html: '', sanitized: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!USE_SECURE_RENDERER) {
          // Safety net if the flag is off: render as plaintext paragraph.
          const escaped = markdown
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          if (!cancelled) setState({ html: `<p>${escaped}</p>`, sanitized: true });
          return;
        }
        const html = await processMarkdown(markdown);

        // Final belt-and-suspenders gate before HTML insertion.
        const disallowed = /<script\b|\\son\\w+=|javascript:/i.test(html);
        if (!cancelled) {
          setState({
            html: disallowed ? '<p>Content blocked for security reasons.</p>' : html,
            sanitized: disallowed,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState({
            html: '<p>Error rendering content.</p>',
            sanitized: true,
            error: String(e?.message ?? e),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [markdown]);

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
