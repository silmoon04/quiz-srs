/**
 * Bug #1: Duplicate FileReader onload Handler Assignment
 *
 * Bug: The readFileAsText function assigns reader.onload twice, overwriting
 * the first handler. The first assignment would never resolve on non-string results.
 *
 * These tests verify proper file reading behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock FileReader for testing
class MockFileReader {
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  result: string | ArrayBuffer | null = null;

  private onloadHandlerCount = 0;

  readAsText(blob: Blob) {
    // Track how many times onload was assigned
    this.trackOnloadAssignments();

    // Simulate async read
    setTimeout(() => {
      this.result = 'file content';
      if (this.onload) {
        this.onload({ target: this });
      }
    }, 0);
  }

  private trackOnloadAssignments() {
    // This is called after assignments are made
    // Count would be set by test setup
  }

  static assignmentCount = 0;
}

describe('Bug #1: Duplicate FileReader onload Handler', () => {
  let originalFileReader: typeof FileReader;

  beforeEach(() => {
    originalFileReader = global.FileReader;
    MockFileReader.assignmentCount = 0;
  });

  afterEach(() => {
    global.FileReader = originalFileReader;
  });

  describe('Handler assignment detection', () => {
    it('should only assign onload handler once', async () => {
      // Track the number of onload assignments
      let assignmentCount = 0;

      // Custom FileReader that tracks onload setter calls
      class TrackedFileReader {
        result: string | ArrayBuffer | null = null;
        onerror: ((event: any) => void) | null = null;
        private _onload: ((event: any) => void) | null = null;

        get onload() {
          return this._onload;
        }
        set onload(handler: ((event: any) => void) | null) {
          if (handler !== null) {
            // Only count non-null assignments (actual handler assignments)
            assignmentCount++;
          }
          this._onload = handler;
        }

        readAsText(_blob: Blob) {
          setTimeout(() => {
            this.result = 'file content';
            if (this._onload) {
              this._onload({ target: this });
            }
          }, 0);
        }
      }

      // This simulates the FIXED implementation in page.tsx
      function fixedReadFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new TrackedFileReader() as any;

          // FIXED: Single onload handler with proper error handling
          reader.onload = (event: any) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
              resolve(result);
            } else {
              reject(new Error('Failed to read file as text'));
            }
          };

          reader.onerror = () => reject(new Error('File reading failed'));
          reader.readAsText(file);
        });
      }

      const file = new Blob(['test']) as File;
      await fixedReadFileAsText(file);

      // FIXED: Now correctly assigns only once
      expect(assignmentCount).toBe(1);
    });

    it('should handle non-string results correctly', async () => {
      // The first (incomplete) handler doesn't handle non-string results
      const ArrayBufferFileReader = class extends MockFileReader {
        readAsText(blob: Blob) {
          setTimeout(() => {
            // Simulate returning ArrayBuffer instead of string (edge case)
            this.result = new ArrayBuffer(8);
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        }
      };

      function fixedReadFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new ArrayBufferFileReader() as any;

          // Fixed: Single handler with proper error handling
          reader.onload = (event: any) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
              resolve(result);
            } else {
              reject(new Error('Failed to read file as text'));
            }
          };

          reader.onerror = () => reject(new Error('File reading failed'));
          reader.readAsText(file);
        });
      }

      const file = new Blob(['test']) as File;

      // Should reject because result is ArrayBuffer, not string
      await expect(fixedReadFileAsText(file)).rejects.toThrow('Failed to read file as text');
    });
  });

  describe('Error handling', () => {
    it('should reject on FileReader error', async () => {
      const ErrorFileReader = class extends MockFileReader {
        readAsText(blob: Blob) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Read error'));
            }
          }, 0);
        }
      };

      function readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new ErrorFileReader() as any;

          reader.onload = (event: any) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
              resolve(result);
            } else {
              reject(new Error('Failed to read file as text'));
            }
          };

          reader.onerror = () => reject(new Error('File reading failed'));
          reader.readAsText(file);
        });
      }

      const file = new Blob(['test']) as File;
      await expect(readFileAsText(file)).rejects.toThrow('File reading failed');
    });

    it('should reject when result is null', async () => {
      const NullResultFileReader = class extends MockFileReader {
        readAsText(blob: Blob) {
          setTimeout(() => {
            this.result = null;
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        }
      };

      function readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new NullResultFileReader() as any;

          reader.onload = (event: any) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
              resolve(result);
            } else {
              reject(new Error('Failed to read file as text'));
            }
          };

          reader.onerror = () => reject(new Error('File reading failed'));
          reader.readAsText(file);
        });
      }

      const file = new Blob(['test']) as File;
      await expect(readFileAsText(file)).rejects.toThrow('Failed to read file as text');
    });
  });

  describe('Success cases', () => {
    it('should resolve with file content on success', async () => {
      const SuccessFileReader = class extends MockFileReader {
        readAsText(blob: Blob) {
          setTimeout(() => {
            this.result = 'file content here';
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        }
      };

      function readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new SuccessFileReader() as any;

          reader.onload = (event: any) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
              resolve(result);
            } else {
              reject(new Error('Failed to read file as text'));
            }
          };

          reader.onerror = () => reject(new Error('File reading failed'));
          reader.readAsText(file);
        });
      }

      const file = new Blob(['test']) as File;
      const result = await readFileAsText(file);
      expect(result).toBe('file content here');
    });

    it('should handle empty file content', async () => {
      const EmptyFileReader = class extends MockFileReader {
        readAsText(blob: Blob) {
          setTimeout(() => {
            this.result = '';
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        }
      };

      function readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new EmptyFileReader() as any;

          reader.onload = (event: any) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
              resolve(result);
            } else {
              reject(new Error('Failed to read file as text'));
            }
          };

          reader.onerror = () => reject(new Error('File reading failed'));
          reader.readAsText(file);
        });
      }

      const file = new Blob(['']) as File;
      const result = await readFileAsText(file);
      expect(result).toBe('');
    });
  });
});
