import type { NodeKind } from '@/lib/diagrams/types';

/** The glyph of a node kind, drawn in a 24×24 box at (x, y). Stroke follows `currentColor`; one detail in the tone colour. */
export function Glyph({ kind, x, y, s = 1, tone }: { kind: NodeKind; x: number; y: number; s?: number; tone: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 / s, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const d = { fill: tone, stroke: 'none' };
  const t = { ...p, stroke: tone };
  let body: React.ReactNode;
  switch (kind) {
    case 'client': body = <><rect x="2.5" y="4" width="19" height="15" rx="2" {...p} /><path d="M2.5 8h19" {...p} /><circle cx="5.5" cy="6" r=".9" {...d} /></>; break;
    case 'server': body = <><rect x="3.5" y="3.5" width="17" height="7" rx="1.5" {...p} /><rect x="3.5" y="13.5" width="17" height="7" rx="1.5" {...p} /><circle cx="7" cy="7" r="1" {...d} /><circle cx="7" cy="17" r="1" {...d} /></>; break;
    case 'db': body = <><ellipse cx="12" cy="5.5" rx="7.5" ry="2.5" {...p} /><path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13" {...p} /><path d="M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5" {...t} /></>; break;
    case 'service': body = <><path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z" {...p} /><circle cx="12" cy="12" r="2.6" {...t} /></>; break;
    case 'external': body = <><rect x="3" y="5" width="13" height="14" rx="2" {...p} strokeDasharray="2 2.4" /><path d="M13 4h7v7M20 4l-8 8" {...t} /></>; break;
    case 'queue': body = <><rect x="2.5" y="8" width="5" height="8" rx="1" {...p} /><rect x="9.5" y="8" width="5" height="8" rx="1" {...p} /><rect x="16.5" y="8" width="5" height="8" rx="1" {...t} /></>; break;
    case 'ai': body = <><path d="M12 3.5l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" {...p} /><circle cx="19" cy="5" r="1.4" {...d} /></>; break;
    case 'person': body = <><circle cx="12" cy="8" r="4" {...p} /><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" {...p} /><circle cx="12" cy="8" r="1.2" {...d} /></>; break;
    case 'gate': body = <><path d="M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6z" {...p} /><path d="M8.5 12l2.5 2.5 4.5-5" {...t} /></>; break;
    case 'doc': body = <><path d="M5.5 3h9l4 4v14h-13z" {...p} /><path d="M14.5 3v4h4" {...p} /><path d="M8.5 12h7M8.5 15.5h5" {...t} /></>; break;
    case 'code': body = <><path d="M8.5 7l-5 5 5 5M15.5 7l5 5-5 5" {...p} /><path d="M13.5 5l-3 14" {...t} /></>; break;
    case 'cloud': body = <><path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.7 4.7 0 0 0 7 18.5z" {...p} /><circle cx="12" cy="13.5" r="1.4" {...d} /></>; break;
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true">{body}</g>;
}
