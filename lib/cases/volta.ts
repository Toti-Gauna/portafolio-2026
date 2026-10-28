import type { CaseDef } from './types';

/** Volta: a clickable store demo with a pure rules engine and no server (Demo).
 *  Facts: scratchpad facts/volta.md (repo Toti-Gauna/supplements-ecommerce, read on 28/10/2026). Public repo.
 *  Never quote the Eclipse price list that lives in its sales trailer. */
export const volta: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    {
      type: 'showcase', key: 'media',
      items: [
        { id: 'panel', kind: 'video', frame: 'browser', src: '/media/volta/panel.mp4', poster: '/media/volta/panel.jpg', w: 1280, h: 800, url: 'volta · demo' },
        { id: 'tienda', kind: 'video', frame: 'phone', src: '/media/volta/tienda.mp4', poster: '/media/volta/tienda.jpg', w: 390, h: 844 },
        { id: 'club-ruleta', kind: 'video', frame: 'phone', src: '/media/volta/club-ruleta.mp4', poster: '/media/volta/club-ruleta.jpg', w: 390, h: 844 },
        { id: 'regalar', kind: 'image', frame: 'phone', src: '/media/volta/regalar.webp', w: 780, h: 1688 },
      ],
    },
    { type: 'flow', key: 'loop', cols: 4 },
    {
      type: 'diagram', key: 'arch',
      spec: {
        id: 'volta-arch',
        nodes: [
          { id: 'shop', kind: 'client' },
          { id: 'admin', kind: 'client', tone: 'yellow' },
          { id: 'features', kind: 'code' },
          { id: 'engine', kind: 'service', tone: 'coral' },
          { id: 'stores', kind: 'service', tone: 'blue' },
          { id: 'fixtures', kind: 'doc' },
          { id: 'ls', kind: 'db', tone: 'blue' },
          { id: 'prod', kind: 'server', tone: 'paper' },
        ],
        edges: [
          { id: 'shopUses', from: 'shop', to: 'features' },
          { id: 'adminUses', from: 'admin', to: 'features' },
          { id: 'calc', from: 'features', to: 'engine', tone: 'coral' },
          { id: 'state', from: 'features', to: 'stores', tone: 'blue' },
          { id: 'read', from: 'engine', to: 'fixtures' },
          { id: 'persist', from: 'stores', to: 'ls', tone: 'blue' },
          { id: 'later', from: 'engine', to: 'prod', dashed: true },
        ],
        desktop: {
          w: 1000, h: 420,
          nodes: {
            shop: { x: 200, y: 20, w: 240 }, admin: { x: 560, y: 20, w: 240 },
            engine: { x: 20, y: 170, w: 240 }, features: { x: 380, y: 170, w: 240 }, stores: { x: 740, y: 170, w: 240 },
            fixtures: { x: 20, y: 336, w: 240 }, prod: { x: 380, y: 336, w: 240 }, ls: { x: 740, y: 336, w: 240 },
          },
          edges: {
            shopUses: { from: 'b', to: 't', too: -50 },
            adminUses: { from: 'b', to: 't', too: 50 },
            later: { from: 'r', to: 't', fo: 20, too: -60, lx: 434, ly: 298 },
          },
        },
        mobile: {
          w: 360, h: 520,
          nodes: {
            shop: { x: 10, y: 10, w: 160 }, admin: { x: 190, y: 10, w: 160 },
            features: { x: 55, y: 120, w: 250 },
            engine: { x: 10, y: 232, w: 160 }, stores: { x: 190, y: 232, w: 160 },
            fixtures: { x: 10, y: 344, w: 160 }, ls: { x: 190, y: 344, w: 160 },
            prod: { x: 55, y: 456, w: 250 },
          },
          edges: {
            shopUses: { from: 'b', to: 't', too: -35 },
            adminUses: { from: 'b', to: 't', too: 35 },
            calc: { from: 'b', to: 't', fo: -60 },
            state: { from: 'b', to: 't', fo: 60 },
            read: { lx: 90, ly: 316 },
            persist: { lx: 270, ly: 316 },
            later: { d: 'M150 288C150 306 180 306 180 330L180 436C180 444 180 448 180 453', lx: 180, ly: 428 },
          },
        },
      },
    },
    {
      type: 'diagram', key: 'orders',
      spec: {
        id: 'volta-orders',
        nodes: [
          { id: 'cancelled', kind: 'gate' },
          { id: 'pending', kind: 'queue' },
          { id: 'review', kind: 'gate', tone: 'yellow' },
          { id: 'paid', kind: 'doc', tone: 'green' },
          { id: 'prep', kind: 'service' },
          { id: 'ready', kind: 'service' },
          { id: 'shipped', kind: 'service' },
          { id: 'delivered', kind: 'person', tone: 'green' },
          { id: 'claim', kind: 'gate', tone: 'coral' },
          { id: 'returned', kind: 'doc' },
        ],
        edges: [
          { id: 'proof', from: 'pending', to: 'review' },
          { id: 'reject', from: 'review', to: 'pending', dashed: true },
          { id: 'approve', from: 'review', to: 'paid', tone: 'green' },
          { id: 'provider', from: 'pending', to: 'paid', tone: 'green' },
          { id: 'cancel', from: 'pending', to: 'cancelled', dashed: true },
          { id: 'prepare', from: 'paid', to: 'prep' },
          { id: 'pack', from: 'prep', to: 'ready' },
          { id: 'ship', from: 'ready', to: 'shipped' },
          { id: 'pickup', from: 'ready', to: 'delivered' },
          { id: 'deliver', from: 'shipped', to: 'delivered' },
          { id: 'complain', from: 'delivered', to: 'claim', tone: 'coral' },
          { id: 'refund', from: 'claim', to: 'returned', tone: 'coral' },
        ],
        desktop: {
          w: 1000, h: 640,
          nodes: {
            cancelled: { x: 20, y: 70, w: 240 }, pending: { x: 380, y: 70, w: 240 }, review: { x: 740, y: 70, w: 240 },
            ready: { x: 20, y: 250, w: 240 }, prep: { x: 380, y: 250, w: 240 }, paid: { x: 740, y: 250, w: 240 },
            shipped: { x: 20, y: 410, w: 240 }, delivered: { x: 380, y: 410, w: 240 }, claim: { x: 740, y: 410, w: 240 },
            returned: { x: 740, y: 560, w: 240 },
          },
          edges: {
            reject: { d: 'M800 70C800 22 560 22 560 67', lx: 680, ly: 34 },
            provider: { from: 'b', to: 't', fo: 60, too: -60, lx: 680, ly: 192 },
            pickup: { from: 'b', to: 't', fo: 60, too: -60, lx: 320, ly: 362 },
          },
        },
        mobile: {
          w: 360, h: 926,
          nodes: {
            cancelled: { x: 95, y: 10, w: 180 }, pending: { x: 95, y: 104, w: 180 }, review: { x: 95, y: 198, w: 180 },
            paid: { x: 95, y: 292, w: 180 }, prep: { x: 95, y: 386, w: 180 }, ready: { x: 95, y: 480, w: 180 },
            shipped: { x: 95, y: 574, w: 180 }, delivered: { x: 95, y: 668, w: 180 }, claim: { x: 95, y: 762, w: 180 },
            returned: { x: 95, y: 856, w: 180 },
          },
          edges: {
            cancel: { from: 't', to: 'b', lx: 185, ly: 85 },
            proof: { lx: 185, ly: 179 },
            reject: { d: 'M95 226C40 226 40 132 92 132', lx: 46, ly: 179 },
            approve: { lx: 185, ly: 273 },
            provider: { d: 'M275 132C340 132 340 320 278 320', hide: true },
            prepare: { lx: 185, ly: 367 },
            pack: { lx: 185, ly: 461 },
            ship: { lx: 185, ly: 555 },
            pickup: { d: 'M275 508C334 508 334 696 278 696', lx: 318, ly: 602 },
            deliver: { lx: 185, ly: 649 },
            complain: { lx: 185, ly: 743 },
            refund: { lx: 185, ly: 837 },
          },
        },
      },
    },
    { type: 'checks', key: 'security' },
    { type: 'decisions', key: 'decisions' },
    { type: 'readouts', key: 'quality' },
    { type: 'stack', key: 'stack' },
    { type: 'gallery', key: 'gallery', dir: '/media/lab', shots: ['volta'] },
    { type: 'limits', key: 'status' },
  ],
  links: [{ label: 'github.com/Toti-Gauna/supplements-ecommerce', href: 'https://github.com/Toti-Gauna/supplements-ecommerce' }],
};
