import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing, localeTags } from '@/i18n/routing';
import { CASES, CASE_SLUGS, type CaseSlug } from '@/lib/cases';
import { CONTACT_EMAIL, absoluteUrl } from '@/lib/site';
import { Footer } from '@/components/sections/Sections';
import { CaseSections, sectionsOf } from '@/components/case/CaseBlocks';
import { CaseToc } from '@/components/case/CaseToc';
import '@/components/sections.css';
import '@/components/case/case.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => CASE_SLUGS.map((slug) => ({ locale, slug })));
}

type Params = { locale: string; slug: string };
type KV = { k: string; v: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !CASE_SLUGS.includes(slug as CaseSlug)) return {};
  const t = await getTranslations({ locale, namespace: `cases.${slug}` });
  const title = `${t('title')} — Ignacio Gauna`;
  return {
    title,
    description: t('summary'),
    alternates: {
      canonical: absoluteUrl(`/${locale}/proyectos/${slug}/`),
      languages: Object.fromEntries(routing.locales.map((l) => [localeTags[l], absoluteUrl(`/${l}/proyectos/${slug}/`)])),
    },
    openGraph: { title, description: t('summary'), type: 'article', url: absoluteUrl(`/${locale}/proyectos/${slug}/`), images: [{ url: absoluteUrl('/og.png'), width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description: t('summary'), images: [absoluteUrl('/og.png')] },
  };
}

export default async function CasePage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !CASE_SLUGS.includes(slug as CaseSlug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: `cases.${slug}` });
  const u = await getTranslations({ locale, namespace: 'caseUi' });
  const c = await getTranslations({ locale, namespace: 'contact' });
  const def = CASES[slug as CaseSlug];
  const copy = t.raw('blocks') as Record<string, { h?: string }>;
  const facts = t.raw('facts') as KV[];
  const tldr = t.raw('tldr') as KV[];
  const toc = sectionsOf(def.blocks, copy).filter((s) => s.h).map((s) => ({ id: s.id, h: s.h }));
  const i = CASE_SLUGS.indexOf(slug as CaseSlug);
  const next = CASE_SLUGS[(i + 1) % CASE_SLUGS.length];
  const nameOf = async (s: string) => (await getTranslations({ locale, namespace: `cases.${s}` }))('title');
  const others = CASE_SLUGS.filter((s) => s !== slug);
  const otherNames = await Promise.all(others.map(nameOf));
  const ui = { asText: u('asText'), legend: u('legend'), why: u('why'), alt: u('alt'), play: u('play'), pause: u('pause') };

  return (
    <>
      <main id="contenido" tabIndex={-1} className="case">
        <header className="case__hero container-x">
          <Link href="/trabajo" className="case__back">← {u('back')}</Link>
          <p className="case__kind label">{t('kind')}</p>
          <h1 className="case__title">{t('title')}</h1>
          <p className="status case__status">{t('status')}</p>
          <p className="case__summary">{t('summary')}</p>
          {facts.length > 0 && (
            <dl className="facts">
              {facts.map((f) => <div key={f.k}><dt className="label">{f.k}</dt><dd>{f.v}</dd></div>)}
            </dl>
          )}
        </header>

        {tldr.length > 0 && (
          <section className="tldr container-x" aria-label={u('tldr')}>
            {tldr.map((x, n) => (
              <div key={x.k} className="tldr__item">
                <p className="tldr__k"><span aria-hidden="true">{['A', 'B', 'C'][n]}</span>{x.k}</p>
                <p className="tldr__v">{x.v}</p>
              </div>
            ))}
          </section>
        )}

        <div className="case__grid container-x">
          {toc.length > 2 && <aside className="case__aside"><CaseToc label={u('toc')} items={toc} /></aside>}
          <div className="case__main">
            <CaseSections blocks={def.blocks} copy={copy} ui={ui} />
            {def.links && (
              <section className="cs" aria-labelledby="h-links">
                <h2 id="h-links" className="cs__h">{u('links')}</h2>
                <div className="case__links">
                  {def.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗<span className="sr-only"> ({c('newTab')})</span></a>)}
                </div>
              </section>
            )}
          </div>
        </div>

        <nav className="case__next container-x" aria-label={u('next')}>
          <Link className="case__next-main" href={`/proyectos/${next}`}>
            <span className="label">{u('nextCase')}</span>
            <span className="case__next-name">{otherNames[others.indexOf(next)]} →</span>
          </Link>
          <div className="case__more" data-contact="">
            <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>{u('contactTitle')}</a>
            <span className="note">{u('contactText')}</span>
          </div>
          <ul className="case__others">
            {others.map((s, k) => <li key={s}><Link href={`/proyectos/${s}`}>{otherNames[k]}</Link></li>)}
          </ul>
        </nav>
      </main>
      <Footer />
    </>
  );
}
