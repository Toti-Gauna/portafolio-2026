import { existsSync, readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import es from '@/messages/es.json';
import en from '@/messages/en.json';
import { CONTACT_EMAIL } from '@/lib/site';

// The trailer (public/trailer/v2) is a Kinetic Studio page: its texts live in two configs, trailer.es.js and
// trailer.en.js, that must be the same film with different words.
type Cfg = Record<string, unknown>;
type Shot = { frame?: string; text: { es: Record<string, unknown>; en: Record<string, unknown> }; html: (t: unknown) => string };
const configs: Record<string, Cfg> = {};
const shots: Record<string, Shot> = {};
const tiles: Record<string, Shot> = {};
beforeAll(async () => {
  (globalThis as unknown as { Trailer: unknown }).Trailer = {
    run: (c: Cfg) => { configs[c.lang as string] = c; },
    igShots: { add: (id: string, def: Shot) => { shots[id] = def; } },
    igStack: { add: (id: string, def: Shot) => { tiles[id] = def; } },
  };
  const dir = '../../public/trailer/v2/js/'; // plain JS served as is: no types to check
  for (const f of ['shots/eclipse.js', 'shots/handy.js', 'shots/lab.js', 'stack/work.js', 'stack/lab.js', 'trailer.es.js', 'trailer.en.js']) await import(/* @vite-ignore */ `${dir}${f}`);
});
const montage = (c: Cfg) => (c.scenes as { type: string; shots?: { id: string }[] }[]).find((s) => s.type === 'igshots')!;
// every string becomes a placeholder: what is left is the structure, timings and data
const shape = (x: unknown): unknown =>
  typeof x === 'string' ? 'S' : typeof x === 'function' ? 'F' : Array.isArray(x) ? x.map(shape)
    : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, shape(v)])) : x;
const strings = (x: unknown): string[] =>
  typeof x === 'string' ? [x] : x && typeof x === 'object' ? Object.values(x).flatMap(strings) : [];

describe('trailer v2 configs', () => {
  it('es and en are the same film: scenes, timings and data match, only words change', () => {
    const { es: cEs, en: cEn } = configs;
    expect((cEs.scenes as unknown[]).length).toBe(15);
    expect(shape(cEn.scenes)).toEqual(shape(cEs.scenes));
    expect(shape(cEn.ui)).toEqual(shape(cEs.ui));
  });

  it('says nothing the site does not: no «vibe coding», no job titles (challenges, not positions), the contact', () => {
    for (const lang of ['es', 'en'] as const) {
      const text = strings([configs[lang].scenes, configs[lang].meta]).join(' ');
      expect(text).not.toMatch(/vibe/i);
      expect(text).not.toMatch(/\bSsr\b|\bSr\b|Fullstack Developer|Software Developer|Profesor|Professor|\bjr\b/i);
      expect(text).toContain(CONTACT_EMAIL);
    }
  });

  it('the story: Mar del Plata, the first product, the fronts, every path, the industries', () => {
    type Scene = { type: string; stops?: { vis: string }[]; rubros?: { id: string }[]; own?: unknown[]; fronts?: unknown[] };
    const sc = configs.es.scenes as Scene[];
    expect(sc.slice(0, 3).map((s) => s.type)).toEqual(['igcoast', 'igfirst', 'igfronts']);
    expect(sc.filter((s) => s.type === 'igfronts').flatMap((s) => s.stops!.map((x) => x.vis))).toEqual(['tach', 'class', 'tuenti', 'events', 'team']);
    const zoom = sc.find((s) => s.type === 'igzoom')!;
    expect(zoom.fronts).toHaveLength(7);
    expect(zoom.own).toHaveLength(7);
    expect(sc.find((s) => s.type === 'igrubros')!.rubros!.map((r) => r.id)).toEqual(['startups', 'corporate', 'agro', 'space', 'mining', 'oilgas']);
  });

  // every scene's length, from its config (the same rules the recipes use)
  type Sc = Record<string, unknown> & { type: string };
  const len = (sc: Sc): number => {
    const n = (k: string, d = 0) => (typeof sc[k] === 'number' ? (sc[k] as number) : d);
    switch (sc.type) {
      case 'igfronts': {
        const stops = sc.stops as { lead?: { dur: number }; stay?: number }[];
        return stops.reduce((a, st) => a + (st.lead ? st.lead.dur : 0.9) + (st.stay ?? 4), 0) + ((sc.exit as { dur: number } | undefined)?.dur ?? 0);
      }
      case 'igshots': return n('titleDur', 1) + (sc.shots as { dur?: number }[]).reduce((a, x) => a + (x.dur ?? 1), 0) + n('mosaic', 1.5);
      case 'igstack': return (sc.screens as { dur?: number }[]).reduce((a, x) => a + (x.dur ?? 4.5), 0);
      case 'igcut': return n('fit');
      case 'rules': return (sc.rules as unknown[]).length * n('step', 2);
      default: return n('duration', 6);
    }
  };
  const starts = (c: Cfg) => { let t = 0; return (c.scenes as Sc[]).map((sc) => { const at = t; t += len(sc); return { type: sc.type, at, end: t }; }); };

  it('the film lasts 130 s at most, and the four drops land on their story beats', () => {
    const st = starts(configs.es);
    expect(st.at(-1)!.end).toBeLessThanOrEqual(130);
    expect(starts(configs.en)).toEqual(st);
    const at = (type: string) => st.find((x) => x.type === type)!.at;
    const parts = (configs.es.music as { parts: { from: number; to?: number; style: string }[] }).parts; // partitura.js
    const hits = parts.filter((p) => p.style === 'hit').map((p) => p.from);
    // drop 1 on the click (igfirst + 4 s), drop 2 on the zoom-out, drop 3 on the technologies, drop 4 on the end card
    for (const t of [at('igfirst') + 4, at('igzoom'), at('igstack'), at('igend')]) expect(hits, String(t)).toContain(t);
    // the score stops before the hand-off of the end card
    const last = Math.max(...parts.map((p) => p.to ?? p.from));
    expect(last).toBeLessThanOrEqual(st.at(-1)!.end - 2);
    // one ending only: no title or statement card any more
    expect((configs.es.scenes as { de?: string }[]).filter((s) => s.de === 'title' || s.de === 'statement')).toHaveLength(0);
  });

  it('before each work front, a sentence along the line (and one more into CompliA and into the own path)', () => {
    for (const lang of ['es', 'en'] as const) {
      const fronts = (configs[lang].scenes as Sc[]).filter((s) => s.type === 'igfronts');
      const lines = fronts.flatMap((f) => [...(f.stops as { lead?: { text: string } }[]).map((s) => s.lead?.text), (f.exit as { text: string } | undefined)?.text]).filter(Boolean) as string[];
      expect(lines, lang).toHaveLength(6);
      for (const l of lines) expect(l.length, l).toBeLessThanOrEqual(80);
      for (const l of lines) expect(l.endsWith('…'), l).toBe(true);
    }
    expect((configs.es.scenes as Sc[]).find((s) => s.type === 'igfronts')!.stops).toMatchObject([{ lead: { text: 'Y ese fue mi primer paso hacia nuevas experiencias, como trabajar en…' } }, {}, {}]);
  });

  it('the opening names the place, not coordinates nobody gave', () => {
    for (const lang of ['es', 'en'] as const) {
      const coast = (configs[lang].scenes as { type: string; kicker?: string }[]).find((s) => s.type === 'igcoast')!;
      expect(coast.kicker).toBe('Mar del Plata · Argentina');
      expect(strings(configs[lang].scenes).join(' ')).not.toMatch(/\d+°/);
    }
  });

  it('phones get the light film: no layer-hungry CSS inside the stage, the clip loads near its scene only', () => {
    const css = readFileSync(new URL('../../public/trailer/v2/css/ig.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.is-lite #stage \*[^{]*\{ will-change: auto !important; filter: none !important; \}/);
    expect(css).toMatch(/\.is-lite #grain, \.is-lite #vignette \{ display: none; \}/);
    const kit = readFileSync(new URL('../../public/trailer/v2/js/ig-kit.js', import.meta.url), 'utf8');
    expect(kit).toMatch(/gsap\.config\(\{ force3D: false \}\)/);
    expect(kit).toMatch(/contentVisibility: 'hidden'/);
    const kase = readFileSync(new URL('../../public/trailer/v2/js/ig-case.js', import.meta.url), 'utf8');
    expect(kase).toMatch(/preload="none"/);
    expect(kase).not.toMatch(/<source src=/);
  });

  it('act 5: every shot of the montage exists, and its view has the same texts in both languages', () => {
    const ids = montage(configs.es).shots!.map((s) => s.id);
    expect(ids).toHaveLength(6);
    expect(montage(configs.en).shots!.map((s) => s.id)).toEqual(ids);
    for (const id of ids) {
      expect(shots[id], id).toBeDefined();
      expect(shape(shots[id].text.en), id).toEqual(shape(shots[id].text.es));
      for (const lang of ['es', 'en'] as const) {
        const html = shots[id].html(shots[id].text[lang]);
        expect(html, `${id} ${lang}`).not.toMatch(/undefined|https?:\/\//);
        expect(strings(shots[id].text[lang]).join(' '), `${id} ${lang}`).not.toMatch(/28\/10|\b5 ?%|vibe/i);
      }
    }
    // the wall «Todo, en código.» flies a still of each view (tools/wall.mjs), one per language
    for (const id of ids) for (const lang of ['es', 'en'] as const) {
      expect(existsSync(new URL(`../../public/trailer/v2/media/wall/${lang}/${id}.webp`, import.meta.url)), `wall ${lang}/${id}`).toBe(true);
    }
    // no client brand inside the rebuilt views (only the project's own name, in the tag)
    for (const id of ['supernova', 'games']) {
      for (const lang of ['es', 'en'] as const) {
        expect(shots[id].html(shots[id].text[lang]), `${id} ${lang}`).not.toMatch(/supernova/i);
      }
    }
  });

  it('the technologies act: every tile exists, has a name and where it was used, in both languages', () => {
    type Stack = { type: string; screens?: { tiles: string[] }[] };
    const act = (c: Cfg) => (c.scenes as Stack[]).find((s) => s.type === 'igstack')!;
    const ids = act(configs.es).screens!.flatMap((s) => s.tiles);
    expect(ids).toHaveLength(17);
    expect(act(configs.en).screens!.flatMap((s) => s.tiles)).toEqual(ids);
    for (const id of ids) {
      expect(tiles[id], id).toBeDefined();
      expect(shape(tiles[id].text.en), id).toEqual(shape(tiles[id].text.es));
      for (const lang of ['es', 'en'] as const) {
        const t = tiles[id].text[lang] as { name?: string; note?: string };
        expect(t.name && t.note, `${id} ${lang}`).toBeTruthy();
        expect(tiles[id].html(t), `${id} ${lang}`).not.toMatch(/undefined|https?:\/\//);
      }
    }
  });

  it('one film, two formats: the configs carry no stage; ?o=v (main.js) sets the 1080×1920 one', () => {
    for (const lang of ['es', 'en'] as const) expect(configs[lang].stage, lang).toBeUndefined();
    const main = readFileSync(new URL('../../public/trailer/v2/main.js', import.meta.url), 'utf8');
    expect(main).toMatch(/get\('o'\) === 'v'/);
    expect(main).toMatch(/stage: \{ w: 1080, h: 1920 \}/);
  });

  it('the text version has the same 14 moments in both languages', () => {
    expect(es.trailer.transcript).toHaveLength(14);
    expect(en.trailer.transcript).toHaveLength(14);
    expect(es.trailer.transcript.at(-1)).toContain(CONTACT_EMAIL);
    expect(en.trailer.transcript.at(-1)).toContain(CONTACT_EMAIL);
  });
});
