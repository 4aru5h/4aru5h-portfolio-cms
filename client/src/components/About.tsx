import type { CSSProperties } from 'react';
import { EDUCATION, EXPERIENCE, IDENTITY, SKILL_GROUPS } from '../data/portfolio';
import { useLiveClock } from '../hooks/useLiveClock';
import { GitHub } from './Icons';
import { WireframeGeometry } from './WireframeGeometry';

const i = (n: number) => ({ '--i': n }) as CSSProperties;

export function About() {
  const { ist } = useLiveClock();
  const current = EXPERIENCE.filter((e) => e.current);

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="panels screen about-screen">
      <div className="panels about-head">
        <div className="cell about-title-cell" data-reveal>
          <p className="eyebrow">
            <span className="eyebrow-index">03</span>
            <span className="eyebrow-rule" aria-hidden="true" />
            <span>About</span>
          </p>
          <h2 className="sec-title about-title" id="about-title">
            <span className="px" data-px="-50">
              {IDENTITY.aboutHeading}
            </span>
          </h2>
        </div>
        <div className="cell about-copy" data-reveal style={i(1)}>
          {IDENTITY.aboutCopy.map((p) => (
            <p key={p} className="about-text">
              {p}
            </p>
          ))}
        </div>
      </div>

      <dl className="panels facts">
        <div className="cell fact" data-reveal style={i(0)}>
          <dt>Studying</dt>
          <dd>
            {EDUCATION.degree}
            <span>
              {EDUCATION.school} · {EDUCATION.period}
            </span>
          </dd>
        </div>
        <div className="cell cell-mint fact" data-reveal style={i(1)}>
          <dt>Currently</dt>
          <dd>
            {current.map((e) => (
              <span key={e.id} className="fact-line">
                {e.role}, {e.org}
              </span>
            ))}
          </dd>
        </div>
        <div className="cell cell-raised fact" data-reveal style={i(2)}>
          <dt>Based in</dt>
          <dd>
            {IDENTITY.location}
            <span>{ist} IST · UTC+5:30</span>
          </dd>
        </div>
      </dl>
      </div>

      <div id="toolbox" className="panels screen toolbox" aria-labelledby="toolbox-title">
        <div className="cell toolbox-aside" data-reveal>
          <div className="toolbox-sticky">
            <div className="toolbox-heading">
              <p className="eyebrow">
                <span className="eyebrow-index">04</span>
                <span className="eyebrow-rule" aria-hidden="true" />
                <span>Toolbox</span>
              </p>
              <h2 className="toolbox-title" id="toolbox-title">
                <span className="px" data-px="-40">
                  What I work with.
                </span>
              </h2>
            </div>
            <p className="toolbox-lede">
              What I reach for when I'm building, attacking or measuring something. Every item here shows up in a project or a
              role above.
            </p>
            <a href={IDENTITY.github} target="_blank" rel="noopener noreferrer" className="bar">
              <span>Browse my repositories</span>
              <GitHub size={18} />
            </a>
          </div>
        </div>

        <div className="toolbox-modules">
          {SKILL_GROUPS.map((g, n) => (
            <div key={g.id} className="cell tool-module" data-reveal style={i(n % 2)}>
              <div className="tool-module-head">
                <span className="tool-index">{String(n + 1).padStart(2, '0')}</span>
                <h4 className="tool-title">{g.title}</h4>
                <WireframeGeometry kind={g.wireframe} />
              </div>
              <ul className="square-list">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
