import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { IDENTITY } from '../data/portfolio';
import { useActiveSection } from '../hooks/useActiveSection';
import { useLiveClock } from '../hooks/useLiveClock';
import { ArrowRight, GitHub, LinkedIn, Logo, Mail } from './Icons';
import { ResumeButton } from './ResumeButton';

export const NAV_ITEMS = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'toolbox', label: 'Toolbox' },
  { id: 'contact', label: 'Contact' },
];

const SECTION_IDS = NAV_ITEMS.map((n) => n.id);

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  const { ist } = useLiveClock();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll lock, focus trap and Escape while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const drawer = drawerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawer?.querySelector<HTMLElement>('a, button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !drawer) return;
      const focusables = [
        toggleRef.current,
        ...Array.from(drawer.querySelectorAll<HTMLElement>('a, button')),
      ].filter(Boolean) as HTMLElement[];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const onResize = () => {
      if (window.innerWidth > 860) setMenuOpen(false);
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`site-header ${scrolled || menuOpen ? 'is-scrolled' : ''}`}>
        <div className="header-grid">
          <a href="#top" className="header-mark" aria-label={`${IDENTITY.name}, back to top`} onClick={closeMenu}>
            <Logo size={26} />
          </a>

          <div className="header-meta">
            <span className="header-name">{IDENTITY.name}</span>
            <span className="header-clock">
              <span className="status-dot" aria-hidden="true" />
              Mumbai · {ist} IST
            </span>
          </div>

          <nav className="header-nav" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link ${active === item.id ? 'is-active' : ''}`}
                aria-current={active === item.id ? 'location' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <ResumeButton className="header-cta" label="Résumé" iconAfter={false} />
          <a href={`mailto:${IDENTITY.email}`} className="header-cta header-cta-mint">
            <Mail size={16} />
            <span>Email me</span>
          </a>

          <button
            ref={toggleRef}
            type="button"
            className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
          </button>
        </div>
        <span className="scroll-progress" aria-hidden="true" />
      </header>

      <div
        id="mobile-menu"
        ref={drawerRef}
        className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!menuOpen}
      >
        <nav className="mobile-menu-links" aria-label="Mobile">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`mobile-menu-link ${active === item.id ? 'is-active' : ''}`}
              style={{ '--i': i } as CSSProperties}
              onClick={closeMenu}
            >
              <span className="mobile-menu-index">0{i + 1}</span>
              <span>{item.label}</span>
              <ArrowRight size={22} />
            </a>
          ))}
        </nav>
        <div className="mobile-menu-foot">
          <div className="mobile-menu-ctas">
            <a href={`mailto:${IDENTITY.email}`} className="bar bar-mint" onClick={closeMenu}>
              <span>Email me</span>
              <Mail size={18} />
            </a>
            <ResumeButton className="bar" onDone={closeMenu} />
          </div>
          <div className="mobile-menu-socials">
            <a href={IDENTITY.github} target="_blank" rel="noopener noreferrer" className="icon-link">
              <GitHub size={18} />
              <span>GitHub</span>
            </a>
            <a href={IDENTITY.linkedin} target="_blank" rel="noopener noreferrer" className="icon-link">
              <LinkedIn size={18} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
