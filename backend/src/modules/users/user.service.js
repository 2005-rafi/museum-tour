const jwt = require('jsonwebtoken');
const userRepository = require('./user.repository');
const RefreshToken = require('./refreshToken.model');
const TokenBlacklist = require('./tokenBlacklist.model');
const LoginAudit = require('./loginAudit.model');
const PasswordReset = require('./passwordReset.model');
const { createError, ErrorCodes } = require('../../utils/errors');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

class UserService {
  /** Consistent user object shape returned from auth endpoints. */
  _serializeUser(user) {
    return { id: user._id, name: user.name, email: user.email, role: user.role };
  }

  generateAccessToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
  }

  async generateRefreshToken(userId, req) {
    const token = RefreshToken.generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create({
      userId,
      token,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return token;
  }

  async logLoginAttempt(email, userId, success, failureReason, req) {
    await LoginAudit.create({
      email,
      userId: userId || undefined,
      success,
      failureReason: failureReason || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  async register(data, req) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw createError(ErrorCodes.USER_EMAIL_EXISTS, 'Email already registered');
    }
    const user = await userRepository.create(data);
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = await this.generateRefreshToken(user._id, req);
    return { user: this._serializeUser(user), accessToken, refreshToken };
  }

  async login(email, password, req) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      await this.logLoginAttempt(email, null, false, 'INVALID_EMAIL', req);
      throw createError(ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
    }

    // Check account lockout
    if (user.isLocked()) {
      await this.logLoginAttempt(email, user._id, false, 'ACCOUNT_LOCKED', req);
      throw createError(ErrorCodes.ACCOUNT_LOCKED, 'Account is temporarily locked. Try again later.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed attempts
      const updates = { $inc: { failedLoginAttempts: 1 } };
      if (user.failedLoginAttempts + 1 >= MAX_FAILED_ATTEMPTS) {
        updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION_MS) };
      }
      await userRepository.updateById(user._id, updates);
      await this.logLoginAttempt(email, user._id, false, 'INVALID_PASSWORD', req);
      throw createError(ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
    }

    // Reset failed attempts on success
    await userRepository.updateById(user._id, {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
    });

    await this.logLoginAttempt(email, user._id, true, null, req);

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = await this.generateRefreshToken(user._id, req);
    return { user: this._serializeUser(user), accessToken, refreshToken };
  }

  async refreshAccessToken(token, req) {
    const storedToken = await RefreshToken.findOne({ token, isRevoked: false });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw createError(ErrorCodes.INVALID_REFRESH_TOKEN, 'Invalid or expired refresh token');
    }

    const user = await userRepository.findById(storedToken.userId);
    if (!user) {
      throw createError(ErrorCodes.USER_NOT_FOUND, 'User no longer exists');
    }

    // Rotate: revoke the old token and issue a new one
    storedToken.isRevoked = true;
    storedToken.lastUsedAt = new Date();
    await storedToken.save();

    const accessToken = this.generateAccessToken(user._id);
    const newRefreshToken = await this.generateRefreshToken(user._id, req);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(accessToken, refreshToken) {
    // Blacklist access token
    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken);
        if (decoded && decoded.exp) {
          await TokenBlacklist.create({
            token: accessToken,
            expiresAt: new Date(decoded.exp * 1000),
          });
        }
      } catch {
        // Token may be invalid, still proceed with refresh token revocation
      }
    }

    // Revoke refresh token
    if (refreshToken) {
      await RefreshToken.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
    }
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createError(ErrorCodes.USER_NOT_FOUND, 'User not found');
    }
    return user;
  }

  async updateProfile(userId, data) {
    // Prevent updating protected fields
    const { password, email, role, failedLoginAttempts, lockUntil, ...safeData } = data;
    const user = await userRepository.updateById(userId, safeData);
    if (!user) {
      throw createError(ErrorCodes.USER_NOT_FOUND, 'User not found');
    }
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByEmail(null, userId);
    if (!user) {
      throw createError(ErrorCodes.USER_NOT_FOUND, 'User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw createError(ErrorCodes.PASSWORD_MISMATCH, 'Current password is incorrect');
    }

    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      throw createError(ErrorCodes.SAME_PASSWORD, 'New password must be different from current password');
    }

    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens for this user (force re-login)
    await RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true });

    return { message: 'Password changed successfully. Please log in again.' };
  }

  async getAllUsers(options) {
    return userRepository.findAll({}, options);
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    // Always return generic message to prevent email enumeration
    const genericMsg = 'If this email is registered, a password reset link has been sent.';

    if (!user) return { message: genericMsg };

    // Invalidate any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    const { rawToken, hashedToken } = PasswordReset.generateResetToken();
    await PasswordReset.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Send email if SMTP is configured
    if (process.env.SMTP_HOST) {
      await this._sendResetEmail(user.email, rawToken);
    }

    const response = { message: genericMsg };
    // In development, return token directly for testing
    if (process.env.NODE_ENV === 'development') {
      response.devToken = rawToken;
    }
    return response;
  }

  async resetPassword(token, newPassword) {
    const hashedToken = PasswordReset.hashToken(token);
    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      throw createError(ErrorCodes.INVALID_RESET_TOKEN, 'Invalid or expired reset token');
    }

    const user = await userRepository.findByEmail(null, resetRecord.userId);
    if (!user) {
      throw createError(ErrorCodes.USER_NOT_FOUND, 'User not found');
    }

    user.password = newPassword;
    await user.save();

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    // Revoke all refresh tokens (force re-login everywhere)
    await RefreshToken.updateMany({ userId: user._id, isRevoked: false }, { isRevoked: true });

    return { message: 'Password reset successful. Please log in with your new password.' };
  }

  async _sendResetEmail(email, token) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${encodeURIComponent(token)}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@museumtour.com',
      to: email,
      subject: 'Password Reset - Museum Tour',
      html: [
        '<h2>Password Reset</h2>',
        '<p>You requested a password reset. Click the link below to set a new password:</p>',
        `<a href="${resetUrl}">Reset Password</a>`,
        '<p>This link expires in 1 hour.</p>',
        '<p>If you did not request this, please ignore this email.</p>',
      ].join(''),
    });
  }

  // ── Admin Authentication ───────────────────────────────────────────────────

  _validateAdminSecret(adminSecretKey) {
    const envSecret = process.env.ADMIN_SECRET_KEY;
    if (!envSecret) {
      throw createError(ErrorCodes.INTERNAL_ERROR, 'Admin secret key is not configured');
    }
    if (adminSecretKey !== envSecret) {
      throw createError(ErrorCodes.ADMIN_INVALID_SECRET, 'Invalid admin secret key');
    }
  }

  async adminRegister(data, req) {
    this._validateAdminSecret(data.adminSecretKey);

    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw createError(ErrorCodes.USER_EMAIL_EXISTS, 'Email already registered');
    }

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'admin',
    });

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = await this.generateRefreshToken(user._id, req);
    return { user: this._serializeUser(user), accessToken, refreshToken };
  }

  async adminLogin(email, password, adminSecretKey, req) {
    this._validateAdminSecret(adminSecretKey);

    const user = await userRepository.findByEmail(email);
    if (!user) {
      await this.logLoginAttempt(email, null, false, 'INVALID_EMAIL', req);
      throw createError(ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
    }

    // Verify user is an admin
    if (user.role !== 'admin' && user.role !== 'super-admin') {
      await this.logLoginAttempt(email, user._id, false, 'NOT_ADMIN', req);
      throw createError(ErrorCodes.ADMIN_ROLE_REQUIRED, 'This account does not have admin privileges');
    }

    // Check account lockout
    if (user.isLocked()) {
      await this.logLoginAttempt(email, user._id, false, 'ACCOUNT_LOCKED', req);
      throw createError(ErrorCodes.ACCOUNT_LOCKED, 'Account is temporarily locked. Try again later.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const updates = { $inc: { failedLoginAttempts: 1 } };
      if (user.failedLoginAttempts + 1 >= MAX_FAILED_ATTEMPTS) {
        updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION_MS) };
      }
      await userRepository.updateById(user._id, updates);
      await this.logLoginAttempt(email, user._id, false, 'INVALID_PASSWORD', req);
      throw createError(ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
    }

    // Reset failed attempts on success
    await userRepository.updateById(user._id, {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
    });

    await this.logLoginAttempt(email, user._id, true, null, req);

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = await this.generateRefreshToken(user._id, req);
    return { user: this._serializeUser(user), accessToken, refreshToken };
  }

  async suspendUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createError(ErrorCodes.USER_NOT_FOUND, 'User not found');
    }
    if (user.role === 'admin' || user.role === 'super-admin') {
      throw createError(ErrorCodes.AUTH_FORBIDDEN, 'Cannot suspend an admin user');
    }
    const updated = await userRepository.updateById(userId, {
      lockUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });
    return updated;
  }

  async unsuspendUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createError(ErrorCodes.USER_NOT_FOUND, 'User not found');
    }
    const updated = await userRepository.updateById(userId, {
      lockUntil: null,
      failedLoginAttempts: 0,
    });
    return updated;
  }

  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createError(ErrorCodes.USER_NOT_FOUND, 'User not found');
    }
    if (user.role === 'admin' || user.role === 'super-admin') {
      throw createError(ErrorCodes.AUTH_FORBIDDEN, 'Cannot delete an admin user from this endpoint');
    }
    // Revoke all tokens
    await RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true });
    await userRepository.deleteById(userId);
    return { message: 'User deleted successfully' };
  }
}

module.exports = new UserService();
