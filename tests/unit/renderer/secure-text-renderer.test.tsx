import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/rendering/MarkdownRenderer';
import React from 'react';

describe.skip('SecureTextRenderer Tests', () => {
  describe('Basic Functionality', () => {
    it('should render plain text', () => {
      const content = 'Hello world';
      render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('should render markdown bold text', () => {
      const content = 'This is **bold** text';
      render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText('This is')).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('should render markdown italic text', () => {
      const content = 'This is *italic* text';
      render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText('This is')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('should render inline code', () => {
      const content = 'Use `console.log()` to debug';
      render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText('Use')).toBeInTheDocument();
      expect(screen.getByText('console.log()')).toBeInTheDocument();
      expect(screen.getByText('to debug')).toBeInTheDocument();
    });

    it('should render headers', () => {
      const content = '# Main Title\n## Subtitle\n### Small Title';
      render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Small Title')).toBeInTheDocument();
    });

    it('should render safe links', () => {
      const content = 'Visit [Google](https://google.com) for search';
      render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText('Visit')).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('for search')).toBeInTheDocument();
    });
  });

  describe('XSS Protection', () => {
    it('should escape script tags', () => {
      const content = '<script>alert("XSS")</script>';
      render(<MarkdownRenderer markdown={content} />);

      // Should not contain the actual script content
      expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
      // Should contain escaped version
      expect(screen.getByText(/&lt;script&gt;/)).toBeInTheDocument();
    });

    it('should escape event handlers', () => {
      const content = '<img src="x" onerror="alert(\'XSS\')">';
      render(<MarkdownRenderer markdown={content} />);

      // Should not contain the alert
      expect(screen.queryByText("alert('XSS')")).not.toBeInTheDocument();
      // Should contain escaped version
      expect(screen.getByText(/&lt;img/)).toBeInTheDocument();
    });

    it('should reject javascript: URLs', () => {
      const content = '[Click me](javascript:alert("XSS"))';
      render(<MarkdownRenderer markdown={content} />);

      // Should not render as a link, just as text
      expect(screen.getByText('Click me')).toBeInTheDocument();
      // Should not have javascript: in href
      const link = screen.queryByRole('link');
      if (link) {
        expect(link).not.toHaveAttribute('href', 'javascript:alert("XSS")');
      }
    });

    it('should escape dangerous HTML attributes', () => {
      const content = '<div onclick="alert(\'XSS\')">Click me</div>';
      render(<MarkdownRenderer markdown={content} />);

      // Should not contain the alert
      expect(screen.queryByText("alert('XSS')")).not.toBeInTheDocument();
      // Should contain escaped version
      expect(screen.getByText(/&lt;div/)).toBeInTheDocument();
    });
  });

  describe('Safe HTML Elements', () => {
    it('should allow basic formatting through markdown', () => {
      const content = '**Bold** and *italic* text';
      render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    });

    it('should allow code elements through markdown', () => {
      const content = 'Use `code` for inline code';
      render(<MarkdownRenderer markdown={content} />);

      expect(screen.getByText('code')).toBeInTheDocument();
    });
  });
});
