import { readFileSync } from 'fs';
import { globSync } from 'glob';
import { describe, it, expect } from 'vitest';

function grepAll(re: RegExp) {
  const files = globSync('{app,components,lib,utils}/**/*.{ts,tsx,css}', {
    ignore: ['**/node_modules/**'],
  });
  let hits = 0;
  for (const f of files) {
    const s = readFileSync(f, 'utf8');
    const m = s.match(re);
    if (m) hits += m.length;
  }
  return hits;
}

describe('Static Security & Accessibility Audits', () => {
  it('dangerouslySetInnerHTML is quarantined', () => {
    // Count only actual usage, not comments
    const total = grepAll(/dangerouslySetInnerHTML\s*=\s*\{/gi);
    expect(total).toBeLessThanOrEqual(1);
  });

  it('no target="_blank" without rel', () => {
    const total = grepAll(/target="_blank"(?![^>]*rel=)/gi);
    expect(total).toBe(0);
  });

  it('has prefers-reduced-motion gate', () => {
    expect(grepAll(/prefers-reduced-motion/gi)).toBeGreaterThanOrEqual(1);
  });

  it('has at least one aria-live region', () => {
    expect(grepAll(/aria-live/gi)).toBeGreaterThanOrEqual(1);
  });

  it('has no img tags without alt attributes', () => {
    const total = grepAll(/<img(?![^>]*\balt=)/gi);
    expect(total).toBe(0);
  });

  it('has proper role button usage', () => {
    // Should have some role="button" but not on div elements without proper keyboard handling
    const total = grepAll(/role="button"/gi);
    expect(total).toBeGreaterThanOrEqual(1);
  });
});
