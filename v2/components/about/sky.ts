/**
 * The sky of skills of «Sobre mí» (lote 7.1): every skill is a star on a sphere, grouped in six constellations. Pure
 * data and maths, shared by the server (which sends the sky already projected) and the client (which turns it).
 *
 * Rules of the model:
 *  - a star never states a level. Its size is the number of proofs it has (cases or pages of this site that use it),
 *    so every number comes from the model; a skill I am studying is a hollow star.
 *  - where a star comes from (work, my own projects, study) is the ledger approved by Ignacio on 28/10/2026
 *    (lib/home.ts, SKILL_ROWS) plus the «también» and «conocimiento» lists of the site.
 *  - a proof that is a case is checked against that case's own stack (tests/unit/v2-about.test.ts), or against the
 *    approved note of the skill when the case's stack only names the layer (`byNote`).
 */
import type { CaseSlug } from '../case/cases';

export type GroupId = 'front' | 'back' | 'ai' | 'craft' | 'product' | 'study';
export type Source = 'work' | 'own' | 'study';
export type Proof = { case: CaseSlug } | { page: string; key: string };

export type Star = {
  id: string;
  group: GroupId;
  from: Source[];
  /** degrees from the centre of its constellation: [east, north] */
  at: [number, number];
  proofs: Proof[];
  /** what the case's stack must say for a case to count as a proof */
  match?: RegExp;
  /** cases named by the skill's approved note, whose stack only names the layer («Frontend», «Backend») */
  byNote?: CaseSlug[];
  /** which side of the star its name sits on */
  side?: 'l' | 'r';
};

/** The six constellations, in the order of the sky (60° apart), each in a colour of the site's spectrum. */
export const GROUPS: { id: GroupId; lon: number; lat: number; color: string; edges: [string, string][] }[] = [
  { id: 'front', lon: 0, lat: 6, color: '#8aa4ff', edges: [['reactnative', 'react'], ['react', 'typescript'], ['typescript', 'nextjs'], ['react', 'tailwind'], ['tailwind', 'nextjs']] },
  { id: 'back', lon: 60, lat: -8, color: '#58d5ff', edges: [['node', 'sql'], ['node', 'security'], ['security', 'cicd'], ['sql', 'cicd']] },
  { id: 'ai', lon: 120, lat: 8, color: '#c79bff', edges: [['rag', 'agents'], ['agents', 'claude'], ['rag', 'ml']] },
  { id: 'craft', lon: 180, lat: -6, color: '#3fe0b0', edges: [['tests', 'motion'], ['motion', 'design'], ['design', 'tests']] },
  { id: 'product', lon: 240, lat: 8, color: '#ffc247', edges: [['gamification', 'compliance'], ['compliance', 'teaching'], ['teaching', 'sales']] },
  { id: 'study', lon: 300, lat: -6, color: '#ff8fc0', edges: [['python', 'c'], ['c', 'aws'], ['aws', 'azure'], ['python', 'arvr'], ['arvr', 'blender'], ['blender', 'meshy']] },
];

const c = (slug: CaseSlug): Proof => ({ case: slug });

export const STARS: Star[] = [
  // interfaces
  { id: 'react', group: 'front', from: ['work', 'own'], at: [-4, 6], match: /^React( \d+)?$/, byNote: ['complia'], proofs: [c('complia'), c('tuenti'), c('eclipse'), c('volta'), c('velmar'), c('dentalos'), c('supernova'), c('games')] },
  { id: 'typescript', group: 'front', from: ['work', 'own'], at: [10, 13], match: /^TypeScript/, proofs: [c('tuenti'), c('eclipse'), c('kinetic'), c('volta'), c('velmar'), c('dentalos'), c('supernova'), c('games')] },
  { id: 'nextjs', group: 'front', from: ['work', 'own'], at: [15, -2], match: /^Next\.js/, proofs: [c('eclipse'), c('volta'), c('velmar')] },
  { id: 'reactnative', group: 'front', from: ['work'], at: [-17, 13], match: /^React Native$/, proofs: [c('tuenti')], side: 'l' },
  { id: 'tailwind', group: 'front', from: ['work', 'own'], at: [-1, -11], match: /^Tailwind/, proofs: [c('volta'), c('velmar')] },
  // servers and data
  { id: 'node', group: 'back', from: ['work', 'own'], at: [-10, 10], match: /^Node/, proofs: [c('tuenti'), c('eclipse')], side: 'l' },
  { id: 'sql', group: 'back', from: ['work', 'own'], at: [8, 12], match: /^(SQL|PostgreSQL)$/, proofs: [c('tuenti'), c('eclipse')] },
  { id: 'cicd', group: 'back', from: ['work', 'own'], at: [12, -6], match: /^(CI\/CD|GitHub Actions)$/, proofs: [c('complia'), c('tuenti'), c('kinetic')] },
  { id: 'security', group: 'back', from: ['own'], at: [-8, -9], match: /^(OWASP Top 10|ASVS)$/, byNote: ['eclipse'], proofs: [c('eclipse'), c('agentes')], side: 'l' },
  // AI
  { id: 'rag', group: 'ai', from: ['work'], at: [-6, 4], match: /^RAG$/, proofs: [c('complia')], side: 'l' },
  { id: 'agents', group: 'ai', from: ['own'], at: [9, 11], match: /^SKILL\.md$/, proofs: [c('agentes'), { page: 'como-trabajo/', key: 'how' }] },
  { id: 'claude', group: 'ai', from: ['own'], at: [16, -3], match: /^Claude Code$/, proofs: [c('agentes')] },
  { id: 'ml', group: 'ai', from: ['study'], at: [-11, -10], proofs: [], side: 'l' },
  // quality, motion and design
  { id: 'tests', group: 'craft', from: ['own'], at: [-11, 9], match: /^(Vitest|Playwright)$/, proofs: [c('eclipse'), c('volta'), c('velmar'), c('dentalos'), c('supernova'), c('games')], side: 'l' },
  { id: 'motion', group: 'craft', from: ['own'], at: [11, 8], match: /^(GSAP|Three\.js|OGL \(WebGL\))$/, proofs: [c('kinetic'), c('supernova'), c('eclipse')] },
  { id: 'design', group: 'craft', from: ['own'], at: [1, -10], proofs: [{ page: 'brand-lab/', key: 'brand' }, { page: 'tokens/', key: 'system' }] },
  // product
  { id: 'gamification', group: 'product', from: ['work'], at: [-12, 9], byNote: ['tuenti'], proofs: [c('tuenti')], side: 'l' },
  { id: 'compliance', group: 'product', from: ['work'], at: [2, 2], byNote: ['complia'], proofs: [c('complia')] },
  { id: 'teaching', group: 'product', from: ['work'], at: [13, 11], proofs: [{ page: 'sobre-mi/#recorrido', key: 'timeline' }] },
  { id: 'sales', group: 'product', from: ['study'], at: [14, -9], proofs: [] },
  // what I am studying
  { id: 'python', group: 'study', from: ['own', 'study'], at: [-13, 11], proofs: [], side: 'l' },
  { id: 'c', group: 'study', from: ['own', 'study'], at: [-2, 14], proofs: [] },
  { id: 'aws', group: 'study', from: ['study'], at: [9, 9], proofs: [] },
  { id: 'azure', group: 'study', from: ['study'], at: [17, 1], proofs: [] },
  { id: 'arvr', group: 'study', from: ['study'], at: [-14, -3], proofs: [], side: 'l' },
  { id: 'blender', group: 'study', from: ['study'], at: [-3, -11], proofs: [] },
  { id: 'meshy', group: 'study', from: ['study'], at: [9, -12], proofs: [] },
];

export const groupOf = (id: GroupId) => GROUPS.find((g) => g.id === id)!;
export const starOf = (id: string) => STARS.find((s) => s.id === id)!;
const RAD = Math.PI / 180;
/** How wide a constellation opens around its centre (the offsets of its stars are multiplied by this). */
export const SPREAD = 1.25;

/** Where a star is on the sphere: longitude and latitude in radians (its constellation's centre plus its offset). */
export function lonLat(s: Star): [number, number] {
  const g = groupOf(s.group);
  return [(g.lon + s.at[0] * SPREAD) * RAD, (g.lat + s.at[1] * SPREAD) * RAD];
}

/** The yaw that brings a star (or a constellation) to the front, in radians. */
export const yawOfStar = (s: Star) => lonLat(s)[0];
export const yawOfGroup = (id: GroupId) => groupOf(id).lon * RAD;

/** How much nearer things grow: the sky is seen from outside, with a long lens. */
export const DEPTH = 0.2;
export type Point = { x: number; y: number; z: number };

/**
 * A point of the unit sphere on the screen, with the sky turned `yaw` around its axis and tilted `pitch`:
 * x to the right, y down, z toward the viewer (z < 0 is the far side). x and y are in sphere radii.
 */
export function project(lon: number, lat: number, yaw: number, pitch = 0): Point {
  const a = lon - yaw;
  const x = Math.cos(lat) * Math.sin(a), y0 = -Math.sin(lat), z0 = Math.cos(lat) * Math.cos(a);
  const y = y0 * Math.cos(pitch) - z0 * Math.sin(pitch), z = y0 * Math.sin(pitch) + z0 * Math.cos(pitch);
  const k = 1 + DEPTH * z;
  return { x: x * k, y: y * k, z };
}

/** How visible a point is: gone behind the limb, full once it is well on the near side. */
export const visible = (z: number) => Math.max(0, Math.min(1, (z - 0.12) / 0.3));
/** How visible its name is: names are only for what faces the visitor (near the limb they would pile up). */
export const named = (z: number) => Math.max(0, Math.min(1, (z - 0.62) / 0.16));

/** The shortest turn from one yaw to another, in (−π, π]. */
export function shortest(from: number, to: number): number {
  let d = (to - from) % (2 * Math.PI);
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d <= -Math.PI) d += 2 * Math.PI;
  return d;
}

/** The size of a star, in px of radius: one step per proof, from a small hollow one to a bright one. */
export const starSize = (s: Star) => 5 + Math.min(s.proofs.length, 8) * 0.9;

/** The stars most used together with this one: those that share the most proofs with it (six at most). */
export function kin(id: string): string[] {
  const key = (p: Proof) => ('case' in p ? `c:${p.case}` : `p:${p.page}`);
  const mine = new Set(starOf(id).proofs.map(key));
  return STARS.filter((s) => s.id !== id)
    .map((s) => ({ id: s.id, n: s.proofs.filter((p) => mine.has(key(p))).length }))
    .filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 6).map((x) => x.id);
}

/** Faint stars with no name, for depth: seeded, the same on the server and in the browser. */
export function dust(n = 64): [number, number, number][] {
  let h = 20261121;
  const r = () => ((h = Math.imul(h ^ (h >>> 15), 2246822519) + 0x9e3779b9 | 0) >>> 0) / 4294967296;
  return Array.from({ length: n }, () => [r() * 2 * Math.PI, Math.asin(r() * 1.5 - 0.75), 0.5 + r() * 0.9] as [number, number, number]);
}
