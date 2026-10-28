import type { Metadata } from 'next';
import { routing, localeTags } from '@/i18n/routing';
import { absoluteUrl } from '@/lib/site';

/** Title, description, canonical, hreflang and social cards of an inner page (`path` like 'trabajo/'). */
export function pageMetadata(locale: string, path: string, title: string, description: string, type: 'website' | 'article' = 'article'): Metadata {
  const url = absoluteUrl(`/${locale}/${path}`);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(routing.locales.map((l) => [localeTags[l], absoluteUrl(`/${l}/${path}`)])),
    },
    openGraph: { title, description, type, url, images: [{ url: absoluteUrl('/og.png'), width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [absoluteUrl('/og.png')] },
  };
}
