import type { CaseDef } from './types';

/** The agentic system: «un sistema agéntico, dividido en partes» (11 agents, skills on demand, human gates).
 *  Facts: scratchpad facts/agents.md (agents repo at 2f73607, read on 28/10/2026; gates and evidence levels from
 *  Eclipse-Web docs/v3/lote-0.4 §3 and §5 only). Not claimed: that the agents work alone, that they are installed in
 *  Eclipse (there the roles are steps one session runs), that it is open source, or that anything was audited or
 *  pentested. The repos are not linked: none of them is presented as public here. */
export const agentes: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    {
      type: 'diagram', key: 'roles',
      spec: {
        id: 'agentes-roles',
        groups: [{ id: 'product' }, { id: 'arch' }],
        nodes: [
          { id: 'human', kind: 'person', tone: 'green' },
          { id: 'chief', kind: 'service', tone: 'coral' },
          { id: 'docs', kind: 'doc' },
          { id: 'uxui', kind: 'client' },
          { id: 'design', kind: 'gate', tone: 'yellow' },
          { id: 'mkt', kind: 'person' },
          { id: 'ads', kind: 'doc' },
          { id: 'fe', kind: 'code', tone: 'blue' },
          { id: 'be', kind: 'server', tone: 'blue' },
          { id: 'sec', kind: 'gate', tone: 'coral' },
          { id: 'game', kind: 'code' },
          { id: 'trailer', kind: 'queue' },
        ],
        edges: [
          { id: 'ask', from: 'human', to: 'chief', tone: 'green' },
          { id: 'brief', from: 'chief', to: 'human', dashed: true },
          { id: 'spec', from: 'uxui', to: 'fe' },
          { id: 'look', from: 'design', to: 'fe', tone: 'yellow' },
          { id: 'offer', from: 'mkt', to: 'ads' },
          { id: 'handoff', from: 'fe', to: 'be', tone: 'blue', dashed: true },
          { id: 'review', from: 'be', to: 'sec', tone: 'coral' },
        ],
        desktop: {
          w: 1000, h: 540,
          groups: { product: { x: 0, y: 135, w: 1000, h: 130 }, arch: { x: 0, y: 300, w: 1000, h: 230 } },
          nodes: {
            human: { x: 20, y: 40, w: 230 }, chief: { x: 385, y: 40, w: 230 }, docs: { x: 750, y: 40, w: 230 },
            uxui: { x: 20, y: 185, w: 190 }, design: { x: 230, y: 185, w: 190 }, mkt: { x: 470, y: 185, w: 190 }, ads: { x: 790, y: 185, w: 190 },
            fe: { x: 20, y: 350, w: 200 }, be: { x: 390, y: 350, w: 200 }, sec: { x: 780, y: 350, w: 200 },
            game: { x: 20, y: 450, w: 200 }, trailer: { x: 390, y: 450, w: 200 },
          },
          edges: {
            ask: { from: 'r', to: 'l', fo: -12, too: -12 },
            brief: { from: 'l', to: 'r', fo: 12, too: 12, lx: 317, ly: 118 },
            // enters Frontend right of the «Arquitectos» group label
            spec: { from: 'b', to: 't', fo: 40, too: 35, lx: 140, ly: 283 },
            look: { from: 'b', to: 't', too: 85, lx: 300, ly: 283 },
          },
        },
        mobile: {
          w: 360, h: 770,
          groups: { product: { x: 2, y: 196, w: 356, h: 212 }, arch: { x: 2, y: 448, w: 356, h: 312 } },
          nodes: {
            human: { x: 12, y: 12, w: 150 },
            chief: { x: 12, y: 112, w: 150 }, docs: { x: 172, y: 112, w: 176 },
            mkt: { x: 12, y: 236, w: 155 }, ads: { x: 193, y: 236, w: 155 },
            uxui: { x: 12, y: 336, w: 155 }, design: { x: 193, y: 336, w: 155 },
            fe: { x: 12, y: 490, w: 155 }, game: { x: 193, y: 490, w: 155 },
            be: { x: 12, y: 590, w: 155 }, trailer: { x: 193, y: 590, w: 155 },
            sec: { x: 12, y: 690, w: 155 },
          },
          edges: {
            ask: { from: 'b', to: 't', fo: -35, too: -35, lx: 52, ly: 88 },
            brief: { from: 't', to: 'b', fo: 35, too: 35, lx: 205, ly: 88 },
            offer: { lx: 180, ly: 314 },
            spec: { from: 'b', to: 't', fo: 46, too: 46, lx: 89, ly: 428 },
            look: { from: 'b', to: 't', too: 62, lx: 262, ly: 428 },
            handoff: { lx: 89, ly: 568 },
            review: { lx: 89, ly: 668 },
          },
        },
      },
    },
    {
      // The main flow, with the human gate in its own group.
      type: 'diagram', key: 'flow',
      spec: {
        id: 'agentes-flow',
        groups: [{ id: 'human', tone: 'yellow' }],
        nodes: [
          { id: 'req', kind: 'person', tone: 'green' },
          { id: 'chief', kind: 'service', tone: 'coral' },
          { id: 'spec', kind: 'doc' },
          { id: 'agents', kind: 'service' },
          { id: 'skills', kind: 'db', tone: 'blue' },
          { id: 'repo', kind: 'code' },
          { id: 'qa', kind: 'server' },
          { id: 'gate', kind: 'gate', tone: 'yellow' },
          { id: 'pub', kind: 'cloud', tone: 'green' },
        ],
        edges: [
          { id: 'ask', from: 'req', to: 'chief' },
          { id: 'scope', from: 'chief', to: 'spec' },
          { id: 'pass', from: 'spec', to: 'agents' },
          { id: 'load', from: 'agents', to: 'skills', tone: 'blue', dashed: true },
          { id: 'branch', from: 'agents', to: 'repo' },
          { id: 'local', from: 'repo', to: 'qa' },
          { id: 'review', from: 'qa', to: 'gate', tone: 'yellow' },
          { id: 'ok', from: 'gate', to: 'pub', tone: 'green' },
          { id: 'fix', from: 'qa', to: 'agents', tone: 'coral', dashed: true },
        ],
        desktop: {
          w: 1000, h: 632,
          groups: { human: { x: 0, y: 336, w: 270, h: 288 } },
          nodes: {
            req: { x: 20, y: 40, w: 230 }, chief: { x: 380, y: 40, w: 240 }, spec: { x: 750, y: 40, w: 230 },
            skills: { x: 380, y: 210, w: 240 }, agents: { x: 750, y: 210, w: 230 },
            gate: { x: 20, y: 380, w: 230 }, qa: { x: 380, y: 380, w: 240 }, repo: { x: 750, y: 380, w: 230 },
            pub: { x: 20, y: 540, w: 230 },
          },
          edges: {
            pass: { lx: 865, ly: 157 },
            branch: { lx: 865, ly: 327 },
            ok: { lx: 135, ly: 492 },
            fix: { from: 't', to: 'b', fo: 90, too: -80 },
          },
        },
        mobile: {
          w: 360, h: 812,
          groups: { human: { x: 2, y: 592, w: 356, h: 208 } },
          nodes: {
            req: { x: 12, y: 12, w: 250 }, chief: { x: 12, y: 108, w: 250 }, spec: { x: 12, y: 204, w: 250 },
            agents: { x: 12, y: 300, w: 180 }, skills: { x: 220, y: 300, w: 128 },
            repo: { x: 12, y: 396, w: 250 }, qa: { x: 12, y: 492, w: 250 },
            gate: { x: 12, y: 632, w: 250 }, pub: { x: 12, y: 728, w: 250 },
          },
          edges: {
            ask: { lx: 137, ly: 88 },
            scope: { lx: 137, ly: 184 },
            pass: { lx: 100, ly: 280 },
            load: { lx: 290, ly: 282 },
            branch: { lx: 120, ly: 376 },
            local: { lx: 137, ly: 472 },
            review: { lx: 137, ly: 570 },
            ok: { lx: 137, ly: 708 },
            // back up the right-hand corridor, under the agents box
            fix: { d: 'M262 520C290 520 300 516 300 496L300 396C300 382 296 376 282 376L184 376C176 376 170 370 170 359', lx: 318, ly: 455 },
          },
        },
      },
    },
    { type: 'flow', key: 'gates', cols: 3 },
    { type: 'flow', key: 'evidence', cols: 5 },
    { type: 'flow', key: 'review', cols: 5 },
    { type: 'checks', key: 'usage' },
    { type: 'checks', key: 'rules' },
    { type: 'decisions', key: 'decisions' },
    { type: 'readouts', key: 'quality' },
    { type: 'stack', key: 'stack' },
    { type: 'text', key: 'not' },
    { type: 'limits', key: 'status' },
  ],
};
