'use client';

import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from './rendering/MarkdownRenderer';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-400" />,
          confirmBg: 'bg-red-700 hover:bg-red-800 active:bg-red-900',
          confirmRing: 'focus-visible:ring-red-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-400" />,
          confirmBg: 'bg-yellow-700 hover:bg-yellow-800 active:bg-yellow-900',
          confirmRing: 'focus-visible:ring-yellow-500',
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-6 w-6 text-blue-400" />,
          confirmBg: 'bg-blue-700 hover:bg-blue-800 active:bg-blue-900',
          confirmRing: 'focus-visible:ring-blue-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl border-blue-700 bg-gradient-to-r from-blue-950 to-blue-900 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl text-white">
            {styles.icon}
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            <MarkdownRenderer
              markdown={message}
              className="break-words leading-relaxed text-white"
            />
          </DialogDescription>
        </DialogHeader>

        {questionPreview && (
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
            <div className="mb-2 text-sm font-medium text-gray-300">Question Preview:</div>
            <MarkdownRenderer
              markdown={questionPreview}
              className="break-words text-sm leading-relaxed text-gray-200"
            />
          </div>
        )}

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-700 bg-gray-900/70 text-gray-200 hover:border-gray-600 hover:bg-gray-800 hover:text-white"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`${styles.confirmBg} text-white transition-all duration-200 ${styles.confirmRing} focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
