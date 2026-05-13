import React, { useState } from 'react';
import CommentForm from '../forms/CommentForm';
import { useEditComment, useDeleteComment } from '../../hooks/useArtifacts';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

/**
 * CommentCard – self-contained card for a single comment.
 * Owns its own edit UI state and both edit + delete mutations.
 *
 * Props:
 *   comment        – comment object from the API
 *   currentUserId  – _id of the logged-in user (for owner check)
 *   artifactId     – parent artifact id (for cache invalidation)
 */
function CommentCard({ comment, currentUserId, artifactId }) {
  const [editing, setEditing] = useState(false);

  const { mutate: editComment, isPending: isEditing } = useEditComment();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();

  // Optimistic temp comments use an "opt_" prefix – never show controls on them
  const isTemp   = String(comment._id).startsWith('opt_');
  const author   = comment.userId ?? comment.user; // populated field is userId
  const isOwner  = !isTemp && !!currentUserId && currentUserId === (author?._id ?? author);
  const wasEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  const authorName = author?.name || 'Anonymous';
  const initial = authorName.charAt(0).toUpperCase();

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleEditSubmit = (text) => {
    editComment(
      { commentId: comment._id, text, artifactId },
      { onSuccess: () => setEditing(false) }
    );
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this comment? This cannot be undone.')) return;
    deleteComment({ commentId: comment._id, artifactId });
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`comment-card${isTemp ? ' comment-card--pending' : ''}`}>
      {/* Header — author info + action buttons */}
      <div className="comment-card-header">
        <div className="comment-card-author">
          <div className="comment-avatar" aria-hidden="true">{initial}</div>
          <div className="comment-author-info">
            <span className="comment-author">{authorName}</span>
            <time
              className="comment-date"
              dateTime={comment.createdAt}
              title={formatDate(comment.createdAt)}
            >
              {isTemp ? 'Posting…' : formatRelativeTime(comment.createdAt)}
              {wasEdited && !isTemp && <span className="comment-edited"> · edited</span>}
            </time>
          </div>
        </div>

        {isOwner && !editing && (
          <div className="comment-card-controls">
            <button
              className="comment-action-btn"
              onClick={() => setEditing(true)}
              disabled={isDeleting}
              aria-label="Edit this comment"
            >
              <i className="fas fa-pencil-alt" aria-hidden="true" /> Edit
            </button>
            <button
              className="comment-action-btn comment-action-delete"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete this comment"
            >
              {isDeleting ? (
                <><i className="fas fa-spinner fa-spin" aria-hidden="true" /> Deleting…</>
              ) : (
                <><i className="fas fa-trash-alt" aria-hidden="true" /> Delete</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Body — inline edit form or plain text */}
      {editing ? (
        <CommentForm
          initialValue={comment.commentText ?? comment.text}
          isLoading={isEditing}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditing(false)}
          placeholder="Edit your comment…"
        />
      ) : (
        <p className="comment-text">{comment.commentText ?? comment.text}</p>
      )}
    </div>
  );
}

export default CommentCard;
