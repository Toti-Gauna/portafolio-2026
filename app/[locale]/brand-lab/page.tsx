import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/meta';
import { Footer, PageHead } from '@/components/sections/Sections';
import { BrandLab } from '@/components/brandlab/BrandLab';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'pages.brand' });
  return pageMetadata(locale, 'brand-lab/', t('metaTitle'), t('metaDescription'));
}

/** «Brand Lab» (Ola 8a, design/2026/brand-lab.md): brand boards drawn in code, one printed sheet at a time. */
export default async function BrandLabPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'brandlab' });
  return (
    <>
      <main id="contenido" tabIndex={-1} className="page">
        <PageHead label={t('label')} title={t('title')} lead={t('lead')} />
        <BrandLab />
        <div className="container-x bl-back">
          <Link className="camino__go" href="/trabajo">← {t('back')}</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
