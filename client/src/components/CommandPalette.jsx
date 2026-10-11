import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette({ isOpen, onClose, onCopyEmail, settings = {} }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const email = settings.email || 'iamaarushmohan@gmail.com';
  const github = settings.github_url || 'https://github.com/4aru5h';
  const resumeUrl = settings.resume_pdf_url || 'resume.pdf';

  const items = [
    { label: 'Go to Home', action: () => { window.location.hash = '#hero'; onClose(); } },
    { label: 'View Resume Section', action: () => { window.location.hash = '#resume-view'; onClose(); } },
    { label: 'Go to Skills Matrix', action: () => { window.location.hash = '#skills'; onClose(); } },
    { label: 'Go to Work Experience', action: () => { window.location.hash = '#experience'; onClose(); } },
    { label: 'View Certificates', action: () => { window.location.hash = '#certifications'; onClose(); } },
    { label: 'View Projects', action: () => { window.location.hash = '#projects'; onClose(); } },
    { label: 'Open Blog', action: () => { navigate('/blog'); onClose(); } },
    { label: 'Download Resume PDF', action: () => { const a = document.createElement('a'); a.href = resumeUrl; a.download = 'resume.pdf'; a.click(); onClose(); } },
    { label: 'Copy Email Address', action: () => { onCopyEmail(email); onClose(); } },
    { label: 'Open GitHub Profile', action: () => { window.open(github, '_blank', 'noopener,noreferrer'); onClose(); } },
    { label: 'Admin Login', action: () => { navigate('/admin/login'); onClose(); } }
  ];

  const filtered = items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIndex]) {
          filtered[activeIndex].action();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filtered, activeIndex]);

  if (!isOpen) return null;

  return (
    <div id="command-palette" className="open" role="dialog" aria-label="Command palette" aria-modal="true">
      <div className="cmd-backdrop" onClick={onClose}></div>
      <div className="cmd-dialog">
        <div className="cmd-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            className="cmd-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <div className="cmd-results">
          <div className="cmd-group-label">Quick Actions</div>
          {filtered.length === 0 ? (
            <div style={{ padding: '16px', color: '#5e6375', fontSize: '13px', textAlign: 'center' }}>
              No actions found for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className={`cmd-item ${idx === activeIndex ? 'active' : ''}`}
                onClick={item.action}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                <span className="cmd-item-text">{item.label}</span>
              </div>
            ))
          )}
        </div>
        <div className="cmd-footer">
          <span><kbd style={{ padding: '2px 5px', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '10px' }}>&uarr;&darr;</kbd> Navigate</span>
          <span><kbd style={{ padding: '2px 5px', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '10px' }}>Enter</kbd> Select</span>
          <span><kbd style={{ padding: '2px 5px', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '10px' }}>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
