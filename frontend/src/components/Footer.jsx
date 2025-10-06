import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
          <p className="footer-text">Discover the world with us. We provide unforgettable travel experiences 
             and showcase the best destinations around the globe.</p>
          <div className="footer-social">
            <a href="#" className="social-link"><i className="fab fa-facebook"></i></a>
            <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
            <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-link"><i className="fab fa-youtube"></i></a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#home" className="footer-link">Home</a></li>
            <li><a href="#destinations" className="footer-link">Destinations</a></li>
            <li><a href="#packages" className="footer-link">Tour Packages</a></li>
            <li><a href="#blog" className="footer-link">Travel Blog</a></li>
            <li><a href="#contact" className="footer-link">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Popular Destinations</h3>
          <ul className="footer-links">
            <li><a href="#paris" className="footer-link">Paris</a></li>
            <li><a href="#tokyo" className="footer-link">Tokyo</a></li>
            <li><a href="#bali" className="footer-link">Bali</a></li>
            <li><a href="#rome" className="footer-link">Rome</a></li>
            <li><a href="#maldives" className="footer-link">Maldives</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Newsletter</h3>
          <p className="footer-text">Subscribe to our newsletter for travel updates and special offers.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" className="newsletter-input" />
            <button type="submit" className="newsletter-button">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright-text">&copy; 2024 Your Travel Company. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;