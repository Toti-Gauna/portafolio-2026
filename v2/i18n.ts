import es from '@/messages/v2/es.json';
import en from '@/messages/v2/en.json';

/** /v2 copy lives in messages/v2/<locale>.json (same keys in both; tests/unit/v2-tokens.test.ts checks it). */
export const V2_LOCALES = ['es', 'en'] as const;
export type V2Locale = (typeof V2_LOCALES)[number];
export type V2Messages = typeof es;

const ALL: Record<V2Locale, V2Messages> = { es, en };

export const isV2Locale = (l: string): l is V2Locale => (V2_LOCALES as readonly string[]).includes(l);
export const v2Messages = (l: V2Locale): V2Messages => ALL[l];
export const V2_LANG_TAG: Record<V2Locale, string> = { es: 'es-AR', en: 'en' };
