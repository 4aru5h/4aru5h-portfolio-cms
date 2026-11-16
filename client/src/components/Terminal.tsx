import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { IDENTITY, PROJECTS, SKILL_GROUPS } from '../data/portfolio';
import { downloadResume } from '../lib/resume';
import { pulseFrom } from '../fx/pulse';

type Tone = 'cmd' | 'out' | 'dim' | 'ok' | 'warn' | 'err' | 'accent';

interface Line {
  id: number;
  tone: Tone;
  text: string;
  href?: string;
  external?: boolean;
}

type LineInput = Omit<Line, 'id'>;
type Emit = (lines: LineInput[], delay?: number) => Promise<void>;

const PROMPT = 'aarush@4aru5h:~$';
const CHIPS = ['help', 'projects', 'scan', 'bolt', 'resume'];
const MAX_LINES = 220;

const o = (text: string, tone: Tone = 'out', extra: Partial<LineInput> = {}): LineInput => ({ text, tone, ...extra });

function istNow() {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(new Date())
    .toUpperCase();
}

function scrollToId(id: string) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

const COMMANDS: Record<string, { hint: string; run: (emit: Emit, args: string[]) => Promise<void> | void }> = {
  help: {
    hint: 'list commands',
    run: (emit) =>
      emit(
        [
          o('Commands', 'accent'),
          o('  whoami     who is this?'),
          o("  projects   what I've built"),
          o('  open <n>   jump to project n'),
          o('  scan       run the recon demo'),
          o('  bolt       run a bolt-lang program'),
          o('  pitch      tune a sung note'),
          o('  skills     the toolbox'),
          o('  resume     download my résumé (PDF)'),
          o('  contact    how to reach me'),
          o('  clear      clear the screen'),
          o('Tip: ↑ ↓ for history, Tab to autocomplete.', 'dim'),
        ],
        18,
      ),
  },
  whoami: {
    hint: 'who is this?',
    run: (emit) =>
      emit(
        [
          o(`${IDENTITY.name} (${IDENTITY.handle})`, 'accent'),
          o('Aspiring security engineer'),
          o('Computer engineering @ NMIMS MPSTME'),
          o(`${IDENTITY.location} · ${istNow()} IST`, 'dim'),
        ],
        90,
      ),
  },
  projects: {
    hint: "what I've built",
    run: (emit) =>
      emit(
        [
          ...PROJECTS.map((p) => o(`${p.index}  ${p.title.padEnd(26, ' ')}${p.domain}`, 'out', { href: `#${p.id}` })),
          o('Type `open 1` (or 2, 3) to jump to one.', 'dim'),
        ],
        60,
      ),
  },
  open: {
    hint: 'jump to a project',
    run: (emit, args) => {
      const n = Number.parseInt(args[0] ?? '', 10);
      const project = PROJECTS[n - 1];
      if (!project) return emit([o('usage: open <1-3>', 'err')]);
      scrollToId(project.id);
      return emit([o(`Opening ${project.title}…`, 'ok')]);
    },
  },
  scan: {
    hint: 'recon demo',
    run: (emit) =>
      emit(
        [
          o('nmap -sS -sV 192.168.56.20 (lab target)', 'dim'),
          o('PORT  SERVICE  VERSION', 'dim'),
          o('21    ftp      vsftpd 2.3.4', 'warn'),
          o('23    telnet   Linux telnetd', 'warn'),
          o('80    http     Apache 2.2.8'),
          o('CVE-2011-2523 vsftpd backdoor · 9.8', 'err'),
          o('CVE-2004-2687 distcc RCE      · 9.8', 'err'),
          o('+ Heartbleed, DNS AXFR, plaintext Telnet', 'warn'),
          o('Full PTES report · see project 01', 'ok', { href: '#threat-detection' }),
        ],
        240,
      ),
  },
  bolt: {
    hint: 'run bolt-lang',
    run: (emit) =>
      emit(
        [
          o('$ bolt run factorial.bolt', 'dim'),
          o('def factorial(n) {'),
          o('    if n <= 1 {'),
          o('        give 1;'),
          o('    }'),
          o('    give n * factorial(n - 1);'),
          o('}'),
          o('emit(factorial(5));'),
          o('lexer → parser → AST → interpreter · Web Worker', 'dim'),
          o('120', 'ok'),
          o('Try it yourself: boltlang.vercel.app ↗', 'accent', { href: 'https://boltlang.vercel.app', external: true }),
        ],
        110,
      ),
  },
  pitch: {
    hint: 'tune a note',
    run: (emit) =>
      emit(
        [
          o('>> run_demo   % C4 E4 G4 A4, sung off-key', 'dim'),
          o('denoise → YIN pitch → snap to key → TD-PSOLA', 'dim'),
          o('mean pitch error  29.23 → 2.50 cents'),
          o('91.4% less error · formants preserved', 'ok'),
          o('10 s of audio in 1.4 s · no toolboxes', 'ok'),
        ],
        220,
      ),
  },
  skills: {
    hint: 'the toolbox',
    run: (emit) =>
      emit(
        SKILL_GROUPS.flatMap((g) => [o(g.title, 'accent'), o(`  ${g.items.join(', ')}`)]),
        40,
      ),
  },
  resume: {
    hint: 'download PDF',
    run: async (emit) => {
      await emit([o('Generating résumé from site data…', 'dim')]);
      try {
        await downloadResume();
        await emit([o('Saved Aarush-Sharma-Resume.pdf', 'ok')]);
      } catch {
        await emit([o('Could not generate the PDF. Try the Résumé button above.', 'err')]);
      }
    },
  },
  contact: {
    hint: 'reach me',
    run: (emit) =>
      emit(
        [
          o(`email     ${IDENTITY.email}`, 'out', { href: `mailto:${IDENTITY.email}` }),
          o('github    github.com/4aru5h ↗', 'out', { href: IDENTITY.github, external: true }),
          o('linkedin  linkedin.com/in/4aru5h ↗', 'out', { href: IDENTITY.linkedin, external: true }),
        ],
        60,
      ),
  },
  ls: {
    hint: 'list files',
    run: (emit) => emit([o('projects/  experience/  about.txt  resume.pdf')]),
  },
  cat: {
    hint: 'read a file',
    run: (emit, args) => {
      if (args[0] === 'about.txt') return emit([o(IDENTITY.aboutCopy[0])]);
      if (args[0] === 'resume.pdf') return emit([o('That is binary. Try `resume` instead.', 'dim')]);
      return emit([o(`cat: ${args[0] ?? ''}: no such file`, 'err')]);
    },
  },
  sudo: {
    hint: '',
    run: (emit) => emit([o('Permission denied. Nice try though. This incident will be reported.', 'err')]),
  },
  exit: {
    hint: '',
    run: (emit) => emit([o('There is no exit. Try scrolling down instead.', 'dim')]),
  },
};

const COMMAND_NAMES = Object.keys(COMMANDS).concat('clear');

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [introDone, setIntroDone] = useState(false);
  const history = useRef<string[]>([]);
  const histIdx = useRef<number>(-1);
  const nextId = useRef(0);
  const fast = useRef(false);
  const running = useRef<Promise<void>>(Promise.resolve());
  const introStarted = useRef(false);
  const introCancelled = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const wait = useCallback(async (ms: number) => {
    let t = 0;
    while (t < ms && !fast.current && !reduced.current) {
      await new Promise((r) => window.setTimeout(r, Math.min(40, ms - t)));
      t += 40;
    }
  }, []);

  const push = useCallback((items: LineInput[]) => {
    setLines((prev) => {
      const next = prev.concat(items.map((l) => ({ ...l, id: nextId.current++ })));
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
    });
  }, []);

  const emit: Emit = useCallback(
    async (items, delay = 0) => {
      for (const item of items) {
        push([item]);
        if (delay) await wait(delay);
      }
    },
    [push, wait],
  );

  const runCommand = useCallback(
    async (raw: string) => {
      const cmdline = raw.trim();
      push([{ tone: 'cmd', text: cmdline }]);
      if (!cmdline) return;
      const [name, ...args] = cmdline.split(/\s+/);
      const key = name.toLowerCase();
      if (key === 'clear') {
        setLines([]);
        return;
      }
      if (key === 'cd') {
        if (args[0]?.startsWith('proj')) return COMMANDS.projects.run(emit, []);
        return emit([o('Nothing to cd into here. Try `projects`.', 'dim')]);
      }
      if (key === 'echo') return emit([o(args.join(' '))]);
      if (key === 'rm') return emit([o('Not on my machine.', 'err')]);
      const command = COMMANDS[key];
      if (!command) {
        return emit([o(`command not found: ${name}`, 'err'), o('Type `help` to see what is available.', 'dim')]);
      }
      await command.run(emit, args);
    },
    [emit, push],
  );

  /** Queue a command: finishes whatever is streaming instantly, then runs. */
  const execute = useCallback(
    async (cmd: string, opts: { typed?: boolean } = {}) => {
      fast.current = true;
      await running.current;
      fast.current = false;
      const task = (async () => {
        if (opts.typed) {
          for (let i = 1; i <= cmd.length; i += 1) {
            if (fast.current) break;
            setInput(cmd.slice(0, i));
            await wait(55);
          }
          setInput('');
        }
        await runCommand(cmd);
      })();
      running.current = task;
      await task;
    },
    [runCommand, wait],
  );

  // Intro plays once the terminal is on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const start = async () => {
      if (introStarted.current) return;
      introStarted.current = true;
      const steps: (() => Promise<void>)[] = [
        () => wait(500),
        () => execute('whoami', { typed: true }),
        () => wait(650),
        () => execute('scan', { typed: true }),
        () => wait(300),
        async () => push([o('Your turn. Type `help`, or tap a command below.', 'dim')]),
      ];
      for (const step of steps) {
        if (introCancelled.current) break;
        await step();
      }
      setIntroDone(true);
    };
    if (!('IntersectionObserver' in window)) {
      void start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void start();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [execute, push, wait]);

  // Keep the newest output in view without moving the page.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, input]);

  /** Any visitor interaction ends the intro: the current step finishes instantly. */
  const takeOver = () => {
    if (introDone) return;
    introCancelled.current = true;
    fast.current = true;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = input;
    setInput('');
    if (value.trim()) {
      history.current.push(value.trim());
      histIdx.current = history.current.length;
    }
    if (value.trim()) pulseFrom(rootRef.current, 'term');
    void execute(value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = history.current;
    if (e.key === 'ArrowUp' && h.length) {
      e.preventDefault();
      histIdx.current = Math.max(0, histIdx.current - 1);
      setInput(h[histIdx.current] ?? '');
    } else if (e.key === 'ArrowDown' && h.length) {
      e.preventDefault();
      histIdx.current = Math.min(h.length, histIdx.current + 1);
      setInput(h[histIdx.current] ?? '');
    } else if (e.key === 'Tab' && input.trim()) {
      const matches = COMMAND_NAMES.filter((c) => c.startsWith(input.trim().toLowerCase()));
      if (matches.length === 1) {
        e.preventDefault();
        setInput(`${matches[0]} `);
      } else if (matches.length > 1) {
        e.preventDefault();
        push([{ tone: 'cmd', text: input }, o(matches.join('  '), 'dim')]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const focusInput = () => {
    if (window.getSelection()?.toString()) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="term" ref={rootRef}>
      <div className="term-bar">
        <span className="term-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="term-title">aarush@4aru5h: ~</span>
        <span className="term-status">
          <span className="term-status-dot" aria-hidden="true" />
          interactive
        </span>
      </div>

      <div className="term-body" ref={scrollerRef} onClick={focusInput}>
        <div className="term-log" role="log" aria-live={introDone ? 'polite' : 'off'} aria-label="Terminal output">
          {lines.map((line) => (
            <div key={line.id} className={`tl tl-${line.tone}`}>
              {line.tone === 'cmd' && (
                <span className="tl-prompt" aria-hidden="true">
                  {PROMPT}{' '}
                </span>
              )}
              {line.href ? (
                <a
                  href={line.href}
                  className="tl-link"
                  {...(line.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {line.text}
                </a>
              ) : (
                line.text
              )}
            </div>
          ))}
        </div>

        <form className="term-input-row" onSubmit={onSubmit}>
          <label htmlFor="term-input" className="tl-prompt">
            <span aria-hidden="true">{PROMPT}</span>
            <span className="sr-only">Type a terminal command, for example help</span>
          </label>
          <input
            id="term-input"
            ref={inputRef}
            className="term-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={takeOver}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
          />
        </form>
      </div>

      <div className="term-chips" role="group" aria-label="Quick commands">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            className="chip-btn"
            onClick={() => {
              takeOver();
              pulseFrom(rootRef.current, 'term');
              void execute(c, { typed: true });
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
