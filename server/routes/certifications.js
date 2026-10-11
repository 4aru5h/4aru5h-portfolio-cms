const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  try {
    const db = getDb();
    res.json({ data: db.all('SELECT * FROM certifications WHERE is_visible = 1 ORDER BY display_order ASC, id ASC') });
  } catch (err) {
    console.error('Error in GET /certifications:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/all', requireAuth, (req, res) => {
  try {
    const db = getDb();
    res.json({ data: db.all('SELECT * FROM certifications ORDER BY display_order ASC, id ASC') });
  } catch (err) {
    console.error('Error in GET /certifications/all:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', requireAuth, (req, res) => {
  try {
    const { title, issuer, description, badge_text, icon_color, is_visible, display_order } = req.body;
    if (!title || !issuer) return res.status(400).json({ error: 'Title and issuer are required' });
    const db = getDb();
    const result = db.run(
      'INSERT INTO certifications (title, issuer, description, badge_text, icon_color, is_visible, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        title.trim(),
        issuer.trim(),
        description || '',
        badge_text || 'Verified',
        icon_color || 'var(--accent-cyan)',
        is_visible === false || is_visible === 0 ? 0 : 1,
        parseInt(display_order, 10) || 0
      ]
    );
    res.json({ data: { id: result.lastID, message: 'Certification created successfully' } });
  } catch (err) {
    console.error('Error in POST /certifications:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const existing = db.get('SELECT * FROM certifications WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    const { title, issuer, description, badge_text, icon_color, is_visible, display_order } = req.body;
    db.run(
      'UPDATE certifications SET title = ?, issuer = ?, description = ?, badge_text = ?, icon_color = ?, is_visible = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        title !== undefined ? title.trim() : existing.title,
        issuer !== undefined ? issuer.trim() : existing.issuer,
        description !== undefined ? description : existing.description,
        badge_text !== undefined ? badge_text : existing.badge_text,
        icon_color !== undefined ? icon_color : existing.icon_color,
        is_visible !== undefined ? (is_visible ? 1 : 0) : existing.is_visible,
        display_order !== undefined ? (parseInt(display_order, 10) || 0) : existing.display_order,
        req.params.id
      ]
    );
    res.json({ data: { message: 'Certification updated successfully' } });
  } catch (err) {
    console.error('Error in PUT /certifications/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const result = db.run('DELETE FROM certifications WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Certification not found' });
    }
    res.json({ data: { message: 'Certification deleted successfully' } });
  } catch (err) {
    console.error('Error in DELETE /certifications/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
