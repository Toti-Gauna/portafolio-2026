const A = 'var(--accent)';
/** Six hand-made icons for the method (design/svg/method). Decorative: every step has visible text. */
export function MethodIcon({ n }: { n: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const p = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'method__icon' } as const;
  switch (n) {
    case 1: return <svg {...p}><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /><circle cx="10.5" cy="10.5" r="1.5" fill={A} stroke="none" /></svg>;
    case 2: return <svg {...p}><circle cx="9" cy="12" r="5.5" /><circle cx="15" cy="12" r="5.5" /><path d="M12 8v8" stroke={A} /></svg>;
    case 3: return <svg {...p}><path d="M4 20L5 15 16 4l4 4L9 19z" /><path d="M14 6l4 4" /><circle cx="5" cy="19.5" r="1" fill={A} stroke="none" /></svg>;
    case 4: return <svg {...p}><path d="M12 3l9 4.5-9 4.5-9-4.5z" /><path d="M3 12l9 4.5 9-4.5" strokeOpacity=".6" /><path d="M3 16.5l9 4.5 9-4.5" strokeOpacity=".35" /><circle cx="12" cy="7.5" r="1.3" fill={A} stroke="none" /></svg>;
    case 5: return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M8.5 12.5l2.5 2.5 4.5-5" stroke={A} /></svg>;
    default: return <svg {...p}><path d="M5 12a7 7 0 0 1 12-5l2 2" /><path d="M19 4v5h-5" /><path d="M19 12a7 7 0 0 1-12 5l-2-2" strokeOpacity=".5" /><path d="M5 20v-5h5" strokeOpacity=".5" /></svg>;
  }
}
