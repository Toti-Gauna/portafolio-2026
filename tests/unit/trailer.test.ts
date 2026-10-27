import { describe, expect, it } from 'vitest';
import { DURATION, SCENE_STARTS, T, sceneAt } from '../../components/trailer/timing';
import { buildScore } from '../../components/trailer/score';
import { rng } from '../../components/trailer/rng';
import { MAIN, SIDE_COUNT, buildBranches, graphRect, partial } from '../../components/trailer/graph';

describe('trailer timing', () => {
  it('lasts 120 s and its scenes are in order', () => {
    expect(DURATION).toBe(120);
    expect(SCENE_STARTS.length).toBe(11);
    for (let i = 1; i < SCENE_STARTS.length; i++) expect(SCENE_STARTS[i]).toBeGreaterThan(SCENE_STARTS[i - 1]);
    expect(SCENE_STARTS[10]).toBeLessThan(T.end);
  });
  it('maps a time to its scene', () => {
    expect(sceneAt(0)).toBe(0);
    expect(sceneAt(T.s4)).toBe(3);
    expect(sceneAt(T.s7 + 0.1)).toBe(6);
    expect(sceneAt(119.9)).toBe(10);
  });
});

describe('score', () => {
  const score = buildScore();
  it('is sorted and inside the trailer', () => {
    for (let i = 1; i < score.length; i++) expect(score[i].t).toBeGreaterThanOrEqual(score[i - 1].t);
    expect(score[0].t).toBeGreaterThanOrEqual(0);
    expect(score[score.length - 1].t).toBeLessThan(DURATION);
  });
  it('is deterministic', () => {
    expect(buildScore()).toEqual(score);
  });
  it('has finite frequencies and volumes', () => {
    for (const e of score) {
      if (e.f !== undefined) expect(Number.isFinite(e.f) && e.f > 0).toBe(true);
      if (e.v !== undefined) expect(e.v).toBeGreaterThan(0);
    }
  });
});

describe('rng and graph', () => {
  it('rng repeats for the same seed', () => {
    const a = rng(5), b = rng(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('builds the four career branches and the project branches inside the graph area', () => {
    const r = graphRect('landscape', 1920, 1080);
    const g = buildBranches(r);
    expect(g.main.length).toBe(MAIN.length);
    expect(g.side.length).toBe(SIDE_COUNT);
    for (const b of [...g.main, ...g.side]) for (const p of b.pts) {
      expect(p.x).toBeGreaterThanOrEqual(r.x - 1); expect(p.x).toBeLessThanOrEqual(r.x + r.w + 1);
      expect(p.y).toBeGreaterThanOrEqual(r.y - 1); expect(p.y).toBeLessThanOrEqual(r.y + r.h + 1);
    }
  });
  it('partial() draws the right fraction', () => {
    const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }];
    expect(partial(pts, 0)).toEqual([]);
    expect(partial(pts, 1)).toEqual(pts);
    expect(partial(pts, 0.75).at(-1)).toEqual({ x: 15, y: 0 });
  });
});
