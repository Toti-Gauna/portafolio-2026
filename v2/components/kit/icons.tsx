import type { CSSProperties } from 'react';

/**
 * The /v2 icon set. One grid (24 × 24), one stroke (1.75, round ends and joins), drawn by hand.
 *  · Interface glyphs are a single stroke in the text colour: they point, close, play.
 *  · Concept icons (layers, technique, fields) carry exactly ONE filled accent, like the dot of the IG
 *    monogram: the part the idea is about. Its colour is `--ic-accent` (coral unless the context sets it).
 * No brand logos: a technology is its name in type plus a concept glyph.
 * `s` is the stroked path data, `a` the accent shape (already filled).
 */
type Glyph = { s: string; a?: string; fill?: boolean };

const C = (cx: number, cy: number, r: number) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const BOX = (x: number, y: number, w: number, h: number, r = 1) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}z`;

export const ICONS = {
  // ── interface ──
  'arrow-right': { s: 'M4.5 12h14.500M13 6l6 6-6 6' },
  'arrow-left': { s: 'M19.500 12H5M11 6l-6 6 6 6' },
  chevron: { s: 'M9 5l7 7-7 7' },
  check: { s: 'M5 12.500l4.500 4.500L19 7.500' },
  close: { s: 'M6 6l12 12M18 6L6 18' },
  menu: { s: 'M4 8h16M4 16h16' },
  play: { s: 'M8 5.500v13l11-6.500z', fill: true },
  pause: { s: 'M8.500 5.500v13M15.500 5.500v13' },
  replay: { s: 'M19 12a7 7 0 1 1-2.200-5.100M19 4v4h-4' },
  external: { s: 'M10 5.500H6.500a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V14M14 4.500h5.500V10M19.500 4.500L11 13' },
  mail: { s: `${BOX(3.5, 6, 17, 12, 1.5)}M4.500 7.500l7.500 5.500 7.500-5.500` },
  'sound-on': { s: 'M4 9.500h3l4.500-3.500v12L7 14.500H4zM15 9.200a4 4 0 0 1 0 5.600M17.600 6.600a7.600 7.600 0 0 1 0 10.800' },
  'sound-off': { s: 'M4 9.500h3l4.500-3.500v12L7 14.500H4zM15.500 9.500l5 5M20.500 9.500l-5 5' },
  // ── the five layers of the craft ──
  plan: { s: `${BOX(5, 4, 14, 16, 1.5)}M8.500 9.200l1.400 1.400 2.400-2.800M14.800 9.500h1.700M13.500 15h3`, a: '<path d="M9.800 12.700l2.300 2.300-2.300 2.300-2.300-2.300z"/>' },
  code: { s: 'M8.500 7.500L4 12l4.500 4.500M15.500 7.500L20 12l-4.500 4.500', a: C(12, 12, 1.9) },
  agents: { s: 'M10.300 10.500L7.200 8M13.700 10.500l3.100-2.500M12 14.200v2.600M5.500 4.500a2 2 0 1 1 0 4a2 2 0 0 1 0-4zM18.500 4.500a2 2 0 1 1 0 4a2 2 0 0 1 0-4zM12 16.800a2 2 0 1 1 0 4a2 2 0 0 1 0-4z', a: C(12, 12, 2.4) },
  tests: { s: 'M4.500 16.500a7.500 7.500 0 0 1 15 0M3.500 16.500h17M12 9v1.600M6.700 11.200l1.100 1.100M17.300 11.200l-1.100 1.100', a: '<path d="M10.900 15.700l5.200-4.900-3.300 6.300z"/>' + C(12, 16.5, 1.7) },
  ship: { s: 'M12 13.500V4.500M8 8.500l4-4 4 4M4.500 13.500v5a1.500 1.500 0 0 0 1.500 1.500h12a1.500 1.500 0 0 0 1.500-1.500v-5', a: C(12, 17, 1.7) },
  // ── technique ──
  interface: { s: `${BOX(3, 4.5, 18, 15, 1.5)}M3 9h18M6.500 12.500h5M6.500 15.500h3`, a: '<rect x="14" y="12" width="4.500" height="4" rx="1"/>' },
  server: { s: `${BOX(4, 4, 16, 6.5, 1.2)}${BOX(4, 13.5, 16, 6.5, 1.2)}M11 7.250h5.500M11 16.750h5.500M7.500 16.750h.010`, a: C(7.5, 7.25, 1.5) },
  database: { s: 'M5 6.500c0-1.400 3.100-2.500 7-2.500s7 1.100 7 2.500-3.100 2.500-7 2.500-7-1.100-7-2.500zM5 6.500v11c0 1.400 3.100 2.500 7 2.500s7-1.100 7-2.500v-11M5 12c0 1.400 3.100 2.500 7 2.500s7-1.100 7-2.500', a: C(15.8, 17, 1.4) },
  api: { s: 'M8.500 4.500c-2 0-2.500 1-2.500 2.500v2c0 1.300-.700 2.200-2 2.500v1c1.300.300 2 1.200 2 2.500v2c0 1.500.500 2.500 2.500 2.500M15.500 4.500c2 0 2.500 1 2.500 2.500v2c0 1.300.700 2.200 2 2.500v1c-1.300.300-2 1.200-2 2.500v2c0 1.500-.500 2.500-2.500 2.500', a: C(12, 12, 1.9) },
  rag: { s: 'M7 3.500h7l4 4V19a1.500 1.500 0 0 1-1.500 1.500h-9A1.500 1.500 0 0 1 6 19V4.500a1 1 0 0 1 1-1zM14 3.500v4h4M9 10.500h6M9 17.500h3.500', a: '<rect x="8.400" y="12.600" width="7.200" height="2.800" rx="1.400"/>' },
  ai: { s: 'M11 3.500c.600 4.400 2.100 5.900 6.500 6.500-4.400.600-5.900 2.100-6.500 6.500-.600-4.400-2.100-5.900-6.500-6.500 4.400-.600 5.900-2.100 6.500-6.500z', a: '<path d="M18 14.500c.300 1.900.900 2.500 2.800 2.800-1.900.300-2.500.900-2.800 2.800-.300-1.900-.900-2.500-2.800-2.800 1.900-.300 2.500-.900 2.800-2.800z"/>' },
  security: { s: 'M12 3.500l7 2.500v5.500c0 4.500-3 7.600-7 9-4-1.400-7-4.500-7-9V6zM12 12.800v2.700', a: C(12, 10.800, 1.9) },
  pipeline: { s: 'M19 12a7 7 0 0 1-12.200 4.700M5 12a7 7 0 0 1 12.200-4.700M17.500 3.600v3.900h-3.900M6.500 20.400v-3.900h3.900', a: C(12, 12, 1.9) },
  mobile: { s: `${BOX(7, 3.5, 10, 17, 1.8)}M10.500 6.300h3`, a: C(12, 17.200, 1.4) },
  cube: { s: 'M12 3.500l7.500 4.200v8.600L12 20.500l-7.500-4.200V7.700zM12 12.200l7.500-4.500M12 12.200L4.500 7.700M12 12.200v8.300', a: '<path d="M12 5.800l4.300 2.400L12 10.600 7.700 8.200z"/>' },
  motion: { s: 'M4 18c4.500 0 5-11.500 9-11.500 3.500 0 3 5.500 6 5.500M4 18h.010', a: C(19.500, 12, 1.9) },
  data: { s: 'M4.500 19.500h15M7.500 16v-3.500M12 16V10.500M16.500 16v-5', a: C(12, 6.500, 1.8) },
  // ── fields ──
  energy: { s: 'M12 3.500c3.500 4 6 6.800 6 10a6 6 0 0 1-12 0c0-3.200 2.500-6 6-10z', a: '<path d="M12.900 9.300l-3.200 4.500H12l-.900 3.400 3.200-4.500H12z"/>' },
  health: { s: BOX(4.5, 4.5, 15, 15, 2.5), a: '<path d="M10.600 8h2.800v2.600H16v2.800h-2.600V16h-2.800v-2.600H8v-2.800h2.600z"/>' },
  agro: { s: 'M12 20.500v-9M12 14c0-3.500-2.500-5.500-6.500-5.500 0 3.500 2.500 5.500 6.500 5.500zM7 20.500h10', a: '<path d="M12 11.500c0-3.500 2.500-5.500 6.500-5.500 0 3.500-2.500 5.500-6.500 5.500z"/>' },
  space: { s: 'M12 8.500a3.500 3.500 0 1 1 0 7a3.500 3.500 0 0 1 0-7zM8.300 13.600c-2.900 1.500-4.800 3.200-4.400 4.200.600 1.400 5.200.800 10.100-1.400s8.400-5.200 7.800-6.600c-.400-.900-2.300-1-5-.400', a: C(19.200, 5.800, 1.7) },
  inspection: { s: 'M10.500 4a6.500 6.500 0 1 1 0 13a6.500 6.500 0 0 1 0-13zM15.300 15.300L20 20', a: C(10.500, 10.500, 2.100) },
  cyber: { s: `${BOX(5.5, 10.5, 13, 10, 1.5)}M8.500 10.500V8a3.500 3.500 0 0 1 7 0v2.500M12 16.300v1.700`, a: C(12, 14.800, 1.800) },
  finance: { s: `M7 4v3M7 14v4M17 6v3M17 15v4M12 3.500V6M12 16v4.500${BOX(5.2, 7, 3.6, 7, 0.8)}${BOX(15.2, 9, 3.6, 6, 0.8)}`, a: '<rect x="10.200" y="6" width="3.600" height="10" rx=".800"/>' },
  aerospace: { s: 'M12 3.500c3 2.500 4.500 5.500 4.500 9v4h-9v-4c0-3.500 1.500-6.500 4.500-9zM7.500 13.500L5 16v3l2.500-1.500M16.500 13.500L19 16v3l-2.500-1.500M10.500 19.500c0 1 .500 1.500 1.500 2 1-.500 1.500-1 1.500-2', a: C(12, 10, 1.900) },
  education: { s: `${BOX(4, 4.5, 16, 10.5, 1)}M12 15v3M8.500 20.500l3.500-2.500 3.500 2.500M8 8l-1.500 1.500L8 11`, a: '<rect x="10.500" y="8.400" width="6" height="2.300" rx="1.150"/>' },
  fintech: { s: 'M4.500 7.500a2 2 0 0 1 2-2H17v3M4.500 7.500v10a2 2 0 0 0 2 2h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-12a2 2 0 0 1-2-2z', a: C(16, 14, 1.800) },
  events: { s: 'M4 8a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2.200a1.800 1.800 0 0 0 0 3.600V16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.200a1.800 1.800 0 0 0 0-3.600zM14.500 7.500V9M14.500 11.250v1.500M14.500 15v1.500', a: C(9.200, 12, 1.900) },
  telecom: { s: 'M12 12.500v8M8.500 20.500h7M8.300 14.700a5 5 0 0 1 0-7.400M15.700 7.300a5 5 0 0 1 0 7.400M5.800 17.200a8.500 8.500 0 0 1 0-12.400M18.200 4.800a8.500 8.500 0 0 1 0 12.400', a: C(12, 11, 1.900) },
} satisfies Record<string, Glyph>;

export type IconName = keyof typeof ICONS;

export const ICON_FAMILIES: Record<'interface' | 'layers' | 'technique' | 'fields', IconName[]> = {
  interface: ['arrow-right', 'arrow-left', 'chevron', 'check', 'close', 'menu', 'play', 'pause', 'replay', 'external', 'mail', 'sound-on', 'sound-off'],
  layers: ['plan', 'code', 'agents', 'tests', 'ship'],
  technique: ['interface', 'server', 'database', 'api', 'rag', 'ai', 'security', 'pipeline', 'mobile', 'cube', 'motion', 'data'],
  fields: ['energy', 'health', 'agro', 'space', 'inspection', 'cyber', 'finance', 'aerospace', 'education', 'fintech', 'events', 'telecom'],
};

export const ICON_SIZES = [16, 20, 24, 32] as const;
export const ICON_STROKE = 1.75;

/**
 * Decorative by default (aria-hidden): the text next to it names it. Pass `label` only when the icon stands
 * alone. `accent` sets the colour of its one filled part.
 */
export function Icon({ name, size = 24, label, accent }: { name: IconName; size?: number; label?: string; accent?: string }) {
  const g: Glyph = ICONS[name];
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={accent ? ({ '--ic-accent': accent } as CSSProperties) : undefined}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <path d={g.s} fill={g.fill ? 'currentColor' : undefined} />
      {g.a && <g className="ic-a" dangerouslySetInnerHTML={{ __html: g.a }} />}
    </svg>
  );
}
