const NodeCache = require('node-cache');
const { getRedisClient, getRedisAvailable } = require('../config/redis');

// In-memory fallback cache
const inMemoryCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const cacheMiddleware = (keyPrefix, ttl = 3600) => {
  return async (req, res, next) => {
    const key = `${keyPrefix}:${req.originalUrl}`;

    try {
      // Try Redis first
      if (getRedisAvailable()) {
        const redis = getRedisClient();
        const cached = await redis.get(key);
        if (cached) {
          return res.json(JSON.parse(cached));
        }
      } else {
        // Fallback to in-memory
        const cached = inMemoryCache.get(key);
        if (cached) {
          return res.json(cached);
        }
      }
    } catch {
      // Redis error — try in-memory fallback
      const cached = inMemoryCache.get(key);
      if (cached) {
        return res.json(cached);
      }
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        try {
          // Serialize once — this strips Mongoose document internals ($__, getters,
          // setters, schema metadata) that crash NodeCache's clone() and also
          // produces the string Redis needs, so we avoid double-serialization.
          const serialized = JSON.stringify(body);

          if (getRedisAvailable()) {
            const redis = getRedisClient();
            redis.setex(key, ttl, serialized).catch(() => {});
          }

          // Store a plain JS object in NodeCache (not a Mongoose document).
          // NodeCache.set() internally deep-clones via the `clone` library.
          // Cloning raw Mongoose docs triggers getters/setters on subdocuments
          // (e.g. `location`) which access `this.$__` — but the clone doesn't
          // have Mongoose internals, so it throws:
          //   "Cannot read properties of undefined (reading '_defaultToObjectOptions')"
          // JSON round-trip guarantees a plain object with no Mongoose metadata.
          inMemoryCache.set(key, JSON.parse(serialized), ttl);
        } catch {
          // Serialization or caching failed — don't crash the response
        }
      }
      return originalJson(body);
    };
    next();
  };
};

const invalidatePattern = async (prefix) => {
  // Invalidate in-memory
  const keys = inMemoryCache.keys();
  const matching = keys.filter(k => k.startsWith(prefix));
  if (matching.length > 0) {
    inMemoryCache.del(matching);
  }

  // Invalidate in Redis
  if (getRedisAvailable()) {
    try {
      const redis = getRedisClient();
      const redisKeys = await redis.keys(`${prefix}*`);
      if (redisKeys.length > 0) {
        await redis.del(...redisKeys);
      }
    } catch {
      // Redis invalidation failed, in-memory was still cleared
    }
  }
};

module.exports = { cacheMiddleware, invalidatePattern };
