import { QueryClient, DefaultOptions } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: Data considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache time: Unused data kept in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry logic: Retry failed requests up to 3 times with exponential backoff
    retry: (failureCount, error: Error) => {
      // Don't retry on 4xx errors (client errors)
      const apiError = error as Error & { status?: number };
      if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus in production
    refetchOnWindowFocus: process.env.NODE_ENV === "production",
    // Don't refetch on mount by default
    refetchOnMount: false,
  },
  mutations: {
    // Retry mutations once on network errors
    retry: 1,
  },
};

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

// Global query client instance
export const queryClient = makeQueryClient();
