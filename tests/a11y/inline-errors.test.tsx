import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardWithInlineErrors } from '@/components/a11y/DashboardWithInlineErrors';
import { ScreenReaderAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';
import { QuizModule } from '@/lib/schema/quiz';

// Mock quiz data
const mockQuizData = {
  moduleId: 'test-module',
  moduleName: 'Test Module',
  name: 'Test Module',
  questions: [
    {
      questionId: 'q1',
      questionText: 'Test question?',
      options: [
        { optionId: 'opt1', optionText: 'Option 1', isCorrect: false },
        { optionId: 'opt2', optionText: 'Option 2', isCorrect: true },
      ],
      correctOptionIds: ['opt2'],
      explanationText: 'Test explanation',
      difficulty: 'easy',
      tags: ['test'],
    },
  ],
};

describe('Inline Errors with ARIA', () => {
  let userEvent: ReturnType<typeof user.setup>;

  beforeEach(() => {
    userEvent = user.setup();
  });

  const mockModule: QuizModule = {
    name: 'Test Module',
    description: 'Test module for inline errors',
    chapters: [
      {
        id: 'ch1',
        name: 'Chapter 1',
        description: 'Test chapter',
        totalQuestions: 5,
        answeredQuestions: 3,
        correctAnswers: 2,
        isCompleted: false,
        questions: [],
      },
    ],
  } as QuizModule;

  const renderDashboard = (props = {}) => {
    const defaultProps = {
      module: mockModule as any,
      onStartQuiz: vi.fn(),
      onStartReviewSession: vi.fn(),
      onLoadNewModule: vi.fn(),
      onExportState: vi.fn(),
      onImportState: vi.fn(),
      onExportIncorrectAnswers: vi.fn(),
      reviewQueueCount: 0,
      ...props,
    };

    return render(
      <ScreenReaderAnnouncer>
        <DashboardWithInlineErrors {...defaultProps} />
      </ScreenReaderAnnouncer>,
    );
  };

  describe('Form Validation with ARIA', () => {
    it('should show inline error with aria-invalid and aria-describedby when import fails', async () => {
      const mockOnImport = vi.fn().mockRejectedValue(new Error('Invalid JSON format'));
      renderDashboard({ onImportState: mockOnImport });

      // Find the file input for import
      const fileInput = screen.getByRole('button', { name: /import state/i });
      expect(fileInput).toBeInTheDocument();

      // Create a mock file with invalid JSON
      const invalidFile = new File(['invalid json data'], 'test.json', {
        type: 'application/json',
      });

      // Get the hidden file input
      const hiddenFileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(hiddenFileInput).toBeInTheDocument();

      // Trigger file selection
      fireEvent.change(hiddenFileInput, { target: { files: [invalidFile] } });

      // Wait for error to appear
      await waitFor(() => {
        expect(hiddenFileInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Check that aria-describedby points to the error message
      const describedBy = hiddenFileInput.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();

      // Find the error message element (there may be multiple alerts - get the visible one)
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);

      // Find the visible error message (not the screen reader one)
      const visibleErrorMessage = errorMessages.find(
        (el) => el.classList.contains('text-red-400') && !el.classList.contains('sr-only'),
      );
      expect(visibleErrorMessage).toBeInTheDocument();
      expect(visibleErrorMessage).toHaveTextContent(/invalid json/i);

      // Verify the error message has the correct ID that matches aria-describedby
      expect(visibleErrorMessage).toHaveAttribute('id', describedBy);
      expect(describedBy).toMatch(/error-\d+/); // Should be something like "error-1"
    });

    it('should clear aria-invalid when user corrects the error', async () => {
      const mockOnImport = vi
        .fn()
        .mockRejectedValueOnce(new Error('Invalid JSON format')) // First attempt fails
        .mockResolvedValueOnce(undefined); // Second attempt succeeds
      renderDashboard({ onImportState: mockOnImport });

      const hiddenFileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // First, trigger error with invalid file
      const invalidFile = new File(['invalid json'], 'test.json', { type: 'application/json' });
      fireEvent.change(hiddenFileInput, { target: { files: [invalidFile] } });

      // Wait for error to appear
      await waitFor(() => {
        expect(hiddenFileInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Then, trigger success with valid file
      const validFile = new File([JSON.stringify(mockQuizData)], 'valid.json', {
        type: 'application/json',
      });
      fireEvent.change(hiddenFileInput, { target: { files: [validFile] } });

      // Check that aria-invalid is cleared
      await waitFor(() => {
        expect(hiddenFileInput).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('should show inline error for file validation failures', async () => {
      const mockOnImport = vi.fn().mockRejectedValue(new Error('File validation failed'));
      renderDashboard({ onImportState: mockOnImport });

      const hiddenFileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Trigger file selection with invalid file
      const invalidFile = new File(['invalid content'], 'test.json', { type: 'application/json' });
      fireEvent.change(hiddenFileInput, { target: { files: [invalidFile] } });

      // Wait for error to appear
      await waitFor(() => {
        expect(hiddenFileInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Check that error message appears
      const errorMessages = screen.getAllByRole('alert');
      const visibleErrorMessage = errorMessages.find(
        (el) => el.classList.contains('text-red-400') && !el.classList.contains('sr-only'),
      );
      expect(visibleErrorMessage).toBeInTheDocument();
    });

    it('should associate error messages with their corresponding fields', async () => {
      const mockOnImport = vi.fn().mockRejectedValue(new Error('Field validation failed'));
      renderDashboard({ onImportState: mockOnImport });

      const hiddenFileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Trigger file selection
      const invalidFile = new File(['invalid'], 'test.json', { type: 'application/json' });
      fireEvent.change(hiddenFileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(hiddenFileInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Get the error message ID from aria-describedby
      const describedBy = hiddenFileInput.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();

      // Find the error message with that ID
      const errorMessage = document.getElementById(describedBy!);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should not show toast notifications for field validation errors', async () => {
      const mockOnImport = vi.fn().mockRejectedValue(new Error('Validation error'));
      renderDashboard({ onImportState: mockOnImport });

      const hiddenFileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Trigger file selection
      const invalidFile = new File(['invalid json'], 'test.json', { type: 'application/json' });
      fireEvent.change(hiddenFileInput, { target: { files: [invalidFile] } });

      // Wait for inline error to appear
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        const visibleErrorMessage = errorMessages.find(
          (el) => el.classList.contains('text-red-400') && !el.classList.contains('sr-only'),
        );
        expect(visibleErrorMessage).toBeInTheDocument();
      });

      // Check that no toast notifications appear (they would have different roles/classes)
      const toasts = screen.queryAllByRole('status');
      const notificationElements = screen.queryAllByText(/toast/i);

      // Should not have toast-style notifications
      expect(toasts.length).toBeLessThanOrEqual(1); // Only the screen reader announcer
      expect(notificationElements.length).toBe(0);
    });

    it('should provide clear, actionable error messages', async () => {
      const mockOnImport = vi.fn().mockRejectedValue(new Error('JSON parse error at line 5'));
      renderDashboard({ onImportState: mockOnImport });

      const hiddenFileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Trigger file selection
      const invalidFile = new File(['{"invalid": json}'], 'test.json', {
        type: 'application/json',
      });
      fireEvent.change(hiddenFileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        const visibleErrorMessage = errorMessages.find(
          (el) => el.classList.contains('text-red-400') && !el.classList.contains('sr-only'),
        );
        expect(visibleErrorMessage).toBeInTheDocument();

        // Error message should be specific and actionable
        expect(visibleErrorMessage?.textContent).toMatch(/json|format|invalid|error/i);
      });
    });

    it('should maintain focus management during error states', async () => {
      const mockOnImport = vi.fn().mockRejectedValue(new Error('Validation failed'));
      renderDashboard({ onImportState: mockOnImport });

      const importButton = screen.getByRole('button', { name: /import state/i });
      const hiddenFileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Focus on import button and trigger error
      importButton.focus();
      expect(importButton).toHaveFocus();

      // Trigger file selection
      const invalidFile = new File(['invalid'], 'test.json', { type: 'application/json' });
      fireEvent.change(hiddenFileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        const visibleErrorMessage = errorMessages.find(
          (el) => el.classList.contains('text-red-400') && !el.classList.contains('sr-only'),
        );
        expect(visibleErrorMessage).toBeInTheDocument();
      });

      // Focus should remain on the field with the error or move to the error message
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();

      // Find the visible error message for focus check
      const errorMessages = screen.getAllByRole('alert');
      const visibleErrorMessage = errorMessages.find(
        (el) => el.classList.contains('text-red-400') && !el.classList.contains('sr-only'),
      );

      // Focus should be on the button, file input, or the error message
      expect(
        focusedElement === importButton ||
          focusedElement === hiddenFileInput ||
          focusedElement === visibleErrorMessage ||
          importButton.contains(focusedElement),
      ).toBe(true);
    });
  });

  describe('File Upload Validation', () => {
    it('should show inline error for invalid file types', async () => {
      const mockOnImport = vi.fn().mockRejectedValue(new Error('Invalid file type'));
      renderDashboard({ onImportState: mockOnImport });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Create a mock file with wrong type
      const file = new File(['invalid content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(fileInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Check for error message
      const errorMessages = screen.getAllByRole('alert');
      const visibleErrorMessage = errorMessages.find(
        (el) => el.classList.contains('text-red-400') && !el.classList.contains('sr-only'),
      );
      expect(visibleErrorMessage).toBeInTheDocument();
    });

    it('should show inline error for file size limits', async () => {
      const mockOnImport = vi.fn().mockRejectedValue(new Error('File too large'));
      renderDashboard({ onImportState: mockOnImport });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Create a large mock file
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      const file = new File([largeContent], 'large.json', { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(fileInput).toHaveAttribute('aria-invalid', 'true');
      });

      const errorMessages = screen.getAllByRole('alert');
      const visibleErrorMessage = errorMessages.find(
        (el) => el.classList.contains('text-red-400') && !el.classList.contains('sr-only'),
      );
      expect(visibleErrorMessage).toBeInTheDocument();
      expect(visibleErrorMessage?.textContent).toMatch(/too large|size|limit/i);
    });
  });
});
