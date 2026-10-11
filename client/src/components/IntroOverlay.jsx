import React, { useEffect, useState } from 'react';

const introData = [
  { text: '[BOOT] Initializing Aarush Sharma Core (4aru5h.in)...', cls: 'label' },
  { text: '[SEC] Loading Kali / Wireshark diagnostic modules .. ', status: 'OK', statusCls: 'status-ok' },
  { text: '[AUTH] Verified credentials (Google, IIT-R, CS50x) .. ', status: 'LOADED', statusCls: 'status-ok' },
  { text: '[NET] Establishing encrypted tunnel to Mumbai, IN ... ', status: 'LINKED', statusCls: 'status-sync' },
  { text: '[DEV] GDG Campus & MPSTME environment mounted ...... ', status: 'ACTIVE', statusCls: 'status-ok' },
  { text: '[SHIELD] DevSecOps & Penetration Testing Suite ..... ', status: 'ARMED', statusCls: 'status-ok' },
  { text: '[====] ALL SYSTEMS OPERATIONAL // CTF READY', cls: 'status-done' },
];

export default function IntroOverlay() {
  const [lines, setLines] = useState([]);
  const [percent, setPercent] = useState(0);
  const [progressVisible, setProgressVisible] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference or previously shown in this session
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeenIntro = sessionStorage.getItem('seen_intro_v2');

    if (prefersReducedMotion || hasSeenIntro) {
      setHidden(true);
      return;
    }

    document.body.style.overflow = 'hidden';
    const timers = [];

    timers.push(setTimeout(() => setHeaderVisible(true), 100));
    timers.push(setTimeout(() => setProgressVisible(true), 200));

    const lineDelay = 180;
    introData.forEach((item, i) => {
      timers.push(setTimeout(() => {
        setLines(prev => [...prev, item]);
        const pct = Math.round(((i + 1) / introData.length) * 100);
        setPercent(pct);
      }, 250 + i * lineDelay));
    });

    const totalDuration = 250 + introData.length * lineDelay + 350;
    timers.push(setTimeout(() => {
      setFadeOut(true);
      document.body.style.overflow = '';
      sessionStorage.setItem('seen_intro_v2', 'true');
      timers.push(setTimeout(() => setHidden(true), 600));
    }, totalDuration));

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = '';
    };
  }, []);

  if (hidden) return null;

  return (
    <div id="intro-overlay" className={fadeOut ? 'fade-out' : ''} aria-hidden="true">
      <div className="intro-container">
        <div className="intro-header" style={{ opacity: headerVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
          <span>4aru5h.in // SEC_CORE_INIT</span>
          <span>AARUSH SHARMA</span>
        </div>
        <div className="intro-lines" id="intro-lines">
          {lines.map((item, index) => (
            <div key={index} className="intro-line visible">
              {item.status ? (
                <>
                  <span className="label">{item.text}</span>
                  <span className={item.statusCls}>{item.status}</span>
                </>
              ) : (
                <span className={item.cls || 'label'}>{item.text}</span>
              )}
            </div>
          ))}
        </div>
        <div className={`intro-progress-wrap ${progressVisible ? 'visible' : ''}`} id="intro-progress">
          <div className="intro-progress-label">
            <span>Security Diagnostic &amp; Link Sync</span>
            <span id="intro-percent">{percent}%</span>
          </div>
          <div className="intro-progress-track">
            <div className="intro-progress-bar" id="intro-bar" style={{ width: `${percent}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
