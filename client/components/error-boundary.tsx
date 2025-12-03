"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * React komponentlarida yuz beradigan xatolarni ushlaydi va
 * user-friendly error page ko'rsatadi.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Log to error logger
    if (typeof window !== 'undefined') {
      import('@/lib/utils/error-logger').then(({ errorLogger }) => {
        errorLogger.logError(error, {
          type: 'errorBoundary',
          componentStack: errorInfo.componentStack,
        });
      }).catch(err => {
        console.error('Failed to log error:', err);
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0D1B1E] p-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-[#132326] rounded-2xl shadow-2xl p-8 text-center border border-gray-200 dark:border-white/10">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-[#212B36] dark:text-white mb-3">
                Nimadir xato ketdi
              </h1>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                Uzr, kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang yoki qayta urinib ko'ring.
              </p>

              {/* Error details (only in development) */}
              {process.env.NODE_ENV === "development" && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/10 text-left">
                  <p className="text-xs font-mono text-rose-600 dark:text-rose-400 break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-[#00B8D9]">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-[10px] text-muted-foreground overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white font-bold rounded-xl h-11"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Qayta urinish
                </Button>
                <Button
                  onClick={() => window.location.href = "/"}
                  variant="outline"
                  className="flex-1 rounded-xl h-11 font-bold"
                >
                  Bosh sahifa
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

/**
 * Simple Error Fallback Component
 * 
 * Oddiy error fallback UI
 */
export function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">Xatolik yuz berdi</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset} className="bg-[#00B8D9] hover:bg-[#00B8D9]/90">
        Qayta urinish
      </Button>
    </div>
  );
}

