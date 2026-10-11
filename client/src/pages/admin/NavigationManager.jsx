import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';

export default function NavigationManager() {
  const [items, setItems] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', href: '', display_order: 0, is_visible: 1 });
  const [editingItem, setEditingItem] = useState(null);

  function notify(msg, type = 'success') {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  }

  const loadAll = useCallback(async () => {
    try {
      const [navRes, secRes] = await Promise.all([
        api.get('/navigation/all'),
        api.get('/sections')
      ]);
      setItems(navRes.data || []);
      setSections(secRes.data || []);
    } catch (err) {
      console.error(err);
      notify(err.message || 'Failed to load navigation configuration', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await api.post('/navigation', newItem);
      setNewItem({ label: '', href: '', display_order: 0, is_visible: 1 });
      setShowAdd(false);
      notify('Navigation link added successfully!');
      loadAll();
    } catch (err) {
      notify(err.message || 'Failed to add navigation link', 'error');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await api.put(`/navigation/${editingItem.id}`, editingItem);
      setEditingItem(null);
      notify('Navigation link updated successfully!');
      loadAll();
    } catch (err) {
      notify(err.message || 'Failed to update navigation link', 'error');
    }
  }

  async function toggleNavVisibility(item) {
    try {
      await api.put(`/navigation/${item.id}`, { is_visible: item.is_visible ? 0 : 1 });
      notify(`Navigation item "${item.label}" is now ${item.is_visible ? 'hidden' : 'visible'}.`);
      loadAll();
    } catch (err) {
      notify(err.message || 'Failed to update navigation item', 'error');
    }
  }

  async function handleDeleteNav(id, label) {
    if (!window.confirm(`Are you sure you want to remove the navigation link "${label}"?`)) return;
    try {
      await api.del(`/navigation/${id}`);
      notify('Navigation link removed successfully!');
      loadAll();
    } catch (err) {
      notify(err.message || 'Failed to delete navigation item', 'error');
    }
  }

  async function toggleSectionVisibility(sec) {
    try {
      await api.put(`/sections/${sec.id}`, { is_visible: sec.is_visible ? 0 : 1 });
      notify(`Portfolio Section "${sec.label}" is now ${sec.is_visible ? 'hidden' : 'visible'}.`);
      loadAll();
    } catch (err) {
      notify(err.message || 'Failed to toggle section visibility', 'error');
    }
  }

  if (loading) return <div style={{ color: '#5e6375' }}>Loading navigation items...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Navigation & Sections Manager</h3>
          <p style={{ color: '#9499ab', fontSize: '14px' }}>
            Control navbar links and toggle entire sections on and off on the public portfolio.
          </p>
        </div>
        <button
          className="btn-admin btn-admin-primary"
          onClick={() => {
            setShowAdd(!showAdd);
            setEditingItem(null);
          }}
        >
          {showAdd ? 'Cancel' : '+ Add Nav Link'}
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
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add Navigation Link</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Link Label *</label>
              <input
                type="text"
                className="form-control"
                value={newItem.label}
                onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                placeholder="e.g. Certifications"
                required
              />
            </div>
            <div className="form-group">
              <label>Target / Href *</label>
              <input
                type="text"
                className="form-control"
                value={newItem.href}
                onChange={e => setNewItem({ ...newItem, href: e.target.value })}
                placeholder="e.g. #certifications or /blog"
                required
              />
            </div>
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                className="form-control"
                value={newItem.display_order}
                onChange={e => setNewItem({ ...newItem, display_order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button type="submit" className="btn-admin btn-admin-primary">Save Link</button>
            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </form>
      )}

      {editingItem && (
        <form onSubmit={handleUpdate} className="admin-card" style={{ borderColor: '#38bdf8' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#38bdf8' }}>
            Edit Nav Link: {editingItem.label}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Link Label *</label>
              <input
                type="text"
                className="form-control"
                value={editingItem.label}
                onChange={e => setEditingItem({ ...editingItem, label: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Target / Href *</label>
              <input
                type="text"
                className="form-control"
                value={editingItem.href}
                onChange={e => setEditingItem({ ...editingItem, href: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                className="form-control"
                value={editingItem.display_order || 0}
                onChange={e => setEditingItem({ ...editingItem, display_order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(editingItem.is_visible)}
                onChange={e => setEditingItem({ ...editingItem, is_visible: e.target.checked ? 1 : 0 })}
              />
              <span>Visible in header navigation</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button type="submit" className="btn-admin btn-admin-primary">Update Link</button>
            <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setEditingItem(null)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Navigation Links Table */}
      <div className="admin-card" style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Header Navigation Items</h4>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Target Href</th>
              <th>Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: '600' }}>{item.label}</td>
                <td style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{item.href}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{item.display_order}</td>
                <td>
                  <span style={{ color: item.is_visible ? '#34d399' : '#f87171', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {item.is_visible ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-admin btn-admin-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => toggleNavVisibility(item)}
                    >
                      {item.is_visible ? 'Hide' : 'Show'}
                    </button>
                    <button
                      className="btn-admin btn-admin-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => {
                        setEditingItem(item);
                        setShowAdd(false);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-admin btn-admin-danger"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => handleDeleteNav(item.id, item.label)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section Visibility Toggles */}
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Portfolio Section Visibility</h4>
        <p style={{ color: '#9499ab', fontSize: '13px', marginBottom: '16px' }}>
          Enable or disable entire content sections from rendering on the public homepage.
        </p>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Section Name</th>
              <th>Identifier Key</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(sec => (
              <tr key={sec.id}>
                <td style={{ fontWeight: '600' }}>{sec.label}</td>
                <td style={{ color: '#9499ab', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{sec.section_key}</td>
                <td>
                  <span style={{ color: sec.is_visible ? '#34d399' : '#f87171', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {sec.is_visible ? 'Active (Visible)' : 'Disabled (Hidden)'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-admin btn-admin-secondary"
                    style={{ padding: '4px 12px', fontSize: '12px' }}
                    onClick={() => toggleSectionVisibility(sec)}
                  >
                    {sec.is_visible ? 'Disable Section' : 'Enable Section'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
