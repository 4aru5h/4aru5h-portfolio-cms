import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/portfolio.css';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#08080a',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div className="resume-view-card" style={{ maxWidth: '480px', width: '100%' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-cyan)', fontSize: '14px', marginBottom: '8px' }}>
          [ERR_404: ROUTE_NOT_FOUND]
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#9499ab', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          The requested system node does not exist or has been relocated.
        </p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex' }}>
          &larr; Return to Core Portfolio
        </Link>
      </div>
    </div>
  );
}
