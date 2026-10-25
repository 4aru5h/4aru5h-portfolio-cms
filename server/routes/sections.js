const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

// Public: get visible sections
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const sections = await db.all('SELECT * FROM sections ORDER BY display_order ASC, id ASC');
    res.json({ data: sections });
  } catch (err) {
    console.error('Error in GET /sections:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: toggle visibility or update
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { is_visible } = req.body;
    if (is_visible === undefined) {
      return res.status(400).json({ error: 'is_visible is required' });
    }
    const db = getDb();
    const result = await db.run('UPDATE sections SET is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [is_visible ? 1 : 0, req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json({ data: { message: 'Section visibility updated successfully' } });
  } catch (err) {
    console.error('Error in PUT /sections/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
