import type { CSSProperties } from 'react';
import { BIZ_PROJECTS, FIRST } from './data';
import type { BizCopy } from './copy';

/** The first number of each product's panel, and the rule it keeps (lote 6.2). The last tile is Ignacio's own. */
export function First({ copy }: { copy: BizCopy }) {
  const F = copy.first;
  const tile = (key: string, t: { where: string; kpi: string; how: string; rule: string }, color: string, own = false) => (
    <li key={key} className="bz-kpi" data-own={own || undefined} style={{ '--c': color } as CSSProperties}>
      <p className="bz-kpi-where"><i aria-hidden="true" />{own ? t.where : `${copy.projects[key as keyof typeof copy.projects]} · ${t.where}`}</p>
      <p className="bz-kpi-n">{t.kpi}</p>
      <dl>
        <div><dt>{F.how}</dt><dd>{t.how}</dd></div>
        <div><dt>{F.rule}</dt><dd>{t.rule}</dd></div>
      </dl>
    </li>
  );
  return (
    <ul className="bz-kpis">
      {FIRST.map((p) => tile(p, F.items[p], BIZ_PROJECTS[p].color))}
      {tile('own', F.own, '#ff5a3c', true)}
    </ul>
  );
}
