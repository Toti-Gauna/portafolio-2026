import type { CaseDef } from './types';

/** games-market: a test bench of web games for live events (Banco de pruebas).
 *  Facts: scratchpad facts/games.md (repo Toti-Gauna/games-market, read on 28/10/2026). Public repo.
 *  18 registered and playable of 24 planned; the six question/survey games don't exist as games (only their shared
 *  engine). The repo's client-related brand name is never used on this page, and the host product is not described. */
export const games: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    { type: 'text', key: 'plan' },
    {
      type: 'diagram', key: 'net',
      spec: {
        id: 'games-net',
        nodes: [
          { id: 'host', kind: 'client', tone: 'coral' },
          { id: 'p1', kind: 'person' },
          { id: 'p2', kind: 'person' },
          { id: 'p3', kind: 'person', tone: 'yellow' },
          { id: 'broker', kind: 'external' },
          { id: 'bc', kind: 'queue', tone: 'blue' },
        ],
        edges: [
          { id: 'ask', from: 'p1', to: 'broker', dashed: true },
          { id: 'signal', from: 'broker', to: 'host', dashed: true },
          { id: 'in1', from: 'p1', to: 'host' },
          { id: 'out1', from: 'host', to: 'p1', tone: 'coral' },
          { id: 'in2', from: 'p2', to: 'host' },
          { id: 'out2', from: 'host', to: 'p2', tone: 'coral' },
          { id: 'in3', from: 'p3', to: 'host' },
          { id: 'out3', from: 'host', to: 'p3', tone: 'coral' },
          { id: 'dev', from: 'host', to: 'bc', dashed: true, tone: 'blue' },
        ],
        desktop: {
          w: 1000, h: 488,
          nodes: {
            broker: { x: 380, y: 24, w: 240 },
            p1: { x: 20, y: 200, w: 240 }, host: { x: 380, y: 200, w: 240 }, p2: { x: 740, y: 200, w: 240 },
            p3: { x: 380, y: 400, w: 240 }, bc: { x: 740, y: 400, w: 240 },
          },
          edges: {
            ask: { from: 't', to: 'l' },
            in1: { from: 'r', to: 'l', fo: -14, too: -14 },
            out1: { from: 'l', to: 'r', fo: 14, too: 14 },
            in2: { from: 'l', to: 'r', fo: -14, too: -14 },
            out2: { from: 'r', to: 'l', fo: 14, too: 14 },
            in3: { from: 't', to: 'b', fo: -40, too: -40 },
            out3: { from: 'b', to: 't', fo: 40, too: 40 },
            dev: { from: 'b', to: 'l', fo: 100 },
          },
        },
        mobile: {
          w: 360, h: 476,
          nodes: {
            broker: { x: 10, y: 10, w: 160 }, bc: { x: 190, y: 10, w: 160 },
            host: { x: 55, y: 130, w: 250 },
            p1: { x: 10, y: 290, w: 160 }, p2: { x: 190, y: 290, w: 160 },
            p3: { x: 55, y: 410, w: 250 },
          },
          edges: {
            ask: { d: 'M30 290L30 69', hide: true },
            signal: { from: 'b', to: 't', too: -90, lx: 100, ly: 98 },
            dev: { from: 't', to: 'b', fo: 90, lx: 270, ly: 98 },
            in1: { from: 't', to: 'b', fo: -20, too: -110, lx: 70, ly: 212 },
            out1: { from: 'b', to: 't', fo: -70, too: 20, lx: 110, ly: 250 },
            in2: { from: 't', to: 'b', fo: 20, too: 110, lx: 290, ly: 212 },
            out2: { from: 'b', to: 't', fo: 70, too: -20, lx: 250, ly: 250 },
            in3: { from: 't', to: 'b', fo: -5, too: -5, lx: 145, ly: 378 },
            out3: { from: 'b', to: 't', fo: 5, too: 5, lx: 220, ly: 378 },
          },
        },
      },
    },
    { type: 'flow', key: 'contract', cols: 4 },
    { type: 'text', key: 'findings' },
    { type: 'checks', key: 'security' },
    { type: 'decisions', key: 'decisions' },
    { type: 'readouts', key: 'quality' },
    { type: 'stack', key: 'stack' },
    { type: 'gallery', key: 'gallery', dir: '/media/lab', shots: ['games'] },
    { type: 'limits', key: 'status' },
  ],
  links: [{ label: 'github.com/Toti-Gauna/games-market', href: 'https://github.com/Toti-Gauna/games-market' }],
};
