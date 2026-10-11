import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newProj, setNewProj] = useState({ title: '', description: '', technologies: '', github_url: '', live_url: '' });
  const [editingProj, setEditingProj] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  function notify(msg, type = 'success') {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function loadProjects() {
    try {
      const res = await api.get('/projects/all');
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      const techArray = newProj.technologies.split(',').map(t => t.trim()).filter(Boolean);
      await api.post('/projects', { ...newProj, technologies: techArray });
      setNewProj({ title: '', description: '', technologies: '', github_url: '', live_url: '' });
      setShowAdd(false);
      notify('Project created successfully');
      loadProjects();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const techArray = typeof editingProj.technologies === 'string'
        ? editingProj.technologies.split(',').map(t => t.trim()).filter(Boolean)
        : editingProj.technologies;
      await api.put(`/projects/${editingProj.id}`, { ...editingProj, technologies: techArray });
      setEditingProj(null);
      notify('Project updated successfully');
      loadProjects();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function toggleVisibility(proj) {
    try {
      await api.put(`/projects/${proj.id}`, { is_visible: proj.is_visible ? 0 : 1 });
      notify(`Project ${proj.is_visible ? 'hidden' : 'visible'}`);
      loadProjects();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.del(`/projects/${id}`);
      notify('Project deleted');
      loadProjects();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  function startEdit(proj) {
    let techString = '';
    try {
      const parsed = Array.isArray(proj.technologies) ? proj.technologies : (typeof proj.technologies === 'string' ? JSON.parse(proj.technologies) : []);
      techString = Array.isArray(parsed) ? parsed.join(', ') : '';
    } catch {
      techString = '';
    }
    setEditingProj({ ...proj, technologies: techString });
    setShowAdd(false);
  }

  if (loading) return <div style={{ color: '#5e6375' }}>Loading projects...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Projects Manager</h3>
          <p style={{ color: '#9499ab', fontSize: '14px' }}>Add and manage portfolio projects displayed on the public site.</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={() => { setShowAdd(!showAdd); setEditingProj(null); }}>
          {showAdd ? 'Cancel' : '+ Add Project'}
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
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add New Project</h4>
          <div className="form-group">
            <label>Project Title</label>
            <input type="text" className="form-control" value={newProj.title} onChange={e => setNewProj({ ...newProj, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={newProj.description} onChange={e => setNewProj({ ...newProj, description: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label>Technologies (comma separated)</label>
            <input type="text" className="form-control" value={newProj.technologies} onChange={e => setNewProj({ ...newProj, technologies: e.target.value })} placeholder="e.g. Python, Wireshark, React" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>GitHub Repository URL</label>
              <input type="text" className="form-control" value={newProj.github_url} onChange={e => setNewProj({ ...newProj, github_url: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Live Demo URL</label>
              <input type="text" className="form-control" value={newProj.live_url} onChange={e => setNewProj({ ...newProj, live_url: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-admin btn-admin-primary">Save Project</button>
        </form>
      )}

      {editingProj && (
        <form onSubmit={handleUpdate} className="admin-card" style={{ borderColor: '#38bdf8' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Edit: {editingProj.title}</h4>
          <div className="form-group">
            <label>Project Title</label>
            <input type="text" className="form-control" value={editingProj.title} onChange={e => setEditingProj({ ...editingProj, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={editingProj.description} onChange={e => setEditingProj({ ...editingProj, description: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label>Technologies (comma separated)</label>
            <input type="text" className="form-control" value={editingProj.technologies} onChange={e => setEditingProj({ ...editingProj, technologies: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>GitHub Repository URL</label>
              <input type="text" className="form-control" value={editingProj.github_url} onChange={e => setEditingProj({ ...editingProj, github_url: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Live Demo URL</label>
              <input type="text" className="form-control" value={editingProj.live_url} onChange={e => setEditingProj({ ...editingProj, live_url: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-admin btn-admin-primary">Update Project</button>
            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setEditingProj(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-card">
        {projects.length === 0 ? (
          <p style={{ color: '#9499ab', fontSize: '14px' }}>No projects added yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>GitHub</th>
                <th>Live URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '600' }}>{p.title}</td>
                  <td style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{p.github_url || '-'}</td>
                  <td style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{p.live_url || '-'}</td>
                  <td>
                    <span style={{ color: p.is_visible ? '#34d399' : '#f87171', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                      {p.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-admin btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => toggleVisibility(p)}>
                        {p.is_visible ? 'Hide' : 'Show'}
                      </button>
                      <button className="btn-admin btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button className="btn-admin btn-admin-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleDelete(p.id)}>
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
