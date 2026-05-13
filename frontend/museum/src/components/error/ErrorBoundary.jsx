import React from 'react';

// ─── Default fallback UI ──────────────────────────────────────────────────────

function DefaultFallback({ error, reset }) {
  return (
    <div className="error-boundary-page">
      <div className="error-boundary-content">
        <div className="error-boundary-icon" aria-hidden="true">⚠️</div>
        <h1 className="error-boundary-title">Something went wrong</h1>
        <p className="error-boundary-message">
          An unexpected error occurred. The team has been notified.
        </p>
        {import.meta.env.DEV && error?.message && (
          <pre className="error-boundary-details">{error.message}</pre>
        )}
        <div className="error-boundary-actions">
          <button className="error-boundary-btn" onClick={reset}>
            Try again
          </button>
          <button
            className="error-boundary-btn error-boundary-btn--secondary"
            onClick={() => { window.location.href = '/'; }}
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ErrorBoundary class ──────────────────────────────────────────────────────

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, forward to an error reporter (e.g. Sentry)
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.reset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultFallback error={this.state.error} reset={this.reset} />;
    }
    return this.props.children;
  }
}

// ─── HOC helper ───────────────────────────────────────────────────────────────

export function withErrorBoundary(Component, fallback) {
  const displayName = Component.displayName ?? Component.name ?? 'Component';

  function WrappedWithBoundary(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  }

  WrappedWithBoundary.displayName = `withErrorBoundary(${displayName})`;
  return WrappedWithBoundary;
}

export default ErrorBoundary;
