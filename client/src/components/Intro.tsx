import { useEffect, useState, type CSSProperties } from 'react';
import { IDENTITY } from '../data/portfolio';

const KEY = '4aru5h:intro-seen';
const HOLD_MS = 1450; // counter + letters, then the panels lift
const OUT_MS = 850;

/** Decide once, before React renders, so the hero can delay its own entrance. */
export function shouldPlayIntro(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (sessionStorage.getItem(KEY)) return false;
    sessionStorage.setItem(KEY, '1');
    return true;
  } catch {
    return false;
  }
}

/** Opening sequence: the grid panels boot up, count to 100, then lift away to reveal the hero. */
export function Intro() {
  const [phase, setPhase] = useState<'in' | 'out' | 'off'>(() =>
    document.documentElement.classList.contains('intro-play') ? 'in' : 'off',
  );
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (phase === 'off') return;
    if (phase === 'in') {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
      const start = performance.now();
      let raf = 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / (HOLD_MS - 150));
        setCount(Math.round(100 * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      const timer = window.setTimeout(() => setPhase('out'), HOLD_MS);
      const skip = () => setPhase('out');
      window.addEventListener('keydown', skip, { once: true });
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(timer);
        window.removeEventListener('keydown', skip);
      };
    }
    // phase === 'out'
    setCount(100);
    const timer = window.setTimeout(() => {
      document.body.style.overflow = '';
      setPhase('off');
    }, OUT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'off') return null;

  return (
    <div className={`intro is-${phase}`} aria-hidden="true" onClick={() => setPhase('out')}>
      <div className="intro-cols">
        {Array.from({ length: 5 }, (_, n) => (
          <span key={n} style={{ '--i': n } as CSSProperties} />
        ))}
      </div>
      <div className="intro-content">
        <p className="intro-line">
          <span>
            <span className="intro-prompt">aarush@4aru5h:~$</span> ./boot --portfolio
          </span>
          <span className="intro-hide-sm">{IDENTITY.location}</span>
        </p>
        <p className="intro-word">
          {Array.from(IDENTITY.handle).map((ch, n) => (
            <span key={n} className={`intro-letter ${/[0-9]/.test(ch) ? 'is-digit' : ''}`} style={{ '--i': n } as CSSProperties}>
              <span>{ch}</span>
            </span>
          ))}
        </p>
        <div className="intro-foot">
          <span className="intro-count">{String(count).padStart(3, '0')}</span>
          <span className="intro-tags">Security · Systems · Compilers</span>
        </div>
        <span className="intro-bar" style={{ transform: `scaleX(${count / 100})` }} />
      </div>
    </div>
  );
}
