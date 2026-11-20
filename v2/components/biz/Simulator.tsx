'use client';

import { type CSSProperties, useId, useState } from 'react';
import { UNIT } from './data';
import { campaignEconomics, landedCost, marginPct, marginState, type PriceEnding, proposedPrice, recipeCost, suggestedPrice } from './econ';
import type { BizCopy } from './copy';

type U = BizCopy['unit'];
const money = (tag: string) => { const f = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }); return (n: number) => `$ ${f.format(n)}`; };

/** One input: a range with its value written beside it (the value is real text; the range is the control). */
function Field({ label, value, min, max, step, unit, tag, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; tag?: string; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className="bz-field">
      <label htmlFor={id}>{label}</label>
      <output htmlFor={id}>{unit === '$' ? `$ ${value.toLocaleString(tag)}` : `${value}${unit}`}</output>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.currentTarget.value))} />
    </div>
  );
}

/** A result: a big number with its name. `tone` marks the one the simulator is about. */
const Out = ({ k, v, tone }: { k: string; v: string; tone?: 'main' | 'warn' }) => (
  <div className="bz-out" data-tone={tone}><span>{k}</span><b>{v}</b></div>
);

/** A bar that splits a price into its parts (widths only: the numbers are next to it). */
const Bar = ({ parts }: { parts: { v: number; c: string; k: string }[] }) => {
  const total = parts.reduce((s, p) => s + Math.max(0, p.v), 0) || 1;
  return (
    <div className="bz-bar" aria-hidden="true">
      {parts.map((p) => <i key={p.k} style={{ width: `${(Math.max(0, p.v) / total) * 100}%`, background: p.c } as CSSProperties} title={p.k} />)}
    </div>
  );
};

/**
 * Velmar (lote 6.2): a made-to-order object priced from its recipe — materials, machine minutes and hand minutes —
 * with the formulas of its panel («Costos y margen»). Two of its sample recipes as presets.
 */
export function VelmarSim({ u, tag }: { u: U; tag: string }) {
  const D = UNIT.velmar, L = u.velmar, $ = money(tag);
  const [s, set] = useState<{ materials: number; machineMin: number; handMin: number; machineHour: number; handHour: number; margin: number; preset: string }>({ ...D.presets.plate, machineHour: D.machineHour, handHour: D.handHour, margin: D.margin, preset: 'plate' });
  const r = recipeCost(s), price = suggestedPrice(r.total, s.margin), profit = price - r.total;
  const f = (k: keyof typeof s) => (v: number) => set((o) => ({ ...o, [k]: v, preset: '' }));
  return (
    <div className="bz-sim">
      <div className="bz-sim-in">
        <div className="bz-presets" role="group" aria-label={L.title}>
          {(Object.keys(D.presets) as (keyof typeof D.presets)[]).map((k) => (
            <button key={k} type="button" aria-pressed={s.preset === k} onClick={() => set((o) => ({ ...o, ...D.presets[k], preset: k }))}>{L.presets[k]}</button>
          ))}
        </div>
        <Field label={L.fields.materials} value={s.materials} min={0} max={20000} step={25} unit="$" tag={tag} onChange={f('materials')} />
        <Field label={L.fields.machineMin} value={s.machineMin} min={0} max={600} step={5} unit=" min" onChange={f('machineMin')} />
        <Field label={L.fields.machineHour} value={s.machineHour} min={0} max={6000} step={100} unit="$" tag={tag} onChange={f('machineHour')} />
        <Field label={L.fields.handMin} value={s.handMin} min={0} max={600} step={5} unit=" min" onChange={f('handMin')} />
        <Field label={L.fields.handHour} value={s.handHour} min={0} max={12000} step={100} unit="$" tag={tag} onChange={f('handHour')} />
        <Field label={L.fields.margin} value={s.margin} min={0} max={90} step={1} unit=" %" onChange={f('margin')} />
      </div>
      <div className="bz-sim-out" aria-live="polite">
        <Out k={L.out.cost} v={$(r.total)} />
        <Out k={L.out.price} v={$(price)} tone="main" />
        <Out k={L.out.profit} v={$(profit)} />
        <Bar parts={[{ k: L.out.materials, v: r.materials, c: 'var(--bz-c1)' }, { k: L.out.machine, v: r.machine, c: 'var(--bz-c2)' }, { k: L.out.hand, v: r.hand, c: 'var(--bz-c3)' }, { k: L.out.profit, v: profit, c: 'var(--c)' }]} />
        <ul className="bz-legend">
          <li style={{ '--l': 'var(--bz-c1)' } as CSSProperties}>{L.out.materials} {$(r.materials)}</li>
          <li style={{ '--l': 'var(--bz-c2)' } as CSSProperties}>{L.out.machine} {$(r.machine)}</li>
          <li style={{ '--l': 'var(--bz-c3)' } as CSSProperties}>{L.out.hand} {$(r.hand)}</li>
          <li style={{ '--l': 'var(--c)' } as CSSProperties}>{L.out.profit} {$(profit)}</li>
        </ul>
        <p className="bz-rule">{L.rule}</p>
      </div>
    </div>
  );
}

/** Volta (lote 6.2): landed cost (supplier + packaging) and the price that keeps the target margin, with the
 *  commercial rounding of its supplier-list import. */
export function VoltaSim({ u, tag }: { u: U; tag: string }) {
  const D = UNIT.volta, L = u.volta, $ = money(tag);
  const [s, set] = useState({ supplier: D.supplier, packaging: D.packaging.reduce((a, b) => a + b, 0), margin: D.margin, ending: '900' as PriceEnding });
  const landed = landedCost(s.supplier, s.packaging), suggested = suggestedPrice(landed, s.margin), proposed = proposedPrice(landed, s.margin, s.ending);
  const real = marginPct(proposed, landed) ?? 0, state = marginState(real, s.margin);
  return (
    <div className="bz-sim">
      <div className="bz-sim-in">
        <Field label={L.fields.supplier} value={s.supplier} min={0} max={100000} step={100} unit="$" tag={tag} onChange={(v) => set((o) => ({ ...o, supplier: v }))} />
        <Field label={L.fields.packaging} value={s.packaging} min={0} max={5000} step={2} unit="$" tag={tag} onChange={(v) => set((o) => ({ ...o, packaging: v }))} />
        <Field label={L.fields.margin} value={s.margin} min={1} max={90} step={1} unit=" %" onChange={(v) => set((o) => ({ ...o, margin: v }))} />
        <div className="bz-field">
          <span className="bz-field-k">{L.fields.ending}</span>
          <div className="bz-presets" role="group" aria-label={L.fields.ending}>
            {(['900', '500', '100'] as PriceEnding[]).map((e) => <button key={e} type="button" aria-pressed={s.ending === e} onClick={() => set((o) => ({ ...o, ending: e }))}>{L.endings[e]}</button>)}
          </div>
        </div>
      </div>
      <div className="bz-sim-out" aria-live="polite">
        <Out k={L.out.landed} v={$(landed)} />
        <Out k={L.out.suggested} v={$(suggested)} />
        <Out k={L.out.proposed} v={$(proposed)} tone="main" />
        <Out k={L.out.margin} v={`${real} % · ${L.states[state]}`} tone={state === 'ok' ? undefined : 'warn'} />
        <Bar parts={[{ k: L.out.landed, v: landed, c: 'var(--bz-c2)' }, { k: L.out.margin, v: proposed - landed, c: 'var(--c)' }]} />
        <p className="bz-rule">{L.rule}</p>
      </div>
    </div>
  );
}

/** DentalOS (lote 6.2): how many attentions cover a campaign — contribution, break-even and projection, with the
 *  numbers of the repo's own test as the starting scenario. */
export function DentalSim({ u, tag }: { u: U; tag: string }) {
  const L = u.dentalos, $ = money(tag);
  const [s, set] = useState({ ...UNIT.dentalos });
  const e = campaignEconomics(s);
  const f = (k: keyof typeof s) => (v: number) => set((o) => ({ ...o, [k]: v }));
  const dots = Math.min(40, Math.max(e.projectedAttentions, e.breakevenAttentions ?? 0, 1));
  return (
    <div className="bz-sim">
      <div className="bz-sim-in">
        <Field label={L.fields.listPrice} value={s.listPrice} min={0} max={50000} step={100} unit="$" tag={tag} onChange={f('listPrice')} />
        <Field label={L.fields.discount} value={Math.min(s.discount, s.listPrice)} min={0} max={s.listPrice} step={100} unit="$" tag={tag} onChange={f('discount')} />
        <Field label={L.fields.serviceCost} value={s.serviceCost} min={0} max={50000} step={100} unit="$" tag={tag} onChange={f('serviceCost')} />
        <Field label={L.fields.otherVariable} value={s.otherVariable} min={0} max={10000} step={50} unit="$" tag={tag} onChange={f('otherVariable')} />
        <Field label={L.fields.fixedCost} value={s.fixedCost} min={0} max={50000} step={100} unit="$" tag={tag} onChange={f('fixedCost')} />
        <Field label={L.fields.audience} value={s.audience} min={0} max={200} step={1} unit="" onChange={f('audience')} />
        <Field label={L.fields.costPerContact} value={s.costPerContact} min={0} max={1000} step={5} unit="$" tag={tag} onChange={f('costPerContact')} />
        <Field label={L.fields.responsePct} value={s.responsePct} min={0} max={100} step={1} unit=" %" onChange={f('responsePct')} />
      </div>
      <div className="bz-sim-out" aria-live="polite">
        <Out k={L.out.contribution} v={`${$(e.unit.contribution)}${e.unit.contributionPct !== null ? ` · ${Math.round(e.unit.contributionPct * 1000) / 10} %` : ''}`} />
        <Out k={L.out.campaign} v={$(e.campaignCost)} />
        <Out k={L.out.breakeven} v={e.breakevenAttentions === null ? '—' : String(e.breakevenAttentions)} tone="main" />
        <Out k={L.out.projected} v={String(e.projectedAttentions)} />
        <Out k={L.out.result} v={$(e.projectedResult)} tone={e.projectedResult < 0 ? 'warn' : undefined} />
        <div className="bz-dots" aria-hidden="true">
          {Array.from({ length: dots }, (_, i) => <i key={i} data-be={e.breakevenAttentions !== null && i < e.breakevenAttentions ? '' : undefined} data-pr={i < e.projectedAttentions ? '' : undefined} />)}
        </div>
        {e.breakevenAttentions === null && <p className="bz-rule">{L.none}</p>}
        <p className="bz-rule">{L.rule}</p>
      </div>
    </div>
  );
}
