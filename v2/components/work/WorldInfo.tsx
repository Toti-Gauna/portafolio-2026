import type { CSSProperties } from 'react';
import { CloseIcon } from '../ui/Icons';
import type { WorldPostal } from './world-stamps';

export type WorldFact = { k: string; v: string };
export type WorldInside = { name: string; state: string; text: string; facts: WorldFact[] };
export type WorldPlace = { name: string; when: string; state: string; text: string; art: string; facts: WorldFact[]; mark?: string; inside?: Record<string, WorldInside> };
/** The year and the name printed over a stamp, and what it shows, in words. */
export type PostalCaption = { year: string; name: string; alt: string };

const Facts = ({ facts }: { facts: WorldFact[] }) => (
  <dl className="wi-facts">
    {facts.map((f) => (
      <div key={f.k}>
        <dt>{f.k}</dt>
        <dd>{f.v}</dd>
      </div>
    ))}
  </dl>
);

/**
 * «Más información» of a stop of the world (lote 4.1): its postcard on top — the stamp of direction 6 — and,
 * below, the card with what I did there, when, in which position and the rest. A modal <dialog>, rendered by the
 * server (the content is in the HTML) and opened by the map with showModal(): the focus goes to «Cerrar» and
 * comes back to the button that opened it; Escape, «Cerrar» or a click outside close it.
 */
export function WorldInfo({ id, place, group, color, postals, captions, labels }: {
  id: string; place: WorldPlace; group: string; color: string; postals: WorldPostal[]; captions: PostalCaption[]; labels: { close: string; inside: string; postal: string };
}) {
  return (
    <dialog className="wi" id={`wi-${id}`} aria-labelledby={`wi-t-${id}`} style={{ '--from': color } as CSSProperties}>
      <div className="wi-in">
        <form method="dialog" className="wi-x">
          <button type="submit" className="ui-iconbtn" aria-label={labels.close}><CloseIcon /></button>
        </form>
        <ul className="wi-stamps" data-n={postals.length} aria-label={labels.postal}>
          {postals.map((p, i) => (
            <li key={p.key} className="kit-stamp" data-dark={p.dark || undefined}>
              <svg viewBox="0 0 240 300" role="img" aria-label={captions[i].alt} dangerouslySetInnerHTML={{ __html: p.svg }} />
              <b>{captions[i].year}</b>
              <span>{captions[i].name}</span>
            </li>
          ))}
        </ul>
        <article className="wi-card">
          <p className="wi-kicker">{group} · {place.when}</p>
          <h2 id={`wi-t-${id}`}>{place.name}</h2>
          <p className="wd-state"><i aria-hidden="true" />{place.state}</p>
          <p className="wi-text">{place.text}</p>
          <Facts facts={place.facts} />
          {place.inside && (
            <>
              <h3 className="wi-sub">{labels.inside}</h3>
              <ul className="wi-inside">
                {Object.entries(place.inside).map(([key, part]) => (
                  <li key={key}>
                    <h4>{part.name}</h4>
                    <p className="wd-state"><i aria-hidden="true" />{part.state}</p>
                    <p className="wi-text">{part.text}</p>
                    <Facts facts={part.facts} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      </div>
    </dialog>
  );
}
