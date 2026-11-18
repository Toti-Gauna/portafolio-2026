import type { V2Locale } from '@/v2/i18n';
import type { CaseSlug } from './cases';
import esComplia from '@/messages/v2/cases/es/complia.json';
import enComplia from '@/messages/v2/cases/en/complia.json';
import esTuenti from '@/messages/v2/cases/es/tuenti.json';
import enTuenti from '@/messages/v2/cases/en/tuenti.json';
import esSupernova from '@/messages/v2/cases/es/supernova.json';
import enSupernova from '@/messages/v2/cases/en/supernova.json';
import esEclipse from '@/messages/v2/cases/es/eclipse.json';
import enEclipse from '@/messages/v2/cases/en/eclipse.json';
import esAgentes from '@/messages/v2/cases/es/agentes.json';
import enAgentes from '@/messages/v2/cases/en/agentes.json';
import esKinetic from '@/messages/v2/cases/es/kinetic.json';
import enKinetic from '@/messages/v2/cases/en/kinetic.json';
import esVolta from '@/messages/v2/cases/es/volta.json';
import enVolta from '@/messages/v2/cases/en/volta.json';
import esVelmar from '@/messages/v2/cases/es/velmar.json';
import enVelmar from '@/messages/v2/cases/en/velmar.json';
import esDentalos from '@/messages/v2/cases/es/dentalos.json';
import enDentalos from '@/messages/v2/cases/en/dentalos.json';
import esGames from '@/messages/v2/cases/es/games.json';
import enGames from '@/messages/v2/cases/en/games.json';

/**
 * The words of a case (lote 5.1), one file per case and language in messages/v2/cases/<locale>/<slug>.json, same
 * keys in both. Three layers of reading: in 5 s the film and the title; in 30 s «En 10 segundos», the steps and the
 * three decisions; the depth folded under «Más detalle». Every figure comes from the approved record (a test looks
 * for each one in the published case), and every case says in ≤ 40 % of the words what the published one says.
 */
export type CaseCopy = {
  title: string;
  /** For whom or what it is: «Tsoft para Telefónica», «Producto propio». */
  kind: string;
  /** One sentence, ≤ 25 words. */
  line: string;
  facts: { k: string; v: string }[];
  film: {
    /** Three verbs, each in its pill. */
    verbs: string[];
    /** Up to three figures that count to their value; each one is in the published case. */
    numbers: { n: string; d: string }[];
    alt: string;
    /** What the clip is, on the panel: «Demo · datos de ejemplo». */
    label?: string;
  };
  /** «En 10 segundos»: the challenge, the solution, where it stands. */
  ten: { k: string; v: string }[];
  how: { t: string; d: string }[];
  decisions: { t: string; why: string }[];
  gallery: Record<string, { alt: string; caption: string }>;
  stack: string[];
  /** Folded: whoever wants the depth opens it. */
  more: { h: string; p: string }[];
  /** What comes next, where the record says it. */
  next?: string;
};

const ALL: Record<V2Locale, Record<CaseSlug, CaseCopy>> = {
  es: { complia: esComplia, tuenti: esTuenti, supernova: esSupernova, eclipse: esEclipse, agentes: esAgentes, kinetic: esKinetic, volta: esVolta, velmar: esVelmar, dentalos: esDentalos, games: esGames },
  en: { complia: enComplia, tuenti: enTuenti, supernova: enSupernova, eclipse: enEclipse, agentes: enAgentes, kinetic: enKinetic, volta: enVolta, velmar: enVelmar, dentalos: enDentalos, games: enGames },
};
export const caseCopy = (locale: V2Locale, slug: CaseSlug): CaseCopy => ALL[locale][slug];
