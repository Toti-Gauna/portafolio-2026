import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/meta';
import { Footer, Method, PageHead, System } from '@/components/sections/Sections';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'pages.how' });
  return pageMetadata(locale, 'como-trabajo/', t('metaTitle'), t('metaDescription'));
}

/** «Cómo trabajo»: the method cycle (with the books that shaped it) and the agentic system with «Cómo viaja un cambio». */
export default async function HowPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.how' });
  return (
    <>
      <main id="contenido" tabIndex={-1} className="page">
        <PageHead label={t('label')} title={t('title')} lead={t('lead')} />
        <Method />
        <System />
      </main>
      <Footer />
    </>
  );
}
