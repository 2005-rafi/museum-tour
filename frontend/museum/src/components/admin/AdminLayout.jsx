import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { AdminProvider } from '../../context/AdminContext';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadMessageCount } from '../../hooks/useAdmin';

const NAV_ITEMS = [
  { to: '/admin',           label: 'Dashboard',  icon: 'dashboard', end: true },
  { to: '/admin/museums',   label: 'Museums',    icon: 'museum' },
  { to: '/admin/artifacts', label: 'Artifacts',  icon: 'inventory_2' },
  { to: '/admin/users',     label: 'Users',      icon: 'group' },
  { to: '/admin/comments',  label: 'Comments',   icon: 'forum' },
  { to: '/admin/likes',     label: 'Likes',      icon: 'favorite' },
  { to: '/admin/inbox',     label: 'Inbox',      icon: 'inbox',     badge: true },
];

// Human-readable role label matching the backend enum
const ROLE_LABEL = {
  'super-admin': 'Super Admin',
  admin:         'Admin',
  moderator:     'Moderator',
  user:          'Member',
};

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout, setAdminAccessMode } = useAuth();
  const { data: unreadCount = 0 } = useUnreadMessageCount();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setAdminAccessMode(false);
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Mobile hamburger */}
      <button
        className="admin-hamburger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle admin sidebar"
      >
        <span className="material-icons-round">menu</span>
      </button>

      {/* Sidebar overlay (mobile) */}
      {open && (
        <div className="admin-overlay" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${open ? ' is-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="material-icons-round admin-brand-icon">admin_panel_settings</span>
          <span className="admin-brand-name">Admin Panel</span>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ to, label, icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' is-active' : ''}`
              }
            >
              <span className="material-icons-outlined admin-nav-icon" aria-hidden="true">{icon}</span>
              <span className="admin-nav-label">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="admin-nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Sidebar footer: logged-in admin info + actions ──── */}
        <div className="admin-sidebar-footer">
          {user && (
            <div className="admin-sidebar-user">
              <span className="admin-sidebar-avatar" aria-hidden="true">
                {user.name?.[0]?.toUpperCase() ?? '?'}
              </span>
              <div className="admin-sidebar-user-info">
                <span className="admin-sidebar-user-name">{user.name}</span>
                <span className="admin-sidebar-user-role">
                  {ROLE_LABEL[user.role] ?? user.role}
                </span>
              </div>
            </div>
          )}

          <div className="admin-sidebar-actions">
            <Link to="/" className="admin-sidebar-back">
              <span className="material-icons-outlined" aria-hidden="true">arrow_back</span>
              Back to Site
            </Link>
            <button className="admin-sidebar-logout" onClick={handleLogout}>
              <span className="material-icons-outlined" aria-hidden="true">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Page content — wrapped with AdminProvider so polling only runs here */}
      <div className="admin-content">
        <AdminProvider>
          <Outlet />
        </AdminProvider>
      </div>
    </div>
  );
}
