/**
 * authService.js
 *
 * Dedicated authentication service layer.
 * Keeps auth API calls separate from general user-profile calls (userService).
 *
 * Each method maps 1-to-1 to a backend endpoint:
 *   POST /api/users/register
 *   POST /api/users/login
 *   POST /api/users/logout
 *   POST /api/users/refresh
 *   POST /api/users/forgot-password
 *   POST /api/users/reset-password
 *
 * Session helpers (persistSession / clearSession / getStored*) are also
 * defined here so AuthContext doesn't import from userService at all.
 */
import apiClient from './apiClient';
import { TOKEN_KEYS } from '../utils/constants';

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 *
 * The form collects firstName + lastName separately for UX reasons.
 * They are combined into a single `name` field here before sending,
 * matching the backend schema: { name, email, password }.
 *
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ user, accessToken, refreshToken }}
 */
const register = (data) => apiClient.post('/users/register', data).then((r) => r?.data ?? r);

/**
 * Authenticate an existing user.
 * @param {string} email
 * @param {string} password
 * @returns {{ user, accessToken, refreshToken }}
 */
const login = (email, password) =>
  apiClient.post('/users/login', { email, password }).then((r) => r?.data ?? r);

/**
 * Revoke the current session on the server.
 * @param {string} refreshToken
 */
const logout = (refreshToken) =>
  apiClient.post('/users/logout', { refreshToken });

/**
 * Exchange a valid refresh token for a new access token.
 * @param {string} refreshToken
 * @returns {{ accessToken }}
 */
const refresh = (refreshToken) =>
  apiClient.post('/users/refresh', { refreshToken }).then((r) => r?.data ?? r);

/**
 * Trigger a password-reset email.
 * @param {string} email
 */
const forgotPassword = (email) =>
  apiClient.post('/users/forgot-password', { email }).then((r) => r?.data ?? r);

/**
 * Complete the password-reset flow with the emailed token.
 * @param {string} token  - token from the reset link
 * @param {string} newPassword
 * @param {string} confirmPassword
 */
const resetPassword = (token, newPassword, confirmPassword) =>
  apiClient.post('/users/reset-password', { token, newPassword, confirmPassword }).then((r) => r?.data ?? r);

// ─── Admin Auth API Calls ────────────────────────────────────────────────────

const adminLogin = (email, password, adminSecretKey) =>
  apiClient.post('/users/admin/login', { email, password, adminSecretKey }).then((r) => r?.data ?? r);

const adminRegister = (data) =>
  apiClient.post('/users/admin/register', data).then((r) => r?.data ?? r);

// ─── Session Helpers (localStorage) ──────────────────────────────────────────

/**
 * Persist auth session to localStorage after a successful login / register.
 * @param {{ user: object, accessToken: string, refreshToken: string }} session
 */
const persistSession = ({ user, accessToken, refreshToken }) => {
  if (accessToken)  localStorage.setItem(TOKEN_KEYS.ACCESS,  accessToken);
  if (refreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
  if (user)         localStorage.setItem(TOKEN_KEYS.USER,    JSON.stringify(user));
};

/**
 * Clear all auth data from localStorage (on logout or forced session expiry).
 */
const clearSession = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
  localStorage.removeItem(TOKEN_KEYS.USER);
};

/**
 * Retrieve the last persisted user object (used to hydrate initial state).
 * @returns {object|null}
 */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(TOKEN_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Retrieve stored tokens (used to hydrate initial state and by apiClient).
 * @returns {{ accessToken: string|null, refreshToken: string|null }}
 */
const getStoredTokens = () => ({
  accessToken:  localStorage.getItem(TOKEN_KEYS.ACCESS)  ?? null,
  refreshToken: localStorage.getItem(TOKEN_KEYS.REFRESH) ?? null,
});

// ─── Export ───────────────────────────────────────────────────────────────────

const authService = {
  // API
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  adminLogin,
  adminRegister,
  // Helpers
  persistSession,
  clearSession,
  getStoredUser,
  getStoredTokens,
};

export default authService;
