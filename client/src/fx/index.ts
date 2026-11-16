/**
 * Lazy fx chunk, loaded by useScrollFx when idle and only when motion is allowed.
 * Wires the pointer effects, the shockwave and (lazily again) the WebGL portal panels.
 */
import { seamGlow, shockwave } from './grid';
import { PULSE_EVENT, pulse, type PulseDetail } from './pulse';
import { kineticType } from './type';

export function startFx(): () => void {
  const off: (() => void)[] = [];

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    off.push(seamGlow(), kineticType());
  }

  const onPulse = (e: Event) => {
    const d = (e as CustomEvent<PulseDetail>).detail;
    if (d) shockwave(d.x, d.y);
  };
  window.addEventListener(PULSE_EVENT, onPulse);
  off.push(() => window.removeEventListener(PULSE_EVENT, onPulse));

  // Art panels: a click or tap sends a pulse through the frame and the world behind it.
  const arts = Array.from(document.querySelectorAll<HTMLElement>('[data-gl]'));
  const onClick = (e: MouseEvent) => pulse(e.clientX, e.clientY, 'art');
  arts.forEach((a) => a.addEventListener('click', onClick));
  off.push(() => arts.forEach((a) => a.removeEventListener('click', onClick)));

  let dead = false;
  if (arts.length && 'WebGL2RenderingContext' in window) {
    import('../gl/portal')
      .then((m) => {
        if (dead) return;
        off.push(m.startPortals(arts));
      })
      .catch(() => {
        /* the SVG stays */
      });
  }

  return () => {
    dead = true;
    off.splice(0).forEach((f) => f());
  };
}
