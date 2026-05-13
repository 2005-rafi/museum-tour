const {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  hasRoleLevel,
} = require('../../src/config/permissions');

describe('RBAC Permissions', () => {
  describe('Role-Permission Mapping', () => {
    test('user role has only read + basic engagement permissions', () => {
      const perms = getPermissionsForRole('user');
      expect(perms).toContain(PERMISSIONS.ARTIFACTS_READ);
      expect(perms).toContain(PERMISSIONS.MUSEUMS_READ);
      expect(perms).toContain(PERMISSIONS.ENGAGEMENT_LIKE);
      expect(perms).toContain(PERMISSIONS.ENGAGEMENT_COMMENT);
      expect(perms).toContain(PERMISSIONS.COMMENTS_DELETE_OWN);
      expect(perms).not.toContain(PERMISSIONS.ARTIFACTS_CREATE);
      expect(perms).not.toContain(PERMISSIONS.ARTIFACTS_DELETE);
      expect(perms).not.toContain(PERMISSIONS.USERS_READ);
    });

    test('moderator role can delete any comment', () => {
      const perms = getPermissionsForRole('moderator');
      expect(perms).toContain(PERMISSIONS.COMMENTS_DELETE_ANY);
      expect(perms).toContain(PERMISSIONS.COMMENTS_MODERATE);
      expect(perms).toContain(PERMISSIONS.USERS_READ);
      expect(perms).not.toContain(PERMISSIONS.ARTIFACTS_CREATE);
    });

    test('admin role has all permissions except manage-roles', () => {
      const perms = getPermissionsForRole('admin');
      expect(perms).toContain(PERMISSIONS.ARTIFACTS_CREATE);
      expect(perms).toContain(PERMISSIONS.ARTIFACTS_DELETE);
      expect(perms).toContain(PERMISSIONS.MUSEUMS_CREATE);
      expect(perms).toContain(PERMISSIONS.ADMIN_DASHBOARD);
      expect(perms).not.toContain(PERMISSIONS.USERS_MANAGE_ROLES);
    });

    test('super-admin role has all permissions', () => {
      const perms = getPermissionsForRole('super-admin');
      expect(perms).toContain(PERMISSIONS.USERS_MANAGE_ROLES);
      expect(perms.length).toBe(Object.keys(PERMISSIONS).length);
    });

    test('unknown role defaults to user permissions', () => {
      const perms = getPermissionsForRole('unknown');
      expect(perms).toEqual(ROLE_PERMISSIONS.user);
    });
  });

  describe('Role Hierarchy', () => {
    test('admin outranks user', () => {
      expect(hasRoleLevel('admin', 'user')).toBe(true);
    });

    test('user does not outrank admin', () => {
      expect(hasRoleLevel('user', 'admin')).toBe(false);
    });

    test('super-admin outranks all', () => {
      expect(hasRoleLevel('super-admin', 'admin')).toBe(true);
      expect(hasRoleLevel('super-admin', 'moderator')).toBe(true);
      expect(hasRoleLevel('super-admin', 'user')).toBe(true);
    });

    test('moderator outranks user but not admin', () => {
      expect(hasRoleLevel('moderator', 'user')).toBe(true);
      expect(hasRoleLevel('moderator', 'admin')).toBe(false);
    });
  });
});
