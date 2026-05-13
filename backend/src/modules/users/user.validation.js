const Joi = require('joi');

// Password: 8+ chars, at least one uppercase, one lowercase, one digit, one special char
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const passwordMessage = 'Password must be at least 8 characters with uppercase, lowercase, digit, and special character';

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).pattern(passwordPattern).required()
    .messages({ 'string.pattern.base': passwordMessage }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  phone: Joi.string().trim().max(20).allow(''),
  location: Joi.string().trim().max(100).allow(''),
  bio: Joi.string().trim().max(500).allow(''),
  avatar: Joi.string().uri().allow(''),
  preferences: Joi.object({
    emailNotifications: Joi.boolean(),
    theme: Joi.string().valid('light', 'dark', 'auto'),
    language: Joi.string().valid('en', 'es', 'fr', 'ar'),
  }),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).pattern(passwordPattern).required()
    .messages({ 'string.pattern.base': passwordMessage }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).pattern(passwordPattern).required()
    .messages({ 'string.pattern.base': passwordMessage }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

// ─── Token management ───────────────────────────────────────────────────────

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'refreshToken is required',
    'string.empty': 'refreshToken must not be empty',
  }),
});

// refreshToken is optional on logout (no active token is also a valid logged-out state)
const logoutSchema = Joi.object({
  refreshToken: Joi.string().allow('', null),
});

// ─── Admin list query ────────────────────────────────────────────────────────

const userListQuerySchema = Joi.object({
  page:   Joi.number().integer().min(1).default(1),
  limit:  Joi.number().integer().min(1).max(100).default(20),
  role:   Joi.string().valid('user', 'moderator', 'admin', 'super-admin'),
  search: Joi.string().trim().max(100).allow(''),
});

// ─── Admin authentication ────────────────────────────────────────────────────

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  adminSecretKey: Joi.string().required().messages({
    'any.required': 'Admin secret key is required',
    'string.empty': 'Admin secret key must not be empty',
  }),
});

const adminRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).pattern(passwordPattern).required()
    .messages({ 'string.pattern.base': passwordMessage }),
  adminSecretKey: Joi.string().required().messages({
    'any.required': 'Admin secret key is required',
    'string.empty': 'Admin secret key must not be empty',
  }),
});

// ─── Admin user management ───────────────────────────────────────────────────

const suspendUserSchema = Joi.object({
  suspended: Joi.boolean().required(),
});

// ─── Profile activity query ──────────────────────────────────────────────────

const activityQuerySchema = Joi.object({
  page:  Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = {
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
};
