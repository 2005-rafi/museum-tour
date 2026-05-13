import React from 'react';
import { Link } from 'react-router-dom';
import CommentForm from '../forms/CommentForm';

/**
 * CommentInput – entry point for adding a new comment.
 * Shows the form for authenticated users; a login prompt for guests.
 *
 * Props:
 *   isAuthenticated – boolean
 *   onSubmit        – (text: string) => void
 *   isLoading       – mutation in-flight
 */
function CommentInput({ isAuthenticated, onSubmit, isLoading }) {
  if (!isAuthenticated) {
    return (
      <div className="comment-login-cta">
        <i className="far fa-comment-dots comment-login-icon" aria-hidden="true" />
        <p className="comment-login-text">
          <Link to="/login">Log in</Link> or{' '}
          <Link to="/register">create an account</Link> to join the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="comment-input-wrap">
      <CommentForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        placeholder="Share your thoughts about this artifact…"
      />
    </div>
  );
}

export default CommentInput;
