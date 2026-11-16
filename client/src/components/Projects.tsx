import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { PROJECTS, type ProjectEntry } from '../data/portfolio';
import { ArrowDown, ArrowUpRight, GitHub } from './Icons';

function Console({ project }: { project: ProjectEntry }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mode = project.modes[active] ?? project.modes[0];
  const base = `${project.id}-console`;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const count = project.modes.length;
    let next = active;
    if (e.key === 'ArrowRight') next = (active + 1) % count;
    else if (e.key === 'ArrowLeft') next = (active - 1 + count) % count;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = count - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="console">
      <div className="console-head">
        <span className="console-kicker">Under the hood</span>
        <div className="console-tabs" role="tablist" aria-label={`${project.title}: technical views`} onKeyDown={onKeyDown}>
          {project.modes.map((m, i) => (
            <button
              key={m.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${m.id}`}
              aria-selected={i === active}
              aria-controls={`${base}-panel`}
              tabIndex={i === active ? 0 : -1}
              className={`console-tab ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div
        className="console-panel"
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${mode.id}`}
        tabIndex={0}
      >
        <p className="console-telemetry">
          <span className="status-dot" aria-hidden="true" />
          {mode.telemetry}
        </p>
        <p className="console-summary">{mode.summary}</p>
        <pre className="console-pre" key={mode.id}>
          <code>
            {mode.code.map((line, n) => (
              <span key={n} className="console-line" style={{ '--l': n } as CSSProperties}>
                {n < mode.code.length - 1 ? `${line}\n` : line}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function ProjectCard({ project, flipped }: { project: ProjectEntry; flipped: boolean }) {
  return (
    <article
      id={project.id}
      className={`panels screen project ${flipped ? 'is-flipped' : ''}`}
      aria-labelledby={`${project.id}-title`}
    >
      <div className="cell project-info" data-reveal>
        <div className="project-info-body">
          <p className="project-meta">
            <span className="project-index">{project.index}</span>
            <span>{project.domain}</span>
            <span className="project-year">{project.year}</span>
          </p>
          <h3 className="project-title" id={`${project.id}-title`}>
            {project.title}
          </h3>
          <p className="project-tagline">{project.tagline}</p>

          <ul className="bullets">
            {project.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <ul className="chips" aria-label="Built with">
            {project.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>

          <details className="project-deep">
            <summary>
              <span>How it's built</span>
              <span className="project-deep-icon" aria-hidden="true" />
            </summary>
            <p>{project.architecture}</p>
          </details>
        </div>

        <div className="bar-row project-actions">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="bar bar-mint">
              <span>{project.liveLabel ?? 'Open live'}</span>
              <ArrowUpRight size={18} />
            </a>
          )}
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="bar">
            <span>View source</span>
            <GitHub size={18} />
          </a>
        </div>
      </div>

      <div className="cell project-media" data-reveal style={{ '--i': 1 } as CSSProperties}>
        <div className="project-image">
          <div className="px px-img" data-py="-18">
            <img
              src={project.image}
            alt={project.imageAlt}
            width={1280}
            height={720}
            loading="lazy"
              decoding="async"
            />
          </div>
          <div className="project-metric">
            <span className="project-metric-value">{project.metric.value}</span>
            <span className="project-metric-label">{project.metric.label}</span>
          </div>
        </div>
        <Console project={project} />
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      {/* Opener: fills the screen; the index on the right jumps to each project */}
      <header className="panels screen work-open">
        <div className="cell work-open-title" data-reveal>
          <p className="eyebrow">
            <span className="eyebrow-index">01</span>
            <span className="eyebrow-rule" aria-hidden="true" />
            <span>Selected work</span>
          </p>
          <h2 className="sec-title work-title" id="work-title">
            <span className="px" data-px="-50">
              Three systems, built from first principles.
            </span>
          </h2>
          <p className="sec-lede">
            Each one started as a question about how something works underneath. The console beside each project
            shows real output; switch tabs to look inside.
          </p>
        </div>
        <ol className="work-index" aria-label="Projects">
          {PROJECTS.map((p, n) => (
            <li key={p.id} data-reveal style={{ '--i': n + 1 } as CSSProperties}>
              <a href={`#${p.id}`} className="work-index-link">
                <span className="work-index-num">{p.index}</span>
                <span className="work-index-main">
                  <span className="work-index-title">{p.title}</span>
                  <span className="work-index-domain">{p.domain}</span>
                </span>
                <span className="work-index-metric">
                  <span className="work-index-value">{p.metric.value}</span>
                  <span className="work-index-label">{p.metric.label}</span>
                </span>
                <ArrowDown size={22} />
              </a>
            </li>
          ))}
        </ol>
      </header>
      {PROJECTS.map((p, i) => (
        <ProjectCard key={p.id} project={p} flipped={i % 2 === 1} />
      ))}
    </section>
  );
}
