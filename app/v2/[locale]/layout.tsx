import './v2.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { fontMono, fontSans } from '../../fonts';
import { SITE_URL } from '@/lib/site';
import { tokensCss } from '@/v2/tokens';
import { V2_LANG_TAG, V2_LOCALES, isV2Locale, v2Messages } from '@/v2/i18n';

export const dynamicParams = false;

export function generateStaticParams() {
  return V2_LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#090720',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const m = v2Messages(locale);
  // /v2 is a work in progress next to the published site: never indexed, not in the sitemap.
  return { metadataBase: new URL(SITE_URL), title: m.meta.title, description: m.meta.description, robots: { index: false, follow: false } };
}

export default async function V2Layout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  return (
    <html lang={V2_LANG_TAG[locale]} className={`${fontSans.variable} ${fontMono.variable}`}>
      <head>
        <style id="v2-tokens" dangerouslySetInnerHTML={{ __html: tokensCss() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
