import React from 'react';

export default function ExperienceSection({ experiences = [], content = {} }) {
  const sorted = [...experiences].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <section id="experience">
      <div className="container">
        <div className="section-header reveal visible">
          <p className="section-label">{content.experience_label || 'Career Journey'}</p>
          <h2 className="section-title">{content.experience_title || 'Work Experience'}</h2>
        </div>

        <div className="timeline">
          {sorted.map(exp => {
            let tags = [];
            try {
              tags = typeof exp.tags === 'string' ? JSON.parse(exp.tags) : (exp.tags || []);
            } catch (e) {
              tags = [];
            }

            return (
              <div key={exp.id} className="timeline-item reveal visible">
                <div className="timeline-dot"></div>
                <p className="timeline-date">{exp.date_range}</p>
                <h3 className="timeline-role">{exp.role}</h3>
                <p className="timeline-company">{exp.company}</p>
                <div className="timeline-desc">
                  <p>{exp.description}</p>
                  {tags.length > 0 && (
                    <div className="timeline-tags">
                      {tags.map((tag, tIdx) => (
                        <span key={tIdx} className="timeline-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
