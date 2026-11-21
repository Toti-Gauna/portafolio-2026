/**
 * The timeline of «Sobre mí» (lote 7.1): 2021 → today. Structure only; the words are the approved journey of the
 * published site (messages → journey.items), in messages/v2/about/<locale>.json → timeline.stops.
 *
 * What is drawn against the years is only what the record dates: TACH (2021 – 2022), Ada ITW (2023 – 2024) and Tsoft
 * (2024 – today). The four moments at Tsoft are in their order inside its band, not placed on a date the record
 * does not give; the seed («a los 17») sits before the axis and my own paths at its end («hoy»).
 */
import type { CaseSlug } from '../case/cases';
import type { StampId } from '../kit/stamps';

export const YEARS = [2021, 2022, 2023, 2024, 2025, 2026] as const;

export type StopId = 'seed' | 'tach' | 'ada' | 'tuenti' | 'dash' | 'award' | 'ai' | 'own';
export type Stop = {
  id: StopId;
  /** where it is drawn: before the axis, a dated bar, a moment inside Tsoft's band, or at the end */
  kind: 'seed' | 'job' | 'moment' | 'own';
  /** first and last year of a dated bar */
  span?: [number, number];
  /** its colour (the spectrum of the site, as in the world of Work) */
  color: string;
  stamp?: StampId;
  cases?: CaseSlug[];
};

/** Tsoft's band: 2024 → today. It holds the four moments. */
export const TSOFT = { span: [2024, 2026] as [number, number], color: '#5f86ff' };

export const STOPS: Stop[] = [
  { id: 'seed', kind: 'seed', color: '#ff5a3c' },
  { id: 'tach', kind: 'job', span: [2021, 2022], color: '#ffa04a', stamp: 'tach' },
  { id: 'ada', kind: 'job', span: [2023, 2024], color: '#3fe0b0', stamp: 'ada' },
  { id: 'tuenti', kind: 'moment', color: '#5f86ff', stamp: 'tuenti', cases: ['tuenti'] },
  { id: 'dash', kind: 'moment', color: '#5f86ff', cases: ['tuenti'] },
  { id: 'award', kind: 'moment', color: '#5f86ff' },
  { id: 'ai', kind: 'moment', color: '#5f86ff', stamp: 'complia', cases: ['complia', 'supernova'] },
  { id: 'own', kind: 'own', color: '#ffc247', stamp: 'eclipse', cases: ['eclipse', 'agentes', 'kinetic'] },
];
