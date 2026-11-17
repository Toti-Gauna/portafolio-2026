/**
 * «El camino» (Ola 5, design/2026/camino.md): the career as a model railway. A coral line carries a handcar from station
 * to station; each station is a stop of the stepper and holds one or more buildings, each with its card.
 * Copy: messages → career.stations.<id> and career.buildings.<id>. Every fact comes from the approved record (the work
 * cards, the cases, the trailer's transcript and, for HandyX, Lucero and Trazo, their own READMEs).
 * The drawing is built by scripts/camino/build.mjs into public/media/camino/; its parts carry these ids.
 */
import type { StatusKind } from './status';
import type { CaseSlug } from './cases';

export type StationId = 'origin' | 'tach' | 'ada' | 'tsoft' | 'own' | 'next';

export type BuildingId =
  | 'seed'
  | 'tach'
  | 'ada'
  | 'tsoft' | 'tuenti' | 'complia' | 'supernova'
  | 'eclipse' | 'agentes' | 'kinetic' | 'volta' | 'velmar' | 'dentalos' | 'games' | 'handyx' | 'lucero' | 'trazo'
  | 'core' | 'cyber' | 'quant' | 'space';

export type Building = {
  id: BuildingId;
  /** the status of a project (lib/status.ts); company stations say what kind of work it was instead (copy) */
  status?: StatusKind;
  /** its case page, when there is one */
  slug?: CaseSlug;
  /** the brand on its sign: a typographic stand-in until Ignacio sends the official logo files (CLAUDE.md, «Logos») */
  sign?: string;
};

export type Station = { id: StationId; buildings: Building[] };

export const STATIONS: Station[] = [
  { id: 'origin', buildings: [{ id: 'seed' }] },
  { id: 'tach', buildings: [{ id: 'tach', sign: 'TACH' }] },
  { id: 'ada', buildings: [{ id: 'ada', sign: 'ADA ITW' }] },
  {
    id: 'tsoft',
    buildings: [
      { id: 'tsoft', sign: 'TSOFT' },
      { id: 'tuenti', slug: 'tuenti', sign: 'TUENTI' },
      { id: 'complia', status: 'produccion', slug: 'complia', sign: 'TELEFÓNICA' },
      { id: 'supernova', status: 'prototipo', slug: 'supernova' },
    ],
  },
  {
    id: 'own',
    buildings: [
      { id: 'eclipse', status: 'desarrollo', slug: 'eclipse' },
      { id: 'agentes', slug: 'agentes' },
      { id: 'kinetic', slug: 'kinetic' },
      { id: 'volta', status: 'demo', slug: 'volta' },
      { id: 'velmar', status: 'demo', slug: 'velmar' },
      { id: 'dentalos', status: 'demo', slug: 'dentalos' },
      { id: 'games', status: 'banco', slug: 'games' },
      { id: 'handyx', status: 'mvp' },
      { id: 'lucero', status: 'demo' },
      { id: 'trazo' },
    ],
  },
  {
    id: 'next',
    buildings: [
      { id: 'core', status: 'planeado' },
      { id: 'cyber', status: 'planeado' },
      { id: 'quant', status: 'planeado' },
      { id: 'space', status: 'planeado' },
    ],
  },
];

export const BUILDINGS = STATIONS.flatMap((s) => s.buildings.map((b) => ({ ...b, station: s.id })));
