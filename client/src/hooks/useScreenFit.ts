import { useEffect } from 'react';

/**
 * Every nav destination is meant to fill exactly one screen. The desktop layouts are
 * composed for a ~900px-tall window (or F11 on a 1080p monitor); in a normal browser
 * window the tabs, address bar and taskbar leave less height, so a section's content
 * would run past the bottom or clip inside its panels.
 *
 * On desktop layouts (>1080px wide) this scales any section that is taller than its
 * screen down uniformly with CSS `zoom` until it fits, and stretches its min-height so
 * it still fills the screen exactly. Sections that already fit are left untouched.
 * Phones and tablets stack their panels and scroll normally.
 */
const SELECTOR = '.hero-grid, .screen';
const DESKTOP = '(min-width: 1081px)';
// Below this, text gets too small to read comfortably; a section that still does not
// fit just runs a little past the screen instead.
const MIN_ZOOM = 0.82;

function fit(el: HTMLElement) {
  el.style.zoom = '';
  el.style.minHeight = '';
  if (!window.matchMedia(DESKTOP).matches) return;

  // the screen height this element is meant to fill (its CSS min-height)
  const target = Number.parseFloat(getComputedStyle(el).minHeight);
  if (!target) return;
  let h = el.getBoundingClientRect().height;
  if (h <= target + 1) return;

  let z = 1;
  for (let i = 0; i < 4 && h > target + 1; i += 1) {
    z = Math.max(MIN_ZOOM, (z * target) / h);
    el.style.zoom = String(z);
    el.style.minHeight = `${target / z}px`;
    h = el.getBoundingClientRect().height;
    if (z === MIN_ZOOM) break;
  }
}

export function useScreenFit() {
  useEffect(() => {
    let raf = 0;
    const dirty = new Set<HTMLElement>();
    const all = () => Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));

    const flush = () => {
      raf = 0;
      const list = Array.from(dirty);
      dirty.clear();
      list.forEach(fit);
    };
    const queue = (els: HTMLElement[]) => {
      els.forEach((el) => dirty.add(el));
      if (!raf) raf = requestAnimationFrame(flush);
    };

    // Content changes inside a section (e.g. the Experience preview) re-fit only that section.
    // Re-fitting lands on the same size, so this does not loop.
    const ro = new ResizeObserver((entries) => {
      if (!window.matchMedia(DESKTOP).matches) return;
      queue(entries.map((e) => e.target as HTMLElement));
    });

    const els = all();
    els.forEach(fit);
    els.forEach((el) => ro.observe(el));

    const onResize = () => queue(all());
    window.addEventListener('resize', onResize, { passive: true });
    void document.fonts?.ready.then(() => queue(all()));

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      all().forEach((el) => {
        el.style.zoom = '';
        el.style.minHeight = '';
      });
    };
  }, []);
}
