import React from 'react';
import CommentCard from './CommentCard';
import EmptyState from '../ui/EmptyState';

/**
 * CommentList – renders a list of CommentCard items.
 *
 * Props:
 *   comments       – array of comment objects
 *   currentUserId  – _id of the logged-in user (passed to each CommentCard)
 *   artifactId     – parent artifact id (for cache invalidation in CommentCard)
 */
function CommentList({ comments = [], currentUserId, artifactId }) {
  if (!comments.length) {
    return (
      <EmptyState
        icon="far fa-comments"
        title="No comments yet"
        message="Be the first to share your thoughts!"
      />
    );
  }

  return (
    <ul className="comments-list" role="list" aria-label="Comments">
      {comments.map((comment) => (
        <li key={comment._id} className="comments-list-item">
          <CommentCard
            comment={comment}
            currentUserId={currentUserId}
            artifactId={artifactId}
          />
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
