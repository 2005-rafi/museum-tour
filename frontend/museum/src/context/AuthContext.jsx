import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService';

// ─── Role helpers ─────────────────────────────────────────────────────────────
const ROLE_LEVEL = { guest: 0, user: 1, moderator: 2, admin: 3, 'super-admin': 4 };
const roleLevel = (role) => ROLE_LEVEL[role] ?? 1;

// ─── Initial state (hydrated from localStorage) ───────────────────────────────
const stored = authService.getStoredUser();
const { accessToken: storedToken } = authService.getStoredTokens();

const initialState = {
  user:            stored ?? null,
  role:            stored?.role ?? 'guest',
  accessToken:     storedToken ?? null,
  isAuthenticated: !!storedToken,
  isLoading:       false,
  error:           null,
  adminAccessMode: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
const AUTH_ACTIONS = {
  AUTH_START:         'AUTH_START',
  AUTH_SUCCESS:       'AUTH_SUCCESS',
  AUTH_FAILURE:       'AUTH_FAILURE',
  LOGOUT:             'LOGOUT',
  UPDATE_USER:        'UPDATE_USER',
  CLEAR_ERROR:        'CLEAR_ERROR',
  SET_ADMIN_ACCESS:   'SET_ADMIN_ACCESS',
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return { ...state, isLoading: true, error: null };

    case AUTH_ACTIONS.AUTH_SUCCESS: {
      const { user, accessToken } = action.payload;
      return {
        ...state,
        user,
        role:            user?.role ?? 'user',
        accessToken:     accessToken ?? state.accessToken,
        isAuthenticated: true,
        isLoading:       false,
        error:           null,
      };
    }

    case AUTH_ACTIONS.AUTH_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case AUTH_ACTIONS.LOGOUT:
      return { user: null, role: 'guest', accessToken: null, isAuthenticated: false, isLoading: false, error: null, adminAccessMode: false };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        role: action.payload.role ?? state.role,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.SET_ADMIN_ACCESS:
      return { ...state, adminAccessMode: action.payload };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Listen for forced-logout events emitted by apiClient (token refresh failed)
  useEffect(() => {
    const handleForceLogout = () => {
      authService.clearSession();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      const data = await authService.login(email, password);
      authService.persistSession(data);
      dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: { user: data.user, accessToken: data.accessToken } });
      return { success: true };
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  // Auto-login after successful registration when the API returns tokens.
  // Falls back to "registration OK, please log in" if no tokens are returned.
  const register = useCallback(async (formData) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      const data = await authService.register(formData);

      if (data?.accessToken) {
        // Backend returned tokens → persist session and mark user as authenticated
        authService.persistSession(data);
        dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: { user: data.user, accessToken: data.accessToken } });
      } else {
        // No tokens (e.g. "check your email" flow) → just reset loading
        dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: null });
      }
      return { success: true, data };
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { refreshToken } = authService.getStoredTokens();
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // Always clear local state even if the server call fails
    } finally {
      authService.clearSession();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  const updateUser = useCallback((data) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: data });
    // Keep localStorage in sync
    const stored = authService.getStoredUser();
    localStorage.setItem('museum_user', JSON.stringify({ ...stored, ...data }));
  }, []);

  const forgotPassword = useCallback(async (email) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      const data = await authService.forgotPassword(email);
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: null });
      return { success: true, data };
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword, confirmPassword) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      await authService.resetPassword(token, newPassword, confirmPassword);
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: null });
      return { success: true };
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const setAdminAccessMode = useCallback((enabled) => {
    dispatch({ type: AUTH_ACTIONS.SET_ADMIN_ACCESS, payload: enabled });
  }, []);

  const adminLogin = useCallback(async (email, password, adminSecretKey) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      const data = await authService.adminLogin(email, password, adminSecretKey);
      authService.persistSession(data);
      dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: { user: data.user, accessToken: data.accessToken } });
      return { success: true };
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  const adminRegister = useCallback(async (formData) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      const data = await authService.adminRegister(formData);
      if (data?.accessToken) {
        authService.persistSession(data);
        dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: { user: data.user, accessToken: data.accessToken } });
      } else {
        dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: null });
      }
      return { success: true, data };
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  // ── Role helpers ───────────────────────────────────────────────────────────
  const isAdmin      = roleLevel(state.role) >= ROLE_LEVEL.admin;
  const isModerator  = roleLevel(state.role) >= ROLE_LEVEL.moderator;
  const isGuest      = !state.isAuthenticated;

  const value = {
    // State
    user:            state.user,
    role:            state.role,
    accessToken:     state.accessToken,
    isAuthenticated: state.isAuthenticated,
    isLoading:       state.isLoading,
    error:           state.error,
    adminAccessMode: state.adminAccessMode,
    // Derived
    isAdmin,
    isModerator,
    isGuest,
    // Actions
    login,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    clearError,
    setAdminAccessMode,
    adminLogin,
    adminRegister,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>');
  return ctx;
}

export default AuthContext;
