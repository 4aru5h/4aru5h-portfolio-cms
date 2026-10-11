import React from 'react';

export default function SkillsSection({ skills = [], categories = [], content = {} }) {
  // Group skills by category_id or category_name
  const groupedSkills = {};

  // Sort categories by display_order
  const sortedCategories = [...categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  sortedCategories.forEach(cat => {
    groupedSkills[cat.id] = {
      category: cat,
      items: []
    };
  });

  skills.forEach(skill => {
    if (groupedSkills[skill.category_id]) {
      groupedSkills[skill.category_id].items.push(skill);
    } else {
      if (!groupedSkills['other']) {
        groupedSkills['other'] = {
          category: { name: skill.category_name || 'Other Skills', icon_color: 'var(--accent-cyan)' },
          items: []
        };
      }
      groupedSkills['other'].items.push(skill);
    }
  });

  return (
    <section id="skills">
      <div className="container">
        <div className="section-header reveal visible">
          <p className="section-label">{content.skills_label || 'Technical Competencies'}</p>
          <h2 className="section-title">{content.skills_title || 'Skills & Capabilities'}</h2>
          <p className="section-desc">{content.skills_desc || 'Comprehensive toolsets across offensive/defensive cybersecurity, software engineering, and core systems.'}</p>
        </div>

        <div className="skills-grid">
          {Object.values(groupedSkills).map((group, idx) => (
            <div key={idx} className="skill-category reveal visible">
              <div className="skill-cat-icon" style={{ color: group.category.icon_color || 'var(--accent-cyan)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>
              </div>
              <h3 className="skill-cat-title">{group.category.name}</h3>
              <div className="skill-items">
                {group.items.map(skill => (
                  <span key={skill.id} className="skill-item">{skill.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
