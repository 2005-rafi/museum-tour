import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider }     from '../../context/AuthContext';
import { ArtifactProvider } from '../../context/ArtifactContext';
import { MuseumProvider }   from '../../context/MuseumContext';

// ─── React Query client ───────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Retry strategy:
       *  – Never retry on 4xx client errors (except 429 rate-limiting).
       *  – Retry up to 2 times on network / 5xx errors with exponential back-off.
       */
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500 && status !== 429) return false;
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 12000),

      // Stay fresh for 3 min; cache persists for 10 min after component unmounts.
      staleTime:  3  * 60 * 1000,
      gcTime:     10 * 60 * 1000,

      // Refetch on network reconnect; skip noisy window-focus refetches.
      refetchOnWindowFocus: false,
      refetchOnReconnect:   true,
      refetchOnMount:       true,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Root provider tree.
 *
 * Layer order (outermost → innermost):
 *   QueryClient → Auth → Museum filters → Artifact filters → page
 *
 * AdminProvider is intentionally NOT here — it mounts inside AdminLayout
 * so polling only starts when the user visits an admin page.
 */
function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MuseumProvider>
          <ArtifactProvider>
            {children}
          </ArtifactProvider>
        </MuseumProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default AppProviders;
