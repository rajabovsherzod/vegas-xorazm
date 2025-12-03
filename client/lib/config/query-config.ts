/**
 * React Query Configuration
 * 
 * Centralized caching strategy va query defaults
 */

import { QueryClient, DefaultOptions } from "@tanstack/react-query";

/**
 * Cache times (milliseconds)
 */
export const CACHE_TIME = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
  INFINITE: Infinity,
} as const;

/**
 * Stale times (milliseconds)
 */
export const STALE_TIME = {
  IMMEDIATE: 0,               // Always stale
  SHORT: 30 * 1000,          // 30 seconds
  MEDIUM: 2 * 60 * 1000,     // 2 minutes
  LONG: 5 * 60 * 1000,       // 5 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
} as const;

/**
 * Query keys with cache configuration
 */
export const QUERY_CONFIG = {
  // Products - Medium caching (5 min stale, 15 min cache)
  products: {
    key: ['products'],
    staleTime: STALE_TIME.MEDIUM,
    cacheTime: CACHE_TIME.LONG,
  },

  // Categories - Long caching (rarely changes)
  categories: {
    key: ['categories'],
    staleTime: STALE_TIME.LONG,
    cacheTime: CACHE_TIME.VERY_LONG,
  },

  // Orders - Short caching (real-time updates via socket)
  orders: {
    key: ['orders'],
    staleTime: STALE_TIME.SHORT,
    cacheTime: CACHE_TIME.MEDIUM,
  },

  // Dashboard stats - Medium caching
  dashboardStats: {
    key: ['dashboard-stats'],
    staleTime: STALE_TIME.MEDIUM,
    cacheTime: CACHE_TIME.LONG,
  },

  // USD Rate - Long caching (changes once per day)
  usdRate: {
    key: ['usd-rate'],
    staleTime: STALE_TIME.VERY_LONG,
    cacheTime: CACHE_TIME.VERY_LONG,
  },

  // Users/Staff - Medium caching
  users: {
    key: ['users'],
    staleTime: STALE_TIME.MEDIUM,
    cacheTime: CACHE_TIME.LONG,
  },
} as const;

/**
 * Default Query Client Options
 */
const defaultOptions: DefaultOptions = {
  queries: {
    // Default stale time
    staleTime: STALE_TIME.MEDIUM,

    // Default cache time
    gcTime: CACHE_TIME.LONG,

    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 2 times for 5xx errors
      return failureCount < 2;
    },

    // Retry delay (exponential backoff)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch configuration
    refetchOnWindowFocus: false, // Socket.io handles real-time updates
    refetchOnReconnect: true,
    refetchOnMount: true,

    // Network mode
    networkMode: 'online',
  },

  mutations: {
    // Retry mutations once
    retry: 1,

    // Retry delay
    retryDelay: 1000,

    // Network mode
    networkMode: 'online',
  },
};

/**
 * Create Query Client with optimized defaults
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions,
  });
}

/**
 * Prefetch helper
 */
export async function prefetchQuery(
  queryClient: QueryClient,
  queryKey: string[],
  queryFn: () => Promise<any>
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}

/**
 * Invalidate multiple queries
 */
export function invalidateQueries(
  queryClient: QueryClient,
  queryKeys: string[][]
) {
  queryKeys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}

/**
 * Clear all cache
 */
export function clearAllCache(queryClient: QueryClient) {
  queryClient.clear();
}

