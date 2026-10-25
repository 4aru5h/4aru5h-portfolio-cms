const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

// Public: get visible nav items
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const navItems = await db.all('SELECT * FROM navigation_items WHERE is_visible = 1 ORDER BY display_order ASC, id ASC');
    res.json({ data: navItems });
  } catch (err) {
    console.error('Error in GET /navigation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: get all
router.get('/all', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const navItems = await db.all('SELECT * FROM navigation_items ORDER BY display_order ASC, id ASC');
    res.json({ data: navItems });
  } catch (err) {
    console.error('Error in GET /navigation/all:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: update
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const existing = await db.get('SELECT * FROM navigation_items WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Navigation item not found' });
    }

    const { label, href, is_visible, display_order } = req.body;
    const newLabel = label !== undefined ? label.trim() : existing.label;
    const newHref = href !== undefined ? href.trim() : existing.href;

    if (!newLabel || !newHref) {
      return res.status(400).json({ error: 'Label and href cannot be empty' });
    }

    // Protect against javascript: schemes
    if (/^(javascript|vbscript|data):/i.test(newHref)) {
      return res.status(400).json({ error: 'Invalid URL scheme' });
    }

    await db.run(
      'UPDATE navigation_items SET label = ?, href = ?, is_visible = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        newLabel,
        newHref,
        is_visible !== undefined ? (is_visible ? 1 : 0) : existing.is_visible,
        display_order !== undefined ? (parseInt(display_order, 10) || 0) : existing.display_order,
        req.params.id
      ]
    );
    res.json({ data: { message: 'Navigation updated successfully' } });
  } catch (err) {
    console.error('Error in PUT /navigation/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: create navigation item
router.post('/', requireAuth, async (req, res) => {
  try {
    const { label, href, is_visible, display_order } = req.body;
    if (!label || typeof label !== 'string' || !label.trim()) {
      return res.status(400).json({ error: 'Label is required' });
    }
    if (!href || typeof href !== 'string' || !href.trim()) {
      return res.status(400).json({ error: 'Href is required' });
    }
    const trimmedHref = href.trim();
    if (/^(javascript|vbscript|data):/i.test(trimmedHref)) {
      return res.status(400).json({ error: 'Invalid URL scheme' });
    }
    const db = getDb();
    const result = await db.run(
      'INSERT INTO navigation_items (label, href, is_visible, display_order) VALUES (?, ?, ?, ?)',
      [
        label.trim(),
        trimmedHref,
        is_visible === false || is_visible === 0 ? 0 : 1,
        parseInt(display_order, 10) || 0
      ]
    );
    res.json({ data: { id: result.lastID, message: 'Navigation item created successfully' } });
  } catch (err) {
    console.error('Error in POST /navigation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: delete navigation item
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const existing = await db.get('SELECT * FROM navigation_items WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Navigation item not found' });
    }
    await db.run('DELETE FROM navigation_items WHERE id = ?', [req.params.id]);
    res.json({ data: { message: 'Navigation item deleted successfully' } });
  } catch (err) {
    console.error('Error in DELETE /navigation/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
