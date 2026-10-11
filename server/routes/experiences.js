const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

function serializeTags(tags) {
  if (Array.isArray(tags)) return JSON.stringify(tags);
  if (typeof tags === 'string') return JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean));
  return '[]';
}

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const experiences = db.all('SELECT * FROM experiences WHERE is_visible = 1 ORDER BY display_order ASC, id ASC');
    res.json({ data: experiences });
  } catch (err) {
    console.error('Error in GET /experiences:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/all', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const experiences = db.all('SELECT * FROM experiences ORDER BY display_order ASC, id ASC');
    res.json({ data: experiences });
  } catch (err) {
    console.error('Error in GET /experiences/all:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', requireAuth, (req, res) => {
  try {
    const { role, company, date_range, description, tags, is_visible, display_order } = req.body;
    if (!role || !company || !date_range) {
      return res.status(400).json({ error: 'Role, company, and date_range are required' });
    }

    const db = getDb();
    const result = db.run(
      'INSERT INTO experiences (role, company, date_range, description, tags, is_visible, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        role.trim(),
        company.trim(),
        date_range.trim(),
        description || '',
        serializeTags(tags),
        is_visible === false || is_visible === 0 ? 0 : 1,
        parseInt(display_order, 10) || 0
      ]
    );
    res.json({ data: { id: result.lastID, message: 'Experience created successfully' } });
  } catch (err) {
    console.error('Error in POST /experiences:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const existing = db.get('SELECT * FROM experiences WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    const { role, company, date_range, description, tags, is_visible, display_order } = req.body;
    db.run(
      'UPDATE experiences SET role = ?, company = ?, date_range = ?, description = ?, tags = ?, is_visible = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        role !== undefined ? role.trim() : existing.role,
        company !== undefined ? company.trim() : existing.company,
        date_range !== undefined ? date_range.trim() : existing.date_range,
        description !== undefined ? description : existing.description,
        tags !== undefined ? serializeTags(tags) : existing.tags,
        is_visible !== undefined ? (is_visible ? 1 : 0) : existing.is_visible,
        display_order !== undefined ? (parseInt(display_order, 10) || 0) : existing.display_order,
        req.params.id
      ]
    );
    res.json({ data: { message: 'Experience updated successfully' } });
  } catch (err) {
    console.error('Error in PUT /experiences/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const result = db.run('DELETE FROM experiences WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    res.json({ data: { message: 'Experience deleted successfully' } });
  } catch (err) {
    console.error('Error in DELETE /experiences/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
