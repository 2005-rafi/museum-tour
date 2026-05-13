import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import AuthLayout from '../../components/layout/AuthLayout';
import AdminLayout from '../../components/admin/AdminLayout';
import { UserProtectedRoute } from '../../components/auth/ProtectedRoute';
import { AdminProtectedRoute } from '../../components/auth/AdminRoute';
import Spinner from '../../components/ui/Spinner';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Home           = lazy(() => import('../../pages/Home'));
const Museums        = lazy(() => import('../../pages/Museums'));
const MuseumDetail   = lazy(() => import('../../pages/MuseumDetail'));
const Artifacts      = lazy(() => import('../../pages/Artifacts'));
const ArtifactDetail = lazy(() => import('../../pages/ArtifactDetail'));
const Search         = lazy(() => import('../../pages/Search'));
const About          = lazy(() => import('../../pages/About'));
const Contact        = lazy(() => import('../../pages/Contact'));
const Login          = lazy(() => import('../../pages/Login'));
const Register       = lazy(() => import('../../pages/Register'));
const ForgotPassword = lazy(() => import('../../pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('../../pages/ResetPassword'));
const Profile        = lazy(() => import('../../pages/Profile'));
const NotFound       = lazy(() => import('../../pages/NotFound'));

// ─── Admin auth pages (lazy) ─────────────────────────────────────────────────
const AdminLogin     = lazy(() => import('../../pages/AdminLogin'));
const AdminRegister  = lazy(() => import('../../pages/AdminRegister'));

// ─── Admin pages (lazy) ───────────────────────────────────────────────────────
const AdminDashboard      = lazy(() => import('../../pages/admin/AdminDashboard'));
const MuseumManagement    = lazy(() => import('../../pages/admin/MuseumManagement'));
const ArtifactManagement  = lazy(() => import('../../pages/admin/ArtifactManagement'));
const ArtifactUpload      = lazy(() => import('../../pages/admin/ArtifactUpload'));
const ArtifactEdit        = lazy(() => import('../../pages/admin/ArtifactEdit'));
const UserManagement      = lazy(() => import('../../pages/admin/UserManagement'));const CommentManagement   = lazy(() => import('../../pages/admin/CommentManagement'));
const LikesOverview       = lazy(() => import('../../pages/admin/LikesOverview'));
const MessageInbox        = lazy(() => import('../../pages/admin/MessageInbox'));
const wrap = (element) => (
  <ErrorBoundary>
    <Suspense fallback={<Spinner fullPage />}>{element}</Suspense>
  </ErrorBoundary>
);

// ─── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    // Main layout — Navbar + Footer
    element: <Layout />,
    children: [
      { index: true,           element: wrap(<Home />) },
      { path: 'museums',       element: wrap(<Museums />) },
      { path: 'museums/:id',   element: wrap(<MuseumDetail />) },
      { path: 'artifacts',     element: wrap(<Artifacts />) },
      { path: 'artifacts/:id', element: wrap(<ArtifactDetail />) },
      { path: 'search',        element: wrap(<Search />) },
      { path: 'about',         element: wrap(<About />) },
      { path: 'contact',       element: wrap(<Contact />) },
      {
        path: 'profile',
        element: wrap(
          <UserProtectedRoute>
            <Profile />
          </UserProtectedRoute>
        ),
      },

      // ── Admin section ──────────────────────────────────────────────────────
      {
        path: 'admin',
        element: (
          <AdminProtectedRoute>
            {wrap(<AdminLayout />)}
          </AdminProtectedRoute>
        ),
        children: [
          { index: true,                      element: wrap(<AdminDashboard />) },
          { path: 'museums',                  element: wrap(<MuseumManagement />) },
          { path: 'artifacts',                element: wrap(<ArtifactManagement />) },
          { path: 'artifacts/new',            element: wrap(<ArtifactUpload />) },
          { path: 'artifacts/:id/edit',       element: wrap(<ArtifactEdit />) },
          { path: 'users',                    element: wrap(<UserManagement />) },
          { path: 'comments',                 element: wrap(<CommentManagement />) },
          { path: 'likes',                    element: wrap(<LikesOverview />) },
          { path: 'inbox',                    element: wrap(<MessageInbox />) },
        ],
      },
    ],
  },

  // Auth pages — minimal layout, no navbar/footer
  {
    element: <AuthLayout />,
    children: [
      { path: 'login',                  element: wrap(<Login />) },
      { path: 'register',               element: wrap(<Register />) },
      { path: 'forgot-password',        element: wrap(<ForgotPassword />) },
      { path: 'reset-password/:token',  element: wrap(<ResetPassword />) },
      { path: 'admin/login',            element: wrap(<AdminLogin />) },
      { path: 'admin/register',         element: wrap(<AdminRegister />) },
    ],
  },

  // Catch-all
  { path: '*', element: wrap(<NotFound />) },
]);

export default router;
