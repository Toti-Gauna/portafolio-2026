import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import es from '../../messages/v2/es.json';
import en from '../../messages/v2/en.json';
import { BRAND_ORDER, brandOf } from '../../v2/components/brand/brands';
import { mktCopy } from '../../v2/components/mkt/copy';
import { PIECE_SIZE, Piece } from '../../v2/components/mkt/Piece';
import { PLAY_ORDER, PLAYS } from '../../v2/components/mkt/plays';
import { doy, spans } from '../../v2/components/mkt/Playbook';
import type { PlayId } from '../../v2/components/mkt/types';

/** Marketing playbooks of /v2 (lote 6.3): one per project with a brand, every touchpoint with its piece and its
 *  source, the words in both languages under the page's rules. */
const LOCALES = ['es', 'en'] as const;
const VOICE = { es: /\b(sin|no|nunca|todavía|falta|pendiente)\b/i, en: /\b(no|not|never|without|yet|missing|lack)\b|n't\b/i };
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const strings = (o: unknown): string[] => typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(strings) : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : [];
const keys = (o: unknown, p = ''): string[] => Array.isArray(o) ? [`${p}[${o.length}]`] : o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => keys(v, `${p}.${k}`)) : [p];

describe('v2 marketing playbooks (lote 6.3)', () => {
  it('one playbook per project with a brand; the two lab exercises have none', () => {
    expect(PLAY_ORDER).toEqual(['ig', 'eclipse', 'velmar', 'volta', 'brisa', 'lucero']);
    expect(BRAND_ORDER.filter((b) => !PLAY_ORDER.includes(b as PlayId))).toEqual(['sereno', 'brote']);
    for (const id of PLAY_ORDER) expect(PLAYS[id].id).toBe(id);
  });

  it('every way: its stages, both lanes, unique points, every stage met and two points at most per cell', () => {
    for (const id of PLAY_ORDER) {
      const p = PLAYS[id];
      expect(p.touches.length, id).toBeGreaterThanOrEqual(6);
      expect(p.touches.length, id).toBeLessThanOrEqual(9);
      expect(new Set(p.touches.map((t) => t.id)).size, id).toBe(p.touches.length);
      expect(p.touches.some((t) => t.lane === 'digital') && p.touches.some((t) => t.lane === 'physical'), id).toBe(true);
      for (let s = 0; s < p.stages; s++) expect(p.touches.some((t) => t.stage === s), `${id} stage ${s}`).toBe(true);
      const cells = new Map<string, number>();
      for (const t of p.touches) {
        expect(t.stage, `${id}.${t.id}`).toBeLessThan(p.stages);
        cells.set(`${t.stage}${t.lane}`, (cells.get(`${t.stage}${t.lane}`) ?? 0) + 1);
      }
      expect(Math.max(...cells.values()), id).toBeLessThanOrEqual(2);
      // the path never goes back in the way
      for (let i = 1; i < p.touches.length; i++) expect(p.touches[i].stage, `${id} order`).toBeGreaterThanOrEqual(p.touches[i - 1].stage);
    }
  });

  it('every point says where it comes from: a cited file for the built ones, nothing for a proposal', () => {
    for (const id of PLAY_ORDER) {
      const p = PLAYS[id];
      if (id !== 'ig') expect(p.sha, id).toMatch(/^[0-9a-f]{40}$/);
      for (const t of p.touches) {
        if (t.origin === 'plan') expect(t.src, `${id}.${t.id}`).toBeUndefined();
        else { expect(t.src?.path, `${id}.${t.id}`).toBeTruthy(); expect(t.src!.match.length, `${id}.${t.id}`).toBeGreaterThan(3); }
      }
      // most of each way is built, written or live: proposals are the minority
      expect(p.touches.filter((t) => t.origin === 'plan').length * 2, id).toBeLessThan(p.touches.length);
    }
    // IG's own sources are files of this repo, and they say what is cited
    for (const t of PLAYS.ig.touches.filter((x) => x.src)) expect(readFileSync(t.src!.path, 'utf8'), t.id).toContain(t.src!.match);
  });

  it('the years of campaigns: real days, one campaign per day in each lane, a name for each', () => {
    for (const id of PLAY_ORDER) {
      const cal = PLAYS[id].calendar;
      for (const loc of LOCALES) expect(!!mktCopy(loc, id).calendar, `${id} ${loc}`).toBe(!!cal);
      if (!cal) continue;
      for (const lane of cal.lanes) {
        const taken = new Set<number>();
        for (const d of cal.dates.filter((x) => x.lane === lane)) {
          for (const [a, b] of spans(d)) for (let x = a; x <= b; x++) { expect(taken.has(x), `${id} ${d.key} ${x}`).toBe(false); taken.add(x); }
        }
      }
      for (const d of cal.dates) {
        expect(cal.lanes, `${id} ${d.key}`).toContain(d.lane);
        for (const loc of LOCALES) expect(mktCopy(loc, id).calendar!.dates[d.key], `${id} ${d.key}`).toBeTruthy();
      }
    }
    expect(PLAYS.volta.calendar!.dates).toHaveLength(17);
    expect(PLAYS.velmar.calendar!.dates).toHaveLength(16);
    expect(doy([1, 1])).toBe(1);
    expect(doy([12, 31])).toBe(365);
    expect(spans({ key: 'x', lane: 'l', from: [12, 26], to: [1, 6] })).toEqual([[360, 365], [1, 6]]);
  });

  it('the words: same keys in both languages, one per point and per stage, within their limits, in a positive voice', () => {
    for (const id of PLAY_ORDER) {
      const [ces, cen] = [mktCopy('es', id), mktCopy('en', id)];
      expect(keys(cen), id).toEqual(keys(ces));
      for (const loc of LOCALES) {
        const c = mktCopy(loc, id), p = PLAYS[id];
        expect(c.stages, `${id} ${loc}`).toHaveLength(p.stages);
        expect(Object.keys(c.touches).sort(), `${id} ${loc}`).toEqual(p.touches.map((t) => t.id).sort());
        expect(c.rules, `${id} ${loc}`).toHaveLength(3);
        const lim: [string, number][] = [[c.title, 8], [c.goal, 14], [c.audience, 14], [c.next ?? '', 26], [c.source, 34], ...c.stages.map((s) => [s, 3] as [string, number]), ...c.rules.map((r) => [r, 16] as [string, number])];
        for (const t of Object.values(c.touches)) lim.push([t.name, 5], [t.msg, 26], [t.rule, 24], [t.watch, 14], [t.alt, 16]);
        for (const [s, n] of lim) expect(words(s), `${id} ${loc}: ${s}`).toBeLessThanOrEqual(n);
        for (const s of strings(c)) {
          expect(s, `${id} ${loc}`).not.toMatch(VOICE[loc]);
          expect(s, `${id} ${loc}`).not.toMatch(/handyx|vibe coding|\bseña\b|\bSsr\b/i);
          // a playbook is a plan: no results in it (no percentages of growth, no customers counted)
          expect(s, `${id} ${loc}`).not.toMatch(/\d+\s?%|\bclientes reales\b|\breal customers\b/i);
        }
      }
    }
    const pick = (m: typeof es) => keys(m.mkt);
    expect(pick(en as typeof es)).toEqual(pick(es));
    for (const s of strings(es.mkt)) expect(s).not.toMatch(VOICE.es);
    for (const s of strings(en.mkt)) expect(s).not.toMatch(VOICE.en);
  });

  it('every piece: fits a 360 px phone, draws its words at full size and only bars in a thumbnail', () => {
    for (const [kind, [w]] of Object.entries(PIECE_SIZE)) expect(w, kind).toBeLessThanOrEqual(320);
    for (const id of PLAY_ORDER) {
      const { spec, copy } = brandOf('es', id);
      const brand = { name: copy.name, mark: spec.art(copy.art).logo.submark };
      for (const t of PLAYS[id].touches) {
        const p = mktCopy('es', id).touches[t.id].p;
        const big = renderToStaticMarkup(createElement(Piece, { kind: t.kind, p, brand, seed: t.id }));
        const mini = renderToStaticMarkup(createElement(Piece, { kind: t.kind, p, brand, seed: t.id, mini: true }));
        expect(big, `${id}.${t.id}`).toContain('aria-hidden="true"');
        for (const s of strings(p)) expect(big.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'), `${id}.${t.id}: ${s}`).toContain(s);
        expect(mini, `${id}.${t.id}`).toContain('class="mkb');
        for (const s of strings(p).filter((x) => x.length > 3)) expect(mini, `${id}.${t.id} mini`).not.toContain(s);
        expect(big, `${id}.${t.id}`).not.toMatch(/<script|<img|https?:\/\//);
      }
    }
  });

  it('the frame: text of 12 px or more, and only transform, opacity and stroke-dashoffset move', () => {
    const css = readFileSync('app/v2/[locale]/mkt.css', 'utf8');
    for (const m of css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(12);
    for (const m of css.matchAll(/transition:\s*([^;]+);/g)) for (const part of m[1].split(',')) expect(part.trim().split(/\s+/)[0]).toMatch(/^(transform|opacity|stroke-dashoffset)$/);
    expect(css).not.toMatch(/@keyframes|animation:/);
  });
});
