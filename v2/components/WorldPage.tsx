import type { CSSProperties } from 'react';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { tokens } from '@/v2/tokens';
import { TopBar } from './TopBar';
import { SiteFooter } from './site/SiteFooter';
import { WORLD_BOX, WORLD_GROUPS, WORLD_GROUP_OF, WORLD_IDS, WORLD_ISLES, WORLD_STOPS, WORLD_SVG } from './work/world-art';
import { WORLD_POSTALS } from './work/world-stamps';
import { WorldInfo, type WorldPlace } from './work/WorldInfo';
import { WorldStrip } from './work/WorldStrip';

const GROUP_COLOR = { origin: tokens.color['amber-500'], work: tokens.color['blue-400'], own: tokens.color['pink-400'], next: tokens.color['mist-300'] } as const;

/**
 * Lote 4.1: the world of Work. The map first and full screen — one land in diagonal bands, a biome per stop,
 * travelled sideways by dragging, with the two buttons inside it or with the arrow keys; «Más información» under
 * every stop opens its postcard and its card. Below the map, the same stops as a list (the path without JS):
 * what each is, when, where it stands and what is drawn. The names are HTML: nothing is written in the art.
 */
export function WorldPage({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale), w = m.world;
  const places = w.places as Record<string, WorldPlace>;
  const stamps = m.kit.stamps.items;
  return (
    <>
      <TopBar locale={locale} page="world" />
      <main id="main">
        <WorldStrip
          svg={WORLD_SVG} width={WORLD_BOX.width} height={WORLD_BOX.height}
          stops={WORLD_STOPS.map((stop) => { const p = places[stop.id]; return { id: stop.id, x: stop.x, label: stop.label, ink: stop.ink, on: stop.on, color: GROUP_COLOR[stop.group], name: p.name, when: p.when, state: p.state }; })}
          labels={{ kicker: w.kicker, title: w.title, alt: w.mapAlt, hint: w.mapHint, prev: w.prev, next: w.next, drag: w.drag, stops: w.stops, more: w.more }}
        />
        <div className="v2-main wd-rest">
          <div className="v2-intro">
            <p className="v2-label">{w.map}</p>
            <p className="v2-sec-text">{w.text}</p>
            <ul className="wd-legend">
              <li><i className="wd-key wd-key--done" aria-hidden="true" />{w.legend.done}</li>
              <li><i className="wd-key wd-key--plan" aria-hidden="true" />{w.legend.plan}</li>
              <li><i className="wd-key wd-key--built" aria-hidden="true" />{w.legend.built}</li>
              <li><i className="wd-key wd-key--site" aria-hidden="true" />{w.legend.site}</li>
            </ul>
          </div>

          {WORLD_GROUPS.map((group) => (
            <section key={group} className="v2-sec" aria-labelledby={`wd-${group}`} style={{ '--from': GROUP_COLOR[group] } as CSSProperties}>
              <h2 id={`wd-${group}`} data-reveal>{w.groups[group]}</h2>
              <ul className="wd-cards">
                {WORLD_IDS.filter((id) => WORLD_GROUP_OF[id] === group).map((id) => {
                  const p = places[id], isle = WORLD_ISLES[id];
                  return (
                    <li key={id} className="wd-card" data-reveal data-id={id}>
                      <figure style={{ background: isle.ground }}>
                        <svg className="wa" viewBox={isle.box.join(' ')} preserveAspectRatio="xMidYMid slice" role="img" aria-label={p.art} dangerouslySetInnerHTML={{ __html: isle.svg }} />
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
        </div>

        {WORLD_IDS.map((id) => {
          const p = places[id], group = WORLD_GROUP_OF[id];
          return (
            <WorldInfo
              key={id} id={id} place={p} group={w.groups[group]} color={GROUP_COLOR[group]} postals={WORLD_POSTALS[id]}
              captions={WORLD_POSTALS[id].map((s) => (s.kit ? stamps[s.kit] : { year: p.mark ?? p.when, name: p.name, alt: p.art }))}
              labels={{ close: w.close, inside: w.inside, postal: w.postal }}
            />
          );
        })}
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
