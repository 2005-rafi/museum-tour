import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';

/**
 * Wraps a route to require authentication.
 * Optionally enforces a minimum role level.
 *
 * @param {{ children: React.ReactNode, requiredRole?: 'user'|'moderator'|'admin'|'super-admin' }} props
 */
function ProtectedRoute({ children, requiredRole = 'user' }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner fullPage />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleLevel = { user: 1, moderator: 2, admin: 3, 'super-admin': 4 };
  const userLevel = roleLevel[user?.role] || 1;
  const required = roleLevel[requiredRole] || 1;

  if (userLevel < required) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
