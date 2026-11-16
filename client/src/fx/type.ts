/**
 * Kinetic poster type (fine pointers only).
 *  - Each letter of the wordmark swells in weight and width as the pointer nears and
 *    relaxes on a spring. Width is redistributed (near letters widen, far ones narrow a
 *    touch) so the word keeps roughly the same overall width.
 *  - On entering the wordmark, the 4 and 5 briefly decode to a and s (4aru5h <-> aarush).
 *  - "First principles." and the contact knockouts get a subtler weight-only response.
 * At rest every inline style is removed, so the page is exactly as before.
 */

interface Item {
  el: HTMLElement;
  wght: number;
  wdth: number;
  s: number;
  v: number;
  t: number;
}

const DECODE: Record<string, string> = { '4': 'a', '5': 's' };

export function kineticType(): () => void {
  const word = document.querySelector<HTMLElement>('.hero-poster .poster-word');
  const make = (el: HTMLElement): Item => {
    const cs = getComputedStyle(el);
    return {
      el,
      wght: Number.parseFloat(cs.fontWeight) || 820,
      wdth: Number.parseFloat(cs.fontStretch) || 100,
      s: 0,
      v: 0,
      t: 0,
    };
  };
  const letters = word ? Array.from(word.querySelectorAll<HTMLElement>('.poster-letter'), make) : [];
  const knocks = Array.from(document.querySelectorAll<HTMLElement>('.knockout-word, .banner .knockout'), make);
  if (!letters.length && !knocks.length) return () => {};

  let px = -1e5;
  let py = -1e5;
  let raf = 0;
  let last = 0;

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(1 / 30, (now - (last || now)) / 1000) || 1 / 60;
    last = now;

    // ---- read
    if (letters.length && word) {
      const fs = Number.parseFloat(getComputedStyle(word).fontSize) || 160;
      const R = fs * 0.85;
      for (const it of letters) {
        const r = it.el.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        it.t = Math.exp(-((d / R) ** 2));
      }
    }
    for (const it of knocks) {
      const r = it.el.getBoundingClientRect();
      const dx = Math.max(r.left - px, 0, px - r.right);
      const dy = Math.max(r.top - py, 0, py - r.bottom);
      it.t = Math.exp(-((Math.hypot(dx, dy) / 160) ** 2));
    }

    // ---- springs (slightly underdamped so letters settle with a little give)
    let settled = true;
    let hot = false;
    for (const it of [...letters, ...knocks]) {
      const a = 150 * (it.t - it.s) - 19 * it.v;
      it.v += a * dt;
      it.s += it.v * dt;
      if (Math.abs(it.t - it.s) > 0.002 || Math.abs(it.v) > 0.002) settled = false;
      if (it.t > 0.002 || it.s > 0.002) hot = true;
    }
    const moving = hot || !settled;

    // ---- write
    const mean = letters.reduce((m, it) => m + it.s, 0) / (letters.length || 1);
    for (const it of letters) {
      if (!moving) {
        it.el.style.fontVariationSettings = '';
        continue;
      }
      const w = Math.min(900, it.wght + 80 * it.s);
      const wd = Math.max(62, Math.min(125, it.wdth + 14 * (it.s - mean)));
      it.el.style.fontVariationSettings = `'wght' ${w.toFixed(1)}, 'wdth' ${wd.toFixed(1)}`;
    }
    for (const it of knocks) {
      it.el.style.fontVariationSettings = moving ? `'wght' ${Math.min(900, it.wght + 70 * it.s).toFixed(1)}` : '';
    }
    // keep ticking while springs move; a still pointer over a settled word costs nothing
    if (!settled) raf = requestAnimationFrame(frame);
    else last = 0;
  };

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    px = e.clientX;
    py = e.clientY;
    kick();
  };
  const onLeave = (e: MouseEvent) => {
    if (e.relatedTarget) return;
    px = py = -1e5;
    kick();
  };

  // ---- decode 4aru5h -> aarush and back
  const timers: number[] = [];
  const digits = letters
    .map((it) => it.el.firstElementChild as HTMLElement | null)
    .filter((el): el is HTMLElement => !!el && !!el.textContent && el.textContent in DECODE);
  const originals = digits.map((el) => el.textContent ?? '');
  let decodedAt = -1e5;
  const decode = () => {
    const now = performance.now();
    if (now - decodedAt < 2600) return;
    decodedAt = now;
    digits.forEach((el, n) => {
      const orig = originals[n];
      const seq: [number, string][] = [
        [0, '/'],
        [70, DECODE[orig]],
        [760, '/'],
        [830, orig],
      ];
      for (const [at, ch] of seq) timers.push(window.setTimeout(() => (el.textContent = ch), at + n * 40));
    });
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('scroll', kick, { passive: true });
  document.addEventListener('mouseout', onLeave);
  word?.addEventListener('pointerenter', decode);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('scroll', kick);
    document.removeEventListener('mouseout', onLeave);
    word?.removeEventListener('pointerenter', decode);
    timers.forEach((t) => window.clearTimeout(t));
    digits.forEach((el, n) => (el.textContent = originals[n]));
    for (const it of [...letters, ...knocks]) it.el.style.fontVariationSettings = '';
  };
}
