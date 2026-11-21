import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import es from '../../messages/v2/video/es.json';
import en from '../../messages/v2/video/en.json';
import { CASE_ORDER, CASES } from '../../v2/components/case/cases';
import { caseCopy } from '../../v2/components/case/copy';
import { caseFilms, FILM_KINDS, FILM_SHAPES, TRAILER_FILMS, trailerHref } from '../../v2/components/video/films';

/** «Video» of /v2 (lote 7.2): every film comes from a case (its words too), the files exist, and the page keeps its
 *  words few. */
const VOICE = { es: /\b(sin|no|nunca|todavía|falta|pendiente)\b/i, en: /\b(no|not|never|without|yet|missing|lack)\b|n't\b/i };
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const strings = (o: unknown): string[] => typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(strings) : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : [];
const keys = (o: unknown, p = ''): string[] => o && typeof o === 'object' && !Array.isArray(o) ? Object.entries(o).flatMap(([k, v]) => keys(v, `${p}.${k}`)) : [p];

describe('v2 video (lote 7.2)', () => {
  it('every video of every case is on the wall, once, with its file and its poster', () => {
    const films = caseFilms();
    expect(new Set(films.map((f) => f.id)).size).toBe(films.length);
    const expected = CASE_ORDER.flatMap((s) => [CASES[s].film, ...CASES[s].gallery].filter((m) => m.kind === 'video').map((m) => `${s}-${m.id}`));
    expect(films.map((f) => f.id)).toEqual(expected);
    expect(films.length).toBe(23);
    for (const f of films) {
      expect(existsSync(`public${f.src}`), f.src).toBe(true);
      expect(existsSync(`public${f.poster}`), f.poster).toBe(true);
      expect(FILM_KINDS).toContain(f.kind);
      expect(FILM_SHAPES).toContain(f.shape);
      expect(f.kind, f.id).toBe(f.slug === 'kinetic' ? 'motion' : 'product');
    }
    // Tuenti has no capture or recording: never on the wall
    expect(films.some((f) => f.slug === 'tuenti')).toBe(false);
  });

  it('the words of every case film are the case’s own, in both languages', () => {
    for (const f of caseFilms()) for (const loc of ['es', 'en'] as const) {
      const c = caseCopy(loc, f.slug!), id = f.id.slice(f.slug!.length + 1);
      if (f.from === 'film') { expect(c.film.alt, f.id).toBeTruthy(); expect(c.film.label, f.id).toBeTruthy(); }
      else { const g = c.gallery[id]; expect(g?.caption, `${loc} ${f.id}`).toBeTruthy(); expect(g?.alt, `${loc} ${f.id}`).toBeTruthy(); }
    }
  });

  it('the trailer: two editions, their posters in both languages, opening the trailer itself', () => {
    for (const loc of ['es', 'en']) {
      const t = TRAILER_FILMS(loc);
      expect(t.map((f) => f.shape)).toEqual(['wide', 'tall']);
      for (const f of t) expect(existsSync(`public${f.poster}`), f.poster).toBe(true);
    }
    expect(trailerHref('es', 'wide')).toBe('/trailer/v2/index.html?lang=es');
    expect(trailerHref('en', 'tall')).toBe('/trailer/v2/index.html?lang=en&o=v');
    expect(existsSync('public/trailer/v2/index.html')).toBe(true);
  });

  it('few words outside the captions: title, line and filters stay under 60', () => {
    expect(keys(en)).toEqual(keys(es));
    for (const [loc, v] of [['es', es], ['en', en]] as const) {
      const outside = [v.kicker, v.title, v.lead, v.filters.kind, v.filters.all, ...Object.values(v.filters.kinds), v.filters.shape, v.filters.all, ...Object.values(v.filters.shapes), `25 ${v.count.other}`, v.more];
      expect(outside.reduce((n, s) => n + words(s), 0), loc).toBeLessThan(60);
      for (const s of strings(v)) expect(s, loc).not.toMatch(VOICE[loc]);
    }
  });

  it('the frame: text of 12 px or more, and only transform and opacity move', () => {
    const css = readFileSync('app/v2/[locale]/video.css', 'utf8');
    for (const m of css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(12);
    for (const m of css.matchAll(/transition:\s*([^;]+);/g)) for (const part of m[1].split(',')) expect(part.trim().split(/\s+/)[0]).toMatch(/^(transform|opacity)$/);
    expect(css).not.toMatch(/@keyframes|animation:/);
  });
});
