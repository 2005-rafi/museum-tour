const crypto = require('crypto');

class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.traceId = crypto.randomUUID();
    this.timestamp = new Date().toISOString();
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const ErrorCodes = {
  // Authentication & Authorization
  AUTH_REQUIRED: { code: 'E401_AUTH_REQUIRED', status: 401 },
  AUTH_INVALID_TOKEN: { code: 'E401_INVALID_TOKEN', status: 401 },
  AUTH_TOKEN_EXPIRED: { code: 'E401_TOKEN_EXPIRED', status: 401 },
  AUTH_INVALID_CREDENTIALS: { code: 'E401_INVALID_CREDENTIALS', status: 401 },
  AUTH_FORBIDDEN: { code: 'E403_FORBIDDEN', status: 403 },
  ADMIN_INVALID_SECRET: { code: 'E403_INVALID_ADMIN_SECRET', status: 403 },
  ADMIN_ROLE_REQUIRED: { code: 'E403_ADMIN_ROLE_REQUIRED', status: 403 },

  // User
  USER_NOT_FOUND: { code: 'E404_USER_NOT_FOUND', status: 404 },
  USER_EMAIL_EXISTS: { code: 'E409_EMAIL_EXISTS', status: 409 },

  // Museum
  MUSEUM_NOT_FOUND: { code: 'E404_MUSEUM_NOT_FOUND', status: 404 },

  // Artifact
  ARTIFACT_NOT_FOUND: { code: 'E404_ARTIFACT_NOT_FOUND', status: 404 },

  // Engagement
  ALREADY_LIKED: { code: 'E409_ALREADY_LIKED', status: 409 },
  LIKE_NOT_FOUND: { code: 'E404_LIKE_NOT_FOUND', status: 404 },
  COMMENT_NOT_FOUND: { code: 'E404_COMMENT_NOT_FOUND', status: 404 },

  // Auth - Account
  ACCOUNT_LOCKED: { code: 'E423_ACCOUNT_LOCKED', status: 423 },
  INVALID_REFRESH_TOKEN: { code: 'E401_INVALID_REFRESH_TOKEN', status: 401 },
  PASSWORD_MISMATCH: { code: 'E400_PASSWORD_MISMATCH', status: 400 },
  SAME_PASSWORD: { code: 'E400_SAME_PASSWORD', status: 400 },
  INVALID_RESET_TOKEN: { code: 'E400_INVALID_RESET_TOKEN', status: 400 },

  // Validation
  VALIDATION_ERROR: { code: 'E400_VALIDATION', status: 400 },
  INVALID_ID: { code: 'E400_INVALID_ID', status: 400 },
  INVALID_INPUT: { code: 'E400_INVALID_INPUT', status: 400 },

  // Search
  SEARCH_QUERY_REQUIRED: { code: 'E400_SEARCH_QUERY_REQUIRED', status: 400 },

  // Service
  SERVICE_UNAVAILABLE: { code: 'E503_SERVICE_UNAVAILABLE', status: 503 },

  // Server
  INTERNAL_ERROR: { code: 'E500_INTERNAL', status: 500 },
  DB_ERROR: { code: 'E500_DB_ERROR', status: 500 },
};

const createError = (errorDef, message) => {
  return new AppError(message || errorDef.code, errorDef.status, errorDef.code);
};

module.exports = { AppError, ErrorCodes, createError };
