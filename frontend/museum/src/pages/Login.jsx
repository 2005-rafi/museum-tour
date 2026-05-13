import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isAuthenticated, isAdmin, isLoading, error, clearError } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });

  // Role-aware redirect after a successful login:
  //   1. If the user was heading somewhere specific before being redirected here → honour that.
  //   2. Admins (and super-admins) default to the Admin Panel.
  //   3. Everyone else defaults to the home page.
  useEffect(() => {
    if (!isAuthenticated) return;
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
    } else if (isAdmin) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location.state]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form.email.trim(), form.password);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

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

          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
