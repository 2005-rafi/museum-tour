import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMuseumDetail, useMuseumArtifacts } from '../hooks/useMuseums';
import ArtifactCard from '../components/cards/ArtifactCard';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import { formatLocation, formatDate, getImageUrl } from '../utils/formatters';
import '../styles/museum.css';

function MuseumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: museum, isLoading, isError, error, refetch } = useMuseumDetail(id);
  const { data: artifactsData, isLoading: artsLoading } = useMuseumArtifacts(id);

  const artifacts = artifactsData?.items ?? [];

  if (isLoading) return <Spinner fullPage />;
  if (isError) return <ErrorMessage message={error?.message} onRetry={refetch} />;
  if (!museum) return null;

  const heroImage = getImageUrl(museum.images);

  return (
    <div className="museum-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep" aria-hidden="true">/</span>
        <Link to="/museums">Museums</Link>
        <span className="breadcrumb-sep" aria-hidden="true">/</span>
        <span aria-current="page">{museum.name}</span>
      </nav>

      {/* Hero */}
      <div
        className="museum-detail-hero"
        style={{ backgroundImage: heroImage ? `url(${heroImage})` : undefined }}
        role="img"
        aria-label={museum.name}
      >
        <div className="museum-detail-hero-overlay">
          <h1 className="museum-detail-title">{museum.name}</h1>
          {museum.location && (
            <p className="museum-detail-location">
              <i className="fas fa-map-marker-alt" aria-hidden="true" />{' '}
              {formatLocation(museum.location)}
            </p>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="museum-detail-body">
        <div className="museum-detail-info">
          <h2>About</h2>
          <p className="museum-detail-description">{museum.description}</p>

          <div className="museum-detail-meta">
            {museum.openingHours && (
              <div className="museum-meta-item">
                <i className="fas fa-clock" aria-hidden="true" />
                <span>{museum.openingHours}</span>
              </div>
            )}
            {museum.ticketPrice != null && (
              <div className="museum-meta-item">
                <i className="fas fa-ticket-alt" aria-hidden="true" />
                <span>
                  {museum.ticketPrice === 0 ? 'Free entry' : `$${museum.ticketPrice}`}
                </span>
              </div>
            )}
            {museum.website && (
              <div className="museum-meta-item">
                <i className="fas fa-globe" aria-hidden="true" />
                <a href={museum.website} target="_blank" rel="noopener noreferrer">
                  Visit website
                </a>
              </div>
            )}
            <div className="museum-meta-item">
              <i className="fas fa-calendar-alt" aria-hidden="true" />
              <span>Listed {formatDate(museum.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {museum.images?.length > 1 && (
          <div className="museum-detail-gallery">
            <h2>Gallery</h2>
            <div className="museum-gallery-grid">
              {museum.images.map((img, i) => (
                <div key={i} className="museum-gallery-item">
                  <img
                    src={img.url ?? img}
                    alt={img.caption || `${museum.name} image ${i + 1}`}
                    loading="lazy"
                  />
                  {img.caption && <p className="museum-gallery-caption">{img.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artifacts */}
        <div className="museum-detail-artifacts">
          <h2>Collection</h2>
          {artsLoading && <Spinner />}
          {!artsLoading && artifacts.length === 0 && (
            <EmptyState
              icon="fas fa-archive"
              title="No artifacts yet"
              message="This museum hasn't added any artifacts to the collection."
            />
          )}
          {!artsLoading && artifacts.length > 0 && (
            <div className="artifacts-grid">
              {artifacts.map((artifact) => (
                <ArtifactCard key={artifact._id} artifact={artifact} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MuseumDetail;
