import { useState, type CSSProperties, type MouseEvent } from 'react';
import { IDENTITY } from '../data/portfolio';
import { useLiveClock } from '../hooks/useLiveClock';
import { HalftoneField } from './HalftoneField';
import { ArrowRight, ArrowUp, ArrowUpRight, Check, Copy, GitHub, LinkedIn } from './Icons';
import { NAV_ITEMS } from './Header';
import { ResumeButton } from './ResumeButton';
import { pulse } from '../fx/pulse';

export function Footer() {
  const { ist, utc } = useLiveClock();
  const [copied, setCopied] = useState(false);

  const copyEmail = async (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    try {
      await navigator.clipboard.writeText(IDENTITY.email);
      setCopied(true);
      pulse(r.left + r.width / 2, r.top + r.height / 2, 'copy');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${IDENTITY.email}`;
    }
  };

  return (
    <footer className="site-footer">
      <section id="contact" className="section screen contact-screen" aria-labelledby="contact-title">
        {/* Knockout banner */}
        <div className="banner">
          <HalftoneField variant="footer" />
          <div className="banner-inner">
            <p className="eyebrow">
              <span className="eyebrow-index">05</span>
              <span className="eyebrow-rule" aria-hidden="true" />
              <span>Contact</span>
            </p>
            <h2 className="banner-title" id="contact-title">
              <span className="knockout" data-px="-90">
                Let's build
              </span>{' '}
              <span className="knockout" data-px="70">
                something
              </span>{' '}
              <span className="knockout-row" data-px="-40">
                <span className="knockout knockout-mint">resilient.</span>
                <a href={`mailto:${IDENTITY.email}`} className="knockout-go" aria-label={`Email ${IDENTITY.name}`}>
                  <ArrowRight size={30} />
                </a>
              </span>
            </h2>
          </div>
        </div>

        <div className="panels contact-grid">
          <div className="cell contact-main" data-reveal>
            <p className="contact-lede">
              Hiring for a security or engineering internship, or want to build something together? Email is the fastest
              way to reach me.
            </p>
            <div className="contact-email">
              <a href={`mailto:${IDENTITY.email}`} className="contact-email-link">
                {IDENTITY.email}
              </a>
              <button type="button" className="copy-btn" onClick={copyEmail}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="cell contact-links" data-reveal style={{ '--i': 1 } as CSSProperties}>
            <p className="cell-label">On this page</p>
            <ul className="footer-nav">
              {NAV_ITEMS.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} className="footer-link">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="footer-social">
              <li>
                <a href={IDENTITY.github} target="_blank" rel="noopener noreferrer" className="footer-link">
                  <GitHub size={16} />
                  <span>GitHub</span>
                  <ArrowUpRight size={14} />
                </a>
              </li>
              <li>
                <a href={IDENTITY.linkedin} target="_blank" rel="noopener noreferrer" className="footer-link">
                  <LinkedIn size={16} />
                  <span>LinkedIn</span>
                  <ArrowUpRight size={14} />
                </a>
              </li>
            </ul>
          </div>

          <div className="cell contact-clock" data-reveal style={{ '--i': 2 } as CSSProperties}>
            <p className="cell-label">Local time</p>
            <div className="clocks">
              <p className="clock">
                <span className="clock-city">Mumbai</span>
                <span className="clock-time">{ist} IST</span>
              </p>
              <p className="clock">
                <span className="clock-city">Global</span>
                <span className="clock-time">{utc}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="panels footer-bottom">
        <div className="cell footer-brand">
          <div className="px" data-px="-140">
            <span className="footer-wordmark" aria-hidden="true">
              {IDENTITY.handle}
            </span>
          </div>
          <p className="footer-note">
            <span>© {new Date().getFullYear()} {IDENTITY.name}</span>
            <span>Designed and built from scratch</span>
          </p>
        </div>
        <div className="footer-ctas">
          <ResumeButton className="bar bar-tall" />
          <a href={`mailto:${IDENTITY.email}`} className="bar bar-tall bar-mint">
            <span>Start a conversation</span>
            <ArrowUpRight size={20} />
          </a>
          <a href="#top" className="bar bar-tall bar-quiet">
            <span>Back to top</span>
            <ArrowUp size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
