'use client';

import React, { useState, useCallback, useRef } from 'react';

interface InlineError {
  fieldId: string;
  message: string;
  id: string;
}

interface InlineErrorHandlerProps {
  children: React.ReactNode;
  onFieldError?: (fieldId: string, error: string) => void;
  onFieldClear?: (fieldId: string) => void;
}

interface InlineErrorContextType {
  setFieldError: (fieldId: string, error: string) => void;
  clearFieldError: (fieldId: string) => void;
  getFieldError: (fieldId: string) => InlineError | null;
  getFieldAriaProps: (fieldId: string) => {
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
  };
}

const InlineErrorContext = React.createContext<InlineErrorContextType | null>(null);

export function useInlineErrors() {
  const context = React.useContext(InlineErrorContext);
  if (!context) {
    throw new Error('useInlineErrors must be used within an InlineErrorHandler');
  }
  return context;
}

/**
 * Inline error handler that provides ARIA-compliant error management
 * for form fields and other interactive elements
 */
export function InlineErrorHandler({
  children,
  onFieldError,
  onFieldClear,
}: InlineErrorHandlerProps) {
  const [errors, setErrors] = useState<Map<string, InlineError>>(new Map());
  const errorIdCounter = useRef(0);

  const generateErrorId = useCallback(() => {
    return `error-${++errorIdCounter.current}`;
  }, []);

  const setFieldError = useCallback(
    (fieldId: string, error: string) => {
      const errorId = generateErrorId();
      const inlineError: InlineError = {
        fieldId,
        message: error,
        id: errorId,
      };

      setErrors((prev) => new Map(prev.set(fieldId, inlineError)));
      onFieldError?.(fieldId, error);
    },
    [generateErrorId, onFieldError],
  );

  const clearFieldError = useCallback(
    (fieldId: string) => {
      setErrors((prev) => {
        const newMap = new Map(prev);
        newMap.delete(fieldId);
        return newMap;
      });
      onFieldClear?.(fieldId);
    },
    [onFieldClear],
  );

  const getFieldError = useCallback(
    (fieldId: string) => {
      return errors.get(fieldId) || null;
    },
    [errors],
  );

  const getFieldAriaProps = useCallback(
    (fieldId: string) => {
      const error = errors.get(fieldId);
      return {
        'aria-invalid': !!error,
        'aria-describedby': error?.id,
      };
    },
    [errors],
  );

  const contextValue: InlineErrorContextType = {
    setFieldError,
    clearFieldError,
    getFieldError,
    getFieldAriaProps,
  };

  return (
    <InlineErrorContext.Provider value={contextValue}>
      {children}

      {/* Render all error messages */}
      {Array.from(errors.values()).map((error) => (
        <div
          key={error.id}
          id={error.id}
          role="alert"
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {error.message}
        </div>
      ))}
    </InlineErrorContext.Provider>
  );
}

/**
 * Hook to handle file input errors with ARIA attributes
 */
export function useFileInputWithErrors(
  fieldId: string,
  onFileSelect: (file: File) => Promise<void>,
) {
  const { setFieldError, clearFieldError, getFieldAriaProps } = useInlineErrors();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        // Clear any existing errors
        clearFieldError(fieldId);

        // Call the original file handler
        await onFileSelect(file);
      } catch (error) {
        // Set error with ARIA attributes
        const errorMessage = error instanceof Error ? error.message : 'File upload failed';
        setFieldError(fieldId, errorMessage);
      }
    },
    [fieldId, onFileSelect, setFieldError, clearFieldError],
  );

  const ariaProps = getFieldAriaProps(fieldId);

  return {
    fileInputRef,
    handleFileChange,
    ariaProps,
  };
}

/**
 * Component to render visible error messages
 */
interface ErrorMessageProps {
  fieldId: string;
  className?: string;
}

export function ErrorMessage({
  fieldId,
  className = 'text-red-400 text-sm mt-1',
}: ErrorMessageProps) {
  const { getFieldError } = useInlineErrors();
  const error = getFieldError(fieldId);

  if (!error) return null;

  return (
    <div
      id={error.id} // Use the same ID that's referenced in aria-describedby
      role="alert"
      className={className}
      aria-live="polite"
    >
      {error.message}
    </div>
  );
}
