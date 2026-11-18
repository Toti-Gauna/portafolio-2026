import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MusicPage } from '@/v2/components/MusicPage';
import { isV2Locale, v2Messages } from '@/v2/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const m = v2Messages(locale).music.meta;
  return { title: m.title, description: m.description, robots: { index: false, follow: false } };
}

export default async function V2Music({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  return <MusicPage locale={locale} />;
}
