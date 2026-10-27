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
beforeAll(async () => {
  (globalThis as unknown as { Trailer: unknown }).Trailer = {
    run: (c: Cfg) => { configs[c.lang as string] = c; },
    igShots: { add: (id: string, def: Shot) => { shots[id] = def; } },
  };
  const dir = '../../public/trailer/v2/js/'; // plain JS served as is: no types to check
  for (const f of ['shots/eclipse.js', 'shots/handy.js', 'shots/lab.js', 'trailer.es.js', 'trailer.en.js']) await import(/* @vite-ignore */ `${dir}${f}`);
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
    expect((cEs.scenes as unknown[]).length).toBe(20);
    expect(shape(cEn.scenes)).toEqual(shape(cEs.scenes));
    expect(shape(cEn.ui)).toEqual(shape(cEs.ui));
  });

  it('says nothing the site does not: no «vibe coding», the approved roles and the contact', () => {
    for (const lang of ['es', 'en'] as const) {
      const text = strings(configs[lang].scenes).join(' ');
      expect(text).not.toMatch(/vibe/i);
      expect(text).toContain('Ssr AI Fullstack Developer');
      expect(text).toContain(CONTACT_EMAIL);
    }
  });

  it('act 5: every shot of the montage exists, and its view has the same texts in both languages', () => {
    const ids = montage(configs.es).shots!.map((s) => s.id);
    expect(ids).toHaveLength(11);
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
  });

  it('the text version has the same 13 moments in both languages', () => {
    expect(es.trailer.transcript).toHaveLength(13);
    expect(en.trailer.transcript).toHaveLength(13);
    expect(es.trailer.transcript.at(-1)).toContain(CONTACT_EMAIL);
    expect(en.trailer.transcript.at(-1)).toContain(CONTACT_EMAIL);
  });
});
