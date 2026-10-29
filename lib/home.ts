/** Structure of the home's richer blocks (copy in messages/<locale>.json). */
import type { ArchSpec } from '@/lib/diagrams/types';
import type { TechId } from '@/components/diagrams/TechIcon';
import type { CaseSlug } from '@/lib/cases';

/** «Qué hago»: each pillar points to the case that proves it. */
export const PILLARS: { id: 'ai' | 'full' | 'quality' | 'motion'; slug: CaseSlug }[] = [
  { id: 'ai', slug: 'complia' },
  { id: 'full', slug: 'eclipse' },
  { id: 'quality', slug: 'eclipse' },
  { id: 'motion', slug: 'kinetic' },
];

/** What a work card says is inside its case page (labels in work.inside.*). */
export type InsideTag = 'diagram' | 'flow' | 'business' | 'security' | 'quality' | 'decisions' | 'video' | 'limits';
export const WORK_INSIDE: Record<'complia' | 'tuenti' | 'eclipse', InsideTag[]> = {
  complia: ['diagram', 'flow', 'video', 'limits'],
  tuenti: ['limits'],
  eclipse: ['diagram', 'flow', 'security', 'decisions', 'quality'],
};

/** The skills ledger: where each technology comes from (approved by Ignacio, 28/10/2026). */
export const SKILL_ROWS: { id: TechId; at: ('work' | 'own' | 'study')[] }[] = [
  { id: 'react', at: ['work', 'own'] },
  { id: 'typescript', at: ['work', 'own'] },
  { id: 'nextjs', at: ['work', 'own'] },
  { id: 'reactnative', at: ['work'] },
  { id: 'tailwind', at: ['work', 'own'] },
  { id: 'node', at: ['work', 'own'] },
  { id: 'sql', at: ['work', 'own'] },
  { id: 'cicd', at: ['work', 'own'] },
  { id: 'rag', at: ['work'] },
  { id: 'security', at: ['own'] },
  { id: 'tests', at: ['own'] },
  { id: 'motion', at: ['own'] },
  { id: 'python', at: ['own', 'study'] },
  { id: 'c', at: ['own', 'study'] },
  { id: 'ml', at: ['study'] },
  { id: 'aws', at: ['study'] },
  { id: 'azure', at: ['study'] },
];

const SW = 250;
/** «Sistema»: how a change travels from a request to a release, with the human gate. */
export const SYSTEM_FLOW: ArchSpec = {
  id: 'system-flow',
  nodes: [
    { id: 'ask', kind: 'person' },
    { id: 'chief', kind: 'service', tone: 'yellow' },
    { id: 'spec', kind: 'doc' },
    { id: 'roles', kind: 'ai', tone: 'blue' },
    { id: 'qa', kind: 'code', tone: 'green' },
    { id: 'gate', kind: 'gate', tone: 'coral' },
    { id: 'ship', kind: 'cloud' },
  ],
  edges: [
    { id: 'brief', from: 'ask', to: 'chief' },
    { id: 'plan', from: 'chief', to: 'spec', tone: 'yellow' },
    { id: 'lote', from: 'spec', to: 'roles' },
    { id: 'change', from: 'roles', to: 'qa', tone: 'blue' },
    { id: 'evidence', from: 'qa', to: 'gate', tone: 'green' },
    { id: 'release', from: 'gate', to: 'ship', tone: 'coral' },
    { id: 'fail', from: 'qa', to: 'roles', dashed: true },
  ],
  desktop: {
    w: 1000, h: 420,
    nodes: { ask: { x: 20, y: 30, w: SW }, chief: { x: 375, y: 30, w: SW }, spec: { x: 730, y: 30, w: SW }, roles: { x: 730, y: 190, w: SW }, qa: { x: 375, y: 190, w: SW }, gate: { x: 20, y: 190, w: SW }, ship: { x: 20, y: 340, w: SW } },
    edges: {
      change: { from: 'l', to: 'r', fo: 14, too: 14 },
      fail: { from: 'r', to: 'l', fo: -14, too: -14 },
    },
  },
  mobile: {
    w: 360, h: 640,
    nodes: Object.fromEntries(['ask', 'chief', 'spec', 'roles', 'qa', 'gate', 'ship'].map((id, i) => [id, { x: 20, y: 10 + i * 90, w: SW }])),
    edges: {
      fail: { d: 'M270 398C320 398 324 394 324 370L324 334C324 312 320 308 273 308', hide: true },
    },
  },
};
