require('dotenv').config();

// Initialize Sentry before loading application code
if (process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
}

const app = require('./app');
const connectDB = require('./config/database');
const { connectRedis, disconnectRedis } = require('./config/redis');
const embeddingService = require('./modules/search/embedding.service');
const logger = require('./middleware/logger');
const mongoose = require('mongoose');

const Museum = require('./modules/museums/museum.model');
const Artifact = require('./modules/artifacts/artifact.model');
const User = require('./modules/users/user.model');

const PORT = process.env.PORT || 5000;

const start = async () => {
  // Connect Redis (optional — gracefully falls back to in-memory)
  await connectRedis();

  // Connect to MongoDB
  await connectDB();

  // Log database state
  const [museumCount, artifactCount, userCount] = await Promise.all([
    Museum.countDocuments(),
    Artifact.countDocuments(),
    User.countDocuments(),
  ]);
  logger.info(`DB state — museums: ${museumCount}, artifacts: ${artifactCount}, users: ${userCount}`);

  // Build embedding search index
  try {
    await embeddingService.buildIndex();
  } catch (err) {
    logger.warn('Embedding index build failed — search will operate without embedding signal', { error: err.message });
  }

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      try {
        await disconnectRedis();
        await mongoose.connection.close();
        logger.info('Connections closed — exiting');
      } catch (err) {
        logger.error('Error during shutdown', { error: err.message });
      }
      process.exit(0);
    });

    // Force exit after 10s if graceful shutdown stalls
    setTimeout(() => {
      logger.error('Forced exit after timeout');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { error: reason?.message || reason });
    if (process.env.SENTRY_DSN) {
      try { require('@sentry/node').captureException(reason); } catch {}
    }
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    if (process.env.SENTRY_DSN) {
      try { require('@sentry/node').captureException(error); } catch {}
    }
    gracefulShutdown('uncaughtException');
  });
};

start();
