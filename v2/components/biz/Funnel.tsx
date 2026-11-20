import type { CSSProperties } from 'react';
import { FUNNEL, type BizProject } from './data';
import type { BizCopy } from './copy';

/**
 * A funnel, stage by stage (lote 6.2): each stage narrows a little (the shape is illustrative: nothing here is a
 * measured conversion) and carries the module of the repo that builds it. In Eclipse's, the first stages are
 * signals and the last ones are records written by hand in the CRM.
 */
export function Funnel({ p, copy }: { p: BizProject; copy: BizCopy }) {
  const stages = copy.funnel.items[p], f = FUNNEL[p], n = stages.length;
  return (
    <figure className="bz-funnel">
      <ol>
        {stages.map((s, i) => {
          const kind = f.signals === undefined ? undefined : i < f.signals ? 'signal' : 'record';
          return (
            <li key={s.t} data-kind={kind} style={{ '--w': `${100 - (i * 42) / Math.max(1, n - 1)}%`, '--k': i } as CSSProperties}>
              <span className="bz-fun-bar" aria-hidden="true" />
              <span className="bz-fun-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <b>{s.t}</b>
              <span className="bz-fun-d">{s.d}</span>
              <code>{f.modules[i]}</code>
              {kind && <span className="bz-fun-kind">{kind === 'signal' ? copy.funnel.signal : copy.funnel.record}</span>}
            </li>
          );
        })}
      </ol>
      <figcaption>
        {p === 'eclipse' && <q className="bz-quote">{copy.funnel.eclipseQuote.replace(/^[«“]|[»”]$/g, '')}</q>}
        <span>{copy.funnel.legend}</span>
      </figcaption>
    </figure>
  );
}
