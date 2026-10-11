const express = require('express');
const router = express.Router();
const { verifyCredentials } = require('../auth/admin');
const { requireAuth } = require('../middleware/auth');
const { ensureCsrfToken } = require('../middleware/csrf');
const { getDb } = require('../database/schema');

// GET /api/auth/csrf - Returns current CSRF token (and initializes session if needed)
router.get('/csrf', (req, res) => {
  const token = ensureCsrfToken(req);
  res.json({ csrfToken: token });
});

// POST /api/auth/login - Rate limited & timing equalized
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await verifyCredentials(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Regenerate session upon successful login to prevent Session Fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      const csrfToken = ensureCsrfToken(req);

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json({
          data: {
            id: user.id,
            username: user.username
          },
          csrfToken
        });
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ data: { message: 'Logged out successfully' } });
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const user = db.get('SELECT id, username FROM admin_users WHERE id = ?', [req.session.userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const csrfToken = ensureCsrfToken(req);
    res.json({ data: user, csrfToken });
  } catch (err) {
    console.error('Auth /me error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
