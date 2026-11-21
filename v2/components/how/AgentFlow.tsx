'use client';

import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AgentIcon, type AgentId } from '@/components/AgentIcon';
import { AGENTS, type EdgeKey, FLOW_STEP_MS, STATIONS, type StationId, WALK } from './flow';

type Node = { label: string; sub: string; note: string };
export type FlowLabels = {
  flowLabel: string; agentsLabel: string; follow: string; pause: string; replay: string; step: string; of: string;
  acts: string; here: string; carries: string; skills: string;
  nodes: Record<StationId, Node>; edges: Record<EdgeKey, string>; agents: Record<AgentId, { name: string; role: string }>;
};
type Pick = { kind: 'station'; id: StationId } | { kind: 'agent'; id: AgentId };

/**
 * The system as a living diagram (lote 7.3): the seven stations of «Cómo viaja un cambio» and the eleven agents
 * under them. Choosing an agent lights the station where it works and opens its card (its role, where it acts);
 * choosing a station opens its card and lights the agents that work there. «Seguir un cambio» walks a change
 * through the stations, one step every FLOW_STEP_MS: a token slides to the station (transform) and the card says
 * what it carries; QA fails it once and sends it back, then the human gate lets it out. It stops at «Publicar» and
 * pauses off screen. Arrows move between stations and between agents; with reduced motion the token jumps.
 */
export function AgentFlow({ labels: L }: { labels: FlowLabels }) {
  const [pick, setPick] = useState<Pick>({ kind: 'station', id: 'roles' });
  const [step, setStep] = useState(-1);
  const [walk, setWalk] = useState<'idle' | 'play' | 'done'>('idle');
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (walk !== 'play') return;
    const t = window.setTimeout(() => {
      if (step < WALK.length - 1) { setStep(step + 1); setPick({ kind: 'station', id: WALK[step + 1].at }); } else setWalk('done');
    }, step < 0 ? 0 : FLOW_STEP_MS);
    return () => window.clearTimeout(t);
  }, [walk, step]);
  useEffect(() => {
    const el = root.current;
    if (!el || walk !== 'play') return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setWalk('idle'); }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [walk]);

  const choose = (p: Pick) => { setWalk('idle'); setStep(-1); setPick(p); };
  const toggle = () => {
    if (walk === 'play') { setWalk('idle'); return; }
    if (walk === 'done' || step >= WALK.length - 1) setStep(-1);
    setWalk('play');
  };
  const station: StationId = pick.kind === 'station' ? pick.id : AGENTS.find((a) => a.id === pick.id)!.at;
  const lit = (a: { id: AgentId; at: StationId }) => (pick.kind === 'agent' ? a.id === pick.id : a.at === pick.id);
  const moving = step >= 0;
  const cur = moving ? WALK[step] : null;

  const roving = (e: KeyboardEvent, sel: string) => {
    const k = e.key;
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(k)) return;
    e.preventDefault();
    const all = [...(root.current?.querySelectorAll<HTMLButtonElement>(sel) ?? [])];
    const i = all.indexOf(e.currentTarget as HTMLButtonElement);
    const j = k === 'Home' ? 0 : k === 'End' ? all.length - 1 : (i + (k === 'ArrowRight' || k === 'ArrowDown' ? 1 : -1) + all.length) % all.length;
    all[j]?.focus();
    all[j]?.click();
  };

  const card = (() => {
    if (pick.kind === 'agent') {
      const a = L.agents[pick.id], at = AGENTS.find((x) => x.id === pick.id)!.at;
      return (
        <>
          <p className="af-k"><span className="af-ico"><AgentIcon id={pick.id} /></span>{L.agentsLabel}</p>
          <h3>{a.name}</h3>
          <p className="af-text">{a.role}</p>
          <p className="af-meta"><b>{L.acts}:</b> {L.nodes[at].label} · {L.nodes[at].sub}</p>
          <p className="af-meta">{L.skills}</p>
        </>
      );
    }
    const n = L.nodes[pick.id], here = AGENTS.filter((a) => a.at === pick.id);
    return (
      <>
        <p className="af-k">{moving ? `${L.step} ${step + 1} ${L.of} ${WALK.length}` : L.flowLabel}</p>
        <h3>{n.label} <span>· {n.sub}</span></h3>
        {cur?.edge && <p className="af-carry" data-fail={cur.edge === 'fail' ? '' : undefined}><b>{L.carries}:</b> {L.edges[cur.edge]}</p>}
        <p className="af-text">{n.note}</p>
        {here.length > 0 && <p className="af-meta"><b>{L.here}:</b> {here.map((a) => L.agents[a.id].name).join(', ')}</p>}
      </>
    );
  })();

  const si = STATIONS.indexOf(cur?.at ?? station);
  return (
    <div ref={root} className="af" data-walk={walk}>
      <div className="af-track" role="group" aria-label={L.flowLabel} style={{ '--n': STATIONS.length, '--at': si } as CSSProperties}>
        <span className="af-token" aria-hidden="true" data-on={moving ? '' : undefined} data-fail={cur?.edge === 'fail' ? '' : undefined} />
        <ol className="af-stations">
          {STATIONS.map((id, i) => (
            <li key={id} data-id={id}>
              <button
                type="button" className="af-st" aria-pressed={pick.kind === 'station' && pick.id === id} data-lit={station === id ? '' : undefined} data-gate={id === 'gate' ? '' : undefined}
                aria-controls="af-card" onClick={() => choose({ kind: 'station', id })} onKeyDown={(e) => roving(e, '.af-st')}
              >
                <b aria-hidden="true">{String(i + 1).padStart(2, '0')}</b>
                <span className="af-st-t">{L.nodes[id].label}</span>
                <span className="af-st-s">{L.nodes[id].sub}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="af-back" aria-hidden="true" data-on={cur?.edge === 'fail' ? '' : undefined}><i />{L.edges.fail}</span>
      </div>

      <div className="af-agents">
        <h3 className="af-agents-h">{L.agentsLabel}</h3>
        <ul>
          {AGENTS.map((a) => (
            <li key={a.id} data-at={a.at}>
              <button type="button" className="af-ag" aria-pressed={pick.kind === 'agent' && pick.id === a.id} data-lit={lit(a) ? '' : undefined} aria-controls="af-card"
                onClick={() => choose({ kind: 'agent', id: a.id })} onKeyDown={(e) => roving(e, '.af-ag')}>
                <span className="af-ico"><AgentIcon id={a.id} /></span>
                <span>{L.agents[a.id].name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="af-foot">
        <div id="af-card" className="af-card" aria-live="polite">{card}</div>
        <button type="button" className="ui-btn ui-btn--primary ui-btn--md af-follow" aria-pressed={walk === 'play'} onClick={toggle}>
          <span>{walk === 'play' ? L.pause : walk === 'done' ? L.replay : L.follow}</span>
        </button>
      </div>
    </div>
  );
}
