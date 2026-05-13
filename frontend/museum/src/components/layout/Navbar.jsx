import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedSearch } from '../../hooks/useSearch';
import { useAdminTrigger } from '../../hooks/useAdminTrigger';
import '../../styles/Navbar.css';

// Human-readable labels for every role returned by the backend
const ROLE_LABEL = {
  'super-admin': 'Super Admin',
  admin:         'Admin',
  moderator:     'Moderator',
  user:          'Member',
};

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin, isModerator } = useAuth();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const { searchTerm, setSearchTerm } = useDebouncedSearch('');
  const { logoClickHandler } = useAdminTrigger();
  const dropdownRef = useRef(null);

  // Compact navbar after scrolling 60px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking anywhere outside it
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setSearchTerm('');
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const closeMenu     = ()  => setMenuOpen(false);
  const closeDropdown = ()  => setDropdownOpen(false);

  // Only the first word of the name fits in the navbar button
  const displayName = user?.name ? user.name.split(' ')[0] : 'Account';
  // Staff = admin or moderator — gets highlighted styling
  const isStaff = isAdmin || isModerator;

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      {/* ── Brand ──────────────────────────────────────────────── */}
      <div className="nav-brand" onClick={(e) => { logoClickHandler(); navigate('/'); }}>
        Museum Tour
      </div>

      {/* ── Desktop nav links ──────────────────────────────────── */}
      <ul className="nav-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/museums">Museums</NavLink></li>
        <li><NavLink to="/artifacts">Artifacts</NavLink></li>
        <li><NavLink to="/search">Search</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
        <li><NavLink to="/contact">Contact</NavLink></li>
      </ul>

      {/* ── Search + Auth (right side) ─────────────────────────── */}
      <div className="nav-actions">
        <form className="nav-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            className="nav-search-input"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Quick search"
          />
          <button type="submit" className="nav-search-btn" aria-label="Submit search">
            <i className="fas fa-search" />
          </button>
        </form>

        {isAuthenticated ? (
          /* ── User dropdown trigger ──────────────────────────── */
          <div className="nav-user" ref={dropdownRef}>
            <button
              className={`nav-user-btn${isStaff ? ' nav-user-btn--staff' : ''}`}
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              {/* Initials avatar */}
              <span className={`nav-avatar${isStaff ? ' nav-avatar--staff' : ''}`}
                aria-hidden="true">
                {displayName[0]?.toUpperCase()}
              </span>
              <span className="nav-user-display-name">{displayName}</span>
              {/* Role badge — only shown for staff */}
              {isStaff && (
                <span className="nav-role-badge">{ROLE_LABEL[user?.role] ?? 'Staff'}</span>
              )}
              <span className="nav-chevron" aria-hidden="true">▾</span>
            </button>

            {/* ── Dropdown menu ─────────────────────────────────── */}
            {dropdownOpen && (
              <div className="nav-dropdown" role="menu" aria-label="User menu">
                {/* Account summary header */}
                <div className="nav-dropdown-header">
                  <span className="nav-dropdown-fullname">{user?.name}</span>
                  <span className="nav-dropdown-email">{user?.email}</span>
                  <span className={`nav-dropdown-role${isStaff ? ' is-staff' : ''}`}>
                    {ROLE_LABEL[user?.role] ?? 'Member'}
                  </span>
                </div>

                <div className="nav-dropdown-divider" />

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="nav-dropdown-item nav-dropdown-item--admin"
                    onClick={closeDropdown}
                    role="menuitem"
                  >
                    <i className="fas fa-cogs" aria-hidden="true" />
                    Admin Panel
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="nav-dropdown-item"
                  onClick={closeDropdown}
                  role="menuitem"
                >
                  <i className="fas fa-user" aria-hidden="true" />
                  My Profile
                </Link>

                <div className="nav-dropdown-divider" />

                <button
                  className="nav-dropdown-item nav-dropdown-item--logout"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <i className="fas fa-sign-out-alt" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Guest: login / register buttons ─────────────────── */
          <div className="nav-auth-links">
            <Link to="/login"    className="nav-login-btn">Login</Link>
            <Link to="/register" className="nav-register-btn">Register</Link>
          </div>
        )}
      </div>

      {/* ── Mobile hamburger ───────────────────────────────────── */}
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      {/* ── Mobile drawer ──────────────────────────────────────── */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          <NavLink to="/"         end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/museums"      onClick={closeMenu}>Museums</NavLink>
          <NavLink to="/artifacts"    onClick={closeMenu}>Artifacts</NavLink>
          <NavLink to="/search"       onClick={closeMenu}>Search</NavLink>
          <NavLink to="/about"        onClick={closeMenu}>About</NavLink>
          <NavLink to="/contact"      onClick={closeMenu}>Contact</NavLink>

          {isAuthenticated ? (
            <>
              {/* Show full name + role for logged-in users */}
              <div className="nav-mobile-user-info">
                <span className="nav-mobile-user-name">{user?.name}</span>
                <span className={`nav-mobile-role-badge${isStaff ? ' is-staff' : ''}`}>
                  {ROLE_LABEL[user?.role] ?? 'Member'}
                </span>
              </div>

              {isAdmin && (
                <NavLink to="/admin" onClick={closeMenu}>
                  Admin Panel
                </NavLink>
              )}

              <NavLink to="/profile" onClick={closeMenu}>
                My Profile
              </NavLink>

              <button
                className="nav-mobile-logout"
                onClick={() => { handleLogout(); closeMenu(); }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login"    onClick={closeMenu}>Login</NavLink>
              <NavLink to="/register" onClick={closeMenu}>Register</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
