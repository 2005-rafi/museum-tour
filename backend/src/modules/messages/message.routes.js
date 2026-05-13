const express = require('express');
const router = express.Router();
const messageController = require('./message.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { validateObjectId } = require('../../middleware/validate');
const {
  createMessageSchema,
  updateStatusSchema,
  messageListQuerySchema,
} = require('./message.validation');
const { readLimiter, writeLimiter } = require('../../middleware/rateLimiter');

// ─── Public: submit a contact message ───────────────────────────────────────
router.post(
  '/messages',
  writeLimiter,
  validate(createMessageSchema),
  messageController.create,
);

// ─── Admin: list messages (paginated, filterable by status) ─────────────────
router.get(
  '/admin/messages',
  readLimiter,
  protect,
  restrictTo('admin', 'super-admin'),
  validate(messageListQuerySchema, 'query'),
  messageController.list,
);

// ─── Admin: unread count (for sidebar badge) ────────────────────────────────
router.get(
  '/admin/messages/unread-count',
  readLimiter,
  protect,
  restrictTo('admin', 'super-admin'),
  messageController.unreadCount,
);

// ─── Admin: get single message ──────────────────────────────────────────────
router.get(
  '/admin/messages/:id',
  readLimiter,
  protect,
  restrictTo('admin', 'super-admin'),
  validateObjectId('id'),
  messageController.getById,
);

// ─── Admin: update message status ───────────────────────────────────────────
router.put(
  '/admin/messages/:id/status',
  writeLimiter,
  protect,
  restrictTo('admin', 'super-admin'),
  validateObjectId('id'),
  validate(updateStatusSchema),
  messageController.updateStatus,
);

// ─── Admin: delete message permanently ──────────────────────────────────────
router.delete(
  '/admin/messages/:id',
  writeLimiter,
  protect,
  restrictTo('admin', 'super-admin'),
  validateObjectId('id'),
  messageController.remove,
);

module.exports = router;
