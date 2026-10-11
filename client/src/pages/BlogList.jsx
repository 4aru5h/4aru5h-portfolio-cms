import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import '../styles/portfolio.css';

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await api.get('/blog');
        setPosts(res.data?.posts || res.data || []);
      } catch (err) {
        console.error('Error loading blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#08080a', color: '#ffffff', paddingTop: '100px', paddingBottom: '60px' }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <Link to="/" style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
            &larr; Back to Portfolio
          </Link>
        </div>

        <div className="section-header">
          <p className="section-label">Articles &amp; Insights</p>
          <h1 className="section-title">Technical Blog</h1>
          <p className="section-desc">Cybersecurity notes, software engineering writeups, and technical diagnostics.</p>
        </div>

        {loading ? (
          <div style={{ color: '#5e6375', fontFamily: 'JetBrains Mono, monospace' }}>Loading articles...</div>
        ) : posts.length === 0 ? (
          <div className="resume-view-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ color: '#9499ab', fontSize: '15px' }}>No blog posts published yet.</p>
            <p style={{ color: '#5e6375', fontSize: '13px', marginTop: '8px' }}>Articles published through the CMS dashboard will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {posts.map(post => {
              const displayDate = formatDate(post.published_at || post.created_at);
              return (
                <div key={post.id} className="skill-category" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5e6375', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>
                    <span>{displayDate || 'Recent'}</span>
                    <span>{post.reading_time || 2} min read</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
                    <Link to={`/blog/${post.slug}`} style={{ color: '#ffffff' }}>{post.title}</Link>
                  </h3>
                  <p style={{ fontSize: '14px', color: '#9499ab', flex: 1, marginBottom: '16px', lineHeight: '1.6' }}>
                    {post.excerpt || (post.content ? post.content.substring(0, 140) + '...' : '')}
                  </p>
                  <Link to={`/blog/${post.slug}`} style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }}>
                    Read Article &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
