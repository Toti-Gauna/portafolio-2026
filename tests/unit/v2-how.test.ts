import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import pubEs from '../../messages/es.json';
import pubEn from '../../messages/en.json';
import es from '../../messages/v2/how/es.json';
import en from '../../messages/v2/how/en.json';
import { SYSTEM_FLOW } from '../../lib/home';
import { AGENTS, STATIONS, WALK } from '../../v2/components/how/flow';

/** «Cómo trabajo» of /v2 (lote 7.3): the method, the system and the rules say what the published site says, the
 *  living diagram follows the published «Cómo viaja un cambio», and the words keep the page's rules. */
const COPY = { es, en } as const;
const PUB = { es: pubEs, en: pubEn } as const;
const VOICE = { es: /\b(sin|no|nunca|todavía|falta|pendiente)\b/i, en: /\b(no|not|never|without|yet|missing|lack)\b|n't\b/i };
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const strings = (o: unknown): string[] => typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(strings) : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : [];
const keys = (o: unknown, p = ''): string[] => Array.isArray(o) ? [`${p}[${o.length}]`] : o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => keys(v, `${p}.${k}`)) : [p];

describe('v2 how I work (lote 7.3)', () => {
  it('the words: same keys, a positive voice, paragraphs of 25 words and titles of 8 at most', () => {
    expect(keys(en)).toEqual(keys(es));
    for (const loc of ['es', 'en'] as const) {
      const c = COPY[loc];
      for (const s of strings(c)) { expect(s, loc).not.toMatch(VOICE[loc]); expect(s, loc).not.toMatch(/vibe coding|handyx/i); }
      const paras = [c.method.lead, c.system.lead, ...c.method.steps.flatMap((s) => [s.text, s.example]), ...Object.values(c.system.nodes).map((n) => n.note), ...Object.values(c.system.agents).map((a) => a.role), ...c.rules.items.map((i) => i.d)];
      for (const p of paras) expect(words(p), `${loc}: ${p}`).toBeLessThanOrEqual(25);
      for (const t of [c.method.title, c.system.title, c.rules.title]) expect(words(t), t).toBeLessThanOrEqual(8);
    }
  });

  it('the method is the published one: six steps, their names, short names and what I did there', () => {
    for (const loc of ['es', 'en'] as const) {
      const pub = PUB[loc].method.steps, mine = COPY[loc].method.steps;
      expect(mine).toHaveLength(6);
      mine.forEach((s, i) => {
        expect(s.name).toBe(pub[i].name);
        expect(s.short).toBe(pub[i].short);
        expect(s.example).toBe(pub[i].example);
      });
    }
  });

  it('the living diagram is «Cómo viaja un cambio»: its stations, its edges and its way back from QA', () => {
    expect([...STATIONS]).toEqual(SYSTEM_FLOW.nodes.map((n) => n.id));
    // every step of the walk travels a published edge, in its direction
    for (let i = 1; i < WALK.length; i++) {
      const e = SYSTEM_FLOW.edges.find((x) => x.id === WALK[i].edge);
      expect(e, `step ${i}`).toBeTruthy();
      expect([e!.from, e!.to], `step ${i}`).toEqual([WALK[i - 1].at, WALK[i].at]);
    }
    expect(WALK[0].at).toBe('ask');
    expect(WALK.at(-1)!.at).toBe('ship');
    expect(WALK.some((w) => w.edge === 'fail')).toBe(true);
    // every edge has its words, in both languages
    for (const loc of ['es', 'en'] as const) for (const e of SYSTEM_FLOW.edges) expect(COPY[loc].system.edges[e.id as keyof typeof es.system.edges], e.id).toBeTruthy();
  });

  it('the eleven agents are the published ones, with their names; Dirección decides the plan, the rest work as role agents', () => {
    expect(AGENTS).toHaveLength(11);
    for (const loc of ['es', 'en'] as const) {
      const pub = PUB[loc].system.agents;
      expect(AGENTS.map((a) => a.id)).toEqual(pub.map((a) => a.id));
      for (const a of pub) expect(COPY[loc].system.agents[a.id as keyof typeof es.system.agents].name, a.id).toBe(a.name);
    }
    expect(AGENTS.filter((a) => a.at === 'chief').map((a) => a.id)).toEqual(['chief']);
    expect(AGENTS.filter((a) => a.at !== 'chief').every((a) => a.at === 'roles')).toBe(true);
  });

  it('the evidence: the test run of 27/10/2026, as published', () => {
    for (const loc of ['es', 'en'] as const) {
      const pub = PUB[loc].system.points.map((p) => p.text).join(' ');
      for (const c of COPY[loc].rules.counts) expect(pub, c.n).toContain(c.n);
      expect(COPY[loc].rules.run).toMatch(/27/);
      expect(COPY[loc].rules.items).toHaveLength(7);
      expect(COPY[loc].rules.levels).toHaveLength(3);
    }
  });

  it('the frame: text of 12 px or more, and only transform, opacity and stroke-dashoffset move', () => {
    const css = readFileSync('app/v2/[locale]/how.css', 'utf8');
    for (const m of css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(12);
    for (const m of css.matchAll(/transition:\s*([^;]+);/g)) for (const part of m[1].split(/,(?![^(]*\))/)) expect(part.trim().split(/\s+/)[0]).toMatch(/^(transform|opacity|stroke-dashoffset)$/);
    expect(css).not.toMatch(/@keyframes|animation:/);
  });
});
