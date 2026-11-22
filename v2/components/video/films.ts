/**
 * The wall of films of /v2 (lote 7.2). Every film comes from a case (lote 5.1: its film and the videos of its
 * gallery, with the alt and the caption approved there), so this page never says something a case does not; the
 * only films of its own are the two editions of the trailer «Conocer a Ignacio», which open the trailer itself
 * (its page in /v2 since lote 8.3).
 */
import { CASE_ORDER, CASES, type CaseMedia, type CaseSlug } from '../case/cases';

export type FilmKind = 'trailer' | 'product' | 'motion';
export type FilmShape = 'wide' | 'tall';

export type Film = {
  id: string;
  kind: FilmKind;
  shape: FilmShape;
  /** the case it belongs to (none for the trailer) */
  slug?: CaseSlug;
  /** the clip and its poster (paths under /public); the trailer has no clip: it opens its own page */
  src?: string;
  poster: string;
  w: number;
  h: number;
  /** where its words live: the case's film (`film`) or an item of its gallery (`gallery`) */
  from?: 'film' | 'gallery';
};

const shapeOf = (m: CaseMedia): FilmShape => (m.frame === 'phone' ? 'tall' : 'wide');

/** The trailer, in its two editions: posters drawn from the film itself (public/media/trailer, see CLAUDE.md). */
export const TRAILER_FILMS = (locale: string): Film[] => [
  { id: 'trailer-wide', kind: 'trailer', shape: 'wide', poster: `/media/trailer/ig-${locale}-wide.webp`, w: 1280, h: 720 },
  { id: 'trailer-tall', kind: 'trailer', shape: 'tall', poster: `/media/trailer/ig-${locale}-tall.webp`, w: 540, h: 960 },
];
/** The trailer of /v2 (lote 8.3): its page, asked to play at once (`?play`), in 9:16 for the tall edition. */
export const trailerHref = (locale: string, shape: FilmShape = 'wide') => `/v2/${locale}/trailer/?play${shape === 'tall' ? '&f=t' : ''}`;

/** The films of the cases, in the order of Work: each case's film first, then the videos of its gallery. */
export function caseFilms(): Film[] {
  return CASE_ORDER.flatMap((slug) => {
    const c = CASES[slug], kind: FilmKind = slug === 'kinetic' ? 'motion' : 'product';
    const items: [CaseMedia, 'film' | 'gallery'][] = [[c.film, 'film'], ...c.gallery.map((g) => [g, 'gallery'] as [CaseMedia, 'gallery'])];
    return items.filter(([m]) => m.kind === 'video' && m.src && m.poster)
      .map(([m, from]) => ({ id: `${slug}-${m.id}`, kind, shape: shapeOf(m), slug, src: m.src!, poster: m.poster!, w: m.w, h: m.h, from }));
  });
}

export const FILM_KINDS: FilmKind[] = ['trailer', 'product', 'motion'];
export const FILM_SHAPES: FilmShape[] = ['wide', 'tall'];
