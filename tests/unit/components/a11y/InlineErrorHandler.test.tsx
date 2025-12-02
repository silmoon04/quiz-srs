import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useRef } from 'react';
import {
  InlineErrorHandler,
  useInlineErrors,
  useFileInputWithErrors,
  ErrorMessage,
} from '@/components/a11y/InlineErrorHandler';

// Test component that exposes the hook functionality
function TestComponent({
  onSetError,
  onClearError,
  onGetError,
  onGetAriaProps,
}: {
  onSetError?: (setError: (fieldId: string, error: string) => void) => void;
  onClearError?: (clearError: (fieldId: string) => void) => void;
  onGetError?: (
    getError: (fieldId: string) => ReturnType<ReturnType<typeof useInlineErrors>['getFieldError']>,
  ) => void;
  onGetAriaProps?: (
    getAriaProps: (
      fieldId: string,
    ) => ReturnType<ReturnType<typeof useInlineErrors>['getFieldAriaProps']>,
  ) => void;
}) {
  const { setFieldError, clearFieldError, getFieldError, getFieldAriaProps } = useInlineErrors();

  React.useEffect(() => {
    onSetError?.(setFieldError);
    onClearError?.(clearFieldError);
    onGetError?.(getFieldError);
    onGetAriaProps?.(getFieldAriaProps);
  }, [
    setFieldError,
    clearFieldError,
    getFieldError,
    getFieldAriaProps,
    onSetError,
    onClearError,
    onGetError,
    onGetAriaProps,
  ]);

  return <div data-testid="test-component">Test Component</div>;
}

// Test component for ErrorMessage
function ErrorMessageTestComponent({ fieldId }: { fieldId: string }) {
  return <ErrorMessage fieldId={fieldId} />;
}

// Test component for file input with errors
function FileInputTestComponent({
  fieldId,
  onFileSelect,
}: {
  fieldId: string;
  onFileSelect: (file: File) => Promise<void>;
}) {
  const { fileInputRef, handleFileChange, ariaProps } = useFileInputWithErrors(
    fieldId,
    onFileSelect,
  );

  return (
    <input
      ref={fileInputRef}
      type="file"
      onChange={handleFileChange}
      aria-label="Test file input"
      data-testid="file-input"
      {...ariaProps}
    />
  );
}

// Helper to create mock file
const createMockFile = (name: string = 'test.json', content: string = '{}'): File => {
  return new File([content], name, { type: 'application/json' });
};

describe('InlineErrorHandler Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render children correctly', () => {
      render(
        <InlineErrorHandler>
          <div data-testid="child">Child Content</div>
        </InlineErrorHandler>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <InlineErrorHandler>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
        </InlineErrorHandler>,
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should not render any error messages initially', () => {
      render(
        <InlineErrorHandler>
          <div>Content</div>
        </InlineErrorHandler>,
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Error context provider', () => {
    it('should provide context to child components', () => {
      render(
        <InlineErrorHandler>
          <TestComponent />
        </InlineErrorHandler>,
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should throw error when useInlineErrors is used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useInlineErrors must be used within an InlineErrorHandler');

      consoleError.mockRestore();
    });
  });

  describe('setFieldError functionality', () => {
    it('should set error for a field', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Test error message');
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Test error message');
      });
    });

    it('should render error with unique ID', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Error message');
      });

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('id');
        expect(alert.id).toMatch(/^error-\d+$/);
      });
    });

    it('should increment error ID for each new error', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('field-1', 'First error');
      });

      let firstId = '';
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        firstId = alert.id;
        expect(firstId).toMatch(/^error-\d+$/);
      });

      act(() => {
        setError('field-2', 'Second error');
      });

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts).toHaveLength(2);
        const secondAlert = alerts.find((a) => a.textContent === 'Second error');
        expect(secondAlert?.id).not.toBe(firstId);
      });
    });

    it('should call onFieldError callback when error is set', async () => {
      const onFieldError = vi.fn();
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler onFieldError={onFieldError}>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('my-field', 'My error message');
      });

      await waitFor(() => {
        expect(onFieldError).toHaveBeenCalledWith('my-field', 'My error message');
      });
    });

    it('should replace existing error for same field', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'First error');
      });

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      act(() => {
        setError('test-field', 'Second error');
      });

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
        expect(screen.getByText('Second error')).toBeInTheDocument();
      });
    });
  });

  describe('clearFieldError functionality', () => {
    it('should clear error for a field', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};
      let clearError: (fieldId: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent
            onSetError={(fn) => (setError = fn)}
            onClearError={(fn) => (clearError = fn)}
          />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Error to clear');
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      act(() => {
        clearError('test-field');
      });

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should call onFieldClear callback when error is cleared', async () => {
      const onFieldClear = vi.fn();
      let setError: (fieldId: string, error: string) => void = () => {};
      let clearError: (fieldId: string) => void = () => {};

      render(
        <InlineErrorHandler onFieldClear={onFieldClear}>
          <TestComponent
            onSetError={(fn) => (setError = fn)}
            onClearError={(fn) => (clearError = fn)}
          />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('my-field', 'Error');
      });

      act(() => {
        clearError('my-field');
      });

      await waitFor(() => {
        expect(onFieldClear).toHaveBeenCalledWith('my-field');
      });
    });

    it('should handle clearing non-existent error gracefully', async () => {
      let clearError: (fieldId: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onClearError={(fn) => (clearError = fn)} />
        </InlineErrorHandler>,
      );

      // Should not throw
      act(() => {
        clearError('non-existent-field');
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should only clear the specified field error', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};
      let clearError: (fieldId: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent
            onSetError={(fn) => (setError = fn)}
            onClearError={(fn) => (clearError = fn)}
          />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('field-1', 'Error 1');
        setError('field-2', 'Error 2');
      });

      await waitFor(() => {
        expect(screen.getAllByRole('alert')).toHaveLength(2);
      });

      act(() => {
        clearError('field-1');
      });

      await waitFor(() => {
        expect(screen.queryByText('Error 1')).not.toBeInTheDocument();
        expect(screen.getByText('Error 2')).toBeInTheDocument();
      });
    });
  });

  describe('getFieldError functionality', () => {
    it('should return null when no error exists', async () => {
      let getError: (
        fieldId: string,
      ) => ReturnType<ReturnType<typeof useInlineErrors>['getFieldError']> = () => null;

      render(
        <InlineErrorHandler>
          <TestComponent onGetError={(fn) => (getError = fn)} />
        </InlineErrorHandler>,
      );

      expect(getError('test-field')).toBeNull();
    });

    it('should return error object when error exists', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};
      let getError: (
        fieldId: string,
      ) => ReturnType<ReturnType<typeof useInlineErrors>['getFieldError']> = () => null;

      render(
        <InlineErrorHandler>
          <TestComponent
            onSetError={(fn) => (setError = fn)}
            onGetError={(fn) => (getError = fn)}
          />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Test error');
      });

      await waitFor(() => {
        const error = getError('test-field');
        expect(error).not.toBeNull();
        expect(error?.fieldId).toBe('test-field');
        expect(error?.message).toBe('Test error');
        expect(error?.id).toMatch(/^error-\d+$/);
      });
    });
  });

  describe('getFieldAriaProps functionality', () => {
    it('should return aria-invalid false when no error exists', async () => {
      let getAriaProps: (
        fieldId: string,
      ) => ReturnType<ReturnType<typeof useInlineErrors>['getFieldAriaProps']> = () => ({
        'aria-invalid': false,
        'aria-describedby': undefined,
      });

      render(
        <InlineErrorHandler>
          <TestComponent onGetAriaProps={(fn) => (getAriaProps = fn)} />
        </InlineErrorHandler>,
      );

      const props = getAriaProps('test-field');
      expect(props['aria-invalid']).toBe(false);
      expect(props['aria-describedby']).toBeUndefined();
    });

    it('should return aria-invalid true and describedby when error exists', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};
      let getAriaProps: (
        fieldId: string,
      ) => ReturnType<ReturnType<typeof useInlineErrors>['getFieldAriaProps']> = () => ({
        'aria-invalid': false,
        'aria-describedby': undefined,
      });

      render(
        <InlineErrorHandler>
          <TestComponent
            onSetError={(fn) => (setError = fn)}
            onGetAriaProps={(fn) => (getAriaProps = fn)}
          />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Error message');
      });

      await waitFor(() => {
        const props = getAriaProps('test-field');
        expect(props['aria-invalid']).toBe(true);
        expect(props['aria-describedby']).toMatch(/^error-\d+$/);
      });
    });
  });

  describe('Error message ARIA attributes', () => {
    it('should have role="alert" on error messages', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Alert message');
      });

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('role', 'alert');
      });
    });

    it('should have aria-live="polite" on error messages', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Live region message');
      });

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should have aria-atomic="true" on error messages', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Atomic message');
      });

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-atomic', 'true');
      });
    });

    it('should have sr-only class for screen reader only visibility', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Screen reader message');
      });

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveClass('sr-only');
      });
    });
  });

  describe('Multiple errors', () => {
    it('should render multiple errors for different fields', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('field-1', 'Error for field 1');
        setError('field-2', 'Error for field 2');
        setError('field-3', 'Error for field 3');
      });

      await waitFor(() => {
        expect(screen.getAllByRole('alert')).toHaveLength(3);
        expect(screen.getByText('Error for field 1')).toBeInTheDocument();
        expect(screen.getByText('Error for field 2')).toBeInTheDocument();
        expect(screen.getByText('Error for field 3')).toBeInTheDocument();
      });
    });

    it('should assign unique IDs to each error', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('field-1', 'Error 1');
        setError('field-2', 'Error 2');
      });

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const ids = alerts.map((a) => a.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  });
});

describe('useInlineErrors Hook', () => {
  it('should throw error when used outside InlineErrorHandler', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useInlineErrors must be used within an InlineErrorHandler');

    consoleError.mockRestore();
  });
});

describe('useFileInputWithErrors Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful file selection', () => {
    it('should call onFileSelect when file is selected', async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn().mockResolvedValue(undefined);

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input');
      const testFile = createMockFile('test.json');

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith(testFile);
      });
    });

    it('should clear existing error on successful file selection', async () => {
      const user = userEvent.setup();
      let attempt = 0;
      const onFileSelect = vi.fn().mockImplementation(() => {
        attempt++;
        if (attempt === 1) {
          return Promise.reject(new Error('First attempt failed'));
        }
        return Promise.resolve();
      });

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input');

      // First upload - should fail
      await user.upload(fileInput, createMockFile('fail.json'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('First attempt failed');
      });

      // Second upload - should succeed and clear error
      await user.upload(fileInput, createMockFile('success.json'));

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should not set error on successful file selection', async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn().mockResolvedValue(undefined);

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input');
      await user.upload(fileInput, createMockFile('test.json'));

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalled();
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Failed file selection', () => {
    it('should set error when file selection throws Error', async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn().mockRejectedValue(new Error('Upload failed'));

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input');
      await user.upload(fileInput, createMockFile('test.json'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
      });
    });

    it('should set generic error when file selection throws non-Error', async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn().mockRejectedValue('string error');

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input');
      await user.upload(fileInput, createMockFile('test.json'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('File upload failed');
      });
    });

    it('should set aria-invalid to true when error occurs', async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn().mockRejectedValue(new Error('Error'));

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input');
      await user.upload(fileInput, createMockFile('test.json'));

      await waitFor(() => {
        expect(fileInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should set aria-describedby to error ID when error occurs', async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn().mockRejectedValue(new Error('Error'));

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input');
      await user.upload(fileInput, createMockFile('test.json'));

      await waitFor(() => {
        const describedBy = fileInput.getAttribute('aria-describedby');
        expect(describedBy).toMatch(/^error-\d+$/);

        const errorElement = document.getElementById(describedBy!);
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent('Error');
      });
    });
  });

  describe('Empty file selection', () => {
    it('should not call onFileSelect when no file is selected', async () => {
      const onFileSelect = vi.fn().mockResolvedValue(undefined);

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;

      // Simulate change event without files
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: null },
        writable: false,
      });
      fileInput.dispatchEvent(event);

      expect(onFileSelect).not.toHaveBeenCalled();
    });

    it('should not call onFileSelect when files array is empty', async () => {
      const onFileSelect = vi.fn().mockResolvedValue(undefined);

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;

      // Simulate change event with empty files array
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [] },
        writable: false,
      });
      fileInput.dispatchEvent(event);

      expect(onFileSelect).not.toHaveBeenCalled();
    });
  });

  describe('ARIA props', () => {
    it('should have aria-invalid false initially', () => {
      const onFileSelect = vi.fn().mockResolvedValue(undefined);

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should not have aria-describedby initially', () => {
      const onFileSelect = vi.fn().mockResolvedValue(undefined);

      render(
        <InlineErrorHandler>
          <FileInputTestComponent fieldId="test-file" onFileSelect={onFileSelect} />
        </InlineErrorHandler>,
      );

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput.getAttribute('aria-describedby')).toBeFalsy();
    });
  });
});

describe('ErrorMessage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('When no error exists', () => {
    it('should return null when no error for field', () => {
      const { container } = render(
        <InlineErrorHandler>
          <ErrorMessageTestComponent fieldId="test-field" />
        </InlineErrorHandler>,
      );

      // The ErrorMessage component should render nothing
      expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
    });
  });

  describe('When error exists', () => {
    it('should render error message', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
          <ErrorMessageTestComponent fieldId="test-field" />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Visible error message');
      });

      await waitFor(() => {
        // ErrorMessage renders visible error + InlineErrorHandler renders sr-only
        const alerts = screen.getAllByRole('alert');
        const visibleError = alerts.find((a) => !a.classList.contains('sr-only'));
        expect(visibleError).toHaveTextContent('Visible error message');
      });
    });

    it('should have role="alert"', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
          <ErrorMessageTestComponent fieldId="test-field" />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Error');
      });

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      });
    });

    it('should have aria-live="polite"', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
          <ErrorMessageTestComponent fieldId="test-field" />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Error');
      });

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const visibleError = alerts.find((a) => !a.classList.contains('sr-only'));
        expect(visibleError).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should have the same ID as referenced in aria-describedby', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};
      let getAriaProps: (
        fieldId: string,
      ) => ReturnType<ReturnType<typeof useInlineErrors>['getFieldAriaProps']> = () => ({
        'aria-invalid': false,
        'aria-describedby': undefined,
      });

      render(
        <InlineErrorHandler>
          <TestComponent
            onSetError={(fn) => (setError = fn)}
            onGetAriaProps={(fn) => (getAriaProps = fn)}
          />
          <ErrorMessageTestComponent fieldId="test-field" />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Error with ID');
      });

      await waitFor(() => {
        const ariaProps = getAriaProps('test-field');
        const describedById = ariaProps['aria-describedby'];
        expect(describedById).toBeTruthy();

        // Both the ErrorMessage visible and InlineErrorHandler sr-only share the same ID
        const errorElement = document.getElementById(describedById!);
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent('Error with ID');
      });
    });

    it('should apply default className', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
          <ErrorMessageTestComponent fieldId="test-field" />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Error');
      });

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const visibleError = alerts.find((a) => !a.classList.contains('sr-only'));
        expect(visibleError).toHaveClass('text-red-400', 'text-sm', 'mt-1');
      });
    });
  });

  describe('Custom className', () => {
    it('should apply custom className when provided', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      function CustomErrorMessage() {
        return <ErrorMessage fieldId="test-field" className="custom-error-class" />;
      }

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
          <CustomErrorMessage />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('test-field', 'Custom styled error');
      });

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const customError = alerts.find((a) => a.classList.contains('custom-error-class'));
        expect(customError).toBeInTheDocument();
      });
    });
  });

  describe('Error only for matching field', () => {
    it('should only show error for its specific field', async () => {
      let setError: (fieldId: string, error: string) => void = () => {};

      render(
        <InlineErrorHandler>
          <TestComponent onSetError={(fn) => (setError = fn)} />
          <ErrorMessageTestComponent fieldId="field-a" />
        </InlineErrorHandler>,
      );

      act(() => {
        setError('field-b', 'Error for field B');
      });

      await waitFor(() => {
        // InlineErrorHandler renders sr-only alert, but ErrorMessage for field-a should not render
        const alerts = screen.getAllByRole('alert');
        // Should only have the sr-only one from InlineErrorHandler
        expect(alerts).toHaveLength(1);
        expect(alerts[0]).toHaveClass('sr-only');
      });
    });
  });
});

describe('Edge cases and error handling', () => {
  it('should handle rapid error set and clear', async () => {
    let setError: (fieldId: string, error: string) => void = () => {};
    let clearError: (fieldId: string) => void = () => {};

    render(
      <InlineErrorHandler>
        <TestComponent
          onSetError={(fn) => (setError = fn)}
          onClearError={(fn) => (clearError = fn)}
        />
      </InlineErrorHandler>,
    );

    // Rapid set and clear
    act(() => {
      setError('field', 'Error 1');
      clearError('field');
      setError('field', 'Error 2');
      clearError('field');
      setError('field', 'Final error');
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Final error');
    });
  });

  it('should handle special characters in error messages', async () => {
    let setError: (fieldId: string, error: string) => void = () => {};

    render(
      <InlineErrorHandler>
        <TestComponent onSetError={(fn) => (setError = fn)} />
      </InlineErrorHandler>,
    );

    const specialMessage = '<script>alert("xss")</script> & "quotes" \'apostrophes\'';

    act(() => {
      setError('test-field', specialMessage);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(specialMessage);
    });
  });

  it('should handle very long error messages', async () => {
    let setError: (fieldId: string, error: string) => void = () => {};

    render(
      <InlineErrorHandler>
        <TestComponent onSetError={(fn) => (setError = fn)} />
      </InlineErrorHandler>,
    );

    const longMessage = 'A'.repeat(1000);

    act(() => {
      setError('test-field', longMessage);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(longMessage);
    });
  });

  it('should handle empty error message', async () => {
    let setError: (fieldId: string, error: string) => void = () => {};

    render(
      <InlineErrorHandler>
        <TestComponent onSetError={(fn) => (setError = fn)} />
      </InlineErrorHandler>,
    );

    act(() => {
      setError('test-field', '');
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toBe('');
    });
  });

  it('should handle unicode characters in error messages', async () => {
    let setError: (fieldId: string, error: string) => void = () => {};

    render(
      <InlineErrorHandler>
        <TestComponent onSetError={(fn) => (setError = fn)} />
      </InlineErrorHandler>,
    );

    const unicodeMessage = '错误消息 🚨 Ошибка Σφάλμα';

    act(() => {
      setError('test-field', unicodeMessage);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(unicodeMessage);
    });
  });

  it('should handle many fields with errors', async () => {
    let setError: (fieldId: string, error: string) => void = () => {};

    render(
      <InlineErrorHandler>
        <TestComponent onSetError={(fn) => (setError = fn)} />
      </InlineErrorHandler>,
    );

    act(() => {
      for (let i = 0; i < 20; i++) {
        setError(`field-${i}`, `Error for field ${i}`);
      }
    });

    await waitFor(() => {
      expect(screen.getAllByRole('alert')).toHaveLength(20);
    });
  });
});

describe('Callback integration', () => {
  it('should call onFieldError with correct parameters', async () => {
    const onFieldError = vi.fn();
    let setError: (fieldId: string, error: string) => void = () => {};

    render(
      <InlineErrorHandler onFieldError={onFieldError}>
        <TestComponent onSetError={(fn) => (setError = fn)} />
      </InlineErrorHandler>,
    );

    act(() => {
      setError('username', 'Username is required');
    });

    await waitFor(() => {
      expect(onFieldError).toHaveBeenCalledTimes(1);
      expect(onFieldError).toHaveBeenCalledWith('username', 'Username is required');
    });
  });

  it('should call onFieldClear with correct parameters', async () => {
    const onFieldClear = vi.fn();
    let setError: (fieldId: string, error: string) => void = () => {};
    let clearError: (fieldId: string) => void = () => {};

    render(
      <InlineErrorHandler onFieldClear={onFieldClear}>
        <TestComponent
          onSetError={(fn) => (setError = fn)}
          onClearError={(fn) => (clearError = fn)}
        />
      </InlineErrorHandler>,
    );

    act(() => {
      setError('email', 'Invalid email');
    });

    act(() => {
      clearError('email');
    });

    await waitFor(() => {
      expect(onFieldClear).toHaveBeenCalledTimes(1);
      expect(onFieldClear).toHaveBeenCalledWith('email');
    });
  });

  it('should call both callbacks when errors are set and cleared', async () => {
    const onFieldError = vi.fn();
    const onFieldClear = vi.fn();
    let setError: (fieldId: string, error: string) => void = () => {};
    let clearError: (fieldId: string) => void = () => {};

    render(
      <InlineErrorHandler onFieldError={onFieldError} onFieldClear={onFieldClear}>
        <TestComponent
          onSetError={(fn) => (setError = fn)}
          onClearError={(fn) => (clearError = fn)}
        />
      </InlineErrorHandler>,
    );

    act(() => {
      setError('field1', 'Error 1');
      setError('field2', 'Error 2');
    });

    act(() => {
      clearError('field1');
    });

    await waitFor(() => {
      expect(onFieldError).toHaveBeenCalledTimes(2);
      expect(onFieldClear).toHaveBeenCalledTimes(1);
      expect(onFieldClear).toHaveBeenCalledWith('field1');
    });
  });
});
