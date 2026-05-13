const mongoose = require('mongoose');
const logger = require('../middleware/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);

    // Connection event monitoring
    mongoose.connection.on('error', (err) => {
      logger.error({ message: 'MongoDB connection error', error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Query performance monitoring in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName, methodName, ...args) => {
        try {
          // Only serialize the query filter (first arg), not result documents.
          // Use a safe replacer to avoid crashing on Mongoose internal objects.
          const query = args[0] || {};
          const safeQuery = typeof query === 'object' && query !== null && typeof query.toObject === 'function'
            ? query.toObject()
            : query;
          logger.debug({
            message: 'Mongoose query',
            collection: collectionName,
            method: methodName,
            query: JSON.stringify(safeQuery, (_, v) =>
              typeof v === 'object' && v !== null && v._bsontype ? `[${v._bsontype}]` : v
            ).substring(0, 200),
          });
        } catch {
          // Never let debug logging crash a request
          logger.debug({
            message: 'Mongoose query',
            collection: collectionName,
            method: methodName,
            query: '[unserializable]',
          });
        }
      });
    }
  } catch (error) {
    logger.error({ message: 'Database connection failed', error: error.message });
    process.exit(1);
  }
};

module.exports = connectDB;
