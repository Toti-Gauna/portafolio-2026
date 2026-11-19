import type { ArchSpec } from '@/lib/diagrams/types';
import { CASES as PUBLISHED } from '@/lib/cases';
import type { CaseSlug } from '../cases';
import { type ArchArt, archArt } from './arch-art';

/**
 * Which diagram of the published case comes alive in each /v2 case (lote 5.2), and which of its pieces are planned
 * (drawn as a wireframe). The structure is the published one, untouched; its words for /v2 live in
 * messages/v2/arch/<locale>/<slug>.json. Tuenti shows no architecture (confidentiality).
 */
export const ARCH_OF: Partial<Record<CaseSlug, { key: string; planned?: string[] }>> = {
  complia: { key: 'how' },
  supernova: { key: 'arch' },
  eclipse: { key: 'arch' },
  agentes: { key: 'flow' },
  kinetic: { key: 'engine' },
  volta: { key: 'arch', planned: ['prod'] },
  velmar: { key: 'arch', planned: ['mp', 'server', 'db'] },
  dentalos: { key: 'arch' },
  games: { key: 'net' },
};

export function archSpec(slug: CaseSlug): ArchSpec | null {
  const pick = ARCH_OF[slug];
  if (!pick) return null;
  const block = PUBLISHED[slug].blocks.find((b) => b.key === pick.key);
  return block && block.type === 'diagram' ? block.spec : null;
}

const cache = new Map<CaseSlug, ArchArt>();
/** The drawing of a case's architecture (built once per build). */
export function archOf(slug: CaseSlug): ArchArt | null {
  if (cache.has(slug)) return cache.get(slug)!;
  const spec = archSpec(slug);
  if (!spec) return null;
  const art = archArt(spec, ARCH_OF[slug]?.planned);
  cache.set(slug, art);
  return art;
}
