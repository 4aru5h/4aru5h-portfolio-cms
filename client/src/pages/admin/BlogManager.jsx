import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  function notify(msg, type = 'success') {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  }

  const loadPosts = useCallback(async () => {
    try {
      const res = await api.get('/blog/all');
      setPosts(res.data || []);
    } catch (err) {
      console.error(err);
      notify(err.message || 'Failed to load blog posts', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function togglePublish(post) {
    try {
      if (post.status === 'published') {
        await api.put(`/blog/${post.id}/unpublish`);
        notify(`"${post.title}" unpublished (set to draft).`);
      } else {
        await api.put(`/blog/${post.id}/publish`);
        notify(`"${post.title}" published successfully!`);
      }
      loadPosts();
    } catch (err) {
      notify(err.message || 'Failed to update publication status', 'error');
    }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.del(`/blog/${id}`);
      notify('Blog post deleted successfully!');
      loadPosts();
    } catch (err) {
      notify(err.message || 'Failed to delete blog post', 'error');
    }
  }

  if (loading) return <div style={{ color: '#5e6375' }}>Loading blog posts...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Blog Post Manager</h3>
          <p style={{ color: '#9499ab', fontSize: '14px' }}>Draft, publish, edit, and manage articles and writeups.</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={() => navigate('/admin/blog/new')}>
          + New Article
        </button>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          backgroundColor: feedback.type === 'error' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(52, 211, 153, 0.15)',
          color: feedback.type === 'error' ? '#f87171' : '#34d399',
          border: `1px solid ${feedback.type === 'error' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`,
          fontSize: '14px'
        }}>
          {feedback.msg}
        </div>
      )}

      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: '#9499ab', fontSize: '15px' }}>No articles created yet.</p>
            <button className="btn-admin btn-admin-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/admin/blog/new')}>
              Write First Article
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Reading Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '600' }}>{p.title}</td>
                  <td style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>/blog/{p.slug}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      backgroundColor: p.status === 'published' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                      color: p.status === 'published' ? '#34d399' : '#fbbf24',
                      border: `1px solid ${p.status === 'published' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`
                    }}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{p.reading_time || 1} min</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-admin btn-admin-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => togglePublish(p)}
                      >
                        {p.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        className="btn-admin btn-admin-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => navigate(`/admin/blog/edit/${p.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-admin btn-admin-danger"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleDelete(p.id, p.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
