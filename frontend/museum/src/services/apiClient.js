import axios from 'axios';
import { API_BASE_URL, TOKEN_KEYS } from '../utils/constants';

// ─── Axios Instance ──────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 12000,
});

// ─── Token helpers (no circular dep on AuthContext) ──────────────────────────
const getAccessToken = () => localStorage.getItem(TOKEN_KEYS.ACCESS);
const getRefreshToken = () => localStorage.getItem(TOKEN_KEYS.REFRESH);
const setAccessToken = (token) => localStorage.setItem(TOKEN_KEYS.ACCESS, token);
const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
  localStorage.removeItem(TOKEN_KEYS.USER);
};

// ─── Request Interceptor: attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: refresh on 401 then retry ─────────────────────────
let isRefreshing = false;
let pendingQueue = []; // [ { resolve, reject } ]

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response.data,        // unwrap .data globally
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url?.includes('/users/login') ||
      originalRequest.url?.includes('/users/register') ||
      originalRequest.url?.includes('/users/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue subsequent 401s until the refresh resolves
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { accessToken, refreshToken: newRefreshToken } = await axios.post(`${API_BASE_URL}/users/refresh`, {
          refreshToken,
        }).then((r) => r.data?.data ?? r.data);

        setAccessToken(accessToken);
        // Persist rotated refresh token if the server issued one
        if (newRefreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH, newRefreshToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        flushQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        clearTokens();
        // Dispatch a custom event – AuthContext listens and resets state
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalise error shape for consumers.
    // When the backend returns a Joi validation error it sends:
    //   { success: false, message: "Validation error", errors: ["field msg 1", ...] }
    // We prefer the first specific field error over the generic "Validation error" label.
    const responseData = error.response?.data;
    const fieldErrors  = responseData?.errors;
    const message =
      (Array.isArray(fieldErrors) && fieldErrors.length > 0 ? fieldErrors.join(' · ') : null) ||
      responseData?.message ||
      responseData?.error ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject({ message, status: error.response?.status, errors: fieldErrors ?? [], raw: error });
  }
);

export default apiClient;
