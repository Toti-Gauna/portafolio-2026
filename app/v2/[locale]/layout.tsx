import './v2.css';
import './ui.css';
import './signature.css';
import './kit.css';
import './site.css';
import './motion.css';
import './sound.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { fontMono, fontSans } from '../../fonts';
import { BASE_PATH, SITE_URL } from '@/lib/site';
import { tokensCss } from '@/v2/tokens';
import { MotionRoot } from '@/v2/components/motion/MotionRoot';
import { SiteHeader } from '@/v2/components/site/SiteHeader';
import { SoundRoot } from '@/v2/components/sound/SoundRoot';
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
  const mo = v2Messages(locale).engine;
  return (
    <html lang={V2_LANG_TAG[locale]} className={`${fontSans.variable} ${fontMono.variable}`}>
      <head>
        <style id="v2-tokens" dangerouslySetInnerHTML={{ __html: tokensCss() }} />
      </head>
      <body>
        <a className="v2-skip" href="#main">{v2Messages(locale).top.skip}</a>
        {/* in the layout: the header survives every change of page, so its light can travel */}
        <SiteHeader locale={locale} />
        {children}
        <SoundRoot />
        <MotionRoot locale={locale} base={BASE_PATH} labels={{ ...mo.help, soundOn: mo.say.soundOn, soundOff: mo.say.soundOff }} />
      </body>
    </html>
  );
}
