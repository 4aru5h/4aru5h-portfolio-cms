/**
 * Centralised, validated server configuration.
 *
 * All secrets and environment-specific values are read from process.env
 * (populated from the repository-root `.env` file in development, or from the
 * hosting platform's environment-variable settings in production).
 * Nothing in this file should ever contain a real credential.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ROOT_DIR = path.join(__dirname, '..');
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

function resolveFromRoot(value, fallback) {
  if (!value) return fallback;
  return path.isAbsolute(value) ? value : path.join(ROOT_DIR, value);
}

function parseOrigins(value) {
  const localDevOrigins = (!isProduction) ? [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000'
  ] : [];
  const configured = (value || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return Array.from(new Set([...localDevOrigins, ...configured]));
}

function parseTrustProxy(value) {
  if (value === undefined || value === '') return isProduction ? 1 : false;
  if (value === 'true') return true;
  if (value === 'false') return false;
  const asNumber = Number(value);
  return Number.isInteger(asNumber) ? asNumber : value;
}

const databasePath = resolveFromRoot(
  process.env.DATABASE_PATH,
  path.join(ROOT_DIR, 'database', 'portfolio.db')
);

const config = {
  rootDir: ROOT_DIR,
  env: NODE_ENV,
  isProduction,
  isTest,
  port: Number(process.env.PORT) || 5000,
  sessionSecret: process.env.SESSION_SECRET || '',
  sessionMaxAgeMs: (Number(process.env.SESSION_MAX_AGE_HOURS) || 24) * 60 * 60 * 1000,
  allowedOrigins: parseOrigins(process.env.CLIENT_URL),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  databasePath,
  // Sessions live next to the main database so a single persistent volume covers both.
  sessionDir: resolveFromRoot(process.env.SESSION_DB_DIR, path.dirname(databasePath)),
  clientDistDir: path.join(ROOT_DIR, 'client', 'dist'),
  serveClient: process.env.SERVE_CLIENT
    ? process.env.SERVE_CLIENT === 'true'
    : isProduction,
  loginRateLimit: {
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || (isProduction ? 5 : 60),
  },
  apiRateLimit: {
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.API_RATE_LIMIT_MAX) || 600,
  },
};

const PLACEHOLDER_SECRETS = new Set([
  'change-this-to-a-random-string-at-least-32-chars',
  'replace-with-a-long-random-string',
]);

/**
 * Throws a descriptive error if the configuration is unsafe to run with.
 * Messages never include secret values.
 */
function validateConfig(cfg = config) {
  const problems = [];
  if (!cfg.sessionSecret) {
    problems.push('SESSION_SECRET is not set. Copy .env.example to .env and generate a random value.');
  } else if (cfg.isProduction && (cfg.sessionSecret.length < 32 || PLACEHOLDER_SECRETS.has(cfg.sessionSecret))) {
    problems.push('SESSION_SECRET must be a unique random string of at least 32 characters in production.');
  }
  if (problems.length) {
    const error = new Error(`Invalid server configuration:\n - ${problems.join('\n - ')}`);
    error.code = 'CONFIG_INVALID';
    throw error;
  }
  return cfg;
}

module.exports = { config, validateConfig };
