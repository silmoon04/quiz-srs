/**
 * D11: Incorrect XSS Pattern Escaping
 *
 * Bug: The XSS detection regex uses `\\son\\w+=` which matches literal `\son`
 * instead of whitespace + `on`. This could allow XSS via event handlers.
 *
 * These tests verify XSS detection works correctly.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';

describe('D11: XSS Pattern Escaping Bug', () => {
  describe('Event handler detection', () => {
    it('should block onclick event handler', async () => {
      const malicious = '<div onclick="alert(1)">Click me</div>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        // Should not find the onclick in rendered content
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/onclick/i);
      });
    });

    it('should block onerror event handler', async () => {
      const malicious = '<img src="x" onerror="alert(1)">';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/onerror/i);
      });
    });

    it('should block onload event handler', async () => {
      const malicious = '<body onload="alert(1)">Content</body>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/onload/i);
      });
    });

    it('should block onmouseover event handler', async () => {
      const malicious = '<div onmouseover="alert(1)">Hover</div>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/onmouseover/i);
      });
    });

    it('should block onfocus event handler', async () => {
      const malicious = '<input onfocus="alert(1)">';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/onfocus/i);
      });
    });
  });

  describe('Script tag detection', () => {
    it('should block <script> tags', async () => {
      const malicious = '<script>alert(1)</script>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const scripts = document.querySelectorAll('script');
        // Should have no script tags from our content
        expect(scripts.length).toBe(0);
      });
    });

    it('should block script with attributes', async () => {
      const malicious = '<script src="evil.js"></script>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/<script/i);
      });
    });
  });

  describe('javascript: URL detection', () => {
    it('should block javascript: URLs in href', async () => {
      const malicious = '<a href="javascript:alert(1)">Click</a>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const links = document.querySelectorAll('a');
        links.forEach((link) => {
          expect(link.getAttribute('href')).not.toMatch(/javascript:/i);
        });
      });
    });

    it('should block javascript: URLs in src', async () => {
      const malicious = '<img src="javascript:alert(1)">';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const images = document.querySelectorAll('img');
        images.forEach((img) => {
          expect(img.getAttribute('src')).not.toMatch(/javascript:/i);
        });
      });
    });
  });

  describe('Case sensitivity', () => {
    it('should block ONCLICK (uppercase)', async () => {
      const malicious = '<div ONCLICK="alert(1)">Click</div>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content.toLowerCase()).not.toMatch(/onclick/);
      });
    });

    it('should block OnClick (mixed case)', async () => {
      const malicious = '<div OnClick="alert(1)">Click</div>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content.toLowerCase()).not.toMatch(/onclick/);
      });
    });

    it('should block JAVASCRIPT: (uppercase)', async () => {
      const malicious = '<a href="JAVASCRIPT:alert(1)">Click</a>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const links = document.querySelectorAll('a');
        links.forEach((link) => {
          const href = link.getAttribute('href');
          if (href) {
            expect(href.toLowerCase()).not.toMatch(/javascript:/);
          }
        });
      });
    });
  });

  describe('Whitespace variations', () => {
    it('should block event handler with space before on', async () => {
      // BUG: The regex \\son matches literal \s, not actual whitespace
      const malicious = '<div  onclick="alert(1)">Click</div>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/onclick/i);
      });
    });

    it('should block event handler with tab before on', async () => {
      const malicious = '<div\tonclick="alert(1)">Click</div>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/onclick/i);
      });
    });

    it('should block event handler with newline before on', async () => {
      const malicious = '<div\nonclick="alert(1)">Click</div>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/onclick/i);
      });
    });
  });

  describe('Legitimate content preservation', () => {
    it('should preserve the word "onclick" in text content', async () => {
      const legitimate = 'The onclick event is commonly used in JavaScript.';

      render(<MarkdownRenderer markdown={legitimate} />);

      await waitFor(() => {
        expect(screen.getByText(/onclick/i)).toBeInTheDocument();
      });
    });

    it('should preserve code examples with event handlers', async () => {
      const codeExample = '```javascript\nelement.onclick = function() {}\n```';

      render(<MarkdownRenderer markdown={codeExample} />);

      await waitFor(() => {
        // Code blocks should be preserved
        const pre = document.querySelector('pre');
        expect(pre).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', async () => {
      render(<MarkdownRenderer markdown="" />);

      await waitFor(() => {
        // Should not crash
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should handle input with only whitespace', async () => {
      render(<MarkdownRenderer markdown="   \n\t\n   " />);

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should handle very long strings', async () => {
      const long = 'x'.repeat(100000);

      render(<MarkdownRenderer markdown={long} />);

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should handle deeply nested HTML', async () => {
      const nested = '<div>'.repeat(50) + 'content' + '</div>'.repeat(50);

      render(<MarkdownRenderer markdown={nested} />);

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('SVG XSS vectors', () => {
    it('should block onload in SVG', async () => {
      const malicious = '<svg onload="alert(1)"><circle/></svg>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/onload/i);
      });
    });

    it('should block SVG use with external reference', async () => {
      const malicious = '<svg><use href="data:image/svg+xml,<svg onload=alert(1)>"></use></svg>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        // Should sanitize or block
        const content = document.body.innerHTML;
        expect(content).not.toMatch(/onload/i);
      });
    });
  });

  describe('Data URI XSS', () => {
    it('should block data:text/html', async () => {
      const malicious = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';

      render(<MarkdownRenderer markdown={malicious} />);

      await waitFor(() => {
        const links = document.querySelectorAll('a');
        links.forEach((link) => {
          const href = link.getAttribute('href');
          if (href) {
            expect(href).not.toMatch(/data:text\/html/i);
          }
        });
      });
    });
  });
});
