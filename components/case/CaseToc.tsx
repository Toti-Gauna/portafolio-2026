'use client';

import { useEffect, useRef } from 'react';

/** The page index: marks the section being read (aria-current) as the reader scrolls. Plain links without JS. */
export function CaseToc({ label, items }: { label: string; items: { id: string; h: string }[] }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = ref.current;
    if (!nav || !('IntersectionObserver' in window)) return;
    const links = new Map(Array.from(nav.querySelectorAll<HTMLAnchorElement>('a')).map((a) => [a.hash.slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        links.get(e.target.id)?.setAttribute('aria-current', 'true');
      }
    }, { rootMargin: '-30% 0px -60% 0px' });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    return () => io.disconnect();
  }, []);
  return (
    <nav ref={ref} className="toc" aria-label={label}>
      <p className="toc__label label">{label}</p>
      <ol>
        {items.map((it, i) => (
          <li key={it.id}><a href={`#${it.id}`}><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{it.h}</a></li>
        ))}
      </ol>
    </nav>
  );
}
