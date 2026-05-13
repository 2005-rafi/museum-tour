/**
 * Permission-checking middleware.
 * Uses RBAC configuration to enforce granular access control.
 */

const { getPermissionsForRole } = require('../config/permissions');
const { createError, ErrorCodes } = require('../utils/errors');

/**
 * Require ALL specified permissions.
 * Usage: hasPermission(PERMISSIONS.ARTIFACTS_CREATE, PERMISSIONS.ARTIFACTS_UPDATE)
 */
const hasPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(ErrorCodes.AUTH_REQUIRED, 'Authentication required'));
    }

    const userRole = req.user.role || 'user';
    const rolePermissions = getPermissionsForRole(userRole);
    const customPermissions = req.user.permissions || [];
    const allPermissions = [...new Set([...rolePermissions, ...customPermissions])];

    const hasAll = requiredPermissions.every((p) => allPermissions.includes(p));
    if (!hasAll) {
      const missing = requiredPermissions.filter((p) => !allPermissions.includes(p));
      return next(
        createError(ErrorCodes.AUTH_FORBIDDEN, `Missing permissions: ${missing.join(', ')}`)
      );
    }

    next();
  };
};

/**
 * Require ANY ONE of the specified permissions.
 * Usage: hasAnyPermission(PERMISSIONS.COMMENTS_DELETE_OWN, PERMISSIONS.COMMENTS_DELETE_ANY)
 */
const hasAnyPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(ErrorCodes.AUTH_REQUIRED, 'Authentication required'));
    }

    const userRole = req.user.role || 'user';
    const rolePermissions = getPermissionsForRole(userRole);
    const customPermissions = req.user.permissions || [];
    const allPermissions = [...new Set([...rolePermissions, ...customPermissions])];

    const hasAny = requiredPermissions.some((p) => allPermissions.includes(p));
    if (!hasAny) {
      return next(
        createError(ErrorCodes.AUTH_FORBIDDEN, `Requires one of: ${requiredPermissions.join(', ')}`)
      );
    }

    next();
  };
};

module.exports = { hasPermission, hasAnyPermission };
