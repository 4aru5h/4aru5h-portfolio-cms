import { useEffect, useState } from 'react';
import { IDENTITY } from '../data/portfolio';
import { Mail } from './Icons';
import { ResumeButton } from './ResumeButton';

/** Phone-only bar: appears once the hero actions scroll away, hides once the footer is in view. */
export function MobileActionBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.hero-actions');
    const contact = document.querySelector('.site-footer');
    if (!hero || !contact || !('IntersectionObserver' in window)) return;

    let heroVisible = true;
    let contactVisible = false;
    const update = () => setShow(!heroVisible && !contactVisible);

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
        if (entry.target === contact) contactVisible = entry.isIntersecting;
      }
      update();
    });
    io.observe(hero);
    io.observe(contact);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`action-bar ${show ? 'is-visible' : ''}`} aria-hidden={!show} inert={!show}>
      <ResumeButton className="bar" label="Résumé" />
      <a href={`mailto:${IDENTITY.email}`} className="bar bar-mint">
        <span>Email me</span>
        <Mail size={18} />
      </a>
    </div>
  );
}
