import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMuseums } from '../hooks/useMuseums';
import { useArtifacts } from '../hooks/useArtifacts';
import MuseumCard from '../components/cards/MuseumCard';
import ArtifactCard from '../components/cards/ArtifactCard';
import SearchBar from '../components/forms/SearchBar';
import Spinner from '../components/ui/Spinner';
import '../styles/home.css';

function Home() {
  const navigate = useNavigate();
  const { data: museums, isLoading: museumsLoading } = useMuseums({ limit: 6 });
  const { data: artifacts, isLoading: artifactsLoading } = useArtifacts({ limit: 6 });

  // Services now unwrap the API envelope and always return { items, total, page, pages }
  const museumList   = museums?.items   ?? [];
  const artifactList = artifacts?.items ?? [];

  return (
    <div className="landing-page">
      {/* ── Hero (parallax preserved via home.css background-attachment: fixed) ── */}
      <div className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Virtual Museum Guide</h1>
          <p className="hero-subtitle">Explore the world's finest museums from anywhere</p>
          <p className="hero-description">
            Embark on a journey through time and culture with our virtual museum guide.
            Discover masterpieces, artifacts, and historical treasures from renowned museums worldwide.
          </p>
          <SearchBar
            placeholder="Search museums & artifacts…"
            className="hero-search"
          />
          <button className="hero-button" onClick={() => navigate('/museums')}>
            <span>Start Your Journey</span>
          </button>
        </div>
      </div>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <div className="features-container">
        <h2 className="features-title">Why Choose Virtual Museum Guide?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-globe feature-icon" />
            <h3 className="feature-title">World-Class Museums</h3>
            <p className="feature-description">Access to prestigious museums from around the globe</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-vr-cardboard feature-icon" />
            <h3 className="feature-title">Virtual Experience</h3>
            <p className="feature-description">Immersive digital tours of museum collections</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-info-circle feature-icon" />
            <h3 className="feature-title">Detailed Information</h3>
            <p className="feature-description">In-depth details about artifacts and exhibitions</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-clock feature-icon" />
            <h3 className="feature-title">24/7 Access</h3>
            <p className="feature-description">Visit museums anytime, from anywhere</p>
          </div>
        </div>
      </div>

      {/* ── Featured Museums ──────────────────────────────────────────────── */}
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Featured Museums</h2>
          <button className="home-section-more" onClick={() => navigate('/museums')}>
            View All <i className="fas fa-arrow-right" />
          </button>
        </div>
        {museumsLoading ? (
          <Spinner />
        ) : (
          <div className="museums-grid">
            {museumList.slice(0, 6).map((m) => (
              <MuseumCard key={m._id} museum={m} />
            ))}
          </div>
        )}
      </section>

      {/* ── Featured Artifacts ────────────────────────────────────────────── */}
      <section className="home-section home-section--alt">
        <div className="home-section-header">
          <h2 className="home-section-title">Discover Artifacts</h2>
          <button className="home-section-more" onClick={() => navigate('/artifacts')}>
            View All <i className="fas fa-arrow-right" />
          </button>
        </div>
        {artifactsLoading ? (
          <Spinner />
        ) : (
          <div className="artifacts-grid">
            {artifactList.slice(0, 6).map((a) => (
              <ArtifactCard key={a._id} artifact={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
