import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Kit } from '@/v2/components/Kit';
import { isV2Locale, v2Messages } from '@/v2/i18n';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const m = v2Messages(locale).kit.meta;
  return { title: m.title, description: m.description, robots: { index: false, follow: false } };
}

export default async function V2Kit({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  return <Kit locale={locale} />;
}
