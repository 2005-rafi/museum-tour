import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, formatLocation, truncate } from '../../utils/formatters';

const FALLBACK = '/placeholder-museum.jpg';

function MuseumCard({ museum }) {
  const navigate = useNavigate();

  if (!museum) return null;

  const imageUrl = getImageUrl(museum.images, FALLBACK);
  const location = formatLocation(museum.location);

  return (
    <div
      className="museum-card"
      onClick={() => navigate(`/museums/${museum._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/museums/${museum._id}`)}
      aria-label={`View ${museum.name}`}
    >
      <div className="museum-image">
        <img
          src={imageUrl}
          alt={museum.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
        />
        <div className="museum-overlay">
          <button className="view-artifacts-button">View Collection</button>
        </div>
      </div>

      <div className="museum-info">
        <h2>{museum.name}</h2>
        <p className="museum-location">
          <i className="fas fa-map-marker-alt" /> {location}
        </p>
        <p className="museum-description">{truncate(museum.description, 120)}</p>
        <div className="museum-stats">
          <span>
            <i className="fas fa-archive" />{' '}
            {museum.artifactCount ?? 0} Artifacts
          </span>
          <span>
            <i className="fas fa-calendar" />{' '}
            {new Date(museum.createdAt).getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MuseumCard;
