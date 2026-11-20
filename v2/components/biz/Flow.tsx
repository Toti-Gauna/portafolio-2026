import { MODEL, type BizProject } from './data';
import type { BizCopy } from './copy';

/**
 * Who pays whom (lote 6.2): the nodes of a business in a row and, between each pair, the money going one way
 * (solid, in the project's colour, with a packet that runs once when the panel opens) and the value coming back
 * (dashed). HTML, so every label is real text; on a phone the row turns into a column.
 */
export function Flow({ p, copy }: { p: BizProject; copy: BizCopy }) {
  const m = MODEL[p], t = copy.model.items[p] as { nodes: Record<string, string>; links: Record<string, string>; decision: string };
  const between = (a: number) => m.links.filter((l) => Math.min(l.from, l.to) === a);
  return (
    <figure className="bz-flow" data-n={m.nodes.length}>
      <div className="bz-flow-row">
        {m.nodes.map((n, i) => (
          <div key={n} className="bz-flow-cell">
            <div className="bz-node" data-main={i === m.nodes.length - 1 || undefined}>{t.nodes[n]}</div>
            {i < m.nodes.length - 1 && (
              <div className="bz-links">
                {between(i).sort((x) => (x.kind === 'money' ? -1 : 1)).map((l) => (
                  <div key={l.key} className="bz-link" data-kind={l.kind} data-dir={l.to > l.from ? 'fwd' : 'back'}>
                    <span className="bz-link-k">{l.kind === 'money' ? copy.model.money : copy.model.value}</span>
                    <span className="bz-link-t">{t.links[l.key]}</span>
                    <span className="bz-line" aria-hidden="true"><b /></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <figcaption className="bz-decision"><b>{copy.model.decision}</b> {t.decision}</figcaption>
    </figure>
  );
}
