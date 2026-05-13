const artifactService = require('./artifact.service');
const { createError, ErrorCodes } = require('../../utils/errors');

const ADMIN_ROLES = ['admin', 'super-admin'];

class ArtifactController {
  async create(req, res, next) {
    try {
      const artifact = await artifactService.create({ ...req.body, createdBy: req.user._id });
      res.status(201).json({ success: true, data: artifact });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, sort, museumId, cursor, period, tags } = req.query;
      const filter = {};
      if (museumId) filter.museumId = museumId;
      if (period) filter.historicalPeriod = period;
      if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()) };
      const result = await artifactService.getAll(filter, {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        sort,
        cursor,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const artifact = await artifactService.getById(req.params.id);
      res.json({ success: true, data: artifact });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const existing = await artifactService.getById(req.params.id);
      if (!ADMIN_ROLES.includes(req.user.role) && existing.createdBy?.toString() !== req.user._id.toString()) {
        return next(createError(ErrorCodes.AUTH_FORBIDDEN, 'You can only edit artifacts you created'));
      }
      const artifact = await artifactService.update(req.params.id, req.body);
      res.json({ success: true, data: artifact });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const existing = await artifactService.getById(req.params.id);
      if (!ADMIN_ROLES.includes(req.user.role) && existing.createdBy?.toString() !== req.user._id.toString()) {
        return next(createError(ErrorCodes.AUTH_FORBIDDEN, 'You can only delete artifacts you created'));
      }
      await artifactService.delete(req.params.id, req.user._id);
      res.json({ success: true, message: 'Artifact deleted' });
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const artifact = await artifactService.restore(req.params.id);
      res.json({ success: true, data: artifact });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }
      const artifacts = await artifactService.search(q);
      res.json({ success: true, data: artifacts });
    } catch (error) {
      next(error);
    }
  }

  async batchDelete(req, res, next) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'ids array is required' });
      }
      const results = await artifactService.batchDelete(ids, req.user._id);
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }

  async batchUpdate(req, res, next) {
    try {
      const { ids, update } = req.body;
      if (!Array.isArray(ids) || ids.length === 0 || !update) {
        return res.status(400).json({ success: false, message: 'ids array and update object are required' });
      }
      const results = await artifactService.batchUpdate(ids, update);
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ArtifactController();
