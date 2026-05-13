import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useArtifactDetail, useLikeArtifact, useAddComment, useArtifactComments } from '../hooks/useArtifacts';
import { useAuthState } from '../hooks/useUser';
import LikeButton from '../components/social/LikeButton';
import CommentInput from '../components/social/CommentInput';
import CommentList from '../components/social/CommentList';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { getImageUrl } from '../utils/formatters';
import '../styles/artifacts.css';

function ArtifactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthState();

  const { data: artifact, isLoading, isError, error, refetch } = useArtifactDetail(id);
  const { data: commentsData } = useArtifactComments(id);
  const { mutate: toggleLike, isPending: liking } = useLikeArtifact();
  const { mutate: addComment, isPending: commenting } = useAddComment();

  const comments = commentsData?.data ?? [];

  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return <Spinner fullPage />;
  if (isError) return <ErrorMessage message={error?.message} onRetry={refetch} />;
  if (!artifact) return null;

  const images = artifact.images?.length ? artifact.images : [];
  const mainImageUrl = images[activeImage]?.url ?? images[activeImage] ?? getImageUrl(artifact.images);

  const handleLike = () => {
    if (!isAuthenticated) return;
    toggleLike({ id: artifact._id, isLiked: artifact.isLiked });
  };

  const handleAddComment = (text) => {
    addComment({ artifactId: id, text });
  };


  return (
    <div className="artifact-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep" aria-hidden="true">/</span>
        <Link to="/artifacts">Artifacts</Link>
        <span className="breadcrumb-sep" aria-hidden="true">/</span>
        <span aria-current="page">{artifact.name}</span>
      </nav>

      <div className="artifact-detail-layout">
        {/* Image panel */}
        <div className="artifact-detail-images">
          <div className="artifact-main-image-wrap">
            {mainImageUrl ? (
              <img
                src={mainImageUrl}
                alt={artifact.name}
                className="artifact-main-image"
              />
            ) : (
              <div className="artifact-main-image-placeholder">
                <i className="fas fa-image" aria-hidden="true" />
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="artifact-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`artifact-thumb-btn${i === activeImage ? ' active' : ''}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img.url ?? img} alt={`${artifact.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="artifact-detail-info">
          <div className="artifact-detail-header">
            <h1 className="artifact-detail-name">{artifact.name}</h1>
            {artifact.historicalPeriod && <Badge variant="gold">{artifact.historicalPeriod}</Badge>}
          </div>

          <p className="artifact-detail-description">{artifact.description}</p>

          {/* Discovery Story */}
          {artifact.discoveryStory && (
            <div className="artifact-detail-history">
              <h3>Discovery Story</h3>
              <p>{artifact.discoveryStory}</p>
            </div>
          )}

          {/* Cultural Significance */}
          {artifact.culturalSignificance && (
            <div className="artifact-detail-history">
              <h3>Cultural Significance</h3>
              <p>{artifact.culturalSignificance}</p>
            </div>
          )}

          {/* Tags */}
          {artifact.tags?.length > 0 && (
            <div className="artifact-detail-tags">
              {artifact.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="artifact-tag"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          <dl className="artifact-detail-meta">
            {artifact.origin && (
              <>
                <dt>Origin</dt>
                <dd>{artifact.origin}</dd>
              </>
            )}
            {artifact.historicalPeriod && (
              <>
                <dt>Period</dt>
                <dd>{artifact.historicalPeriod}</dd>
              </>
            )}
            {artifact.museumId && (
              <>
                <dt>Museum</dt>
                <dd>
                  <Link to={`/museums/${artifact.museumId._id ?? artifact.museumId}`}>
                    {artifact.museumId.name ?? 'View museum'}
                  </Link>
                </dd>
              </>
            )}
          </dl>

          {/* Like */}
          <div className="artifact-detail-actions">
            <LikeButton
              isLiked={!!artifact.isLiked}
              count={artifact.likesCount ?? artifact.likes?.length ?? 0}
              isAuthenticated={isAuthenticated}
              isLoading={liking}
              onClick={handleLike}
            />
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="artifact-comments-section">
        <h2 className="comments-section-heading">
          <i className="far fa-comments" aria-hidden="true" />
          Comments
          <span className="comments-count-badge">
            {comments.length}
          </span>
        </h2>

        <CommentInput
          isAuthenticated={isAuthenticated}
          onSubmit={handleAddComment}
          isLoading={commenting}
        />

        <CommentList
          comments={comments}
          currentUserId={user?._id}
          artifactId={id}
        />
      </div>
    </div>
  );
}

export default ArtifactDetail;
