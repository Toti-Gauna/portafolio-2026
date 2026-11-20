import type { V2Locale } from '@/v2/i18n';
import type { BrandCopy, BrandId, BrandSpec } from './types';
import { BRAND as ig } from './art/ig';
import esIg from '@/messages/v2/brands/es/ig.json';
import enIg from '@/messages/v2/brands/en/ig.json';

/** The brands of the lab, in the order of the wall: Ignacio's own first, then the client's, then the exercises. */
const ALL: Partial<Record<BrandId, { spec: BrandSpec; copy: Record<V2Locale, BrandCopy> }>> = {
  ig: { spec: ig, copy: { es: esIg, en: enIg } },
};
export const BRAND_ORDER: BrandId[] = (['ig', 'eclipse', 'velmar', 'volta', 'brisa', 'lucero', 'sereno', 'brote'] as BrandId[]).filter((id) => ALL[id]);
export const isBrandId = (s: string): s is BrandId => BRAND_ORDER.includes(s as BrandId);
export const brandOf = (locale: V2Locale, id: BrandId): { spec: BrandSpec; copy: BrandCopy } => ({ spec: ALL[id]!.spec, copy: ALL[id]!.copy[locale] });
