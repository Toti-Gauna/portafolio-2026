/**
 * «Cómo trabajo» of /v2 (lote 7.3): the structure of the living diagram. The stations are the published «Cómo viaja un
 * cambio» (lib/home.ts, SYSTEM_FLOW: the same seven nodes and the same edges, the return from QA included); the
 * eleven agents are the published ones, each standing where the published copy puts it — Dirección decides the plan,
 * every other agent works as a role agent. Words: messages/v2/how/<locale>.json.
 */
import type { AgentId } from '@/components/AgentIcon';

export const STATIONS = ['ask', 'chief', 'spec', 'roles', 'qa', 'gate', 'ship'] as const;
export type StationId = (typeof STATIONS)[number];
export type EdgeKey = 'brief' | 'plan' | 'lote' | 'change' | 'evidence' | 'fail' | 'release';

/** «Seguir un cambio»: the stations a change visits, and what it carries to get to each one. QA fails it once and
 *  sends it back to the agents: the change comes back through the same gate. */
export const WALK: { at: StationId; edge?: EdgeKey }[] = [
  { at: 'ask' },
  { at: 'chief', edge: 'brief' },
  { at: 'spec', edge: 'plan' },
  { at: 'roles', edge: 'lote' },
  { at: 'qa', edge: 'change' },
  { at: 'roles', edge: 'fail' },
  { at: 'qa', edge: 'change' },
  { at: 'gate', edge: 'evidence' },
  { at: 'ship', edge: 'release' },
];

/** The eleven agents, in the published order, and the station where each one works. */
export const AGENTS: { id: AgentId; at: StationId }[] = [
  { id: 'chief', at: 'chief' },
  { id: 'uxui', at: 'roles' },
  { id: 'design', at: 'roles' },
  { id: 'marketing', at: 'roles' },
  { id: 'ads', at: 'roles' },
  { id: 'frontend', at: 'roles' },
  { id: 'backend', at: 'roles' },
  { id: 'security', at: 'roles' },
  { id: 'game', at: 'roles' },
  { id: 'trailer', at: 'roles' },
  { id: 'docs', at: 'roles' },
];

/** Seconds a step of «Seguir un cambio» and of «Recorrer el ciclo» stays (timers, never animation frames). */
export const FLOW_STEP_MS = 1700;
export const RING_STEP_MS = 1600;
