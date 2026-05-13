import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

// Must mirror the backend passwordPattern in user.validation.js
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

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

    // ── Client-side validation (mirrors backend rules exactly) ──────────────
    const firstName = form.firstName.trim();
    const lastName  = form.lastName.trim();

    if (!firstName) {
      setLocalError('First name is required.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (!PASSWORD_PATTERN.test(form.password)) {
      setLocalError(
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a digit, and a special character (e.g. !@#$%).'
      );
      return;
    }

    // ── Compose the single `name` field the backend expects ─────────────────
    const name = lastName ? `${firstName} ${lastName}` : firstName;

    await register({
      name,
      email: form.email.trim(),
      password: form.password,
    });
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join the Museum Tour community</p>

        {displayError && (
          <div className="auth-error" role="alert">
            {displayError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field-row">
            <div className="auth-field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                autoComplete="given-name"
                value={form.firstName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
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
            <label htmlFor="confirmPassword">Confirm password</label>
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

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
