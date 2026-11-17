import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing, localeTags } from '@/i18n/routing';
import { CONTACT_EMAIL, absoluteUrl } from '@/lib/site';
import { BOOKS } from '@/lib/business';
import { BRANDS } from '@/lib/brands';
import { STATIONS } from '@/lib/career';
import { AUDIENCE_WIDTHS, EXAMPLES, FLOW_PROJECTS, FUNNEL_PROJECTS, RAIL_PROJECTS, TOPICS, type TopicId } from '@/lib/negocio';
import { Footer } from '@/components/sections/Sections';
import { Reveal } from '@/components/Reveal';
import { StatusTag } from '@/components/ui/StatusTag';
import { ValueFlow } from '@/components/negocio/ValueFlow';
import { Audience } from '@/components/negocio/Audience';
import { Touchpoints } from '@/components/negocio/Touchpoints';
import { Swatches } from '@/components/negocio/Swatches';
import { Rails } from '@/components/negocio/Rails';
import { Funnel } from '@/components/negocio/Funnel';
import '@/components/sections.css';
import '@/components/case/case.css';
import '@/components/business/business.css';
import '@/components/negocio/negocio.css';

type Params = { locale: string };
type Item = { t: string; d: string };

const statusOf = (slug: string) => STATIONS.flatMap((s) => s.buildings).find((b) => b.slug === slug)?.status;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'negocio' });
  const url = (l: string) => absoluteUrl(`/${l}/negocio/`);
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: url(locale), languages: Object.fromEntries(routing.locales.map((l) => [localeTags[l], url(l)])) },
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), type: 'article', url: url(locale), images: [{ url: absoluteUrl('/og.png'), width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: t('metaTitle'), description: t('metaDescription'), images: [absoluteUrl('/og.png')] },
  };
}

/** «Negocio y marketing» (Ola 8b, design/2026/negocio.md): six topics drawn from my projects, then the three books. */
export default async function BusinessPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'negocio' });
  const b = await getTranslations({ locale, namespace: 'business' });
  const u = await getTranslations({ locale, namespace: 'caseUi' });
  const cases = await getTranslations({ locale, namespace: 'cases' });
  const lab = await getTranslations({ locale, namespace: 'brandlab' });
  const name = (p: string) => cases(`${p}.title`);
  const names = Object.fromEntries(['volta', 'velmar', 'dentalos', 'lucero', 'eclipse'].map((p) => [p, name(p)]));
  const raw = (k: string) => t.raw(k);

  const figure = (id: TopicId) => {
    switch (id) {
      case 'models':
        return (
          <div className="bz-flows">
            <p className="bz-fig__t">{t('topics.models.figTitle')}</p>
            {FLOW_PROJECTS.map((p) => <ValueFlow key={p} name={name(p)} c={raw(`topics.models.flows.${p}`) as never} />)}
          </div>
        );
      case 'digital': return <Audience c={raw('topics.digital.aud') as never} />;
      case 'physical': return <Touchpoints c={raw('topics.physical.touch') as never} />;
      case 'brand':
        return <Swatches title={t('topics.brand.sw.title')} cta={t('topics.brand.sw.cta')} names={Object.fromEntries(BRANDS.map((x) => [x.id, lab(`brands.${x.id}.name`)]))} />;
      case 'ops': return <Rails c={raw('topics.ops.rails') as never} names={names} projects={RAIL_PROJECTS} />;
      case 'funnels':
        return (
          <div className="bz-funnels">
            <p className="bz-fig__t">{t('topics.funnels.figTitle')}</p>
            <p className="bz-legend">{t('topics.funnels.legend')}</p>
            {FUNNEL_PROJECTS.map((p) => {
              const st = statusOf(p);
              return <Funnel key={p} name={name(p)} stages={raw(`topics.funnels.f.${p}`) as never} status={st ? <StatusTag kind={st} /> : null} />;
            })}
          </div>
        );
    }
  };

  return (
    <>
      <main id="contenido" tabIndex={-1} className="case bz bz--hub">
        <header className="case__hero container-x">
          <Link href="/" className="case__back">← {t('back')}</Link>
          <p className="case__kind label">{t('label')}</p>
          <h1 className="case__title bz__title">{t('title')}</h1>
          <p className="case__summary">{t('lead')}</p>
          <p className="note bz-honest">{t('note')}</p>
          <nav className="bz-toc" aria-label={t('toc')}>
            <ol>
              {TOPICS.map((id, i) => (
                <li key={id}><a href={`#${id}`}><span className="label">{String(i + 1).padStart(2, '0')}</span> {t(`topics.${id}.label`)}</a></li>
              ))}
              <li><a href="#libros"><span className="label">07</span> {t('books.title')}</a></li>
            </ol>
          </nav>
        </header>

        {TOPICS.map((id, n) => {
          const examples = id === 'funnels' ? [] : EXAMPLES[id];
          const list = id === 'funnels' ? [] : (raw(`topics.${id}.items`) as Item[]);
          return (
            <section key={id} id={id} className="bz-topic container-x" aria-labelledby={`h-${id}`}>
              <header className="bz-topic__head">
                <p className="label"><span className="bz-book__n">{String(n + 1).padStart(2, '0')}</span> {t(`topics.${id}.label`)}</p>
                <h2 id={`h-${id}`} className="bz-topic__title">{t(`topics.${id}.title`)}</h2>
                <p className="bz-book__idea">{t(`topics.${id}.idea`)}</p>
              </header>
              <div className="bz-topic__fig">{figure(id)}</div>
              {list.length > 0 && (
                <div className="bz-apply">
                  <h3 className="sub-title">{t('where')}</h3>
                  <ul className="bz-apply__list">
                    {list.map((it, i) => {
                      const p = examples[i];
                      const st = statusOf(p);
                      return (
                        <Reveal as="li" key={it.t} className="bz-apply__item">
                          <p className="bz-apply__where"><span className="status">{name(p)}</span>{st && <StatusTag kind={st} />}</p>
                          <h4 className="bz-apply__t">{it.t}</h4>
                          <p>{it.d}</p>
                          <Link className="card-link" href={`/proyectos/${p}`}>{t('see')} →</Link>
                        </Reveal>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>
          );
        })}

        <section id="libros" className="bz-topic container-x" aria-labelledby="h-libros">
          <header className="bz-topic__head">
            <p className="label"><span className="bz-book__n">07</span> {t('books.title')}</p>
            <h2 id="h-libros" className="bz-topic__title">{t('books.title')}</h2>
            <p className="bz-book__idea">{t('books.lead')}</p>
          </header>
          <ul className="bz-bookcards">
            {BOOKS.map((id) => (
              <Reveal as="li" key={id} className={`bz-bookcard bz-bookcard--${id}`}>
                <p className="label">{b(`books.${id}.kicker`)}</p>
                <h3 className="bz-bookcard__t">{b(`books.${id}.title`)}</h3>
                <p className="bz-bookcard__idea">{b(`books.${id}.idea`)}</p>
                <p className="label">{t('books.models')}</p>
                <ul className="bz-bookcard__models">
                  {(b.raw(`books.${id}.models`) as Item[]).slice(0, 3).map((m) => <li key={m.t}>{m.t}</li>)}
                </ul>
                <Link className="card-link" href={`/negocio/libros#${id}`}>{t('books.cta')} →</Link>
              </Reveal>
            ))}
          </ul>
        </section>

        <div className="case__next container-x">
          <p className="note">{t('reading')}</p>
          <div className="case__more" data-contact="">
            <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>{u('contactTitle')}</a>
            <span className="note">{u('contactText')}</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
