import type { CSSProperties } from 'react';
import { BASE_PATH } from '@/lib/site';
import { GATE_VARIANTS } from '@/v2/gate/state';
import { tokens } from '@/v2/tokens';
import { type V2Locale, v2Messages } from '@/v2/i18n';
import { TopBar } from './TopBar';
import { ArrowIcon } from './ui/Icons';
import { SiteFooter } from './site/SiteFooter';

/** Lote 3.1: the four versions of the gate, side by side, each one a link to the real thing. */
const COLOR = { monograma: tokens.color['coral-500'], codigo: tokens.layer['tests-from'], ascenso: tokens.layer['plan-from'], postal: tokens.color.paper } as const;

export function GatePage({ locale }: { locale: V2Locale }) {
  const m = v2Messages(locale);
  const g = m.gate.choose;
  return (
    <>
      <TopBar locale={locale} page="gate" />
      <main id="main" className="v2-main">
        <div className="v2-intro">
          <p className="v2-label">{g.kicker}</p>
          <h1 className="cat-title">{g.title}</h1>
          <p className="v2-sec-text">{g.text}</p>
        </div>
        <section className="v2-sec" aria-label={g.title}>
          <ul className="gl-cards">
            {GATE_VARIANTS.map((id, i) => {
              const it = g.items[id];
              return (
                <li key={id} className="gl-card" style={{ '--from': COLOR[id] } as CSSProperties} data-reveal>
                  <p className="mu-letter"><b>{String.fromCharCode(65 + i)}</b> {g.letter}{i === 0 && <span className="gl-now">{g.now}</span>}</p>
                  <h2>{it.name}</h2>
                  <dl>
                    <div><dt>{g.theme}</dt><dd>{it.theme}</dd></div>
                    <div><dt>{g.piece}</dt><dd>{it.piece}</dd></div>
                    <div><dt>{g.loading}</dt><dd>{it.loading}</dd></div>
                  </dl>
                  {/* a full load: the gate is decided before the first paint of that page */}
                  <a className="ui-btn ui-btn--secondary ui-btn--sm" href={`${BASE_PATH}/v2/${locale}/puerta/${id}/`} hrefLang={locale}>
                    <span>{g.open}</span><span className="ui-sr">: {it.name}</span>
                    <ArrowIcon />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
