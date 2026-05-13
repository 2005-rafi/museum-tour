# 🏛️ MuseumTour

A full-stack museum exploration platform built with a MERN-style architecture. MuseumTour lets visitors discover museums and artifacts, search curated content, engage through likes and comments, and gives administrators the tools to manage content, users, messages, and analytics.

This is a production-oriented application — not a simple CRUD demo. It includes authentication, role-based access control, caching, rate limiting, soft deletes, request tracing, and a multi-signal search pipeline.

---

## ✨ Features

- Browse and explore museums and artifacts
- Multi-signal search with ranked results across the catalog
- Detailed museum and artifact pages
- Like artifacts and post comments
- Personal profile and activity history
- Public contact form
- Secured admin dashboard — moderation, content management, and analytics

---

## 🏗️ Architecture

### Backend

Built with **Node.js**, **Express**, **MongoDB**, and **Mongoose** in a clean layered structure:

| Layer | Responsibility |
|---|---|
| Routes | API endpoints with validation, auth, caching, and rate limit middleware |
| Controllers | HTTP input/output handling |
| Services | Business rules, token logic, and resilience patterns |
| Repositories | Isolated database queries |
| Models | MongoDB schemas and indexes |

Cross-cutting concerns handled by middleware: JWT authentication, role checks, Joi validation, Redis/in-memory caching, request tracing, structured logging, global error handling, and circuit breakers.

### Frontend

Built with **React**, **Vite**, **React Router**, **Axios**, and **React Query**.

- React Router manages public, protected, and admin routes
- React Query handles server-state caching, retries, and invalidation
- Context providers centralize auth, museum/artifact filters, and analytics state
- Service modules wrap API calls, keeping UI code clean
- Lazy loading reduces the initial bundle size

---

## 🔑 Key Technical Concepts

### Authentication & Authorization

Users authenticate with short-lived **JWT access tokens** paired with rotated **refresh tokens** stored server-side for revocation support. A token blacklist handles logout invalidation, and login attempts are audited. Role-based and permission-based guards protect admin and moderation endpoints.

### Search & Ranking

Search goes beyond simple keyword matching. The backend runs a **multi-signal ranking pipeline** that combines:

- MongoDB text search
- TF-IDF similarity scoring
- Fuzzy string matching
- An in-memory embedding-style index

This produces significantly more relevant results for museum and artifact discovery.

### Caching

Read-heavy endpoints use a two-tier cache: **Redis** when available, with automatic **in-memory fallback** when Redis is unavailable. Write operations invalidate matching cache keys so users always see fresh content.

### Reliability & Observability

The app is built to be diagnosable in production:

- Unique request trace IDs on every request
- Response-time logging
- Structured Winston logs
- Optional Sentry error reporting
- Circuit breakers on selected operations for graceful degradation

### Data Integrity

Engagement actions (likes and comments) run inside **MongoDB sessions** so counters stay consistent with their underlying records. Museums, artifacts, comments, and likes use Mongoose schemas with indexes and **soft-delete support**.

---

## 🗺️ Application Routes

### Frontend

| Type | Path |
|---|---|
| Public | `/`, `/museums`, `/museums/:id`, `/artifacts`, `/artifacts/:id`, `/search`, `/about`, `/contact` |
| User | `/login`, `/register`, `/forgot-password`, `/reset-password/:token`, `/profile` |
| Admin | `/admin`, `/admin/museums`, `/admin/artifacts`, `/admin/artifacts/new`, `/admin/artifacts/:id/edit`, `/admin/users`, `/admin/comments`, `/admin/likes`, `/admin/inbox`, `/admin/login`, `/admin/register` |

### Backend API

| Route Group | Purpose |
|---|---|
| `/api/users` | Authentication, profile, admin user management |
| `/api/museums` | Museum CRUD and search |
| `/api/artifacts` | Artifact CRUD, batch actions, and search |
| `/api/search` | Unified search across museums and artifacts |
| `/api/admin/analytics` | Admin dashboard analytics |
| `/api/messages` | Contact form submissions |
| `/api/admin/messages` | Admin inbox management |

---

## 📁 Project Structure

```text
MuseumTour/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   ├── plugins/
│   │   └── utils/
│   └── tests/
├── frontend/
│   └── museum/
│       └── src/
│           ├── app/
│           ├── components/
│           ├── context/
│           ├── hooks/
│           ├── pages/
│           ├── services/
│           ├── styles/
│           └── utils/
├── README.md
└── TECHNICAL_ANALYSIS.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or newer
- **MongoDB** — running locally or via a remote connection string
- **Redis** *(optional)* — improves caching performance; the app falls back to in-memory caching if unavailable

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file at `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/museum
JWT_SECRET=your_strong_secret_key
JWT_ACCESS_EXPIRES_IN=15m
CORS_ORIGIN=http://localhost:3001
```

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

> ℹ️ A health check endpoint is available at `http://localhost:5000/health`.

---

### 2. Frontend Setup

```bash
cd frontend/museum
npm install
```

Start the frontend:

```bash
npm run arise
```

The app will be available at `http://localhost:3001`.

> ℹ️ The frontend reads the API base URL from the `VITE_API_URL` environment variable. It defaults to `http://localhost:5000/api` if not set.

---

### 3. Docker (Optional)

The backend includes Docker and Nginx configuration for containerized deployment. Use the provided compose files when you want a proxy-backed runtime instead of running local development processes.

---

## 🎨 Styling

The frontend uses plain CSS rather than a CSS-in-JS system, keeping styles easy to reason about:

- Global reset and base styles → `src/index.css`
- Theme and color variables → `src/styles/colors.css`
- Feature styles → `home.css`, `museums.css`, `artifacts.css`, `auth.css`, `profile.css`, `search.css`, `admin.css`
- Shared layout styles for headers, footers, and shell components

---

## 📖 Documentation

- [`TECHNICAL_ANALYSIS.md`](TECHNICAL_ANALYSIS.md) — deep-dive technical analysis
- [`MuseumTour.md`](MuseumTour.md) — detailed architecture and implementation walkthrough
- [`README.md`](README.md) — this file

---

## 📄 License

This repository does not currently include a license file. Add one before public release if required.

## Developer

Mohammed Rafi H