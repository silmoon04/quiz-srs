# SecureTextRenderer Component

A secure, comprehensive text renderer that supports markdown, LaTeX math, and provides complete XSS protection for quiz applications.

## Overview

The `SecureTextRenderer` component is designed to safely render user-generated content that may contain markdown, LaTeX math, and HTML while preventing cross-site scripting (XSS) attacks. It's specifically built for quiz applications where content needs to be both rich and secure.

## Features

### ✅ **Complete XSS Protection**

- Removes dangerous script tags, iframe, form, and input elements
- Sanitizes event handlers (`onclick`, `onload`, etc.)
- Blocks dangerous URLs (`javascript:`, `data:`, `vbscript:`)
- Removes dangerous HTML attributes

### ✅ **Rich Markdown Support**

- **Headers**: All levels (h1-h6)
- **Text Formatting**: Bold (`**text**`, `__text__`), italic (`*text*`, `_text_`), strikethrough (`~~text~~`)
- **Code**: Inline code (`` `code` ``) and code blocks (`code`)
- **Lists**: Unordered (`- item`), ordered (`1. item`), and task lists (`- [x] completed`)
- **Links**: `[text](url)` with URL validation
- **Images**: `![alt](url)` with URL validation
- **Tables**: Full table support with headers and data rows
- **Blockquotes**: `> text` support
- **Horizontal Rules**: `---`, `***`, `___` support

### ✅ **LaTeX Math Rendering**

- **Inline Math**: `$math$` renders as inline math
- **Display Math**: `$$math$$` renders as centered display math
- **Error Handling**: Malformed LaTeX gracefully handled
- **KaTeX Integration**: Uses KaTeX for high-quality math rendering

### ✅ **Advanced Features**

- Mixed content support (markdown + LaTeX + HTML)
- Complex combinations of all features
- Comprehensive error handling
- Unicode and special character support

## Usage

### Basic Usage

```tsx
import { SecureTextRenderer } from '@/components/secure-text-renderer';

function MyComponent() {
  const content = `
# Quiz Question

This is a **bold** question with *italic* text.

## Math Example

Inline math: $E = mc^2$

Display math:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

## Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## List Example

- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task
  `;

  return <SecureTextRenderer content={content} />;
}
```

### With Custom Styling

```tsx
<SecureTextRenderer content={content} className="my-custom-class" />
```

## Props

| Prop        | Type     | Default  | Description                          |
| ----------- | -------- | -------- | ------------------------------------ |
| `content`   | `string` | Required | The markdown/LaTeX content to render |
| `className` | `string` | `""`     | Additional CSS classes to apply      |

## Security Features

### XSS Protection

The component provides comprehensive XSS protection by:

1. **Detecting Raw HTML**: Content containing dangerous HTML tags is processed through sanitization
2. **Removing Dangerous Elements**: Script tags, iframes, forms, and dangerous input elements are completely removed
3. **Sanitizing Attributes**: Event handlers and dangerous attributes are stripped
4. **Validating URLs**: Only safe URLs (http, https, relative, anchor) are allowed in links and images

### Safe Content Processing

- **Markdown Content**: Processed through regex-based markdown parser
- **LaTeX Content**: Processed through KaTeX with error handling
- **Mixed Content**: Safely handles combinations of markdown, LaTeX, and HTML

## Supported Markdown Syntax

### Headers

```markdown
# Header 1

## Header 2

### Header 3

#### Header 4

##### Header 5

###### Header 6
```

### Text Formatting

```markdown
**Bold text** or **Bold text**
_Italic text_ or _Italic text_
~~Strikethrough text~~
`Inline code`
```

### Code Blocks

````markdown
```javascript
function hello() {
  console.log('Hello, World!');
}
```
````

````

### Lists
```markdown
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Another item

- [x] Completed task
- [ ] Incomplete task
````

### Links and Images

```markdown
[Link text](https://example.com)
![Alt text](https://example.com/image.jpg)
```

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Blockquotes

```markdown
> This is a blockquote
> It can span multiple lines
```

### Horizontal Rules

```markdown
---
---

---
```

## LaTeX Math Support

### Inline Math

```markdown
The equation $E = mc^2$ is famous.
```

### Display Math

```markdown
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
```

### Complex Math

```markdown
$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$
```

## Error Handling

The component gracefully handles:

- **Malformed Markdown**: Invalid syntax is rendered as plain text
- **Malformed LaTeX**: Math errors are displayed with error styling
- **Dangerous Content**: XSS attempts are completely blocked
- **Empty Content**: Empty or whitespace-only content is handled safely

## Performance

- **Lightweight**: Uses regex-based processing instead of heavy markdown parsers
- **Fast**: Optimized for quiz applications with frequent content updates
- **Memory Efficient**: No external dependencies for markdown processing

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **KaTeX**: Requires modern browser for math rendering
- **React**: Compatible with React 16.8+

## Dependencies

- **React**: For component rendering
- **KaTeX**: For LaTeX math rendering
- **No External Markdown Parser**: Uses custom regex-based processing

## Testing

The component includes comprehensive tests covering:

- **Security**: XSS protection and sanitization
- **Markdown**: All supported markdown features
- **LaTeX**: Math rendering and error handling
- **Edge Cases**: Empty content, malformed input, special characters
- **Integration**: Mixed content and complex scenarios

## Migration from TextRenderer

To migrate from the old `TextRenderer`:

1. **Import**: Change import to `SecureTextRenderer`
2. **Props**: Same props interface (`content`, `className`)
3. **Styling**: Existing styles should work with minor adjustments
4. **Testing**: Update tests to use new component

## Troubleshooting

### Common Issues

1. **Math not rendering**: Ensure KaTeX is properly loaded
2. **Styling issues**: Check CSS conflicts with KaTeX styles
3. **Performance**: Large content may need pagination or virtualization

### Debug Mode

Enable debug logging by adding console.log statements in the component:

```tsx
// In processContent function
console.log('Processing content:', text);
console.log('Has raw HTML:', hasRawHtml);
```

## Contributing

When adding new features:

1. **Security First**: Always consider XSS implications
2. **Test Coverage**: Add comprehensive tests
3. **Documentation**: Update this documentation
4. **Performance**: Consider impact on rendering speed

## License

This component is part of the quiz-srs project and follows the same license terms.
