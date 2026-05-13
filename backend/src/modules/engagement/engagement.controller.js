const engagementService = require('./engagement.service');
const Comment = require('./comment.model');
const Like = require('./like.model');

class EngagementController {
  async like(req, res, next) {
    try {
      const like = await engagementService.likeArtifact(req.params.id, req.user._id);
      res.status(201).json({ success: true, data: like });
    } catch (error) {
      next(error);
    }
  }

  async unlike(req, res, next) {
    try {
      await engagementService.unlikeArtifact(req.params.id, req.user._id);
      res.json({ success: true, message: 'Like removed' });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req, res, next) {
    try {
      const comment = await engagementService.addComment(
        req.params.id,
        req.user._id,
        req.body.commentText
      );
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await engagementService.getComments(req.params.id, {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const comment = await engagementService.updateComment(
        req.params.id, req.user._id, req.body.commentText
      );
      res.json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super-admin';
      await engagementService.deleteComment(req.params.id, req.user._id, isAdmin);
      res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  }

  // ── Admin: paginated list of ALL comments ─────────────────────────────────
  async getAllComments(req, res, next) {
    try {
      const page  = Number(req.query.page)  || 1;
      const limit = Number(req.query.limit) || 50;
      const skip  = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        Comment.find({ isDeleted: { $ne: true } })
          .populate('userId',     'name email role')
          .populate('artifactId', 'name')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Comment.countDocuments({ isDeleted: { $ne: true } }),
      ]);

      res.json({
        success: true,
        data: comments,
        pagination: { totalItems: total, currentPage: page, totalPages: Math.ceil(total / limit), limit },
      });
    } catch (error) {
      next(error);
    }
  }

  // ── Admin: paginated list of ALL likes ────────────────────────────────────
  async getAllLikes(req, res, next) {
    try {
      const page  = Number(req.query.page)  || 1;
      const limit = Number(req.query.limit) || 50;
      const skip  = (page - 1) * limit;

      const [likes, total] = await Promise.all([
        Like.find({})
          .populate('userId',     'name email')
          .populate('artifactId', 'name images')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Like.countDocuments({}),
      ]);

      res.json({
        success: true,
        data: likes,
        pagination: { totalItems: total, currentPage: page, totalPages: Math.ceil(total / limit), limit },
      });
    } catch (error) {
      next(error);
    }
  }

  // ── Admin: delete any comment (no ownership check) ────────────────────────
  async adminDeleteComment(req, res, next) {
    try {
      await engagementService.deleteComment(req.params.id, req.user._id, true);
      res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  }

  async adminBulkDeleteComments(req, res, next) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'ids array required' });
      }
      const Comment = require('./comment.model');
      const result = await Comment.updateMany(
        { _id: { $in: ids } },
        { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id }
      );
      res.json({ success: true, deletedCount: result.modifiedCount });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EngagementController();
