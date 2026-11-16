/**
 * The grid as a physical frame:
 *  - seamGlow():  a mint light follows the pointer *behind* the grid, so only the 1px
 *                 seams near the cursor light up (cells stay opaque on top of it).
 *  - shockwave(): a ring travels through the seams and every on-screen cell nudges
 *                 outward a few px as it passes. Transforms only (WAAPI, composite add).
 */

/** Ring speed in px/ms. src/gl uses the same number so the frame and the world move together. */
export const WAVE_PX_PER_MS = 1.8;

const CELLS =
  '.cell, .stat, .work-index > li, .ledger-item, .band-row, .bar-row > .bar, .footer-ctas > .bar, .term-chips > *';

export function seamGlow(): () => void {
  const root = document.documentElement;
  const glow = document.createElement('div');
  glow.className = 'fx-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);
  root.classList.add('fx-seams');

  let x = 0;
  let y = 0;
  let raf = 0;
  const paint = () => {
    raf = 0;
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    x = e.clientX;
    y = e.clientY;
    glow.classList.add('is-on');
    if (!raf) raf = requestAnimationFrame(paint);
  };
  const onLeave = (e: MouseEvent) => {
    if (!e.relatedTarget) glow.classList.remove('is-on');
  };
  const onBlur = () => glow.classList.remove('is-on');

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('mouseout', onLeave);
  window.addEventListener('blur', onBlur);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('mouseout', onLeave);
    window.removeEventListener('blur', onBlur);
    root.classList.remove('fx-seams');
    glow.remove();
  };
}

let lastWave = 0;

export function shockwave(x: number, y: number) {
  const now = performance.now();
  if (now - lastWave < 220) return;
  lastWave = now;

  const W = window.innerWidth;
  const H = window.innerHeight;
  const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 120;
  const duration = R / WAVE_PX_PER_MS;

  // The ring sits behind the grid like the glow, so it shows only in the seams.
  const ring = document.createElement('div');
  ring.className = 'fx-ring';
  ring.setAttribute('aria-hidden', 'true');
  ring.style.width = ring.style.height = `${R * 2}px`;
  ring.style.margin = `${-R}px 0 0 ${-R}px`;
  document.body.appendChild(ring);
  const at = `translate3d(${x}px, ${y}px, 0)`;
  ring
    .animate(
      [
        { transform: `${at} scale(0.02)`, opacity: 1 },
        { transform: `${at} scale(1)`, opacity: 0.2 },
      ],
      { duration, easing: 'linear', fill: 'forwards' },
    )
    .finished.finally(() => ring.remove());

  // Read every rect first, then start the animations.
  const hits: { el: Element; ux: number; uy: number; d: number }[] = [];
  document.querySelectorAll(CELLS).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > H || r.width === 0 || r.height === 0) return;
    // nearest point of the cell to the origin: that is when the ring reaches it
    const nx = Math.max(r.left, Math.min(x, r.right));
    const ny = Math.max(r.top, Math.min(y, r.bottom));
    const cx = r.left + r.width / 2 - x;
    const cy = r.top + r.height / 2 - y;
    const len = Math.hypot(cx, cy) || 1;
    hits.push({ el, ux: cx / len, uy: cy / len, d: Math.hypot(nx - x, ny - y) });
  });

  for (const { el, ux, uy, d } of hits) {
    const amp = 3.2 * (1 - 0.5 * Math.min(1, d / R));
    el.animate(
      [
        { transform: 'translate(0, 0)' },
        { transform: `translate(${(ux * amp).toFixed(2)}px, ${(uy * amp).toFixed(2)}px)`, offset: 0.3 },
        { transform: 'translate(0, 0)' },
      ],
      {
        duration: 560,
        delay: d / WAVE_PX_PER_MS / 0.96,
        easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)',
        composite: 'add',
      },
    );
  }
}
