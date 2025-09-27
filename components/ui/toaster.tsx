'use client';

// Use the shadcn store to match the Radix UI <Toast> components
import { useToast } from '@/components/ui/use-toast';
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">{title && <ToastTitle>{title}</ToastTitle>}</div>
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
