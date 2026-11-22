import { type CSSProperties, Fragment, type ReactNode } from 'react';
import { AgentIcon, type AgentId } from '@/components/AgentIcon';
import type esCopy from '@/messages/v2/trailer/es.json';
import { CITY_AT, type FilmShot, type Fmt, MARK, PLAY_AT, RING_AT, STATIONS_AT } from '@/v2/trailer/film';
import { STAMP_IDS, type StampId, stampSvg } from '../kit/stamps';

/**
 * The twenty shots of «Conocer a Ignacio» (lote 8.2). A shot only says what is on stage and when each part enters:
 * `data-a` names its movement (v2/trailer/presets.ts) and `data-at` the beat, from the start of the shot. The film
 * turns that into Web Animations. Sizes and places are in stage units (`--u`), so 16:9 and 9:16 are the same drawing.
 */
export type TrailerCopy = typeof esCopy;
export type FilmData = {
  copy: TrailerCopy;
  /** the language tag that writes the numbers (1.374 / 1,374) */
  lang: string;
  /** by case: its three verbs, the name of its state and its colour */
  verbs: Record<string, string[]>; state: Record<string, string>; color: Record<string, string>;
  stations: string[]; agents: string[];
  /** by shot: the still of its panel(s) and its clip */
  media: Record<string, { still: string; still2?: string; clip?: string }>;
};
type P = { s: FilmShot; fmt: Fmt; d: FilmData };
type Opt = { n?: number; rx?: number; ry?: number; hold?: number };
const a = (name: string, at = 0, o: Opt = {}) => ({ 'data-a': name, 'data-at': at, 'data-n': o.n, 'data-rx': o.rx, 'data-ry': o.ry, 'data-hold': o.hold });
const U = (n: number) => `calc(var(--u) * ${n})`;
const place = (x: number, y: number): CSSProperties => ({ left: U(x), top: U(y) });

/** a sentence that comes down word by word */
const W = ({ text, at, cls, step = 0.16 }: { text: string; at: number; cls: string; step?: number }) => (
  <p className={cls}>{text.split(' ').map((w, i) => <Fragment key={i}>{i ? ' ' : ''}<span className="tf-w" {...a('drop', at + i * step)}>{w}</span></Fragment>)}</p>
);
const Tag = ({ name, when, at }: { name: string; when?: string; at: number }) => (
  <p className="tf-tag" {...a('tag', at)}><b>{name}</b>{when && <span>{when}</span>}</p>
);
/** pills that light up one after the other; the last one stays lit */
const Pills = ({ items, at, step = 1, seq = true }: { items: string[]; at: number; step?: number; seq?: boolean }) => (
  <p className="tf-pills">
    {items.map((v, i) => {
      const last = i === items.length - 1;
      return <span key={v} className="tf-pill" {...a('pop', at + i * step)}>{v}{(seq || last) && <span className="tf-pill-on" {...a('lit', at + i * step + 0.2, { hold: seq && !last ? step - 0.2 : 0 })}>{v}</span>}</span>;
    })}
  </p>
);
const State = ({ label, at }: { label: string; at: number }) => <span className="tf-state" {...a('pop', at)}>{label}</span>;
const Stamp = ({ id, at }: { id: StampId; at: number }) => (
  <span className="tf-stamp" {...a('stamp', at)}><svg viewBox="0 0 240 300"><use href={`#tfst-${id}`} /></svg><span className="tf-post" /></span>
);
/** a glass panel turned in space: it arrives from the depth, drifts while the shot lasts and a light crosses it once */
function Glass({ children, at, ry = -14, rx = 5, cap, cls = '', hold = 8, mode = 'glass' }: { children: ReactNode; at: number; ry?: number; rx?: number; cap?: string; cls?: string; hold?: number; mode?: 'glass' | 'push' }) {
  return (
    <figure className={`tf-glass ${cls}`} {...a(mode, at, { ry, rx })}>
      <div className="tf-glass-in" {...a('drift', at, { ry, hold })}>
        <span className="tf-chrome"><i /><i /><i /></span>
        <div className="tf-screen">{children}<span className="tf-glint" {...a('glint', at)} /></div>
      </div>
      {cap && <figcaption {...a('fade', at + 1)}>{cap}</figcaption>}
    </figure>
  );
}
/** the real clip of a case: its still first, the video over it when it plays */
const Clip = ({ m }: { m: FilmData['media'][string] }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <><img src={m.still} alt="" decoding="async" />{m.clip && <video data-src={m.clip} muted playsInline loop preload="none" />}</>
);
const Bars = ({ n, head = false }: { n: number; head?: boolean }) => (
  <span className={`tf-bars${head ? ' h' : ''}`}>{Array.from({ length: n }, (_, i) => <i key={i} style={{ '--w': `${[92, 64, 78, 48, 86, 56][i % 6]}%` } as CSSProperties} />)}</span>
);
/** the mark without its dot: the dot of the film is its dot */
const Mark = ({ box, draw, at = 0 }: { box: readonly [number, number, number]; draw?: boolean; at?: number }) => (
  <svg className="tf-mark" viewBox="0 0 48 48" style={{ ...place(box[0], box[1]), width: U(box[2]) }} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" {...(draw ? a('hit', at) : {})}>
    <path d="M11 16v25" pathLength={1} {...(draw ? a('draw', at + 0.2, { hold: 1 }) : {})} />
    <path d="M41 21a13.5 13.5 0 1 0 1.5 12H30" pathLength={1} {...(draw ? a('draw', at + 0.6, { hold: 1.8 }) : {})} />
  </svg>
);
const Count = ({ value, at, h }: { value: string; at: number; h: number }) => (
  <b className="tf-num" style={{ '--h': h } as CSSProperties}>
    {[...value].map((ch, i) => /\d/.test(ch)
      ? <span key={i} className="tf-dg"><span {...a('roll', at + i * 0.12, { n: Number(ch) + 10, hold: h })}>{Array.from({ length: Number(ch) + 11 }, (_, k) => <i key={k}>{k % 10}</i>)}</span></span>
      : <span key={i}>{ch}</span>)}
  </b>
);

// The coast of Mar del Plata, as in the published trailer (north up, the Atlantic to the east): map units.
const COAST: [number, number][] = [[780, -560], [700, -380], [630, -200], [570, -40], [522, 90], [488, 200], [468, 300], [470, 370], [484, 420], [502, 466], [516, 516], [508, 554], [480, 584], [458, 612], [446, 646], [436, 690], [422, 730], [400, 790], [372, 860], [336, 940], [290, 1030], [232, 1130], [160, 1240], [80, 1360], [-20, 1500], [-90, 1600]];
const LINE = COAST.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
const BREAK = ['M447 640C472 639 495 643 507 653C517 663 519 679 517 695', 'M434 702C456 703 480 706 499 714'];
/** the viewBox puts the city where the dot lands (CITY_AT) and has the shape of the stage */
const MAP_BOX: Record<Fmt, string> = { w: '40 128 1216 684', t: '117 -42 576 1024' };

function Mdp({ s, fmt, d }: P) {
  const c = d.copy.shots.mdp, q = s.cues, [cx, cy] = CITY_AT[fmt];
  return (
    <>
      <svg className="tf-map" viewBox={MAP_BOX[fmt]} preserveAspectRatio="xMidYMid slice">
        <path d={`${LINE}L-2600 1600L-2600 -560Z`} fill="#0f0b2c" {...a('fade', 1)} />
        <g fill="none" stroke="#9a95b8" strokeOpacity=".12" strokeWidth="2" {...a('fade', 2)}>{[60, 130, 210].map((x) => <path key={x} d={LINE} transform={`translate(${x} 0)`} />)}</g>
        <path d={LINE} fill="none" stroke="#c9c5de" strokeWidth="3" strokeLinejoin="round" pathLength={1} className="tf-drawn" {...a('draw', 0.6, { hold: 2.4 })} />
        <g fill="none" stroke="#c9c5de" strokeWidth="3" strokeLinecap="round" {...a('fade', 2.6)}>{BREAK.map((p) => <path key={p} d={p} />)}</g>
      </svg>
      <span className="tf-open-mark" {...a('out', 1.2)}><Mark box={MARK.open[fmt]} /></span>
      <span className="tf-rings" style={place(cx, cy)}><i {...a('ring', 3)} /><i {...a('ring', 3.3)} /><i {...a('ring', 3.6)} /></span>
      <span className="tf-sea" {...a('fade', 3.4)}>{c.sea}</span>
      <div className="tf-copy tf-mdp"><p className="tf-kick" {...a('rise', q.kicker)}>{c.kicker}</p><W cls="tf-line" text={c.line} at={q.line} /></div>
    </>
  );
}
function First({ s, fmt, d }: P) {
  const c = d.copy.shots.first, q = s.cues, [px, py] = PLAY_AT[fmt];
  return (
    <>
      <div className="tf-split">
        <div className="tf-copy"><p className="tf-kick" {...a('rise', q.kicker)}>{c.kicker}</p><W cls="tf-line" text={c.line} at={q.line} /></div>
        <div className="tf-vis">
          <Glass at={0.6} ry={-16} rx={6} hold={7}>
            <div className="tf-retro"><span className="tf-retro-h"><i /><i /><i /></span><div className="tf-tiles">{['▲', '●', '■', '◆', '✚', '★'].map((g, i) => <span key={g} style={{ '--i': i } as CSSProperties} {...a('pop', 1.6 + i * 0.4)}>{g}</span>)}</div></div>
          </Glass>
        </div>
      </div>
      <span className="tf-play" style={place(px - 3, py - 3.4)} {...a('pop', 0.2)}>{c.button}</span>
    </>
  );
}
function Tach({ s, d }: P) {
  const c = d.copy.shots.tach, q = s.cues;
  return (
    <>
      <div className="tf-split">
        <div className="tf-copy"><Tag name={c.name} when={c.when} at={q.name} /><W cls="tf-line" text={c.line} at={q.line} /><Pills items={c.pills} at={q.pills} seq={false} /></div>
        <div className="tf-vis tf-trio">
          <Glass at={q.pills} ry={-18} cls="a" hold={4}><div className="tf-ui"><Bars n={1} head /><div className="tf-rows"><Bars n={5} /></div></div></Glass>
          <Glass at={q.pills + 1} ry={-18} cls="b" hold={3}><div className="tf-ui c"><Bars n={2} head /><span className="tf-btn" /></div></Glass>
          <Glass at={q.pills + 2} ry={-18} cls="c phone" hold={2}><div className="tf-ui"><Bars n={1} head /><span className="tf-card" /><Bars n={3} /></div></Glass>
          <span className="tf-cap" {...a('fade', q.pills + 2)}>{c.label}</span>
        </div>
      </div>
      <Stamp id="tach" at={q.stamp} />
    </>
  );
}
function Ada({ s, d }: P) {
  const c = d.copy.shots.ada, q = s.cues;
  return (
    <>
      <div className="tf-split">
        <div className="tf-copy"><Tag name={c.name} when={c.when} at={q.name} /><W cls="tf-line" text={c.line} at={q.line} /><Pills items={c.pills} at={q.pills} seq={false} /><p className="tf-after" {...a('rise', q.after)}>{c.after}</p></div>
        <div className="tf-vis">
          <Glass at={1.4} ry={-12} rx={4} hold={10}>
            <div className="tf-board"><code {...a('fade', 3)}>console.log(<b>&apos;{c.board}&apos;</b>)</code><span {...a('fade', 3.6)}><Bars n={3} /></span><span className="tf-out" {...a('rise', 5)}>› {c.board}</span></div>
          </Glass>
          <span className="tf-class">{Array.from({ length: 5 }, (_, i) => <i key={i} {...a('rise', 2 + i * 0.3)} />)}</span>
        </div>
      </div>
      <Stamp id="ada" at={q.stamp} />
    </>
  );
}
function Tuenti({ s, d }: P) {
  const c = d.copy.shots.tuenti, q = s.cues;
  return (
    <>
      <div className="tf-split">
        <div className="tf-copy"><Tag name={c.name} when={c.when} at={q.name} /><W cls="tf-line" text={c.line} at={q.line} /><Pills items={d.verbs.tuenti} at={q.verbs} /></div>
        <div className="tf-vis"><Glass at={1} ry={-12} cls="bare" cap={c.label} hold={6}><Clip m={d.media.tuenti} /></Glass></div>
      </div>
      <Stamp id="tuenti" at={q.stamp} />
    </>
  );
}
const Ia = ({ s, d }: P) => (<><span className="tf-grid" {...a('fade', 0)} /><div className="tf-center"><W cls="tf-line xl" text={d.copy.shots.ia.line} at={s.cues.line + 0.6} step={0.3} /></div></>);
function Complia({ s, d }: P) {
  const c = d.copy.shots.complia, q = s.cues;
  return (
    <>
      <div className="tf-split">
        <div className="tf-copy"><Tag name={c.name} when={c.when} at={q.name} /><Pills items={d.verbs.complia} at={q.verbs} step={2} /></div>
        <div className="tf-vis"><Glass at={0.3} ry={-20} rx={7} cap={c.label} hold={7.5}><Clip m={d.media.complia} /></Glass></div>
      </div>
      <Stamp id="complia" at={q.stamp} />
    </>
  );
}
function CompliaState({ s, d }: P) {
  const c = d.copy.shots['complia-state'], q = s.cues;
  return (
    <div className="tf-split wide">
      <div className="tf-vis"><Glass at={0} ry={6} rx={2} cls="big" cap={c.label} hold={12} mode="push"><Clip m={d.media['complia-state']} /></Glass></div>
      <div className="tf-copy"><W cls="tf-line s" text={c.line} at={q.line + 0.6} /><p className="tf-after" {...a('rise', q.fact)}>{c.fact}</p><State label={d.state.complia} at={q.status} /></div>
    </div>
  );
}
function Supernova({ s, d }: P) {
  const c = d.copy.shots.supernova, q = s.cues;
  return (
    <>
      <div className="tf-split">
        <div className="tf-copy"><Tag name={c.name} when={c.when} at={q.name} /><Pills items={d.verbs.supernova} at={q.verbs} /><State label={d.state.supernova} at={q.verbs + 3} /></div>
        <div className="tf-vis"><Glass at={0.3} ry={-16} cap={c.label} hold={7.5}><Clip m={d.media.supernova} /></Glass></div>
      </div>
      <Stamp id="supernova" at={q.stamp} />
    </>
  );
}
const OWN = ['eclipse', 'volta', 'velmar', 'dentalos', 'kinetic', 'games'] as const;
function Own({ s, fmt, d }: P) {
  const wide = fmt === 'w';
  // six lanes leave the dot: to the right in 16:9, down in 9:16
  const lane = (i: number) => (wide ? `M12 45C50 45 60 ${12 + i * 13.2} 104 ${12 + i * 13.2}` : `M45 22C45 50 ${12 + i * 13.2} 56 ${12 + i * 13.2} 82`);
  return (
    <>
      <svg className="tf-fork" viewBox={wide ? '0 0 160 90' : '0 0 90 160'}>{OWN.map((n, i) => <path key={n} d={lane(i)} fill="none" stroke={d.color[n]} strokeWidth=".7" pathLength={1} className="tf-drawn" {...a('draw', 0.3 + i * 0.25, { hold: 1.6 })} />)}</svg>
      <ul className="tf-lanes">{OWN.map((n, i) => <li key={n} style={{ '--i': i, '--c': d.color[n] } as CSSProperties} ><span {...a('pop', 1.6 + i * 0.25)}><i />{d.copy.shots[n].name}</span></li>)}</ul>
      <div className="tf-copy tf-own"><W cls="tf-line" text={d.copy.shots.own.line} at={s.cues.line + 0.4} /></div>
    </>
  );
}
function Eclipse({ s, d }: P) {
  const c = d.copy.shots.eclipse, q = s.cues, m = d.media.eclipse;
  return (
    <>
      <div className="tf-split">
        <div className="tf-copy">
          <Tag name={c.name} at={q.name} /><p className="tf-sub" {...a('rise', q.line)}>{c.line}</p><Pills items={d.verbs.eclipse} at={q.verbs} />
          <p className="tf-count" {...a('rise', q.count)}><Count value={s.count!.to.toLocaleString(d.lang)} at={q.count} h={8} /><span>{c.count}<small>{c.date}</small></span></p>
          <State label={d.state.eclipse} at={q.count + 2} />
        </div>
        <div className="tf-vis tf-duo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Glass at={0.2} ry={-22} rx={6} cls="back" hold={11}><img src={m.still2} alt="" decoding="async" /></Glass>
          <Glass at={1} ry={-14} rx={5} cls="front" cap={c.label} hold={10}><Clip m={m} /></Glass>
        </div>
      </div>
      <Stamp id="eclipse" at={q.stamp} />
    </>
  );
}
function Project({ s, d }: P) {
  const id = s.id as 'volta', c = d.copy.shots[id], q = s.cues, flip = ['velmar', 'kinetic'].includes(s.id);
  const copy = <div className="tf-copy" key="c"><p className="tf-name" {...a('slam', q.name + 0.15)}>{c.name}</p><p className="tf-sub l" {...a('rise', q.line)}>{c.line}</p><State label={d.state[s.id]} at={q.state} /></div>;
  const vis = <div className="tf-vis" key="v"><Glass at={0.1} ry={flip ? 14 : -14} cls="dark" hold={3.6}><Clip m={d.media[s.id]} /></Glass></div>;
  return <div className={`tf-split${flip ? ' flip' : ''}`}>{flip ? [vis, copy] : [copy, vis]}</div>;
}
function Agents({ s, fmt, d }: P) {
  const c = d.copy.shots.agents, q = s.cues, [cx, cy] = RING_AT[fmt];
  return (
    <>
      <div className="tf-copy tf-agents"><W cls="tf-line" text={c.line} at={q.line + 0.4} /><p className="tf-count big" {...a('rise', q.count)}><Count value={String(s.count!.to)} at={q.count} h={17} /><span>{c.count}</span></p></div>
      <ul className="tf-ring" style={place(cx, cy)}>{d.agents.map((id, i) => <li key={id} style={{ '--i': i } as CSSProperties}><span {...a('pop', 1.5 + i * 0.5)}><AgentIcon id={id as AgentId} /></span></li>)}</ul>
    </>
  );
}
function Gate({ s, fmt, d }: P) {
  const at = STATIONS_AT[fmt];
  return (
    <>
      <span className="tf-rail" style={fmt === 'w' ? { ...place(at[0][0], at[0][1]), width: U(at[6][0] - at[0][0]) } : { ...place(at[0][0], at[0][1]), height: U(at[6][1] - at[0][1]) }} {...a('fade', 0)} />
      <ol className="tf-stations">{d.stations.map((n, i) => <li key={n} className={i === 5 ? 'on' : undefined} style={place(at[i][0], at[i][1])} {...a('pop', i === 6 ? 6 : i * 0.5)}><b>{String(i + 1).padStart(2, '0')}</b><span>{n}</span></li>)}</ol>
      <div className="tf-copy tf-gate"><W cls="tf-line" text={d.copy.shots.gate.line} at={s.cues.line} /></div>
    </>
  );
}
function Drive({ s, d }: P) {
  const c = d.copy.shots.drive, q = s.cues;
  return (
    <div className="tf-split">
      <div className="tf-copy"><W cls="tf-line" text={c.line} at={q.line + 0.4} /><Pills items={c.pills} at={q.pills} seq={false} /></div>
      <div className="tf-vis"><span className="tf-fan">{STAMP_IDS.map((id, i) => <svg key={id} viewBox="0 0 240 300" {...a('fan', q.stamps + i * 0.25, { n: i })}><use href={`#tfst-${id}`} /></svg>)}</span></div>
    </div>
  );
}
function End({ s, fmt, d }: P) {
  const c = d.copy.shots.end, q = s.cues;
  return (
    <>
      <Mark box={MARK.end[fmt]} draw at={q.mark} />
      <div className="tf-endcopy"><p className="tf-name" {...a('slam', q.name)}>{c.name}</p><p className="tf-sub" {...a('rise', q.line)}>{c.line}</p><p className="tf-links" {...a('rise', q.links)}><span>{c.mail}</span><span>{c.linkedin}</span></p></div>
    </>
  );
}

const BY_ID: Record<string, (p: P) => ReactNode> = {
  mdp: Mdp, first: First, tach: Tach, ada: Ada, tuenti: Tuenti, ia: Ia, complia: Complia, 'complia-state': CompliaState, supernova: Supernova,
  own: Own, eclipse: Eclipse, volta: Project, velmar: Project, dentalos: Project, kinetic: Project, games: Project, agents: Agents, gate: Gate, drive: Drive, end: End,
};
export const SHOT_IDS = Object.keys(BY_ID);
export const ShotBody = (p: P) => BY_ID[p.s.id](p);
/** the six stamps, drawn once: the shots point at them */
export const StampSprite = () => (
  <svg className="tf-sprite" width="0" height="0" aria-hidden="true">{STAMP_IDS.map((id) => <symbol key={id} id={`tfst-${id}`} viewBox="0 0 240 300" dangerouslySetInnerHTML={{ __html: stampSvg(id) }} />)}</svg>
);
