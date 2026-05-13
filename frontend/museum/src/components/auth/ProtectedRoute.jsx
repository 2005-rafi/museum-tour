/**
 * components/auth/ProtectedRoute.jsx
 *
 * UserProtectedRoute — wraps any route that requires the user to be
 * authenticated. Guests are redirected to /login, with `location.state.from`
 * set so the Login page can redirect back after a successful login.
 *
 * Usage:
 *   <UserProtectedRoute>
 *     <Profile />
 *   </UserProtectedRoute>
 *
 * Also exported as default for convenience.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';

export function UserProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner fullPage />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}

export default UserProtectedRoute;
