const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const { globalLimiter } = require('./middleware/rateLimiter');
const requestContext = require('./middleware/requestContext');
const { optionalAuth } = require('./middleware/auth');
const { getRedisAvailable } = require('./config/redis');
const corsOptions = require('./config/cors');
const embeddingService = require('./modules/search/embedding.service');
const { getAllBreakerStats } = require('./middleware/circuitBreaker');

const userRoutes = require('./modules/users/user.routes');
const museumRoutes = require('./modules/museums/museum.routes');
const artifactRoutes = require('./modules/artifacts/artifact.routes');
const engagementRoutes = require('./modules/engagement/engagement.routes');
const searchRoutes = require('./modules/search/search.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const messageRoutes = require('./modules/messages/message.routes');

const app = express();

// Trust first proxy (Nginx, Heroku, etc.) for accurate IP in rate limiters
app.set('trust proxy', 1);

// ── CORS — must be registered before any other middleware ────────────────────
// Pre-flight OPTIONS requests must be answered before rate limiting and auth so
// that browsers receive the CORS headers without hitting a 429 or 401.
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Request context (traceId + response timing)
app.use(requestContext);

// Security headers
app.use(helmet());

// Global rate limiting (per-endpoint limiters are in route files)
app.use(globalLimiter);

// Gzip compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/museums', museumRoutes);
app.use('/api/artifacts', artifactRoutes);
app.use('/api', engagementRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', messageRoutes);

// Health check — public callers get a minimal response;
// detailed service info is only included for authenticated admin requests.
app.get('/health', optionalAuth, (req, res) => {
  const dbState = mongoose.connection.readyState;
  const payload = {
    status: dbState === 1 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
  };

  // Only expose internals to admin users (token checked opportunistically)
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super-admin')) {
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    payload.uptime = process.uptime();
    payload.services = {
      database: dbStates[dbState] || 'unknown',
      redis: getRedisAvailable() ? 'connected' : 'unavailable',
      embeddingIndex: embeddingService.isReady ? 'ready' : 'not-ready',
    };
    payload.circuitBreakers = getAllBreakerStats();
  }

  res.json(payload);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
