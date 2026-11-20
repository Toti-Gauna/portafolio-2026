import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { type V2Locale, V2_LANG_TAG, v2Messages } from '@/v2/i18n';
import { sitePath } from '@/v2/site';
import { StatusBadge } from '../ui/Status';
import { BIZ_PROJECTS, BIZ_SECTIONS, type BizProject, type BizSection, FUNNEL_ORDER, LOOP_ORDER, MODEL_ORDER } from './data';
import { bizCopy } from './copy';
import { First } from './First';
import { Flow } from './Flow';
import { Funnel } from './Funnel';
import { Loop } from './Loop';
import { EclipseLevels, Order, Plans } from './Pricing';
import { Meeting } from './Sale';
import { DentalSim, VelmarSim, VoltaSim } from './Simulator';
import { Tabs } from './Tabs';

const ANCHOR: Record<BizSection, string> = { model: 'modelo', pricing: 'precios', unit: 'economia', funnel: 'embudo', loop: 'ciclo', sale: 'venta', first: 'metrica' };

/**
 * «Negocio» of /v2 (lote 6.2): how Ignacio thinks a business, applied to his projects. Seven sections — model,
 * pricing, unit economics, funnel, growth loop, sale and the metric that goes first — and in each one, what the
 * projects' code and documents decide. The numbers are each demo's own sample scenarios, and the page says so.
 */
export function Business({ locale }: { locale: V2Locale }) {
  const c = bizCopy(locale), m = v2Messages(locale), tag = V2_LANG_TAG[locale];
  const name = (p: BizProject) => c.projects[p];
  const tabsOf = (ps: BizProject[]) => ps.map((p) => ({ key: p, name: name(p), color: BIZ_PROJECTS[p].color }));
  const head = (p: BizProject) => (
    <p className="bz-ph">
      <b>{name(p)}</b>
      <StatusBadge status={BIZ_PROJECTS[p].status} label={m.ui.status[BIZ_PROJECTS[p].status]} />
      <Link className="bz-case" href={sitePath(locale, BIZ_PROJECTS[p].href)}>{c.seeCase}</Link>
    </p>
  );
  const Sec = ({ k, children }: { k: BizSection; children: ReactNode }) => (
    <section id={ANCHOR[k]} className="bz-sec" aria-labelledby={`bz-${k}`}>
      <header className="bz-head" data-reveal>
        <p className="bz-k"><b>{String(BIZ_SECTIONS.indexOf(k) + 1).padStart(2, '0')}</b>{c.sections[k].k}</p>
        <h2 id={`bz-${k}`}>{c.sections[k].title}</h2>
        <p className="bz-lead">{c.sections[k].lead}</p>
      </header>
      {children}
    </section>
  );

  return (
    <div className="bz">
      <div className="bz-top">
        <p className="bz-honest">{c.note}</p>
        <nav className="bz-index" aria-label={c.index}>
          <ol>
            {BIZ_SECTIONS.map((k, i) => (
              <li key={k}><a href={`#${ANCHOR[k]}`}><b>{String(i + 1).padStart(2, '0')}</b>{c.sections[k].k}</a></li>
            ))}
          </ol>
        </nav>
      </div>

      <Sec k="model">
        <Tabs id="bz-model" label={c.tabs} tabs={tabsOf(MODEL_ORDER)}>
          {MODEL_ORDER.map((p) => <div key={p}>{head(p)}<Flow p={p} copy={c} /></div>)}
        </Tabs>
      </Sec>

      <Sec k="pricing">
        <Tabs id="bz-pricing" label={c.tabs} tabs={[
          { key: 'eclipse', name: c.pricing.eclipse.tab, color: BIZ_PROJECTS.eclipse.color },
          { key: 'lucero', name: c.pricing.lucero.tab, color: BIZ_PROJECTS.lucero.color },
          { key: 'volta', name: c.pricing.volta.tab, color: BIZ_PROJECTS.volta.color },
        ]}>
          {[
            <div key="e">{head('eclipse')}<EclipseLevels copy={c} /></div>,
            <div key="l">{head('lucero')}<Plans copy={c} /></div>,
            <div key="v">{head('volta')}<Order copy={c} /></div>,
          ]}
        </Tabs>
      </Sec>

      <Sec k="unit">
        <p className="bz-scenario"><b>{c.unit.scenario}</b> {c.unit.source} · {c.unit.pesos}</p>
        <Tabs id="bz-unit" label={c.tabs} tabs={[
          { key: 'velmar', name: c.unit.velmar.tab, color: BIZ_PROJECTS.velmar.color },
          { key: 'volta', name: c.unit.volta.tab, color: BIZ_PROJECTS.volta.color },
          { key: 'dentalos', name: c.unit.dentalos.tab, color: BIZ_PROJECTS.dentalos.color },
        ]}>
          {[
            <div key="m">{head('velmar')}<h3 className="bz-h3">{c.unit.velmar.title}</h3><VelmarSim u={c.unit} tag={tag} /></div>,
            <div key="v">{head('volta')}<h3 className="bz-h3">{c.unit.volta.title}</h3><VoltaSim u={c.unit} tag={tag} /></div>,
            <div key="d">{head('dentalos')}<h3 className="bz-h3">{c.unit.dentalos.title}</h3><DentalSim u={c.unit} tag={tag} /></div>,
          ]}
        </Tabs>
      </Sec>

      <Sec k="funnel">
        <Tabs id="bz-funnel" label={c.tabs} tabs={tabsOf(FUNNEL_ORDER)}>
          {FUNNEL_ORDER.map((p) => <div key={p}>{head(p)}<Funnel p={p} copy={c} /></div>)}
        </Tabs>
      </Sec>

      <Sec k="loop">
        <Tabs id="bz-loop" label={c.tabs} tabs={tabsOf(LOOP_ORDER)}>
          {LOOP_ORDER.map((p) => {
            const it = c.loop.items[p as keyof typeof c.loop.items];
            return <div key={p}>{head(p)}<Loop title={it.title} steps={it.steps} labels={c.loop} /></div>;
          })}
        </Tabs>
      </Sec>

      <Sec k="sale">
        <div className="bz-sale" style={{ '--c': BIZ_PROJECTS.volta.color } as CSSProperties}>
          <h3 className="bz-h3">{c.sale.meeting}</h3>
          <p className="bz-p">{c.sale.meetingLead}</p>
          <Meeting beats={c.sale.beats} label={c.sale.scrub} />
        </div>
        <div className="bz-pattern">
          <h3 className="bz-h3">{c.sale.pattern}</h3>
          <ol>{c.sale.steps.map((s, i) => <li key={s.t} data-reveal style={{ '--k': i } as CSSProperties}><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><b>{s.t}</b><p>{s.d}</p></li>)}</ol>
          <blockquote className="bz-quote-block"><p>{c.sale.quote}</p><footer>{c.sale.quoteBy}</footer></blockquote>
        </div>
      </Sec>

      <Sec k="first">
        <First copy={c} />
      </Sec>
    </div>
  );
}
