import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    skills: 0,
    categories: 0,
    certifications: 0,
    experiences: 0,
    projects: 0,
    publishedPosts: 0,
    draftPosts: 0,
    contentItems: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Overview</h3>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">TOTAL SKILLS</div>
          <div className="stat-card-value">{stats.skills}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">SKILL CATEGORIES</div>
          <div className="stat-card-value">{stats.categories}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">CERTIFICATIONS</div>
          <div className="stat-card-value">{stats.certifications}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">WORK EXPERIENCES</div>
          <div className="stat-card-value">{stats.experiences}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">PUBLISHED BLOG POSTS</div>
          <div className="stat-card-value">{stats.publishedPosts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">BLOG DRAFTS</div>
          <div className="stat-card-value">{stats.draftPosts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">EDITABLE TEXT BLOCKS</div>
          <div className="stat-card-value">{stats.contentItems}</div>
        </div>
      </div>

      <div className="admin-card">
        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Quick Start Guide</h4>
        <p style={{ color: '#9499ab', fontSize: '14px', lineHeight: '1.6' }}>
          Welcome to your private Admin Dashboard! Any edits you make here—whether updating website headings, adding skills, editing work experience, or publishing blog posts—will instantly update on your public portfolio website.
        </p>
      </div>
    </div>
  );
}
