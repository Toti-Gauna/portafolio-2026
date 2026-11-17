import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/meta';
import { Footer, Lab, PageHead, WhatIDo, Work } from '@/components/sections/Sections';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'pages.work' });
  return pageMetadata(locale, 'trabajo/', t('metaTitle'), t('metaDescription'));
}

/** «Trabajo»: what I do (four pillars, each pointing to its proof), the case cards and the lab. */
export default async function WorkPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.work' });
  return (
    <>
      <main id="contenido" tabIndex={-1} className="page">
        <PageHead label={t('label')} title={t('title')} lead={t('lead')} />
        <WhatIDo />
        <Work />
        <Lab />
      </main>
      <Footer />
    </>
  );
}
