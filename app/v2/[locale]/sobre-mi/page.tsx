import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { About, aboutCopy } from '@/v2/components/about/About';
import { isV2Locale, v2Messages } from '@/v2/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const p = v2Messages(locale).site.pages.about;
  return { title: `${p.t} · Ignacio Gauna`, description: aboutCopy(locale).lead, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  return <About locale={locale} />;
}
