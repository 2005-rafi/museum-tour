/**
 * Permission-Based Access Control (PBAC) Configuration
 * Defines granular permissions and maps them to roles.
 */

const PERMISSIONS = {
  // Artifact permissions
  ARTIFACTS_READ: 'artifacts:read',
  ARTIFACTS_CREATE: 'artifacts:create',
  ARTIFACTS_UPDATE: 'artifacts:update',
  ARTIFACTS_DELETE: 'artifacts:delete',
  ARTIFACTS_BATCH: 'artifacts:batch',
  ARTIFACTS_RESTORE: 'artifacts:restore',

  // Museum permissions
  MUSEUMS_READ: 'museums:read',
  MUSEUMS_CREATE: 'museums:create',
  MUSEUMS_UPDATE: 'museums:update',
  MUSEUMS_DELETE: 'museums:delete',
  MUSEUMS_RESTORE: 'museums:restore',

  // User permissions
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage-roles',

  // Engagement permissions
  ENGAGEMENT_LIKE: 'engagement:like',
  ENGAGEMENT_COMMENT: 'engagement:comment',
  COMMENTS_DELETE_OWN: 'comments:delete-own',
  COMMENTS_DELETE_ANY: 'comments:delete-any',
  COMMENTS_MODERATE: 'comments:moderate',

  // Search permissions
  SEARCH_READ: 'search:read',

  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_ANALYTICS: 'admin:analytics',
};

const ROLE_HIERARCHY = {
  user: 1,
  moderator: 2,
  admin: 3,
  'super-admin': 4,
};

const ROLE_PERMISSIONS = {
  user: [
    PERMISSIONS.ARTIFACTS_READ,
    PERMISSIONS.MUSEUMS_READ,
    PERMISSIONS.ENGAGEMENT_LIKE,
    PERMISSIONS.ENGAGEMENT_COMMENT,
    PERMISSIONS.COMMENTS_DELETE_OWN,
    PERMISSIONS.SEARCH_READ,
  ],
  moderator: [
    PERMISSIONS.ARTIFACTS_READ,
    PERMISSIONS.MUSEUMS_READ,
    PERMISSIONS.ENGAGEMENT_LIKE,
    PERMISSIONS.ENGAGEMENT_COMMENT,
    PERMISSIONS.COMMENTS_DELETE_OWN,
    PERMISSIONS.COMMENTS_DELETE_ANY,
    PERMISSIONS.COMMENTS_MODERATE,
    PERMISSIONS.SEARCH_READ,
    PERMISSIONS.USERS_READ,
  ],
  admin: Object.values(PERMISSIONS).filter(
    (p) => p !== PERMISSIONS.USERS_MANAGE_ROLES
  ),
  'super-admin': Object.values(PERMISSIONS),
};

const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;
};

const hasRoleLevel = (userRole, requiredRole) => {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
};

module.exports = {
  PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  hasRoleLevel,
};
