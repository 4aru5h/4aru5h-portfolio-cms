import React from 'react';

export default function CertificationsSection({ certifications = [], content = {} }) {
  const sorted = [...certifications].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <section id="certifications">
      <div className="container">
        <div className="section-header reveal visible">
          <p className="section-label">{content.certifications_label || 'Verified Credentials'}</p>
          <h2 className="section-title">{content.certifications_title || 'Certifications & Training'}</h2>
          <p className="section-desc">{content.certifications_desc || 'Industry-recognized credentials in cybersecurity, ethical hacking, foundational CS, and agentic workflows.'}</p>
        </div>

        <div className="cert-grid">
          {sorted.map(cert => (
            <div key={cert.id} className="cert-card reveal visible">
              <div className="cert-badge-top">
                <div className="cert-icon-wrap" style={{ color: cert.icon_color || 'var(--accent-cyan)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span className="cert-verified-tag">{cert.badge_text || 'Verified'}</span>
              </div>
              <h3 className="cert-title">{cert.title}</h3>
              <p className="cert-issuer">{cert.issuer}</p>
              <p className="cert-desc">{cert.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
