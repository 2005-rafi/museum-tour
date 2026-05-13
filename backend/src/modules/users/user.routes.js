const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { validateObjectId } = require('../../middleware/validate');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  logoutSchema,
  userListQuerySchema,
  activityQuerySchema,
  adminLoginSchema,
  adminRegisterSchema,
  suspendUserSchema,
} = require('./user.validation');
const { authLimiter, readLimiter, writeLimiter, adminAuthLimiter } = require('../../middleware/rateLimiter');

// ─── Auth ──────────────────────────────────────────────────────────────────
router.post('/register',       authLimiter, validate(registerSchema),     userController.register);
router.post('/login',          authLimiter, validate(loginSchema),         userController.login);
router.post('/refresh',        authLimiter, validate(refreshTokenSchema),  userController.refresh);
router.post('/logout',         authLimiter, protect, validate(logoutSchema), userController.logout);

// ─── Password reset ───────────────────────────────────────────────────────
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), userController.forgotPassword);
router.post('/reset-password',  authLimiter, validate(resetPasswordSchema),  userController.resetPassword);

// ─── Profile ─────────────────────────────────────────────────────────────
router.get('/profile',          readLimiter,  protect, userController.getProfile);
router.put('/profile',          writeLimiter, protect, validate(updateProfileSchema),  userController.updateProfile);
router.put('/password',         writeLimiter, protect, validate(changePasswordSchema), userController.changePassword);
router.get('/profile/liked',    readLimiter,  protect, validate(activityQuerySchema, 'query'), userController.getLikedArtifacts);
router.get('/profile/comments', readLimiter,  protect, validate(activityQuerySchema, 'query'), userController.getUserComments);

// ─── Admin Authentication ─────────────────────────────────────────────────
router.post('/admin/register', adminAuthLimiter, validate(adminRegisterSchema), userController.adminRegister);
router.post('/admin/login',    adminAuthLimiter, validate(adminLoginSchema),    userController.adminLogin);

// ─── Admin User Management ────────────────────────────────────────────────
router.get('/',           readLimiter,  protect, restrictTo('admin', 'super-admin'), validate(userListQuerySchema, 'query'), userController.getAllUsers);
router.put('/:id/suspend', writeLimiter, protect, restrictTo('admin', 'super-admin'), validateObjectId('id'), validate(suspendUserSchema), userController.suspendUser);
router.delete('/:id',     writeLimiter, protect, restrictTo('admin', 'super-admin'), validateObjectId('id'), userController.deleteUser);

module.exports = router;
