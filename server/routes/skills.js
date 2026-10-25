const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

// Public: get visible skills with categories
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const skills = await db.all(`
      SELECT s.*, c.name as category_name 
      FROM skills s 
      LEFT JOIN skill_categories c ON s.category_id = c.id 
      WHERE s.is_visible = 1 AND (c.is_visible = 1 OR c.id IS NULL)
      ORDER BY c.display_order ASC, s.display_order ASC, s.id ASC
    `);
    res.json({ data: skills });
  } catch (err) {
    console.error('Error in GET /skills:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: get all skills including hidden
router.get('/all', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const skills = await db.all(`
      SELECT s.*, c.name as category_name 
      FROM skills s 
      LEFT JOIN skill_categories c ON s.category_id = c.id 
      ORDER BY c.display_order ASC, s.display_order ASC, s.id ASC
    `);
    res.json({ data: skills });
  } catch (err) {
    console.error('Error in GET /skills/all:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: create skill
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, category_id, icon_url, proficiency, is_visible, display_order } = req.body;
    if (!name || !category_id) {
      return res.status(400).json({ error: 'Name and category_id are required' });
    }
    const db = getDb();
    const result = await db.run(
      'INSERT INTO skills (name, category_id, icon_url, proficiency, is_visible, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [
        name.trim(),
        category_id,
        icon_url || '',
        proficiency || '',
        is_visible === false || is_visible === 0 ? 0 : 1,
        parseInt(display_order, 10) || 0
      ]
    );
    res.json({ data: { id: result.lastID, message: 'Skill created successfully' } });
  } catch (err) {
    console.error('Error in POST /skills:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: update skill
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const existing = await db.get('SELECT * FROM skills WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const { name, category_id, icon_url, proficiency, is_visible, display_order } = req.body;
    const newName = name !== undefined ? name.trim() : existing.name;
    if (!newName) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    await db.run(
      'UPDATE skills SET name = ?, category_id = ?, icon_url = ?, proficiency = ?, is_visible = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        newName,
        category_id !== undefined ? category_id : existing.category_id,
        icon_url !== undefined ? icon_url : existing.icon_url,
        proficiency !== undefined ? proficiency : existing.proficiency,
        is_visible !== undefined ? (is_visible ? 1 : 0) : existing.is_visible,
        display_order !== undefined ? (parseInt(display_order, 10) || 0) : existing.display_order,
        req.params.id
      ]
    );
    res.json({ data: { message: 'Skill updated successfully' } });
  } catch (err) {
    console.error('Error in PUT /skills/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: delete skill
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.run('DELETE FROM skills WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    res.json({ data: { message: 'Skill deleted successfully' } });
  } catch (err) {
    console.error('Error in DELETE /skills/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
