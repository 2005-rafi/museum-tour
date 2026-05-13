const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });
};

// Global default: generous for general browsing
const globalLimiter = createLimiter(
  15 * 60 * 1000,
  200,
  'Too many requests, please try again later'
);

// Strict limiter for auth endpoints (login/register abuse prevention)
const authLimiter = createLimiter(
  15 * 60 * 1000,
  15,
  'Too many authentication attempts, please try again later'
);

// Read endpoints: higher throughput
const readLimiter = createLimiter(
  15 * 60 * 1000,
  500,
  'Too many read requests, please try again later'
);

// Write endpoints: moderate
const writeLimiter = createLimiter(
  15 * 60 * 1000,
  50,
  'Too many write requests, please try again later'
);

// Search: protect expensive operations
const searchLimiter = createLimiter(
  1 * 60 * 1000,
  30,
  'Too many search requests, please slow down'
);

// Admin auth: very strict to prevent brute-force on secret key
const adminAuthLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  'Too many admin authentication attempts, please try again later'
);

module.exports = { globalLimiter, authLimiter, readLimiter, writeLimiter, searchLimiter, adminAuthLimiter };
