import React, { useEffect, useState, useCallback, useRef } from 'react';

const TOAST_DURATION = 5000;

/**
 * Lightweight toast container with undo support.
 *
 * Usage:
 *   const { showToast, ToastContainer } = useToast();
 *   showToast({ message: 'Item deleted.', onUndo: () => restore(id) });
 *   return <><YourUI /><ToastContainer /></>;
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ message, onUndo, duration = TOAST_DURATION }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, onUndo }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Cleanup all timers on unmount
  useEffect(() => {
    const refs = timers.current;
    return () => Object.values(refs).forEach(clearTimeout);
  }, []);

  const handleUndo = useCallback((toast) => {
    dismiss(toast.id);
    toast.onUndo?.();
  }, [dismiss]);

  const ToastContainer = useCallback(() => (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toast-message">{t.message}</span>
          {t.onUndo && (
            <button
              className="toast-undo"
              onClick={() => handleUndo(t)}
            >
              Undo
            </button>
          )}
          <button
            className="toast-close"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  ), [toasts, dismiss, handleUndo]);

  return { showToast, dismiss, ToastContainer };
}
