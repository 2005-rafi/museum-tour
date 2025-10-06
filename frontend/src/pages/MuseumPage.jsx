import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/museum.css';

function MuseumPage() {
  const [museum, setMuseum] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { museumId } = useParams();

  useEffect(() => {
    const fetchMuseumData = async () => {
      try {
        const [museumResponse, artifactsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/museums/${museumId}`),
          axios.get(`http://localhost:5000/api/museums/${museumId}/artifacts`)
        ]);
        
        setMuseum(museumResponse.data);
        setArtifacts(artifactsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch museum data. Please try again later.');
        setLoading(false);
      }
    };

    fetchMuseumData();
  }, [museumId]);

  if (loading) {
    return (
      <div className="museum-loading">
        <div className="loading-spinner">Loading museum collection...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="museum-error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="museum-page">
      <div className="museum-header">
        <h1>{museum.name}</h1>
        <p className="museum-subtitle">{museum.location}</p>
        <p className="museum-description">{museum.description}</p>
      </div>
      
      <div className="artifacts-grid">
        {artifacts.map((artifact) => (
          <div key={artifact._id} className="artifact-card">
            <div className="artifact-image">
              <img src={artifact.imageUrl} alt={artifact.name} />
            </div>
            <div className="artifact-info">
              <h2>{artifact.name}</h2>
              <p className="artifact-period">{artifact.period}</p>
              <p className="artifact-description">{artifact.description}</p>
              <div className="artifact-details">
                <span>Origin: {artifact.origin}</span>
                <span>Age: {artifact.age}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MuseumPage;