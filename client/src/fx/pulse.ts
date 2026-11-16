/** One pulse event drives both the DOM shockwave (src/fx) and the WebGL cloud (src/gl). */
export interface PulseDetail {
  /** viewport px */
  x: number;
  y: number;
  kind: string;
}

export const PULSE_EVENT = 'fx:pulse';

/** Fire a pulse from a viewport point. Harmless when the fx chunk is not loaded (reduced motion). */
export function pulse(x: number, y: number, kind: string) {
  window.dispatchEvent(new CustomEvent<PulseDetail>(PULSE_EVENT, { detail: { x, y, kind } }));
}

/** Fire a pulse from the centre of an element. */
export function pulseFrom(el: Element | null, kind: string) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  pulse(r.left + r.width / 2, r.top + r.height / 2, kind);
}
