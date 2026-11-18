import type { CSSProperties } from 'react';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { tokens } from '@/v2/tokens';
import { TopBar } from './TopBar';
import { SiteFooter } from './site/SiteFooter';
import { WORLD_BOX, WORLD_GROUPS, WORLD_GROUP_OF, WORLD_IDS, WORLD_ISLES, WORLD_SVG } from './work/world-art';

const GROUP_COLOR = { origin: tokens.color['amber-500'], work: tokens.color['blue-400'], own: tokens.color['pink-400'], next: tokens.color['mist-300'] } as const;

/**
 * Lote 4.1: the art of the world of Work, to approve before the engine is built (lote 4.2).
 * The whole map first (it scrolls sideways inside its own frame on a narrow screen), then every island on its
 * own with what it is, when, where it stands and what is drawn. The names are HTML: nothing is written in the art.
 */
export function WorldPage({ locale }: { locale: V2Locale }) {
  const w = v2Messages(locale).world;
  type PlaceId = keyof typeof w.places;
  return (
    <>
      <TopBar locale={locale} page="world" />
      <main id="main" className="v2-main">
        <div className="v2-intro">
          <p className="v2-label">{w.kicker}</p>
          <h1 className="cat-title">{w.title}</h1>
          <p className="v2-sec-text">{w.text}</p>
        </div>

        <section className="v2-sec" aria-labelledby="wd-map">
          <h2 id="wd-map" data-reveal>{w.map}</h2>
          <div className="wd-frame" role="group" aria-label={w.mapHint} tabIndex={0}>
            <svg className="wa wd-world" viewBox={`${WORLD_BOX.x} ${WORLD_BOX.y} ${WORLD_BOX.width} ${WORLD_BOX.height}`} role="img" aria-label={w.mapAlt} dangerouslySetInnerHTML={{ __html: WORLD_SVG }} />
          </div>
          <p className="wd-hint">{w.mapHint}</p>
          <ul className="wd-legend">
            <li><i className="wd-key wd-key--done" aria-hidden="true" />{w.legend.done}</li>
            <li><i className="wd-key wd-key--plan" aria-hidden="true" />{w.legend.plan}</li>
            <li><i className="wd-key wd-key--built" aria-hidden="true" />{w.legend.built}</li>
            <li><i className="wd-key wd-key--site" aria-hidden="true" />{w.legend.site}</li>
          </ul>
        </section>

        {WORLD_GROUPS.map((group) => (
          <section key={group} className="v2-sec" aria-labelledby={`wd-${group}`} style={{ '--from': GROUP_COLOR[group] } as CSSProperties}>
            <h2 id={`wd-${group}`} data-reveal>{w.groups[group]}</h2>
            <ul className="wd-cards">
              {WORLD_IDS.filter((id) => WORLD_GROUP_OF[id] === group).map((id) => {
                const p = w.places[id as PlaceId], isle = WORLD_ISLES[id];
                return (
                  <li key={id} className="wd-card" data-reveal data-id={id}>
                    <figure>
                      <svg className="wa" viewBox={isle.box.join(' ')} role="img" aria-label={p.art} dangerouslySetInnerHTML={{ __html: isle.svg }} />
                    </figure>
                    <p className="wd-when">{p.when}</p>
                    <h3>{p.name}</h3>
                    <p className="wd-state"><i aria-hidden="true" />{p.state}</p>
                    <p className="wd-text">{p.text}</p>
                    <p className="wd-art"><b>{w.drawn}</b> {p.art}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
