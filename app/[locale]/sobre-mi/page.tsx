import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/meta';
import { About, Contact, Footer, Journey } from '@/components/sections/Sections';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'pages.about' });
  return pageMetadata(locale, 'sobre-mi/', t('metaTitle'), t('metaDescription'));
}

/** «Sobre mí»: who I am, the journey since Mar del Plata, and the canonical contact block (#contacto). */
export default async function AboutPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <>
      <main id="contenido" tabIndex={-1} className="page">
        <About level={1} />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
