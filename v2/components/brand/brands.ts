import type { V2Locale } from '@/v2/i18n';
import type { BrandCopy, BrandId, BrandSpec } from './types';
import { BRAND as ig } from './art/ig';
import esIg from '@/messages/v2/brands/es/ig.json';
import enIg from '@/messages/v2/brands/en/ig.json';
import { BRAND as eclipse } from './art/eclipse';
import esEclipse from '@/messages/v2/brands/es/eclipse.json';
import enEclipse from '@/messages/v2/brands/en/eclipse.json';
import { BRAND as velmar } from './art/velmar';
import esVelmar from '@/messages/v2/brands/es/velmar.json';
import enVelmar from '@/messages/v2/brands/en/velmar.json';
import { BRAND as volta } from './art/volta';
import esVolta from '@/messages/v2/brands/es/volta.json';
import enVolta from '@/messages/v2/brands/en/volta.json';
import { BRAND as brisa } from './art/brisa';
import esBrisa from '@/messages/v2/brands/es/brisa.json';
import enBrisa from '@/messages/v2/brands/en/brisa.json';
import { BRAND as lucero } from './art/lucero';
import esLucero from '@/messages/v2/brands/es/lucero.json';
import enLucero from '@/messages/v2/brands/en/lucero.json';
import { BRAND as sereno } from './art/sereno';
import esSereno from '@/messages/v2/brands/es/sereno.json';
import enSereno from '@/messages/v2/brands/en/sereno.json';
import { BRAND as brote } from './art/brote';
import esBrote from '@/messages/v2/brands/es/brote.json';
import enBrote from '@/messages/v2/brands/en/brote.json';

/** The brands of the lab, in the order of the wall: Ignacio's own first, then the client's, then the exercises. */
const ALL: Record<BrandId, { spec: BrandSpec; copy: Record<V2Locale, BrandCopy> }> = {
  ig: { spec: ig, copy: { es: esIg, en: enIg } },
  eclipse: { spec: eclipse, copy: { es: esEclipse, en: enEclipse } },
  velmar: { spec: velmar, copy: { es: esVelmar, en: enVelmar } },
  volta: { spec: volta, copy: { es: esVolta, en: enVolta } },
  brisa: { spec: brisa, copy: { es: esBrisa, en: enBrisa } },
  lucero: { spec: lucero, copy: { es: esLucero, en: enLucero } },
  sereno: { spec: sereno, copy: { es: esSereno, en: enSereno } },
  brote: { spec: brote, copy: { es: esBrote, en: enBrote } },
};
export const BRAND_ORDER: BrandId[] = ['ig', 'eclipse', 'velmar', 'volta', 'brisa', 'lucero', 'sereno', 'brote'];
export const isBrandId = (s: string): s is BrandId => BRAND_ORDER.includes(s as BrandId);
export const brandOf = (locale: V2Locale, id: BrandId): { spec: BrandSpec; copy: BrandCopy } => ({ spec: ALL[id].spec, copy: ALL[id].copy[locale] });
