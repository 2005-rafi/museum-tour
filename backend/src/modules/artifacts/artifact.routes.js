const express = require('express');
const router = express.Router();
const artifactController = require('./artifact.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const { hasPermission } = require('../../middleware/permissions');
const { PERMISSIONS } = require('../../config/permissions');
const validate = require('../../middleware/validate');
const { validateObjectId } = require('../../middleware/validate');
const {
  createArtifactSchema,
  updateArtifactSchema,
  artifactListQuerySchema,
  artifactSearchQuerySchema,
  batchDeleteSchema,
  batchUpdateSchema,
} = require('./artifact.validation');
const { readLimiter, writeLimiter, searchLimiter } = require('../../middleware/rateLimiter');
const { cacheMiddleware } = require('../../middleware/cache');

// ─── Batch routes first (before /:id so 'batch' is not matched as an ObjectId) ───
router.post(
  '/batch/delete',
  writeLimiter,
  protect,
  hasPermission(PERMISSIONS.ARTIFACTS_BATCH),
  validate(batchDeleteSchema),
  artifactController.batchDelete,
);

router.put(
  '/batch/update',
  writeLimiter,
  protect,
  hasPermission(PERMISSIONS.ARTIFACTS_BATCH),
  validate(batchUpdateSchema),
  artifactController.batchUpdate,
);

// ─── Search (before /:id so 'search' is not matched as an ObjectId) ──────────────
router.get(
  '/search',
  searchLimiter,
  validate(artifactSearchQuerySchema, 'query'),
  cacheMiddleware('artifacts:search', 1800),
  artifactController.search,
);

// ─── Collection ──────────────────────────────────────────────────────────────
router.get(
  '/',
  readLimiter,
  validate(artifactListQuerySchema, 'query'),
  cacheMiddleware('artifacts:list', 3600),
  artifactController.getAll,
);

router.get(
  '/:id',
  readLimiter,
  validateObjectId('id'),
  cacheMiddleware('artifacts:detail', 3600),
  artifactController.getById,
);

router.post(
  '/',
  writeLimiter,
  protect,
  hasPermission(PERMISSIONS.ARTIFACTS_CREATE),
  validate(createArtifactSchema),
  artifactController.create,
);

router.put(
  '/:id',
  writeLimiter,
  protect,
  validateObjectId('id'),
  hasPermission(PERMISSIONS.ARTIFACTS_UPDATE),
  validate(updateArtifactSchema),
  artifactController.update,
);

router.delete(
  '/:id',
  writeLimiter,
  protect,
  validateObjectId('id'),
  hasPermission(PERMISSIONS.ARTIFACTS_DELETE),
  artifactController.delete,
);

router.put(
  '/:id/restore',
  writeLimiter,
  protect,
  validateObjectId('id'),
  hasPermission(PERMISSIONS.ARTIFACTS_DELETE),
  artifactController.restore,
);

module.exports = router;
