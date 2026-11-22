import type { CSSProperties } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/site';
import es from '@/messages/v2/trailer/es.json';
import en from '@/messages/v2/trailer/en.json';
import howEs from '@/messages/v2/how/es.json';
import howEn from '@/messages/v2/how/en.json';
import { V2_LANG_TAG, type V2Locale, v2Messages } from '@/v2/i18n';
import { sitePath } from '@/v2/site';
import { CHAPTERS, SHOTS } from '@/v2/trailer/film';
import { CASES, type CaseSlug } from '../case/cases';
import { caseCopy } from '../case/copy';
import { AGENTS } from '../how/flow';
import { SiteFooter } from '../site/SiteFooter';
import { ArrowIcon } from '../ui/Icons';
import type { FilmData, TrailerCopy } from './shots';
import { TrailerPlayer } from './TrailerPlayer';

const COPY: Record<V2Locale, TrailerCopy> = { es, en };
export const trailerCopy = (locale: V2Locale): TrailerCopy => COPY[locale];
/** the colour of each chapter on the bar: the field it opens with */
const CHAPTER_COLOR = ['#ff5a3c', '#ff7a5c', '#5f86ff', '#ffc247', '#8aa4ff', '#ff5a3c'];
/** The stills of the panels: the poster of the case's clip. */
const still = (s: (typeof SHOTS)[number]) => ({ still: asset(s.media!), still2: s.media2 ? asset(s.media2) : undefined, clip: s.clip ? asset(s.clip) : undefined });

/**
 * The trailer «Conocer a Ignacio» of /v2 (lote 8.2): the film in its player and, below, the same story in words — what
 * a visitor without JavaScript or with reduced motion reads, and what a screen reader has instead of the picture.
 */
export function TrailerPage({ locale }: { locale: V2Locale }) {
  const T = trailerCopy(locale), M = v2Messages(locale), how = locale === 'es' ? howEs : howEn;
  const cases = [...new Set(SHOTS.map((s) => s.case).filter(Boolean))] as CaseSlug[];
  const data: FilmData = {
    copy: T, lang: V2_LANG_TAG[locale] === 'en' ? 'en-US' : 'es-AR',
    verbs: Object.fromEntries(cases.map((c) => [c, caseCopy(locale, c).film.verbs])),
    state: Object.fromEntries(cases.map((c) => [c, M.ui.status[CASES[c].status]])),
    color: Object.fromEntries(Object.values(CASES).map((c) => [c.slug, c.color])),
    stations: Object.values(how.system.nodes).map((n) => n.label),
    agents: AGENTS.map((a) => a.id),
    media: Object.fromEntries(SHOTS.filter((s) => s.media).map((s) => [s.id, still(s)])),
  };
  const chapters = CHAPTERS.map((c) => T.chapters[c.id as keyof typeof T.chapters]);
  // the story in words: what each shot says, by chapter
  const said = (id: string) => {
    const c = T.shots[id as keyof typeof T.shots] as Record<string, string | string[]>;
    return [c.name && c.when ? `${c.name} (${c.when}).` : c.name && !c.line ? `${c.name}.` : c.name ? `${c.name}:` : '', c.line, c.fact, c.after].filter(Boolean).join(' ');
  };
  return (
    <>
      <main id="main" className="v2-main tr-main" style={{ '--from': '#ff5a3c', '--to': '#ffc247' } as CSSProperties}>
        <section className="tr-open" aria-labelledby="st-title">
          <p className="st-kicker"><span>{T.player.kicker}</span></p>
          <h1 id="st-title">{T.title}</h1>
          <p className="st-lead">{T.player.lead}</p>
        </section>
        <TrailerPlayer data={data} labels={T.player} title={T.title} chapters={chapters} colors={CHAPTER_COLOR} home={sitePath(locale)} />
        <section className="tr-text" aria-labelledby="tr-text-h">
          <p className="tr-k">{T.player.textK}</p>
          <h2 id="tr-text-h">{T.player.textTitle}</h2>
          <ol>
            {CHAPTERS.map((c, i) => (
              <li key={c.id}>
                <h3><b aria-hidden="true">{String(i + 1).padStart(2, '0')}</b>{chapters[i]}</h3>
                {SHOTS.filter((s) => s.chapter === c.id).map((s) => <p key={s.id}>{said(s.id)}</p>)}
              </li>
            ))}
          </ol>
          <p><Link className="ab-link" href={sitePath(locale)}>{T.player.enter}<ArrowIcon size={14} /></Link></p>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
