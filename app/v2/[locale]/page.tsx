import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Home } from '@/v2/components/site/Home';
import { isV2Locale, v2Messages } from '@/v2/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const m = v2Messages(locale).site.meta;
  return { title: m.title, description: m.description, robots: { index: false, follow: false } };
}

export default async function V2Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  return <Home locale={locale} />;
}
