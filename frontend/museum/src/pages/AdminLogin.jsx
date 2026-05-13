import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

function AdminLogin() {
  const navigate = useNavigate();
  const {
    adminLogin,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    clearError,
    adminAccessMode,
  } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', adminSecretKey: '' });

  // Guard: if no admin access mode and not already an admin, redirect away
  useEffect(() => {
    if (!adminAccessMode && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [adminAccessMode, isAdmin, navigate]);

  // On successful admin login, go to admin dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await adminLogin(form.email.trim(), form.password, form.adminSecretKey);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-admin-badge">🔒 Administrator Access</div>
        <h1 className="auth-title">Admin Sign In</h1>
        <p className="auth-subtitle">Authorized personnel only</p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="adminSecretKey">Admin Secret Key</label>
            <input
              id="adminSecretKey"
              type="password"
              name="adminSecretKey"
              autoComplete="off"
              value={form.adminSecretKey}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Enter admin secret key"
            />
          </div>

          <button type="submit" className="auth-submit-btn auth-submit-btn--admin" disabled={isLoading}>
            {isLoading ? 'Authenticating…' : 'Sign In as Admin'}
          </button>
        </form>

        <p className="auth-switch">
          Need an admin account?{' '}
          <Link to="/admin/register">Register as Admin</Link>
        </p>

        <p className="auth-switch">
          <Link to="/">← Back to site</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
