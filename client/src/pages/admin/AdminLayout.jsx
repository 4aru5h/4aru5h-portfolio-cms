import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/admin.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  const navItems = [
    { to: '/admin', label: 'Overview', exact: true },
    { to: '/admin/content', label: 'Website Text' },
    { to: '/admin/skills', label: 'Skills Manager' },
    { to: '/admin/categories', label: 'Skill Categories' },
    { to: '/admin/certifications', label: 'Certifications' },
    { to: '/admin/experiences', label: 'Work Experience' },
    { to: '/admin/projects', label: 'Projects' },
    { to: '/admin/blog', label: 'Blog Posts' },
    { to: '/admin/navigation', label: 'Navigation' },
    { to: '/admin/settings', label: 'Site Settings' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile drawer backdrop */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-show' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div className="admin-sidebar-header" style={{ margin: 0 }}>
            4aru5h // CMS
          </div>
          <button
            className="mobile-only"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#9499ab', padding: '4px' }}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-user-box">
          <span style={{ fontSize: '13px', color: '#9499ab', fontFamily: 'JetBrains Mono, monospace' }}>
            {user?.username || 'admin'}
          </span>
          <button
            onClick={handleLogout}
            style={{ fontSize: '12px', color: '#f87171', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="admin-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Toggle navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            <h2>Admin Dashboard</h2>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#38bdf8', textDecoration: 'none' }}>
            View Public Site &rarr;
          </a>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
