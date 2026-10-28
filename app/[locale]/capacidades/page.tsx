import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/meta';
import { Footer, Skills } from '@/components/sections/Sections';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'pages.skills' });
  return pageMetadata(locale, 'capacidades/', t('metaTitle'), t('metaDescription'));
}

/** «Capacidades»: the skills ledger (where each technology comes from). */
export default async function SkillsPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <>
      <main id="contenido" tabIndex={-1} className="page">
        <Skills level={1} />
      </main>
      <Footer />
    </>
  );
}
