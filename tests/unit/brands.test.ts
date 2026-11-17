import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import tokens from '../../design/2026/tokens.json';
import { BRANDS, contrast } from '../../lib/brands';
import { PAGES } from '../../lib/nav';
import { CHAPTERS } from '../../lib/taller';

type Copy = { name: string; idea: string; place: string; source: string; note: string; palette: Record<string, { n: string; u: string }>; patterns: string[]; apps: { name: string; lines: string[] }[] };

describe('Brand Lab (lib/brands.ts)', () => {
  it('eight brands, each once', () => {
    expect(BRANDS.map((b) => b.id)).toEqual(['ig', 'eclipse', 'velmar', 'volta', 'dentalos', 'lucero', 'sereno', 'brote']);
  });

  it('whose brand it is: mine, a client, or a brand exercise (the fictional ones)', () => {
    const kind = Object.fromEntries(BRANDS.map((b) => [b.id, b.kind]));
    expect(kind).toEqual({ ig: 'own', eclipse: 'own', velmar: 'client', volta: 'exercise', dentalos: 'exercise', lucero: 'exercise', sereno: 'exercise', brote: 'exercise' });
  });

  it('palettes of 5–6 valid colors; the repo brands keep their exact codes', () => {
    for (const b of BRANDS) {
      expect(b.palette.length, b.id).toBeGreaterThanOrEqual(5);
      expect(b.palette.length, b.id).toBeLessThanOrEqual(6);
      for (const s of b.palette) expect(s.hex, `${b.id}.${s.key}`).toMatch(/^#[0-9a-f]{6}$/);
    }
    const hex = (id: string) => BRANDS.find((b) => b.id === id)!.palette.map((s) => s.hex);
    expect(hex('volta')).toEqual(expect.arrayContaining(['#c8ff2e', '#0b0c0d', '#f2f0ea', '#a6abb0', '#2ee6d6', '#8b72ff']));
    expect(hex('velmar')).toEqual(expect.arrayContaining(['#3a4527', '#f6f1e8', '#1c2016', '#b98b5c', '#ece2cf', '#d2ad69']));
    expect(hex('dentalos')).toEqual(expect.arrayContaining(['#1e5c55', '#f6f1e8', '#1b2a28', '#b08a3e', '#e6d9c3', '#12302e']));
    expect(hex('lucero')).toEqual(expect.arrayContaining(['#b23a52', '#1a1113', '#f3e6d0', '#f5b942', '#d9783a', '#f6edda']));
    expect(hex('eclipse')).toEqual(expect.arrayContaining(['#f5b942', '#05050a', '#f4efe6', '#ffe8b0', '#0c0c14', '#9a97a6']));
    const t = tokens as unknown as { color: Record<string, string> };
    const ig = hex('ig');
    for (const k of ['ink', 'accent', 'paper'] as const) if (t.color?.[k]) expect(ig).toContain(t.color[k].toLowerCase());
  });

  it('the exercises are drawn for the board; Lucero\'s submark is too (its repo has none)', () => {
    for (const id of ['sereno', 'brote']) expect(Object.values(BRANDS.find((b) => b.id === id)!.origin).every((o) => o === 'lab'), id).toBe(true);
    expect(BRANDS.find((b) => b.id === 'lucero')!.origin.c).toBe('lab');
    for (const b of BRANDS) expect(b.origin.g, b.id).toBe('lab');
  });

  it('every sheet is readable: text AAA-ish on its paper, secondary text AA', () => {
    for (const b of BRANDS) {
      expect(contrast(b.sheet.ink, b.sheet.bg), b.id).toBeGreaterThanOrEqual(7);
      expect(contrast(b.sheet.muted, b.sheet.bg), b.id).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('copy in both languages: idea, place, source, note, a name and a use per color, three patterns and three pieces', () => {
    for (const m of [es, en]) {
      const bl = (m as unknown as { brandlab: { brands: Record<string, Copy> } }).brandlab;
      for (const b of BRANDS) {
        const c = bl.brands[b.id];
        for (const k of ['name', 'idea', 'place', 'source', 'note'] as const) expect(c[k], `${b.id}.${k}`).toBeTruthy();
        expect(Object.keys(c.palette).sort(), b.id).toEqual(b.palette.map((s) => s.key).sort());
        for (const s of Object.values(c.palette)) expect(s.n && s.u, b.id).toBeTruthy();
        expect(c.patterns, b.id).toHaveLength(3);
        expect(c.apps, b.id).toHaveLength(3);
        for (const a of c.apps) expect(a.name && a.lines.length, b.id).toBeTruthy();
      }
      // the client's brand says whose it is and that the demo palette is provisional
      expect(bl.brands.velmar.note).toMatch(/Velmar/);
    }
  });

  it('no prices and no contact data on any sample piece', () => {
    for (const m of [es, en]) {
      const all = JSON.stringify((m as unknown as { brandlab: unknown }).brandlab);
      expect(all).not.toMatch(/\$\s?\d|US\$|\bARS\b|@\w+\.\w+|\+54|wa\.me|instagram\.com/);
    }
  });

  it('it is a header page and the home\'s chapter 6 leads to it', () => {
    expect(PAGES.map((p) => p.href)).toContain('/brand-lab');
    expect(CHAPTERS.find((c) => c.key === 'brand')!.href).toBe('/brand-lab');
  });
});
