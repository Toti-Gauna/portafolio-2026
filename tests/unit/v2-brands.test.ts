import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast, hexToRgb } from '../../v2/tokens/contrast';
import type { BrandArt, BrandCopy, BrandSpec, Svg } from '../../v2/components/brand/types';

/**
 * The Brand Lab of /v2 (lote 6.1): the contract every brand keeps (v2/components/brand/types.ts) and the rule of the
 * lot — a brand is told apart without reading its name. Reads every brand in v2/components/brand/art/;
 * BRAND_ONLY=<id> checks just one (the pairwise check still compares it with the others).
 */
const DIR = 'v2/components/brand/art';
const IDS = readdirSync(DIR).filter((f) => f.endsWith('.ts')).map((f) => f.replace('.ts', '')).filter((id) => existsSync(`messages/v2/brands/es/${id}.json`));
const ONLY = process.env.BRAND_ONLY;
const NEG = { es: /\b(sin|no|nunca|todavía|falta|pendiente)\b/i, en: /\b(no|not|never|without|yet|missing|lack)\b|n't\b/i };
const HEX = /^#[0-9a-f]{6}$/i;
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const strings = (o: unknown): string[] => (typeof o === 'string' ? [o] : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : []);
const keys = (o: object): string[] => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v).map((x) => `${k}.${x}`) : [k])).sort();
const load = async (id: string) => {
  const spec = (await import(`../../v2/components/brand/art/${id}.ts`)).BRAND as BrandSpec;
  const copy = (lang: 'es' | 'en') => JSON.parse(readFileSync(`messages/v2/brands/${lang}/${id}.json`, 'utf8')) as BrandCopy;
  return { spec, es: copy('es'), en: copy('en') };
};
/** CIE76 distance between two hex colours (enough to say «these two fields look different»). */
const lab = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.9505), y = f(0.2126 * r + 0.7152 * g + 0.0722 * b), z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.089);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
const dE = (a: string, b: string) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));
const sizes = (svg: string) => [...svg.matchAll(/font-size="([\d.]+)"/g)].map((m) => Number(m[1]));
const drawings = (a: BrandArt): [string, string][] => [
  ['logo', a.logo.main.svg], ['grid', a.logo.grid], ['secondary', a.logo.secondary.svg], ['submark', a.logo.submark.svg],
  ...a.patterns.map((p, i): [string, string] => [`pattern${i}`, p.svg]), ['post', a.digital.post.svg], ['story', a.digital.story.svg],
  ['poster', a.physical.poster.svg], ['print', a.physical.print.svg],
  ...(a.object.kind === 'box' ? Object.entries(a.object.faces).map(([k, v]): [string, string] => [`face-${k}`, v]) : [['label', a.object.label], ['top', a.object.top], ['lid', a.object.lid?.top ?? '']] as [string, string][]),
];

describe.each(IDS.filter((id) => !ONLY || id === ONLY))('brand %s', (id) => {
  it('has a skin that reads: every text pair passes AA on both of its fields', async () => {
    const { spec } = await load(id);
    expect(spec.id).toBe(id);
    for (const [name, f] of [['main', spec.skin.main], ['alt', spec.skin.alt]] as const) {
      for (const k of ['bg', 'ink', 'muted', 'accent'] as const) expect(f[k], `${name}.${k}`).toMatch(HEX);
      expect(contrast(f.ink, f.bg), `${name} ink on bg`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(f.muted, f.bg), `${name} muted on bg`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(f.accent, f.bg), `${name} accent on bg (shapes and large type)`).toBeGreaterThanOrEqual(3);
    }
    expect(contrast(spec.skin.onAccent, spec.skin.main.accent), 'onAccent on accent').toBeGreaterThanOrEqual(4.5);
    expect(dE(spec.skin.main.bg, spec.skin.alt.bg), 'the two fields are two different screens').toBeGreaterThanOrEqual(20);
  });

  it('has a palette of five or six named colours, and type from fonts that are on disk', async () => {
    const { spec, es } = await load(id);
    expect(spec.palette.length).toBeGreaterThanOrEqual(5);
    expect(spec.palette.length).toBeLessThanOrEqual(6);
    expect(spec.palette.reduce((s, c) => s + c.share, 0)).toBe(100);
    for (const c of spec.palette) { expect(c.hex, c.key).toMatch(HEX); expect(es.palette[c.key]?.name, c.key).toBeTruthy(); }
    const css = readFileSync('app/v2/[locale]/brand-fonts.css', 'utf8');
    for (const f of [spec.type.display, spec.type.text]) {
      const fam = f.stack.match(/'(bl-[a-z-]+)'/)?.[1];
      if (fam) expect(css, fam).toContain(`font-family: '${fam}'`); else expect(f.stack, f.name).toMatch(/var\(--family-(sans|mono)\)/);
      expect(f.weights.length, f.name).toBeGreaterThan(0);
    }
  });

  it('draws everything itself, in the boxes of the contract, with text that can be read', async () => {
    const { spec, es } = await load(id);
    const missing: string[] = [];
    const a = spec.art(new Proxy(es.art, { get: (o, k: string) => (k in o ? o[k] : (missing.push(k), '')) }));
    expect(missing, 'words the drawings ask for and the copy lacks').toEqual([]);
    for (const [name, svg] of drawings(a)) {
      expect(svg, name).not.toMatch(/<script|<image|<img|<foreignObject|<title|href="http|url\(\s*['"]?http|undefined|NaN/i);
      for (const t of svg.matchAll(/<text\b[^>]*>/g)) {
        expect(t[0], `${name}: a <text> takes the brand's font from class bl-fd or bl-ft`).toMatch(/class="[^"]*\bbl-f[dt]\b/);
        expect(t[0], `${name}: font-size as an attribute`).toMatch(/font-size="[\d.]+"/);
      }
    }
    const box = (s: Svg) => s.box.join(' ');
    for (const p of a.patterns) expect(box(p)).toBe('0 0 120 120');
    expect(box(a.digital.post)).toBe('0 0 400 400');
    expect(box(a.digital.story)).toBe('0 0 270 480');
    expect(box(a.physical.poster)).toBe('0 0 300 400');
    expect(box(a.logo.submark)).toBe('0 0 100 100');
    expect(a.physical.print.box[2]).toBeGreaterThanOrEqual(180);
    expect(a.physical.print.box[2]).toBeLessThanOrEqual(280);
    // readable at the size each piece is shown on a 360 px phone
    const min = (svg: string) => Math.min(Infinity, ...sizes(svg));
    expect(min(a.digital.post.svg), 'post').toBeGreaterThanOrEqual(17);
    expect(min(a.digital.story.svg), 'story').toBeGreaterThanOrEqual(13);
    expect(min(a.physical.poster.svg), 'poster').toBeGreaterThanOrEqual(14);
    expect(min(a.physical.print.svg), 'print').toBeGreaterThanOrEqual(11 * (a.physical.print.box[2] / 240) - 0.01);
    expect(min(a.logo.main.svg), 'logo').toBeGreaterThanOrEqual(a.logo.main.box[2] / 25 - 0.01);
    expect(min(a.logo.secondary.svg), 'secondary').toBeGreaterThanOrEqual(a.logo.secondary.box[2] / 24 - 0.01);
    if (a.object.kind === 'box') for (const f of Object.values(a.object.faces)) expect(min(f), 'a face of the object').toBeGreaterThanOrEqual(16);
    else for (const f of [a.object.label, a.object.top, a.object.lid?.top ?? '']) expect(min(f), 'the label of the object').toBeGreaterThanOrEqual(16);
    // the logo draws itself; its grid is only lines; the submark takes the colour of the field it is on
    expect(a.logo.main.svg).toMatch(/class="[^"]*\bbl-(draw|fill)\b/);
    expect(a.logo.main.svg, 'bl-draw is for lines, not for text').not.toMatch(/<text[^>]*bl-draw/);
    expect(a.logo.grid).toMatch(/bl-g\b|bl-gc\b/);
    expect(a.logo.grid).not.toMatch(/<text/);
    expect(a.logo.submark.svg).toContain('currentColor');
    expect(a.logo.submark.svg, 'the submark has no colours of its own').not.toMatch(/#[0-9a-f]{3,8}\b/i);
    // the object fits on the turntable
    const o = a.object;
    const reach = o.kind === 'box' ? Math.hypot(o.size[0] / 2, o.size[1] / 2, o.size[2] / 2) : Math.hypot(Math.max(o.r, o.lid?.r ?? 0), (o.h + (o.lid?.h ?? 0)) / 2);
    expect(reach).toBeLessThanOrEqual(150);
    expect(reach, 'and it is big enough to see').toBeGreaterThanOrEqual(95);
  });

  it('says it in both languages, within its limits and in a positive voice', async () => {
    const { spec, es, en } = await load(id);
    expect(keys(en)).toEqual(keys(es));
    for (const [lang, c] of [['es', es], ['en', en]] as const) {
      expect(words(c.owner), `${lang} owner`).toBeLessThanOrEqual(14);
      expect(words(c.idea), `${lang} idea`).toBeLessThanOrEqual(20);
      expect(words(c.place), `${lang} place`).toBeLessThanOrEqual(12);
      expect(c.traits.length).toBe(3);
      expect(c.grid.length).toBe(3);
      for (const g of c.grid) expect(words(g), `${lang} grid: ${g}`).toBeLessThanOrEqual(16);
      for (const v of Object.values(c.alt)) expect(words(v), `${lang} alt: ${v}`).toBeLessThanOrEqual(16);
      for (const p of spec.palette) expect(words(c.palette[p.key].use), `${lang} ${p.key}`).toBeLessThanOrEqual(6);
      for (const k of ['display', 'text'] as const) expect(words(c.type[k].role), `${lang} ${k}`).toBeLessThanOrEqual(10);
      expect(words(c.source), `${lang} source`).toBeLessThanOrEqual(30);
      for (const s of strings(c)) { expect(s, lang).not.toMatch(NEG[lang]); expect(s).not.toMatch(/handy|vibe coding/i); }
    }
  });
});

describe('the wall of brands', () => {
  it('tells every brand from every other without its name: field, accent and type', async () => {
    const all = await Promise.all(IDS.map(load));
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const a = all[i].spec, b = all[j].spec;
      const field = dE(a.skin.main.bg, b.skin.main.bg), accent = dE(a.skin.main.accent, b.skin.main.accent);
      expect(Math.max(field, accent), `${a.id} / ${b.id}: field ${field.toFixed(0)}, accent ${accent.toFixed(0)}`).toBeGreaterThanOrEqual(30);
      const type = (s: BrandSpec) => `${s.type.display.name} ${s.skin.heading.style} ${s.skin.heading.transform}`;
      expect(type(a), `${a.id} / ${b.id}: same display type`).not.toBe(type(b));
    }
  });
});
