const crypto = require('crypto');
const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  const traceId = err.traceId || req.traceId || crypto.randomUUID();

  logger.error({
    traceId,
    errorCode: err.errorCode || 'UNHANDLED',
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?._id || null,
    stack: err.stack,
  });

  // AppError (operational, expected)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message,
      traceId,
      timestamp: err.timestamp,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      errorCode: 'E400_VALIDATION',
      message: 'Validation error',
      errors: messages,
      traceId,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      errorCode: 'E409_DUPLICATE',
      message: `Duplicate value for ${field}`,
      traceId,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      errorCode: 'E400_INVALID_ID',
      message: 'Invalid ID format',
      traceId,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      errorCode: 'E401_INVALID_TOKEN',
      message: 'Invalid token',
      traceId,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      errorCode: 'E401_TOKEN_EXPIRED',
      message: 'Token expired',
      traceId,
    });
  }

  // Unknown / programming error
  const statusCode = err.statusCode || 500;

  // Capture non-operational errors to Sentry
  if (!err.isOperational && process.env.SENTRY_DSN) {
    try {
      const Sentry = require('@sentry/node');
      Sentry.captureException(err, {
        tags: { traceId, errorCode: err.errorCode || 'UNHANDLED' },
        extra: { method: req.method, url: req.originalUrl, userId: req.user?._id },
      });
    } catch {
      // Sentry not available — continue with normal error response
    }
  }

  res.status(statusCode).json({
    success: false,
    errorCode: 'E500_INTERNAL',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    traceId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
