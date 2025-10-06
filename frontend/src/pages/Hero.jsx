import React from 'react';
import useScrollTo from '../hooks/useScrollTo';

const Hero = () => {
  const scrollTo = useScrollTo();

  return (
    <section id="home" className="hero-section">
      <div className="hero-background">
        <img 
          src="/images/museum-facade.jpg"
          alt="Majestic Museum Facade" 
          className="hero-image parallax-bg"
        />
        <div className="hero-overlay gradient-overlay"></div>
      </div>

      <div className="hero-content content-wrapper">
        <h1 className="hero-title animate-fade-in">
          Explore the Wonders of History
        </h1>
        <p className="hero-subtitle animate-slide-up">
          Where Art, Culture and Heritage Come Alive
        </p>
        
        <div className="hero-cta button-group animate-fade-in">
          <button 
            className="cta-button primary-btn hover-effect"
            onClick={scrollTo('destinations')}
          >
            Plan Your Visit
          </button>
          <button 
            className="cta-button secondary-btn hover-effect"
            onClick={scrollTo('packages')}
          >
            View Exhibitions
          </button>
        </div>

        <div className="hero-features feature-grid animate-slide-up">
          <div className="feature-item hover-lift">
            <i className="fas fa-clock feature-icon pulse"></i>
            <span className="feature-text">Open Daily 9AM - 6PM</span>
          </div>
          <div className="feature-item hover-lift">
            <i className="fas fa-ticket-alt feature-icon pulse"></i>
            <span className="feature-text">Book Tickets Online</span>
          </div>
          <div className="feature-item hover-lift">
            <i className="fas fa-map-marker-alt feature-icon pulse"></i>
            <span className="feature-text">Guided Tours Available</span>
          </div>
        </div>
      </div>

      <div className="scroll-indicator animate-bounce">
        <i className="fas fa-chevron-down"></i>
      </div>
    </section>
  );
};

export default Hero;