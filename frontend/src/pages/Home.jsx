import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Virtual Museum Guide</h1>
          <p className="hero-subtitle">Explore the world's finest museums from anywhere</p>
          <p className="hero-description">
            Embark on a journey through time and culture with our virtual museum guide.
            Discover masterpieces, artifacts, and historical treasures from renowned museums worldwide.
          </p>
          <button 
            className="hero-button"
            onClick={() => navigate('/museums')}
          >
            <span>Start Your Journey</span>
          </button>
        </div>
      </div>

      <div className="features-container">
        <h2 className="features-title">Why Choose Virtual Museum Guide?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-globe feature-icon"></i>
            <h3 className="feature-title">World-Class Museums</h3>
            <p className="feature-description">Access to prestigious museums from around the globe</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-vr-cardboard feature-icon"></i>
            <h3 className="feature-title">Virtual Experience</h3>
            <p className="feature-description">Immersive digital tours of museum collections</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-info-circle feature-icon"></i>
            <h3 className="feature-title">Detailed Information</h3>
            <p className="feature-description">In-depth details about artifacts and exhibitions</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-clock feature-icon"></i>
            <h3 className="feature-title">24/7 Access</h3>
            <p className="feature-description">Visit museums anytime, from anywhere</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
