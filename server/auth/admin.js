/**
 * Administrator credential management.
 *
 * - Passwords are only ever stored as salted bcrypt hashes (cost 12).
 * - The initial password is supplied through the ADMIN_PASSWORD environment variable and is
 *   converted to a hash at first start-up (or via `npm run setup` / `npm run admin:reset`).
 * - Plaintext passwords are never logged, returned, or compared directly.
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database/schema');

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 12;
// bcrypt only considers the first 72 bytes; cap input to bound hashing cost.
const MAX_PASSWORD_LENGTH = 128;
const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,64}$/;

let dummyHashPromise = null;
function getDummyHash() {
  // Used to keep login timing similar whether or not the username exists.
  if (!dummyHashPromise) {
    dummyHashPromise = bcrypt.hash(crypto.randomBytes(32).toString('hex'), BCRYPT_COST);
  }
  return dummyHashPromise;
}

function validatePasswordPolicy(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

function validateUsername(username) {
  if (typeof username !== 'string' || !USERNAME_PATTERN.test(username)) {
    return 'Username must be 3-64 characters (letters, numbers, ".", "_" or "-").';
  }
  return null;
}

function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_COST);
}

function needsRehash(hash) {
  try {
    return bcrypt.getRounds(hash) < BCRYPT_COST;
  } catch {
    return true;
  }
}

/**
 * Verifies credentials. Always performs exactly one bcrypt comparison.
 * @returns {Promise<{id:number, username:string} | null>}
 */
async function verifyCredentials(username, password) {
  if (typeof username !== 'string' || typeof password !== 'string') return null;
  if (!username || !password || username.length > 64 || password.length > MAX_PASSWORD_LENGTH) {
    await bcrypt.compare('invalid', await getDummyHash());
    return null;
  }

  const db = getDb();
  const user = await db.get('SELECT id, username, password_hash FROM admin_users WHERE username = ?', [username]);
  const hash = user ? user.password_hash : await getDummyHash();
  const valid = await bcrypt.compare(password, hash);
  if (!user || !valid) return null;

  if (needsRehash(user.password_hash)) {
    // Transparently upgrade older hashes (e.g. cost 10 from the previous setup script).
    const upgraded = await hashPassword(password);
    await db.run('UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [upgraded, user.id]);
  }
  return { id: user.id, username: user.username };
}

function readAdminEnv() {
  return {
    username: (process.env.ADMIN_USERNAME || '').trim(),
    password: process.env.ADMIN_PASSWORD || '',
  };
}

/**
 * Creates the first administrator from ADMIN_USERNAME / ADMIN_PASSWORD if no admin exists.
 * Never modifies an existing account.
 */
async function ensureAdminUser({ env = readAdminEnv() } = {}) {
  const db = getDb();
  const userCount = await db.get('SELECT COUNT(*) AS count FROM admin_users');
  const count = userCount ? userCount.count : 0;
  if (count > 0) return { created: false, reason: 'exists' };

  if (!env.username || !env.password) {
    return { created: false, reason: 'missing-env' };
  }
  const problem = validateUsername(env.username) || validatePasswordPolicy(env.password);
  if (problem) {
    const error = new Error(`Cannot create admin account: ${problem}`);
    error.code = 'ADMIN_POLICY';
    throw error;
  }

  const hash = await hashPassword(env.password);
  await db.run('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [env.username, hash]);
  return { created: true, username: env.username };
}

/**
 * Sets the password of ADMIN_USERNAME to ADMIN_PASSWORD (creating the account if absent).
 * Used for initial password configuration and password rotation.
 */
async function resetAdminPassword({ env = readAdminEnv() } = {}) {
  if (!env.username || !env.password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must both be set in the environment (.env).');
  }
  const problem = validateUsername(env.username) || validatePasswordPolicy(env.password);
  if (problem) throw new Error(problem);

  const db = getDb();
  const hash = await hashPassword(env.password);
  const existing = await db.get('SELECT id FROM admin_users WHERE username = ?', [env.username]);
  if (existing) {
    await db.run('UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hash, existing.id]);
    return { action: 'updated', username: env.username };
  }
  db.run('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [env.username, hash]);
  return { action: 'created', username: env.username };
}

module.exports = {
  BCRYPT_COST,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  hashPassword,
  needsRehash,
  verifyCredentials,
  ensureAdminUser,
  resetAdminPassword,
  validatePasswordPolicy,
};
