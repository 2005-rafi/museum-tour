import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/museums.css';

function Museums() {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/museums');
        
        // Log image details for debugging
        response.data.forEach(museum => {
          console.log(`Museum: ${museum.name}`);
          console.log('Images:', museum.images);
        });
        
        setMuseums(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch museums. Please try again later.');
        setLoading(false);
      }
    };

    fetchMuseums();
  }, []);

  const formatLocation = (location) => {
    if (!location) return 'Location not available';
    return `${location.city}, ${location.state}, ${location.country}`;
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    e.target.onerror = null; // Prevent infinite error loop
    e.target.src = '/default-museum.jpg'; // Fallback image
  };

  if (loading) {
    return (
      <div className="museums-loading">
        <div className="loading-spinner">Loading museums...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="museums-error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="museums-page">
      <div className="museums-header">
        <h1>World-Class Museums</h1>
        <p>Explore our curated selection of prestigious museums from around the globe</p>
      </div>

      <div className="museums-grid">
        {museums.map((museum) => (
          <div 
            key={museum._id} 
            className="museum-card"
          >
            <div className="museum-image">
              <img 
                src={museum.images && museum.images.length > 0 ? museum.images[0].url : '/default-museum.jpg'} 
                alt={museum.name} 
                onError={handleImageError}
                style={{ 
                  width: '100%', 
                  height: '250px', 
                  objectFit: 'cover' 
                }}
              />
              <div className="museum-overlay">
                <button 
                  onClick={() => navigate(`/museums/${museum._id}/artifacts`)}
                  className="view-artifacts-button"
                >
                  View Collection
                </button>
              </div>
            </div>
            <div className="museum-info">
              <h2>{museum.name}</h2>
              <p className="museum-location">{formatLocation(museum.location)}</p>
              <p className="museum-description">{museum.description}</p>
              <div className="museum-stats">
                <span>{museum.artifactCount || 'No'} Artifacts</span>
                <span>{new Date(museum.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Museums;
