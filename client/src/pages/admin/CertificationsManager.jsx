import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function CertificationsManager() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', issuer: '', description: '', badge_text: 'Verified', icon_color: 'var(--accent-cyan)' });
  const [editingCert, setEditingCert] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadCerts();
  }, []);

  function notify(msg, type = 'success') {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function loadCerts() {
    try {
      const res = await api.get('/certifications/all');
      setCerts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await api.post('/certifications', newCert);
      setNewCert({ title: '', issuer: '', description: '', badge_text: 'Verified', icon_color: 'var(--accent-cyan)' });
      setShowAdd(false);
      notify('Certification created successfully');
      loadCerts();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await api.put(`/certifications/${editingCert.id}`, editingCert);
      setEditingCert(null);
      notify('Certification updated successfully');
      loadCerts();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function toggleVisibility(cert) {
    try {
      await api.put(`/certifications/${cert.id}`, { is_visible: cert.is_visible ? 0 : 1 });
      notify(`Certification ${cert.is_visible ? 'hidden' : 'visible'}`);
      loadCerts();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    try {
      await api.del(`/certifications/${id}`);
      notify('Certification deleted');
      loadCerts();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  if (loading) return <div style={{ color: '#5e6375' }}>Loading certifications...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Certifications Manager</h3>
          <p style={{ color: '#9499ab', fontSize: '14px' }}>Add, edit, or remove verified certifications.</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={() => { setShowAdd(!showAdd); setEditingCert(null); }}>
          {showAdd ? 'Cancel' : '+ Add Certification'}
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
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add Certification</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" className="form-control" value={newCert.title} onChange={e => setNewCert({ ...newCert, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Issuer</label>
              <input type="text" className="form-control" value={newCert.issuer} onChange={e => setNewCert({ ...newCert, issuer: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Badge Tag</label>
            <input type="text" className="form-control" value={newCert.badge_text} onChange={e => setNewCert({ ...newCert, badge_text: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={newCert.description} onChange={e => setNewCert({ ...newCert, description: e.target.value })} rows={3} />
          </div>
          <button type="submit" className="btn-admin btn-admin-primary">Save Certification</button>
        </form>
      )}

      {editingCert && (
        <form onSubmit={handleUpdate} className="admin-card" style={{ borderColor: '#38bdf8' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>Edit: {editingCert.title}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" className="form-control" value={editingCert.title} onChange={e => setEditingCert({ ...editingCert, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Issuer</label>
              <input type="text" className="form-control" value={editingCert.issuer} onChange={e => setEditingCert({ ...editingCert, issuer: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Badge Tag</label>
            <input type="text" className="form-control" value={editingCert.badge_text} onChange={e => setEditingCert({ ...editingCert, badge_text: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={editingCert.description} onChange={e => setEditingCert({ ...editingCert, description: e.target.value })} rows={3} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-admin btn-admin-primary">Update Certification</button>
            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setEditingCert(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Certification Title</th>
              <th>Issuer</th>
              <th>Badge Tag</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certs.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: '600' }}>{c.title}</td>
                <td style={{ color: '#38bdf8' }}>{c.issuer}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{c.badge_text}</td>
                <td>
                  <span style={{ color: c.is_visible ? '#34d399' : '#f87171', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {c.is_visible ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-admin btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => toggleVisibility(c)}>
                      {c.is_visible ? 'Hide' : 'Show'}
                    </button>
                    <button className="btn-admin btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => { setEditingCert(c); setShowAdd(false); }}>
                      Edit
                    </button>
                    <button className="btn-admin btn-admin-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleDelete(c.id)}>
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
