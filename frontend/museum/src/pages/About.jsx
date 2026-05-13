import React from 'react'
import { Link } from 'react-router-dom'
import { useMuseums } from '../hooks/useMuseums'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import { formatLocation } from '../utils/formatters'
import '../styles/about.css'

function About() {
  const { data, isLoading, isError, error, refetch } = useMuseums({ limit: 20 });
  const museums = data?.items ?? [];

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message={error?.message} onRetry={refetch} />;

  return (
    <section className="about-section">
      <div className="about-intro">
        <h1>About Museum Tour</h1>
        <p>
          Museum Tour is your gateway to the world&apos;s most remarkable collections of art,
          history, and culture. Explore our partner museums and discover thousands of
          artifacts from every era and corner of the globe.
        </p>
      </div>

      {museums.map((museum) => (
        <div key={museum._id} className="about-container">
          <h2>{museum.name}</h2>
          <div className="about-content">
            <div className="about-text">
              <p>{museum.description}</p>
            </div>

            {museum.location && (
              <div className="museum-location">
                <h3>Location</h3>
                <p>{formatLocation(museum.location)}</p>
              </div>
            )}

            {museum.images?.length > 0 && (
              <div className="museum-images">
                {museum.images.map((image, index) => (
                  <div key={index} className="image-container">
                    <img
                      src={image.url ?? image}
                      alt={image.caption || 'Museum image'}
                      style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
                    />
                    {image.caption && <p className="image-caption">{image.caption}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="museum-stats">
              {museum.createdAt && (
                <div className="stat">
                  <h3>Since</h3>
                  <p>{new Date(museum.createdAt).getFullYear()}</p>
                </div>
              )}
            </div>

            <Link to={`/museums/${museum._id}`} className="view-artifacts-button">
              Explore Museum Collection
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}

export default About