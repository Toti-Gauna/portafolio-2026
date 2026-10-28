import type { CSSProperties } from 'react';
import { InView } from './InView';
import './flow.css';

export type FlowStep = { actor?: string; t: string; d?: string };

/**
 * Steps in order. Wide containers: a row (wraps every `cols` steps) joined by a drawn line; narrow ones: a column.
 * While on screen a light walks the steps one by one. `loop` adds the «back to the start» note.
 */
export function Flow({ steps, title, caption, loop, cols = 4, id }: { steps: FlowStep[]; title?: string; caption?: string; loop?: string; cols?: number; id: string }) {
  const style = { '--cycle': `${(steps.length * 0.7 + 1.4).toFixed(1)}s`, '--cols': Math.min(cols, steps.length) } as CSSProperties;
  return (
    <InView as="figure" live className="dg fl" style={style} aria-labelledby={title ? `fl-${id}-t` : undefined}>
      {title && <div className="dg__head"><h3 id={`fl-${id}-t`} className="dg__title">{title}</h3></div>}
      <div className="fl__wrap">
        <ol className="fl__steps">
          {steps.map((s, i) => (
            <li key={i} className="fl__step" data-end={(i + 1) % Math.min(cols, steps.length) === 0 || undefined} style={{ '--o': i } as CSSProperties}>
              <span className="fl__node" aria-hidden="true"><span>{String(i + 1).padStart(2, '0')}</span></span>
              <div className="fl__body">
                {s.actor && <p className="fl__actor">{s.actor}</p>}
                <h4 className="fl__t">{s.t}</h4>
                {s.d && <p className="fl__d">{s.d}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
      {loop && <p className="fl__loop"><span aria-hidden="true">↺</span> {loop}</p>}
      {caption && <figcaption className="note dg__caption">{caption}</figcaption>}
    </InView>
  );
}
