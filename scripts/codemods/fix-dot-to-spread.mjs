#!/usr/bin/env node
/**
 * Quick codemod to fix accidental `.props`/`.prev`/`.state`/`.opts` etc into spreads.
 * Usage: node scripts/codemods/fix-dot-to-spread.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const exts = new Set(['.ts', '.tsx']);
const roots = ['components', 'hooks', 'app', 'lib', 'tests'];

const replacements = [
  { from: /\{\s*\.props\s*\}/g, to: '{ ...props }' },
  { from: /\.props\b/g,            to: '...props' },
  { from: /\.prev\b/g,             to: '...prev' },
  { from: /\.state\b/g,            to: '...state' },
  { from: /\.opts\b/g,             to: '...opts' },
  { from: /\.mockModule\b/g,       to: '...mockModule' },
  { from: /\.className\b/g,        to: '...className' },
  // common patterns in parameter lists
  { from: /\(\{([^}]*)\,\s*\.props\s*\}/g, to: '({$1, ...props}' },
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(full))) {
      let src = fs.readFileSync(full, 'utf8');
      let replaced = src;
      for (const {from, to} of replacements) {
        replaced = replaced.replace(from, to);
      }
      if (replaced !== src) {
        fs.writeFileSync(full, replaced, 'utf8');
        console.log('patched', full);
      }
    }
  }
}

for (const r of roots) {
  if (fs.existsSync(r)) walk(r);
}
console.log('Codemod run complete.');
