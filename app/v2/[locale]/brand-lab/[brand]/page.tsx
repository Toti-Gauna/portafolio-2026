import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrandPage } from '@/v2/components/brand/BrandPage';
import { BRAND_ORDER, brandOf, isBrandId } from '@/v2/components/brand/brands';
import { isV2Locale, v2Messages } from '@/v2/i18n';

export const dynamicParams = false;
export const generateStaticParams = () => BRAND_ORDER.map((brand) => ({ brand }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string; brand: string }> }): Promise<Metadata> {
  const { locale, brand } = await params;
  if (!isV2Locale(locale) || !isBrandId(brand)) return {};
  const { copy } = brandOf(locale, brand);
  return { title: `${copy.name} · ${v2Messages(locale).brandlab.kicker} · Ignacio Gauna`, description: copy.idea, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string; brand: string }> }) {
  const { locale, brand } = await params;
  if (!isV2Locale(locale) || !isBrandId(brand)) notFound();
  return <BrandPage locale={locale} id={brand} />;
}
