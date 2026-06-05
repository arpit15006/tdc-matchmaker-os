import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry client errors (4xx).
        if (error instanceof AxiosError && error.response && error.response.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
