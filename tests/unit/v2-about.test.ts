import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import pubEs from '../../messages/es.json';
import pubEn from '../../messages/en.json';
import es from '../../messages/v2/about/es.json';
import en from '../../messages/v2/about/en.json';
import { SKILL_ROWS } from '../../lib/home';
import { CASE_ORDER } from '../../v2/components/case/cases';
import { caseCopy } from '../../v2/components/case/copy';
import { dust, GROUPS, kin, lonLat, named, project, shortest, STARS, starSize, visible, yawOfGroup, yawOfStar } from '../../v2/components/about/sky';
import { STOPS, TSOFT, YEARS } from '../../v2/components/about/timeline';

/** «Sobre mí» of /v2 (lote 7.1): the sheet, the story, the timeline and the sky of skills say only what the approved
 *  record says, and the sky's maths hold. */
const COPY = { es, en } as const;
const PUB = { es: pubEs, en: pubEn } as const;
const VOICE = { es: /\b(sin|no|nunca|todavía|falta|pendiente)\b/i, en: /\b(no|not|never|without|yet|missing|lack)\b|n't\b/i };
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const strings = (o: unknown): string[] => typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(strings) : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : [];
const keys = (o: unknown, p = ''): string[] => Array.isArray(o) ? [`${p}[${o.length}]`] : o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => keys(v, `${p}.${k}`)) : [p];

describe('v2 about (lote 7.1)', () => {
  it('the words: same keys in both languages, a positive voice, short paragraphs', () => {
    expect(keys(en)).toEqual(keys(es));
    for (const loc of ['es', 'en'] as const) {
      const c = COPY[loc];
      for (const s of strings(c)) {
        expect(s, loc).not.toMatch(VOICE[loc]);
        expect(s, loc).not.toMatch(/handyx|vibe coding|\bSsr\b/i);
      }
      const paragraphs = [c.lead, c.contact.lead, c.timeline.lead, c.sky.lead, ...Object.values(c.cases.items), ...Object.values(c.timeline.stops).flatMap((s) => s.text), ...Object.values(c.sky.stars).map((s) => s.note)];
      for (const p of paragraphs) expect(words(p), `${loc}: ${p}`).toBeLessThanOrEqual(25);
      for (const t of [c.story.title, c.timeline.title, c.sky.title, c.cases.title, c.contact.title, ...Object.values(c.timeline.stops).map((s) => s.title)]) expect(words(t), t).toBeLessThanOrEqual(8);
    }
  });

  it('the sheet: Sr, the languages, and the stack I use at work, as approved', () => {
    for (const loc of ['es', 'en'] as const) {
      const s = COPY[loc].sheet;
      expect(s.level).toBe('Sr');
      expect(s.rows.role.v).toBe('AI Fullstack Developer');
      expect(s.rows.langs.v).toMatch(/C1/);
      expect(s.rows.where.v).toBe('Mar del Plata, Argentina');
      expect(s.rows.today.v).toMatch(/Tsoft.*2024/);
      expect(s.rows.before.v).toMatch(/TACH Argentina \(2021 – 2022\).*Ada ITW \(2023 – 2024\)/);
      expect(s.stackItems).toHaveLength(9);
    }
    // the nine of the approved sheet («En el trabajo uso»): the ledger's work column, in its order
    const work = SKILL_ROWS.filter((r) => r.at.includes('work')).map((r) => r.id);
    expect(work).toEqual(['react', 'typescript', 'nextjs', 'reactnative', 'tailwind', 'node', 'sql', 'cicd', 'rag']);
    expect(es.sheet.stackItems).toEqual(['React', 'TypeScript', 'Next.js', 'React Native', 'Tailwind', 'Node.js', 'SQL', 'CI/CD', 'RAG con LLM']);
  });

  it('the story reads in thirty seconds: five beats, 75 words at most', () => {
    for (const loc of ['es', 'en'] as const) {
      const b = COPY[loc].story.beats;
      expect(b).toHaveLength(5);
      expect(b.reduce((n, s) => n + words(s), 0), loc).toBeLessThanOrEqual(75);
    }
  });

  it('the timeline is the published journey: eight stops, their dates and titles as approved', () => {
    expect(STOPS.map((s) => s.id)).toEqual(['seed', 'tach', 'ada', 'tuenti', 'dash', 'award', 'ai', 'own']);
    for (const loc of ['es', 'en'] as const) {
      const pub = PUB[loc].journey.items, mine = COPY[loc].timeline.stops;
      expect(pub).toHaveLength(STOPS.length);
      STOPS.forEach((s, i) => {
        expect(mine[s.id].when, `${loc} ${s.id}`).toBe(pub[i].when);
        expect(mine[s.id].title, `${loc} ${s.id}`).toBe(pub[i].title);
        // every sentence of the card comes from the approved text (the long ones are split, never rewritten)
        const approved = pub[i].text.replace(/I'm/g, 'I am');
        for (const t of mine[s.id].text) for (const sentence of t.split(/(?<=\.)\s+/)) {
          const core = sentence.replace(/^(Hice|I built) /, '').replace(/[.]$/, '').slice(0, 40);
          expect(approved.includes(core) || approved.replace(/; hice/, '. Hice').includes(core), `${loc} ${s.id}: ${sentence}`).toBe(true);
        }
      });
    }
    // only what the record dates is drawn against the years
    for (const s of STOPS) {
      if (s.kind === 'job') { expect(YEARS).toContain(s.span![0]); expect(YEARS).toContain(s.span![1]); } else expect(s.span).toBeUndefined();
      for (const c of s.cases ?? []) expect(CASE_ORDER).toContain(c);
    }
    expect(STOPS.find((s) => s.id === 'tach')!.span).toEqual([2021, 2022]);
    expect(STOPS.find((s) => s.id === 'ada')!.span).toEqual([2023, 2024]);
    expect(TSOFT.span[0]).toBe(2024);
  });

  it('the sky: 27 stars in six constellations, each named in both languages, figures inside their own group', () => {
    expect(STARS).toHaveLength(27);
    expect(new Set(STARS.map((s) => s.id)).size).toBe(27);
    expect(GROUPS).toHaveLength(6);
    for (const g of GROUPS) {
      const mine = STARS.filter((s) => s.group === g.id).map((s) => s.id);
      expect(mine.length, g.id).toBeGreaterThanOrEqual(3);
      const joined = new Set(g.edges.flat());
      for (const id of joined) expect(mine, `${g.id} edge ${id}`).toContain(id);
      for (const id of mine) expect(joined.has(id), `${g.id}: ${id} is in the figure`).toBe(true);
      for (const loc of ['es', 'en'] as const) expect(COPY[loc].sky.groups[g.id]).toBeTruthy();
    }
    for (const loc of ['es', 'en'] as const) expect(Object.keys(COPY[loc].sky.stars).sort()).toEqual(STARS.map((s) => s.id).sort());
    // the constellations sit 60° apart and their stars stay inside their own sector (none wanders into a neighbour)
    for (const s of STARS) {
      const g = GROUPS.find((x) => x.id === s.group)!;
      expect(Math.abs(shortest(yawOfGroup(g.id), yawOfStar(s))), s.id).toBeLessThan((28 * Math.PI) / 180);
    }
    // names of two stars of one constellation never start on the same spot
    for (const a of STARS) for (const b of STARS) {
      if (a.id >= b.id || a.group !== b.group) continue;
      const [la, pa] = lonLat(a), [lb, pb] = lonLat(b);
      expect(Math.hypot(la - lb, pa - pb), `${a.id} / ${b.id}`).toBeGreaterThan((9 * Math.PI) / 180);
    }
  });

  it('where each star comes from is the approved ledger, and its name and note are the approved ones', () => {
    for (const row of SKILL_ROWS) {
      const star = STARS.find((s) => s.id === row.id)!;
      expect(star, row.id).toBeTruthy();
      expect(star.from, row.id).toEqual(row.at);
      for (const loc of ['es', 'en'] as const) {
        const pub = PUB[loc].skills.rows[row.id as keyof typeof pubEs.skills.rows], mine = COPY[loc].sky.stars[row.id as keyof typeof es.sky.stars];
        expect(mine.name, row.id).toBe(pub.name);
        expect(mine.note.replace(/\.$/, ''), row.id).toBe(pub.note);
      }
    }
    // a star I am only studying is hollow: it has no proof; a star with proofs comes from work or from my projects
    for (const s of STARS) {
      if (s.from.length === 1 && s.from[0] === 'study') expect(s.proofs, s.id).toHaveLength(0);
      if (s.proofs.length) expect(s.from.some((f) => f !== 'study'), s.id).toBe(true);
    }
  });

  it('every proof holds: the case names the skill in its own stack, or in its text when the stack names only the layer', () => {
    const inText: Record<string, RegExp> = { react: /React|Frontend/, security: /CSRF|Argon2|HttpOnly|2FA/, gamification: /gamificaci[oó]n/i, compliance: /compliance/i };
    let n = 0;
    for (const s of STARS) for (const p of s.proofs) {
      if (!('case' in p)) { expect(p.page, s.id).toMatch(/^[a-z-]+\/(#[a-z]+)?$/); continue; }
      n++;
      expect(CASE_ORDER, `${s.id} → ${p.case}`).toContain(p.case);
      const copy = caseCopy('es', p.case);
      if (s.byNote?.includes(p.case)) expect(JSON.stringify(copy), `${s.id} → ${p.case} (text)`).toMatch(inText[s.id]);
      else { expect(s.match, s.id).toBeTruthy(); expect(copy.stack.some((t) => s.match!.test(t)), `${s.id} → ${p.case} (stack: ${copy.stack.join(', ')})`).toBe(true); }
    }
    expect(n).toBeGreaterThan(40);
    // and the other way: a case that names React or TypeScript in its stack is among that star's proofs
    for (const id of ['react', 'typescript', 'nextjs'] as const) {
      const s = STARS.find((x) => x.id === id)!;
      for (const c of CASE_ORDER) if (caseCopy('es', c).stack.some((t) => s.match!.test(t))) expect(s.proofs.some((p) => 'case' in p && p.case === c), `${id} ← ${c}`).toBe(true);
    }
  });

  it('the sky’s maths: a star faces front at its own yaw, the far side is gone, sizes come from the proofs', () => {
    for (const s of STARS) {
      const [lon, lat] = lonLat(s);
      const front = project(lon, lat, yawOfStar(s));
      expect(Math.abs(front.x), s.id).toBeLessThan(1e-9);
      expect(front.z, s.id).toBeGreaterThan(0.9);
      expect(visible(front.z)).toBe(1);
      expect(named(front.z)).toBe(1);
      const back = project(lon, lat, yawOfStar(s) + Math.PI);
      expect(visible(back.z), s.id).toBe(0);
      // everything stays inside the picture: 1.3 radii each way
      for (let k = 0; k < 12; k++) { const p = project(lon, lat, (k * Math.PI) / 6, 0.12); expect(Math.abs(p.x)).toBeLessThan(1.3); expect(Math.abs(p.y)).toBeLessThan(1.3); }
    }
    expect(shortest(0.1, 2 * Math.PI - 0.1)).toBeCloseTo(-0.2);
    expect(shortest(0, Math.PI)).toBeCloseTo(Math.PI);
    const react = STARS.find((s) => s.id === 'react')!, rn = STARS.find((s) => s.id === 'reactnative')!, ml = STARS.find((s) => s.id === 'ml')!;
    expect(starSize(react)).toBeGreaterThan(starSize(rn));
    expect(starSize(rn)).toBeGreaterThan(starSize(ml));
    // the stars used together: six at most, never itself, only stars that share a proof
    for (const s of STARS) {
      const k = kin(s.id);
      expect(k.length).toBeLessThanOrEqual(6);
      expect(k).not.toContain(s.id);
      if (!s.proofs.length) expect(k).toHaveLength(0);
    }
    expect(kin('rag')).toContain('compliance');
    expect(dust()).toEqual(dust());
    expect(dust()).toHaveLength(64);
  });

  it('the frame: text of 12 px or more, and only transform and opacity move', () => {
    const css = readFileSync('app/v2/[locale]/about.css', 'utf8');
    for (const m of css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(12);
    for (const m of css.matchAll(/transition:\s*([^;]+);/g)) for (const part of m[1].split(',')) expect(part.trim().split(/\s+/)[0]).toMatch(/^(transform|opacity)$/);
    expect(css).not.toMatch(/@keyframes|animation:/);
  });
});
