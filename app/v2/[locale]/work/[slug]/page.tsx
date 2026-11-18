import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CasePage } from '@/v2/components/case/CasePage';
import { CASE_ORDER, isCaseSlug } from '@/v2/components/case/cases';
import { caseCopy } from '@/v2/components/case/copy';
import { isV2Locale, v2Messages } from '@/v2/i18n';

export const dynamicParams = false;
export function generateStaticParams() {
  return CASE_ORDER.map((slug) => ({ slug }));
}

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isV2Locale(locale) || !isCaseSlug(slug)) return {};
  const c = caseCopy(locale, slug), w = v2Messages(locale).site.pages.work;
  return { title: `${c.title} · ${w.t} · Ignacio Gauna`, description: c.line, robots: { index: false, follow: false } };
}

/** A case of Work (lote 5.1): /v2/<locale>/work/<slug>/. */
export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isV2Locale(locale) || !isCaseSlug(slug)) notFound();
  return <CasePage locale={locale} slug={slug} />;
}
