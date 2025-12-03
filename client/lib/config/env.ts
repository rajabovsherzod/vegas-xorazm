/**
 * Environment Configuration
 * 
 * Centralized environment variables management.
 * All environment variables should be accessed through this file.
 * 
 * @example
 * ```ts
 * import { ENV } from '@/lib/config/env';
 * const apiUrl = ENV.API_URL;
 * ```
 */

export const ENV = {
  /**
   * Backend API base URL
   * @default 'http://localhost:5000/api/v1'
   */
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',

  /**
   * WebSocket server URL (Socket.io)
   * @default 'http://localhost:5000'
   */
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000',

  /**
   * NextAuth configuration
   */
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

  /**
   * Environment mode
   */
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv() {
  const required = ['NEXT_PUBLIC_API_URL', 'NEXTAUTH_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && ENV.IS_PRODUCTION) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

