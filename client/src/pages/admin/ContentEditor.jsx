import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function ContentEditor() {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    try {
      const res = await api.get('/content');
      setGrouped(res.data.grouped || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(item) {
    setSavingId(item.id);
    setMessage(null);
    try {
      await api.put(`/content/${item.id}`, { value: item.value, label: item.label });
      setMessage({ type: 'success', text: `Saved "${item.label}" successfully!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save content' });
    } finally {
      setSavingId(null);
    }
  }

  function handleChange(section, index, field, val) {
    setGrouped(prev => {
      const list = [...prev[section]];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, [section]: list };
    });
  }

  if (loading) return <div style={{ color: '#5e6375' }}>Loading website text...</div>;

  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Website Content Editor</h3>
      <p style={{ color: '#9499ab', fontSize: '14px', marginBottom: '24px' }}>
        Edit static text across every section of your portfolio. Changes appear live on the public site immediately upon saving.
      </p>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
          color: message.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '14px'
        }}>
          {message.text}
        </div>
      )}

      {Object.keys(grouped).map(section => (
        <div key={section} className="admin-card">
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '18px', fontFamily: 'JetBrains Mono, monospace' }}>
            Section: {section}
          </h4>

          {grouped[section].map((item, idx) => {
            const isMultiline = item.content_type === 'textarea' ||
              item.content_key.includes('desc') ||
              item.content_key.includes('copy') ||
              item.content_key.includes('skills_') ||
              (item.value && item.value.length > 80);

            return (
              <div key={item.id} className="form-group" style={{ paddingBottom: '16px', borderBottom: idx < grouped[section].length - 1 ? '1px solid #1e1e28' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{item.label}</label>
                  <span style={{ fontSize: '11px', color: '#5e6375', fontFamily: 'JetBrains Mono, monospace' }}>Key: {item.content_key}</span>
                </div>

                {isMultiline ? (
                  <textarea
                    className="form-control"
                    rows={3}
                    value={item.value}
                    onChange={(e) => handleChange(section, idx, 'value', e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={item.value}
                    onChange={(e) => handleChange(section, idx, 'value', e.target.value)}
                  />
                )}

                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn-admin btn-admin-primary"
                    onClick={() => handleSave(item)}
                    disabled={savingId === item.id}
                  >
                    {savingId === item.id ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
