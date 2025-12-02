/**
 * File handling utilities for quiz file operations.
 * Provides functions for reading, validating, and parsing files.
 */

/**
 * Supported file types for quiz files
 */
export const SUPPORTED_FILE_EXTENSIONS = ['.json', '.md', '.markdown'] as const;
export const SUPPORTED_MIME_TYPES = ['application/json', 'text/markdown', 'text/plain'] as const;

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * File read result
 */
export interface FileReadResult {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Reads a file as text using FileReader API
 * @param file - The file to read
 * @returns Promise resolving to the file content as string
 * @throws Error if file reading fails
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.onabort = () => {
      reject(new Error('File reading was aborted'));
    };

    reader.readAsText(file);
  });
}

/**
 * Safely reads a file and returns a result object instead of throwing
 * @param file - The file to read
 * @returns Promise resolving to FileReadResult
 */
export async function safeReadFileAsText(file: File): Promise<FileReadResult> {
  try {
    const content = await readFileAsText(file);
    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error reading file',
    };
  }
}

/**
 * Gets the file extension from a filename (lowercase, including dot)
 * @param filename - The filename to extract extension from
 * @returns The file extension in lowercase (e.g., '.json')
 */
export function getFileExtension(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return '';
  }

  return filename.slice(lastDotIndex).toLowerCase();
}

/**
 * Checks if a file has a supported extension
 * @param filename - The filename to check
 * @returns true if the extension is supported
 */
export function isSupportedExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return (SUPPORTED_FILE_EXTENSIONS as readonly string[]).includes(extension);
}

/**
 * Checks if a file is a Markdown file based on its extension
 * @param filename - The filename to check
 * @returns true if the file is a Markdown file
 */
export function isMarkdownFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  return extension === '.md' || extension === '.markdown';
}

/**
 * Checks if a file is a JSON file based on its extension
 * @param filename - The filename to check
 * @returns true if the file is a JSON file
 */
export function isJsonFile(filename: string): boolean {
  return getFileExtension(filename) === '.json';
}

/**
 * Validates a file for quiz import
 * @param file - The file to validate
 * @returns FileValidationResult with validation status and any error message
 */
export function validateFile(file: File): FileValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file name exists
  if (!file.name || file.name.trim() === '') {
    return { isValid: false, error: 'File has no name' };
  }

  // Check file size
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File is too large (${sizeMB}MB). Maximum size is 10MB`,
    };
  }

  // Check file extension
  if (!isSupportedExtension(file.name)) {
    const extension = getFileExtension(file.name) || '(no extension)';
    return {
      isValid: false,
      error: `Unsupported file type: ${extension}. Supported types: ${SUPPORTED_FILE_EXTENSIONS.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates file content is not empty or just whitespace
 * @param content - The file content to validate
 * @returns true if content is valid
 */
export function isValidContent(content: string): boolean {
  return typeof content === 'string' && content.trim().length > 0;
}

/**
 * Attempts to parse content as JSON
 * @param content - The content to parse
 * @returns The parsed JSON object or null if parsing fails
 */
export function tryParseJson(content: string): unknown | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Creates a File object from string content (useful for testing)
 * @param content - The file content
 * @param filename - The filename
 * @param mimeType - The MIME type (optional)
 * @returns A File object
 */
export function createFileFromString(content: string, filename: string, mimeType?: string): File {
  const detectedMimeType = mimeType || getMimeTypeFromExtension(filename);
  return new File([content], filename, { type: detectedMimeType });
}

/**
 * Gets the MIME type from a file extension
 * @param filename - The filename to get MIME type for
 * @returns The MIME type string
 */
export function getMimeTypeFromExtension(filename: string): string {
  const extension = getFileExtension(filename);

  switch (extension) {
    case '.json':
      return 'application/json';
    case '.md':
    case '.markdown':
      return 'text/markdown';
    default:
      return 'text/plain';
  }
}

/**
 * Formats file size for display
 * @param bytes - The file size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 0) {
    return '0 B';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);

  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}
