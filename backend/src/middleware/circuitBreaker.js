/**
 * Circuit Breaker Pattern Implementation
 * Uses opossum to wrap async operations with failure detection,
 * automatic fallback, and self-healing recovery.
 */

const CircuitBreaker = require('opossum');
const logger = require('./logger');

const DEFAULT_OPTIONS = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
  volumeThreshold: 5,
  rollingCountTimeout: 10000,
};

const breakers = new Map();

const createCircuitBreaker = (name, asyncFn, options = {}) => {
  if (breakers.has(name)) return breakers.get(name);

  const opts = { ...DEFAULT_OPTIONS, ...options, name };
  const breaker = new CircuitBreaker(asyncFn, opts);

  breaker.on('open', () => {
    logger.warn({ message: `Circuit breaker [${name}] OPENED — requests will be short-circuited`, circuit: name });
  });

  breaker.on('halfOpen', () => {
    logger.info({ message: `Circuit breaker [${name}] HALF-OPEN — testing recovery`, circuit: name });
  });

  breaker.on('close', () => {
    logger.info({ message: `Circuit breaker [${name}] CLOSED — normal operation resumed`, circuit: name });
  });

  breaker.on('fallback', () => {
    logger.warn({ message: `Circuit breaker [${name}] fallback triggered`, circuit: name });
  });

  breakers.set(name, breaker);
  return breaker;
};

const getCircuitBreaker = (name) => breakers.get(name);

const getAllBreakerStats = () => {
  const stats = {};
  for (const [name, breaker] of breakers) {
    const s = breaker.toJSON();
    stats[name] = {
      state: breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed',
      success: s.stats?.successes || 0,
      failures: s.stats?.failures || 0,
      fallbacks: s.stats?.fallbacks || 0,
      timeouts: s.stats?.timeouts || 0,
    };
  }
  return stats;
};

/**
 * Wrap an async function with circuit breaker protection.
 * Returns a new function that calls breaker.fire(...args).
 */
const withCircuitBreaker = (name, asyncFn, fallbackFn = null, options = {}) => {
  const breaker = createCircuitBreaker(name, asyncFn, options);
  if (fallbackFn) {
    breaker.fallback(fallbackFn);
  }
  return (...args) => breaker.fire(...args);
};

module.exports = {
  createCircuitBreaker,
  getCircuitBreaker,
  getAllBreakerStats,
  withCircuitBreaker,
};
