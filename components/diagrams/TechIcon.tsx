const A = 'var(--accent)';
export type TechId =
  | 'react' | 'typescript' | 'nextjs' | 'reactnative' | 'tailwind' | 'node' | 'sql' | 'cicd' | 'rag' | 'security'
  | 'python' | 'c' | 'motion' | 'tests' | 'ml' | 'aws' | 'azure' | 'git' | 'design' | 'agents' | 'teach' | 'pay';

/**
 * One drawn glyph per technology (24×24, 1.5 stroke, one coral detail). No brand marks: the name is the text next to it,
 * the glyph draws the concept (a component tree, a typed slot, a pipeline…). Decorative: aria-hidden.
 */
export function TechIcon({ id, className = 'tech-icon' }: { id: TechId; className?: string }) {
  const p = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className } as const;
  const dot = (cx: number, cy: number, r = 1.4) => <circle cx={cx} cy={cy} r={r} fill={A} stroke="none" />;
  switch (id) {
    case 'react': return <svg {...p}><rect x="9" y="2.5" width="6" height="4.5" rx="1" /><rect x="2.5" y="16.5" width="6" height="4.5" rx="1" /><rect x="15.5" y="16.5" width="6" height="4.5" rx="1" /><path d="M12 7v4.5M5.5 16.5v-2.5h13v2.5M12 11.5V14" />{dot(12, 4.75)}</svg>;
    case 'typescript': return <svg {...p}><path d="M7 4.5H5v15h2M17 4.5h2v15h-2" /><path d="M9.5 9h5M12 9v7" stroke={A} /></svg>;
    case 'nextjs': return <svg {...p}><path d="M4 5.5h16M4 12h10M4 18.5h7" /><path d="M16 15l3.5 3.5L16 22" stroke={A} transform="translate(0 -3.5)" /></svg>;
    case 'reactnative': return <svg {...p}><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /><rect x="9" y="6" width="6" height="7" rx="1" stroke={A} /></svg>;
    case 'tailwind': return <svg {...p}><path d="M3 8.5c3-3 6-3 9 0s6 3 9 0" /><path d="M3 15.5c3-3 6-3 9 0s6 3 9 0" stroke={A} /></svg>;
    case 'node': return <svg {...p}><circle cx="12" cy="12" r="7.5" /><path d="M12 4.5a7.5 7.5 0 0 1 7.5 7.5" stroke={A} /><path d="M19.5 12l-1.8-1.8M19.5 12l1.8-1.8" stroke={A} />{dot(12, 12, 1.2)}</svg>;
    case 'sql': return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M3 14.5h18M10 4v16" /><rect x="10.5" y="9.5" width="10" height="4.5" fill={A} stroke="none" opacity=".85" /></svg>;
    case 'cicd': return <svg {...p}><circle cx="5" cy="12" r="2.2" /><circle cx="12" cy="12" r="2.2" /><path d="M7.2 12h2.6M14.2 12h2.6" /><circle cx="19" cy="12" r="2.2" stroke={A} /><path d="M18 12l.8.8 1.4-1.6" stroke={A} /></svg>;
    case 'rag': return <svg {...p}><path d="M4 3.5h8l3 3V20H4z" /><path d="M7 10h5M7 13.5h4" /><path d="M18 9.5l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1z" stroke={A} /></svg>;
    case 'security': return <svg {...p}><path d="M12 2.8l7.5 3v5.6c0 4.6-3.1 8.1-7.5 9.8-4.4-1.7-7.5-5.2-7.5-9.8V5.8z" /><rect x="9" y="11" width="6" height="5" rx="1" stroke={A} /><path d="M10.2 11V9.6a1.8 1.8 0 0 1 3.6 0V11" stroke={A} /></svg>;
    case 'python': return <svg {...p}><path d="M3.5 7.5l3 2.5-3 2.5M8 7.5l3 2.5-3 2.5M12.5 7.5l3 2.5-3 2.5" /><path d="M6 17.5h12" stroke={A} /></svg>;
    case 'c': return <svg {...p}><rect x="2.5" y="13" width="4.6" height="5" /><rect x="7.1" y="13" width="4.6" height="5" /><rect x="11.7" y="13" width="4.6" height="5" stroke={A} /><rect x="16.3" y="13" width="4.6" height="5" /><path d="M5 5.5h8.5a.5.5 0 0 1 .5.5v5" stroke={A} /><path d="M12.5 9.8l1.5 1.7 1.5-1.7" stroke={A} />{dot(5, 5.5, 1.3)}</svg>;
    case 'motion': return <svg {...p}><path d="M3 20.5C9 20.5 8 3.5 21 3.5" /><path d="M3 20.5l5-11M21 3.5l-6 2.5" strokeOpacity=".45" />{dot(8, 9.5)}{dot(15, 6)}</svg>;
    case 'tests': return <svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M7 9l1.8 1.8L12 7.5M7 15.5l1.8 1.8L12 14" stroke={A} /><path d="M14.5 9h3M14.5 15.5h3" /></svg>;
    case 'ml': return <svg {...p}><circle cx="5" cy="7" r="1.8" /><circle cx="5" cy="17" r="1.8" /><circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" /><circle cx="19" cy="12" r="1.8" stroke={A} /><path d="M6.7 7.5l3.6 4M6.7 6.5l3.5-1.2M6.7 16.5l3.6-4M6.7 17.5l3.5 1.2M13.8 5.6l3.6 5.4M13.8 12h3.4M13.8 18.4l3.6-5.4" strokeOpacity=".6" /></svg>;
    case 'aws': return <svg {...p}><path d="M6.5 11.5h11a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6-.4A3.8 3.8 0 0 0 6.5 11.5z" /><rect x="3" y="15" width="5" height="5" rx="1" /><rect x="9.5" y="15" width="5" height="5" rx="1" stroke={A} /><rect x="16" y="15" width="5" height="5" rx="1" /><path d="M12 11.5V15" /></svg>;
    case 'azure': return <svg {...p}><path d="M6.5 11.5h11a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6-.4A3.8 3.8 0 0 0 6.5 11.5z" /><path d="M4 15h16M4 20h16M9.5 15v5M14.5 15v5" /><rect x="9.5" y="15" width="5" height="5" fill={A} stroke="none" opacity=".85" /><path d="M12 11.5V15" /></svg>;
    case 'git': return <svg {...p}><path d="M6 3.5v17" /><path d="M6 8c0 4 12 3 12 8" stroke={A} />{dot(6, 3.5, 1.6)}<circle cx="6" cy="20.5" r="1.6" /><circle cx="18" cy="17.5" r="1.6" stroke={A} /></svg>;
    case 'design': return <svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M3.5 9.5h17M9.5 9.5v11" /><circle cx="15" cy="15" r="2.5" stroke={A} /></svg>;
    case 'agents': return <svg {...p}><circle cx="12" cy="5" r="2.2" /><circle cx="5" cy="17.5" r="2.2" /><circle cx="19" cy="17.5" r="2.2" /><path d="M10.7 6.9l-4.4 8.5M13.3 6.9l4.4 8.5M7.2 17.5h9.6" /><path d="M10 13.2l1.4 1.4 2.8-3" stroke={A} /></svg>;
    case 'teach': return <svg {...p}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20l4-4 4 4" /><path d="M7 8.5h6M7 11.5h4" stroke={A} /></svg>;
    case 'pay': return <svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path d="M2.5 9.5h19" /><path d="M6 14.5h4" stroke={A} />{dot(17.5, 14.5)}</svg>;
  }
}
