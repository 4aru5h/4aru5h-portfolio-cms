import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadPost = useCallback(async () => {
    try {
      const res = await api.get(`/blog/admin/${id}`);
      const data = res.data;
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        category: data.category || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
        status: data.status || 'draft'
      });
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to load post: ' + (err.message || 'Unknown error') });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      loadPost();
    }
  }, [isEdit, loadPost]);

  async function handleSave(statusToSet) {
    if (!form.title.trim()) {
      setFeedback({ type: 'error', msg: 'Title is required before saving.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        ...form,
        tags: tagsArray,
        status: statusToSet || form.status
      };

      if (isEdit) {
        await api.put(`/blog/${id}`, payload);
      } else {
        await api.post('/blog', payload);
      }

      navigate('/admin/blog');
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to save post: ' + (err.message || 'Unknown error') });
    } finally {
      setSaving(false);
    }
  }

  // Calculate approximate reading time
  const wordCount = form.content ? form.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedMins = Math.max(1, Math.ceil(wordCount / 200));

  if (loading) return <div style={{ color: '#5e6375' }}>Loading post editor...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{isEdit ? 'Edit Article' : 'Write New Article'}</h3>
          <p style={{ color: '#9499ab', fontSize: '14px' }}>
            Markdown supported • ~{wordCount} words • ~{estimatedMins} min read
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-admin btn-admin-secondary" onClick={() => navigate('/admin/blog')} disabled={saving}>
            Cancel
          </button>
          <button className="btn-admin btn-admin-secondary" onClick={() => handleSave('draft')} disabled={saving}>
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button className="btn-admin btn-admin-primary" onClick={() => handleSave('published')} disabled={saving}>
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
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

      <div className="admin-card">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            className="form-control"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Analyzing Network Packet Capture Filters with Wireshark"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label>URL Slug (auto-generated if empty)</label>
            <input
              type="text"
              className="form-control"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              placeholder="e.g. analyzing-network-packet-capture-filters"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              className="form-control"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Cybersecurity, Networking, DevSecOps"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Short Excerpt / Teaser</label>
          <input
            type="text"
            className="form-control"
            value={form.excerpt}
            onChange={e => setForm({ ...form, excerpt: e.target.value })}
            placeholder="A brief summary of the article..."
          />
        </div>

        <div className="form-group">
          <label>Article Content (Markdown Supported)</label>
          <textarea
            className="form-control"
            rows={14}
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            placeholder="# Article Title&#10;&#10;Write your article using Markdown here..."
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: '1.6' }}
          />
        </div>

        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            className="form-control"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
            placeholder="Wireshark, Network, Diagnostics"
          />
        </div>
      </div>
    </div>
  );
}
