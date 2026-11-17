import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { STATIONS, type Building } from '@/lib/career';
import { StatusTag } from '../ui/StatusTag';
import { CaminoEngine } from './CaminoEngine';
import '@/lib/iso/iso.css';
import './camino.css';

type Fact = { k: string; v: string };
type Copy = { name: string; state?: string; note?: string; text: string; facts?: Fact[] };

/**
 * «El camino» (Ola 5, design/2026/camino.md): the career as a model railway. The HTML holds the whole thing as a list
 * (stations → buildings → cards), which is what shows without JavaScript and under «Ver como lista». With JavaScript
 * the list becomes the model's captions: CaminoEngine loads the drawing when the section gets close, moves the camera to
 * the station picked in the stepper and lifts the building picked in the drawing or in its row.
 */
export function Camino() {
  const t = useTranslations('career');
  const total = STATIONS.length;
  return (
    <section id="camino" className="sec camino" aria-labelledby="h-camino" data-camino="">
      <div className="container-x">
        <header className="sec__head">
          <p className="label">{t('label')}</p>
          <h2 id="h-camino" className="sec__title">{t('title')}</h2>
          <p className="sec__lead">{t('lead')}</p>
        </header>
      </div>

      <div className="camino__stage container-x" data-stage="">
        <div className="camino__window">
          <div className="camino__view iso" data-theme="light" data-slot="" role="img" aria-label={t('figure')} />
          <p className="camino__loading label">{t('loading')}</p>
          <p className="camino__readout label" aria-live="polite" data-readout="" />
        </div>
      </div>

      <div className="container-x camino__body">
        <div className="camino__bar">
          <div className="camino__steps" role="tablist" aria-label={t('stations')} data-steps="">
            {STATIONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`cam-tab-${s.id}`}
                aria-controls={`cam-${s.id}`}
                aria-selected={i === 0}
                tabIndex={i === 0 ? 0 : -1}
                className="camino__step"
                data-station={s.id}
                data-readout={t('readout', { n: i + 1, total }) + ` · ${t(`st.${s.id}.name`)} · ${t(`st.${s.id}.when`)}`}
              >
                <span className="camino__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="camino__sname">{t(`st.${s.id}.name`)}</span>
                <span className="camino__swhen">{t(`st.${s.id}.when`)}</span>
              </button>
            ))}
          </div>
          <button type="button" className="camino__toggle btn btn-ghost" data-toggle="">
            <span className="camino__t-list">{t('asList')}</span>
            <span className="camino__t-map">{t('asMap')}</span>
          </button>
        </div>

        {STATIONS.map((s, i) => (
          <div
            key={s.id}
            id={`cam-${s.id}`}
            role="tabpanel"
            aria-labelledby={`cam-tab-${s.id}`}
            className="camino__panel"
            data-panel={s.id}
            data-active={i === 0 ? '' : undefined}
          >
            <h3 className="camino__st">
              <span className="label">{String(i + 1).padStart(2, '0')}</span> {t(`st.${s.id}.name`)} <span className="camino__when">{t(`st.${s.id}.when`)}</span>
            </h3>
            {s.buildings.length > 1 && (
              <ul className="camino__chips" aria-label={t('buildings')}>
                {s.buildings.map((b, j) => (
                  <li key={b.id}>
                    <button type="button" className="camino__chip" data-b={b.id} aria-pressed={j === 0}>{t(`b.${b.id}.name`)}</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="camino__cards">
              {s.buildings.map((b, j) => <Card key={b.id} b={b} on={j === 0} />)}
            </div>
          </div>
        ))}
        <p className="note camino__logos">{t('logos')}</p>
      </div>
      <CaminoEngine />
    </section>
  );
}

function Card({ b, on }: { b: Building; on: boolean }) {
  const t = useTranslations('career');
  const c = t.raw(`b.${b.id}`) as Copy;
  return (
    <article className="camino__card" data-card={b.id} data-on={on ? '' : undefined} aria-label={c.name}>
      <h4 className="camino__cname">{c.name}</h4>
      <p className="camino__cstate">
        {b.status ? <StatusTag kind={b.status} /> : c.state && <span className="label">{c.state}</span>}
        {b.status && c.note && <span className="label"> {c.note}</span>}
      </p>
      <p className="camino__ctext">{c.text}</p>
      {c.facts && (
        <dl className="camino__facts">
          {c.facts.map((f) => (
            <div key={f.k}><dt className="label">{f.k}</dt><dd>{f.v}</dd></div>
          ))}
        </dl>
      )}
      {b.slug && <Link className="camino__go" href={`/proyectos/${b.slug}`}>{t('case')} <span aria-hidden="true">→</span></Link>}
      {!b.slug && b.status === 'planeado' && <p className="camino__soon label">{t('soon')}</p>}
    </article>
  );
}
