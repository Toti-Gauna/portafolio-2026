import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VideoPage, videoCopy } from '@/v2/components/video/VideoPage';
import { isV2Locale } from '@/v2/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const v = videoCopy(locale);
  return { title: `${v.kicker} · Ignacio Gauna`, description: v.meta, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  return <VideoPage locale={locale} />;
}
