import type { CaseDef } from './types';

/** Velmar: a demo made for a real workshop in Mar del Plata (Ignacio, 28/10/2026: shown by name, «Demo · hecha para un
 *  cliente»; no deposit, deployment or results claimed; no Instagram, contact data or logo).
 *  Facts: scratchpad facts/velmar.md, checked read-only against the repo (engine/orders.ts, wheel.ts, collar.ts). */
export const velmar: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    { type: 'text', key: 'problem' },
    { type: 'checks', key: 'business' },
    {
      type: 'diagram', key: 'loop',
      spec: {
        id: 'velmar-loop',
        nodes: [
          { id: 'buyer', kind: 'person' },
          { id: 'cart', kind: 'client' },
          { id: 'wheel', kind: 'gate', tone: 'yellow' },
          { id: 'wallet', kind: 'doc', tone: 'green' },
          { id: 'club', kind: 'queue', tone: 'blue' },
          { id: 'panel', kind: 'client', tone: 'coral' },
        ],
        edges: [
          { id: 'visit', from: 'buyer', to: 'cart' },
          { id: 'spin', from: 'cart', to: 'wheel', tone: 'yellow' },
          { id: 'win', from: 'wheel', to: 'wallet', tone: 'yellow' },
          { id: 'apply', from: 'wallet', to: 'cart', tone: 'green' },
          { id: 'buy', from: 'cart', to: 'club', tone: 'blue' },
          { id: 'prize', from: 'club', to: 'wallet', tone: 'blue' },
          { id: 'weights', from: 'panel', to: 'wheel', tone: 'coral' },
          { id: 'rules', from: 'panel', to: 'club', tone: 'coral' },
        ],
        desktop: {
          w: 1000, h: 470,
          nodes: {
            buyer: { x: 20, y: 40, w: 220 }, cart: { x: 350, y: 40, w: 240 }, wheel: { x: 780, y: 40, w: 200 },
            club: { x: 20, y: 220, w: 230 }, wallet: { x: 350, y: 220, w: 240 }, panel: { x: 760, y: 380, w: 220 },
          },
          edges: {
            win: { from: 'b', to: 'r', fo: -40 },
            apply: { from: 't', to: 'b', fo: 50, too: 50 },
            buy: { from: 'b', to: 't', fo: -60, lx: 262, ly: 160 },
            weights: { from: 't', to: 'b', fo: 50, too: 40, ly: 300 },
            rules: { d: 'M760 412C440 412 135 400 135 286', lx: 330, ly: 392 },
          },
        },
        mobile: {
          w: 360, h: 556,
          nodes: {
            buyer: { x: 55, y: 10, w: 250 }, cart: { x: 55, y: 116, w: 250 },
            wheel: { x: 22, y: 232, w: 145 }, club: { x: 193, y: 232, w: 145 },
            wallet: { x: 55, y: 358, w: 250 }, panel: { x: 55, y: 484, w: 250 },
          },
          edges: {
            visit: { ly: 91 },
            spin: { from: 'b', to: 't', fo: -60, lx: 92, ly: 202 },
            buy: { from: 'b', to: 't', fo: 60, lx: 268, ly: 202 },
            win: { from: 'b', to: 't', too: -60, lx: 92, ly: 306 },
            prize: { from: 'b', to: 't', too: 60, lx: 268, ly: 306 },
            apply: { from: 't', to: 'b', lx: 180, ly: 340 },
            weights: { d: 'M55 512C11 512 11 504 11 480L11 290C11 266 11 260 20 260', lx: 76, ly: 449 },
            rules: { d: 'M305 512C349 512 349 504 349 480L349 290C349 266 349 260 340 260', lx: 300, ly: 449 },
          },
        },
      },
    },
    {
      type: 'diagram', key: 'orders',
      spec: {
        id: 'velmar-orders',
        nodes: [
          { id: 'pending', kind: 'queue' },
          { id: 'review', kind: 'doc', tone: 'yellow' },
          { id: 'paid', kind: 'gate', tone: 'green' },
          { id: 'prod', kind: 'service', tone: 'coral' },
          { id: 'ready', kind: 'queue' },
          { id: 'shipped', kind: 'service' },
          { id: 'delivered', kind: 'person', tone: 'green' },
        ],
        edges: [
          { id: 'proof', from: 'pending', to: 'review', tone: 'yellow' },
          { id: 'approve', from: 'review', to: 'paid', tone: 'green' },
          { id: 'reject', from: 'review', to: 'pending', tone: 'coral' },
          { id: 'provider', from: 'pending', to: 'paid', dashed: true },
          { id: 'start', from: 'paid', to: 'prod' },
          { id: 'done', from: 'prod', to: 'ready' },
          { id: 'ship', from: 'ready', to: 'shipped' },
          { id: 'pickup', from: 'ready', to: 'delivered', tone: 'green' },
          { id: 'arrive', from: 'shipped', to: 'delivered', tone: 'green' },
        ],
        desktop: {
          w: 1000, h: 490,
          nodes: {
            pending: { x: 20, y: 60, w: 230 }, review: { x: 380, y: 60, w: 240 }, paid: { x: 740, y: 60, w: 240 },
            delivered: { x: 20, y: 260, w: 230 }, ready: { x: 380, y: 260, w: 240 }, prod: { x: 740, y: 260, w: 240 },
            shipped: { x: 380, y: 410, w: 240 },
          },
          edges: {
            reject: { d: 'M450 124C450 184 185 184 185 126', lx: 318, ly: 172 },
            provider: { d: 'M135 60C135 6 860 6 860 58', lx: 500, ly: 20 },
            arrive: { from: 'l', to: 'b' },
          },
        },
        mobile: {
          w: 360, h: 756,
          nodes: {
            pending: { x: 30, y: 10, w: 250 }, review: { x: 30, y: 136, w: 250 }, paid: { x: 30, y: 246, w: 250 },
            prod: { x: 30, y: 356, w: 250 }, ready: { x: 30, y: 466, w: 250 }, shipped: { x: 30, y: 576, w: 250 },
            delivered: { x: 30, y: 686, w: 250 },
          },
          edges: {
            proof: { from: 'b', to: 't', fo: -55, too: -55, lx: 88, ly: 82 },
            reject: { from: 't', to: 'b', fo: 55, too: 55, lx: 205, ly: 110 },
            provider: { d: 'M280 38C318 38 320 46 320 66L320 254C320 268 318 274 283 274', lx: 298, ly: 216 },
            approve: { ly: 219 }, start: { ly: 329 }, done: { ly: 439 }, ship: { ly: 549 }, arrive: { ly: 659 },
            pickup: { d: 'M280 494C318 494 320 502 320 522L320 690C320 708 318 714 283 714', lx: 318, ly: 604 },
          },
        },
      },
    },
    { type: 'flow', key: 'collar', cols: 3 },
    {
      type: 'diagram', key: 'arch',
      spec: {
        id: 'velmar-arch',
        groups: [{ id: 'today' }, { id: 'plan' }],
        nodes: [
          { id: 'shop', kind: 'client' },
          { id: 'admin', kind: 'client', tone: 'coral' },
          { id: 'engine', kind: 'code', tone: 'yellow' },
          { id: 'data', kind: 'db', tone: 'blue' },
          { id: 'mp', kind: 'external' },
          { id: 'server', kind: 'server' },
          { id: 'db', kind: 'db' },
        ],
        edges: [
          { id: 'edit', from: 'admin', to: 'data', tone: 'blue' },
          { id: 'read', from: 'data', to: 'shop', tone: 'blue' },
          { id: 'quote', from: 'shop', to: 'engine', tone: 'yellow' },
          { id: 'trans', from: 'admin', to: 'engine', tone: 'yellow' },
          { id: 'move', from: 'engine', to: 'server', dashed: true },
          { id: 'webhook', from: 'mp', to: 'server', dashed: true },
          { id: 'tx', from: 'server', to: 'db', dashed: true },
        ],
        desktop: {
          w: 1000, h: 490,
          groups: { today: { x: 0, y: 0, w: 1000, h: 330 }, plan: { x: 0, y: 346, w: 1000, h: 140 } },
          nodes: {
            shop: { x: 20, y: 50, w: 240 }, data: { x: 380, y: 50, w: 240 }, admin: { x: 740, y: 50, w: 240 },
            engine: { x: 380, y: 200, w: 240 },
            mp: { x: 20, y: 400, w: 200 }, server: { x: 380, y: 400, w: 240 }, db: { x: 740, y: 400, w: 240 },
          },
          edges: {
            quote: { from: 'b', to: 'l' },
            trans: { from: 'b', to: 'r' },
            move: { ly: 300 },
          },
        },
        mobile: {
          w: 360, h: 630,
          groups: { today: { x: 0, y: 0, w: 360, h: 372 }, plan: { x: 0, y: 388, w: 360, h: 236 } },
          nodes: {
            data: { x: 55, y: 44, w: 250 },
            shop: { x: 12, y: 160, w: 162 }, admin: { x: 186, y: 160, w: 162 },
            engine: { x: 55, y: 276, w: 250 },
            server: { x: 55, y: 432, w: 250 },
            mp: { x: 12, y: 548, w: 162 }, db: { x: 186, y: 548, w: 162 },
          },
          edges: {
            edit: { from: 't', to: 'b', too: 60, lx: 262, ly: 130 },
            read: { from: 'b', to: 't', fo: -60, lx: 98, ly: 130 },
            quote: { from: 'b', to: 't', too: -60, lx: 96, ly: 246 },
            trans: { from: 'b', to: 't', too: 60, lx: 264, ly: 246 },
            move: { ly: 352 },
            webhook: { from: 't', to: 'b', too: -60, lx: 98, ly: 518 },
            tx: { from: 'b', to: 't', fo: 60, lx: 262, ly: 518 },
          },
        },
      },
    },
    { type: 'checks', key: 'security' },
    { type: 'decisions', key: 'decisions' },
    { type: 'readouts', key: 'quality' },
    { type: 'stack', key: 'stack' },
    { type: 'gallery', key: 'gallery', dir: '/media/lab', shots: ['velmar'] },
    { type: 'limits', key: 'status' },
  ],
};
