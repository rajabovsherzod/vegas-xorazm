/**
 * Custom Error Logger
 * 
 * 100% bepul, Sentry alternativasi
 */

interface ErrorData {
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  context?: any;
  level: 'error' | 'warning' | 'info';
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private apiUrl = process.env.NEXT_PUBLIC_API_URL;
  private isEnabled = true;

  private constructor() {
    // Global handlers o'chirildi - faqat manual logging
    // if (typeof window !== 'undefined') {
    //   this.setupGlobalHandlers();
    // }
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Global error handlers
   */
  private setupGlobalHandlers() {
    // Uncaught errors
    window.addEventListener('error', (event) => {
      // Don't prevent default - let browser handle it too

      const error = event.error || new Error(event.message || 'Uncaught error');
      this.logError(error, {
        type: 'uncaughtError',
        filename: event.filename || 'unknown',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      // Don't prevent default - let browser handle it too

      const reason = event.reason;
      const error = reason instanceof Error
        ? reason
        : new Error(reason?.message || String(reason) || 'Unhandled rejection');

      this.logError(error, {
        type: 'unhandledRejection',
        reason: String(reason),
      });
    });
  }

  /**
   * Log error
   */
  async logError(error: Error | string | unknown, context?: any) {
    if (!this.isEnabled) return;

    // Handle different error types
    let errorMessage: string;
    let errorStack: string | undefined;

    if (typeof error === 'string') {
      errorMessage = error;
      errorStack = undefined;
    } else if (error instanceof Error) {
      errorMessage = error.message || 'Error occurred';
      errorStack = error.stack;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message) || 'Error occurred';
      errorStack = (error as any).stack;
    } else {
      errorMessage = String(error) || 'Unknown error';
      errorStack = undefined;
    }

    const errorData: ErrorData = {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      context,
      level: 'error',
    };

    // Console logging
    const logData: any = {
      message: errorData.message,
      timestamp: errorData.timestamp,
      url: errorData.url,
    };

    // Only add context if it exists and has data
    if (errorData.context && typeof errorData.context === 'object' && Object.keys(errorData.context).length > 0) {
      logData.context = errorData.context;
    }

    // Add stack trace if available
    if (errorData.stack) {
      logData.stack = errorData.stack.substring(0, 200) + '...';
    }

    // Backend ga yuborish
    await this.sendToBackend(errorData);

    // LocalStorage ga saqlash (backup)
    this.saveToLocalStorage(errorData);
  }

  /**
   * Log warning
   */
  async logWarning(message: string, context?: any) {
    if (!this.isEnabled) return;

    const errorData: ErrorData = {
      message: message || 'Warning',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      context,
      level: 'warning',
    };

    const logData: any = {
      message: errorData.message,
      timestamp: errorData.timestamp,
      url: errorData.url,
    };

    if (context && Object.keys(context).length > 0) {
      logData.context = context;
    }

    await this.sendToBackend(errorData);
    this.saveToLocalStorage(errorData);
  }

  /**
   * Log info
   */
  async logInfo(message: string, context?: any) {
    if (!this.isEnabled) return;

    const errorData: ErrorData = {
      message: message || 'Info',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      context,
      level: 'info',
    };

    const logData: any = {
      message: errorData.message,
      timestamp: errorData.timestamp,
      url: errorData.url,
    };

    if (context && Object.keys(context).length > 0) {
      logData.context = context;
    }

    await this.sendToBackend(errorData);
  }

  /**
   * Send to backend
   */
  private async sendToBackend(errorData: ErrorData) {
    if (!this.apiUrl) return;

    try {
      await fetch(`${this.apiUrl}/logs/error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      });
    } catch (e) {
      console.error('Failed to send error to backend:', e);
    }
  }

  /**
   * Save to localStorage (backup)
   */
  private saveToLocalStorage(errorData: ErrorData) {
    if (typeof window === 'undefined') return;

    try {
      const existingErrors = localStorage.getItem('app_errors');
      const errors = existingErrors ? JSON.parse(existingErrors) : [];

      // Yangi error ni qo'shish
      errors.push(errorData);

      // Faqat oxirgi 100 ta xatolikni saqlash
      if (errors.length > 100) {
        errors.splice(0, errors.length - 100);
      }

      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  /**
   * Get local errors
   */
  getLocalErrors(): ErrorData[] {
    if (typeof window === 'undefined') return [];

    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      return errors;
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      return [];
    }
  }

  /**
   * Clear local errors
   */
  clearLocalErrors() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('app_errors');
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

