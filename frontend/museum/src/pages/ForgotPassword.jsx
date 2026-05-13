import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

function ForgotPassword() {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await forgotPassword(email.trim());
    if (!result?.error) setSent(true);
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card--success">
          <i className="fas fa-envelope-open-text auth-success-icon" aria-hidden="true" />
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a
            password reset link. It expires in 1 hour.
          </p>
          <Link to="/login" className="auth-submit-btn" style={{ marginTop: '1.5rem', display: 'block', textAlign: 'center' }}>
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Forgot password</h1>
        <p className="auth-subtitle">
          Enter your email and we&apos;ll send a reset link.
        </p>

        {error && (
          <div className="auth-error" role="alert">{error}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading || !email.trim()}>
            {isLoading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
