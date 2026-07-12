import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton React Query client.
 * - 5-minute stale time: data is considered fresh for 5 min after fetch
 * - 3 retry attempts on failure (skips retry on 4xx status codes)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: unknown) => {
        // Don't retry on client errors (4xx)
        if (error && typeof error === 'object' && 'response' in error) {
          const status = (error as { response?: { status?: number } }).response?.status;
          if (status && status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
