'use client';

import React, { useRef, useCallback } from 'react';
import { Dashboard } from '@/components/dashboard';
import { InlineErrorHandler, useInlineErrors, ErrorMessage } from './InlineErrorHandler';
import { QuizModule } from '@/types/quiz-types';

interface DashboardWithInlineErrorsProps {
  module: QuizModule;
  onStartQuiz: (chapterId: string) => void;
  onStartReviewSession: () => void;
  onLoadNewModule: () => void;
  onExportState: () => void;
  onImportState: (file: File) => Promise<void>;
  onExportIncorrectAnswers: () => void;
  reviewQueueCount: number;
}

function DashboardContent({
  module,
  onStartQuiz,
  onStartReviewSession,
  onLoadNewModule,
  onExportState,
  onImportState,
  onExportIncorrectAnswers,
  reviewQueueCount,
}: DashboardWithInlineErrorsProps) {
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const { setFieldError, clearFieldError, getFieldAriaProps } = useInlineErrors();

  // Enhanced import handler with error handling
  const handleImportState = useCallback(
    async (file: File) => {
      try {
        // Clear any existing errors
        clearFieldError('import-state-file');

        // Call the original import handler
        await onImportState(file);
      } catch (error) {
        // Set error with ARIA attributes
        const errorMessage = error instanceof Error ? error.message : 'Import failed';
        setFieldError('import-state-file', errorMessage);
      }
    },
    [onImportState, setFieldError, clearFieldError],
  );

  // Enhanced file input change handler
  const handleImportFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleImportState(file);
      }
      // Reset the input so the same file can be selected again if needed
      if (importFileInputRef.current) {
        importFileInputRef.current.value = '';
      }
    },
    [handleImportState],
  );

  const triggerImportFileInput = useCallback(() => {
    importFileInputRef.current?.click();
  }, []);

  const ariaProps = getFieldAriaProps('import-state-file');

  return (
    <div className="relative">
      {/* Enhanced hidden file input with ARIA error handling */}
      <input
        ref={importFileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFileSelect}
        className="hidden"
        {...ariaProps}
        aria-label="Import quiz state file"
      />

      {/* Error message for file input */}
      <ErrorMessage fieldId="import-state-file" />

      {/* Dashboard with enhanced import functionality */}
      <Dashboard
        module={module}
        onStartQuiz={onStartQuiz}
        onStartReviewSession={onStartReviewSession}
        onLoadNewModule={onLoadNewModule}
        onExportState={onExportState}
        onImportState={triggerImportFileInput}
        onExportIncorrectAnswers={onExportIncorrectAnswers}
        reviewQueueCount={reviewQueueCount}
      />
    </div>
  );
}

/**
 * Enhanced Dashboard component with inline error handling and ARIA attributes
 */
export function DashboardWithInlineErrors(props: DashboardWithInlineErrorsProps) {
  return (
    <InlineErrorHandler>
      <DashboardContent {...props} />
    </InlineErrorHandler>
  );
}
