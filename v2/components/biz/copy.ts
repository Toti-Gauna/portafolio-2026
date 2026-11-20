import type { V2Locale } from '@/v2/i18n';
import es from '@/messages/v2/biz/es.json';
import en from '@/messages/v2/biz/en.json';

/** The words of «Negocio» (lote 6.2): messages/v2/biz/<locale>.json, same keys in both languages. */
export type BizCopy = typeof es;
const ALL: Record<V2Locale, BizCopy> = { es, en: en as BizCopy };
export const bizCopy = (locale: V2Locale): BizCopy => ALL[locale];
