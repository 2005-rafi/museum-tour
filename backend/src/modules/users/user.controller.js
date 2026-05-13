const userService = require('./user.service');
const Like = require('../engagement/like.model');
const Comment = require('../engagement/comment.model');

class UserController {
  async register(req, res, next) {
    try {
      const result = await userService.register(req.body, req);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password, req);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await userService.refreshAccessToken(refreshToken, req);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const accessToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
      const { refreshToken } = req.body;
      await userService.logout(accessToken, refreshToken);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user._id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user._id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(req.user._id, currentPassword, newPassword);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await userService.forgotPassword(req.body.email);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await userService.resetPassword(token, newPassword);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getLikedArtifacts(req, res, next) {
    try {
      const pg = Number(req.query.page) || 1;
      const lim = Number(req.query.limit) || 20;
      const skip = (pg - 1) * lim;
      const [likes, total] = await Promise.all([
        Like.find({ userId: req.user._id })
          .populate({ path: 'artifactId', select: 'name description images tags likesCount commentsCount', populate: { path: 'museumId', select: 'name' } })
          .skip(skip).limit(lim).sort({ createdAt: -1 }),
        Like.countDocuments({ userId: req.user._id }),
      ]);
      const artifacts = likes.filter(l => l.artifactId).map(l => l.artifactId);
      res.json({ success: true, data: artifacts, pagination: { totalItems: total, currentPage: pg, totalPages: Math.ceil(total / lim), limit: lim } });
    } catch (error) {
      next(error);
    }
  }

  async getUserComments(req, res, next) {
    try {
      const pg = Number(req.query.page) || 1;
      const lim = Number(req.query.limit) || 20;
      const skip = (pg - 1) * lim;
      const [comments, total] = await Promise.all([
        Comment.find({ userId: req.user._id })
          .populate('artifactId', 'name images')
          .skip(skip).limit(lim).sort({ createdAt: -1 }),
        Comment.countDocuments({ userId: req.user._id }),
      ]);
      res.json({ success: true, data: comments, pagination: { totalItems: total, currentPage: pg, totalPages: Math.ceil(total / lim), limit: lim } });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await userService.getAllUsers({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // ── Admin Authentication ─────────────────────────────────────────────────

  async adminRegister(req, res, next) {
    try {
      const result = await userService.adminRegister(req.body, req);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async adminLogin(req, res, next) {
    try {
      const { email, password, adminSecretKey } = req.body;
      const result = await userService.adminLogin(email, password, adminSecretKey, req);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // ── Admin User Management ────────────────────────────────────────────────

  async suspendUser(req, res, next) {
    try {
      const { suspended } = req.body;
      const result = suspended
        ? await userService.suspendUser(req.params.id)
        : await userService.unsuspendUser(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const result = await userService.deleteUser(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
