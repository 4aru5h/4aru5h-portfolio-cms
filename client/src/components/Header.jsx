import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header({ onOpenCmdPalette, content = {}, navItems = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function toggleMobileMenu() {
    setMobileOpen(!mobileOpen);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  // Fallback items if navigation API hasn't loaded
  const defaultItems = [
    { id: 1, label: 'Skills', href: '#skills' },
    { id: 2, label: 'Experience', href: '#experience' },
    { id: 3, label: 'Certificates', href: '#certifications' },
    { id: 4, label: 'Resume', href: '#resume-view' },
    { id: 5, label: 'Blog', href: '/blog' },
  ];

  const itemsToRender = navItems && navItems.length > 0 ? navItems : defaultItems;

  return (
    <>
      <div className={`mobile-nav-backdrop ${mobileOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      <header id="header" className={scrolled ? 'scrolled' : ''}>
        <nav className="nav-inner">
          <a href="#" className="nav-brand">
            {content.nav_brand_name || 'Aarush'} <span className="sep">/</span> <span className="alt">{content.nav_brand_alt || '4aru5h'}</span>
          </a>

          <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`} id="nav-links">
            {itemsToRender.map(item => {
              const isInternalRoute = item.href.startsWith('/') && !item.href.startsWith('/#');
              if (isInternalRoute) {
                return (
                  <Link key={item.id || item.href} to={item.href} onClick={closeMobileMenu}>
                    {item.label}
                  </Link>
                );
              }
              return (
                <a key={item.id || item.href} href={item.href} onClick={closeMobileMenu}>
                  {item.label}
                </a>
              );
            })}
            <button className="cmd-k-btn" onClick={() => { closeMobileMenu(); onOpenCmdPalette(); }} aria-label="Open command palette">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <kbd>Ctrl+K</kbd>
            </button>
          </div>

          <div className="nav-status" id="nav-status">
            <span className="status-dot"></span>
            {content.hero_status || 'Available for Projects / Internships'}
          </div>

          <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle navigation menu" aria-expanded={mobileOpen}>
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            )}
          </button>
        </nav>
      </header>
    </>
  );
}
