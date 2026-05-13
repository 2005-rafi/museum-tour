/**
 * components/auth/AdminRoute.jsx
 *
 * AdminProtectedRoute — wraps routes that require the `admin` (or higher)
 * role. Unauthenticated users go to /login; authenticated non-admins are
 * silently redirected to the home page.
 *
 * Roles and their levels (defined in AuthContext):
 *   guest       → 0
 *   user        → 1
 *   moderator   → 2
 *   admin       → 3   ← minimum for this guard
 *   super-admin → 4
 *
 * Usage:
 *   <AdminProtectedRoute>
 *     <Admin />
 *   </AdminProtectedRoute>
 *
 * Also exported as default for convenience.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';

export function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner fullPage />;

  // Not logged in at all → send to /login first
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Logged in but not an admin → silent home redirect
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
