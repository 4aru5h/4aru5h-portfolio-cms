const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

// Public: get all content (both dictionary & raw list)
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const content = await db.all('SELECT * FROM site_content ORDER BY section ASC, display_order ASC');
    
    const dictionary = {};
    const grouped = {};

    content.forEach((item) => {
      dictionary[item.content_key] = item.value;
      if (!grouped[item.section]) {
        grouped[item.section] = [];
      }
      grouped[item.section].push(item);
    });
    
    res.json({ data: { dictionary, grouped, items: content } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Public: get single content by key
router.get('/:key', async (req, res) => {
  try {
    const db = getDb();
    const item = await db.get('SELECT * FROM site_content WHERE content_key = ?', [req.params.key]);
    if (!item) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json({ data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: update content value
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { value, label } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    const db = getDb();
    if (label !== undefined) {
      await db.run('UPDATE site_content SET value = ?, label = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [value, label, req.params.id]);
    } else {
      await db.run('UPDATE site_content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [value, req.params.id]);
    }
    res.json({ data: { message: 'Content updated successfully' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: create new content entry
router.post('/', requireAuth, async (req, res) => {
  try {
    const { section, content_key, label, value, content_type } = req.body;
    if (!section || !content_key || !label || value === undefined) {
      return res.status(400).json({ error: 'Section, content_key, label, and value are required' });
    }
    const db = getDb();
    const result = await db.run(
      'INSERT INTO site_content (section, content_key, label, value, content_type) VALUES (?, ?, ?, ?, ?)',
      [section, content_key, label, value, content_type || 'text']
    );
    res.json({ data: { id: result.lastID, message: 'Content created successfully' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: delete content
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM site_content WHERE id = ?', [req.params.id]);
    res.json({ data: { message: 'Content deleted successfully' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
