import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GatePage } from '@/v2/components/GatePage';
import { isV2Locale, v2Messages } from '@/v2/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const m = v2Messages(locale).gate.choose.meta;
  return { title: m.title, description: m.description, robots: { index: false, follow: false } };
}

export default async function V2Gate({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  return <GatePage locale={locale} />;
}
