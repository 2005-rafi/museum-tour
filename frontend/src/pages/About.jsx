import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/about.css'

function About() {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        console.log('Attempting to fetch museums...');
        const response = await axios.get('http://localhost:5000/api/museums', {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Museums fetched successfully:', response.data);
        
        // Log image details for debugging
        response.data.forEach(museum => {
          console.log(`Museum: ${museum.name}`);
          console.log('Images:', museum.images);
        });
        
        setMuseums(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Complete error object:', err);
        
        if (err.response) {
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
          console.error('Error response headers:', err.response.headers);
          
          setError(`Server Error: ${err.response.data.message || 'Unable to fetch museums'}`);
        } else if (err.request) {
          console.error('Error request:', err.request);
          setError('No response received from server. Please check your network connection.');
        } else {
          console.error('Error message:', err.message);
          setError(`Error: ${err.message}`);
        }
        
        setLoading(false);
      }
    };

    fetchMuseums();
  }, []);

  const formatLocation = (location) => {
    if (!location) return 'Location not available';
    return `${location.address}, ${location.city}, ${location.state}, ${location.country} - ${location.zipCode}`;
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    e.target.onerror = null; // Prevent infinite error loop
    e.target.src = '/default-museum.jpg'; // Fallback image
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!museums || museums.length === 0) return <div>No museums found</div>;

  return (
    <section className="about-section">
      {museums.map((museum) => (
        <div key={museum._id} className="about-container">
          <h2>{museum.name}</h2>
          <div className="about-content">
            <div className="about-text">
              <p>{museum.description}</p>
            </div>

            <div className="museum-location">
              <h3>Location</h3>
              <p>{formatLocation(museum.location)}</p>
            </div>

            {museum.images && museum.images.length > 0 && (
              <div className="museum-images">
                {museum.images.map((image, index) => (
                  <div key={index} className="image-container">
                    <img 
                      src={image.url} 
                      alt={image.caption || 'Museum image'} 
                      onError={handleImageError}
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto', 
                        objectFit: 'cover' 
                      }}
                    />
                    {image.caption && (
                      <p className="image-caption">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="museum-stats">
              <div className="stat">
                <h3>Since</h3>
                <p>{new Date(museum.createdAt).getFullYear()}</p>
              </div>
              <div className="stat">
                <h3>Last Updated</h3>
                <p>{new Date(museum.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/museums/${museum._id}/artifacts`)}
              className="view-artifacts-button"
            >
              Explore Museum Collection
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}

export default About