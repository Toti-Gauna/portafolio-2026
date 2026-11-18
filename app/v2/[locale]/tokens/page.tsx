import { notFound } from 'next/navigation';
import { System } from '@/v2/components/System';
import { isV2Locale } from '@/v2/i18n';

export default async function V2Tokens({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  return <System locale={locale} />;
}
