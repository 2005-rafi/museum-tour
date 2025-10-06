import React, { useState, useEffect } from 'react';
import useScrollTo from '../hooks/useScrollTo';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollTo = useScrollTo();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="top-bar">
        <div className="contact-info">
          <span className="contact-item"><i className="fas fa-phone"></i> +1 234 567 890</span>
          <span className="contact-item"><i className="fas fa-envelope"></i> info@toursite.com</span>
        </div>
        <div className="social-links">
          <a href="#" className="social-link"><i className="fab fa-facebook"></i></a>
          <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
          <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
        </div>
      </div>
      
      <nav className="main-nav">
        <div className="logo">
          <img src="https://images.squarespace-cdn.com/content/v1/54d706f6e4b0b788c0d9f5c7/1513893511553-3NMUAUVUS3Y3B38BRD6K/ke17ZwdGBToddI8pDm48kJUlZr2Ql5GtSKWrQpjur5t7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z5QPOohDIaIeljMHgDF5CVlOqpeNLcJ80NK65_fV7S1UYapt4KGntwbjD1IFBRUBU6SRwXJogFYPCjZ6mtBiWtU3WUfc_ZsVm9Mi1E6FasEnQ/M.png" alt="Tour Logo" className="logo-image" />
        </div>
        
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#home" className="nav-link" onClick={scrollTo('home')}>Home</a>
          <a href="#destinations" className="nav-link" onClick={scrollTo('destinations')}>Destinations</a>
          <a href="#packages" className="nav-link" onClick={scrollTo('packages')}>Tour Packages</a>
          <a href="#blog" className="nav-link" onClick={scrollTo('blog')}>Blog</a>
          <a href="#about" className="nav-link" onClick={scrollTo('about')}>About Us</a>
          <a href="#contact" className="nav-link cta-button" onClick={scrollTo('contact')}>Contact Us</a>
        </div>
      </nav>
    </header>
  );
};

export default Header;