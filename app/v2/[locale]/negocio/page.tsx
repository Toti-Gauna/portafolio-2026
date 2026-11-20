import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Business } from '@/v2/components/biz/Business';
import { PageOpening } from '@/v2/components/site/PageOpening';
import { isV2Locale, v2Messages } from '@/v2/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const p = v2Messages(locale).site.pages.business;
  return { title: `${p.t} · Ignacio Gauna`, description: p.lead, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  return <PageOpening locale={locale} page="business"><Business locale={locale} /></PageOpening>;
}
