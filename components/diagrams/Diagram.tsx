import type { CSSProperties } from 'react';
import type { ArchCopy, ArchSpec, Layout } from '@/lib/diagrams/types';
import { edgePath, monoWidth, rect, type Variant } from '@/lib/diagrams/geometry';
import { InView } from './InView';
import { Glyph } from './Glyph';
import { EDGE, TONE } from './tones';
import './diagrams.css';

const FONT = {
  desktop: { label: 18, sub: 15, edge: 15, group: 15, badge: 15, glyph: 1, pad: 16 },
  mobile: { label: 16, sub: 15, edge: 15, group: 15, badge: 15, glyph: 0.84, pad: 11 },
} as const;

export type DiagramUi = { asText: string; legend?: string };

/**
 * An architecture or flow diagram: nodes (boxes with a kind glyph), edges (curves with arrowheads and mono labels)
 * and optional groups. Two hand-placed layouts swap with a container query. On entering the screen the edges draw
 * and the nodes rise; while it stays on screen a packet travels each edge in order. Reduced motion: final state.
 * Accessible: the figure is titled, nodes with a note get a numbered legend, and «read as text» lists every edge.
 */
export function Diagram({ spec, copy, ui, className }: { spec: ArchSpec; copy: ArchCopy; ui: DiagramUi; className?: string }) {
  const n = spec.edges.length;
  const style = { '--cycle': `${(n * 0.55 + 1.6).toFixed(2)}s` } as CSSProperties;
  const notes = spec.nodes.filter((x) => copy.nodes[x.id]?.note);
  const num = new Map(notes.map((x, i) => [x.id, i + 1]));
  const label = (id: string) => copy.nodes[id]?.label ?? id;
  const tid = `dg-${spec.id}-t`;
  return (
    <InView as="figure" live className={`dg${className ? ` ${className}` : ''}`} style={style} aria-labelledby={tid}>
      <div className="dg__head">
        {copy.badge && <p className="dg__badge">{copy.badge}</p>}
        <h3 id={tid} className="dg__title">{copy.title}</h3>
      </div>
      <div className="dg__canvas">
        {(['desktop', 'mobile'] as const).map((v) => (
          <svg key={v} className={`dg__svg dg__svg--${v}`} viewBox={`0 0 ${spec[v].w} ${spec[v].h}`} role="img" aria-label={`${copy.title}. ${copy.caption}`}>
            <Layer spec={spec} copy={copy} layout={spec[v]} v={v} num={num} />
          </svg>
        ))}
      </div>
      {notes.length > 0 && (
        <ol className="dg__legend" aria-label={ui.legend}>
          {notes.map((x) => (
            <li key={x.id} data-node={x.id}><span className="dg__n" aria-hidden="true">{num.get(x.id)}</span><span><b>{label(x.id)}.</b> {copy.nodes[x.id].note}</span></li>
          ))}
        </ol>
      )}
      <details className="dg__text">
        <summary>{ui.asText}</summary>
        <ol>
          {spec.edges.map((e) => (
            <li key={e.id}>{label(e.from)} → {label(e.to)}{copy.edges?.[e.id] ? `: ${copy.edges[e.id]}` : ''}</li>
          ))}
        </ol>
      </details>
      <figcaption className="note dg__caption">{copy.caption}</figcaption>
    </InView>
  );
}

function Layer({ spec, copy, layout, v, num }: { spec: ArchSpec; copy: ArchCopy; layout: Layout; v: Variant; num: Map<string, number> }) {
  const f = FONT[v];
  const tones = Array.from(new Set(spec.edges.map((e) => e.tone ?? 'edge')));
  const mk = (t: string) => `dg-${spec.id}-${v}-a-${t}`;
  const colorOf = (t: string) => (t === 'edge' ? EDGE : TONE[t as keyof typeof TONE]);
  const R = (id: string) => rect(layout.nodes[id], v);
  const paths = spec.edges.map((e) => ({ e, ...edgePath(R(e.from), R(e.to), layout.edges?.[e.id]) }));
  return (
    <>
      <defs>
        {tones.map((t) => (
          <marker key={t} id={mk(t)} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
            <path d="M0 0.8L9 5 0 9.2z" fill={colorOf(t)} />
          </marker>
        ))}
      </defs>
      {spec.groups?.map((g) => {
        const r = layout.groups?.[g.id];
        if (!r) return null;
        return (
          <g key={g.id} className="dg__group">
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="14" />
            <text x={r.x + 14} y={r.y + f.group + 9} fontSize={f.group} fill={g.tone ? TONE[g.tone] : undefined}>{copy.groups?.[g.id]}</text>
          </g>
        );
      })}
      <g className="dg__edges">
        {paths.map(({ e, d }, i) => {
          const c = colorOf(e.tone ?? 'edge');
          return (
            <g key={e.id} style={{ '--o': i } as CSSProperties}>
              <path className="dg__edge" d={d} pathLength={e.dashed ? undefined : 1} stroke={c} strokeDasharray={e.dashed ? undefined : 1} data-dashed={e.dashed || undefined} />
              <path className="dg__arrow" d={d} markerEnd={`url(#${mk(e.tone ?? 'edge')})`} />
              <path className="dg__pkt" d={d} pathLength={1} stroke={e.tone && e.tone !== 'paper' ? TONE[e.tone] : TONE.coral} />
            </g>
          );
        })}
      </g>
      <g className="dg__nodes">
        {spec.nodes.map((x, i) => {
          const r = R(x.id), c = copy.nodes[x.id] ?? { label: x.id };
          const tone = x.tone ? TONE[x.tone] : TONE.coral;
          const gy = r.y + (r.h - 24 * f.glyph) / 2;
          const tx = r.x + f.pad + 24 * f.glyph + (v === 'desktop' ? 12 : 8);
          const n = num.get(x.id);
          return (
            <g key={x.id} className="dg__node" data-node={x.id} data-kind={x.kind} style={{ '--o': i } as CSSProperties}>
              <rect className="dg__box" x={r.x} y={r.y} width={r.w} height={r.h} rx={v === 'desktop' ? 10 : 8} stroke={x.tone ? tone : undefined} strokeOpacity={x.tone ? 0.75 : undefined} strokeDasharray={x.kind === 'external' ? '5 4' : undefined} />
              <g style={{ color: '#eeeae3' }}><Glyph kind={x.kind} x={r.x + f.pad} y={gy} s={f.glyph} tone={tone} /></g>
              {c.sub ? (
                <>
                  <text className="dg__label" x={tx} y={r.y + r.h / 2 - 3} fontSize={f.label}>{c.label}</text>
                  <text className="dg__sub" x={tx} y={r.y + r.h / 2 + f.sub + 1} fontSize={f.sub}>{c.sub}</text>
                </>
              ) : (
                <text className="dg__label" x={tx} y={r.y + r.h / 2 + f.label * 0.35} fontSize={f.label}>{c.label}</text>
              )}
              {n && (
                <g className="dg__badge-n">
                  <circle cx={r.x + r.w} cy={r.y} r={f.badge * 0.78} />
                  <text x={r.x + r.w} y={r.y + f.badge * 0.36} fontSize={f.badge} textAnchor="middle">{n}</text>
                </g>
              )}
            </g>
          );
        })}
      </g>
      <g className="dg__lbls">
        {paths.map(({ e, mid }, i) => {
          const t = copy.edges?.[e.id];
          if (!t || layout.edges?.[e.id]?.hide) return null;
          const w = monoWidth(t, f.edge) + 12, h = f.edge + 10;
          return (
            <g key={e.id} className="dg__lbl" style={{ '--o': i } as CSSProperties}>
              <rect x={mid.x - w / 2} y={mid.y - h / 2} width={w} height={h} rx="4" />
              <text x={mid.x} y={mid.y + f.edge * 0.35} fontSize={f.edge} textAnchor="middle">{t}</text>
            </g>
          );
        })}
      </g>
    </>
  );
}
