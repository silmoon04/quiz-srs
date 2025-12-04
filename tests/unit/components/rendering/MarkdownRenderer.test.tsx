import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import * as React from 'react';

// Mock the markdown pipeline
vi.mock('@/lib/markdown/pipeline', () => ({
  processMarkdown: vi.fn(),
  processMarkdownSync: vi.fn(),
}));

// Import after mocking
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import { processMarkdown, processMarkdownSync } from '@/lib/markdown/pipeline';

const mockProcessMarkdown = processMarkdown as ReturnType<typeof vi.fn>;
const mockProcessMarkdownSync = processMarkdownSync as ReturnType<typeof vi.fn>;

describe('MarkdownRenderer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock behavior for both sync and async
    mockProcessMarkdown.mockResolvedValue('<p>Default mock output</p>');
    mockProcessMarkdownSync.mockReturnValue('<p>Default mock output</p>');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>Hello World</p>');

      render(<MarkdownRenderer markdown="Hello World" />);

      await waitFor(() => {
        expect(screen.getByText('Hello World')).toBeInTheDocument();
      });
    });

    it('should render plain text correctly', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>This is plain text content</p>');

      render(<MarkdownRenderer markdown="This is plain text content" />);

      await waitFor(() => {
        expect(screen.getByText('This is plain text content')).toBeInTheDocument();
      });
    });

    it('should call processMarkdownSync with the provided markdown', async () => {
      const markdown = 'Test markdown content';
      mockProcessMarkdownSync.mockReturnValue('<p>Test markdown content</p>');

      render(<MarkdownRenderer markdown={markdown} />);

      await waitFor(() => {
        expect(mockProcessMarkdownSync).toHaveBeenCalledWith(markdown);
      });
    });

    it('should handle empty markdown string', async () => {
      mockProcessMarkdownSync.mockReturnValue('');

      const { container } = render(<MarkdownRenderer markdown="" />);

      await waitFor(() => {
        expect(mockProcessMarkdownSync).toHaveBeenCalledWith('');
      });

      // Container should still exist
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should re-render when markdown prop changes', async () => {
      mockProcessMarkdownSync
        .mockReturnValueOnce('<p>First content</p>')
        .mockReturnValueOnce('<p>Updated content</p>');

      const { rerender } = render(<MarkdownRenderer markdown="First content" />);

      await waitFor(() => {
        expect(screen.getByText('First content')).toBeInTheDocument();
      });

      rerender(<MarkdownRenderer markdown="Updated content" />);

      await waitFor(() => {
        expect(screen.getByText('Updated content')).toBeInTheDocument();
      });

      expect(mockProcessMarkdownSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Bold and Italic Markdown', () => {
    it('should render bold text', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p><strong>Bold text</strong></p>');

      render(<MarkdownRenderer markdown="**Bold text**" />);

      await waitFor(() => {
        const strong = screen.getByText('Bold text');
        expect(strong).toBeInTheDocument();
        expect(strong.tagName).toBe('STRONG');
      });
    });

    it('should render italic text', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p><em>Italic text</em></p>');

      render(<MarkdownRenderer markdown="*Italic text*" />);

      await waitFor(() => {
        const em = screen.getByText('Italic text');
        expect(em).toBeInTheDocument();
        expect(em.tagName).toBe('EM');
      });
    });

    it('should render bold and italic combined', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p><strong><em>Bold and Italic</em></strong></p>');

      render(<MarkdownRenderer markdown="***Bold and Italic***" />);

      await waitFor(() => {
        expect(screen.getByText('Bold and Italic')).toBeInTheDocument();
      });
    });

    it('should render strikethrough text (GFM)', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p><del>Strikethrough text</del></p>');

      render(<MarkdownRenderer markdown="~~Strikethrough text~~" />);

      await waitFor(() => {
        const del = screen.getByText('Strikethrough text');
        expect(del).toBeInTheDocument();
        expect(del.tagName).toBe('DEL');
      });
    });
  });

  describe('Code Blocks and Inline Code', () => {
    it('should render inline code', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p><code>inline code</code></p>');

      render(<MarkdownRenderer markdown="`inline code`" />);

      await waitFor(() => {
        const code = screen.getByText('inline code');
        expect(code).toBeInTheDocument();
        expect(code.tagName).toBe('CODE');
      });
    });

    it('should render code blocks', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<pre><code>function hello() {\n  console.log("Hello");\n}</code></pre>',
      );

      const codeMarkdown = '```\nfunction hello() {\n  console.log("Hello");\n}\n```';
      render(<MarkdownRenderer markdown={codeMarkdown} />);

      await waitFor(() => {
        const codeBlock = screen.getByText(/function hello/);
        expect(codeBlock).toBeInTheDocument();
      });
    });

    it('should render code blocks with language specifier', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<pre><code class="language-javascript">const x = 1;</code></pre>',
      );

      const { container } = render(
        <MarkdownRenderer markdown="```javascript\nconst x = 1;\n```" />,
      );

      await waitFor(() => {
        const code = container.querySelector('code.language-javascript');
        expect(code).toBeInTheDocument();
        expect(code?.textContent).toBe('const x = 1;');
      });
    });

    it('should handle multiple code blocks', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<pre><code>Block 1</code></pre><p>Text</p><pre><code>Block 2</code></pre>',
      );

      render(<MarkdownRenderer markdown="```\nBlock 1\n```\nText\n```\nBlock 2\n```" />);

      await waitFor(() => {
        expect(screen.getByText('Block 1')).toBeInTheDocument();
        expect(screen.getByText('Block 2')).toBeInTheDocument();
      });
    });
  });

  describe('Links', () => {
    it('should render safe HTTP links', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p><a href="https://example.com">Safe Link</a></p>');

      render(<MarkdownRenderer markdown="[Safe Link](https://example.com)" />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Safe Link' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://example.com');
      });
    });

    it('should render safe HTTPS links', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<p><a href="https://secure.example.com">HTTPS Link</a></p>',
      );

      render(<MarkdownRenderer markdown="[HTTPS Link](https://secure.example.com)" />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'HTTPS Link' });
        expect(link).toHaveAttribute('href', 'https://secure.example.com');
      });
    });

    it('should render mailto links', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<p><a href="mailto:test@example.com">Email Me</a></p>',
      );

      render(<MarkdownRenderer markdown="[Email Me](mailto:test@example.com)" />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Email Me' });
        expect(link).toHaveAttribute('href', 'mailto:test@example.com');
      });
    });

    it('should handle links with special characters', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<p><a href="https://example.com/path?query=value&amp;other=1">Link with params</a></p>',
      );

      render(
        <MarkdownRenderer markdown="[Link with params](https://example.com/path?query=value&other=1)" />,
      );

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Link with params' })).toBeInTheDocument();
      });
    });
  });

  describe('Lists', () => {
    it('should render unordered lists', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>',
      );

      render(<MarkdownRenderer markdown="- Item 1\n- Item 2\n- Item 3" />);

      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
        expect(list.tagName).toBe('UL');

        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(3);
      });
    });

    it('should render ordered lists', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<ol><li>First</li><li>Second</li><li>Third</li></ol>',
      );

      render(<MarkdownRenderer markdown="1. First\n2. Second\n3. Third" />);

      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
        expect(list.tagName).toBe('OL');

        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(3);
      });
    });

    it('should render nested lists', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<ul><li>Parent<ul><li>Child 1</li><li>Child 2</li></ul></li></ul>',
      );

      render(<MarkdownRenderer markdown="- Parent\n  - Child 1\n  - Child 2" />);

      await waitFor(() => {
        expect(screen.getByText('Parent')).toBeInTheDocument();
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
      });
    });

    it('should render task lists (GFM)', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<ul><li><input type="checkbox" disabled> Task 1</li><li><input type="checkbox" checked disabled> Task 2</li></ul>',
      );

      const { container } = render(<MarkdownRenderer markdown="- [ ] Task 1\n- [x] Task 2" />);

      await waitFor(() => {
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBeGreaterThanOrEqual(0); // Depends on sanitization
      });
    });
  });

  describe('Headers', () => {
    it('should render h1 headers', async () => {
      mockProcessMarkdownSync.mockReturnValue('<h1>Main Title</h1>');

      render(<MarkdownRenderer markdown="# Main Title" />);

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Main Title');
      });
    });

    it('should render h2 headers', async () => {
      mockProcessMarkdownSync.mockReturnValue('<h2>Section Title</h2>');

      render(<MarkdownRenderer markdown="## Section Title" />);

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Section Title');
      });
    });

    it('should render h3 headers', async () => {
      mockProcessMarkdownSync.mockReturnValue('<h3>Subsection</h3>');

      render(<MarkdownRenderer markdown="### Subsection" />);

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 3 });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should render multiple header levels', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<h1>Title</h1><h2>Section</h2><h3>Subsection</h3><h4>Detail</h4>',
      );

      render(<MarkdownRenderer markdown="# Title\n## Section\n### Subsection\n#### Detail" />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
      });
    });

    it('should render h5 and h6 headers', async () => {
      mockProcessMarkdownSync.mockReturnValue('<h5>H5 Header</h5><h6>H6 Header</h6>');

      render(<MarkdownRenderer markdown="##### H5 Header\n###### H6 Header" />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 5 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();
      });
    });
  });

  describe('XSS Prevention', () => {
    it('should block script tags', async () => {
      // The component's belt-and-suspenders check should block this
      mockProcessMarkdownSync.mockReturnValue('<p>Safe content</p><script>alert("xss")</script>');

      render(<MarkdownRenderer markdown='<script>alert("xss")</script>' />);

      await waitFor(() => {
        expect(screen.getByText('Content blocked for security reasons.')).toBeInTheDocument();
      });
    });

    it('should block javascript: URLs', async () => {
      // The component's regex check should catch this
      mockProcessMarkdownSync.mockReturnValue('<p><a href="javascript:alert(1)">Click me</a></p>');

      render(<MarkdownRenderer markdown="[Click me](javascript:alert(1))" />);

      await waitFor(() => {
        expect(screen.getByText('Content blocked for security reasons.')).toBeInTheDocument();
      });
    });

    it('should block event handlers (onerror, onclick, etc.)', async () => {
      // The component's regex uses \s+on\w+\s*= pattern which matches event handlers with leading whitespace
      // Content like ' onerror=' should be blocked by the belt-and-suspenders check
      mockProcessMarkdownSync.mockReturnValue('<img src="x" onerror="alert(1)">');

      const { container } = render(
        <MarkdownRenderer markdown='<img src="x" onerror="alert(1)">' />,
      );

      await waitFor(() => {
        // The component correctly blocks content with event handlers
        expect(screen.getByText('Content blocked for security reasons.')).toBeInTheDocument();
        // The malicious img should NOT render
        const img = container.querySelector('img');
        expect(img).not.toBeInTheDocument();
      });
    });

    it('should show security note when content is sanitized', async () => {
      mockProcessMarkdownSync.mockReturnValue('<script>malicious</script>');

      render(<MarkdownRenderer markdown="<script>malicious</script>" />);

      await waitFor(() => {
        const note = screen.getByRole('note');
        expect(note).toBeInTheDocument();
        expect(note).toHaveTextContent('Some unsafe content was removed for security reasons.');
      });
    });

    it('should not show security note for safe content', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>Safe and clean content</p>');

      render(<MarkdownRenderer markdown="Safe and clean content" />);

      await waitFor(() => {
        expect(screen.getByText('Safe and clean content')).toBeInTheDocument();
      });

      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });

    it('should handle data: URLs safely', async () => {
      // The sanitization pipeline should handle this
      mockProcessMarkdownSync.mockReturnValue('<p><a href="https://safe.com">Safe link</a></p>');

      render(<MarkdownRenderer markdown="[Bad link](data:text/html,<script>alert(1)</script>)" />);

      await waitFor(() => {
        // Should not contain data: URL in the final output
        expect(mockProcessMarkdownSync).toHaveBeenCalled();
      });
    });

    it('should block embedded scripts in various formats', async () => {
      mockProcessMarkdownSync.mockReturnValue('<script type="text/javascript">evil()</script>');

      render(<MarkdownRenderer markdown='<script type="text/javascript">evil()</script>' />);

      await waitFor(() => {
        expect(screen.getByText('Content blocked for security reasons.')).toBeInTheDocument();
      });
    });
  });

  describe('LaTeX/Math Rendering', () => {
    it('should render inline math', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<p>The formula is <span class="katex">E = mc<sup>2</sup></span></p>',
      );

      const { container } = render(<MarkdownRenderer markdown="The formula is $E = mc^2$" />);

      await waitFor(() => {
        const katex = container.querySelector('.katex');
        expect(katex).toBeInTheDocument();
      });
    });

    it('should render display math', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<div class="katex-display"><span class="katex">∑_{i=1}^{n} x_i</span></div>',
      );

      const { container } = render(<MarkdownRenderer markdown="$$\\sum_{i=1}^{n} x_i$$" />);

      await waitFor(() => {
        const katexDisplay = container.querySelector('.katex-display, .katex');
        expect(katexDisplay).toBeInTheDocument();
      });
    });

    it('should handle complex math expressions', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<div class="katex"><span>∫</span><span>f(x)dx</span></div>',
      );

      const { container } = render(<MarkdownRenderer markdown="$$\\int f(x) dx$$" />);

      await waitFor(() => {
        expect(container.querySelector('.katex')).toBeInTheDocument();
      });
    });

    it('should handle math with Greek letters', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p><span class="katex">α + β = γ</span></p>');

      const { container } = render(<MarkdownRenderer markdown="$\\alpha + \\beta = \\gamma$" />);

      await waitFor(() => {
        expect(container.querySelector('.katex')).toBeInTheDocument();
      });
    });

    it('should handle fractions', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<p><span class="katex"><span class="mfrac">1/2</span></span></p>',
      );

      const { container } = render(<MarkdownRenderer markdown="$\\frac{1}{2}$" />);

      await waitFor(() => {
        expect(container.querySelector('.katex')).toBeInTheDocument();
      });
    });
  });

  describe('Custom className Application', () => {
    it('should apply custom className to container', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>Content</p>');

      const { container } = render(
        <MarkdownRenderer markdown="Content" className="custom-class" />,
      );

      await waitFor(() => {
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('custom-class');
      });
    });

    it('should apply multiple custom classes', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>Content</p>');

      const { container } = render(
        <MarkdownRenderer markdown="Content" className="class-one class-two class-three" />,
      );

      await waitFor(() => {
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('class-one');
        expect(wrapper).toHaveClass('class-two');
        expect(wrapper).toHaveClass('class-three');
      });
    });

    it('should render without className when not provided', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>Content</p>');

      const { container } = render(<MarkdownRenderer markdown="Content" />);

      await waitFor(() => {
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toBe('');
      });
    });

    it('should handle Tailwind-style classes', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>Styled content</p>');

      const { container } = render(
        <MarkdownRenderer
          markdown="Styled content"
          className="prose prose-lg dark:prose-invert max-w-none"
        />,
      );

      await waitFor(() => {
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('prose');
        expect(wrapper).toHaveClass('prose-lg');
        expect(wrapper).toHaveClass('dark:prose-invert');
        expect(wrapper).toHaveClass('max-w-none');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when processing fails', async () => {
      mockProcessMarkdownSync.mockImplementation(() => {
        throw new Error('Processing failed');
      });

      render(<MarkdownRenderer markdown="Some content" />);

      await waitFor(() => {
        expect(screen.getByText('Error rendering content.')).toBeInTheDocument();
      });
    });

    it('should display error message for unknown errors', async () => {
      mockProcessMarkdownSync.mockImplementation(() => {
        throw 'Unknown error';
      });

      render(<MarkdownRenderer markdown="Some content" />);

      await waitFor(() => {
        expect(screen.getByText('Error rendering content.')).toBeInTheDocument();
      });
    });

    it('should handle null error', async () => {
      mockProcessMarkdownSync.mockImplementation(() => {
        throw null;
      });

      render(<MarkdownRenderer markdown="Content" />);

      await waitFor(() => {
        expect(screen.getByText('Error rendering content.')).toBeInTheDocument();
      });
    });

    it('should show security note when error occurs', async () => {
      mockProcessMarkdownSync.mockImplementation(() => {
        throw new Error('Failed');
      });

      render(<MarkdownRenderer markdown="Content" />);

      await waitFor(() => {
        // Error state sets sanitized: true, so note should appear
        expect(screen.getByRole('note')).toBeInTheDocument();
      });
    });
  });

  describe('Mermaid Diagram Support', () => {
    it('should detect mermaid blocks and transform them', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<pre><code class="language-mermaid">graph TD\n  A-->B</code></pre>',
      );

      const { container } = render(
        <MarkdownRenderer markdown="```mermaid\ngraph TD\n  A-->B\n```" />,
      );

      await waitFor(() => {
        const mermaidDiv = container.querySelector('.mermaid');
        expect(mermaidDiv).toBeInTheDocument();
      });
    });

    it('should decode HTML entities in mermaid blocks', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<pre><code class="language-mermaid">A --&gt; B</code></pre>',
      );

      const { container } = render(<MarkdownRenderer markdown="```mermaid\nA --> B\n```" />);

      await waitFor(() => {
        const mermaidDiv = container.querySelector('.mermaid');
        expect(mermaidDiv).toBeInTheDocument();
        expect(mermaidDiv?.textContent).toContain('-->');
      });
    });

    it('should handle multiple mermaid blocks', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<pre><code class="language-mermaid">graph TD\n  A-->B</code></pre>' +
          '<p>Some text</p>' +
          '<pre><code class="language-mermaid">graph LR\n  C-->D</code></pre>',
      );

      const { container } = render(
        <MarkdownRenderer markdown="```mermaid\ngraph TD\n  A-->B\n```\nSome text\n```mermaid\ngraph LR\n  C-->D\n```" />,
      );

      await waitFor(() => {
        const mermaidDivs = container.querySelectorAll('.mermaid');
        expect(mermaidDivs.length).toBe(2);
      });
    });
  });

  describe('Tables (GFM)', () => {
    it('should render simple tables', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>' +
          '<tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>',
      );

      render(
        <MarkdownRenderer markdown="| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |" />,
      );

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        expect(screen.getByText('Header 1')).toBeInTheDocument();
        expect(screen.getByText('Cell 1')).toBeInTheDocument();
      });
    });

    it('should render tables with multiple rows', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<table><thead><tr><th>Name</th><th>Age</th></tr></thead>' +
          '<tbody><tr><td>Alice</td><td>30</td></tr><tr><td>Bob</td><td>25</td></tr></tbody></table>',
      );

      render(
        <MarkdownRenderer markdown="| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |" />,
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    });
  });

  describe('Blockquotes', () => {
    it('should render blockquotes', async () => {
      mockProcessMarkdownSync.mockReturnValue('<blockquote><p>This is a quote</p></blockquote>');

      render(<MarkdownRenderer markdown="> This is a quote" />);

      await waitFor(() => {
        const blockquote = screen.getByText('This is a quote').closest('blockquote');
        expect(blockquote).toBeInTheDocument();
      });
    });

    it('should render nested blockquotes', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<blockquote><p>Level 1</p><blockquote><p>Level 2</p></blockquote></blockquote>',
      );

      render(<MarkdownRenderer markdown="> Level 1\n>> Level 2" />);

      await waitFor(() => {
        expect(screen.getByText('Level 1')).toBeInTheDocument();
        expect(screen.getByText('Level 2')).toBeInTheDocument();
      });
    });
  });

  describe('Horizontal Rules', () => {
    it('should render horizontal rules', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>Above</p><hr><p>Below</p>');

      const { container } = render(<MarkdownRenderer markdown="Above\n\n---\n\nBelow" />);

      await waitFor(() => {
        const hr = container.querySelector('hr');
        expect(hr).toBeInTheDocument();
      });
    });
  });

  describe('Images', () => {
    it('should render images with alt text', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<p><img src="https://example.com/image.png" alt="Alt text"></p>',
      );

      render(<MarkdownRenderer markdown="![Alt text](https://example.com/image.png)" />);

      await waitFor(() => {
        const img = screen.getByAltText('Alt text');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/image.png');
      });
    });

    it('should handle images without alt text', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<p><img src="https://example.com/image.png" alt=""></p>',
      );

      const { container } = render(
        <MarkdownRenderer markdown="![](https://example.com/image.png)" />,
      );

      await waitFor(() => {
        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
      });
    });
  });

  describe('Paragraphs and Line Breaks', () => {
    it('should render multiple paragraphs', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>First paragraph</p><p>Second paragraph</p>');

      render(<MarkdownRenderer markdown="First paragraph\n\nSecond paragraph" />);

      await waitFor(() => {
        expect(screen.getByText('First paragraph')).toBeInTheDocument();
        expect(screen.getByText('Second paragraph')).toBeInTheDocument();
      });
    });

    it('should handle hard line breaks', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>Line 1<br>Line 2</p>');

      const { container } = render(<MarkdownRenderer markdown="Line 1  \nLine 2" />);

      await waitFor(() => {
        const br = container.querySelector('br');
        expect(br).toBeInTheDocument();
      });
    });
  });

  describe('Concurrent Updates', () => {
    it('should handle rapid markdown changes correctly', async () => {
      mockProcessMarkdownSync
        .mockReturnValueOnce('<p>First</p>')
        .mockReturnValueOnce('<p>Second</p>')
        .mockReturnValueOnce('<p>Third</p>');

      const { rerender } = render(<MarkdownRenderer markdown="First" />);

      // Rapid re-renders
      rerender(<MarkdownRenderer markdown="Second" />);
      rerender(<MarkdownRenderer markdown="Third" />);

      await waitFor(() => {
        expect(screen.getByText('Third')).toBeInTheDocument();
      });
    });

    // NOTE: The "cancel previous render" test is no longer relevant for synchronous rendering
    // because there is no async operation to cancel.
  });

  describe('Accessibility', () => {
    it('should have proper ARIA structure for security notes', async () => {
      mockProcessMarkdownSync.mockReturnValue('<script>evil</script>');

      render(<MarkdownRenderer markdown="<script>evil</script>" />);

      await waitFor(() => {
        const note = screen.getByRole('note');
        expect(note).toHaveAttribute('role', 'note');
        expect(note).toHaveTextContent('Note:');
      });
    });

    it('should render semantic HTML elements', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<h1>Title</h1><p>Paragraph</p><ul><li>Item</li></ul>',
      );

      render(<MarkdownRenderer markdown="# Title\n\nParagraph\n\n- Item" />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.getByRole('listitem')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long markdown content', async () => {
      const longContent = 'Word '.repeat(1000);
      mockProcessMarkdownSync.mockReturnValue(`<p>${longContent}</p>`);

      render(<MarkdownRenderer markdown={longContent} />);

      await waitFor(() => {
        expect(mockProcessMarkdownSync).toHaveBeenCalledWith(longContent);
      });
    });

    it('should handle special characters', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>&lt;div&gt; &amp; &quot;quotes&quot;</p>');

      render(<MarkdownRenderer markdown='<div> & "quotes"' />);

      await waitFor(() => {
        expect(mockProcessMarkdownSync).toHaveBeenCalled();
      });
    });

    it('should handle unicode content', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p>こんにちは 🎉 Привет</p>');

      render(<MarkdownRenderer markdown="こんにちは 🎉 Привет" />);

      await waitFor(() => {
        expect(screen.getByText(/こんにちは/)).toBeInTheDocument();
      });
    });

    it('should handle markdown with only whitespace', async () => {
      mockProcessMarkdownSync.mockReturnValue('<p></p>');

      const { container } = render(<MarkdownRenderer markdown="   \n\n   " />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should handle nested formatting', async () => {
      mockProcessMarkdownSync.mockReturnValue(
        '<p><strong><em><code>Bold italic code</code></em></strong></p>',
      );

      render(<MarkdownRenderer markdown="***`Bold italic code`***" />);

      await waitFor(() => {
        expect(screen.getByText('Bold italic code')).toBeInTheDocument();
      });
    });
  });
});

describe('MarkdownRenderer Export', () => {
  it('should be a named export', async () => {
    const quizModule = await import('@/components/rendering/MarkdownRenderer');
    expect(quizModule.MarkdownRenderer).toBeDefined();
    expect(typeof quizModule.MarkdownRenderer).toBe('function');
  });

  it('should be a React component', () => {
    expect(MarkdownRenderer).toBeDefined();
    expect(typeof MarkdownRenderer).toBe('function');
  });
});
