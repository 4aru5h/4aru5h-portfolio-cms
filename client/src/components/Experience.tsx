import { useEffect, useState, type CSSProperties } from 'react';
import { EXPERIENCE, type ExperienceEntry } from '../data/portfolio';

const WIDE = '(min-width: 921px)';

function useWide() {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(WIDE).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

function Details({ entry }: { entry: ExperienceEntry }) {
  return (
    <>
      <p className="exp-summary">{entry.summary}</p>
      <ul className="bullets">
        {entry.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <ul className="chips" aria-label="Tools">
        {entry.stack.map((s) => (
          <li key={s} className="chip">
            {s}
          </li>
        ))}
      </ul>
    </>
  );
}

export function Experience() {
  const wide = useWide();
  const [activeId, setActiveId] = useState(EXPERIENCE[0].id);
  const [openId, setOpenId] = useState<string | null>(null);
  const active = EXPERIENCE.find((e) => e.id === activeId) ?? EXPERIENCE[0];

  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="panels screen ledger">
        <div className="ledger-left">
          <div className="cell ledger-head" data-reveal>
            <p className="eyebrow">
              <span className="eyebrow-index">02</span>
              <span className="eyebrow-rule" aria-hidden="true" />
              <span>Experience</span>
            </p>
            <h2 className="sec-title ledger-title" id="experience-title">
              <span className="px" data-px="-40">
                Where I've shipped.
              </span>
            </h2>
            <p className="sec-lede">
              Student chapters, a media company and an indie game studio.
            </p>
          </div>
        {wide && (
          <div className="cell ledger-preview" data-reveal style={{ '--i': 1 } as CSSProperties}>
            <div className="ledger-sticky" id="exp-preview" role="region" aria-label={`${active.role}, ${active.org}`}>
              <div className={`crest tone-${active.tone}`} key={active.id}>
                <div className="crest-meta">
                  <span>{active.period}</span>
                  <span>{active.location}</span>
                </div>
                <span className="crest-mono" aria-hidden="true">
                  {active.monogram}
                </span>
                <span className="crest-org">{active.fullOrg}</span>
              </div>
              <div className="crest-body" key={`${active.id}-body`}>
                <h3 className="crest-role">{active.role}</h3>
                <Details entry={active} />
              </div>
            </div>
          </div>
        )}
        </div>

        <ol className="ledger-rows">
          {EXPERIENCE.map((e, n) => {
            const isActive = wide && e.id === activeId;
            const isOpen = !wide && e.id === openId;
            const panelId = `${e.id}-details`;
            return (
              <li key={e.id} className="ledger-item" data-reveal style={{ '--i': n } as CSSProperties}>
                <button
                  type="button"
                  className={`ledger-row ${isActive || isOpen ? 'is-active' : ''}`}
                  onMouseEnter={wide ? () => setActiveId(e.id) : undefined}
                  onFocus={wide ? () => setActiveId(e.id) : undefined}
                  onClick={() => (wide ? setActiveId(e.id) : setOpenId((v) => (v === e.id ? null : e.id)))}
                  aria-controls={wide ? 'exp-preview' : panelId}
                  aria-expanded={wide ? undefined : isOpen}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="ledger-main">
                    <span className="ledger-org">{e.org}</span>
                    <span className="ledger-role">{e.role}</span>
                  </span>
                  <span className="ledger-aside">
                    {e.current && <span className="badge">Now</span>}
                    <span className="ledger-period">{e.period}</span>
                    <span className="ledger-plus" aria-hidden="true" />
                  </span>
                </button>

                {!wide && (
                  <div id={panelId} className="ledger-panel" hidden={!isOpen}>
                    <p className="ledger-panel-meta">
                      {e.fullOrg} · {e.location}
                    </p>
                    <Details entry={e} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
