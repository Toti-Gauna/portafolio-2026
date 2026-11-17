import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing, localeTags } from '@/i18n/routing';
import { CONTACT_EMAIL, absoluteUrl } from '@/lib/site';
import { APPLY_LINKS, BOOKS, type BookId } from '@/lib/business';
import { Footer } from '@/components/sections/Sections';
import { Reveal } from '@/components/Reveal';
import { Loop } from '@/components/business/Loop';
import { Fork } from '@/components/business/Fork';
import { Swap } from '@/components/business/Swap';
import { Ladder } from '@/components/business/Ladder';
import { Errc } from '@/components/business/Errc';
import { Canvas } from '@/components/business/Canvas';
import { Ocean } from '@/components/business/Ocean';
import '@/components/sections.css';
import '@/components/case/case.css';
import '@/components/business/business.css';

type Params = { locale: string };
type Model = { t: string; d: string };
type Apply = { where: string; t: string; d: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'business' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: absoluteUrl(`/${locale}/negocio/`),
      languages: Object.fromEntries(routing.locales.map((l) => [localeTags[l], absoluteUrl(`/${l}/negocio/`)])),
    },
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), type: 'article', url: absoluteUrl(`/${locale}/negocio/`), images: [{ url: absoluteUrl('/og.png'), width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: t('metaTitle'), description: t('metaDescription'), images: [absoluteUrl('/og.png')] },
  };
}

/** «Cómo pienso el negocio»: the models from three books, each with where I applied it. */
export default async function BusinessPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'business' });
  const u = await getTranslations({ locale, namespace: 'caseUi' });
  const b = (id: BookId, k: string) => t.raw(`books.${id}.${k}`);

  const figures: Record<BookId, React.ReactNode> = {
    lean: <><Loop c={b('lean', 'loop')} /><Fork c={b('lean', 'fork')} /></>,
    mom: <><Swap c={b('mom', 'swap')} /><Ladder c={b('mom', 'ladder')} /></>,
    blue: <><Ocean c={b('blue', 'ocean')} /><Errc c={b('blue', 'errc')} /><Canvas c={b('blue', 'canvas')} /></>,
  };

  return (
    <>
      <main id="contenido" tabIndex={-1} className="case bz">
        <header className="case__hero container-x">
          <Link href="/" className="case__back">← {t('back')}</Link>
          <p className="case__kind label">{t('label')}</p>
          <h1 className="case__title bz__title">{t('title')}</h1>
          <p className="case__summary">{t('lead')}</p>
          <p className="note">{t('note')}</p>
          <nav className="bz-books" aria-label={t('toc')}>
            {BOOKS.map((id, i) => (
              <a key={id} href={`#${id}`} className="bz-books__item" style={{ '--o': i } as CSSProperties}>
                <span className="label">{t(`books.${id}.kicker`)}</span>
                <b>{t(`books.${id}.title`)}</b>
                <span className="bz-books__go" aria-hidden="true">↓</span>
              </a>
            ))}
          </nav>
        </header>

        {BOOKS.map((id, n) => (
          <section key={id} id={id} className="bz-book container-x" aria-labelledby={`h-${id}`} data-book={id}>
            <header className="bz-book__head">
              <p className="label"><span className="bz-book__n">{String(n + 1).padStart(2, '0')}</span> {t(`books.${id}.kicker`)}</p>
              <h2 id={`h-${id}`} className="bz-book__title">{t(`books.${id}.title`)}</h2>
              <p className="bz-book__idea">{t(`books.${id}.idea`)}</p>
            </header>
            <div className="bz-book__body">
              <div className="bz-models">
                <h3 className="sub-title">{t('models')}</h3>
                <ol>
                  {(b(id, 'models') as Model[]).map((m, i) => (
                    <Reveal as="li" key={m.t} className="bz-model">
                      <span className="bz-model__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      <div><h4 className="bz-model__t">{m.t}</h4><p>{m.d}</p></div>
                    </Reveal>
                  ))}
                </ol>
              </div>
              <div className="bz-figs">{figures[id]}</div>
            </div>
            <div className="bz-apply">
              <h3 className="sub-title">{t('apply')}</h3>
              <ul className="bz-apply__list">
                {(b(id, 'apply') as Apply[]).map((a, i) => {
                  const slug = APPLY_LINKS[id][i];
                  return (
                    <Reveal as="li" key={a.t} className="bz-apply__item">
                      <p className="status">{a.where}</p>
                      <h4 className="bz-apply__t">{a.t}</h4>
                      <p>{a.d}</p>
                      {slug && <Link className="card-link" href={`/proyectos/${slug}`}>{t('see')} →</Link>}
                    </Reveal>
                  );
                })}
              </ul>
            </div>
          </section>
        ))}

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
