import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently under the top third of the viewport.
 * When two match (a nested section like Toolbox inside About, or a boundary),
 * the later one in the list wins.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length || !('IntersectionObserver' in window)) return;

    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        const current = [...ids].reverse().find((id) => visible.get(id));
        setActive(current ?? null);
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
