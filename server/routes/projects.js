const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  // Prevent javascript: or vbscript: or data: dangerous protocols
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return '';
  }
  return trimmed;
}

// Public: get visible projects
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const projects = await db.all('SELECT * FROM projects WHERE is_visible = 1 ORDER BY display_order ASC, id DESC');
    const parsed = projects.map(p => ({
      ...p,
      technologies: p.technologies ? (typeof p.technologies === 'string' ? JSON.parse(p.technologies) : p.technologies) : []
    }));
    res.json({ data: parsed });
  } catch (err) {
    console.error('Error in GET /projects:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: get all
router.get('/all', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const projects = await db.all('SELECT * FROM projects ORDER BY display_order ASC, id DESC');
    const parsed = projects.map(p => ({
      ...p,
      technologies: p.technologies ? (typeof p.technologies === 'string' ? JSON.parse(p.technologies) : p.technologies) : []
    }));
    res.json({ data: parsed });
  } catch (err) {
    console.error('Error in GET /projects/all:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: create
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, image_url, live_url, github_url, technologies, is_visible, display_order } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const techArray = Array.isArray(technologies)
      ? technologies
      : (typeof technologies === 'string' ? technologies.split(',').map(t => t.trim()).filter(Boolean) : []);
    const techJson = JSON.stringify(techArray);

    const db = getDb();
    const result = await db.run(
      'INSERT INTO projects (title, description, image_url, live_url, github_url, technologies, is_visible, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title.trim(),
        description || '',
        sanitizeUrl(image_url),
        sanitizeUrl(live_url),
        sanitizeUrl(github_url),
        techJson,
        is_visible === false || is_visible === 0 ? 0 : 1,
        parseInt(display_order, 10) || 0
      ]
    );
    res.json({ data: { id: result.lastID, message: 'Project created successfully' } });
  } catch (err) {
    console.error('Error in POST /projects:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: update
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const existing = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { title, description, image_url, live_url, github_url, technologies, is_visible, display_order } = req.body;

    const newTitle = title !== undefined ? title.trim() : existing.title;
    if (!newTitle) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    let techJson = existing.technologies;
    if (technologies !== undefined) {
      const techArray = Array.isArray(technologies)
        ? technologies
        : (typeof technologies === 'string' ? technologies.split(',').map(t => t.trim()).filter(Boolean) : []);
      techJson = JSON.stringify(techArray);
    }

    await db.run(
      'UPDATE projects SET title = ?, description = ?, image_url = ?, live_url = ?, github_url = ?, technologies = ?, is_visible = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        newTitle,
        description !== undefined ? description : existing.description,
        image_url !== undefined ? sanitizeUrl(image_url) : existing.image_url,
        live_url !== undefined ? sanitizeUrl(live_url) : existing.live_url,
        github_url !== undefined ? sanitizeUrl(github_url) : existing.github_url,
        techJson,
        is_visible !== undefined ? (is_visible ? 1 : 0) : existing.is_visible,
        display_order !== undefined ? (parseInt(display_order, 10) || 0) : existing.display_order,
        req.params.id
      ]
    );
    res.json({ data: { message: 'Project updated successfully' } });
  } catch (err) {
    console.error('Error in PUT /projects/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: delete
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ data: { message: 'Project deleted successfully' } });
  } catch (err) {
    console.error('Error in DELETE /projects/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
