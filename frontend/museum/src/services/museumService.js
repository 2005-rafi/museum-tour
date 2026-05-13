import apiClient from './apiClient';
import { buildQueryString } from '../utils/formatters';

/**
 * Unwrap the backend envelope for list endpoints.
 *
 * Backend shape (after apiClient strips the outer Axios .data):
 *   { success: true, data: { museums: [...], total, page, pages } }
 *
 * We normalise this to:
 *   { items: [...], total, page, pages }
 *
 * so every consumer can always do `result.items.map(...)` without
 * any conditional unwrapping.
 */
function unwrapList(response) {
  // response = { success, data: [...], pagination: { totalItems, currentPage, totalPages, limit } }
  const items = Array.isArray(response?.data) ? response.data : [];
  const p     = response?.pagination ?? {};
  return {
    items,
    total: p.totalItems  ?? items.length,
    page:  p.currentPage ?? 1,
    pages: p.totalPages  ?? 1,
  };
}

const museumService = {
  /**
   * GET /api/museums
   * @returns {{ items: Museum[], total: number, page: number, pages: number }}
   */
  getMuseums: (params = {}) =>
    apiClient.get(`/museums${buildQueryString(params)}`).then(unwrapList),

  /**
   * GET /api/museums/:id
   * @returns {Museum}
   */
  getMuseumById: (id) =>
    apiClient.get(`/museums/${id}`).then((r) => r?.data ?? r),

  /**
   * GET /api/artifacts?museumId=:id  (artifacts for a specific museum)
   * @returns {{ items: Artifact[], total: number, page: number, pages: number }}
   */
  getMuseumArtifacts: (museumId, params = {}) =>
    apiClient
      .get(`/artifacts${buildQueryString({ museumId, ...params })}`)
      .then((r) => {
        const items = Array.isArray(r?.data) ? r.data : [];
        const p     = r?.pagination ?? {};
        return { items, total: p.totalItems ?? items.length, page: p.currentPage ?? 1, pages: p.totalPages ?? 1 };
      }),

  // ── Admin-only ───────────────────────────────────────────────────────────

  createMuseum: (data) =>
    apiClient.post('/museums', data).then((r) => r?.data ?? r),

  updateMuseum: (id, data) =>
    apiClient.put(`/museums/${id}`, data).then((r) => r?.data ?? r),

  deleteMuseum: (id) =>
    apiClient.delete(`/museums/${id}`),

  restoreMuseum: (id) =>
    apiClient.put(`/museums/${id}/restore`).then((r) => r?.data ?? r),
};

export default museumService;
