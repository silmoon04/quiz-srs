'use client';
import { Button } from '@/components/ui/button';
import type React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecureTextRenderer } from './secure-text-renderer';
import { AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  questionPreview?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  questionPreview,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-400" />,
          headerBg: 'from-red-950 to-red-900',
          borderColor: 'border-red-700',
          confirmBg: 'bg-red-700 hover:bg-red-800 active:bg-red-900',
          confirmRing: 'focus-visible:ring-red-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-400" />,
          headerBg: 'from-yellow-950 to-yellow-900',
          borderColor: 'border-yellow-700',
          confirmBg: 'bg-yellow-700 hover:bg-yellow-800 active:bg-yellow-900',
          confirmRing: 'focus-visible:ring-yellow-500',
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-6 w-6 text-blue-400" />,
          headerBg: 'from-blue-950 to-blue-900',
          borderColor: 'border-blue-700',
          confirmBg: 'bg-blue-700 hover:bg-blue-800 active:bg-blue-900',
          confirmRing: 'focus-visible:ring-blue-500',
        };
    }
  };

  const styles = getVariantStyles();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Card
        className={`bg-gradient-to-r ${styles.headerBg} ${styles.borderColor} w-full max-w-2xl shadow-xl backdrop-blur-sm`}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="mt-1 flex-shrink-0">{styles.icon}</div>
              <CardTitle className="break-words text-xl leading-tight text-white">
                {title}
              </CardTitle>
            </div>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 text-gray-400 hover:bg-white/10 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main message */}
          <div className="prose prose-invert max-w-none">
            <SecureTextRenderer
              content={message}
              className="break-words leading-relaxed text-white"
            />
          </div>

          {/* Optional question preview */}
          {questionPreview && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-300">Preview:</h4>
              <div className="prose prose-invert max-w-none">
                <SecureTextRenderer
                  content={questionPreview}
                  className="break-words text-sm leading-relaxed text-gray-200"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-gray-700 bg-gray-900/70 text-gray-200 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800 hover:text-white"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={`${styles.confirmBg} text-white transition-all duration-200 ${styles.confirmRing} focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900`}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
