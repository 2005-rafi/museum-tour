import apiClient from './apiClient';

/**
 * User-profile service.
 *
 * Auth methods (register, login, logout, refresh, forgot/reset password)
 * live in authService.js — they are NOT duplicated here.
 */
const userService = {
  // ── Profile ───────────────────────────────────────────────────────────────

  getProfile: () =>
    apiClient.get('/users/profile').then((r) => r?.data ?? r),

  updateProfile: (data) =>
    apiClient.put('/users/profile', data).then((r) => r?.data ?? r),

  changePassword: (currentPassword, newPassword, confirmPassword) =>
    apiClient.put('/users/password', { currentPassword, newPassword, confirmPassword }).then((r) => r?.data ?? r),

  getLikedArtifacts: (params = {}) =>
    apiClient.get('/users/profile/liked', { params }).then((r) => {
      const items = Array.isArray(r?.data) ? r.data : [];
      const p     = r?.pagination ?? {};
      return { items, total: p.totalItems ?? items.length, page: p.currentPage ?? 1, pages: p.totalPages ?? 1 };
    }),

  getUserComments: (params = {}) =>
    apiClient.get('/users/profile/comments', { params }).then((r) => {
      const items = Array.isArray(r?.data) ? r.data : [];
      const p     = r?.pagination ?? {};
      return { items, total: p.totalItems ?? items.length, page: p.currentPage ?? 1, pages: p.totalPages ?? 1 };
    }),

};

export default userService;
