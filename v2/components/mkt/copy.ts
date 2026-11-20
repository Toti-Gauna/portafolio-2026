/**
 * The words of the six playbooks (lote 6.3): messages/v2/mkt/<locale>/<id>.json, same keys in both languages.
 */
import type { V2Locale } from '@/v2/i18n';
import type { MktCopy, PlayId } from './types';
import es_ig from '@/messages/v2/mkt/es/ig.json';
import en_ig from '@/messages/v2/mkt/en/ig.json';
import es_eclipse from '@/messages/v2/mkt/es/eclipse.json';
import en_eclipse from '@/messages/v2/mkt/en/eclipse.json';
import es_velmar from '@/messages/v2/mkt/es/velmar.json';
import en_velmar from '@/messages/v2/mkt/en/velmar.json';
import es_volta from '@/messages/v2/mkt/es/volta.json';
import en_volta from '@/messages/v2/mkt/en/volta.json';
import es_brisa from '@/messages/v2/mkt/es/brisa.json';
import en_brisa from '@/messages/v2/mkt/en/brisa.json';
import es_lucero from '@/messages/v2/mkt/es/lucero.json';
import en_lucero from '@/messages/v2/mkt/en/lucero.json';

const ALL: Record<PlayId, Record<V2Locale, MktCopy>> = {
  ig: { es: es_ig, en: en_ig },
  eclipse: { es: es_eclipse, en: en_eclipse },
  velmar: { es: es_velmar, en: en_velmar },
  volta: { es: es_volta, en: en_volta },
  brisa: { es: es_brisa, en: en_brisa },
  lucero: { es: es_lucero, en: en_lucero },
};
export const mktCopy = (locale: V2Locale, id: PlayId): MktCopy => ALL[id][locale];
