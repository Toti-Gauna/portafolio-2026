const A = 'var(--accent)';
type Id = 'chief' | 'uxui' | 'design' | 'marketing' | 'ads' | 'frontend' | 'backend' | 'security' | 'game' | 'trailer' | 'docs';

/** One hand-drawn glyph per agent of the system (24×24, 1.5 stroke, one coral detail). Decorative: the name is visible text. */
export function AgentIcon({ id }: { id: Id }) {
  const p = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'agent__icon' } as const;
  switch (id) {
    case 'chief': return <svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /><circle cx="12" cy="12" r="1" fill={A} stroke="none" /></svg>;
    case 'uxui': return <svg {...p}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M3 8h18" /><path d="M11 12l4 8 1.2-3.3L19.5 15z" stroke={A} /></svg>;
    case 'design': return <svg {...p}><path d="M12 3l5 6-5 12-5-12z" /><path d="M12 9v4" /><circle cx="12" cy="14.5" r="1.3" fill={A} stroke="none" /></svg>;
    case 'marketing': return <svg {...p}><path d="M4 10v4h3l7 4V6l-7 4z" /><path d="M17.5 9.5a3.5 3.5 0 0 1 0 5" stroke={A} /><path d="M7 14l1 5h2" /></svg>;
    case 'ads': return <svg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.3" fill={A} stroke="none" /></svg>;
    case 'frontend': return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 8h18" /><path d="M9.5 12l-2.5 2.5L9.5 17M14.5 12l2.5 2.5-2.5 2.5" stroke={A} /></svg>;
    case 'backend': return <svg {...p}><ellipse cx="12" cy="6" rx="7" ry="2.5" /><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" /><path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" stroke={A} /></svg>;
    case 'security': return <svg {...p}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" stroke={A} /></svg>;
    case 'game': return <svg {...p}><path d="M7 8h10a4 4 0 0 1 4 4v1.5a3 3 0 0 1-5.4 1.8L14.5 14h-5l-1.1 1.3A3 3 0 0 1 3 13.5V12a4 4 0 0 1 4-4z" /><path d="M8 10.5v3M6.5 12h3" /><circle cx="16" cy="11.5" r="1" fill={A} stroke="none" /></svg>;
    case 'trailer': return <svg {...p}><rect x="3" y="9" width="18" height="11" rx="1.5" /><path d="M3 9l2-5 15 0-1 5" /><path d="M8 4l-1 5M13 4l-1 5" /><path d="M10.5 12.5v4l3.5-2z" fill={A} stroke="none" /></svg>;
    default: return <svg {...p}><path d="M5 4h9l5 5v11H5z" /><path d="M14 4v5h5" /><path d="M8 13h8M8 16.5h5" stroke={A} /></svg>;
  }
}
export type AgentId = Id;
