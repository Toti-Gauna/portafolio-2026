/**
 * The Brand Lab (Ola 8a, design/2026/brand-lab.md): eight brand boards. Colors, fonts and marks of the brands that
 * live in a repo come from that repo's code (survey: the session scratchpad, o8/brands.md, 17/11/2026); Sereno and
 * Brote are brand exercises invented for the lab. Copy (names, uses, ideas, the lines on the sample pieces) lives in
 * messages → brandlab.brands.<id>. Font family names and hex codes are data, not copy.
 */
export type BrandId = 'ig' | 'eclipse' | 'velmar' | 'volta' | 'dentalos' | 'lucero' | 'sereno' | 'brote';

/** Whose brand it is. `exercise` = fictional (the demos' brands and the two lab exercises): «Ejercicio de marca». */
export type BrandKind = 'own' | 'client' | 'exercise';

/** Where each block of the board comes from: the brand's repo, this site, or drawn for the board. */
export type Origin = 'repo' | 'site' | 'lab';

export type Swatch = { key: string; hex: string };

export type Brand = {
  id: BrandId;
  kind: BrandKind;
  /** the printed sheet: background, text, secondary text, hairlines */
  sheet: { bg: string; ink: string; muted: string; line: string };
  /** panel A (main logo) and panel B (secondary) backgrounds */
  panels: { a: string; b: string; c: string };
  palette: Swatch[];
  /** display and text families (the CSS variable comes from components/brandlab/fonts.ts) */
  fonts: { display: string; text: string };
  origin: { a: Origin; b: Origin; c: Origin; d: Origin; e: Origin; f: Origin; g: Origin };
};

const own = (o: Partial<Brand['origin']> = {}): Brand['origin'] => ({ a: 'repo', b: 'repo', c: 'repo', d: 'repo', e: 'repo', f: 'lab', g: 'lab', ...o });

export const BRANDS: Brand[] = [
  {
    id: 'ig', kind: 'own',
    sheet: { bg: '#0a0a0c', ink: '#eeeae3', muted: '#8d8a83', line: '#26262b' },
    panels: { a: '#0a0a0c', b: '#141418', c: '#eeeae3' },
    palette: [
      { key: 'ink', hex: '#0a0a0c' }, { key: 'coral', hex: '#ff4d2e' }, { key: 'paper', hex: '#eeeae3' },
      { key: 'surface', hex: '#141418' }, { key: 'muted', hex: '#8d8a83' }, { key: 'coralSoft', hex: '#ff8a70' },
    ],
    fonts: { display: 'Archivo', text: 'JetBrains Mono' },
    origin: { a: 'site', b: 'lab', c: 'site', d: 'site', e: 'site', f: 'site', g: 'lab' },
  },
  {
    id: 'eclipse', kind: 'own',
    sheet: { bg: '#05050a', ink: '#f4efe6', muted: '#9a97a6', line: '#24232e' },
    panels: { a: '#05050a', b: '#f4efe6', c: '#0c0c14' },
    palette: [
      { key: 'corona', hex: '#f5b942' }, { key: 'void', hex: '#05050a' }, { key: 'dawn', hex: '#f4efe6' },
      { key: 'flare', hex: '#ffe8b0' }, { key: 'night', hex: '#0c0c14' }, { key: 'mist', hex: '#9a97a6' },
    ],
    fonts: { display: 'Instrument Serif', text: 'Geist' },
    origin: own(),
  },
  {
    id: 'velmar', kind: 'client',
    sheet: { bg: '#f6f1e8', ink: '#1c2016', muted: '#5d6050', line: '#e2d8c4' },
    panels: { a: '#f6f1e8', b: '#1c2016', c: '#ece2cf' },
    palette: [
      { key: 'olive', hex: '#3a4527' }, { key: 'paper', hex: '#f6f1e8' }, { key: 'ink', hex: '#1c2016' },
      { key: 'wood', hex: '#b98b5c' }, { key: 'sand', hex: '#ece2cf' }, { key: 'brass', hex: '#d2ad69' },
    ],
    fonts: { display: 'Fraunces', text: 'Manrope' },
    origin: own({ f: 'repo' }),
  },
  {
    id: 'volta', kind: 'exercise',
    sheet: { bg: '#0b0c0d', ink: '#f2f0ea', muted: '#a6abb0', line: '#33383d' },
    panels: { a: '#151719', b: '#060707', c: '#1f2225' },
    palette: [
      { key: 'volt', hex: '#c8ff2e' }, { key: 'carbon', hex: '#0b0c0d' }, { key: 'chalk', hex: '#f2f0ea' },
      { key: 'steel', hex: '#a6abb0' }, { key: 'ion', hex: '#2ee6d6' }, { key: 'plasma', hex: '#8b72ff' },
    ],
    fonts: { display: 'Big Shoulders Display', text: 'Archivo' },
    origin: own({ f: 'repo' }),
  },
  {
    id: 'dentalos', kind: 'exercise',
    sheet: { bg: '#f6f1e8', ink: '#1b2a28', muted: '#55615e', line: '#d8cdbb' },
    panels: { a: '#fffcf7', b: '#12302e', c: '#e6d9c3' },
    palette: [
      { key: 'clinic', hex: '#1e5c55' }, { key: 'paper', hex: '#f6f1e8' }, { key: 'ink', hex: '#1b2a28' },
      { key: 'gold', hex: '#b08a3e' }, { key: 'sand', hex: '#e6d9c3' }, { key: 'night', hex: '#12302e' },
    ],
    fonts: { display: 'Newsreader', text: 'Source Sans 3' },
    origin: own({ b: 'lab' }),
  },
  {
    id: 'lucero', kind: 'exercise',
    sheet: { bg: '#1a1113', ink: '#f3e6d0', muted: '#cdb9a0', line: '#3a2a2d' },
    panels: { a: '#140d0f', b: '#241719', c: '#b23a52' },
    palette: [
      { key: 'wine', hex: '#b23a52' }, { key: 'night', hex: '#1a1113' }, { key: 'cream', hex: '#f3e6d0' },
      { key: 'amber', hex: '#f5b942' }, { key: 'copper', hex: '#d9783a' }, { key: 'notebook', hex: '#f6edda' },
    ],
    fonts: { display: 'Instrument Serif', text: 'Geist' },
    origin: own({ c: 'lab' }),
  },
  {
    id: 'sereno', kind: 'exercise',
    sheet: { bg: '#fbf8f1', ink: '#1d2333', muted: '#5b5f6b', line: '#e6dccb' },
    panels: { a: '#1d2333', b: '#f1e4cc', c: '#e0703a' },
    palette: [
      { key: 'night', hex: '#1d2333' }, { key: 'dough', hex: '#f1e4cc' }, { key: 'crust', hex: '#8a4b2a' },
      { key: 'oven', hex: '#e0703a' }, { key: 'wheat', hex: '#c9a24a' }, { key: 'flour', hex: '#fbf8f1' },
    ],
    fonts: { display: 'Young Serif', text: 'Work Sans' },
    origin: { a: 'lab', b: 'lab', c: 'lab', d: 'lab', e: 'lab', f: 'lab', g: 'lab' },
  },
  {
    id: 'brote', kind: 'exercise',
    sheet: { bg: '#f4f1e8', ink: '#22301f', muted: '#5a6352', line: '#dcd8c8' },
    panels: { a: '#2f6b3e', b: '#f4f1e8', c: '#a8d672' },
    palette: [
      { key: 'leaf', hex: '#2f6b3e' }, { key: 'sprout', hex: '#a8d672' }, { key: 'pot', hex: '#c9643f' },
      { key: 'lime', hex: '#f4f1e8' }, { key: 'soil', hex: '#3b2a20' }, { key: 'moss', hex: '#6f7f3a' },
    ],
    fonts: { display: 'Bricolage Grotesque', text: 'Figtree' },
    origin: { a: 'lab', b: 'lab', c: 'lab', d: 'lab', e: 'lab', f: 'lab', g: 'lab' },
  },
];

export const BRAND_IDS = BRANDS.map((b) => b.id);

/** Relative luminance (WCAG) of a #rrggbb color, and the contrast ratio of two colors. */
export function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
/** The readable ink for text on a swatch. */
export const inkOn = (hex: string) => (luminance(hex) > 0.4 ? '#111114' : '#f6f3ec');
