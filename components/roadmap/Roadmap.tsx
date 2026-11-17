import { useLocale, useTranslations } from 'next-intl';
import { COUNTS, STAGES, itemsOf, monthRange, statusOf, type RoadItem } from '@/lib/roadmap';
import { StatusTag } from '../ui/StatusTag';
import { RoadmapEngine } from './RoadmapEngine';
import '@/lib/iso/iso.css';
import '../camino/camino.css';
import './roadmap.css';
import './roadmap-figure.css';

type Copy = { name: string; tech?: string; what: string; exit?: string; opens?: string };

/**
 * The roadmap's model (Ola 6, design/2026/roadmap.md), with the same mechanics as «El camino» (camino.css is shared):
 * the HTML holds the whole plan as a list (stages → pieces → cards), which is what shows without JavaScript and under
 * «Ver como lista»; RoadmapEngine loads the drawing when the section is near, moves the camera to the stage picked in the
 * stepper and lights the piece picked in the drawing or in its row.
 */
export function Roadmap() {
  const t = useTranslations('roadmap');
  const locale = useLocale();
  return (
    <section className="camino roadmap" aria-label={t('stages')} data-roadmap="">
      <div className="camino__stage container-x" data-stage="">
        <div className="camino__window">
          <div className="camino__view iso" data-theme="light" data-slot="" role="img" aria-label={t('figure')} />
          <p className="camino__loading label">{t('loading')}</p>
          <p className="camino__readout label" aria-live="polite" data-readout="" />
        </div>
      </div>

      <div className="container-x camino__body">
        <div className="camino__bar">
          <div className="camino__steps camino__steps--4" role="tablist" aria-label={t('stages')} data-steps="">
            {STAGES.map((s, i) => (
              <button
                key={s}
                type="button"
                role="tab"
                id={`rm-tab-${s}`}
                aria-controls={`rm-${s}`}
                aria-selected={i === 0}
                tabIndex={i === 0 ? 0 : -1}
                className="camino__step"
                data-station={s}
                data-readout={`${t('readout', { n: i + 1, total: STAGES.length })} · ${t(`st.${s}.name`)} · ${t(`st.${s}.when`)}`}
              >
                <span className="camino__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="camino__sname">{t(`st.${s}.name`)}</span>
                <span className="camino__swhen">{t(`st.${s}.when`)}</span>
              </button>
            ))}
          </div>
          <button type="button" className="camino__toggle btn btn-ghost" data-toggle="">
            <span className="camino__t-list">{t('asList')}</span>
            <span className="camino__t-map">{t('asMap')}</span>
          </button>
        </div>

        {STAGES.map((s, i) => (
          <div
            key={s}
            id={`rm-${s}`}
            role="tabpanel"
            aria-labelledby={`rm-tab-${s}`}
            className="camino__panel"
            data-panel={s}
            data-active={i === 0 ? '' : undefined}
          >
            <h2 className="camino__st">
              <span className="label">{String(i + 1).padStart(2, '0')}</span> {t(`st.${s}.name`)} <span className="camino__when">{t(`st.${s}.when`)}</span>
            </h2>
            <p className="camino__ctext roadmap__stext">{t(`st.${s}.text`)}</p>
            <ol className="roadmap__rows" aria-label={t('count', COUNTS)}>
              {itemsOf(s).map((it, j) => {
                const c = t.raw(`items.${it.id}`) as Copy;
                return (
                  <li key={it.id}>
                    <button type="button" className="roadmap__row" data-b={it.id} data-kind={it.kind} aria-pressed={i === 0 && j === 0} aria-controls={`rm-card-${it.id}`}>
                      <span className="roadmap__code">{it.code || '·'}</span>
                      <span className="roadmap__name">{c.name}</span>
                      <span className="roadmap__when">{monthRange(it.from, it.to, locale)}</span>
                    </button>
                    <Card it={it} on={i === 0 && j === 0} locale={locale} />
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
      <RoadmapEngine />
    </section>
  );
}

function Card({ it, on, locale }: { it: RoadItem; on: boolean; locale: string }) {
  const t = useTranslations('roadmap');
  const c = t.raw(`items.${it.id}`) as Copy;
  return (
    <article className="camino__card roadmap__card" id={`rm-card-${it.id}`} data-card={it.id} data-on={on ? '' : undefined} aria-label={c.name}>
      <p className="label roadmap__kind">{it.code ? `${it.code} · ` : ''}{t(`kinds.${it.kind}`)}</p>
      <h3 className="camino__cname">{c.name}</h3>
      <p className="camino__cstate">
        <StatusTag kind={statusOf(it)} />
        {it.proposed && <span className="label"> {t('proposed')}</span>}
        {it.cut && <span className="label"> {t('cut')}</span>}
      </p>
      <p className="roadmap__time label">{monthRange(it.from, it.to, locale)} · {t('weeks', { n: it.weeks })}</p>
      {c.tech && <p className="camino__ctext"><span className="label">{t('tech')}</span> {c.tech}</p>}
      <p className="camino__ctext">{c.what}</p>
      {c.exit && <p className="camino__ctext"><span className="label">{t('exit')}</span> {c.exit}</p>}
      {c.opens && <p className="camino__ctext"><span className="label">{t('opens')}</span> {c.opens}</p>}
    </article>
  );
}

