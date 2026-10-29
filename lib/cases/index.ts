/** Structure of the public content (copy lives in messages/). Links point only to public places. */
import type { CaseDef } from './types';
import { complia } from './complia';
import { tuenti } from './tuenti';
import { eclipse } from './eclipse';
import { kinetic } from './kinetic';
import { volta } from './volta';
import { dentalos } from './dentalos';
import { games } from './games';
import { agentes } from './agentes';
import { velmar } from './velmar';
import { supernova } from './supernova';

export const CASE_SLUGS = ['complia', 'tuenti', 'eclipse', 'agentes', 'kinetic', 'volta', 'velmar', 'dentalos', 'supernova', 'games'] as const;
export type CaseSlug = (typeof CASE_SLUGS)[number];

/** Each case page: its blocks (copy in messages/cases/<locale>/<slug>.json) and its public links. */
export const CASES: Record<CaseSlug, CaseDef> = { complia, tuenti, eclipse, agentes, kinetic, volta, velmar, dentalos, supernova, games };

export const LAB = [
  { id: 'kinetic', href: 'https://toti-gauna.github.io/motion-animations/', code: 'https://github.com/Toti-Gauna/kinetic-studio', page: 'kinetic' },
  { id: 'volta', code: 'https://github.com/Toti-Gauna/supplements-ecommerce' },
  { id: 'velmar', code: 'https://github.com/Toti-Gauna/velmar-ecommerce-' },
  { id: 'dentalos', code: 'https://github.com/Toti-Gauna/DentalOS' },
  { id: 'supernova', href: 'https://toti-gauna.github.io/supernova-eventos/', code: 'https://github.com/Toti-Gauna/supernova-eventos' },
  { id: 'games', code: 'https://github.com/Toti-Gauna/games-market' },
] as const;

/** Cover of a work card (its alt text in work.cards.<k>.shotAlt). */
export const WORK_SHOT: Partial<Record<'complia' | 'tuenti' | 'eclipse', string>> = {
  complia: '/media/complia-cover.webp',
  tuenti: '/media/tuenti-cover.svg',
  eclipse: '/media/portals/eclipse-landing.webp',
};

/** 800 px copies of the 1600 px covers (same picture), for small slots: `srcset` on the cards, the home hub. */
export const WORK_SHOT_800: Partial<Record<'complia' | 'tuenti' | 'eclipse', string>> = {
  eclipse: '/media/portals/eclipse-landing-800.webp',
};

