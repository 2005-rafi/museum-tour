/**
 * cors.js — Centralised CORS configuration
 *
 * Design principles applied
 * ─────────────────────────
 * Single Responsibility  – all CORS logic lives here; app.js only calls it.
 * Open/Closed            – extend the whitelist via env vars, no code change.
 * Defense-in-Depth       – production rejects requests that carry no Origin,
 *                          blocking server-to-server CSRF attempts from
 *                          sandboxed iframes (Origin: null).
 * Least Privilege        – only explicitly whitelisted origins are reflected;
 *                          `Access-Control-Allow-Origin: *` is never used,
 *                          which is required when credentials: true.
 * Fail-Secure            – an unknown origin produces a clear callback error,
 *                          not a silent pass.
 * Observability          – blocked origins are logged server-side; the HTTP
 *                          response deliberately omits which origins are valid.
 *
 * Environment variables
 * ─────────────────────
 * ALLOWED_ORIGINS   Comma-separated URL list (primary, preferred).
 *                   e.g. http://localhost:3001,https://museumtour.com
 * CORS_ORIGIN       Legacy single-value fallback; honoured when
 *                   ALLOWED_ORIGINS is absent.
 * NODE_ENV          'production' tightens null-origin handling.
 */

'use strict';

/**
 * Parse the whitelist once at module load time so the Set is built
 * before the first request arrives — O(1) lookup per request.
 *
 * @returns {Set<string>}
 */
function buildWhitelist() {
  const raw =
    process.env.ALLOWED_ORIGINS ||
    process.env.CORS_ORIGIN ||
    'http://localhost:5173';

  return new Set(
    raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  );
}

const whitelist    = buildWhitelist();
const isProduction = process.env.NODE_ENV === 'production';

/**
 * CORS origin validator passed to the `cors` package's `origin` option.
 *
 * @param {string|undefined} requestOrigin
 * @param {Function} callback  Node-style (err, allow) callback
 */
function originValidator(requestOrigin, callback) {
  // ── No Origin header ────────────────────────────────────────────────────
  // Same-origin browser requests, curl, Postman, and mobile apps don't send
  // an Origin header.  In development we allow these; in production we block
  // them to prevent CSRF via sandboxed iframes (where Origin is 'null').
  if (!requestOrigin) {
    if (isProduction) {
      console.warn('[CORS] Blocked: no Origin header (production mode)');
      return callback(new Error('CORS: Origin required'));
    }
    return callback(null, true);
  }

  // ── Whitelisted origin ───────────────────────────────────────────────────
  if (whitelist.has(requestOrigin)) {
    // Reflect the exact requesting origin — required when credentials: true.
    // Never pass `true` here; that would set `Allow-Origin: *` which browsers
    // refuse when a request carries cookies or Auth headers.
    return callback(null, requestOrigin);
  }

  // ── Rejected origin ──────────────────────────────────────────────────────
  // Log server-side for debugging; the HTTP response body must NOT reveal
  // which origins are valid (information leakage).
  console.warn(`[CORS] Blocked unlisted origin: ${requestOrigin}`);
  return callback(new Error('CORS: Origin not allowed'));
}

/**
 * Ready-to-use options object for `cors(corsOptions)`.
 *
 * maxAge caches the pre-flight result in the browser for 24 h, eliminating
 * the extra OPTIONS round-trip on repeat requests to the same endpoint.
 */
const corsOptions = {
  origin:         originValidator,
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],   // lets the client read the trace ID
  maxAge:         86_400,             // pre-flight cached for 24 hours
};

module.exports = corsOptions;
