import type { CSSProperties } from 'react';
import Link from 'next/link';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { sitePath } from '@/v2/site';
import { tokens } from '@/v2/tokens';
import { casesAt } from '../case/cases';
import { ArrowIcon } from '../ui/Icons';
import { WORLD_BOX, WORLD_CRATES, WORLD_GROUPS, WORLD_GROUP_OF, WORLD_IDS, WORLD_ISLES, WORLD_MINI, WORLD_STOPS, WORLD_SVG, WORLD_WALKERS } from './world-art';
import { WORLD_POSTALS } from './world-stamps';
import { WorldInfo, type WorldPlace } from './WorldInfo';
import { WorldStrip } from './WorldStrip';

const GROUP_COLOR = { origin: tokens.color['amber-500'], work: tokens.color['blue-400'], own: tokens.color['pink-400'], next: tokens.color['mist-300'] } as const;

/**
 * The world of Work, whole (lotes 4.1 y 4.2): the map first, full screen, with its engine (WorldStrip); then the
 * same stops as a list — the accessible way and the way without JS — and the card of every stop (WorldInfo),
 * rendered here and opened by the map. The page that holds it gives its kicker, its title (the h1, inside the
 * map's glass card) and the line over the list.
 */
/** The case pages of a stop: its own (`self`), or one per part inside it (Tsoft). */
const caseLinksFor = (locale: V2Locale) => (id: string): Record<string, string> => {
  const list = casesAt(id);
  return Object.fromEntries(list.map((slug) => [slug === id ? 'self' : slug, sitePath(locale, `work/${slug}/`)]));
};

export function WorldExplorer({ locale, kicker, title, lead }: { locale: V2Locale; kicker: string; title: string; lead: string }) {
  const m = v2Messages(locale), w = m.world;
  const places = w.places as Record<string, WorldPlace>;
  const stamps = m.kit.stamps.items;
  const caseLinks = caseLinksFor(locale);
  return (
    <>
      <WorldStrip
        svg={WORLD_SVG} mini={WORLD_MINI} width={WORLD_BOX.width} height={WORLD_BOX.height}
        stops={WORLD_STOPS.map((stop) => { const p = places[stop.id]; return { id: stop.id, node: stop.node, home: stop.home, tall: stop.tall, planned: stop.group === 'next', x: stop.x, y: stop.y, span: stop.span, label: stop.label, ink: stop.ink, on: stop.on, color: GROUP_COLOR[stop.group], name: p.name, when: p.when, state: p.state, group: w.groups[stop.group] }; })}
        labels={{ kicker, title, alt: w.mapAlt, hint: w.mapHint, prev: w.prev, next: w.next, drag: w.drag, stops: w.stops, more: w.more, zoomIn: w.zoomIn, zoomOut: w.zoomOut, asList: w.asList, toNight: w.toNight, toDay: w.toDay, pause: w.pause, play: w.play, views: w.views, drive: w.drive }}
        walkers={WORLD_WALKERS} crates={WORLD_CRATES}
      />
      <div className="v2-main wd-rest" id="lista" tabIndex={-1}>
        <div className="v2-intro">
          <p className="v2-label">{w.map}</p>
          <p className="v2-sec-text">{lead}</p>
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
                    {Object.entries(caseLinks(id)).map(([k, href]) => (
                      <Link key={k} className="wd-case" href={href}>{m.case.see}{k === 'self' ? '' : ` · ${places[id].inside?.[k]?.name ?? k}`}<span className="ui-sr">{k === 'self' ? ` · ${p.name}` : ''}</span><ArrowIcon size={14} /></Link>
                    ))}
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
            labels={{ close: w.close, inside: w.inside, postal: w.postal, see: m.case.see }}
            cases={caseLinks(id)}
          />
        );
      })}
    </>
  );
}
