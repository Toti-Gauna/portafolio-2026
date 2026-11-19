import type { V2Locale } from '@/v2/i18n';
import type { CaseSlug } from '../cases';
import type { ArchCopy } from './CaseArch';
import esComplia from '@/messages/v2/arch/es/complia.json';
import enComplia from '@/messages/v2/arch/en/complia.json';
import esSupernova from '@/messages/v2/arch/es/supernova.json';
import enSupernova from '@/messages/v2/arch/en/supernova.json';
import esEclipse from '@/messages/v2/arch/es/eclipse.json';
import enEclipse from '@/messages/v2/arch/en/eclipse.json';
import esAgentes from '@/messages/v2/arch/es/agentes.json';
import enAgentes from '@/messages/v2/arch/en/agentes.json';
import esKinetic from '@/messages/v2/arch/es/kinetic.json';
import enKinetic from '@/messages/v2/arch/en/kinetic.json';
import esVolta from '@/messages/v2/arch/es/volta.json';
import enVolta from '@/messages/v2/arch/en/volta.json';
import esVelmar from '@/messages/v2/arch/es/velmar.json';
import enVelmar from '@/messages/v2/arch/en/velmar.json';
import esDentalos from '@/messages/v2/arch/es/dentalos.json';
import enDentalos from '@/messages/v2/arch/en/dentalos.json';
import esGames from '@/messages/v2/arch/es/games.json';
import enGames from '@/messages/v2/arch/en/games.json';

/** The words of each case's living architecture (lote 5.2): messages/v2/arch/<locale>/<slug>.json, same keys in both. */
const ALL: Record<V2Locale, Partial<Record<CaseSlug, ArchCopy>>> = {
  es: { complia: esComplia, supernova: esSupernova, eclipse: esEclipse, agentes: esAgentes, kinetic: esKinetic, volta: esVolta, velmar: esVelmar, dentalos: esDentalos, games: esGames },
  en: { complia: enComplia, supernova: enSupernova, eclipse: enEclipse, agentes: enAgentes, kinetic: enKinetic, volta: enVolta, velmar: enVelmar, dentalos: enDentalos, games: enGames },
};
export const archCopy = (locale: V2Locale, slug: CaseSlug): ArchCopy | null => ALL[locale][slug] ?? null;
