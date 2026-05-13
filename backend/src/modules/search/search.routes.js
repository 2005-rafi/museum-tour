const express = require('express');
const router = express.Router();
const searchController = require('./search.controller');
const { searchLimiter } = require('../../middleware/rateLimiter');
const { cacheMiddleware } = require('../../middleware/cache');

router.get('/', searchLimiter, cacheMiddleware('search', 1800), searchController.search);

module.exports = router;
