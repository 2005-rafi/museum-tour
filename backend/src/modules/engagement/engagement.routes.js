const express = require('express');
const router = express.Router();
const engagementController = require('./engagement.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { validateObjectId } = require('../../middleware/validate');
const { commentSchema, commentListQuerySchema } = require('./engagement.validation');
const { readLimiter, writeLimiter } = require('../../middleware/rateLimiter');

// ─── Likes ─────────────────────────────────────────────────────────────────
router.post(
  '/artifacts/:id/like',
  writeLimiter,
  protect,
  validateObjectId('id'),
  engagementController.like,
);

router.delete(
  '/artifacts/:id/like',
  writeLimiter,
  protect,
  validateObjectId('id'),
  engagementController.unlike,
);

// ─── Comments ─────────────────────────────────────────────────────────────
router.post(
  '/artifacts/:id/comment',
  writeLimiter,
  protect,
  validateObjectId('id'),
  validate(commentSchema),
  engagementController.addComment,
);

router.get(
  '/artifacts/:id/comments',
  readLimiter,
  validateObjectId('id'),
  validate(commentListQuerySchema, 'query'),
  engagementController.getComments,
);

router.put(
  '/comments/:id',
  writeLimiter,
  protect,
  validateObjectId('id'),
  validate(commentSchema),
  engagementController.updateComment,
);

router.delete(
  '/comments/:id',
  writeLimiter,
  protect,
  validateObjectId('id'),
  engagementController.deleteComment,
);

// ─── Admin: All comments (paginated) ──────────────────────────────────────
router.get(
  '/admin/comments',
  readLimiter,
  protect,
  restrictTo('admin', 'super-admin'),
  engagementController.getAllComments,
);

// ─── Admin: All likes (paginated) ─────────────────────────────────────────
router.get(
  '/admin/likes',
  readLimiter,
  protect,
  restrictTo('admin', 'super-admin'),
  engagementController.getAllLikes,
);

// ─── Admin: Delete any comment ────────────────────────────────────────────
router.delete(
  '/admin/comments/:id',
  writeLimiter,
  protect,
  restrictTo('admin', 'super-admin'),
  validateObjectId('id'),
  engagementController.adminDeleteComment,
);

// ─── Admin: Bulk-delete comments ──────────────────────────────────────────
router.post(
  '/admin/comments/bulk-delete',
  writeLimiter,
  protect,
  restrictTo('admin', 'super-admin'),
  engagementController.adminBulkDeleteComments,
);

module.exports = router;
