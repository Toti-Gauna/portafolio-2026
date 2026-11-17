import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CHAPTERS, SCENE_WIDTHS, sceneSrc } from '@/lib/taller';
import { CONTACT_HREF } from '@/lib/nav';
import { CONTACT_EMAIL, LINKEDIN_URL, asset } from '@/lib/site';
import { TrailerButton } from '../TrailerButton';
import { Readouts, type Readout } from '../diagrams/Readouts';
import { StatusTag } from '../ui/StatusTag';
import { musicTracks } from '@/lib/music-files';
import { TallerEngine } from './TallerEngine';
import './taller.css';

const srcSet = (n: number) => SCENE_WIDTHS.map((w) => `${asset(sceneSrc(n, w))} ${w}w`).join(', ');
const fig = (n: number) => String(n).padStart(2, '0');

/**
 * The home: a walk through «el Taller cósmico» (lib/taller.ts, design/2026/paginas.md § 2).
 * Scroll mode (JS, ≥ 900 px wide, no reduced motion): a fixed stage shows each chapter's scene; the camera travels to
 * the next one with a generated video scrubbed by the scroll, or with a crossfade where there is no video
 * (TallerEngine). Everywhere else (phones, reduced motion, no JS): each chapter is its picture and its text.
 * All copy is real HTML in the flow, in order: what a reader, a search engine or a screen reader gets.
 */
export function Taller() {
  const t = useTranslations('taller');
  const h = useTranslations('hero');
  return (
    <section className="taller" aria-label={t('label')} data-taller="">
      <div className="taller__stage" aria-hidden="true">
        {CHAPTERS.map((c, i) => (
          <img
            key={c.key}
            className="taller__scene"
            data-scene={i}
            data-srcset={i === 0 ? undefined : srcSet(i)}
            srcSet={i === 0 ? srcSet(0) : undefined}
            sizes="100vw"
            alt=""
            width={2400}
            height={1357}
            decoding="async"
            fetchPriority={i === 0 ? 'high' : undefined}
          />
        ))}
      </div>

      {CHAPTERS.map((c, i) => {
        const k = `ch.${c.key}`;
        const style = { '--obj': c.building === 'left' ? '22% 50%' : '78% 50%' } as CSSProperties;
        return (
          <article
            key={c.key}
            id={c.key === 'contact' ? 'contacto' : c.key === 'hero' ? 'inicio' : `taller-${c.key}`}
            className={`tch tch--${c.key}`}
            data-ch={i}
            data-text={c.building === 'left' ? 'right' : 'left'}
            data-top={c.alignTop || undefined}
            data-next={c.next ? asset(`/media/taller/${c.next}.mp4`) : undefined}
            aria-labelledby={`tch-${c.key}`}
            style={style}
          >
            <img className="tch__pic" srcSet={srcSet(i)} sizes="100vw" alt={t(`${k}.alt`)} width={2400} height={1357} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
            <div className="tch__pin">
              <div className="container-x tch__wrap">
                <div className="tch__body">
                  <p className="tch__fig label">
                    <span>{t('fig')} {fig(i)}</span> — <span>{t(`${k}.title`)}</span>
                  </p>

                  {c.key === 'hero' ? (
                    <>
                      <p className="tch__role label"><span>{h('role')}</span> <span className="hero__avail">{h('availability')}</span></p>
                      <h1 id="tch-hero" className="tch__name">Ignacio<span>Gauna</span></h1>
                      <p className="tch__lead">{h('title')}</p>
                      <p className="tch__text">{h('lead')}</p>
                      <div className="tch__cta" data-contact="">
                        <TrailerButton className="btn btn-primary">{h('watch')}</TrailerButton>
                        <a className="btn btn-ghost" href={`mailto:${CONTACT_EMAIL}`}>{h('write')}</a>
                      </div>
                      <div className="tch__readouts" role="group" aria-label={h('readoutsLabel')}>
                        <Readouts items={h.raw('readouts') as Readout[]} />
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 id={`tch-${c.key}`} className="tch__h">{t(`${k}.heading`)}</h2>
                      <p className="tch__text">{t(`${k}.text`)}</p>
                      {c.key === 'path' && (
                        <ol className="tch__list">
                          {(t.raw(`${k}.items`) as string[]).map((it) => <li key={it}>{it}</li>)}
                        </ol>
                      )}
                      {c.items && (
                        <ul className="tch__list tch__list--tags">
                          {(t.raw(`${k}.items`) as string[]).map((it, j) => (
                            <li key={it}><StatusTag kind={c.items![j]} /> <span>{it}</span></li>
                          ))}
                        </ul>
                      )}
                      {c.key === 'contact' ? (
                        <>
                          <div className="tch__cta" data-contact="">
                            <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>{h('write')}</a>
                            <a className="btn btn-ghost" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr-only"> ({h('newTab')})</span></a>
                          </div>
                          <p className="tch__mail"><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> · <Link href={CONTACT_HREF}>{t(`${k}.all`)}</Link></p>
                          <p className="tch__credit note">{t('credit')}{musicTracks().length > 0 && ` ${t('creditMusic')}`}</p>
                        </>
                      ) : c.href ? (
                        <Link className="tch__go" href={c.href}>{t(`${k}.cta`)} <span aria-hidden="true">→</span></Link>
                      ) : (
                        <p className="tch__soon label">{t('soon')}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
      <TallerEngine />
    </section>
  );
}
