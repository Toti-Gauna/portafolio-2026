import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/meta';
import { COUNTS } from '@/lib/roadmap';
import { Footer, PageHead } from '@/components/sections/Sections';
import { Roadmap } from '@/components/roadmap/Roadmap';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'roadmap' });
  return pageMetadata(locale, 'roadmap/', t('metaTitle'), t('metaDescription'));
}

/** «Roadmap»: the plan up to August 2030, four stages, every piece «Planeado» but the one under way (Ola 6). */
export default async function RoadmapPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'roadmap' });
  return (
    <>
      <main id="contenido" tabIndex={-1} className="page">
        <PageHead label={t('label')} title={t('title')} lead={t('lead')} />
        <div className="container-x roadmap__intro">
          <p className="note">{t('rule')}</p>
          <p className="label">{t('count', COUNTS)}</p>
        </div>
        <Roadmap />
        <div className="container-x roadmap__back">
          <Link className="camino__go" href="/trabajo">← {t('back')}</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
