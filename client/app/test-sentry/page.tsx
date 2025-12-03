/**
 * GlitchTip Test Page
 * 
 * Bu sahifa GlitchTip monitoring tizimini tekshirish uchun
 * (GlitchTip is Sentry-compatible, so all code works!)
 */

'use client';

import { useState } from 'react';
import { errorLogger } from '@/lib/utils/error-logger';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bug, Info, AlertTriangle } from 'lucide-react';

export default function TestSentryPage() {
  const [lastTest, setLastTest] = useState<string>('');

  // Test 1: JavaScript Error
  const testJavaScriptError = () => {
    try {
      throw new Error('Test JavaScript Error - Frontend Monitoring Working! ✅');
    } catch (error) {
      if (error instanceof Error) {
        errorLogger.logError(error, { testType: 'javascript-error' });
      }
      setLastTest('JavaScript Error logged successfully');
    }
  };

  // Test 2: Unhandled Error
  const testUnhandledError = () => {
    try {
      const error = new Error('Test Unhandled Error - Error Boundary Working! ✅');
      errorLogger.logError(error, { testType: 'unhandled-error' });
      setLastTest('Unhandled Error logged successfully');
    } catch (error) {
      if (error instanceof Error) {
        errorLogger.logError(error, { testType: 'unhandled-error-caught' });
      }
    }
  };

  // Test 3: API Error
  const testApiError = async () => {
    try {
      const response = await fetch('/api/non-existent-endpoint');
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        errorLogger.logError(error, { testType: 'api-error' });
      }
      setLastTest('API Error logged successfully');
    }
  };

  // Test 4: Custom Message
  const testCustomMessage = () => {
    errorLogger.logInfo('Test Custom Message - Monitoring Active! 📊', {
      testType: 'info-message',
    });
    setLastTest('Custom message logged successfully');
  };

  // Test 5: Warning
  const testWarning = () => {
    errorLogger.logWarning('Test Warning - Performance Issue Detected! ⚠️', {
      testType: 'warning',
      metric: 'response-time',
      value: 5000,
    });
    setLastTest('Warning logged successfully');
  };

  // Test 6: With Context
  const testWithContext = () => {
    const error = new Error('Test Error with Context');
    errorLogger.logError(error, {
      testType: 'error-with-context',
      section: 'test-page',
      environment: 'development',
      user: {
        id: '123',
        username: 'test-user',
        email: 'test@example.com',
      },
      testData: 'Additional context data',
      timestamp: new Date().toISOString(),
    });
    setLastTest('Error with context logged successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D1B1E] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212B36] dark:text-white mb-2">
            🔍 Sentry Monitoring Test
          </h1>
          <p className="text-muted-foreground">
            Bu sahifada Sentry monitoring tizimini tekshirishingiz mumkin.
            Har bir tugmani bosing va Sentry dashboard da natijalarni ko'ring.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Qanday tekshirish kerak?
          </h2>
          <ol className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>1. http://localhost:8000 ga kiring (GlitchTip)</li>
            <li>2. "Issues" bo'limiga o'ting</li>
            <li>3. Quyidagi tugmalarni bosing</li>
            <li>4. GlitchTip dashboard da yangi xatolar paydo bo'lishini kuzating</li>
            <li>5. Har bir xatolik uchun stack trace va context ma'lumotlarini ko'ring</li>
          </ol>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Test 1 */}
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
            <div className="flex items-start gap-3 mb-4">
              <Bug className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <h3 className="font-semibold text-[#212B36] dark:text-white mb-1">
                  JavaScript Error
                </h3>
                <p className="text-sm text-muted-foreground">
                  Oddiy JavaScript xatoligini yuborish
                </p>
              </div>
            </div>
            <Button
              onClick={testJavaScriptError}
              variant="destructive"
              className="w-full"
            >
              Test JavaScript Error
            </Button>
          </div>

          {/* Test 2 */}
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <h3 className="font-semibold text-[#212B36] dark:text-white mb-1">
                  Unhandled Error
                </h3>
                <p className="text-sm text-muted-foreground">
                  Error Boundary ni tekshirish
                </p>
              </div>
            </div>
            <Button
              onClick={testUnhandledError}
              variant="destructive"
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Test Unhandled Error
            </Button>
          </div>

          {/* Test 3 */}
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
              <div>
                <h3 className="font-semibold text-[#212B36] dark:text-white mb-1">
                  API Error
                </h3>
                <p className="text-sm text-muted-foreground">
                  API xatoligini yuborish
                </p>
              </div>
            </div>
            <Button
              onClick={testApiError}
              variant="destructive"
              className="w-full bg-yellow-500 hover:bg-yellow-600"
            >
              Test API Error
            </Button>
          </div>

          {/* Test 4 */}
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-semibold text-[#212B36] dark:text-white mb-1">
                  Custom Message
                </h3>
                <p className="text-sm text-muted-foreground">
                  Maxsus xabar yuborish
                </p>
              </div>
            </div>
            <Button
              onClick={testCustomMessage}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Test Custom Message
            </Button>
          </div>

          {/* Test 5 */}
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-1" />
              <div>
                <h3 className="font-semibold text-[#212B36] dark:text-white mb-1">
                  Warning
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ogohlantirish yuborish
                </p>
              </div>
            </div>
            <Button
              onClick={testWarning}
              className="w-full bg-amber-500 hover:bg-amber-600"
            >
              Test Warning
            </Button>
          </div>

          {/* Test 6 */}
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
            <div className="flex items-start gap-3 mb-4">
              <Bug className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <h3 className="font-semibold text-[#212B36] dark:text-white mb-1">
                  Error with Context
                </h3>
                <p className="text-sm text-muted-foreground">
                  Qo'shimcha ma'lumotlar bilan
                </p>
              </div>
            </div>
            <Button
              onClick={testWithContext}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Test with Context
            </Button>
          </div>
        </div>

        {/* Last Test Result */}
        {lastTest && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✅ {lastTest}
            </p>
            <div className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
              <p>📊 Qayerda ko'rish mumkin:</p>
              <ul className="ml-4 space-y-1">
                <li>• Browser Console (F12)</li>
                <li>• <a href="/superadmin/error-logs" className="underline hover:text-green-600">Error Logs Dashboard</a></li>
                <li>• Backend logs: <code className="bg-green-100 dark:bg-green-900 px-1 rounded">backend/logs/error.log</code></li>
                <li>• GlitchTip (agar sozlangan bo'lsa): <a href="http://localhost:8000" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600">http://localhost:8000</a></li>
              </ul>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="mt-8 p-6 bg-white dark:bg-[#1C2C30] rounded-xl shadow-sm border">
          <h3 className="font-semibold text-[#212B36] dark:text-white mb-3">
            📊 Foydali Havolalar
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="http://localhost:8000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00B8D9] hover:underline"
              >
                → GlitchTip Dashboard
              </a>
            </li>
            <li>
              <a
                href="https://glitchtip.com/documentation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00B8D9] hover:underline"
              >
                → GlitchTip Documentation
              </a>
            </li>
            <li>
              <a
                href="/TESTING_GUIDE.md"
                className="text-[#00B8D9] hover:underline"
              >
                → Testing Guide
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

