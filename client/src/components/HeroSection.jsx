import React from 'react';
import CtfTerminal from './CtfTerminal';

export default function HeroSection({ content = {}, settings = {}, onCopyEmail }) {
  const resumeUrl = settings.resume_pdf_url || 'resume.pdf';
  const email = settings.email || content.hero_email || 'iamaarushmohan@gmail.com';
  const profileImg = settings.profile_image_url;

  return (
    <section id="hero">
      <div className="container">
        <div className="hero-inner">
          
          {/* Left Column */}
          <div className="hero-content reveal visible">
            <div className="hero-terminal-badge">
              <span className="prompt-char">~</span>
              <span>{content.hero_terminal_badge || 'aarush@4aru5h.in // sec_core'}</span>
              <span className="cursor-blink"></span>
            </div>

            <h1 className="hero-title">
              {content.hero_greeting || "Hi, I'm"} <span className="gradient-text">{content.hero_name || "Aarush"}</span>
            </h1>
            <p className="hero-subtitle">{content.hero_subtitle || "Cybersecurity, Pentesting & Software Engineering"}</p>
            <p className="hero-description">
              {content.hero_description || "Computer Engineering student at MPSTME, NMIMS (B.Tech Integrated '29) based in Mumbai, India. Focused on offensive & defensive cybersecurity, network packet analysis, DevSecOps pipelines, and building resilient software architectures."}
            </p>

            <div className="hero-badges-row">
              <span className="hero-pill-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Cybersecurity &amp; Pentesting
              </span>
              <span className="hero-pill-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                Network Analysis
              </span>
              <span className="hero-pill-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>
                DevSecOps
              </span>
              <span className="hero-pill-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                Mumbai, India
              </span>
            </div>

            <div className="hero-actions">
              <a href="#resume-view" className="btn-primary" id="view-resume-btn" aria-label="Auto-scroll to view resume">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                View Resume
              </a>
              <a href={resumeUrl} className="btn-secondary" download aria-label="Download resume PDF">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </a>
              <div className="email-copy-wrap">
                <button className="btn-ghost" onClick={() => onCopyEmail(email)} aria-label="Copy email address">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  {email}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="hero-right-side reveal visible">
            <div className="hero-profile-bar">
              <div className="hero-profile-avatar">
                {profileImg && profileImg !== 'profile.jpg' ? (
                  <img src={profileImg} alt={content.hero_profile_name || 'Aarush'} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', color: 'var(--accent-cyan)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                )}
              </div>
              <div className="hero-profile-info">
                <div className="hero-profile-name">
                  {content.hero_profile_name || 'Aarush Sharma'}
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
                </div>
                <div className="hero-profile-status">{content.hero_profile_status || "MPSTME NMIMS '29 // Mumbai, IN"}</div>
              </div>
              <span className="ctf-terminal-tag">LIVE</span>
            </div>

            <CtfTerminal />
          </div>

        </div>
      </div>
    </section>
  );
}
