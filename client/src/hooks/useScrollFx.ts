import { useEffect } from 'react';

/**
 * One lightweight scroll engine for the whole page (transform/clip only, rAF-batched):
 *  - [data-reveal]       panel wipes in the first time it enters the viewport (stagger with --i)
 *  - [data-px]/[data-py] parallax drift in px; measured against the parent so the
 *                        transform never feeds back into the measurement.
 *                        data-pfrom="top" ties it to page scroll (for things on the first screen).
 *  - [data-drift]        (with data-px) idle drift in px/s on top of the parallax, wrapping
 *                        every quarter of the content (the marquee repeats its text 4x),
 *                        plus a skew that follows scroll velocity. Loops only while on screen.
 *  - .scroll-progress    header bar that tracks how far down the page you are
 * When idle it lazy-loads src/fx (pointer effects, shockwave, WebGL panels).
 * Everything is skipped when the visitor prefers reduced motion.
 */
export function useScrollFx() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;

    root.classList.add('fx');

    // ---- Reveal ----------------------------------------------------------
    const revealIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );

    // ---- Parallax --------------------------------------------------------
    const active = new Set<HTMLElement>();
    const parallaxIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) active.add(el);
          else active.delete(el);
        }
        schedule();
      },
      { rootMargin: '25% 0px 25% 0px' },
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        revealIO.observe(el);
      });
      document.querySelectorAll<HTMLElement>('[data-px], [data-py]').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        parallaxIO.observe(el);
      });
    };
    scan();

    // Pick up panels React mounts later (e.g. the experience preview on resize).
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    const bar = document.querySelector<HTMLElement>('.scroll-progress');
    let raf = 0;
    let tiles = new WeakMap<HTMLElement, number>();
    let lastY = window.scrollY;
    let lastT = performance.now();
    let vel = 0;
    let skew = 0;

    const update = (now: number = performance.now()) => {
      raf = 0;
      const dt = Math.max(1, Math.min(64, now - lastT));
      lastT = now;
      const y = window.scrollY;
      // nav jumps teleport the page; only real scrolling should skew the band
      if (Math.abs(y - lastY) < 400) vel += ((y - lastY) / dt - vel) * 0.2;
      lastY = y;
      skew += (Math.max(-7, Math.min(7, vel * -2.4)) - skew) * 0.14;
      let loop = false;
      const vh = window.innerHeight;
      const amp = window.innerWidth < 640 ? 0.5 : 1;

      for (const el of active) {
        const px = Number(el.dataset.px ?? 0) * amp;
        const py = Number(el.dataset.py ?? 0) * amp;
        let p: number;
        if (el.dataset.pfrom === 'top') {
          p = Math.min(1, window.scrollY / vh);
        } else {
          const r = (el.parentElement ?? el).getBoundingClientRect();
          p = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
          p = Math.max(-1, Math.min(1, p));
        }
        let x = px * p;
        let tail = '';
        if (el.dataset.drift) {
          loop = true;
          let w = tiles.get(el);
          if (!w) {
            w = el.scrollWidth / 4;
            tiles.set(el, w);
          }
          const d = w > 0 ? ((Number(el.dataset.drift) * now) / 1000) % w : 0;
          x += d <= 0 ? d : d - w;
          tail = ` skewX(${skew.toFixed(2)}deg)`;
        }
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${(py * p).toFixed(1)}px, 0)${tail}`;
      }
      if (loop) schedule();

      if (bar) {
        const max = document.documentElement.scrollHeight - vh;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      }
    };

    function schedule() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    const onResize = () => {
      tiles = new WeakMap();
      schedule();
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    schedule();

    // Pointer effects, shockwave and WebGL panels live in a lazy chunk.
    let dead = false;
    let disposeFx: (() => void) | undefined;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400));
    idle(() => {
      if (dead) return;
      void import('../fx').then((m) => {
        if (!dead) disposeFx = m.startFx();
      });
    });

    return () => {
      root.classList.remove('fx');
      revealIO.disconnect();
      parallaxIO.disconnect();
      mo.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      dead = true;
      disposeFx?.();
    };
  }, []);
}
