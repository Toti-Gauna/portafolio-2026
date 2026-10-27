import '../globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, localeTags, type Locale } from '@/i18n/routing';
import { fontMono, fontSans } from '../fonts';
import { SITE_URL, CONTACT_EMAIL, LINKEDIN_URL, GITHUB_URL, absoluteUrl } from '@/lib/site';
import { Header } from '@/components/Header';
import { Intro } from '@/components/Intro';
import { FloatingContact } from '@/components/FloatingContact';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0e0e10',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: absoluteUrl(`/${locale}/`),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [localeTags[l], absoluteUrl(`/${l}/`)])),
        'x-default': absoluteUrl('/es/'),
      },
    },
    openGraph: {
      title: t('title'), description: t('description'), type: 'website', locale: localeTags[locale as Locale], url: absoluteUrl(`/${locale}/`),
      siteName: 'Ignacio Gauna',
      images: [{ url: absoluteUrl('/og.png'), width: 1200, height: 630, alt: t('ogAlt') }],
    },
    twitter: { card: 'summary_large_image', title: t('title'), description: t('description'), images: [absoluteUrl('/og.png')] },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('meta');
  const tf = await getTranslations('fab');
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ignacio Gauna',
    jobTitle: 'Ssr AI Fullstack Developer',
    url: absoluteUrl(`/${locale}/`),
    email: CONTACT_EMAIL,
    sameAs: [LINKEDIN_URL, GITHUB_URL],
    description: t('description'),
  };

  return (
    <html lang={localeTags[locale as Locale]} className={`${fontSans.variable} ${fontMono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
        <noscript>
          <style>{'#boot{display:none!important}'}</style>
        </noscript>
        <NextIntlClientProvider messages={messages}>
          <Intro />
          <div id="app-shell">
            <Header locale={locale as Locale} />
            {children}
            <FloatingContact label={tf('label')} aria={tf('aria')} />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
