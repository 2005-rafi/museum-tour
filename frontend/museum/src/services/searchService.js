import apiClient from './apiClient';
import { buildQueryString } from '../utils/formatters';

const searchService = {
  /**
   * GET /api/search?q=:query&period=...&type=...
   */
  search: (query, filters = {}) =>
    apiClient.get(`/search${buildQueryString({ q: query, ...filters })}`).then((r) => r?.data ?? r),
};

export default searchService;
