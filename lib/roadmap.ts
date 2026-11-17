/**
 * The roadmap (Ola 6, design/2026/roadmap.md): Ignacio's plan from November 2026 to August 2030, in four stages.
 * Source: the plan he sent on 16/11/2026 (prices left out on purpose; the Security+ exam code too). Everything here is
 * «Planeado» except P0, which is under way (Ignacio, 17/11/2026). Dates are shown as month and year.
 * Copy: messages → roadmap.items.<id> ({ name, tech?, what, exit?, opens? }).
 * Kinds: a project (P, S, Q, A), a maths window (W: programming stops, pure maths until 85 % or more in the stage's
 * tests), a certification (C) or a pause (a break, the buffer, a stage's close).
 */
import type { StatusKind } from './status';

export type StageId = 'core' | 'cyber' | 'quant' | 'space';
export type RoadKind = 'project' | 'window' | 'cert' | 'pause';
/** the six hand-made models; the rest of the projects use the kit's presets */
export type Diorama = 'faro' | 'escudo' | 'surco' | 'estacion' | 'lupa' | 'horizonte';

export type RoadItem = {
  id: string;
  stage: StageId;
  kind: RoadKind;
  /** the plan's own code: P1, W2, C3, S1, Q4, A7… (pauses have none) */
  code?: string;
  weeks: number;
  /** ISO dates, both inclusive */
  from: string;
  to: string;
  /** every piece is «planeado» unless it says otherwise */
  status?: StatusKind;
  diorama?: Diorama;
  /** the plan marks it as a proposal, with an alternative */
  proposed?: true;
  /** the plan says it can be cut short */
  cut?: true;
};

export const STAGES: StageId[] = ['core', 'cyber', 'quant', 'space'];

export const ROADMAP: RoadItem[] = [
  { id: 'p0', stage: 'core', kind: 'project', code: 'P0', weeks: 2, from: '2026-11-16', to: '2026-11-29', status: 'desarrollo' },
  { id: 'p1', stage: 'core', kind: 'project', code: 'P1', weeks: 5, from: '2026-11-30', to: '2027-01-03', diorama: 'faro' },
  { id: 'pausa-1', stage: 'core', kind: 'pause', weeks: 1, from: '2027-01-04', to: '2027-01-10' },
  { id: 'p2', stage: 'core', kind: 'project', code: 'P2', weeks: 4, from: '2027-01-11', to: '2027-02-07', diorama: 'escudo' },
  { id: 'w1', stage: 'core', kind: 'window', code: 'W1', weeks: 3, from: '2027-02-08', to: '2027-02-28' },
  { id: 'p3', stage: 'core', kind: 'project', code: 'P3', weeks: 4, from: '2027-03-01', to: '2027-03-28', diorama: 'surco' },
  { id: 'c1', stage: 'core', kind: 'cert', code: 'C1', weeks: 2, from: '2027-03-29', to: '2027-04-11' },
  { id: 'p4', stage: 'core', kind: 'project', code: 'P4', weeks: 5, from: '2027-04-12', to: '2027-05-16', diorama: 'estacion' },
  { id: 'p5', stage: 'core', kind: 'project', code: 'P5', weeks: 3, from: '2027-05-17', to: '2027-06-06', diorama: 'faro' },
  { id: 'c2', stage: 'core', kind: 'cert', code: 'C2', weeks: 3, from: '2027-06-07', to: '2027-06-27' },
  { id: 'w2', stage: 'core', kind: 'window', code: 'W2', weeks: 4, from: '2027-06-28', to: '2027-07-25' },
  { id: 'p6', stage: 'core', kind: 'project', code: 'P6', weeks: 5, from: '2027-07-26', to: '2027-08-29', diorama: 'lupa' },
  { id: 'p7', stage: 'core', kind: 'project', code: 'P7', weeks: 3, from: '2027-08-30', to: '2027-09-19', diorama: 'surco' },
  { id: 'c3', stage: 'core', kind: 'cert', code: 'C3', weeks: 2, from: '2027-09-20', to: '2027-10-03' },
  { id: 'w3', stage: 'core', kind: 'window', code: 'W3', weeks: 4, from: '2027-10-04', to: '2027-10-31' },
  { id: 'p8', stage: 'core', kind: 'project', code: 'P8', weeks: 3, from: '2027-11-01', to: '2027-11-21', proposed: true },
  { id: 'p9', stage: 'core', kind: 'project', code: 'P9', weeks: 4, from: '2027-11-22', to: '2027-12-19', diorama: 'lupa', proposed: true },
  { id: 'p10', stage: 'core', kind: 'project', code: 'P10', weeks: 5, from: '2027-12-20', to: '2028-01-23', diorama: 'estacion' },
  { id: 'colchon', stage: 'core', kind: 'pause', weeks: 2, from: '2028-01-24', to: '2028-02-06' },
  { id: 'w4', stage: 'cyber', kind: 'window', code: 'W4', weeks: 2, from: '2028-02-07', to: '2028-02-20' },
  { id: 's1', stage: 'cyber', kind: 'project', code: 'S1', weeks: 3, from: '2028-02-21', to: '2028-03-12' },
  { id: 'pausa-2', stage: 'cyber', kind: 'pause', weeks: 1, from: '2028-03-13', to: '2028-03-19' },
  { id: 's2', stage: 'cyber', kind: 'project', code: 'S2', weeks: 5, from: '2028-03-20', to: '2028-04-23' },
  { id: 'c4', stage: 'cyber', kind: 'cert', code: 'C4', weeks: 3, from: '2028-04-24', to: '2028-05-14' },
  { id: 'c5', stage: 'cyber', kind: 'cert', code: 'C5', weeks: 2, from: '2028-05-15', to: '2028-05-28' },
  { id: 'c6', stage: 'cyber', kind: 'cert', code: 'C6', weeks: 3, from: '2028-05-29', to: '2028-06-18' },
  { id: 's3', stage: 'cyber', kind: 'project', code: 'S3', weeks: 5, from: '2028-06-19', to: '2028-07-23' },
  { id: 'c7', stage: 'cyber', kind: 'cert', code: 'C7', weeks: 3, from: '2028-07-24', to: '2028-08-13' },
  { id: 'cierre-1', stage: 'cyber', kind: 'pause', weeks: 1, from: '2028-08-14', to: '2028-08-20' },
  { id: 'wq1', stage: 'quant', kind: 'window', code: 'WQ1', weeks: 3, from: '2028-08-21', to: '2028-09-10' },
  { id: 'q1', stage: 'quant', kind: 'project', code: 'Q1', weeks: 5, from: '2028-09-11', to: '2028-10-15' },
  { id: 'q2', stage: 'quant', kind: 'project', code: 'Q2', weeks: 5, from: '2028-10-16', to: '2028-11-19', proposed: true },
  { id: 'descanso-1', stage: 'quant', kind: 'pause', weeks: 1, from: '2028-11-20', to: '2028-11-26' },
  { id: 'wq2', stage: 'quant', kind: 'window', code: 'WQ2', weeks: 4, from: '2028-11-27', to: '2028-12-24' },
  { id: 'q3', stage: 'quant', kind: 'project', code: 'Q3', weeks: 5, from: '2028-12-25', to: '2029-01-28' },
  { id: 'q4', stage: 'quant', kind: 'project', code: 'Q4', weeks: 5, from: '2029-01-29', to: '2029-03-04' },
  { id: 'wq3', stage: 'quant', kind: 'window', code: 'WQ3', weeks: 2, from: '2029-03-05', to: '2029-03-18' },
  { id: 'q5', stage: 'quant', kind: 'project', code: 'Q5', weeks: 6, from: '2029-03-19', to: '2029-04-29' },
  { id: 'pausa-3', stage: 'quant', kind: 'pause', weeks: 1, from: '2029-04-30', to: '2029-05-06' },
  { id: 'q6', stage: 'quant', kind: 'project', code: 'Q6', weeks: 5, from: '2029-05-07', to: '2029-06-10', proposed: true },
  { id: 'cierre-2', stage: 'quant', kind: 'pause', weeks: 2, from: '2029-06-11', to: '2029-06-24' },
  { id: 'wa1', stage: 'space', kind: 'window', code: 'WA1', weeks: 4, from: '2029-06-25', to: '2029-07-22' },
  { id: 'a1', stage: 'space', kind: 'project', code: 'A1', weeks: 6, from: '2029-07-23', to: '2029-09-02' },
  { id: 'wa2', stage: 'space', kind: 'window', code: 'WA2', weeks: 3, from: '2029-09-03', to: '2029-09-23' },
  { id: 'a2', stage: 'space', kind: 'project', code: 'A2', weeks: 6, from: '2029-09-24', to: '2029-11-04' },
  { id: 'descanso-2', stage: 'space', kind: 'pause', weeks: 1, from: '2029-11-05', to: '2029-11-11' },
  { id: 'wa3', stage: 'space', kind: 'window', code: 'WA3', weeks: 4, from: '2029-11-12', to: '2029-12-09' },
  { id: 'a3', stage: 'space', kind: 'project', code: 'A3', weeks: 6, from: '2029-12-10', to: '2030-01-20', cut: true },
  { id: 'wa4', stage: 'space', kind: 'window', code: 'WA4', weeks: 3, from: '2030-01-21', to: '2030-02-10' },
  { id: 'a4', stage: 'space', kind: 'project', code: 'A4', weeks: 6, from: '2030-02-11', to: '2030-03-24' },
  { id: 'wa5', stage: 'space', kind: 'window', code: 'WA5', weeks: 2, from: '2030-03-25', to: '2030-04-07' },
  { id: 'a5', stage: 'space', kind: 'project', code: 'A5', weeks: 5, from: '2030-04-08', to: '2030-05-12' },
  { id: 'a6', stage: 'space', kind: 'project', code: 'A6', weeks: 4, from: '2030-05-13', to: '2030-06-09', proposed: true, cut: true },
  { id: 'pausa-4', stage: 'space', kind: 'pause', weeks: 1, from: '2030-06-10', to: '2030-06-16' },
  { id: 'a7', stage: 'space', kind: 'project', code: 'A7', weeks: 7, from: '2030-06-17', to: '2030-08-04', diorama: 'horizonte' },
  { id: 'cierre-3', stage: 'space', kind: 'pause', weeks: 2, from: '2030-08-05', to: '2030-08-18' },
];

export const statusOf = (it: RoadItem): StatusKind => it.status ?? 'planeado';
export const itemsOf = (stage: StageId) => ROADMAP.filter((it) => it.stage === stage);

/** «feb – ago 2028», «nov 2026 – ene 2027», «nov 2026»: month and year, the year once when both ends share it. */
export function monthRange(from: string, to: string, locale: string): string {
  const a = new Date(`${from}T00:00:00Z`);
  const b = new Date(`${to}T00:00:00Z`);
  const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  const year = (d: Date) => d.getUTCFullYear();
  const m = (d: Date) => month.format(d).replace(/\.$/, '');
  if (year(a) === year(b) && a.getUTCMonth() === b.getUTCMonth()) return `${m(a)} ${year(a)}`;
  if (year(a) === year(b)) return `${m(a)} – ${m(b)} ${year(a)}`;
  return `${m(a)} ${year(a)} – ${m(b)} ${year(b)}`;
}

/** Counts for the lead: projects (P, S, Q, A), maths windows, certifications. */
export const COUNTS = {
  p: ROADMAP.filter((i) => i.kind === 'project').length,
  w: ROADMAP.filter((i) => i.kind === 'window').length,
  c: ROADMAP.filter((i) => i.kind === 'cert').length,
};
