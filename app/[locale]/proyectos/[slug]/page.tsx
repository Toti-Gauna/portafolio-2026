import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing, localeTags } from '@/i18n/routing';
import { CASE_GALLERY, CASE_LINKS, CASE_SLUGS, type CaseSlug } from '@/lib/cases';
import { CONTACT_EMAIL, absoluteUrl, asset } from '@/lib/site';
import { Footer } from '@/components/sections/Sections';
import '@/components/sections.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => CASE_SLUGS.map((slug) => ({ locale, slug })));
}

type Params = { locale: string; slug: string };
type Section = { h: string; p?: string; list?: string[] };

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
  const sections = t.raw('sections') as Section[];
  const links = CASE_LINKS[slug as CaseSlug];
  const gallery = CASE_GALLERY[slug as CaseSlug];
  const others = CASE_SLUGS.filter((s) => s !== slug);
  const nameOf = async (s: string) => (await getTranslations({ locale, namespace: `cases.${s}` }))('title');
  const otherNames = await Promise.all(others.map(nameOf));

  return (
    <main id="contenido" tabIndex={-1} className="case container-x">
      <Link href="/#trabajo" className="case__back">← {u('back')}</Link>
      <p className="status">{t('status')}</p>
      <h1 className="case__title">{t('title')}</h1>
      <p className="case__summary">{t('summary')}</p>

      <div className="case__body">
        {sections.map((s) => (
          <section key={s.h} className="case__sec">
            <h2>{s.h}</h2>
            {s.p && <p>{s.p}</p>}
            {s.list && <ul>{s.list.map((li) => <li key={li}>{li}</li>)}</ul>}
          </section>
        ))}

        {slug === 'complia' && (
          <figure className="case__video">
            <video controls muted playsInline preload="metadata" poster={asset('/media/complia-demo-poster.jpg')} aria-label={u('videoCaption')}>
              <source src={asset('/media/complia-demo.mp4')} type="video/mp4" />
            </video>
            <figcaption className="note">{u('videoCaption')}</figcaption>
          </figure>
        )}

        {links && (
          <section className="case__sec">
            <h2>{u('links')}</h2>
            <div className="case__links">
              {links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}<span className="sr-only"> ({c('newTab')})</span></a>)}
            </div>
          </section>
        )}
      </div>

      {gallery && (
        <section className="case__gallery" aria-labelledby="h-gallery">
          <h2 id="h-gallery" className="case__gallery-h">{u('gallery')}</h2>
          <div className="gallery">
            {gallery.map((id) => (
              <figure key={id} className="gallery__item">
                <img src={asset(`/media/portals/${id}.webp`)} alt={t(`gallery.${id}.alt`)} width={1600} height={1000} loading="lazy" decoding="async" />
                <figcaption className="note">{t(`gallery.${id}.caption`)}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <div className="case__more">
        <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>{u('contactTitle')}</a>
        <span className="note">{u('contactText')}</span>
        <span className="label">{u('next')}</span>
        {others.map((s, i) => <Link key={s} href={`/proyectos/${s}`}>{otherNames[i]}</Link>)}
      </div>
      <Footer />
    </main>
  );
}
