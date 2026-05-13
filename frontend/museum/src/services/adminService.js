import apiClient from './apiClient';
import { buildQueryString } from '../utils/formatters';

/**
 * Unwrap backend user-list envelope.
 * Backend: { success, data: { users: [...], total, page, pages } }
 * Normalised: { items, total, page, pages }
 */
function unwrapUserList(response) {
  const items = Array.isArray(response?.data) ? response.data : [];
  const p     = response?.pagination ?? {};
  return {
    items,
    total: p.totalItems  ?? items.length,
    page:  p.currentPage ?? 1,
    pages: p.totalPages  ?? 1,
  };
}

const adminService = {
  // ── Analytics ──────────────────────────────────────────────────────────────

  /** GET /api/admin/analytics?range=30 → full analytics payload */
  getAnalytics: (params = {}) =>
    apiClient.get(`/admin/analytics${buildQueryString(params)}`),

  // ── Users ──────────────────────────────────────────────────────────────────

  /** GET /api/users (admin-only) → { items, total, page, pages } */
  getUsers: (params = {}) =>
    apiClient.get(`/users${buildQueryString(params)}`).then(unwrapUserList),

  /** DELETE /api/users/:id (admin-only) */
  deleteUser: (id) =>
    apiClient.delete(`/users/${id}`),

  /** PUT /api/users/:id/suspend (admin-only) */
  suspendUser: (id, suspended) =>
    apiClient.put(`/users/${id}/suspend`, { suspended }),

  // ── Comments (admin) ──────────────────────────────────────────────────────

  /** GET /api/admin/comments → { items, total, page, pages } */
  getComments: (params = {}) =>
    apiClient.get(`/admin/comments${buildQueryString(params)}`).then((r) => {
      const items = Array.isArray(r?.data) ? r.data : [];
      const p     = r?.pagination ?? {};
      return { items, total: p.totalItems ?? items.length, page: p.currentPage ?? 1, pages: p.totalPages ?? 1 };
    }),

  /** DELETE /api/admin/comments/:id */
  deleteComment: (id) =>
    apiClient.delete(`/admin/comments/${id}`),

  /** POST /api/admin/comments/bulk-delete */
  bulkDeleteComments: (ids) =>
    apiClient.post('/admin/comments/bulk-delete', { ids }),

  // ── Likes (admin) ─────────────────────────────────────────────────────────

  /** GET /api/admin/likes → { items, total, page, pages } */
  getLikes: (params = {}) =>
    apiClient.get(`/admin/likes${buildQueryString(params)}`).then((r) => {
      const items = Array.isArray(r?.data) ? r.data : [];
      const p     = r?.pagination ?? {};
      return { items, total: p.totalItems ?? items.length, page: p.currentPage ?? 1, pages: p.totalPages ?? 1 };
    }),

  // ── Messages (admin) ─────────────────────────────────────────────────────

  /** GET /api/admin/messages → { items, total, page, pages } */
  getMessages: (params = {}) =>
    apiClient.get(`/admin/messages${buildQueryString(params)}`).then((r) => {
      const items = Array.isArray(r?.data) ? r.data : [];
      const p     = r?.pagination ?? {};
      return { items, total: p.totalItems ?? items.length, page: p.currentPage ?? 1, pages: p.totalPages ?? 1 };
    }),

  /** GET /api/admin/messages/unread-count → { count } */
  getUnreadCount: () =>
    apiClient.get('/admin/messages/unread-count').then((r) => r?.data?.count ?? 0),

  /** PUT /api/admin/messages/:id/status */
  updateMessageStatus: (id, status) =>
    apiClient.put(`/admin/messages/${id}/status`, { status }),

  /** DELETE /api/admin/messages/:id */
  deleteMessage: (id) =>
    apiClient.delete(`/admin/messages/${id}`),
};

export default adminService;
