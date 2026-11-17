/**
 * «Cómo se hizo este portafolio» (Ola 11, on /como-trabajo#este-sitio): the nine agents defined in .claude/agents with the model
 * each one declares (tests/unit/howsite.test.ts reads the files and checks it), and the icon of the system's glyph set that stands for it.
 * Copy: messages → howsite.*.
 */
import type { AgentId } from '@/components/AgentIcon';

export type SiteAgent = { id: string; icon: AgentId; model: 'opus' | 'sonnet' };

export const SITE_AGENTS: SiteAgent[] = [
  { id: 'design-director', icon: 'chief', model: 'opus' },
  { id: 'brand-board-designer', icon: 'design', model: 'opus' },
  { id: 'iso-3d-builder', icon: 'iso', model: 'opus' },
  { id: 'diorama-dashboard-builder', icon: 'frontend', model: 'opus' },
  { id: 'scroll-choreographer', icon: 'scroll', model: 'opus' },
  { id: 'three-engineer', icon: 'three', model: 'sonnet' },
  { id: 'sound-designer', icon: 'sound', model: 'sonnet' },
  { id: 'media-prompt-writer', icon: 'marketing', model: 'sonnet' },
  { id: 'content-guardian', icon: 'security', model: 'sonnet' },
];
export const DECISIONS = 6;
