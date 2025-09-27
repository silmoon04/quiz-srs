import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { join, extname } from 'path';

// Recursive function to find all relevant files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.css']) {
  let files = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        if (!entry.startsWith('.') && entry !== 'node_modules') {
          files = files.concat(findFiles(fullPath, extensions));
        }
      } else if (extensions.includes(extname(entry))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  return files;
}

// Search function using Node.js built-ins
function search(pattern, extensions = ['.ts', '.tsx', '.js', '.jsx', '.css']) {
  const files = findFiles('.', extensions);
  const results = [];

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (new RegExp(pattern, 'gi').test(lines[i])) {
          results.push(`${file}:${i + 1}:${lines[i].trim()}`);
        }
      }
    } catch (error) {
      // Ignore read errors
    }
  }

  return results;
}

const findings = {
  dangerouslySetInnerHTML: search('dangerouslySetInnerHTML'),
  externalLinksNoRel: search('target="_blank"(?![^>]*rel=)'),
  ariaLive: search('aria-live'),
  prefersReducedMotion: search('prefers-reduced-motion'),
  roleButtonOnDiv: search('role="button"'),
  imgNoAlt: search('<img(?![^>]*\\balt=)'),
};

let size = '';
try {
  size = execSync('npm run -s size', { encoding: 'utf8' });
} catch (error) {
  size = 'size-limit not configured or failed';
}

const out = `# Gate 0.5 Audit Snapshot

**Date:** ${new Date().toISOString()}

## Pattern Counts
- dangerouslySetInnerHTML: ${findings.dangerouslySetInnerHTML.length}
- external links missing rel: ${findings.externalLinksNoRel.length}
- aria-live occurrences: ${findings.ariaLive.length}
- prefers-reduced-motion occurrences: ${findings.prefersReducedMotion.length}
- role="button" occurrences: ${findings.roleButtonOnDiv.length}
- <img> without alt: ${findings.imgNoAlt.length}

## Raw hits (truncated)
<details><summary>dangerouslySetInnerHTML</summary>

\`\`\`
${findings.dangerouslySetInnerHTML.slice(0, 50).join('\n')}
\`\`\`
</details>

<details><summary>aria-live</summary>
\`\`\`
${findings.ariaLive.slice(0, 50).join('\n')}
\`\`\`
</details>

<details><summary>prefers-reduced-motion</summary>
\`\`\`
${findings.prefersReducedMotion.slice(0, 50).join('\n')}
\`\`\`
</details>

<details><summary>role="button"</summary>
\`\`\`
${findings.roleButtonOnDiv.slice(0, 50).join('\n')}
\`\`\`
</details>

## Bundle Budget
\`\`\`
${size}
\`\`\`
`;
writeFileSync('docs/Gate-0.5 Audit Snapshot.md', out);
console.log('Wrote docs/Gate-0.5 Audit Snapshot.md');
