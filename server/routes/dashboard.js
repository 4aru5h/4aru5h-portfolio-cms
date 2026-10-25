const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { requireAuth } = require('../middleware/auth');

// Admin: return counts of various entities
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    
    const skillsResult = await db.get('SELECT COUNT(*) as count FROM skills');
    const categoriesResult = await db.get('SELECT COUNT(*) as count FROM skill_categories');
    const certsResult = await db.get('SELECT COUNT(*) as count FROM certifications');
    const expResult = await db.get('SELECT COUNT(*) as count FROM experiences');
    const projectsResult = await db.get('SELECT COUNT(*) as count FROM projects');
    const publishedBlogResult = await db.get('SELECT COUNT(*) as count FROM blog_posts WHERE status = ?', ['published']);
    const draftBlogResult = await db.get('SELECT COUNT(*) as count FROM blog_posts WHERE status = ?', ['draft']);
    const contentResult = await db.get('SELECT COUNT(*) as count FROM site_content');
    
    res.json({
      data: {
        skills: skillsResult ? skillsResult.count : 0,
        categories: categoriesResult ? categoriesResult.count : 0,
        certifications: certsResult ? certsResult.count : 0,
        experiences: expResult ? expResult.count : 0,
        projects: projectsResult ? projectsResult.count : 0,
        publishedPosts: publishedBlogResult ? publishedBlogResult.count : 0,
        draftPosts: draftBlogResult ? draftBlogResult.count : 0,
        contentItems: contentResult ? contentResult.count : 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
