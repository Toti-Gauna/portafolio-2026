import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PagePager } from '@/v2/components/site/PageOpening';
import { SiteFooter } from '@/v2/components/site/SiteFooter';
import { WorldExplorer } from '@/v2/components/work/WorldExplorer';
import { isV2Locale, v2Messages } from '@/v2/i18n';
import { SITE_PAGES } from '@/v2/site';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isV2Locale(locale)) return {};
  const p = v2Messages(locale).site.pages.work;
  return { title: `${p.t} · Ignacio Gauna`, description: p.lead, robots: { index: false, follow: false } };
}

/** Work (lote 4.2): the page is the world — the map under the header, the list of stops, and the way on. */
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isV2Locale(locale)) notFound();
  const p = v2Messages(locale).site.pages.work;
  const n = String(SITE_PAGES.findIndex((s) => s.key === 'work') + 1).padStart(2, '0');
  return (
    <>
      <main id="main" className="wk-main">
        <WorldExplorer locale={locale} kicker={`${n} · ${p.t}`} title={p.title} lead={p.lead} />
        <div className="v2-main wk-pager"><PagePager locale={locale} page="work" /></div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
