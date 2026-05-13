import { useAuthContext } from '../context/AuthContext';

/**
 * Primary auth hook — returns the full AuthContext value.
 *
 * Available properties:
 *   State:   user, role, accessToken, isAuthenticated, isLoading, error, adminAccessMode
 *   Derived: isAdmin, isModerator, isGuest
 *   Actions: login, register, logout, updateUser, forgotPassword, resetPassword, clearError,
 *            setAdminAccessMode, adminLogin, adminRegister
 */
export function useAuth() {
  return useAuthContext();
}

/**
 * Returns only the auth state slice (no actions).
 * Useful in components that only need to read auth state.
 */
export function useAuthState() {
  const { user, role, accessToken, isAuthenticated, isLoading, isAdmin, isModerator, isGuest } =
    useAuthContext();
  return { user, role, accessToken, isAuthenticated, isLoading, isAdmin, isModerator, isGuest };
}

/**
 * Returns only the auth action functions.
 * Useful in forms / handlers that don't need to render based on auth state.
 */
export function useAuthActions() {
  const { login, register, logout, updateUser, forgotPassword, resetPassword, clearError } =
    useAuthContext();
  return { login, register, logout, updateUser, forgotPassword, resetPassword, clearError };
}

/**
 * Returns true only when the user has the admin (or super-admin) role.
 */
export function useIsAdmin() {
  return useAuthContext().isAdmin;
}
