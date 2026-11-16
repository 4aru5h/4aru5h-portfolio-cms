import { useEffect, useRef, useState } from 'react';

const reduced = () =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Counts a stat like "96.7%", "33" or "38/38" up from zero the first time it
 * scrolls into view. Screen readers get the final value straight away.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const decimals = match ? (match[1].split('.')[1] ?? '').length : 0;
  const suffix = match ? match[2] : '';
  const format = (n: number) => `${n.toFixed(decimals)}${suffix}`;

  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(() => (match && !reduced() ? format(0) : value));

  useEffect(() => {
    const el = ref.current;
    if (!el || !match || reduced() || !('IntersectionObserver' in window)) {
      setShown(value);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(2, -10 * t);
          setShown(t >= 1 ? value : format(target * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true">
        {shown}
      </span>
    </>
  );
}
