import type { CSSProperties } from 'react';
import Link from 'next/link';
import es from '@/messages/v2/how/es.json';
import en from '@/messages/v2/how/en.json';
import { type V2Locale } from '@/v2/i18n';
import { SITE_PAGES, sitePath } from '@/v2/site';
import { CountUp } from '../signature/CountUp';
import { PageOpening } from '../site/PageOpening';
import { ArrowIcon } from '../ui/Icons';
import { AgentFlow } from './AgentFlow';
import { MethodRing } from './MethodRing';

export type HowCopy = typeof es;
const COPY: Record<V2Locale, HowCopy> = { es, en };
export const howCopy = (locale: V2Locale): HowCopy => COPY[locale];

/**
 * «Cómo trabajo» of /v2 (lote 7.3): one piece per block. The method is a cycle of six steps, each with what I did
 * there; the agentic system is a living diagram — the seven stations a change travels and the eleven agents, each
 * at its station —; and the rules stand next to the evidence they rest on: three levels of evidence and the test
 * run of 27/10/2026. Every fact is the published method and system of the site, said in a positive voice.
 */
export function HowPage({ locale }: { locale: V2Locale }) {
  const H = howCopy(locale), page = SITE_PAGES.find((p) => p.key === 'how')!;
  const head = (id: string, k: string, title: string, lead?: string) => (
    <header className="ct-head" data-reveal>
      <p className="ct-k">{k}</p>
      <h2 id={`ct-${id}-h`}>{title}</h2>
      {lead && <p className="ct-lead">{lead}</p>}
    </header>
  );
  return (
    <PageOpening locale={locale} page="how">
      <div className="ct" style={{ '--from': page.from, '--to': page.to } as CSSProperties}>
        <nav className="ct-index" aria-label={H.index.label}>
          <ol>
            {(['method', 'system', 'rules'] as const).map((id, i) => (
              <li key={id}><a href={`#${id === 'method' ? 'metodo' : id === 'system' ? 'sistema' : 'reglas'}`}><b aria-hidden="true">{String(i + 1).padStart(2, '0')}</b>{H.index[id]}</a></li>
            ))}
          </ol>
        </nav>

        <section className="ct-sec" id="metodo" aria-labelledby="ct-method-h">
          {head('method', H.method.k, H.method.title, H.method.lead)}
          <MethodRing steps={H.method.steps} labels={H.method} />
        </section>

        <section className="ct-sec" id="sistema" aria-labelledby="ct-system-h">
          {head('system', H.system.k, H.system.title, H.system.lead)}
          <AgentFlow labels={H.system} />
          <p><Link className="ct-link" href={sitePath(locale, 'work/agentes/')}>{H.system.case}<ArrowIcon size={14} /></Link></p>
        </section>

        <section className="ct-sec" id="reglas" aria-labelledby="ct-rules-h">
          {head('rules', H.rules.k, H.rules.title)}
          <div className="ct-rules">
            <figure className="ct-ev" aria-labelledby="ct-ev-cap">
              <div className="ct-ladder">
                <p className="ct-ev-k">{H.rules.ladder}</p>
                <ol>
                  {H.rules.levels.map((l, i) => (
                    <li key={l.t} style={{ '--i': i } as CSSProperties}><b>{l.t}</b><span>{l.d}</span></li>
                  ))}
                </ol>
              </div>
              <div className="ct-run">
                <ul>
                  {H.rules.counts.map((c) => <li key={c.d}><b><CountUp value={c.n} /></b><span>{c.d}</span></li>)}
                </ul>
                <figcaption id="ct-ev-cap"><i aria-hidden="true" />{H.rules.run}</figcaption>
              </div>
            </figure>
            <ol className="ct-items">
              {H.rules.items.map((it, i) => (
                <li key={it.t}><span className="ct-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><b>{it.t}</b><span>{it.d}</span></li>
              ))}
            </ol>
          </div>
          <p><Link className="ct-link" href={sitePath(locale, 'negocio/')}>{H.rules.business}<ArrowIcon size={14} /></Link></p>
        </section>
      </div>
    </PageOpening>
  );
}
