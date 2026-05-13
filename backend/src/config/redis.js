/**
 * Redis Client Configuration
 * Provides Redis connectivity with graceful fallback to in-memory when unavailable.
 */

const Redis = require('ioredis');
const logger = require('../middleware/logger');

let redisClient = null;
let isRedisAvailable = false;

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URI;
  if (!redisUrl) {
    logger.info('Redis URI not configured — using in-memory cache fallback');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        // Only retry 2 times max (faster failure)
        if (times > 2) {
          return null;
        }
        return Math.min(times * 100, 500); // Shorter backoff
      },
      lazyConnect: true,
      connectTimeout: 2000, // Reduced from 5000ms
    });

    // Wrap connect in a timeout — fail fast if Redis unreachable
    const connectionPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);
    
    isRedisAvailable = true;
    logger.info('Redis connected successfully');

    // Event handlers for runtime monitoring
    redisClient.on('error', (err) => {
      logger.warn({ message: 'Redis error event', error: err.message });
      isRedisAvailable = false;
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });

    redisClient.on('ready', () => {
      isRedisAvailable = true;
      logger.info('Redis ready after reconnection');
    });

    redisClient.on('close', () => {
      isRedisAvailable = false;
      logger.info('Redis connection closed');
    });

    return redisClient;
  } catch (err) {
    logger.warn({
      message: 'Redis unavailable — using in-memory cache only',
      error: err.message,
    });
    isRedisAvailable = false;
    redisClient = null;
    return null;
  }
};

const getRedisClient = () => redisClient;
const getRedisAvailable = () => isRedisAvailable;

const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      // Ignore disconnect errors
    }
    redisClient = null;
    isRedisAvailable = false;
  }
};

module.exports = { connectRedis, getRedisClient, getRedisAvailable, disconnectRedis };
