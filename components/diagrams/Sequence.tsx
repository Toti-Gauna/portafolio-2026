import type { CSSProperties } from 'react';
import type { SeqCopy, SeqSpec } from '@/lib/diagrams/types';
import { InView } from './InView';
import { Glyph } from './Glyph';
import { TONE } from './tones';
import './diagrams.css';

const W = 1000, TOP = 84, ROW = 58, LANE_W = 196, MARGIN = 110;

/**
 * A sequence diagram: who talks to whom, in order. Desktop: lanes and arrows (SVG, 1000 units wide, shown when the
 * container is ≥ 820 px). Narrow screens: the same messages as a numbered list with «from → to» chips.
 */
export function Sequence({ spec, copy }: { spec: SeqSpec; copy: SeqCopy }) {
  const n = spec.lanes.length;
  const gap = (W - 2 * MARGIN) / (n - 1);
  const X = Object.fromEntries(spec.lanes.map((l, i) => [l.id, MARGIN + i * gap]));
  const H = TOP + spec.msgs.length * ROW + 24;
  const tid = `sq-${spec.id}-t`;
  return (
    <InView as="figure" className="dg sq" aria-labelledby={tid}>
      <div className="dg__head"><h3 id={tid} className="dg__title">{copy.title}</h3></div>
      <div className="dg__canvas">
        <svg className="dg__svg sq__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${copy.title}. ${copy.caption}`}>
          <defs>
            {(['edge', 'coral'] as const).map((t) => (
              <marker key={t} id={`${tid}-${t}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto">
                <path d="M0 0.8L9 5 0 9.2z" fill={t === 'edge' ? '#a7a39a' : TONE.coral} />
              </marker>
            ))}
          </defs>
          {spec.lanes.map((l) => (
            <g key={l.id} className="sq__lane">
              <line x1={X[l.id]} x2={X[l.id]} y1={TOP - 8} y2={H - 8} />
              <rect className="dg__box" x={X[l.id] - LANE_W / 2} y={8} width={LANE_W} height={52} rx={10} />
              <g style={{ color: '#eeeae3' }}><Glyph kind={l.kind} x={X[l.id] - LANE_W / 2 + 14} y={22} tone={TONE.coral} /></g>
              <text className="dg__label" x={X[l.id] - LANE_W / 2 + 48} y={40} fontSize={17}>{copy.lanes[l.id]}</text>
            </g>
          ))}
          {spec.msgs.map((m, i) => {
            const y = TOP + 34 + i * ROW, x1 = X[m.from], x2 = X[m.to];
            const dir = Math.sign(x2 - x1) || 1, label = copy.msgs[m.id];
            const tone = m.tone ? TONE[m.tone] : m.back ? '#a7a39a' : TONE.coral;
            const self = m.from === m.to;
            return (
              <g key={m.id} className="sq__msg-g" style={{ '--o': i } as CSSProperties}>
                {self ? (
                  <path d={`M${x1} ${y - 10}h40v20h-36`} stroke={tone} markerEnd={`url(#${tid}-${m.back ? 'edge' : 'coral'})`} />
                ) : (
                  <line x1={x1 + dir * 6} x2={x2 - dir * 8} y1={y} y2={y} stroke={tone} strokeDasharray={m.back ? '5 5' : undefined} markerEnd={`url(#${tid}-${m.back ? 'edge' : 'coral'})`} />
                )}
                <text x={self ? x1 + 52 : (x1 + x2) / 2} y={self ? y + 5 : y - 10} fontSize={15} textAnchor={self ? 'start' : 'middle'}>
                  <tspan className="sq__num">{i + 1}  </tspan>{label}
                </text>
              </g>
            );
          })}
        </svg>
        <ol className="sq__list">
          {spec.msgs.map((m, i) => (
            <li key={m.id} style={{ '--o': i } as CSSProperties}>
              <span className="dg__n" aria-hidden="true">{i + 1}</span>
              <div>
                <p className="sq__route"><span className="sq__chip">{copy.lanes[m.from]}</span>{m.from !== m.to && <><span>→</span><span className="sq__chip">{copy.lanes[m.to]}</span></>}</p>
                <p className="sq__msg">{copy.msgs[m.id]}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="note dg__caption">{copy.caption}</figcaption>
    </InView>
  );
}
