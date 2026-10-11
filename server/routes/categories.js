const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

// Public: get visible categories with skills
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const categories = db.all('SELECT * FROM skill_categories WHERE is_visible = 1 ORDER BY display_order ASC, id ASC');
    const skills = db.all('SELECT * FROM skills WHERE is_visible = 1 ORDER BY display_order ASC, id ASC');

    const categoriesWithSkills = categories.map(cat => ({
      ...cat,
      skills: skills.filter(skill => skill.category_id === cat.id)
    }));

    res.json({ data: categoriesWithSkills });
  } catch (err) {
    console.error('Error in GET /categories:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: get all categories
router.get('/all', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const categories = db.all('SELECT * FROM skill_categories ORDER BY display_order ASC, id ASC');
    res.json({ data: categories });
  } catch (err) {
    console.error('Error in GET /categories/all:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: create category
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, icon_color, is_visible, display_order } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const db = getDb();
    const result = db.run(
      'INSERT INTO skill_categories (name, icon_color, is_visible, display_order) VALUES (?, ?, ?, ?)',
      [
        name.trim(),
        icon_color || 'var(--accent-cyan)',
        is_visible === false || is_visible === 0 ? 0 : 1,
        parseInt(display_order, 10) || 0
      ]
    );
    res.json({ data: { id: result.lastID, message: 'Category created successfully' } });
  } catch (err) {
    console.error('Error in POST /categories:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: update category
router.put('/:id', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const existing = db.get('SELECT * FROM skill_categories WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { name, icon_color, is_visible, display_order } = req.body;
    const newName = name !== undefined ? name.trim() : existing.name;
    if (!newName) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    db.run(
      'UPDATE skill_categories SET name = ?, icon_color = ?, is_visible = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        newName,
        icon_color !== undefined ? icon_color : existing.icon_color,
        is_visible !== undefined ? (is_visible ? 1 : 0) : existing.is_visible,
        display_order !== undefined ? (parseInt(display_order, 10) || 0) : existing.display_order,
        req.params.id
      ]
    );
    res.json({ data: { message: 'Category updated successfully' } });
  } catch (err) {
    console.error('Error in PUT /categories/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: delete category
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const existing = db.get('SELECT * FROM skill_categories WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete associated skills and category inside a transaction
    db.transaction(() => {
      db.run('DELETE FROM skills WHERE category_id = ?', [req.params.id]);
      db.run('DELETE FROM skill_categories WHERE id = ?', [req.params.id]);
    })();

    res.json({ data: { message: 'Category and associated skills deleted successfully' } });
  } catch (err) {
    console.error('Error in DELETE /categories/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
