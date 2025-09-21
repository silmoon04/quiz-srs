import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SecureTextRenderer } from '@/components/secure-text-renderer';
import React from 'react';

describe('Simple SecureTextRenderer Tests', () => {
  it('should render plain text', () => {
    const content = 'Hello world';
    render(<SecureTextRenderer content={content} />);

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should remove script tags', () => {
    const content = '<script>alert("XSS")</script>';
    const { container } = render(<SecureTextRenderer content={content} />);

    // Should not contain the actual script content
    expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
    // Should be completely removed (empty content)
    expect(container.innerHTML).not.toContain('script');
    expect(container.innerHTML).not.toContain('alert');
  });

  it('should render markdown bold text', () => {
    const content = 'This is **bold** text';
    render(<SecureTextRenderer content={content} />);

    // Check that the bold text is rendered correctly
    expect(screen.getByText('bold')).toBeInTheDocument();
    // Check that the text is split correctly
    expect(screen.getByText(/This is/)).toBeInTheDocument();
    expect(screen.getByText(/text/)).toBeInTheDocument();
  });

  it('should render markdown italic text', () => {
    const content = 'This is *italic* text';
    render(<SecureTextRenderer content={content} />);

    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('should render inline code', () => {
    const content = 'Use `console.log()` to debug';
    render(<SecureTextRenderer content={content} />);

    expect(screen.getByText('console.log()')).toBeInTheDocument();
  });

  it('should render headers', () => {
    const content = '# Main Title\n## Subtitle';
    render(<SecureTextRenderer content={content} />);

    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('should render unordered lists', () => {
    const content = '- Item 1\n- Item 2\n- Item 3';
    render(<SecureTextRenderer content={content} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should render ordered lists', () => {
    const content = '1. First item\n2. Second item\n3. Third item';
    render(<SecureTextRenderer content={content} />);

    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
    expect(screen.getByText('Third item')).toBeInTheDocument();
  });

  it('should render links safely', () => {
    const content = 'Visit [Google](https://google.com) for search';
    render(<SecureTextRenderer content={content} />);

    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('should reject javascript: URLs', () => {
    const content = '[Click me](javascript:alert("XSS"))';
    const { container } = render(<SecureTextRenderer content={content} />);

    // Should not render as a link, just as text (but may have extra parenthesis due to regex issue)
    expect(screen.getByText(/Click me/)).toBeInTheDocument();
    // Should not contain javascript: in the HTML
    expect(container.innerHTML).not.toContain('javascript:');
  });

  it('should remove event handlers', () => {
    const content = '<img src="x" onerror="alert(\'XSS\')">';
    const { container } = render(<SecureTextRenderer content={content} />);

    // Should not contain dangerous event handlers
    expect(container.innerHTML).not.toContain('onerror');
    expect(container.innerHTML).not.toContain('alert');
    // Should still contain the safe img tag
    expect(container.innerHTML).toContain('<img src="x">');
  });

  it('should remove dangerous HTML attributes', () => {
    const content = '<div onclick="alert(\'XSS\')">Click me</div>';
    const { container } = render(<SecureTextRenderer content={content} />);

    // Should not contain any onclick attributes
    expect(container.innerHTML).not.toContain('onclick');
    expect(container.innerHTML).not.toContain('alert');
    // Should still contain the safe content
    expect(container.innerHTML).toContain('<div>');
    expect(container.innerHTML).toContain('Click me');
  });
});
