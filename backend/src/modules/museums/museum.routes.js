const express = require('express');
const router = express.Router();
const museumController = require('./museum.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const { hasPermission } = require('../../middleware/permissions');
const { PERMISSIONS } = require('../../config/permissions');
const validate = require('../../middleware/validate');
const { validateObjectId } = require('../../middleware/validate');
const {
  createMuseumSchema,
  updateMuseumSchema,
  museumListQuerySchema,
  museumSearchQuerySchema,
} = require('./museum.validation');
const { readLimiter, writeLimiter, searchLimiter } = require('../../middleware/rateLimiter');
const { cacheMiddleware } = require('../../middleware/cache');

// GET /search must be declared before GET /:id so Express doesn't treat 'search' as an ObjectId
router.get(
  '/search',
  searchLimiter,
  validate(museumSearchQuerySchema, 'query'),
  cacheMiddleware('museums:search', 1800),
  museumController.search,
);

router.get(
  '/',
  readLimiter,
  validate(museumListQuerySchema, 'query'),
  cacheMiddleware('museums:list', 3600),
  museumController.getAll,
);

router.get(
  '/:id',
  readLimiter,
  validateObjectId('id'),
  cacheMiddleware('museums:detail', 3600),
  museumController.getById,
);

router.post(
  '/',
  writeLimiter,
  protect,
  hasPermission(PERMISSIONS.MUSEUMS_CREATE),
  validate(createMuseumSchema),
  museumController.create,
);

router.put(
  '/:id',
  writeLimiter,
  protect,
  validateObjectId('id'),
  hasPermission(PERMISSIONS.MUSEUMS_UPDATE),
  validate(updateMuseumSchema),
  museumController.update,
);

router.delete(
  '/:id',
  writeLimiter,
  protect,
  validateObjectId('id'),
  hasPermission(PERMISSIONS.MUSEUMS_DELETE),
  museumController.delete,
);

router.put(
  '/:id/restore',
  writeLimiter,
  protect,
  validateObjectId('id'),
  hasPermission(PERMISSIONS.MUSEUMS_DELETE),
  museumController.restore,
);

module.exports = router;
