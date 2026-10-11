import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';

export default function SettingsManager() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [feedback, setFeedback] = useState(null);

  function notify(msg, type = 'success') {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  }

  const loadSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data || []);
    } catch (err) {
      console.error(err);
      notify(err.message || 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  async function handleSave(item) {
    if (item.setting_key.endsWith('_url') && /^(javascript|vbscript|data):/i.test(item.setting_value || '')) {
      notify('Invalid URL protocol detected. URLs cannot start with javascript: or data:', 'error');
      return;
    }

    setSavingKey(item.setting_key);
    try {
      await api.put(`/settings/${item.setting_key}`, { setting_value: item.setting_value });
      notify(`Saved "${item.label || item.setting_key}" successfully.`);
    } catch (err) {
      notify(err.message || 'Failed to save setting', 'error');
    } finally {
      setSavingKey(null);
    }
  }

  function handleChange(key, value) {
    setSettings(prev => prev.map(s => s.setting_key === key ? { ...s, setting_value: value } : s));
  }

  if (loading) return <div style={{ color: '#5e6375' }}>Loading site settings...</div>;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Site Settings</h3>
        <p style={{ color: '#9499ab', fontSize: '14px' }}>
          Configure global metadata, contact details, social links, and public asset references.
        </p>
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
        {settings.map(s => {
          const isMultiline = s.setting_key.includes('description') || (s.setting_value && s.setting_value.length > 80);

          return (
            <div key={s.id} className="form-group" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e1e28' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                  {s.label || s.setting_key}
                </label>
                <span style={{ fontSize: '11px', color: '#5e6375', fontFamily: 'JetBrains Mono, monospace' }}>
                  {s.setting_key}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: isMultiline ? 'flex-start' : 'center' }}>
                {isMultiline ? (
                  <textarea
                    className="form-control"
                    rows={3}
                    value={s.setting_value || ''}
                    onChange={e => handleChange(s.setting_key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={s.setting_value || ''}
                    onChange={e => handleChange(s.setting_key, e.target.value)}
                  />
                )}
                <button
                  className="btn-admin btn-admin-primary"
                  onClick={() => handleSave(s)}
                  disabled={savingKey === s.setting_key}
                  style={{ minWidth: '90px' }}
                >
                  {savingKey === s.setting_key ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
