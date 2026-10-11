const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

// Admin: return counts of various entities
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    
    const skillsResult = db.get('SELECT COUNT(*) as count FROM skills');
    const categoriesResult = db.get('SELECT COUNT(*) as count FROM skill_categories');
    const certsResult = db.get('SELECT COUNT(*) as count FROM certifications');
    const expResult = db.get('SELECT COUNT(*) as count FROM experiences');
    const projectsResult = db.get('SELECT COUNT(*) as count FROM projects');
    const publishedBlogResult = db.get('SELECT COUNT(*) as count FROM blog_posts WHERE status = ?', ['published']);
    const draftBlogResult = db.get('SELECT COUNT(*) as count FROM blog_posts WHERE status = ?', ['draft']);
    const contentResult = db.get('SELECT COUNT(*) as count FROM site_content');
    
    res.json({
      data: {
        skills: skillsResult.count,
        categories: categoriesResult.count,
        certifications: certsResult.count,
        experiences: expResult.count,
        projects: projectsResult.count,
        publishedPosts: publishedBlogResult.count,
        draftPosts: draftBlogResult.count,
        contentItems: contentResult.count
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
