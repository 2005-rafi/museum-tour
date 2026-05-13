import React from 'react';

/**
 * Accessible confirmation dialog.
 *
 * Props:
 *   isOpen     – boolean, whether to render the modal
 *   title      – dialog heading
 *   message    – body text
 *   onConfirm  – called when user clicks the destructive action
 *   onCancel   – called when user cancels
 *   isPending  – disable buttons while mutation is in-flight
 *   confirmLabel – label for the confirm button (default: 'Delete')
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isPending,
  confirmLabel = 'Delete',
}) {
  if (!isOpen) return null;

  return (
    <div
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="confirm-modal">
        <h3 id="confirm-title" className="confirm-title">
          {title ?? 'Confirm Action'}
        </h3>
        <p className="confirm-message">{message ?? 'Are you sure you want to proceed?'}</p>
        <div className="confirm-actions">
          <button
            className="admin-btn"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="admin-btn admin-btn--danger"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Removing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
