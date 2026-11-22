import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailerPage, trailerCopy } from '@/v2/components/trailer/TrailerPage';
import { isV2Locale } from '@/v2/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const t = trailerCopy(locale);
  return { title: `${t.player.kicker} · Ignacio Gauna`, description: t.player.meta, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  return <TrailerPage locale={locale} />;
}
