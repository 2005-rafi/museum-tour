import React from 'react';
import { Outlet, Link } from 'react-router-dom';

/**
 * Minimal layout for auth pages (login / register / forgot-password).
 * No Navbar or Footer – just a centered card on a warm background.
 */
function AuthLayout() {
  return (
    <div className="auth-layout">
      <Link to="/" className="auth-brand">
        Museum Tour
      </Link>
      <main className="auth-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;
