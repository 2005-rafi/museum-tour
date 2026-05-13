import apiClient from './apiClient';
import { buildQueryString } from '../utils/formatters';

/**
 * Unwrap the backend envelope for list endpoints.
 *
 * Backend shape (after apiClient strips the outer Axios .data):
 *   { success: true, data: { artifacts: [...], total, page, pages } }
 *
 * We normalise this to:
 *   { items: [...], total, page, pages }
 */
function unwrapList(response) {
  const items = Array.isArray(response?.data) ? response.data : [];
  const p     = response?.pagination ?? {};
  return {
    items,
    total: p.totalItems  ?? items.length,
    page:  p.currentPage ?? 1,
    pages: p.totalPages  ?? 1,
  };
}

const artifactService = {
  /**
   * GET /api/artifacts
   * @returns {{ items: Artifact[], total: number, page: number, pages: number }}
   */
  getArtifacts: (params = {}) =>
    apiClient.get(`/artifacts${buildQueryString(params)}`).then(unwrapList),

  /**
   * GET /api/artifacts/:id
   * @returns {Artifact}
   */
  getArtifactById: (id) =>
    apiClient.get(`/artifacts/${id}`).then((r) => r?.data ?? r),

  // ── Engagement ────────────────────────────────────────────────────────────

  getComments: (id, params = {}) =>
    apiClient.get(`/artifacts/${id}/comments`, { params }).then((r) => r?.data ?? r),

  likeArtifact: (id) =>
    apiClient.post(`/artifacts/${id}/like`),

  unlikeArtifact: (id) =>
    apiClient.delete(`/artifacts/${id}/like`),

  // NOTE: backend engagement schema field is 'commentText', not 'text'
  addComment: (id, commentText) =>
    apiClient.post(`/artifacts/${id}/comment`, { commentText }),

  editComment: (commentId, commentText) =>
    apiClient.put(`/comments/${commentId}`, { commentText }),

  deleteComment: (commentId) =>
    apiClient.delete(`/comments/${commentId}`),

  // ── Admin-only ─────────────────────────────────────────────────────────────

  createArtifact: (data) =>
    apiClient.post('/artifacts', data).then((r) => r?.data ?? r),

  updateArtifact: (id, data) =>
    apiClient.put(`/artifacts/${id}`, data).then((r) => r?.data ?? r),

  deleteArtifact: (id) =>
    apiClient.delete(`/artifacts/${id}`),

  restoreArtifact: (id) =>
    apiClient.put(`/artifacts/${id}/restore`).then((r) => r?.data ?? r),

  batchDelete: (ids) =>
    apiClient.post('/artifacts/batch/delete', { ids }),
};

export default artifactService;
