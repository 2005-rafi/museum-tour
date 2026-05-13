import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/header-footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Museum Tour</h3>
          <p className="footer-text">
            Discover world-class museums and explore thousands of historical artifacts
            from the comfort of your home.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Facebook">
              <i className="fab fa-facebook" />
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <i className="fab fa-instagram" />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <i className="fab fa-twitter" />
            </a>
            <a href="#" className="social-link" aria-label="YouTube">
              <i className="fab fa-youtube" />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Explore</h3>
          <ul className="footer-links">
            <li><Link to="/" className="footer-link">Home</Link></li>
            <li><Link to="/museums" className="footer-link">Museums</Link></li>
            <li><Link to="/artifacts" className="footer-link">Artifacts</Link></li>
            <li><Link to="/search" className="footer-link">Search</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Company</h3>
          <ul className="footer-links">
            <li><Link to="/about" className="footer-link">About Us</Link></li>
            <li><Link to="/contact" className="footer-link">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Newsletter</h3>
          <p className="footer-text">
            Subscribe for museum updates and new artifact discoveries.
          </p>
          <form
            className="newsletter-form"
            onSubmit={(e) => { e.preventDefault(); }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright-text">
          &copy; {new Date().getFullYear()} Museum Tour. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
