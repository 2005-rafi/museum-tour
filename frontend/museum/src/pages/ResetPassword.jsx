import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, isLoading, error, clearError } = useAuth();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');
  const [done, setDone] = useState(false);

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
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }
    const result = await resetPassword(token, form.password, form.confirmPassword);
    if (!result?.error) setDone(true);
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card--success">
          <i className="fas fa-check-circle auth-success-icon" aria-hidden="true" />
          <h1 className="auth-title">Password updated</h1>
          <p className="auth-subtitle">Your password has been reset successfully.</p>
          <button
            className="auth-submit-btn"
            style={{ marginTop: '1.5rem' }}
            onClick={() => navigate('/login', { replace: true })}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">Enter your new password below.</p>

        {displayError && (
          <div className="auth-error" role="alert">{displayError}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              disabled={isLoading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm new password</label>
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
            {isLoading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
