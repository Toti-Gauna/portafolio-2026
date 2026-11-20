import { PRICING } from './data';
import type { BizCopy } from './copy';
import { Ladder } from './Ladder';

/** Lucero's three plans: each one holds the one before (lote 6.2). */
export function Plans({ copy }: { copy: BizCopy }) {
  const L = copy.pricing.lucero;
  return (
    <div className="bz-stack">
      <p className="bz-p">{L.lead}</p>
      <ol className="bz-plans">
        {L.plans.map((pl, i) => (
          <li key={pl.name} className="bz-plan" style={{ ['--k' as string]: i }}>
            <span className="bz-plan-n" aria-hidden="true">{i + 1}</span>
            <h4>{pl.name}</h4>
            <p className="bz-plan-ph">{pl.phrase}</p>
            {i > 0 && <p className="bz-plan-all">{copy.pricing.eclipse.all} {L.plans[i - 1].name} +</p>}
            <ul>{pl.points.map((x) => <li key={x}>{x}</li>)}</ul>
          </li>
        ))}
      </ol>
      <ul className="bz-rules">{L.rules.map((r) => <li key={r}>{r}</li>)}</ul>
    </div>
  );
}

/** Volta's order of discounts: each one applies to what the one before left (lote 6.2). */
export function Order({ copy }: { copy: BizCopy }) {
  const V = copy.pricing.volta;
  return (
    <div className="bz-stack">
      <p className="bz-p">{V.lead}</p>
      <ol className="bz-order">
        {PRICING.voltaOrder.map((k, i) => {
          const s = V.steps[k as keyof typeof V.steps];
          return (
            <li key={k} style={{ ['--k' as string]: i }}>
              <span className="bz-order-bar" aria-hidden="true" />
              <b>{s.t}</b>
              <span>{s.d}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function EclipseLevels({ copy }: { copy: BizCopy }) {
  const E = copy.pricing.eclipse;
  return (
    <div className="bz-stack">
      <p className="bz-p">{E.lead} <span className="bz-note">{E.note}</span></p>
      <Ladder levels={E.levels} labels={{ includes: E.includes, who: E.who, all: E.all }} n={PRICING.eclipseLevels} />
      <ul className="bz-rules">{E.rules.map((r) => <li key={r}>{r}</li>)}</ul>
    </div>
  );
}
