import React from 'react';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-state">
      <i className="fas fa-exclamation-circle error-state-icon" />
      <p className="error-state-message">{message || 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <button className="error-state-retry" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
