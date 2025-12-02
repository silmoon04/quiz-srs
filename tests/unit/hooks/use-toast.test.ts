import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/use-toast';

describe('useToast hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with an empty toasts array', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });

    it('should return all expected functions', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.addToast).toBe('function');
      expect(typeof result.current.removeToast).toBe('function');
      expect(typeof result.current.showSuccess).toBe('function');
      expect(typeof result.current.showError).toBe('function');
      expect(typeof result.current.showInfo).toBe('function');
      expect(typeof result.current.showWarning).toBe('function');
      expect(typeof result.current.clearAllToasts).toBe('function');
    });
  });

  describe('addToast', () => {
    it('should add a toast to the toasts array', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({
          type: 'success',
          title: 'Test Toast',
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].title).toBe('Test Toast');
    });

    it('should generate a unique id for each toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({ type: 'success', title: 'Toast 1' });
        result.current.addToast({ type: 'error', title: 'Toast 2' });
      });

      expect(result.current.toasts[0].id).toBeDefined();
      expect(result.current.toasts[1].id).toBeDefined();
      expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
    });

    it('should return the generated toast id', () => {
      const { result } = renderHook(() => useToast());
      let toastId: string | undefined;

      act(() => {
        toastId = result.current.addToast({ type: 'info', title: 'Test' });
      });

      expect(toastId).toBeDefined();
      expect(result.current.toasts[0].id).toBe(toastId);
    });

    it('should include optional message and duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({
          type: 'warning',
          title: 'Warning Title',
          message: 'Warning message',
          duration: 3000,
        });
      });

      expect(result.current.toasts[0].message).toBe('Warning message');
      expect(result.current.toasts[0].duration).toBe(3000);
    });
  });

  describe('removeToast', () => {
    it('should remove a toast by id', () => {
      const { result } = renderHook(() => useToast());
      let toastId: string | undefined;

      act(() => {
        toastId = result.current.addToast({ type: 'success', title: 'Test' });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast(toastId!);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should only remove the specified toast', () => {
      const { result } = renderHook(() => useToast());
      let toastId1: string | undefined;
      let toastId2: string | undefined;

      act(() => {
        toastId1 = result.current.addToast({ type: 'success', title: 'Toast 1' });
        toastId2 = result.current.addToast({ type: 'error', title: 'Toast 2' });
      });

      expect(result.current.toasts).toHaveLength(2);

      act(() => {
        result.current.removeToast(toastId1!);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].id).toBe(toastId2);
      expect(result.current.toasts[0].title).toBe('Toast 2');
    });

    it('should handle removing non-existent toast gracefully', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({ type: 'success', title: 'Test' });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast('non-existent-id');
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('showSuccess', () => {
    it('should add a success toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Success!');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].title).toBe('Success!');
    });

    it('should include optional message and duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Success!', 'Operation completed', 2000);
      });

      expect(result.current.toasts[0].message).toBe('Operation completed');
      expect(result.current.toasts[0].duration).toBe(2000);
    });

    it('should return the toast id', () => {
      const { result } = renderHook(() => useToast());
      let toastId: string | undefined;

      act(() => {
        toastId = result.current.showSuccess('Success!');
      });

      expect(toastId).toBe(result.current.toasts[0].id);
    });
  });

  describe('showError', () => {
    it('should add an error toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showError('Error!');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('error');
      expect(result.current.toasts[0].title).toBe('Error!');
    });

    it('should include optional message and duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showError('Error!', 'Something went wrong', 10000);
      });

      expect(result.current.toasts[0].message).toBe('Something went wrong');
      expect(result.current.toasts[0].duration).toBe(10000);
    });

    it('should return the toast id', () => {
      const { result } = renderHook(() => useToast());
      let toastId: string | undefined;

      act(() => {
        toastId = result.current.showError('Error!');
      });

      expect(toastId).toBe(result.current.toasts[0].id);
    });
  });

  describe('showInfo', () => {
    it('should add an info toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showInfo('Information');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('info');
      expect(result.current.toasts[0].title).toBe('Information');
    });

    it('should include optional message and duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showInfo('Info', 'Additional details', 4000);
      });

      expect(result.current.toasts[0].message).toBe('Additional details');
      expect(result.current.toasts[0].duration).toBe(4000);
    });

    it('should return the toast id', () => {
      const { result } = renderHook(() => useToast());
      let toastId: string | undefined;

      act(() => {
        toastId = result.current.showInfo('Info');
      });

      expect(toastId).toBe(result.current.toasts[0].id);
    });
  });

  describe('showWarning', () => {
    it('should add a warning toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showWarning('Warning!');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('warning');
      expect(result.current.toasts[0].title).toBe('Warning!');
    });

    it('should include optional message and duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showWarning('Warning!', 'Please be careful', 6000);
      });

      expect(result.current.toasts[0].message).toBe('Please be careful');
      expect(result.current.toasts[0].duration).toBe(6000);
    });

    it('should return the toast id', () => {
      const { result } = renderHook(() => useToast());
      let toastId: string | undefined;

      act(() => {
        toastId = result.current.showWarning('Warning!');
      });

      expect(toastId).toBe(result.current.toasts[0].id);
    });
  });

  describe('clearAllToasts', () => {
    it('should remove all toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Toast 1');
        result.current.showError('Toast 2');
        result.current.showInfo('Toast 3');
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.clearAllToasts();
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should work when there are no toasts', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toHaveLength(0);

      act(() => {
        result.current.clearAllToasts();
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('multiple toasts handling', () => {
    it('should maintain order of toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('First');
        result.current.showError('Second');
        result.current.showWarning('Third');
      });

      expect(result.current.toasts).toHaveLength(3);
      expect(result.current.toasts[0].title).toBe('First');
      expect(result.current.toasts[1].title).toBe('Second');
      expect(result.current.toasts[2].title).toBe('Third');
    });

    it('should handle adding and removing multiple toasts', () => {
      const { result } = renderHook(() => useToast());
      let id1: string | undefined;
      let id2: string | undefined;
      let id3: string | undefined;

      act(() => {
        id1 = result.current.showSuccess('Toast 1');
        id2 = result.current.showError('Toast 2');
        id3 = result.current.showInfo('Toast 3');
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.removeToast(id2!);
      });

      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts.map((t) => t.id)).toEqual([id1, id3]);

      act(() => {
        result.current.showWarning('Toast 4');
      });

      expect(result.current.toasts).toHaveLength(3);
      expect(result.current.toasts[2].title).toBe('Toast 4');
    });

    it('should handle different toast types simultaneously', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Success message');
        result.current.showError('Error message');
        result.current.showInfo('Info message');
        result.current.showWarning('Warning message');
      });

      expect(result.current.toasts).toHaveLength(4);

      const types = result.current.toasts.map((t) => t.type);
      expect(types).toContain('success');
      expect(types).toContain('error');
      expect(types).toContain('info');
      expect(types).toContain('warning');
    });
  });

  describe('toast state management', () => {
    it('should preserve toast properties after state updates', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({
          type: 'success',
          title: 'Original Title',
          message: 'Original Message',
          duration: 5000,
        });
      });

      const originalToast = result.current.toasts[0];

      act(() => {
        result.current.showError('New Toast');
      });

      expect(result.current.toasts[0]).toEqual(originalToast);
    });

    it('should maintain stable function references across renders', () => {
      const { result, rerender } = renderHook(() => useToast());

      const initialFunctions = {
        addToast: result.current.addToast,
        removeToast: result.current.removeToast,
        showSuccess: result.current.showSuccess,
        showError: result.current.showError,
        showInfo: result.current.showInfo,
        showWarning: result.current.showWarning,
        clearAllToasts: result.current.clearAllToasts,
      };

      rerender();

      expect(result.current.addToast).toBe(initialFunctions.addToast);
      expect(result.current.removeToast).toBe(initialFunctions.removeToast);
      expect(result.current.showSuccess).toBe(initialFunctions.showSuccess);
      expect(result.current.showError).toBe(initialFunctions.showError);
      expect(result.current.showInfo).toBe(initialFunctions.showInfo);
      expect(result.current.showWarning).toBe(initialFunctions.showWarning);
      expect(result.current.clearAllToasts).toBe(initialFunctions.clearAllToasts);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string title', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('');
    });

    it('should handle undefined message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Title', undefined);
      });

      expect(result.current.toasts[0].message).toBeUndefined();
    });

    it('should handle zero duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Title', 'Message', 0);
      });

      expect(result.current.toasts[0].duration).toBe(0);
    });

    it('should handle special characters in title and message', () => {
      const { result } = renderHook(() => useToast());
      const specialTitle = '<script>alert("xss")</script>';
      const specialMessage = '日本語 🎉 émojis & "quotes"';

      act(() => {
        result.current.showInfo(specialTitle, specialMessage);
      });

      expect(result.current.toasts[0].title).toBe(specialTitle);
      expect(result.current.toasts[0].message).toBe(specialMessage);
    });

    it('should handle very long title and message', () => {
      const { result } = renderHook(() => useToast());
      const longTitle = 'A'.repeat(1000);
      const longMessage = 'B'.repeat(5000);

      act(() => {
        result.current.showWarning(longTitle, longMessage);
      });

      expect(result.current.toasts[0].title).toBe(longTitle);
      expect(result.current.toasts[0].message).toBe(longMessage);
    });
  });
});
