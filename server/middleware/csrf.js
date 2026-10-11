const crypto = require('crypto');
const { config, isAllowedOrigin } = require('../config');

/**
 * Standard CSRF protection using synchronizer tokens & Origin verification.
 * State-changing methods (POST, PUT, DELETE, PATCH) require either:
 * - A valid X-CSRF-Token header matching req.session.csrfToken, or
 * - An Origin/Referer matching allowed origins if unauthenticated.
 */

function generateCsrfToken() {
  return crypto.randomBytes(24).toString('hex');
}

function ensureCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  return req.session.csrfToken;
}

function csrfProtection(req, res, next) {
  // Ensure token exists on session
  if (req.session) {
    ensureCsrfToken(req);
  }

  // Safe HTTP methods don't need CSRF token check
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Check Origin / Referer for strict same-origin/whitelisted origin verification
  const origin = req.get('origin');
  if (origin) {
    const isAllowed = isAllowedOrigin(origin, req);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Invalid or untrusted origin' });
    }
  }

  // For state-changing requests, if user is authenticated via session, require valid CSRF token
  if (req.session && req.session.userId) {
    const clientToken = req.get('x-csrf-token') || req.body?._csrf;
    if (!clientToken || clientToken !== req.session.csrfToken) {
      return res.status(403).json({ error: 'Invalid or missing CSRF token' });
    }
  }

  next();
}

module.exports = {
  csrfProtection,
  ensureCsrfToken
};
