import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function AdminRegister() {
  const navigate = useNavigate();
  const {
    adminRegister,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    clearError,
    adminAccessMode,
  } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecretKey: '',
  });
  const [localError, setLocalError] = useState('');

  // Guard: if no admin access mode and not already an admin, redirect away
  useEffect(() => {
    if (!adminAccessMode && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [adminAccessMode, isAdmin, navigate]);

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
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    if (!name) {
      setLocalError('Name is required.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (!PASSWORD_PATTERN.test(form.password)) {
      setLocalError(
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a digit, and a special character.'
      );
      return;
    }

    if (!form.adminSecretKey.trim()) {
      setLocalError('Admin secret key is required.');
      return;
    }

    await adminRegister({
      name,
      email: form.email.trim(),
      password: form.password,
      adminSecretKey: form.adminSecretKey,
    });
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-admin-badge">🔒 Administrator Access</div>
        <h1 className="auth-title">Create Admin Account</h1>
        <p className="auth-subtitle">Register a new administrator</p>

        {displayError && (
          <div className="auth-error" role="alert">
            {displayError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={8}
            />
            <p className="auth-field-hint">
              Min 8 chars · uppercase · lowercase · digit · special character
            </p>
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
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
            {isLoading ? 'Creating account…' : 'Create Admin Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an admin account?{' '}
          <Link to="/admin/login">Sign in</Link>
        </p>

        <p className="auth-switch">
          <Link to="/">← Back to site</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminRegister;
