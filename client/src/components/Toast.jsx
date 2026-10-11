import React from 'react';

export default function Toast({ show, title, desc }) {
  return (
    <div id="toast" className={show ? 'show' : ''} role="status" aria-live="polite">
      <div className="toast-icon-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div className="toast-content">
        <span className="toast-title" id="toast-title">{title || 'Copied to clipboard!'}</span>
        <span className="toast-desc" id="toast-desc">{desc || 'iamaarushmohan@gmail.com'}</span>
      </div>
    </div>
  );
}
