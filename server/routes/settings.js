const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

// Public: get all settings
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const settings = await db.all('SELECT * FROM site_settings ORDER BY id ASC');
    const dictionary = {};
    settings.forEach(s => {
      dictionary[s.setting_key] = s.setting_value;
    });
    res.json({ data: settings, dictionary });
  } catch (err) {
    console.error('Error in GET /settings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: update setting
router.put('/:key', requireAuth, async (req, res) => {
  try {
    const value = req.body.setting_value ?? req.body.value;
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const trimmedValue = typeof value === 'string' ? value.trim() : String(value);

    // Prevent javascript: injection into URLs
    if (req.params.key.endsWith('_url') && /^(javascript|vbscript|data):/i.test(trimmedValue)) {
      return res.status(400).json({ error: 'Invalid URL scheme' });
    }

    const db = getDb();
    const existing = await db.get('SELECT * FROM site_settings WHERE setting_key = ?', [req.params.key]);

    if (existing) {
      await db.run(
        'UPDATE site_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
        [trimmedValue, req.params.key]
      );
    } else {
      await db.run(
        'INSERT INTO site_settings (setting_key, setting_value, label) VALUES (?, ?, ?)',
        [req.params.key, trimmedValue, req.params.key]
      );
    }

    res.json({ data: { message: 'Setting updated successfully' } });
  } catch (err) {
    console.error('Error in PUT /settings/:key:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
