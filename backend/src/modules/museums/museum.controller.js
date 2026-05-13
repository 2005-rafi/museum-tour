const museumService = require('./museum.service');
const { createError, ErrorCodes } = require('../../utils/errors');

const ADMIN_ROLES = ['admin', 'super-admin'];

class MuseumController {
  async create(req, res, next) {
    try {
      const museum = await museumService.create({ ...req.body, createdBy: req.user._id });
      res.status(201).json({ success: true, data: museum });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, sort, cursor } = req.query;
      const result = await museumService.getAll({
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
      const museum = await museumService.getById(req.params.id);
      res.json({ success: true, data: museum });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const existing = await museumService.getById(req.params.id);
      if (!ADMIN_ROLES.includes(req.user.role) && existing.createdBy?.toString() !== req.user._id.toString()) {
        return next(createError(ErrorCodes.AUTH_FORBIDDEN, 'You can only edit museums you created'));
      }
      const museum = await museumService.update(req.params.id, req.body);
      res.json({ success: true, data: museum });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const existing = await museumService.getById(req.params.id);
      if (!ADMIN_ROLES.includes(req.user.role) && existing.createdBy?.toString() !== req.user._id.toString()) {
        return next(createError(ErrorCodes.AUTH_FORBIDDEN, 'You can only delete museums you created'));
      }
      await museumService.delete(req.params.id, req.user._id);
      res.json({ success: true, message: 'Museum deleted' });
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const museum = await museumService.restore(req.params.id);
      res.json({ success: true, data: museum });
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
      const museums = await museumService.search(q);
      res.json({ success: true, data: museums });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MuseumController();
