/**
 * Logs Service
 */

import { api } from "@/lib/api/api-client";

export interface ErrorLog {
  id: number;
  message: string;
  stack?: string | null;
  url: string;
  userAgent: string;
  level: 'error' | 'warning' | 'info';
  context?: any;
  ip?: string | null;
  userId?: number | null;
  createdAt: string;
}

export interface ErrorLogsResponse {
  logs: ErrorLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorLogsStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
}

export const logsService = {
  /**
   * Get all error logs
   */
  getAll: async (query?: {
    level?: 'all' | 'error' | 'warning' | 'info';
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    source?: 'frontend' | 'backend'; // Frontend yoki Backend xatoliklari
  }): Promise<ErrorLogsResponse> => {
    const params = new URLSearchParams();
    if (query?.level) params.append('level', query.level);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.source) params.append('source', query.source);

    const endpoint = `/logs${params.toString() ? `?${params.toString()}` : ''}`;
    return await api.get<ErrorLogsResponse>(endpoint);
  },

  /**
   * Get error log by ID
   */
  getById: async (id: number): Promise<ErrorLog> => {
    return await api.get<ErrorLog>(`/logs/${id}`);
  },

  /**
   * Delete error log
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/logs/${id}`);
  },

  /**
   * Clear all error logs
   */
  clearAll: async (): Promise<void> => {
    await api.delete('/logs');
  },

  /**
   * Get error logs stats
   */
  getStats: async (): Promise<ErrorLogsStats> => {
    try {
      const res = await api.get<ErrorLogsStats>('/logs/stats');
      // API client allaqachon data ni extract qiladi, shuning uchun to'g'ridan-to'g'ri ErrorLogsStats qaytadi
      // Agar res bo'lmasa yoki to'liq bo'lmasa, default qiymatlar
      if (!res || typeof res.total === 'undefined') {
        return {
          total: 0,
          errors: 0,
          warnings: 0,
          info: 0,
        };
      }
      return res;
    } catch (error) {
      // Xatolik bo'lsa, default qiymatlar qaytarish
      console.error('Failed to fetch error logs stats:', error);
      return {
        total: 0,
        errors: 0,
        warnings: 0,
        info: 0,
      };
    }
  },
};

