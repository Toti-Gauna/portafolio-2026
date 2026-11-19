import type { CSSProperties } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/site';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { sitePath } from '@/v2/site';
import { CaseClip } from '../home/CaseClip';
import { SiteFooter } from '../site/SiteFooter';
import { ArrowIcon, ArrowLeftIcon } from '../ui/Icons';
import { Disclosure } from '../ui/Nav';
import { StatusBadge } from '../ui/Status';
import { WORLD_STAND_ART, WORLD_STANDS } from '../work/world-art';
import { postalAlone } from '../work/world-stamps';
import { archCopy } from './arch/copy';
import { archOf } from './arch/archs';
import { CaseArch } from './arch/CaseArch';
import { CaseFilm } from './CaseFilm';
import { CaseHow } from './objects/CaseHow';
import { CaseDs } from './ds/CaseDs';
import { dsOf } from './ds';
import { objectArt } from './objects/object-art';
import { CASES, type CaseMedia, type CaseSlug, nextCase } from './cases';
import { caseCopy } from './copy';

/** A piece of media in its frame: a browser window, a phone, or bare (a drawing). Videos are posters until asked. */
function Media({ m, alt, label, play, pause, name, card, film = false }: { m: CaseMedia; alt: string; label?: string; play: string; pause: string; name: string; card: string; film?: boolean }) {
  const art = m.kind === 'world'
    ? (() => { const s = WORLD_STANDS[name]; const [x, y, w, h] = s.box, pad = 30; return <svg className="wa cm-world" viewBox={`${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`} role="img" aria-label={alt} dangerouslySetInnerHTML={{ __html: WORLD_STAND_ART[name] }} />; })()
    : m.kind === 'video'
      ? <CaseClip src={asset(m.src!)} poster={asset(m.poster!)} alt={alt} play={play} pause={pause} name={label ?? alt} card={card} className={film ? 'cf-clip' : undefined} />
      // eslint-disable-next-line @next/next/no-img-element
      : <img src={asset(m.src!)} alt={alt} width={m.w} height={m.h} loading={film ? 'eager' : 'lazy'} decoding="async" />;
  return (
    <div className="cm" data-frame={m.frame} data-kind={m.kind} style={{ '--ar': `${m.w} / ${m.h}` } as CSSProperties}>
      {m.frame === 'browser' && <span className="cm-bar" aria-hidden="true"><i /><i /><i />{label && <b>{label}</b>}</span>}
      <div className="cm-view">{art}</div>
      {m.frame !== 'browser' && label && <span className="cm-label">{label}</span>}
    </div>
  );
}

/**
 * A case of /v2 (lote 5.1). Three layers of reading, the rule of the whole site: in 5 seconds the film — the name,
 * three verbs, the product in use and where it stands —; in 30, «En 10 segundos», how it works and three decisions;
 * the depth folded under «Más detalle». Then the gallery, what it is built with, and the next case, compact.
 * Every word comes from messages/v2/cases (copy.ts); every picture from the media the published case shows.
 */
export function CasePage({ locale, slug }: { locale: V2Locale; slug: CaseSlug }) {
  const m = v2Messages(locale), L = m.case;
  const def = CASES[slug], c = caseCopy(locale, slug);
  const nx = nextCase(slug), nd = CASES[nx], nc = caseCopy(locale, nx);
  const place = m.world.places[def.stop as keyof typeof m.world.places];
  const postal = postalAlone(def.stop, def.stamp);
  const stamps = m.kit.stamps.items as Record<string, { year: string; name: string; alt: string }>;
  const cap = def.stamp ? stamps[def.stamp] : { year: (place as { mark?: string }).mark ?? place.when, name: c.title, alt: place.art };
  const workHref = sitePath(locale, 'work/');
  const art = archOf(slug), arch = archCopy(locale, slug);
  const obj = objectArt(slug, c.how.length);
  const ds = dsOf(locale, slug);

  return (
    <>
      <main id="main" className="cs2" style={{ '--c': def.color } as CSSProperties}>
        <CaseFilm
          color={def.color} kind={c.kind} title={c.title} line={c.line} verbs={c.film.verbs} numbers={c.film.numbers}
          labels={{ film: L.film, chapters: L.chapters, chapter: L.chapter, chaptersLabel: L.chaptersLabel, play: L.play, pause: L.pause, replay: L.replay, keys: L.keys, clip: L.clip, clipStop: L.clipStop }}
          back={<Link className="cf-back" href={workHref}><ArrowLeftIcon size={14} />{L.back}</Link>}
          status={<StatusBadge status={def.status} label={m.ui.status[def.status]} />}
          stamp={
            <figure className="kit-stamp cf-postal" data-dark={postal.dark || undefined}>
              <svg viewBox="0 0 240 300" role="img" aria-label={`${L.postal}: ${cap.alt}`} dangerouslySetInnerHTML={{ __html: postal.svg }} />
              <b>{cap.year}</b>
              <span>{cap.name}</span>
            </figure>
          }
          panel={<Media m={def.film} alt={c.film.alt} label={c.film.label} play={L.clip} pause={L.clipStop} name={def.film.kind === 'world' ? def.stop : c.title} card=".cf-panel" film />}
        />

        <div className="cs2-in">
          <dl className="cs2-facts">
            {c.facts.map((f) => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}
          </dl>

          <section className="cs2-sec" aria-labelledby="cs-ten">
            <h2 id="cs-ten" className="cs2-h" data-reveal>{L.ten}</h2>
            <ul className="cs2-ten">
              {c.ten.map((x, i) => (
                <li key={x.k} data-reveal>
                  <span className="cs2-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{x.k}</h3>
                  <p>{x.v}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="cs2-sec" aria-labelledby="cs-how">
            <h2 id="cs-how" className="cs2-h" data-reveal>{L.how}</h2>
            <CaseHow svg={obj.svg} box={obj.box} steps={c.how} color={def.color} label={`${L.objAlt} ${c.title}: ${c.how.map((x) => x.t).join(', ')}.`} />
          </section>

          {art && arch && (
            <section className="cs2-sec" aria-labelledby="cs-arch">
              <div className="cs2-arch-head" data-reveal>
                <p className="cs2-arch-k">{L.arch.kicker}</p>
                <h2 id="cs-arch" className="cs2-h">{arch.title}</h2>
                {arch.badge && <span className="cs2-arch-badge">{arch.badge}</span>}
                <p>{arch.caption}</p>
              </div>
              <CaseArch art={art} copy={arch} labels={L.arch} color={def.color} />
            </section>
          )}

          {ds && (
            <section className="cs2-sec" aria-labelledby="cs-ds">
              <div className="cs2-arch-head" data-reveal>
                <p className="cs2-arch-k">{L.ds.kicker}</p>
                <h2 id="cs-ds" className="cs2-h">{ds.copy.title}</h2>
                <p>{ds.copy.line}</p>
              </div>
              <CaseDs slug={slug} spec={ds.spec} copy={ds.copy} labels={L.ds} />
            </section>
          )}

          {def.gallery.length > 0 && (
            <section className="cs2-sec" aria-labelledby="cs-gallery">
              <h2 id="cs-gallery" className="cs2-h" data-reveal>{L.gallery}</h2>
              <ul className="cs2-gallery" data-n={def.gallery.length}>
                {def.gallery.map((g) => {
                  const it = c.gallery[g.id];
                  return (
                    <li key={g.id} className="cs2-shot" data-frame={g.frame} data-reveal>
                      <figure>
                        <Media m={g} alt={it.alt} play={L.play2} pause={L.pause2} name={it.caption} card=".cs2-shot" />
                        <figcaption>{it.caption}</figcaption>
                      </figure>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className="cs2-sec" aria-labelledby="cs-decisions">
            <h2 id="cs-decisions" className="cs2-h" data-reveal>{L.decisions}</h2>
            <ol className="cs2-decisions">
              {c.decisions.map((d, i) => (
                <li key={d.t} data-reveal data-boing>
                  <span className="cs2-big" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{d.t}</h3>
                  <p>{d.why}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="cs2-sec cs2-built" aria-labelledby="cs-stack">
            <h2 id="cs-stack" className="cs2-h" data-reveal>{L.stack}</h2>
            <ul className="cs2-chips" data-reveal>{c.stack.map((s) => <li key={s}>{s}</li>)}</ul>
            {def.links.length > 0 && (
              <p className="cs2-links" data-reveal>
                {def.links.map((l) => (
                  <a key={l.href} className="cs2-link" href={l.href} target="_blank" rel="noreferrer">
                    {L.links[l.kind]}<span className="ui-sr"> {m.site.newTab}</span><ArrowIcon size={16} />
                  </a>
                ))}
              </p>
            )}
          </section>

          <section className="cs2-sec cs2-depth" aria-label={L.more}>
            <Disclosure summary={L.more}>
              <p className="cs2-hint">{L.moreHint}</p>
              {c.more.map((x) => (
                <div key={x.h} className="cs2-more">
                  <h3>{x.h}</h3>
                  <p>{x.p}</p>
                </div>
              ))}
            </Disclosure>
            {c.next && <p className="cs2-nextstep">{c.next}</p>}
          </section>

          <nav className="cs2-next" aria-label={L.next}>
            <Link className="cs2-next-link" href={sitePath(locale, `work/${nx}/`)} style={{ '--n': nd.color } as CSSProperties} data-boing>
              <span className="cs2-next-k">{L.next}</span>
              <span className="cs2-next-t"><i aria-hidden="true" />{nc.title}</span>
              <span className="cs2-next-d">{nc.kind}</span>
              <ArrowIcon size={22} />
            </Link>
            <Link className="cs2-all" href={workHref}>{L.all}</Link>
          </nav>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
