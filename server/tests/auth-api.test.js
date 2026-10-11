const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Setup test environment
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'a-super-secret-test-session-key-at-least-32-chars-long';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.DATABASE_PATH = path.join(__dirname, 'test-portfolio.db');

// Clean up any old test DB
if (fs.existsSync(process.env.DATABASE_PATH)) {
  fs.unlinkSync(process.env.DATABASE_PATH);
}

const { initializeDatabase, closeDb, getDb } = require('../database/schema');
const { verifyCredentials, hashPassword, ensureAdminUser, resetAdminPassword } = require('../auth/admin');
const app = require('../index');

let server;
let baseUrl;

test.before(async () => {
  initializeDatabase();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(() => {
  if (server) server.close();
  closeDb();
  if (fs.existsSync(process.env.DATABASE_PATH)) {
    try { fs.unlinkSync(process.env.DATABASE_PATH); } catch (e) {}
  }
});

test('Password hashing & validation', async () => {
  const hash = await hashPassword('AM5landing742762');
  assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'));

  const env = { username: 'testadmin', password: 'AM5landing742762' };
  // Clean users table first for isolated test
  getDb().run('DELETE FROM admin_users');
  const res = await ensureAdminUser({ env });
  assert.equal(res.created, true);

  const verified = await verifyCredentials('testadmin', 'AM5landing742762');
  assert.ok(verified);
  assert.equal(verified.username, 'testadmin');

  const wrong = await verifyCredentials('testadmin', 'WrongPassword123');
  assert.equal(wrong, null);

  const nonexistent = await verifyCredentials('nobody', 'AM5landing742762');
  assert.equal(nonexistent, null);
});

test('Public API endpoints are functional', async () => {
  const res = await fetch(`${baseUrl}/api/content`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.data);

  const healthRes = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthRes.status, 200);
});

test('Protected routes reject unauthenticated requests', async () => {
  const res = await fetch(`${baseUrl}/api/dashboard/stats`);
  assert.equal(res.status, 401);

  const postRes = await fetch(`${baseUrl}/api/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Hacking', category_id: 1 })
  });
  assert.equal(postRes.status, 401);
});

test('CSRF token provisioning & login session lifecycle', async () => {
  // Ensure testadmin exists
  const env = { username: 'testadmin', password: 'AM5landing742762' };
  await resetAdminPassword({ env });

  // 1. Fetch CSRF token
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  assert.equal(csrfRes.status, 200);
  const { csrfToken } = await csrfRes.json();
  assert.ok(csrfToken);

  // In Node 18+ fetch, getSetCookie() returns all Set-Cookie headers
  const initialCookies = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [csrfRes.headers.get('set-cookie')];
  const initialSid = initialCookies.find(c => c && c.startsWith('connect.sid='));
  assert.ok(initialSid, 'Session cookie must be provided');

  // 2. Perform Login with the initial password requirement
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': initialSid.split(';')[0]
    },
    body: JSON.stringify({ username: 'testadmin', password: 'AM5landing742762' })
  });
  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.equal(loginData.data.username, 'testadmin');
  assert.ok(loginData.csrfToken);

  // Extract regenerated session cookie
  const loginCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get('set-cookie')];
  const newSid = loginCookies.find(c => c && c.startsWith('connect.sid=')) || initialSid;
  const authCookieHeader = newSid.split(';')[0];

  // 3. Authenticated query to /api/auth/me
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { 'Cookie': authCookieHeader }
  });
  assert.equal(meRes.status, 200);
  const meData = await meRes.json();
  assert.equal(meData.data.username, 'testadmin');

  // 4. Protected state-changing operation without CSRF should fail with 403
  const badStateRes = await fetch(`${baseUrl}/api/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookieHeader
    },
    body: JSON.stringify({ name: 'Stealth', category_id: 1 })
  });
  assert.equal(badStateRes.status, 403);

  // 5. Protected state-changing operation with CSRF succeeds
  const catRes = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookieHeader,
      'X-CSRF-Token': loginData.csrfToken
    },
    body: JSON.stringify({ name: 'Security & Tools' })
  });
  assert.equal(catRes.status, 200);
  const catData = await catRes.json();
  const categoryId = catData.data.id;

  const goodStateRes = await fetch(`${baseUrl}/api/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookieHeader,
      'X-CSRF-Token': loginData.csrfToken
    },
    body: JSON.stringify({ name: 'Stealth', category_id: categoryId })
  });
  assert.equal(goodStateRes.status, 200);

  // 6. Logout
  const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Cookie': authCookieHeader,
      'X-CSRF-Token': loginData.csrfToken
    }
  });
  assert.equal(logoutRes.status, 200);

  // 7. Verify session is invalidated
  const postLogoutRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { 'Cookie': authCookieHeader }
  });
  assert.equal(postLogoutRes.status, 401);
});
