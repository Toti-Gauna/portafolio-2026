'use client';

import { useEffect, useState } from 'react';
import { CONTACT_EMAIL } from '@/lib/site';

/**
 * Small screens hide the header's contact button: this floating one replaces it.
 * It steps aside while another contact action is on screen (hero buttons, contact section).
 */
export function FloatingContact({ label, aria }: { label: string; aria: string }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const targets = ['.hero__cta', '#contacto'].map((s) => document.querySelector(s)).filter(Boolean) as Element[];
    if (!targets.length || !('IntersectionObserver' in window)) { setHidden(false); return; }
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
      setHidden(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return (
    <a className="fab-contact" href={`mailto:${CONTACT_EMAIL}`} aria-label={aria} data-hidden={hidden} tabIndex={hidden ? -1 : undefined}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5L12 13l8.5-6.5" />
      </svg>
      <span>{label}</span>
    </a>
  );
}
