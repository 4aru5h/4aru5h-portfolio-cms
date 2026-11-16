/**
 * Single source of truth for the site AND the generated résumé PDF.
 * Edit facts here once; the page and src/lib/resume.ts both read from it.
 */

export interface Metric {
  value: string;
  label: string;
  context: string;
  projectId: string;
}

export type Wireframe = 'radar' | 'cube' | 'orbits' | 'lattice' | 'nodes';

export interface SkillGroup {
  id: string;
  title: string;
  /** Line-art glyph drawn in the skill panel. */
  wireframe: Wireframe;
  items: string[];
}

export interface ExperienceEntry {
  id: string;
  org: string;
  fullOrg: string;
  /** Short mark shown large in the experience preview panel. */
  monogram: string;
  /** Panel colour for the preview. */
  tone: 'mint' | 'bone' | 'teal' | 'amber';
  role: string;
  period: string;
  current?: boolean;
  location: string;
  summary: string;
  highlights: string[];
  stack: string[];
}

export interface ProjectMode {
  id: string;
  label: string;
  summary: string;
  telemetry: string;
  code: string[];
}

export interface ProjectEntry {
  id: string;
  index: string;
  title: string;
  domain: string;
  year: string;
  /** Plain-language pitch a recruiter gets on first read. */
  tagline: string;
  /** Technical deep-dive for engineers. */
  architecture: string;
  highlights: string[];
  stack: string[];
  metric: { value: string; label: string };
  repoUrl: string;
  liveUrl?: string;
  liveLabel?: string;
  image: string;
  imageAlt: string;
  modes: ProjectMode[];
}

export const IDENTITY = {
  name: 'Aarush Sharma',
  firstName: 'Aarush',
  handle: '4aru5h',
  role: 'Aspiring security engineer',
  location: 'Mumbai, India',
  email: 'iamaarushmohan@gmail.com',
  github: 'https://github.com/4aru5h',
  linkedin: 'https://www.linkedin.com/in/4aru5h',
  liveSite: 'https://4aru5h.in',
  headline: ['I build software from scratch,', 'then try to break it.'],
  intro:
    "I'm Aarush, a computer engineering student in Mumbai who would rather take a system apart than take its word for it. I learn by building things from nothing, then attacking them to see how they fail.",
  resumeSummary:
    'Computer engineering undergraduate and aspiring security engineer. Builds full-stack web platforms and low-level systems from first principles, then audits and attacks them to understand how they fail. Leads technical operations for Social Conclave and cybersecurity for GDG on Campus at NMIMS MPSTME.',
  /** Short statement for the mint hero panel. */
  mintLine: 'Offensive security, packet-level recon, and taking black boxes apart from the ground up.',
  tickerItems: ['Python', 'TypeScript', 'C / C++', 'MATLAB', 'Nmap', 'Wireshark', 'Kali Linux', 'Scikit-learn', 'React', 'Flask'],
  aboutHeading: 'I make and break stuff.',
  aboutCopy: [
    'I learn best by building something from nothing and then immediately trying to break it. A port scanner teaches you more about TCP than any lecture; writing a parser teaches you why languages are shaped the way they are.',
    'Outside the terminal I run tech for Social Conclave and lead cybersecurity for GDG on Campus at NMIMS MPSTME: shipping production platforms, teaching secure coding, and finding out how systems behave when they are pushed to their limits.',
  ],
} as const;

export const EDUCATION = {
  school: 'SVKM NMIMS MPSTME',
  degree: 'B.Tech Integrated, Computer Engineering',
  location: 'Mumbai, India',
  period: 'Class of 2029',
};

export const METRICS: Metric[] = [
  {
    value: '96.7%',
    label: 'Detection accuracy',
    context: 'Random Forest threat detector on a 5,000-event benchmark',
    projectId: 'threat-detection',
  },
  {
    value: '33',
    label: 'Vitest tests',
    context: "bolt-lang's lexer, parser and interpreter, all hand-written",
    projectId: 'bolt-lang',
  },
  {
    value: '91.4%',
    label: 'Pitch error cut',
    context: '29.23 to 2.50 cents, in base MATLAB with no toolboxes',
    projectId: 'vocal-pitch-corrector',
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'security',
    wireframe: 'radar',
    title: 'Offensive security',
    items: [
      'PTES pentesting',
      'STRIDE threat modelling',
      'TCP recon & Nmap',
      'Wireshark',
      'Kali Linux',
      'Nessus',
      'VirusTotal v3 automation',
      'Auth hardening',
    ],
  },
  {
    id: 'languages',
    wireframe: 'cube',
    title: 'Languages',
    items: ['Python', 'TypeScript', 'C / C++', 'MATLAB', 'Java', 'Kotlin', 'SQL', 'Bash'],
  },
  {
    id: 'systems',
    wireframe: 'orbits',
    title: 'Compilers & signals',
    items: [
      'Lexers & recursive descent parsers',
      'Tree-walking interpreters',
      'Web Workers',
      'POSIX sockets',
      'YIN pitch tracking',
      'TD-PSOLA',
      'STFT & Wiener filtering',
    ],
  },
  {
    id: 'web',
    wireframe: 'lattice',
    title: 'Web & data',
    items: ['React', 'Vite', 'Node.js', 'Express', 'Flask', 'MySQL', 'MongoDB', 'SQLite', 'Pinecone'],
  },
  {
    id: 'ml',
    wireframe: 'nodes',
    title: 'Machine learning',
    items: ['Scikit-learn', 'Random Forest', 'Isolation Forest', 'RAG pipelines', 'LangGraph'],
  },
];

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: 'social-conclave',
    org: 'Social Conclave MPSTME',
    fullOrg: 'Social Conclave · SVKM NMIMS MPSTME',
    monogram: 'SC',
    tone: 'mint',
    role: 'Tech Executive',
    period: 'Sep 2026 – Present',
    current: true,
    location: 'Mumbai',
    summary:
      "Run the tech behind NMIMS MPSTME's flagship social impact conference: the website, registrations and live deployments.",
    highlights: [
      'Built the conference web platform with semantic HTML, a custom CSS token scale and layered SVG systems.',
      'Coordinate live registration workflows, digital operations and production deployments.',
      'Keep the front end dependency-free, fast and accessible on desktop and mobile.',
    ],
    stack: ['HTML & CSS', 'SVG', 'Web architecture', 'Digital ops'],
  },
  {
    id: 'gdg',
    org: 'GDG on Campus MPSTME',
    fullOrg: 'Google Developer Group on Campus · SVKM NMIMS MPSTME',
    monogram: 'GDG',
    tone: 'teal',
    role: 'Cybersecurity Executive',
    period: 'Aug 2026 – Present',
    current: true,
    location: 'Mumbai',
    summary:
      "Lead the cybersecurity side of the campus developer community: teaching students to build securely and keeping our event platforms hard to break.",
    highlights: [
      'Run hands-on sessions on secure coding, common web vulnerabilities and safe Git practices.',
      'Harden the hackathon platforms and participant onboarding flows the chapter runs on.',
      'Set security baselines for tooling and review student projects for weak spots before they ship.',
    ],
    stack: ['Secure coding', 'OWASP Top 10', 'Security reviews', 'Workshops'],
  },
  {
    id: 'complete-cinema',
    org: 'Complete Cinema',
    fullOrg: 'Complete Cinema · Digital media publishing',
    monogram: 'CC',
    tone: 'bone',
    role: 'Web Development Intern',
    period: 'May 2026 – Jul 2026',
    location: 'Mumbai',
    summary:
      'Worked on a production media site: PHP modules, WordPress and Node.js services, from front end to auth.',
    highlights: [
      'Sped up media delivery by optimising database queries and content caching.',
      'Hardened authentication handshakes and added strict server-side validation on form endpoints.',
      'Shipped front-end releases with zero layout shift on media-heavy pages.',
    ],
    stack: ['Node.js', 'PHP', 'MySQL', 'Auth hardening', 'Performance'],
  },
  {
    id: 'isa',
    org: 'ISA Tech MPSTME',
    fullOrg: 'International Society of Automation · MPSTME',
    monogram: 'ISA',
    tone: 'amber',
    role: 'Web Design & Development',
    period: 'Mar 2025 – Sep 2025',
    location: 'Mumbai',
    summary:
      'Designed UI prototypes in Figma and built responsive event registration portals in React.',
    highlights: [
      'Built event registration portals with real-time participant tracking.',
      'Turned technical automation topics into accessible, mobile-ready React interfaces.',
      'Standardised reusable layout patterns across several committee launches.',
    ],
    stack: ['React', 'Figma', 'Bootstrap', 'UI design'],
  },
  {
    id: 'execelia',
    org: 'Execelia Studios',
    fullOrg: 'Execelia Studios · Independent game development',
    monogram: 'EX',
    tone: 'mint',
    role: 'Beta Tester & Contributor',
    period: 'Feb 2024',
    location: 'Remote',
    summary:
      'Beta-tested the horror game Elhosea: hunted down performance bottlenecks, physics glitches and memory leaks.',
    highlights: [
      'Wrote debug patches and optimisation scripts in Godot to hold 60 FPS on Windows hardware.',
      'Documented reliable reproduction steps for memory leaks and collision bugs before release.',
      'Profiled asset streaming spikes to smooth frame pacing during scene transitions.',
    ],
    stack: ['Godot', 'Profiling', 'QA', 'Windows'],
  },
];

export const PROJECTS: ProjectEntry[] = [
  {
    id: 'threat-detection',
    index: '01',
    title: 'Cybersecurity Automation',
    domain: 'Pentest audit · Security tooling · ML',
    year: '2026',
    tagline:
      'Built for my Cybersecurity and Ethical Hacking with Applied AI course (iHub DivyaSampark, IIT Roorkee). I wrote my own recon and threat-intel tools, audited a deliberately vulnerable lab network end to end, and hardened a Flask API against a full threat model.',
    architecture:
      'Three modules. Python tooling: a multithreaded TCP port scanner with banner grabbing, a log enricher that drops private IP ranges and geo-resolves public ones, a VirusTotal v3 lookup with an offline mock mode, and a detector comparing a supervised Random Forest with an unsupervised Isolation Forest. A PTES audit of an isolated Kali, BIND9 and Metasploitable 2 lab (Nmap, DNS enumeration, Nessus). And a Flask API designed around STRIDE: bcrypt hashing, constant-time token checks, parameterized SQL, sliding-window rate limiting and sanitized errors. 53 pytest tests, with Bandit and CodeQL in CI.',
    highlights: [
      'Audited an isolated lab to PTES and found the vsftpd 2.3.4 backdoor and a distcc RCE (both CVSS 9.8), Heartbleed and an open DNS zone transfer.',
      'Benchmarked a Random Forest threat detector (96.7% accuracy) against an unsupervised Isolation Forest on 5,000 events.',
      'Hardened a Flask API with bcrypt, constant-time token checks, parameterized SQL and rate limiting, backed by 53 tests and SAST in CI.',
    ],
    stack: ['Python', 'Nmap', 'Nessus', 'Scikit-learn', 'Flask', 'VirusTotal v3'],
    metric: { value: '9.8', label: 'Critical CVSS found' },
    repoUrl: 'https://github.com/4aru5h/Cybersecurity-Automation-And-Intelligent-Threat-Detection',
    image: '/img/threat-audit.svg',
    imageAlt: 'Lab audit chart with the critical findings highlighted in red',
    modes: [
      {
        id: 'recon',
        label: 'Recon',
        summary: 'Nmap SYN scan with service and OS detection against the Metasploitable 2 target.',
        telemetry: 'PTES AUDIT · 192.168.56.0/24 · ISOLATED LAB',
        code: [
          '$ nmap -sS -sV -O -p 21,22,23,25,53,80 192.168.56.20',
          'PORT    SERVICE  VERSION',
          '21/tcp  ftp      vsftpd 2.3.4',
          '22/tcp  ssh      OpenSSH 4.7p1',
          '23/tcp  telnet   Linux telnetd',
          '80/tcp  http     Apache httpd 2.2.8',
        ],
      },
      {
        id: 'findings',
        label: 'Findings',
        summary: 'Nessus results checked by hand and ranked by CVSS, each with a fix. One scanner flag was verified as a false positive.',
        telemetry: '2 CRITICAL · 2 HIGH · 1 MEDIUM',
        code: [
          'CVE-2011-2523  vsftpd backdoor RCE    9.8  CRITICAL',
          'CVE-2004-2687  distccd command exec   9.8  CRITICAL',
          'CVE-2014-0160  OpenSSL Heartbleed     7.5  HIGH',
          'N/A            DNS zone transfer      7.5  HIGH',
          'CVE-1999-0619  Telnet plaintext auth  5.3  MEDIUM',
        ],
      },
      {
        id: 'ml',
        label: 'Detector',
        summary: 'Supervised vs. unsupervised detection on an imbalanced set (85% benign, 15% malicious).',
        telemetry: 'RANDOM FOREST · 96.7% ACCURACY · F1 0.88',
        code: [
          '$ python3 ml_threat_detector.py --benchmark   # 5,000 samples',
          'model             accuracy  precision  recall  f1',
          'Random Forest     0.9670    0.9333     0.8400  0.8842',
          'Isolation Forest  0.8420    0.4733     0.4733  0.4733',
        ],
      },
    ],
  },
  {
    id: 'bolt-lang',
    index: '02',
    title: 'bolt-lang',
    domain: 'Programming language · Browser playground',
    year: '2026',
    tagline:
      'A small dynamically typed language I built from scratch in TypeScript to understand how lexers, parsers and interpreters actually work. You can write and run it in the browser playground.',
    architecture:
      'Source goes through a hand-written lexer (escape sequences, line and column tracking), a recursive descent parser that uses operator precedence climbing to build a typed AST with source positions, and a tree-walking interpreter with scope environment chains and a 200,000-step safety limit. The playground runs it on Monaco inside a Web Worker sandbox and streams output to a terminal.',
    highlights: [
      'Hand-written lexer, recursive descent parser and tree-walking interpreter, no parser generators.',
      'Functions with def and give, if / elif / else, five loop forms with break and continue, arrays and async input().',
      'Monaco playground runs code in a Web Worker with a step limit, so infinite loops cannot freeze the tab; 33 Vitest tests.',
    ],
    stack: ['TypeScript', 'Interpreters', 'Monaco', 'Web Workers', 'Vitest'],
    metric: { value: '33', label: 'Vitest tests' },
    repoUrl: 'https://github.com/4aru5h/bolt-lang',
    liveUrl: 'https://boltlang.vercel.app',
    liveLabel: 'Try the playground',
    image: '/img/bolt-ast.svg',
    imageAlt: 'A bolt-lang syntax tree, from source to the interpreter',
    modes: [
      {
        id: 'source',
        label: 'Source',
        summary: 'Recursive factorial in bolt-lang: def declares a function, give returns, emit prints.',
        telemetry: 'DYNAMIC TYPES · NO PARENS ON CONDITIONS',
        code: [
          'def factorial(n) {',
          '    if n <= 1 {',
          '        give 1;',
          '    }',
          '    give n * factorial(n - 1);',
          '}',
          'emit(factorial(5));   # 120',
        ],
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        summary: 'Four stages, each written by hand, ending in an isolated Web Worker.',
        telemetry: 'LEXER → PARSER → AST → INTERPRETER',
        code: [
          '[Lexer]        chars, escapes, line/column',
          '[Parser]       recursive descent, precedence climbing',
          '[AST]          typed nodes with source positions',
          '[Interpreter]  scope chains, 200,000-step limit',
          '[Worker]       sandboxed, streams to the terminal',
        ],
      },
      {
        id: 'loops',
        label: 'Loops',
        summary: 'Five loop forms, all supporting break and continue.',
        telemetry: 'FOR · FOR-IN · REPEAT · WHILE · LOOP',
        code: [
          'for i in 0..5 { emit(i); }',
          'for item in ["alpha", "beta"] { emit(item); }',
          'repeat 3 { emit("iteration"); }',
          'while n < 3 { n += 1; }',
          'loop { counter += 1; if counter > 4 { break; } }',
        ],
      },
    ],
  },
  {
    id: 'vocal-pitch-corrector',
    index: '03',
    title: 'Vocal Pitch Corrector',
    domain: 'Digital signal processing · MATLAB',
    year: '2026',
    tagline:
      'Auto-tune built from first principles for my Signals and Systems coursework. Every stage is written by hand in base MATLAB, with no Signal Processing or Audio Toolbox, and it comes with a desktop app to hear the before and after.',
    architecture:
      'A nine-stage chain: input conditioning (mono downmix, DC removal, normalisation), STFT noise estimation with a decision-directed Wiener gate, zero-phase Butterworth band-pass filters designed with the bilinear transform, YIN pitch detection with FFT autocorrelation and parabolic interpolation, MIDI scale snapping with a 15-cent hysteresis band, IIR retune-speed smoothing, and TD-PSOLA resynthesis that keeps formants intact.',
    highlights: [
      'Cut mean pitch error on a detuned four-note vocal demo from 29.23 to 2.50 cents (91.4% less).',
      'Processes 10 seconds of audio in 1.4 seconds, more than 7× faster than real time.',
      '38 unit and integration tests, plus a desktop app with waveform, pitch contour, spectrogram and A/B/C playback.',
    ],
    stack: ['MATLAB', 'YIN', 'TD-PSOLA', 'Wiener filter', 'STFT'],
    metric: { value: '91.4%', label: 'Pitch error cut' },
    repoUrl: 'https://github.com/4aru5h/sns-vocal-pitch-corrector',
    image: '/img/vocal-retune.svg',
    imageAlt: 'A sung pitch curve snapping to a staircase of in-key notes',
    modes: [
      {
        id: 'yin',
        label: 'Pitch',
        summary: 'YIN finds the period of the voice; normalising the difference function stops octave errors.',
        telemetry: "CMNDF d'(tau) < 0.15 · PARABOLIC INTERP",
        code: [
          'r     = real(ifft(abs(fft(x, nfft)).^2));  % fast autocorrelation',
          'dn    = d ./ (cumsum(d) ./ (1:numel(d)));    % CMNDF',
          'tau   = find(dn < 0.15, 1, "first");',
          'f0    = fs / (tau + delta);                 % parabolic refinement',
        ],
      },
      {
        id: 'retune',
        label: 'Retune',
        summary: 'Snap to the nearest note in key, then glide there at the chosen retune speed.',
        telemetry: '15-CENT HYSTERESIS · FIRST-ORDER IIR',
        code: [
          'm      = 69 + 12 * log2(f0 / 440);       % Hz -> MIDI',
          'target = snap_to_scale(m, key, 0.15);    % 15-cent deadband',
          'beta   = exp(-dt / tau_retune);',
          'p(i)   = beta * p(i-1) + (1 - beta) * target(i);',
        ],
      },
      {
        id: 'results',
        label: 'Results',
        summary: 'Measured on the detuned, vibrato-modulated C4-E4-G4-A4 demo phrase.',
        telemetry: '38 TESTS · NO TOOLBOXES',
        code: [
          '>> run_demo',
          'mean pitch error   29.23 -> 2.50 cents   (91.4% less)',
          'runtime            10 s audio in 1.4 s   (>7x real time)',
          '>> run_tests',
          '38 unit + integration tests',
        ],
      },
    ],
  },
];
