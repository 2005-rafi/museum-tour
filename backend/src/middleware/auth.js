const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');
const { createError, ErrorCodes } = require('../utils/errors');
const TokenBlacklist = require('../modules/users/tokenBlacklist.model');
const NodeCache = require('node-cache');

// In-memory cache for blacklisted tokens — avoids a DB query on every request.
// stdTTL matches access-token lifetime (15 min); check period runs every 2 min.
const blacklistCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

/**
 * Returns true if the token has been revoked. Checks the in-memory cache first
 * and only falls back to MongoDB when the token is not found in the cache.
 */
const isTokenBlacklisted = async (token) => {
  const cached = blacklistCache.get(token);
  if (cached !== undefined) return cached;

  const found = await TokenBlacklist.findOne({ token }).lean();
  const result = !!found;
  blacklistCache.set(token, result);
  return result;
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(ErrorCodes.AUTH_REQUIRED, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];

    // Check token blacklist (cached)
    if (await isTokenBlacklisted(token)) {
      throw createError(ErrorCodes.AUTH_INVALID_TOKEN, 'Token has been revoked');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw createError(ErrorCodes.USER_NOT_FOUND, 'User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.isOperational) return next(error);
    if (error.name === 'JsonWebTokenError') {
      return next(createError(ErrorCodes.AUTH_INVALID_TOKEN, 'Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError(ErrorCodes.AUTH_TOKEN_EXPIRED, 'Token expired'));
    }
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

const { hasRoleLevel } = require('../config/permissions');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check direct role match OR role hierarchy (higher roles include lower)
    const hasRole = roles.includes(req.user.role) ||
      roles.some(role => hasRoleLevel(req.user.role, role));
    if (!hasRole) {
      return next(createError(ErrorCodes.AUTH_FORBIDDEN, 'Insufficient permissions'));
    }
    next();
  };
};

module.exports = { protect, optionalAuth, restrictTo };
