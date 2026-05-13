import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, truncate, formatDate } from '../../utils/formatters';
import Badge from '../ui/Badge';

const FALLBACK = '/placeholder-artifact.jpg';

function ArtifactCard({ artifact, onLike, isLiked }) {
  const navigate = useNavigate();

  if (!artifact) return null;

  const imageUrl = getImageUrl(artifact.images || artifact.imageUrl, FALLBACK);

  const handleLike = (e) => {
    e.stopPropagation();
    if (onLike) onLike(artifact._id, isLiked);
  };

  return (
    <div
      className="artifact-card"
      onClick={() => navigate(`/artifacts/${artifact._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/artifacts/${artifact._id}`)}
      aria-label={`View ${artifact.name}`}
    >
      <div className="artifact-image-container">
        <img
          src={imageUrl}
          alt={artifact.name}
          className="artifact-image"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
        />
        {artifact.historicalPeriod && (
          <Badge variant="gold">{artifact.historicalPeriod}</Badge>
        )}
      </div>

      <div className="artifact-info">
        <h3 className="artifact-name">{artifact.name}</h3>
        {artifact.origin && (
          <p className="artifact-origin">
            <i className="fas fa-globe-americas" /> {artifact.origin}
          </p>
        )}
        <p className="artifact-description">{truncate(artifact.description, 100)}</p>

        <div className="artifact-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`artifact-like-btn${isLiked ? ' artifact-like-btn--liked' : ''}`}
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike artifact' : 'Like artifact'}
          >
            <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'} />
            <span>{artifact.likesCount || 0}</span>
          </button>

          <span className="artifact-comments">
            <i className="far fa-comment" /> {artifact.commentsCount || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ArtifactCard;
