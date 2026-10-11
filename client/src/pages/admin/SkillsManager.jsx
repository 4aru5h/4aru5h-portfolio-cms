import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';

export default function SkillsManager() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category_id: '',
    proficiency: '',
    display_order: 0,
    is_visible: 1
  });
  const [editingSkill, setEditingSkill] = useState(null);

  function notify(msg, type = 'success') {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  }

  const loadData = useCallback(async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/skills/all'),
        api.get('/categories/all')
      ]);
      setSkills(sRes.data || []);
      const catList = cRes.data || [];
      setCategories(catList);
      if (catList.length > 0) {
        setNewSkill(prev => (prev.category_id ? prev : { ...prev, category_id: catList[0].id }));
      }
    } catch (err) {
      console.error(err);
      notify(err.message || 'Failed to load skills', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await api.post('/skills', newSkill);
      setNewSkill({
        name: '',
        category_id: categories[0]?.id || '',
        proficiency: '',
        display_order: 0,
        is_visible: 1
      });
      setShowAdd(false);
      notify('Skill created successfully!');
      loadData();
    } catch (err) {
      notify(err.message || 'Failed to create skill', 'error');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await api.put(`/skills/${editingSkill.id}`, editingSkill);
      setEditingSkill(null);
      notify('Skill updated successfully!');
      loadData();
    } catch (err) {
      notify(err.message || 'Failed to update skill', 'error');
    }
  }

  async function toggleVisibility(skill) {
    try {
      await api.put(`/skills/${skill.id}`, { is_visible: skill.is_visible ? 0 : 1 });
      notify(`Skill "${skill.name}" is now ${skill.is_visible ? 'hidden' : 'visible'}.`);
      loadData();
    } catch (err) {
      notify(err.message || 'Failed to update visibility', 'error');
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.del(`/skills/${id}`);
      notify('Skill deleted successfully!');
      loadData();
    } catch (err) {
      notify(err.message || 'Failed to delete skill', 'error');
    }
  }

  if (loading) return <div style={{ color: '#5e6375' }}>Loading skills...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Skills Manager</h3>
          <p style={{ color: '#9499ab', fontSize: '14px' }}>Add, edit, reorder, or toggle visibility of skills on your portfolio.</p>
        </div>
        <button
          className="btn-admin btn-admin-primary"
          onClick={() => {
            setShowAdd(!showAdd);
            setEditingSkill(null);
          }}
        >
          {showAdd ? 'Cancel' : '+ Add Skill'}
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

      {showAdd && (
        <form onSubmit={handleAdd} className="admin-card">
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add New Skill</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Skill Name *</label>
              <input
                type="text"
                className="form-control"
                value={newSkill.name}
                onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="e.g. Wireshark"
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                className="form-control"
                value={newSkill.category_id}
                onChange={e => setNewSkill({ ...newSkill, category_id: e.target.value })}
                required
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Proficiency / Note (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={newSkill.proficiency}
                onChange={e => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                placeholder="e.g. Advanced / Daily Use"
              />
            </div>
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                className="form-control"
                value={newSkill.display_order}
                onChange={e => setNewSkill({ ...newSkill, display_order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button type="submit" className="btn-admin btn-admin-primary">Save Skill</button>
            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </form>
      )}

      {editingSkill && (
        <form onSubmit={handleUpdate} className="admin-card" style={{ borderColor: '#38bdf8' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>
            Edit Skill: {editingSkill.name}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Skill Name *</label>
              <input
                type="text"
                className="form-control"
                value={editingSkill.name}
                onChange={e => setEditingSkill({ ...editingSkill, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                className="form-control"
                value={editingSkill.category_id}
                onChange={e => setEditingSkill({ ...editingSkill, category_id: e.target.value })}
                required
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Proficiency / Note</label>
              <input
                type="text"
                className="form-control"
                value={editingSkill.proficiency || ''}
                onChange={e => setEditingSkill({ ...editingSkill, proficiency: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                className="form-control"
                value={editingSkill.display_order || 0}
                onChange={e => setEditingSkill({ ...editingSkill, display_order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(editingSkill.is_visible)}
                onChange={e => setEditingSkill({ ...editingSkill, is_visible: e.target.checked ? 1 : 0 })}
              />
              <span>Visible on public portfolio</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button type="submit" className="btn-admin btn-admin-primary">Update Skill</button>
            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setEditingSkill(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {skills.length === 0 ? (
          <p style={{ color: '#9499ab', textAlign: 'center', padding: '24px' }}>No skills found. Click "+ Add Skill" to add one.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Category</th>
                <th>Proficiency</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: '600' }}>{s.name}</td>
                  <td style={{ color: '#38bdf8' }}>{s.category_name || 'Uncategorized'}</td>
                  <td style={{ color: '#9499ab', fontSize: '13px' }}>{s.proficiency || '—'}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{s.display_order}</td>
                  <td>
                    <span style={{ color: s.is_visible ? '#34d399' : '#f87171', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                      {s.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-admin btn-admin-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => toggleVisibility(s)}
                      >
                        {s.is_visible ? 'Hide' : 'Show'}
                      </button>
                      <button
                        className="btn-admin btn-admin-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => {
                          setEditingSkill(s);
                          setShowAdd(false);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-admin btn-admin-danger"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleDelete(s.id, s.name)}
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
