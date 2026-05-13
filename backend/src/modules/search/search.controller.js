const searchService = require('./search.service');
const { createError, ErrorCodes } = require('../../utils/errors');

class SearchController {
  async search(req, res, next) {
    try {
      const { q, type, period, tags, location, museum } = req.query;
      if (!q || !q.trim()) {
        throw createError(ErrorCodes.SEARCH_QUERY_REQUIRED, 'Search query is required');
      }
      const filters = { type, period, tags, location, museum };
      const results = await searchService.search(q.trim(), filters);
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController();
