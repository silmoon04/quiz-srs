'use client';
import { useState, useCallback } from 'react';
import type { Toast } from '@/components/toast-notification';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast({ type: 'success', title, message, duration });
    },
    [addToast],
  );

  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast({ type: 'error', title, message, duration });
    },
    [addToast],
  );

  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast({ type: 'info', title, message, duration });
    },
    [addToast],
  );

  const showWarning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast({ type: 'warning', title, message, duration });
    },
    [addToast],
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearAllToasts,
  };
}
