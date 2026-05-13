import React from 'react';

/**
 * LikeButton – standalone, purely presentational.
 * The parent page (ArtifactDetail) owns the mutation and passes state down.
 *
 * Props:
 *   isLiked        – whether the current user has liked this item
 *   count          – total like count
 *   isAuthenticated – whether the user is logged in
 *   isLoading      – mutation in-flight (shows loading state)
 *   onClick        – called when the button is clicked
 */
function LikeButton({ isLiked = false, count = 0, isAuthenticated = false, isLoading = false, onClick }) {
  return (
    <button
      className={`like-btn${isLiked ? ' liked' : ''}${isLoading ? ' like-btn--loading' : ''}`}
      onClick={isAuthenticated ? onClick : undefined}
      disabled={!isAuthenticated || isLoading}
      title={
        !isAuthenticated
          ? 'Log in to like this artifact'
          : isLiked
          ? 'Remove like'
          : 'Like this artifact'
      }
      aria-pressed={isAuthenticated ? isLiked : undefined}
      aria-label={`${isLiked ? 'Unlike' : 'Like'} – ${count} ${count === 1 ? 'like' : 'likes'}`}
    >
      <i
        className={`${isLoading ? 'fas fa-spinner fa-spin' : isLiked ? 'fas fa-heart' : 'far fa-heart'} like-btn-icon`}
        aria-hidden="true"
      />
      <span className="like-btn-count">{count}</span>
      <span className="like-btn-label">{isLiked ? 'Liked' : 'Like'}</span>
    </button>
  );
}

export default LikeButton;
