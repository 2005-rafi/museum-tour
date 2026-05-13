const Like = require('./like.model');
const Comment = require('./comment.model');

class EngagementRepository {
  // Likes
  async createLike(data, session) {
    const opts = session ? { session } : {};
    const [like] = await Like.create([data], opts);
    return like;
  }

  async deleteLike(artifactId, userId, session) {
    const opts = session ? { session } : {};
    return Like.findOneAndDelete({ artifactId, userId }, opts);
  }

  async findLike(artifactId, userId) {
    return Like.findOne({ artifactId, userId });
  }

  // Comments
  async createComment(data, session) {
    const opts = session ? { session } : {};
    const [comment] = await Comment.create([data], opts);
    return comment;
  }

  async findCommentsByArtifact(artifactId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      Comment.find({ artifactId })
        .populate('userId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Comment.countDocuments({ artifactId }),
    ]);
    return {
      data: comments,
      pagination: { totalItems: total, currentPage: page, totalPages: Math.ceil(total / limit), limit },
    };
  }

  async findCommentById(commentId) {
    return Comment.findById(commentId);
  }

  async updateComment(commentId, commentText) {
    return Comment.findByIdAndUpdate(commentId, { commentText }, { new: true, runValidators: true });
  }

  async deleteComment(commentId, session) {
    const opts = session ? { session } : {};
    return Comment.findByIdAndUpdate(
      commentId,
      { isDeleted: true, deletedAt: new Date() },
      { new: true, ...opts }
    );
  }
}

module.exports = new EngagementRepository();
