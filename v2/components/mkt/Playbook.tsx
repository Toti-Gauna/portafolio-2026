import type { CSSProperties } from 'react';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { skinVars } from '../brand/BrandBoard';
import { brandOf } from '../brand/brands';
import { mktCopy } from './copy';
import { Piece } from './Piece';
import { PLAYS } from './plays';
import { PlayMap } from './PlayMap';
import type { CalDate, Day, PlayId } from './types';

const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const START = DAYS.map((_, i) => DAYS.slice(0, i).reduce((a, b) => a + b, 0));
/** day of the year, 1–365 */
export const doy = ([m, d]: Day) => START[m - 1] + Math.min(d, DAYS[m - 1]);
/** the spans of a date inside one year (a range that crosses New Year is two) */
export const spans = (c: CalDate): [number, number][] => {
  const a = doy(c.from), b = doy(c.to);
  return a <= b ? [[a, b]] : [[a, 365], [1, b]];
};

/**
 * A brand's marketing playbook (lote 6.3), after its board in the Brand Lab: the way of its customer with every
 * touchpoint on the screen or on the street, each with its piece in the brand's skin, its message, how it is done,
 * what is looked at and where it comes from; then its year of campaigns (when its repo has one), how it talks and
 * its next step. Everything is the brand's: the frame only lays it out.
 */
export function Playbook({ locale, id }: { locale: V2Locale; id: PlayId }) {
  const L = v2Messages(locale).mkt;
  const play = PLAYS[id], c = mktCopy(locale, id);
  const { spec, copy: bc } = brandOf(locale, id);
  const brand = { name: bc.name, mark: spec.art(bc.art).logo.submark };
  const digital = play.touches.filter((t) => t.lane === 'digital').length;
  const nn = (i: number) => String(i + 1).padStart(2, '0');

  const items = play.touches.map((t, i) => {
    const w = c.touches[t.id];
    return {
      ...t, name: w.name,
      thumb: <Piece kind={t.kind} p={w.p} brand={brand} seed={`${id}-${t.id}`} mini />,
      detail: (
        <section className="mk-card" aria-labelledby={`mk-${t.id}`}>
          <figure className="mk-stage" data-on="a" aria-label={w.alt} role="img">
            <Piece kind={t.kind} p={w.p} brand={brand} seed={`${id}-${t.id}`} />
          </figure>
          <div className="mk-info">
            <p className="mk-where"><b>{nn(i)}</b> · {c.stages[t.stage]} · {L.lanes[t.lane]}</p>
            <h3 id={`mk-${t.id}`}>{w.name}</h3>
            <p className="mk-origin" data-o={t.origin}>{L.origin[t.origin]}</p>
            <dl>
              <div><dt>{L.msg}</dt><dd>{w.msg}</dd></div>
              <div><dt>{L.rule}</dt><dd>{w.rule}</dd></div>
              <div><dt>{L.watch}</dt><dd>{w.watch}</dd></div>
              {t.src && <div><dt>{L.where}</dt><dd><code>{play.repo.split('/')[1]}/{t.src.path}</code></dd></div>}
            </dl>
          </div>
        </section>
      ),
    };
  });

  const cal = play.calendar && c.calendar ? { ...play.calendar, words: c.calendar } : null;
  const mon = (m: number) => (locale === 'es' ? L.months[m - 1].toLowerCase() : L.months[m - 1]);
  const when = (d: CalDate) => {
    const [m1, d1] = d.from, [m2, d2] = d.to;
    if (m1 === m2) return locale === 'es' ? `${d1}–${d2} ${mon(m1)}` : `${mon(m1)} ${d1}–${d2}`;
    return locale === 'es' ? `${d1} ${mon(m1)} – ${d2} ${mon(m2)}` : `${mon(m1)} ${d1} – ${mon(m2)} ${d2}`;
  };

  return (
    <article id="marketing" className="bl mk" data-play={id} style={skinVars(spec)} aria-labelledby="mk-title">
      <section className="bl-sec" data-field="m">
        <div className="bl-in">
          <header className="mk-top">
            <p><span className="bl-num">{L.kicker}</span></p>
            <h2 id="mk-title" className="mk-title">{c.title}</h2>
            <p className="mk-note">{L.note}</p>
            <dl className="mk-facts">
              <div><dt>{L.goal}</dt><dd>{c.goal}</dd></div>
              <div><dt>{L.audience}</dt><dd>{c.audience}</dd></div>
            </dl>
            <ul className="mk-count">
              <li><b>{play.touches.length}</b> {L.count.touch}</li>
              <li data-l="digital"><b>{digital}</b> {L.count.digital}</li>
              <li data-l="physical"><b>{play.touches.length - digital}</b> {L.count.physical}</li>
            </ul>
          </header>
          <PlayMap items={items} stages={c.stages} labels={L} />
        </div>
      </section>

      <section className="bl-sec" data-field="a" aria-labelledby="mk-rules">
        <div className="bl-in">
          {cal && (
            <div className="mk-cal">
              <div className="bl-head"><h2>{cal.words.title}</h2><span className="bl-origin">{L.calNote} <code>{play.repo.split('/')[1]}/{cal.src.path}</code></span></div>
              <div className="mk-year" aria-hidden="true">
                <div className="mk-months">{L.months.map((m) => <span key={m}>{m}</span>)}</div>
                {cal.lanes.map((lane, k) => (
                  <div key={lane} className="mk-track" data-k={k}>
                    <span className="mk-track-t">{cal.words.lanes[lane]}</span>
                    {cal.dates.filter((d) => d.lane === lane).flatMap((d) => spans(d).map(([a, b], j) => (
                      <i key={`${d.key}${j}`} style={{ left: `${((a - 1) / 365) * 100}%`, width: `${((b - a + 1) / 365) * 100}%` } as CSSProperties} />
                    )))}
                  </div>
                ))}
              </div>
              <ol className="mk-dates">
                {[...cal.dates].sort((a, b) => doy(a.from) - doy(b.from)).map((d) => (
                  <li key={d.key} data-k={cal.lanes.indexOf(d.lane)}><span>{when(d)}</span><b>{cal.words.dates[d.key]}</b>{cal.lanes.length > 1 && <em>{cal.words.lanes[d.lane]}</em>}</li>
                ))}
              </ol>
            </div>
          )}
          <div className="mk-close">
            <div className="mk-rules">
              <h2 id="mk-rules" className="bl-sub">{L.rules}</h2>
              <ol>{c.rules.map((r, i) => <li key={i}><span className="mk-rn">{nn(i)}</span><span className="mk-rt">{r}</span></li>)}</ol>
            </div>
            {c.next && <div className="mk-next"><b>{L.nextStep}</b><span>{c.next}</span></div>}
            <p className="mk-source"><b>{L.source}.</b> {c.source}</p>
          </div>
        </div>
      </section>
    </article>
  );
}
