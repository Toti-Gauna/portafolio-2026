import type { MetadataRoute } from 'next';
import { routing, localeTags } from '@/i18n/routing';
import { CASE_SLUGS } from '@/lib/cases';
import { absoluteUrl } from '@/lib/site';
import { PAGES } from '@/lib/nav';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', ...PAGES.map((p) => `${p.href.slice(1)}/`), ...CASE_SLUGS.map((s) => `proyectos/${s}/`)];
  return paths.flatMap((p) =>
    routing.locales.map((l) => ({
      url: absoluteUrl(`/${l}/${p}`),
      alternates: { languages: Object.fromEntries(routing.locales.map((x) => [localeTags[x], absoluteUrl(`/${x}/${p}`)])) },
    })),
  );
}
