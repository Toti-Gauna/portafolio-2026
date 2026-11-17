import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/meta';
import { CASES, LAB } from '@/lib/cases';
import { STATIONS } from '@/lib/career';
import { CONTACT_EMAIL } from '@/lib/site';
import { FORMAT_PROJECTS, VIDEO_GROUPS, videosOf } from '@/lib/video';
import { Footer } from '@/components/sections/Sections';
import { Showcase, type ShowCopy } from '@/components/case/Showcase';
import { Flow, type FlowStep } from '@/components/diagrams/Flow';
import { Reveal } from '@/components/Reveal';
import { StatusTag } from '@/components/ui/StatusTag';
import { TrailerButton } from '@/components/TrailerButton';
import '@/components/sections.css';
import '@/components/case/case.css';
import '@/components/case/showcase.css';
import '@/components/business/business.css';
import '@/components/negocio/negocio.css';
import '@/components/negocio/video.css';

type Params = { locale: string };
type Fact = { k: string; v: string };

const statusOf = (slug: string) => STATIONS.flatMap((s) => s.buildings).find((b) => b.slug === slug)?.status;
const KINETIC_HUB = LAB.find((l) => l.id === 'kinetic')!.href;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'video' });
  return pageMetadata(locale, 'video/', t('metaTitle'), t('metaDescription'));
}

/** «Video y tráileres» (Ola 8c, design/2026/video.md): code-made trailers, recorded walk-throughs, editing and the Remotion test. */
export default async function VideoPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'video' });
  const u = await getTranslations({ locale, namespace: 'caseUi' });
  const cases = await getTranslations({ locale, namespace: 'cases' });
  const labels = { play: u('play'), pause: u('pause') };

  /** Captions come from the case that owns the video. */
  const copyOf = (slug: string): ShowCopy => {
    if (slug === 'complia') {
      const cap = cases(`complia.blocks.demo.caption`);
      return { demo: { alt: cap, caption: cap } };
    }
    return cases.raw(`${slug}.blocks.media.items`) as ShowCopy;
  };
  const steps = (k: 'kinetic' | 'remo') => t.raw(`remotion.${k}.steps`) as FlowStep[];
  const sections = ['code', 'products', 'formats', 'remotion'] as const;

  return (
    <>
      <main id="contenido" tabIndex={-1} className="case bz bz--hub vd">
        <header className="case__hero container-x">
          <Link href="/" className="case__back">← {t('back')}</Link>
          <p className="case__kind label">{t('label')}</p>
          <h1 className="case__title bz__title">{t('title')}</h1>
          <p className="case__summary">{t('lead')}</p>
          <p className="note bz-honest">{t('note')}</p>
          <nav className="bz-toc" aria-label={t('toc')}>
            <ol>
              {sections.map((id, i) => <li key={id}><a href={`#${id}`}><span className="label">{String(i + 1).padStart(2, '0')}</span> {t(`${id}.label`)}</a></li>)}
            </ol>
          </nav>
        </header>

        <section id="code" className="bz-topic container-x" aria-labelledby="h-code">
          <header className="bz-topic__head">
            <p className="label"><span className="bz-book__n">01</span> {t('code.label')}</p>
            <h2 id="h-code" className="bz-topic__title">{t('code.title')}</h2>
            <p className="bz-book__idea">{t('code.idea')}</p>
          </header>
          <ul className="vd-facts">
            {(t.raw('code.facts') as { n: string; d: string }[]).map((f) => <li key={f.d}><b>{f.n}</b><span>{f.d}</span></li>)}
          </ul>
          <div className="vd-actions">
            <TrailerButton className="btn btn-primary">{t('code.trailer')} <span aria-hidden="true">▶</span></TrailerButton>
            <span className="note">{t('code.trailerNote')}</span>
            <Link className="card-link" href="/proyectos/kinetic">{t('code.caseCta')} →</Link>
            <a className="card-link" href={KINETIC_HUB} target="_blank" rel="noopener noreferrer">{t('code.hub')} ↗</a>
          </div>
          <Showcase items={videosOf('kinetic')} copy={copyOf('kinetic')} labels={labels} />
        </section>

        <section id="products" className="bz-topic container-x" aria-labelledby="h-products">
          <header className="bz-topic__head">
            <p className="label"><span className="bz-book__n">02</span> {t('products.label')}</p>
            <h2 id="h-products" className="bz-topic__title">{t('products.title')}</h2>
            <p className="bz-book__idea">{t('products.idea')}</p>
          </header>
          {VIDEO_GROUPS.map((slug) => {
            const st = statusOf(slug);
            return (
              <Reveal as="div" key={slug} className="vd-group">
                <div className="vd-group__head">
                  <h3 className="vd-group__t"><span className="label">{t('groupLabel')}</span> {cases(`${slug}.title`)}</h3>
                  {st && <StatusTag kind={st} />}
                  <p className="vd-group__line">{t(`groups.${slug}`)}</p>
                  <Link className="card-link" href={`/proyectos/${slug}`}>{t('case')} →</Link>
                </div>
                <Showcase items={videosOf(slug)} copy={copyOf(slug)} labels={labels} />
              </Reveal>
            );
          })}
        </section>

        <section id="formats" className="bz-topic container-x" aria-labelledby="h-formats">
          <header className="bz-topic__head">
            <p className="label"><span className="bz-book__n">03</span> {t('formats.label')}</p>
            <h2 id="h-formats" className="bz-topic__title">{t('formats.title')}</h2>
            <p className="bz-book__idea">{t('formats.idea')}</p>
          </header>
          <ul className="bz-apply__list">
            {(t.raw('formats.items') as { t: string; d: string }[]).map((it, i) => {
              const slug = FORMAT_PROJECTS[i];
              return (
                <Reveal as="li" key={it.t} className="bz-apply__item">
                  <p className="status">{cases(`${slug}.title`)}</p>
                  <h4 className="bz-apply__t">{it.t}</h4>
                  <p>{it.d}</p>
                  <Link className="card-link" href={`/proyectos/${slug}`}>{t('case')} →</Link>
                </Reveal>
              );
            })}
          </ul>
        </section>

        <section id="remotion" className="bz-topic container-x" aria-labelledby="h-remotion">
          <header className="bz-topic__head">
            <p className="label"><span className="bz-book__n">04</span> {t('remotion.label')}</p>
            <h2 id="h-remotion" className="bz-topic__title">{t('remotion.title')}</h2>
            <p className="bz-book__idea">{t('remotion.idea')}</p>
          </header>
          <div className="vd-flows">
            <Flow id="kinetic" title={t('remotion.kinetic.title')} caption={t('remotion.kinetic.caption')} steps={steps('kinetic')} cols={4} />
            <Flow id="remo" title={t('remotion.remo.title')} caption={t('remotion.remo.caption')} steps={steps('remo')} cols={4} />
          </div>
          <dl className="vd-test">
            {(t.raw('remotion.facts') as Fact[]).map((f) => <div key={f.k}><dt className="label">{f.k}</dt><dd>{f.v}</dd></div>)}
          </dl>
          <p className="bz-legend">{t('remotion.criterion')}</p>
        </section>

        <div className="case__next container-x">
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
