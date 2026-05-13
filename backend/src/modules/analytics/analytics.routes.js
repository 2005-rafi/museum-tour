const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../../middleware/auth');
const { readLimiter } = require('../../middleware/rateLimiter');
const { getAnalytics } = require('./analytics.controller');

router.get(
  '/admin/analytics',
  readLimiter,
  protect,
  restrictTo('admin', 'super-admin'),
  getAnalytics,
);

module.exports = router;
