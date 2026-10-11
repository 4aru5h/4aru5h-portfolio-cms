const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

function calculateReadingTime(text) {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Public: get published posts only
router.get('/', (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const db = getDb();
    const posts = db.all(
      'SELECT id, title, slug, excerpt, content, category, reading_time, published_at, created_at, tags FROM blog_posts WHERE status = ? ORDER BY published_at DESC LIMIT ? OFFSET ?',
      ['published', limit, offset]
    );

    const parsed = posts.map(p => {
      let tags = [];
      try {
        tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []);
      } catch (e) {
        tags = [];
      }
      return {
        ...p,
        tags
      };
    });

    const countResult = db.get('SELECT COUNT(*) as count FROM blog_posts WHERE status = ?', ['published']);

    res.json({ data: { posts: parsed, total: countResult ? countResult.count : 0 } });
  } catch (err) {
    console.error('Error in GET /blog:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Public: get single published post by slug
router.get('/post/:slug', (req, res) => {
  try {
    const db = getDb();
    const post = db.get('SELECT * FROM blog_posts WHERE slug = ? AND status = ?', [req.params.slug, 'published']);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    try {
      post.tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []);
    } catch (e) {
      post.tags = [];
    }

    res.json({ data: post });
  } catch (err) {
    console.error('Error in GET /blog/post/:slug:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: get all posts including drafts
router.get('/all', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const posts = db.all('SELECT id, title, slug, status, reading_time, created_at, published_at FROM blog_posts ORDER BY created_at DESC');
    res.json({ data: posts });
  } catch (err) {
    console.error('Error in GET /blog/all:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: get single post by id
router.get('/admin/:id', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const post = db.get('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    try {
      post.tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []);
    } catch (e) {
      post.tags = [];
    }

    res.json({ data: post });
  } catch (err) {
    console.error('Error in GET /blog/admin/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: create post
router.post('/', requireAuth, (req, res) => {
  try {
    const { title, slug: customSlug, excerpt, content, category, tags, status } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let slug = (customSlug && typeof customSlug === 'string' && customSlug.trim())
      ? slugify(customSlug.trim(), { lower: true, strict: true })
      : slugify(title.trim(), { lower: true, strict: true });

    if (!slug) {
      slug = `post-${Date.now()}`;
    }

    const db = getDb();
    const existing = db.get('SELECT id FROM blog_posts WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const readingTime = calculateReadingTime(content);
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : (typeof tags === 'string' ? JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)) : '[]');
    const finalStatus = status === 'published' ? 'published' : 'draft';
    const publishedAt = finalStatus === 'published' ? new Date().toISOString() : null;

    const result = db.run(
      'INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, status, reading_time, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title.trim(), slug, excerpt || '', content || '', category || '', tagsJson, finalStatus, readingTime, publishedAt]
    );

    res.json({ data: { id: result.lastID, slug, message: 'Post created successfully' } });
  } catch (err) {
    console.error('Error in POST /blog:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: update post
router.put('/:id', requireAuth, (req, res) => {
  try {
    const { title, slug: customSlug, excerpt, content, category, tags, status } = req.body;
    const db = getDb();

    const post = db.get('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    let slug = post.slug;
    if (customSlug && customSlug.trim() && customSlug.trim() !== post.slug) {
      slug = slugify(customSlug.trim(), { lower: true, strict: true });
      const existing = db.get('SELECT id FROM blog_posts WHERE slug = ? AND id != ?', [slug, req.params.id]);
      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    } else if (title && title.trim() !== post.title && !customSlug) {
      slug = slugify(title.trim(), { lower: true, strict: true });
      const existing = db.get('SELECT id FROM blog_posts WHERE slug = ? AND id != ?', [slug, req.params.id]);
      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const newContent = content !== undefined ? content : post.content;
    const readingTime = calculateReadingTime(newContent);
    const tagsJson = tags !== undefined
      ? (Array.isArray(tags) ? JSON.stringify(tags) : (typeof tags === 'string' ? JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)) : '[]'))
      : post.tags;

    let publishedAt = post.published_at;
    const newStatus = status || post.status;
    if (newStatus === 'published' && !post.published_at) {
      publishedAt = new Date().toISOString();
    } else if (newStatus === 'draft') {
      publishedAt = null;
    }

    db.run(
      'UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, category = ?, tags = ?, status = ?, reading_time = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        title !== undefined ? title.trim() : post.title,
        slug,
        excerpt !== undefined ? excerpt : post.excerpt,
        newContent,
        category !== undefined ? category : post.category,
        tagsJson,
        newStatus,
        readingTime,
        publishedAt,
        req.params.id
      ]
    );

    res.json({ data: { message: 'Post updated successfully' } });
  } catch (err) {
    console.error('Error in PUT /blog/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: publish post
router.put('/:id/publish', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const publishedAt = new Date().toISOString();
    const result = db.run(
      'UPDATE blog_posts SET status = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['published', publishedAt, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ data: { message: 'Post published' } });
  } catch (err) {
    console.error('Error in PUT /blog/:id/publish:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: unpublish post
router.put('/:id/unpublish', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const result = db.run(
      'UPDATE blog_posts SET status = ?, published_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['draft', req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ data: { message: 'Post unpublished' } });
  } catch (err) {
    console.error('Error in PUT /blog/:id/unpublish:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin: delete post
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const result = db.run('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ data: { message: 'Post deleted successfully' } });
  } catch (err) {
    console.error('Error in DELETE /blog/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
