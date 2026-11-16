import type { CSSProperties } from 'react';
import { IDENTITY, METRICS } from '../data/portfolio';
import { useLiveClock } from '../hooks/useLiveClock';
import { CountUp } from './CountUp';
import { HalftoneField } from './HalftoneField';
import { ArrowDown, ArrowRight } from './Icons';
import { ResumeButton } from './ResumeButton';
import { Terminal } from './Terminal';

const d = (n: number) => ({ '--d': n }) as CSSProperties;
const i = (n: number) => ({ '--i': n }) as CSSProperties;

export function Hero() {
  const { ist } = useLiveClock();
  const ticker = IDENTITY.tickerItems.join('  ·  ');
  const tickerEl = (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        <span>{ticker}</span>
        <span>{ticker}</span>
      </div>
    </div>
  );

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      {/* First screen: fills the viewport on every device */}
      <div className="panels hero-grid">
        <div className="cell hero-poster">
          <p className="hero-poster-meta" data-enter style={d(0)}>
            <span>Portfolio · {new Date().getFullYear()}</span>
            <span className="hero-poster-tags">Security · Systems · Compilers</span>
          </p>
          <div className="px" data-px="-90" data-pfrom="top">
            <p className="poster-word" aria-label={IDENTITY.handle}>
              {Array.from(IDENTITY.handle).map((ch, n) => (
                <span key={n} className={`poster-letter ${/[0-9]/.test(ch) ? 'is-digit' : ''}`} style={i(n)} aria-hidden="true">
                  <span>{ch}</span>
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="cell cell-art hero-art-top" data-gl="hero">
          <div className="px px-fill" data-py="70" data-pfrom="top">
            <HalftoneField variant="hero-top" />
          </div>
        </div>

        <div className="cell cell-art hero-art" data-gl="hero">
          <HalftoneField variant="hero-left" />
        </div>

        <div className="cell hero-pitch">
          <div className="hero-pitch-body">
            <p className="hero-status" data-enter style={d(1)}>
              <span className="status-dot" aria-hidden="true" />
              <span>
                {IDENTITY.role} · {IDENTITY.location}
              </span>
              <span className="hero-status-time">{ist} IST</span>
            </p>
            <h1 className="hero-title" id="hero-title" data-enter style={d(2)}>
              <span className="hero-title-line">{IDENTITY.headline[0]}</span>{' '}
              <span className="hero-title-line hero-title-accent">{IDENTITY.headline[1]}</span>
            </h1>
          </div>
          <div className="bar-row hero-actions" data-enter style={d(3)}>
            <a href="#work" className="bar bar-mint">
              <span>See my work</span>
              <ArrowRight size={18} />
            </a>
            <ResumeButton className="bar" />
          </div>
        </div>

        <div className="cell cell-mint hero-blurb hero-blurb-lg">
          <p className="hero-intro" data-enter style={d(3)}>
            {IDENTITY.intro}
          </p>
          {tickerEl}
        </div>

        <div className="cell cell-bone hero-knockout" aria-hidden="true">
          <div className="px" data-px="110" data-pfrom="top">
            <span className="knockout-word">First principles.</span>
          </div>
        </div>

        <div className="cell cell-raised hero-name">
          <div className="px" data-px="-70" data-pfrom="top">
            <p className="hero-name-text">{IDENTITY.name}</p>
          </div>
          <a href="#lab" className="scroll-cue">
            <span>Scroll</span>
            <ArrowDown size={16} />
          </a>
        </div>
      </div>

      {/* Just below the fold: the playable terminal + the proof */}
      <div className="panels hero-lab" id="lab">
        {/* Phones: the intro sits just under the first screen so the poster can own it */}
        <div className="cell cell-mint hero-blurb hero-blurb-sm" data-reveal>
          <p className="hero-intro">{IDENTITY.intro}</p>
          {tickerEl}
        </div>
        <div className="cell hero-term" data-reveal>
          <Terminal />
        </div>
        <ul className="panels stats" aria-label="Highlights">
          {METRICS.map((m, n) => (
            <li
              key={m.projectId}
              className={`stat stat-${n === 0 ? 'mint' : n === 1 ? 'surface' : 'raised'}`}
              data-reveal
              style={i(n + 1)}
            >
              <a href={`#${m.projectId}`} className="stat-link">
                <span className="stat-top">
                  <span className="stat-value">
                    <CountUp value={m.value} />
                  </span>
                  <span className="stat-label">{m.label}</span>
                </span>
                <span className="stat-context">{m.context}</span>
                <span className="stat-go" aria-hidden="true">
                  <ArrowRight size={18} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
