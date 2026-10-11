import React from 'react';

export default function ResumeSection({ content = {}, settings = {}, onCopyEmail }) {
  const resumeUrl = settings.resume_pdf_url || 'resume.pdf';
  const email = settings.email || content.hero_email || 'iamaarushmohan@gmail.com';

  return (
    <section id="resume-view">
      <div className="container">
        <div className="section-header reveal visible">
          <p className="section-label">{content.resume_label || 'Curriculum Vitae'}</p>
          <h2 className="section-title">{content.resume_title || 'Resume Overview'}</h2>
          <p className="section-desc">{content.resume_desc || 'Academic background, cybersecurity competencies, and developer leadership.'}</p>
        </div>

        <div className="resume-view-card reveal visible">
          <div className="resume-view-top">
            <div className="resume-view-title">
              <h3>{content.resume_name || 'Aarush Sharma'}</h3>
              <p>{content.resume_tagline || 'Computer Engineering • Cybersecurity & DevSecOps'}</p>
            </div>
            <div className="resume-view-actions">
              <a href={resumeUrl} className="btn-primary" download style={{ padding: '8px 18px', fontSize: '13px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </a>
              <button className="btn-ghost" onClick={() => onCopyEmail(email)} style={{ padding: '8px 16px', fontSize: '13px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Copy Email
              </button>
            </div>
          </div>

          <div className="resume-grid-layout">
            <div>
              <p className="resume-sub-heading">Education</p>
              <div className="resume-block">
                <h4 className="resume-block-title">{content.resume_education_title || 'Mukesh Patel School of Technology Management & Engineering (MPSTME), NMIMS'}</h4>
                <div className="resume-block-meta">{content.resume_education_meta || "B.Tech Integrated in Computer Engineering // 2024 – 2029 (Mumbai, India)"}</div>
                <p className="resume-block-desc">{content.resume_education_desc || 'Specializing in Cybersecurity, Penetration Testing, Network Packet Analysis, DevSecOps pipelines, and Software Development.'}</p>
              </div>

              <p className="resume-sub-heading" style={{ marginTop: '24px' }}>Core Capabilities</p>
              <div className="resume-block">
                <p className="resume-block-desc" style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Security: </strong>
                  {content.resume_skills_security || 'Wireshark, Nessus, Kali Linux, Penetration Testing, Network Analysis, DevSecOps, Vulnerability Audits, SSL/TLS, TCP/IP.'}
                </p>
                <p className="resume-block-desc" style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Development: </strong>
                  {content.resume_skills_dev || 'Python, Java, C/C++, Kotlin, PHP, JavaScript, React, Node.js, HTML5/CSS3, Bootstrap 5, REST APIs.'}
                </p>
                <p className="resume-block-desc">
                  <strong style={{ color: 'var(--text-primary)' }}>Databases &amp; Systems: </strong>
                  {content.resume_skills_db || 'MySQL, MongoDB, Linux/Unix Internals, Data Structures & Algorithms, Pinecone Vector DB, Godot Engine.'}
                </p>
              </div>
            </div>

            <div>
              <p className="resume-sub-heading">Experience Highlights</p>
              <div className="resume-block">
                <h4 className="resume-block-title">Google Developer Group on Campus — Executive</h4>
                <div className="resume-block-meta">Aug 2026 – Present // SVKM's NMIMS MPSTME</div>
                <p className="resume-block-desc">Organizing developer initiatives, technical workshops, hackathons, and community tech sessions across campus.</p>
              </div>

              <div className="resume-block">
                <h4 className="resume-block-title">Complete Cinema — Web Development Intern</h4>
                <div className="resume-block-meta">May 2026 – Jul 2026 // Digital Media Publishing</div>
                <p className="resume-block-desc">Architected scalable WordPress website infrastructure, integrated Node.js microservices, and optimized database query execution.</p>
              </div>

              <div className="resume-block">
                <h4 className="resume-block-title">ISA Tech MPSTME — Web Design &amp; Development</h4>
                <div className="resume-block-meta">Mar 2025 – Sep 2025 // Collegiate Committee</div>
                <p className="resume-block-desc">Designed UI/UX systems in Figma and engineered responsive event registration portals in React and Bootstrap.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
