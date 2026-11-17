/**
 * «Video y tráileres» (Ola 8c, design/2026/video.md). The videos and their captions come from the cases (their
 * `media` showcase block, and CompliA's demo clip), so this page never says something a case does not.
 */
import { CASES, type CaseSlug } from './cases';
import type { ShowItem } from './cases/types';

export const VIDEO_GROUPS = ['eclipse', 'complia', 'volta', 'velmar', 'dentalos', 'supernova', 'games'] as const satisfies readonly CaseSlug[];
export type VideoGroup = (typeof VIDEO_GROUPS)[number];

/** CompliA's demo clip is a `video` block, not a showcase: here it gets the same frame as the others. */
const COMPLIA_DEMO: ShowItem = { id: 'demo', kind: 'video', frame: 'browser', src: '/media/complia-demo.mp4', poster: '/media/complia-demo-poster.jpg', w: 960, h: 464 };

/** The videos (not the captures) of a case, in the case's order. */
export function videosOf(slug: CaseSlug): ShowItem[] {
  if (slug === 'complia') return [COMPLIA_DEMO];
  const block = CASES[slug].blocks.find((b) => b.type === 'showcase' && b.key === 'media');
  return block && block.type === 'showcase' ? block.items.filter((i) => i.kind === 'video') : [];
}

/** Four findings of the code about editing and formats, and the project each comes from (copy: video.formats.items). */
export const FORMAT_PROJECTS: CaseSlug[] = ['kinetic', 'kinetic', 'volta', 'kinetic'];
