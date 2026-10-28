'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CONTACT_EMAIL } from '@/lib/site';

/**
 * Below 1100 px the header has no contact button: this floating one replaces it.
 * It steps aside while another contact action is on screen (anything marked `data-contact`: the hero buttons,
 * the contact blocks, the «¿Hablamos?» row at the end of a case).
 */
export function FloatingContact({ label, aria }: { label: string; aria: string }) {
  const [hidden, setHidden] = useState(true);
  const pathname = usePathname();
  // every page has its own contact actions: look them up again after each navigation
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('[data-contact]'));
    if (!('IntersectionObserver' in window)) { setHidden(false); return; }
    if (!targets.length) { setHidden(false); return; }
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
      setHidden(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);
  return (
    <a className="fab-contact" href={`mailto:${CONTACT_EMAIL}`} aria-label={aria} data-hidden={hidden} tabIndex={hidden ? -1 : undefined}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5L12 13l8.5-6.5" />
      </svg>
      <span>{label}</span>
    </a>
  );
}
