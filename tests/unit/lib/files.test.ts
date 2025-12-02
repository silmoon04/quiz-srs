import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  readFileAsText,
  safeReadFileAsText,
  getFileExtension,
  isSupportedExtension,
  isMarkdownFile,
  isJsonFile,
  validateFile,
  isValidContent,
  tryParseJson,
  createFileFromString,
  getMimeTypeFromExtension,
  formatFileSize,
  SUPPORTED_FILE_EXTENSIONS,
  SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/files';

describe('files utility', () => {
  describe('constants', () => {
    it('should export supported file extensions', () => {
      expect(SUPPORTED_FILE_EXTENSIONS).toContain('.json');
      expect(SUPPORTED_FILE_EXTENSIONS).toContain('.md');
      expect(SUPPORTED_FILE_EXTENSIONS).toContain('.markdown');
    });

    it('should export supported MIME types', () => {
      expect(SUPPORTED_MIME_TYPES).toContain('application/json');
      expect(SUPPORTED_MIME_TYPES).toContain('text/markdown');
      expect(SUPPORTED_MIME_TYPES).toContain('text/plain');
    });

    it('should have MAX_FILE_SIZE as 10MB', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });
  });

  describe('readFileAsText', () => {
    it('should read a text file successfully', async () => {
      const content = 'Hello, World!';
      const file = new File([content], 'test.txt', { type: 'text/plain' });

      const result = await readFileAsText(file);

      expect(result).toBe(content);
    });

    it('should read a JSON file successfully', async () => {
      const jsonContent = JSON.stringify({ name: 'Test Quiz', version: '1.0' });
      const file = new File([jsonContent], 'quiz.json', { type: 'application/json' });

      const result = await readFileAsText(file);

      expect(result).toBe(jsonContent);
      expect(JSON.parse(result)).toEqual({ name: 'Test Quiz', version: '1.0' });
    });

    it('should read a Markdown file successfully', async () => {
      const mdContent = '# Quiz Title\n\n## Chapter 1\n\nQuestion content here.';
      const file = new File([mdContent], 'quiz.md', { type: 'text/markdown' });

      const result = await readFileAsText(file);

      expect(result).toBe(mdContent);
    });

    it('should read an empty file', async () => {
      const file = new File([''], 'empty.txt', { type: 'text/plain' });

      const result = await readFileAsText(file);

      expect(result).toBe('');
    });

    it('should read a file with special characters', async () => {
      const content = 'Special chars: éàü 日本語 emoji 🎉';
      const file = new File([content], 'special.txt', { type: 'text/plain' });

      const result = await readFileAsText(file);

      expect(result).toBe(content);
    });

    it('should read a file with newlines and whitespace', async () => {
      const content = '  Line 1\n  Line 2\n\n  Line 4  ';
      const file = new File([content], 'whitespace.txt', { type: 'text/plain' });

      const result = await readFileAsText(file);

      expect(result).toBe(content);
    });

    it('should reject when no file is provided', async () => {
      await expect(readFileAsText(null as unknown as File)).rejects.toThrow('No file provided');
    });

    it('should reject when undefined is provided', async () => {
      await expect(readFileAsText(undefined as unknown as File)).rejects.toThrow(
        'No file provided',
      );
    });

    it('should handle large files', async () => {
      const largeContent = 'x'.repeat(1000000); // 1MB of content
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' });

      const result = await readFileAsText(file);

      expect(result.length).toBe(1000000);
    });

    it('should read file with LaTeX content', async () => {
      const latexContent = 'The formula is $E = mc^2$ and \\frac{1}{2}';
      const file = new File([latexContent], 'latex.md', { type: 'text/markdown' });

      const result = await readFileAsText(file);

      expect(result).toBe(latexContent);
    });
  });

  describe('safeReadFileAsText', () => {
    it('should return success result for valid file', async () => {
      const content = 'Test content';
      const file = new File([content], 'test.txt', { type: 'text/plain' });

      const result = await safeReadFileAsText(file);

      expect(result.success).toBe(true);
      expect(result.content).toBe(content);
      expect(result.error).toBeUndefined();
    });

    it('should return error result when file is null', async () => {
      const result = await safeReadFileAsText(null as unknown as File);

      expect(result.success).toBe(false);
      expect(result.content).toBeUndefined();
      expect(result.error).toBe('No file provided');
    });

    it('should return error result when file is undefined', async () => {
      const result = await safeReadFileAsText(undefined as unknown as File);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No file provided');
    });

    it('should handle FileReader error gracefully', async () => {
      // Create a mock file with a broken read
      const file = new File(['content'], 'test.txt');

      // Mock FileReader to simulate error
      const originalFileReader = global.FileReader;
      const mockError = new Error('Mock read error');

      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
        onerror: (() => void) | null = null;
        onabort: (() => void) | null = null;
        result: string | ArrayBuffer | null = null;

        readAsText() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        }
      }

      global.FileReader = MockFileReader as unknown as typeof FileReader;

      const result = await safeReadFileAsText(file);

      global.FileReader = originalFileReader;

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error reading file');
    });
  });

  describe('getFileExtension', () => {
    it('should return extension for .json file', () => {
      expect(getFileExtension('quiz.json')).toBe('.json');
    });

    it('should return extension for .md file', () => {
      expect(getFileExtension('quiz.md')).toBe('.md');
    });

    it('should return extension for .markdown file', () => {
      expect(getFileExtension('quiz.markdown')).toBe('.markdown');
    });

    it('should return lowercase extension', () => {
      expect(getFileExtension('quiz.JSON')).toBe('.json');
      expect(getFileExtension('quiz.MD')).toBe('.md');
      expect(getFileExtension('quiz.MARKDOWN')).toBe('.markdown');
    });

    it('should handle files with multiple dots', () => {
      expect(getFileExtension('my.quiz.file.json')).toBe('.json');
      expect(getFileExtension('test.quiz.v2.md')).toBe('.md');
    });

    it('should return empty string for files without extension', () => {
      expect(getFileExtension('filename')).toBe('');
      expect(getFileExtension('README')).toBe('');
    });

    it('should return empty string for empty filename', () => {
      expect(getFileExtension('')).toBe('');
    });

    it('should return empty string for null/undefined', () => {
      expect(getFileExtension(null as unknown as string)).toBe('');
      expect(getFileExtension(undefined as unknown as string)).toBe('');
    });

    it('should handle files ending with dot', () => {
      expect(getFileExtension('filename.')).toBe('');
    });

    it('should handle hidden files', () => {
      expect(getFileExtension('.gitignore')).toBe('.gitignore');
      expect(getFileExtension('.env.local')).toBe('.local');
    });

    it('should handle paths with directories', () => {
      expect(getFileExtension('path/to/file.json')).toBe('.json');
      expect(getFileExtension('path/to/file.md')).toBe('.md');
    });

    it('should handle special characters in filename', () => {
      expect(getFileExtension('my quiz (1).json')).toBe('.json');
      expect(getFileExtension('test-quiz_v2.md')).toBe('.md');
    });
  });

  describe('isSupportedExtension', () => {
    it('should return true for .json', () => {
      expect(isSupportedExtension('quiz.json')).toBe(true);
    });

    it('should return true for .md', () => {
      expect(isSupportedExtension('quiz.md')).toBe(true);
    });

    it('should return true for .markdown', () => {
      expect(isSupportedExtension('quiz.markdown')).toBe(true);
    });

    it('should return true for uppercase extensions', () => {
      expect(isSupportedExtension('quiz.JSON')).toBe(true);
      expect(isSupportedExtension('quiz.MD')).toBe(true);
    });

    it('should return false for unsupported extensions', () => {
      expect(isSupportedExtension('quiz.txt')).toBe(false);
      expect(isSupportedExtension('quiz.pdf')).toBe(false);
      expect(isSupportedExtension('quiz.docx')).toBe(false);
      expect(isSupportedExtension('quiz.html')).toBe(false);
    });

    it('should return false for files without extension', () => {
      expect(isSupportedExtension('README')).toBe(false);
      expect(isSupportedExtension('filename')).toBe(false);
    });

    it('should return false for empty filename', () => {
      expect(isSupportedExtension('')).toBe(false);
    });
  });

  describe('isMarkdownFile', () => {
    it('should return true for .md files', () => {
      expect(isMarkdownFile('quiz.md')).toBe(true);
    });

    it('should return true for .markdown files', () => {
      expect(isMarkdownFile('quiz.markdown')).toBe(true);
    });

    it('should return true for uppercase extensions', () => {
      expect(isMarkdownFile('quiz.MD')).toBe(true);
      expect(isMarkdownFile('quiz.MARKDOWN')).toBe(true);
    });

    it('should return false for non-markdown files', () => {
      expect(isMarkdownFile('quiz.json')).toBe(false);
      expect(isMarkdownFile('quiz.txt')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isMarkdownFile('')).toBe(false);
    });
  });

  describe('isJsonFile', () => {
    it('should return true for .json files', () => {
      expect(isJsonFile('quiz.json')).toBe(true);
    });

    it('should return true for uppercase .JSON', () => {
      expect(isJsonFile('quiz.JSON')).toBe(true);
    });

    it('should return false for non-json files', () => {
      expect(isJsonFile('quiz.md')).toBe(false);
      expect(isJsonFile('quiz.txt')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isJsonFile('')).toBe(false);
    });

    it('should handle files with json in name but different extension', () => {
      expect(isJsonFile('quiz-json.md')).toBe(false);
      expect(isJsonFile('myjson.txt')).toBe(false);
    });
  });

  describe('validateFile', () => {
    it('should return valid for a proper JSON file', () => {
      const file = new File(['{}'], 'quiz.json', { type: 'application/json' });

      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for a proper MD file', () => {
      const file = new File(['# Quiz'], 'quiz.md', { type: 'text/markdown' });

      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for a proper .markdown file', () => {
      const file = new File(['# Quiz'], 'quiz.markdown', { type: 'text/markdown' });

      const result = validateFile(file);

      expect(result.isValid).toBe(true);
    });

    it('should return invalid when file is null', () => {
      const result = validateFile(null as unknown as File);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('No file provided');
    });

    it('should return invalid when file is undefined', () => {
      const result = validateFile(undefined as unknown as File);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('No file provided');
    });

    it('should return invalid for empty file', () => {
      const file = new File([''], 'empty.json', { type: 'application/json' });
      Object.defineProperty(file, 'size', { value: 0 });

      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File is empty');
    });

    it('should return invalid for file exceeding max size', () => {
      const file = new File(['x'], 'large.json', { type: 'application/json' });
      Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE + 1 });

      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File is too large');
      expect(result.error).toContain('Maximum size is 10MB');
    });

    it('should return invalid for unsupported file type', () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });

      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported file type');
      expect(result.error).toContain('.pdf');
    });

    it('should return invalid for file without extension', () => {
      const file = new File(['content'], 'README', { type: 'text/plain' });

      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported file type');
      expect(result.error).toContain('(no extension)');
    });

    it('should return invalid for file with empty name', () => {
      const file = new File(['content'], '', { type: 'text/plain' });

      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File has no name');
    });

    it('should return invalid for file with whitespace-only name', () => {
      const file = new File(['content'], '   ', { type: 'text/plain' });

      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File has no name');
    });

    it('should handle file at exactly max size', () => {
      const file = new File(['x'], 'large.json', { type: 'application/json' });
      Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE });

      const result = validateFile(file);

      expect(result.isValid).toBe(true);
    });

    it('should handle files with special characters in name', () => {
      const file = new File(['{}'], 'my quiz (1).json', { type: 'application/json' });

      const result = validateFile(file);

      expect(result.isValid).toBe(true);
    });

    it('should handle files with very long names', () => {
      const longName = 'a'.repeat(255) + '.json';
      const file = new File(['{}'], longName, { type: 'application/json' });

      const result = validateFile(file);

      expect(result.isValid).toBe(true);
    });
  });

  describe('isValidContent', () => {
    it('should return true for non-empty content', () => {
      expect(isValidContent('Hello World')).toBe(true);
    });

    it('should return true for content with only special characters', () => {
      expect(isValidContent('{}[]')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidContent('')).toBe(false);
    });

    it('should return false for whitespace-only string', () => {
      expect(isValidContent('   ')).toBe(false);
      expect(isValidContent('\n\n')).toBe(false);
      expect(isValidContent('\t\t')).toBe(false);
      expect(isValidContent('  \n  \t  ')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(isValidContent(null as unknown as string)).toBe(false);
      expect(isValidContent(undefined as unknown as string)).toBe(false);
      expect(isValidContent(123 as unknown as string)).toBe(false);
    });

    it('should return true for content with leading/trailing whitespace', () => {
      expect(isValidContent('  content  ')).toBe(true);
    });
  });

  describe('tryParseJson', () => {
    it('should parse valid JSON object', () => {
      const result = tryParseJson('{"name": "Test"}');

      expect(result).toEqual({ name: 'Test' });
    });

    it('should parse valid JSON array', () => {
      const result = tryParseJson('[1, 2, 3]');

      expect(result).toEqual([1, 2, 3]);
    });

    it('should parse JSON primitives', () => {
      expect(tryParseJson('"string"')).toBe('string');
      expect(tryParseJson('123')).toBe(123);
      expect(tryParseJson('true')).toBe(true);
      expect(tryParseJson('null')).toBe(null);
    });

    it('should return null for invalid JSON', () => {
      expect(tryParseJson('not json')).toBe(null);
      expect(tryParseJson('{invalid}')).toBe(null);
      expect(tryParseJson("{'single': 'quotes'}")).toBe(null);
    });

    it('should return null for empty string', () => {
      expect(tryParseJson('')).toBe(null);
    });

    it('should return null for undefined', () => {
      expect(tryParseJson(undefined as unknown as string)).toBe(null);
    });

    it('should parse complex nested JSON', () => {
      const complex = JSON.stringify({
        name: 'Quiz',
        chapters: [{ id: 1, questions: [{ text: 'Q1' }] }],
        metadata: { version: '1.0' },
      });

      const result = tryParseJson(complex);

      expect(result).toEqual({
        name: 'Quiz',
        chapters: [{ id: 1, questions: [{ text: 'Q1' }] }],
        metadata: { version: '1.0' },
      });
    });

    it('should parse JSON with unicode', () => {
      const result = tryParseJson('{"emoji": "🎉", "japanese": "日本語"}');

      expect(result).toEqual({ emoji: '🎉', japanese: '日本語' });
    });

    it('should parse JSON with escaped characters', () => {
      const result = tryParseJson('{"path": "C:\\\\Users\\\\test"}');

      expect(result).toEqual({ path: 'C:\\Users\\test' });
    });
  });

  describe('createFileFromString', () => {
    it('should create a JSON file', () => {
      const content = '{"test": true}';
      const file = createFileFromString(content, 'test.json');

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test.json');
      expect(file.type).toBe('application/json');
    });

    it('should create a Markdown file', () => {
      const content = '# Title';
      const file = createFileFromString(content, 'test.md');

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test.md');
      expect(file.type).toBe('text/markdown');
    });

    it('should create a .markdown file', () => {
      const content = '# Title';
      const file = createFileFromString(content, 'test.markdown');

      expect(file.name).toBe('test.markdown');
      expect(file.type).toBe('text/markdown');
    });

    it('should use provided MIME type', () => {
      const content = 'content';
      const file = createFileFromString(content, 'test.txt', 'text/custom');

      expect(file.type).toBe('text/custom');
    });

    it('should default to text/plain for unknown extension', () => {
      const content = 'content';
      const file = createFileFromString(content, 'test.xyz');

      expect(file.type).toBe('text/plain');
    });

    it('should preserve file content', async () => {
      const content = 'Hello, World!';
      const file = createFileFromString(content, 'test.txt');

      const readContent = await readFileAsText(file);

      expect(readContent).toBe(content);
    });

    it('should handle empty content', () => {
      const file = createFileFromString('', 'empty.json');

      expect(file.size).toBe(0);
    });

    it('should handle large content', () => {
      const largeContent = 'x'.repeat(1000000);
      const file = createFileFromString(largeContent, 'large.txt');

      expect(file.size).toBe(1000000);
    });
  });

  describe('getMimeTypeFromExtension', () => {
    it('should return application/json for .json', () => {
      expect(getMimeTypeFromExtension('file.json')).toBe('application/json');
    });

    it('should return text/markdown for .md', () => {
      expect(getMimeTypeFromExtension('file.md')).toBe('text/markdown');
    });

    it('should return text/markdown for .markdown', () => {
      expect(getMimeTypeFromExtension('file.markdown')).toBe('text/markdown');
    });

    it('should return text/plain for unknown extensions', () => {
      expect(getMimeTypeFromExtension('file.txt')).toBe('text/plain');
      expect(getMimeTypeFromExtension('file.xyz')).toBe('text/plain');
    });

    it('should return text/plain for files without extension', () => {
      expect(getMimeTypeFromExtension('README')).toBe('text/plain');
    });

    it('should handle uppercase extensions', () => {
      expect(getMimeTypeFromExtension('file.JSON')).toBe('application/json');
      expect(getMimeTypeFromExtension('file.MD')).toBe('text/markdown');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1)).toBe('1 B');
      expect(formatFileSize(100)).toBe('100 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1536)).toBe('1.50 KB');
      expect(formatFileSize(10240)).toBe('10.00 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatFileSize(1572864)).toBe('1.50 MB');
      expect(formatFileSize(10485760)).toBe('10.00 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
      expect(formatFileSize(1610612736)).toBe('1.50 GB');
    });

    it('should handle negative values', () => {
      expect(formatFileSize(-1)).toBe('0 B');
      expect(formatFileSize(-1000)).toBe('0 B');
    });

    it('should handle very large values', () => {
      const veryLarge = 10 * 1024 * 1024 * 1024; // 10 GB
      expect(formatFileSize(veryLarge)).toBe('10.00 GB');
    });

    it('should handle fractional values', () => {
      expect(formatFileSize(1.5)).toBe('2 B'); // Rounds due to integer display for bytes
    });
  });

  describe('FileReader error scenarios', () => {
    let originalFileReader: typeof FileReader;

    beforeEach(() => {
      originalFileReader = global.FileReader;
    });

    afterEach(() => {
      global.FileReader = originalFileReader;
    });

    it('should handle FileReader abort', async () => {
      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
        onerror: (() => void) | null = null;
        onabort: (() => void) | null = null;
        result: string | ArrayBuffer | null = null;

        readAsText() {
          setTimeout(() => {
            if (this.onabort) {
              this.onabort();
            }
          }, 0);
        }
      }

      global.FileReader = MockFileReader as unknown as typeof FileReader;

      const file = new File(['content'], 'test.txt');

      await expect(readFileAsText(file)).rejects.toThrow('File reading was aborted');
    });

    it('should handle FileReader returning non-string result', async () => {
      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
        onerror: (() => void) | null = null;
        onabort: (() => void) | null = null;
        result: string | ArrayBuffer | null = null;

        readAsText() {
          setTimeout(() => {
            if (this.onload) {
              // Simulate returning ArrayBuffer instead of string
              this.onload({
                target: {
                  result: new ArrayBuffer(8),
                },
              } as unknown as ProgressEvent<FileReader>);
            }
          }, 0);
        }
      }

      global.FileReader = MockFileReader as unknown as typeof FileReader;

      const file = new File(['content'], 'test.txt');

      await expect(readFileAsText(file)).rejects.toThrow('Failed to read file as text');
    });

    it('should handle FileReader onload with null target', async () => {
      class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
        onerror: (() => void) | null = null;
        onabort: (() => void) | null = null;
        result: string | ArrayBuffer | null = null;

        readAsText() {
          setTimeout(() => {
            if (this.onload) {
              this.onload({
                target: null,
              } as unknown as ProgressEvent<FileReader>);
            }
          }, 0);
        }
      }

      global.FileReader = MockFileReader as unknown as typeof FileReader;

      const file = new File(['content'], 'test.txt');

      await expect(readFileAsText(file)).rejects.toThrow('Failed to read file as text');
    });
  });

  describe('edge cases', () => {
    describe('malformed content handling', () => {
      it('should handle truncated JSON', () => {
        const truncated = '{"name": "Test", "data": [1, 2,';
        expect(tryParseJson(truncated)).toBe(null);
      });

      it('should handle JSON with trailing comma', () => {
        const withTrailingComma = '{"name": "Test",}';
        expect(tryParseJson(withTrailingComma)).toBe(null);
      });

      it('should handle JSON with comments', () => {
        const withComments = '{"name": "Test" /* comment */}';
        expect(tryParseJson(withComments)).toBe(null);
      });
    });

    describe('boundary conditions', () => {
      it('should validate file at 1 byte under max size', () => {
        const file = new File(['x'], 'test.json', { type: 'application/json' });
        Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE - 1 });

        const result = validateFile(file);

        expect(result.isValid).toBe(true);
      });

      it('should validate file at 1 byte over max size', () => {
        const file = new File(['x'], 'test.json', { type: 'application/json' });
        Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE + 1 });

        const result = validateFile(file);

        expect(result.isValid).toBe(false);
      });

      it('should handle file size calculation for large files', () => {
        const file = new File(['x'], 'test.json', { type: 'application/json' });
        Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 }); // 15MB

        const result = validateFile(file);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('15.00MB');
      });
    });

    describe('unicode and special characters', () => {
      it('should handle filenames with unicode characters', () => {
        const file = new File(['{}'], '日本語クイズ.json', { type: 'application/json' });

        const result = validateFile(file);

        expect(result.isValid).toBe(true);
      });

      it('should handle filenames with emoji', () => {
        const file = new File(['{}'], 'quiz🎉.json', { type: 'application/json' });

        const result = validateFile(file);

        expect(result.isValid).toBe(true);
      });

      it('should handle content with null bytes', async () => {
        const contentWithNull = 'before\0after';
        const file = new File([contentWithNull], 'test.txt', { type: 'text/plain' });

        const result = await readFileAsText(file);

        expect(result).toBe(contentWithNull);
      });

      it('should handle content with BOM', async () => {
        const contentWithBOM = '\uFEFF{"name": "Test"}';
        const file = new File([contentWithBOM], 'test.json', { type: 'application/json' });

        const result = await readFileAsText(file);

        // BOM may or may not be preserved depending on the environment
        // The important thing is that the actual content is preserved
        expect(result).toContain('{"name": "Test"}');
      });
    });

    describe('concurrent operations', () => {
      it('should handle multiple simultaneous reads', async () => {
        const files = Array.from(
          { length: 10 },
          (_, i) => new File([`content-${i}`], `file-${i}.txt`, { type: 'text/plain' }),
        );

        const results = await Promise.all(files.map((f) => readFileAsText(f)));

        results.forEach((result, i) => {
          expect(result).toBe(`content-${i}`);
        });
      });
    });
  });

  describe('integration scenarios', () => {
    it('should validate and read a file end-to-end', async () => {
      const jsonContent = JSON.stringify({
        name: 'Test Quiz',
        chapters: [{ id: 1, title: 'Chapter 1' }],
      });
      const file = createFileFromString(jsonContent, 'quiz.json');

      // Validate
      const validation = validateFile(file);
      expect(validation.isValid).toBe(true);

      // Read
      const content = await readFileAsText(file);
      expect(content).toBe(jsonContent);

      // Parse
      const parsed = tryParseJson(content);
      expect(parsed).toEqual({
        name: 'Test Quiz',
        chapters: [{ id: 1, title: 'Chapter 1' }],
      });
    });

    it('should handle markdown quiz file workflow', async () => {
      const mdContent = `# My Quiz

## Chapter 1

### Question 1

What is 2 + 2?

- [ ] 3
- [x] 4
- [ ] 5`;

      const file = createFileFromString(mdContent, 'quiz.md');

      expect(validateFile(file).isValid).toBe(true);
      expect(isMarkdownFile(file.name)).toBe(true);
      expect(isJsonFile(file.name)).toBe(false);

      const content = await readFileAsText(file);
      expect(isValidContent(content)).toBe(true);
      expect(content).toContain('# My Quiz');
    });

    it('should properly format validation error messages', () => {
      const cases = [
        {
          file: new File([''], 'test', { type: 'text/plain' }),
          patch: { size: 0 },
          expectedError: 'File is empty',
        },
        {
          file: new File(['x'], 'test.pdf', { type: 'application/pdf' }),
          patch: {},
          expectedError: 'Unsupported file type: .pdf',
        },
      ];

      cases.forEach(({ file, patch, expectedError }) => {
        Object.keys(patch).forEach((key) => {
          Object.defineProperty(file, key, { value: patch[key as keyof typeof patch] });
        });

        const result = validateFile(file);
        expect(result.error).toContain(expectedError);
      });
    });
  });
});
