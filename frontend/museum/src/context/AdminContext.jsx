import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import adminService from '../services/adminService';

const POLL_INTERVAL = 30 * 1000; // 30 s
const RANGE_OPTIONS = [
  { label: '7 Days',  value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: 'All Time', value: 'all' },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const AdminContext = createContext(null);

/**
 * AdminProvider — wraps admin layout.  A single `GET /api/admin/analytics`
 * call returns every stat, chart series, and insight the dashboard needs.
 *
 * Exposes the full analytics payload + range controls:
 *   analytics, isLoading, range, setRange, RANGE_OPTIONS, pollInterval
 */
export function AdminProvider({ children }) {
  const [range, setRange] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', range],
    queryFn:  () => adminService.getAnalytics({ range }),
    refetchInterval:         POLL_INTERVAL,
    staleTime:               POLL_INTERVAL,
    refetchIntervalInBackground: false,
    retry: false,
  });

  const analytics = data?.data ?? null;

  const value = useMemo(() => ({
    analytics,
    isLoading,
    range,
    setRange,
    RANGE_OPTIONS,
    pollInterval: POLL_INTERVAL,
  }), [analytics, isLoading, range]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

/**
 * Access admin analytics data.
 * Must be used inside <AdminProvider> (i.e. within an admin route).
 */
export function useAdminStats() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminStats must be used inside AdminProvider');
  return ctx;
}

export default AdminContext;
