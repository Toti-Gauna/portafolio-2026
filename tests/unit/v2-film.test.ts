import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SHOT_IDS } from '../../v2/components/trailer/shots';
import { BAR, CHAPTERS, chapterAt, CITY_AT, DOT, dotTrack, type Fmt, isLive, MARK, SHOTS, shotAt, STAGE, TOTAL, waveAt } from '../../v2/trailer/film';
import { ALLOWED, PRESETS } from '../../v2/trailer/presets';
import script from '../../v2/trailer/script.json';

/** The film of the trailer of /v2 (lote 8.2): its line of time, the journey of the dot, what may move and its styles. */
const FMTS: Fmt[] = ['w', 't'];
const css = readFileSync('app/v2/[locale]/trailer.css', 'utf8');
const shotsSrc = readFileSync('v2/components/trailer/shots.tsx', 'utf8');

describe('v2 trailer film (lote 8.2)', () => {
  it('one line of time: 80 seconds, a shot for every shot of the script and only its neighbours on stage', () => {
    expect(TOTAL).toBeCloseTo(80, 5);
    expect(SHOT_IDS).toEqual(script.shots.map((s) => s.id));
    expect(SHOTS.at(-1)!.start + SHOTS.at(-1)!.dur).toBeCloseTo(TOTAL, 5);
    expect(CHAPTERS).toHaveLength(6);
    expect(shotAt(0)).toBe(0);
    expect(SHOTS[shotAt(27)].id).toBe('complia');
    expect(chapterAt(TOTAL - 0.01)).toBe(5);
    // at any moment there are few shots on stage: the one playing and the one it is covering
    for (let t = 0; t < TOTAL; t += 0.25) {
      const live = SHOTS.filter((_, i) => isLive(i, t));
      expect(live.length, `t=${t}`).toBeGreaterThanOrEqual(1);
      expect(live.length, `t=${t}`).toBeLessThanOrEqual(3);
      expect(live.map((s) => s.id)).toContain(SHOTS[shotAt(t)].id);
    }
  });

  it('the dot: it starts as the dot of the mark, lands in every shot inside the stage, and ends as the dot of the mark', () => {
    expect(Object.keys(DOT)).toEqual(SHOTS.map((s) => s.id));
    for (const f of FMTS) {
      const [W, H] = STAGE[f], track = dotTrack(f);
      const [mx, my, mw] = MARK.open[f];
      expect(track[0].x).toBeCloseTo(mx + (11 / 48) * mw, 5);
      expect(track[0].y).toBeCloseTo(my + (7 / 48) * mw, 5);
      const [ex, ey, ew] = MARK.end[f], last = track.at(-1)!;
      expect([last.x, last.y, last.size]).toEqual([ex + (11 / 48) * ew, ey + (7 / 48) * ew, (6.8 / 48) * ew]);
      for (let i = 1; i < track.length; i++) {
        expect(track[i].t, `${f} ${i}`).toBeGreaterThan(track[i - 1].t);
        expect(track[i].x).toBeGreaterThan(2); expect(track[i].x).toBeLessThan(W - 2);
        expect(track[i].y).toBeGreaterThan(2); expect(track[i].y).toBeLessThan(H - 2);
        expect(track[i].size).toBeGreaterThanOrEqual(3); expect(track[i].size).toBeLessThanOrEqual(6);
      }
      // every shot is opened by a landing on its first beat (the wave is born there), except the first: the dot is falling
      SHOTS.forEach((s, i) => { if (i) expect(track.some((k) => Math.abs(k.t - s.start) < 1e-6), s.id).toBe(true); });
      expect(waveAt('mdp', f)).toEqual(CITY_AT[f]);
      // the monograms are inside the stage
      for (const m of [MARK.open[f], MARK.end[f]]) { expect(m[0] + m[2]).toBeLessThan(W); expect(m[1] + m[2]).toBeLessThan(H); }
    }
    expect(BAR).toBeCloseTo(60 / 108 * 4, 6);
  });

  it('what moves: every movement of the shots is a preset, and a preset only animates transform, opacity, clip-path and stroke-dashoffset', () => {
    const used = new Set([...shotsSrc.matchAll(/a\('([a-z]+)'/g)].map((m) => m[1]));
    expect(used.size).toBeGreaterThan(10);
    for (const name of used) expect(PRESETS[name], name).toBeTypeOf('function');
    for (const [name, make] of Object.entries(PRESETS)) {
      for (const hold of [0, 2]) {
        const m = make({ u: 9, n: 3, rx: 5, ry: -14, hold });
        expect(m.duration, name).toBeGreaterThan(0);
        expect(m.duration, name).toBeLessThan(8000);
        for (const k of m.keyframes) for (const prop of Object.keys(k)) expect(ALLOWED, `${name}.${prop}`).toContain(prop);
        for (const k of m.keyframes) if (typeof k.offset === 'number') { expect(k.offset).toBeGreaterThanOrEqual(0); expect(k.offset).toBeLessThanOrEqual(1); }
      }
    }
    const film = readFileSync('v2/components/trailer/Film.tsx', 'utf8');
    for (const prop of film.matchAll(/\{ (\w+): [`']/g)) expect(ALLOWED, prop[1]).toContain(prop[1]);
  });

  it('the styles: nothing moves from the CSS, and no text of the film goes under 12 px', () => {
    expect(css).not.toMatch(/@keyframes|animation:|transition:/);
    for (const m of css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(12);
    // every size in stage units has the floor of the site, except the big numbers (they are tens of units tall)
    const sized = [...css.matchAll(/font(?:-size)?:[^;]*var\(--u\)[^;]*;/g)].map((m) => m[0]);
    expect(sized.length).toBeGreaterThan(40);
    for (const rule of sized) if (!rule.includes('--h')) expect(rule, rule).toContain('max(12px');
  });

  it('the page: the trailer copy has the words of the player in both languages, and the film is asked for on demand', () => {
    const player = readFileSync('v2/components/trailer/TrailerPlayer.tsx', 'utf8');
    expect(player).toMatch(/dynamic\(\(\) => import\('\.\/Film'\), \{ ssr: false \}\)/);
    expect(player).not.toMatch(/autoPlay|autoplay/);
    const page = readFileSync('v2/components/trailer/TrailerPage.tsx', 'utf8');
    expect(page).not.toMatch(/>\s*[A-ZÁÉÍÓÚ][a-záéíóú]+ [a-záéíóú]+[^<{]*</); // no copy in the component
  });
});
