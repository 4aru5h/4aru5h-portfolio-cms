import React from 'react';

export default function ProjectsSection({ projects = [], content = {} }) {
  if (!projects || projects.length === 0) {
    return null;
  }

  const sorted = [...projects].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <section id="projects" style={{ padding: '60px 0' }}>
      <div className="container">
        <div className="section-header reveal visible">
          <p className="section-label">{content.projects_label || 'Selected Work'}</p>
          <h2 className="section-title">{content.projects_title || 'Projects & Builds'}</h2>
          <p className="section-desc">{content.projects_desc || 'Featured software systems, security tools, and exploratory projects.'}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {sorted.map(proj => {
            let techList = [];
            try {
              techList = Array.isArray(proj.technologies)
                ? proj.technologies
                : (typeof proj.technologies === 'string' ? JSON.parse(proj.technologies) : []);
            } catch (e) {
              techList = [];
            }

            return (
              <div key={proj.id} className="skill-category reveal visible" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>{proj.title}</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#9499ab', display: 'inline-flex', alignItems: 'center' }}
                        aria-label={`GitHub source for ${proj.title}`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                      </a>
                    )}
                    {proj.live_url && (
                      <a
                        href={proj.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center' }}
                        aria-label={`Live demo for ${proj.title}`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '13.5px', color: '#9499ab', lineHeight: '1.6', flex: 1, marginBottom: '16px' }}>
                  {proj.description}
                </p>

                {techList.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {techList.map((t, idx) => (
                      <span key={idx} className="timeline-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
