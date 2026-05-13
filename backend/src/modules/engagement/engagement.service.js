const mongoose = require('mongoose');
const engagementRepository = require('./engagement.repository');
const artifactRepository = require('../artifacts/artifact.repository');
const { createError, ErrorCodes } = require('../../utils/errors');

/** Strip HTML tags to prevent stored XSS (comments are plain text). */
const stripHtml = (text) => text.replace(/<[^>]*>/g, '').trim();

class EngagementService {
  async _verifyArtifactExists(artifactId) {
    const artifact = await artifactRepository.findById(artifactId);
    if (!artifact) {
      throw createError(ErrorCodes.ARTIFACT_NOT_FOUND, 'Artifact not found');
    }
    return artifact;
  }

  async likeArtifact(artifactId, userId) {
    await this._verifyArtifactExists(artifactId);

    const existing = await engagementRepository.findLike(artifactId, userId);
    if (existing) {
      throw createError(ErrorCodes.ALREADY_LIKED, 'Already liked this artifact');
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const like = await engagementRepository.createLike({ artifactId, userId }, session);
      await artifactRepository.incrementEngagement(artifactId, 'likesCount', 1, session);
      await session.commitTransaction();
      return like;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async unlikeArtifact(artifactId, userId) {
    const like = await engagementRepository.findLike(artifactId, userId);
    if (!like) {
      throw createError(ErrorCodes.LIKE_NOT_FOUND, 'Like not found');
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await engagementRepository.deleteLike(artifactId, userId, session);
      await artifactRepository.incrementEngagement(artifactId, 'likesCount', -1, session);
      await session.commitTransaction();
      return like;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async addComment(artifactId, userId, commentText) {
    await this._verifyArtifactExists(artifactId);
    const sanitized = stripHtml(commentText);

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const comment = await engagementRepository.createComment(
        { artifactId, userId, commentText: sanitized }, session
      );
      await artifactRepository.incrementEngagement(artifactId, 'commentsCount', 1, session);
      await session.commitTransaction();
      return comment;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async updateComment(commentId, userId, commentText) {
    const comment = await engagementRepository.findCommentById(commentId);
    if (!comment) {
      throw createError(ErrorCodes.COMMENT_NOT_FOUND, 'Comment not found');
    }
    if (comment.userId.toString() !== userId.toString()) {
      throw createError(ErrorCodes.AUTH_FORBIDDEN, 'You can only edit your own comments');
    }
    return engagementRepository.updateComment(commentId, stripHtml(commentText));
  }

  async deleteComment(commentId, userId, isAdmin = false) {
    const comment = await engagementRepository.findCommentById(commentId);
    if (!comment) {
      throw createError(ErrorCodes.COMMENT_NOT_FOUND, 'Comment not found');
    }
    if (!isAdmin && comment.userId.toString() !== userId.toString()) {
      throw createError(ErrorCodes.AUTH_FORBIDDEN, 'You can only delete your own comments');
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await engagementRepository.deleteComment(commentId, session);
      await artifactRepository.incrementEngagement(comment.artifactId, 'commentsCount', -1, session);
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getComments(artifactId, options) {
    return engagementRepository.findCommentsByArtifact(artifactId, options);
  }
}

module.exports = new EngagementService();
