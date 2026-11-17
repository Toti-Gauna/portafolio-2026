/**
 * «Negocio y marketing» (Ola 8b, design/2026/negocio.md): structure of the page. Copy lives in messages → negocio.*;
 * every example points to one of the projects below (its status comes from lib/career.ts) and to its case page.
 * Nothing here is a measured result: the page says so.
 */
import type { CaseSlug } from './cases';

export const TOPICS = ['models', 'digital', 'physical', 'brand', 'ops', 'funnels'] as const;
export type TopicId = (typeof TOPICS)[number];

export type ProjectId = Extract<CaseSlug, 'volta' | 'velmar' | 'dentalos' | 'lucero' | 'eclipse' | 'supernova'>;

/** The project behind each example, in the order of negocio.topics.<id>.items. The funnels topic draws its own figures. */
export const EXAMPLES: Record<Exclude<TopicId, 'funnels'>, ProjectId[]> = {
  models: ['volta', 'velmar', 'lucero', 'eclipse'],
  digital: ['volta', 'velmar', 'lucero', 'dentalos', 'eclipse'],
  physical: ['lucero', 'velmar', 'supernova', 'volta'],
  brand: ['volta', 'velmar', 'dentalos', 'lucero', 'eclipse'],
  ops: ['volta', 'velmar', 'dentalos', 'lucero', 'supernova'],
};

export const FLOW_PROJECTS = ['volta', 'velmar', 'lucero', 'eclipse'] as const;
export const RAIL_PROJECTS = ['volta', 'velmar', 'lucero', 'dentalos'] as const;
export const FUNNEL_PROJECTS = ['volta', 'velmar', 'dentalos', 'lucero', 'eclipse'] as const;

/** Width of each step of the audience figure, in %: illustrative only (the figure says there are no figures). */
export const AUDIENCE_WIDTHS = [100, 84, 70, 54, 40];

/** Illustrative width of each funnel stage, in %, from the number of stages. */
export const funnelWidths = (n: number) => Array.from({ length: n }, (_, i) => Math.round(100 - (i * 58) / Math.max(1, n - 1)));
