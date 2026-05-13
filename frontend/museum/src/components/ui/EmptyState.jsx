import React from 'react';

function EmptyState({ icon = 'fas fa-box-open', title = 'Nothing here yet', message = '', action }) {
  return (
    <div className="empty-state">
      <i className={`${icon} empty-state-icon`} />
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action && (
        <button className="empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
