import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (className merge utility)', () => {
  it('should return empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('should return a single class name unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('should merge multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes with boolean values', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz');
  });

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('should handle object syntax for conditional classes', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should handle array syntax', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should merge conflicting Tailwind classes correctly', () => {
    // twMerge should resolve conflicts by keeping the last conflicting class
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-white', 'bg-black')).toBe('bg-black');
  });

  it('should handle complex Tailwind class merging', () => {
    expect(cn('p-4', 'pt-2')).toBe('p-4 pt-2');
    expect(cn('w-full', 'w-1/2')).toBe('w-1/2');
  });

  it('should handle mixed input types', () => {
    expect(cn('foo', ['bar', 'baz'], { qux: true, quux: false })).toBe('foo bar baz qux');
  });

  it('should handle empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });

  it('should handle whitespace-only strings', () => {
    expect(cn('foo', '   ', 'bar')).toBe('foo bar');
  });

  it('should handle deeply nested arrays', () => {
    expect(cn(['foo', ['bar', ['baz']]])).toBe('foo bar baz');
  });

  it('should handle Tailwind responsive prefixes', () => {
    expect(cn('sm:px-2', 'md:px-4', 'lg:px-6')).toBe('sm:px-2 md:px-4 lg:px-6');
  });

  it('should merge conflicting responsive Tailwind classes', () => {
    expect(cn('sm:px-2', 'sm:px-4')).toBe('sm:px-4');
  });

  it('should handle Tailwind state variants', () => {
    expect(cn('hover:bg-blue-500', 'focus:bg-blue-600')).toBe(
      'hover:bg-blue-500 focus:bg-blue-600',
    );
  });

  it('should merge conflicting state variant classes', () => {
    expect(cn('hover:bg-blue-500', 'hover:bg-red-500')).toBe('hover:bg-red-500');
  });
});
