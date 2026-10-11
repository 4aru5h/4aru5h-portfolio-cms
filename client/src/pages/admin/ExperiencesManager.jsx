import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function ExperiencesManager() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newExp, setNewExp] = useState({ role: '', company: '', date_range: '', description: '', tags: '' });
  const [editingExp, setEditingExp] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadExperiences();
  }, []);

  function notify(msg, type = 'success') {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function loadExperiences() {
    try {
      const res = await api.get('/experiences/all');
      setExperiences(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      const tagsArray = newExp.tags.split(',').map(t => t.trim()).filter(Boolean);
      await api.post('/experiences', { ...newExp, tags: tagsArray });
      setNewExp({ role: '', company: '', date_range: '', description: '', tags: '' });
      setShowAdd(false);
      notify('Experience created successfully');
      loadExperiences();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const tagsArray = typeof editingExp.tags === 'string'
        ? editingExp.tags.split(',').map(t => t.trim()).filter(Boolean)
        : editingExp.tags;
      await api.put(`/experiences/${editingExp.id}`, { ...editingExp, tags: tagsArray });
      setEditingExp(null);
      notify('Experience updated successfully');
      loadExperiences();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function toggleVisibility(exp) {
    try {
      await api.put(`/experiences/${exp.id}`, { is_visible: exp.is_visible ? 0 : 1 });
      notify(`Experience ${exp.is_visible ? 'hidden' : 'visible'}`);
      loadExperiences();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this work experience?')) return;
    try {
      await api.del(`/experiences/${id}`);
      notify('Experience deleted');
      loadExperiences();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  function startEdit(exp) {
    let tagString = '';
    try {
      const parsed = typeof exp.tags === 'string' ? JSON.parse(exp.tags) : (exp.tags || []);
      tagString = Array.isArray(parsed) ? parsed.join(', ') : '';
    } catch {
      tagString = '';
    }
    setEditingExp({ ...exp, tags: tagString });
    setShowAdd(false);
  }

  if (loading) return <div style={{ color: '#5e6375' }}>Loading experiences...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Work Experience Manager</h3>
          <p style={{ color: '#9499ab', fontSize: '14px' }}>Manage timeline experience entries.</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={() => { setShowAdd(!showAdd); setEditingExp(null); }}>
          {showAdd ? 'Cancel' : '+ Add Experience'}
        </button>
      </div>

      {feedback && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '6px',
          marginBottom: '16px',
          backgroundColor: feedback.type === 'error' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(52, 211, 153, 0.15)',
          color: feedback.type === 'error' ? '#f87171' : '#34d399',
          border: `1px solid ${feedback.type === 'error' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`,
          fontSize: '13.5px'
        }}>
          {feedback.msg}
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="admin-card">
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add Work Experience</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Role / Position</label>
              <input type="text" className="form-control" value={newExp.role} onChange={e => setNewExp({ ...newExp, role: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Company / Organization</label>
              <input type="text" className="form-control" value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Date Range (e.g. Aug 2026 -- Present)</label>
            <input type="text" className="form-control" value={newExp.date_range} onChange={e => setNewExp({ ...newExp, date_range: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" className="form-control" value={newExp.tags} onChange={e => setNewExp({ ...newExp, tags: e.target.value })} placeholder="e.g. Node.js, Web Development, Community" />
          </div>
          <button type="submit" className="btn-admin btn-admin-primary">Save Experience</button>
        </form>
      )}

      {editingExp && (
        <form onSubmit={handleUpdate} className="admin-card" style={{ borderColor: '#38bdf8' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Edit: {editingExp.role} at {editingExp.company}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Role / Position</label>
              <input type="text" className="form-control" value={editingExp.role} onChange={e => setEditingExp({ ...editingExp, role: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Company / Organization</label>
              <input type="text" className="form-control" value={editingExp.company} onChange={e => setEditingExp({ ...editingExp, company: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <input type="text" className="form-control" value={editingExp.date_range} onChange={e => setEditingExp({ ...editingExp, date_range: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={editingExp.description} onChange={e => setEditingExp({ ...editingExp, description: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" className="form-control" value={editingExp.tags} onChange={e => setEditingExp({ ...editingExp, tags: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-admin btn-admin-primary">Update Experience</button>
            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setEditingExp(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Date Range</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map(exp => (
              <tr key={exp.id}>
                <td style={{ fontWeight: '600' }}>{exp.role}</td>
                <td style={{ color: '#38bdf8' }}>{exp.company}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{exp.date_range}</td>
                <td>
                  <span style={{ color: exp.is_visible ? '#34d399' : '#f87171', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {exp.is_visible ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-admin btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => toggleVisibility(exp)}>
                      {exp.is_visible ? 'Hide' : 'Show'}
                    </button>
                    <button className="btn-admin btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => startEdit(exp)}>
                      Edit
                    </button>
                    <button className="btn-admin btn-admin-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleDelete(exp.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
