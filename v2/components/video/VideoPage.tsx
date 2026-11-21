import type { CSSProperties } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/site';
import es from '@/messages/v2/video/es.json';
import en from '@/messages/v2/video/en.json';
import { type V2Locale } from '@/v2/i18n';
import { sitePath } from '@/v2/site';
import { CASES } from '../case/cases';
import { caseCopy } from '../case/copy';
import { SiteFooter } from '../site/SiteFooter';
import { ArrowIcon } from '../ui/Icons';
import { caseFilms, TRAILER_FILMS, trailerHref } from './films';
import { FilmWall, type WallFilm } from './FilmWall';

export type VideoCopy = typeof es;
const COPY: Record<V2Locale, VideoCopy> = { es, en };
export const videoCopy = (locale: V2Locale): VideoCopy => COPY[locale];
/** The colour of the trailer's tiles: the coral of the monogram's dot. */
const TRAILER_COLOR = '#ff5a3c';

/**
 * «Video» of /v2 (lote 7.2): a wall of films with a preview and filters. Few words on purpose — a title, one line
 * and the filters —; everything else is said by the films and their captions, which are the ones approved in each
 * case. Reached from the home, Work and the foot of every page (it is not in the header).
 */
export function VideoPage({ locale }: { locale: V2Locale }) {
  const V = videoCopy(locale);
  const trailer: WallFilm[] = TRAILER_FILMS(locale).map((f, i) => ({
    id: f.id, kind: f.kind, shape: f.shape, href: asset(trailerHref(locale, f.shape)), poster: asset(f.poster),
    color: TRAILER_COLOR, name: V.trailer.name, caption: V.trailer[f.shape].caption, alt: V.trailer[f.shape].alt, feature: i === 0,
  }));
  const fromCases: WallFilm[] = caseFilms().map((f) => {
    const c = caseCopy(locale, f.slug!), id = f.id.slice(f.slug!.length + 1);
    const words = f.from === 'film' ? { caption: c.film.label ?? c.line, alt: c.film.alt } : c.gallery[id as keyof typeof c.gallery] as { caption: string; alt: string };
    return {
      id: f.id, kind: f.kind, shape: f.shape, href: asset(f.src!), src: asset(f.src!), poster: asset(f.poster),
      color: CASES[f.slug!].color, name: c.title, caption: words.caption, alt: words.alt, caseHref: sitePath(locale, `work/${f.slug}/`),
    };
  });
  return (
    <>
      <main id="main" className="v2-main vw-main" style={{ '--from': TRAILER_COLOR, '--to': '#c79bff' } as CSSProperties}>
        <section className="vw-open" aria-labelledby="st-title">
          <p className="st-kicker"><span>{V.kicker}</span></p>
          <h1 id="st-title">{V.title}</h1>
          <p className="st-lead">{V.lead}</p>
        </section>
        <FilmWall films={[...trailer, ...fromCases]} labels={{ ...V.filters, count: V.count, open: V.open, player: V.player }} />
        <p className="vw-more"><Link className="ab-link" href={sitePath(locale, 'work/')}>{V.more}<ArrowIcon size={14} /></Link></p>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
