/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * @module components/ui/error-boundary
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Home, Trash2 } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    // Clear local storage to potentially fix state-related crashes
    try {
      localStorage.clear();
      console.log('Local storage cleared to recover from crash');
    } catch (e) {
      console.error('Failed to clear local storage:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4 text-white">
          <div className="w-full max-w-md space-y-6 rounded-lg border border-red-900/50 bg-red-950/20 p-8 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30 text-red-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">Something went wrong</h2>
              <p className="text-slate-400">
                An unexpected error occurred. We apologize for the inconvenience.
              </p>
              {this.state.error && (
                <div className="mt-4 max-h-32 overflow-y-auto rounded bg-black/50 p-2 text-left font-mono text-xs text-red-300">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={this.handleReload}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCcw className="h-4 w-4" />
                Reload Page
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/')}
                  className="gap-2 border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReset}
                  className="gap-2 border-red-900/30 bg-red-950/30 text-red-300 hover:border-red-800/50 hover:bg-red-900/40 hover:text-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Reset App
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
