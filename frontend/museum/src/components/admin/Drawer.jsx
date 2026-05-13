import React, { useEffect } from 'react';

export default function Drawer({ isOpen, title, onClose, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="admin-drawer-overlay" onClick={onClose} />
      <aside className="admin-drawer is-open">
        <div className="admin-drawer-header">
          <h2 className="admin-drawer-title">{title}</h2>
          <button className="admin-drawer-close" onClick={onClose}>
            <span className="material-icons-outlined">close</span>
          </button>
        </div>
        <div className="admin-drawer-body">
          {children}
        </div>
      </aside>
    </>
  );
}
