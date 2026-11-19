import type { V2Locale } from '@/v2/i18n';
import type { CaseSlug } from '../cases';
import type { DsCopy, DsSpec } from './types';
import { DS as eclipse } from './eclipse';
import esEclipse from '@/messages/v2/ds/es/eclipse.json';
import enEclipse from '@/messages/v2/ds/en/eclipse.json';
import { DS as volta } from './volta';
import esVolta from '@/messages/v2/ds/es/volta.json';
import enVolta from '@/messages/v2/ds/en/volta.json';
import { DS as velmar } from './velmar';
import esVelmar from '@/messages/v2/ds/es/velmar.json';
import enVelmar from '@/messages/v2/ds/en/velmar.json';
import { DS as dentalos } from './dentalos';
import esDentalos from '@/messages/v2/ds/es/dentalos.json';
import enDentalos from '@/messages/v2/ds/en/dentalos.json';

/** The products whose design system the case shows (lote 5.4): data in ds/<slug>.ts, words in messages/v2/ds. */
const ALL: Partial<Record<CaseSlug, { spec: DsSpec; copy: Record<V2Locale, DsCopy> }>> = {
  eclipse: { spec: eclipse, copy: { es: esEclipse, en: enEclipse } },
  volta: { spec: volta, copy: { es: esVolta, en: enVolta } },
  velmar: { spec: velmar, copy: { es: esVelmar, en: enVelmar } },
  dentalos: { spec: dentalos, copy: { es: esDentalos, en: enDentalos } },
};

export const dsOf = (locale: V2Locale, slug: CaseSlug): { spec: DsSpec; copy: DsCopy } | null => {
  const d = ALL[slug];
  return d ? { spec: d.spec, copy: d.copy[locale] } : null;
};
