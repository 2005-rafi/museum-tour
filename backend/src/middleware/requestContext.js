const crypto = require('crypto');

/**
 * Attaches a unique traceId to every request for end-to-end tracking.
 * Also records request start time for response time calculation.
 */
const requestContext = (req, res, next) => {
  req.traceId = req.headers['x-trace-id'] || crypto.randomUUID();
  req.startTime = Date.now();

  // Attach traceId to response headers for client-side correlation
  res.setHeader('X-Trace-Id', req.traceId);

  // Log response time on finish
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const logger = require('./logger');
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]({
      traceId: req.traceId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?._id || null,
    });
  });

  next();
};

module.exports = requestContext;
