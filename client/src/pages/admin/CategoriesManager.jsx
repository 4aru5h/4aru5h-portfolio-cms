import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [newCat, setNewCat] = useState({
    name: '',
    icon_color: '#38bdf8',
    display_order: 0,
    is_visible: 1
  });
  const [editingCat, setEditingCat] = useState(null);

  function notify(msg, type = 'success') {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  }

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories/all');
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      notify(err.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await api.post('/categories', newCat);
      setNewCat({ name: '', icon_color: '#38bdf8', display_order: 0, is_visible: 1 });
      setShowAdd(false);
      notify('Category created successfully!');
      loadCategories();
    } catch (err) {
      notify(err.message || 'Failed to create category', 'error');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await api.put(`/categories/${editingCat.id}`, editingCat);
      setEditingCat(null);
      notify('Category updated successfully!');
      loadCategories();
    } catch (err) {
      notify(err.message || 'Failed to update category', 'error');
    }
  }

  async function toggleVisibility(cat) {
    try {
      await api.put(`/categories/${cat.id}`, { is_visible: cat.is_visible ? 0 : 1 });
      notify(`Category "${cat.name}" is now ${cat.is_visible ? 'hidden' : 'visible'}.`);
      loadCategories();
    } catch (err) {
      notify(err.message || 'Failed to update category visibility', 'error');
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Warning: Deleting "${name}" will permanently delete all skills categorized under it! Continue?`)) {
      return;
    }
    try {
      await api.del(`/categories/${id}`);
      notify('Category deleted successfully!');
      loadCategories();
    } catch (err) {
      notify(err.message || 'Failed to delete category', 'error');
    }
  }

  if (loading) return <div style={{ color: '#5e6375' }}>Loading categories...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Skill Categories Manager</h3>
          <p style={{ color: '#9499ab', fontSize: '14px' }}>Create, rename, reorder, and configure skill groupings.</p>
        </div>
        <button
          className="btn-admin btn-admin-primary"
          onClick={() => {
            setShowAdd(!showAdd);
            setEditingCat(null);
          }}
        >
          {showAdd ? 'Cancel' : '+ Add Category'}
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
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add Skill Category</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                className="form-control"
                value={newCat.name}
                onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                placeholder="e.g. Reverse Engineering & Malware Analysis"
                required
              />
            </div>
            <div className="form-group">
              <label>Accent / Icon Color</label>
              <input
                type="text"
                className="form-control"
                value={newCat.icon_color}
                onChange={e => setNewCat({ ...newCat, icon_color: e.target.value })}
                placeholder="#38bdf8 or var(--accent-cyan)"
              />
            </div>
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                className="form-control"
                value={newCat.display_order}
                onChange={e => setNewCat({ ...newCat, display_order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button type="submit" className="btn-admin btn-admin-primary">Save Category</button>
            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </form>
      )}

      {editingCat && (
        <form onSubmit={handleUpdate} className="admin-card" style={{ borderColor: '#38bdf8' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>
            Edit Category: {editingCat.name}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                className="form-control"
                value={editingCat.name}
                onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Accent / Icon Color</label>
              <input
                type="text"
                className="form-control"
                value={editingCat.icon_color || ''}
                onChange={e => setEditingCat({ ...editingCat, icon_color: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                className="form-control"
                value={editingCat.display_order || 0}
                onChange={e => setEditingCat({ ...editingCat, display_order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(editingCat.is_visible)}
                onChange={e => setEditingCat({ ...editingCat, is_visible: e.target.checked ? 1 : 0 })}
              />
              <span>Visible on public portfolio</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button type="submit" className="btn-admin btn-admin-primary">Update Category</button>
            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setEditingCat(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {categories.length === 0 ? (
          <p style={{ color: '#9499ab', textAlign: 'center', padding: '24px' }}>No categories found. Click "+ Add Category" to create one.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Color Swatch</th>
                <th>Display Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '600', color: c.icon_color || '#38bdf8' }}>{c.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '3px',
                          display: 'inline-block',
                          backgroundColor: c.icon_color || '#38bdf8'
                        }}
                      />
                      <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#9499ab' }}>
                        {c.icon_color || '#38bdf8'}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{c.display_order}</td>
                  <td>
                    <span style={{ color: c.is_visible ? '#34d399' : '#f87171', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                      {c.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-admin btn-admin-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => toggleVisibility(c)}
                      >
                        {c.is_visible ? 'Hide' : 'Show'}
                      </button>
                      <button
                        className="btn-admin btn-admin-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => {
                          setEditingCat(c);
                          setShowAdd(false);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-admin btn-admin-danger"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleDelete(c.id, c.name)}
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
