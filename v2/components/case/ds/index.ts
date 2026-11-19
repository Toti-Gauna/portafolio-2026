import type { V2Locale } from '@/v2/i18n';
import type { CaseSlug } from '../cases';
import type { DsCopy, DsSpec } from './types';

/** The products whose design system the case shows (lote 5.4): data in ds/<slug>.ts, words in messages/v2/ds. */
const ALL: Partial<Record<CaseSlug, { spec: DsSpec; copy: Record<V2Locale, DsCopy> }>> = {};

export const dsOf = (locale: V2Locale, slug: CaseSlug): { spec: DsSpec; copy: DsCopy } | null => {
  const d = ALL[slug];
  return d ? { spec: d.spec, copy: d.copy[locale] } : null;
};
