import type { CaseDef } from './types';

/** HandyX: business model (approved: 10 % user + 10 % specialist), the pre-registration funnel and the system.
 *  Facts: scratchpad facts/handyx.md (landing, backend and internal portal, read on 28/10/2026). The backend repo is
 *  private: the page describes its design, never links it, and leaves out thresholds and cookie names. */
const W = 250;
export const handyx: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    {
      type: 'showcase', key: 'media',
      items: [
        { id: 'landing-recorrido', kind: 'video', frame: 'browser', src: '/media/handyx/landing-recorrido.mp4', poster: '/media/handyx/landing-recorrido.jpg', w: 1280, h: 800, url: 'handyc.com' },
        { id: 'portal-interno', kind: 'video', frame: 'browser', src: '/media/handyx/portal-interno.mp4', poster: '/media/handyx/portal-interno.jpg', w: 1280, h: 800, url: 'handyc.com' },
        { id: 'especialistas', kind: 'image', frame: 'browser', src: '/media/handyx/especialistas.webp', w: 1600, h: 1000, url: 'handyc.com' },
        { id: 'app-pedido', kind: 'video', frame: 'phone', src: '/media/handyx/app-pedido.mp4', poster: '/media/handyx/app-pedido.jpg', w: 390, h: 844 },
        { id: 'app-turno', kind: 'video', frame: 'phone', src: '/media/handyx/app-turno.mp4', poster: '/media/handyx/app-turno.jpg', w: 390, h: 844 },
        { id: 'app-especialista', kind: 'video', frame: 'phone', src: '/media/handyx/app-especialista.mp4', poster: '/media/handyx/app-especialista.jpg', w: 390, h: 844 },
      ],
    },
    { type: 'split', key: 'money' },
    { type: 'checks', key: 'growth' },
    {
      type: 'diagram', key: 'funnel',
      spec: {
        id: 'handyx-funnel',
        groups: [{ id: 'pros' }, { id: 'users' }],
        nodes: [
          { id: 'pre', kind: 'queue' },
          { id: 'talk', kind: 'person', tone: 'blue' },
          { id: 'commit', kind: 'gate', tone: 'green' },
          { id: 'later', kind: 'external' },
          { id: 'wait', kind: 'queue' },
          { id: 'told', kind: 'doc', tone: 'blue' },
        ],
        edges: [
          { id: 'try', from: 'pre', to: 'pre', dashed: true },
          { id: 'conv', from: 'pre', to: 'talk', tone: 'blue' },
          { id: 'deal', from: 'talk', to: 'commit', tone: 'green' },
          { id: 'next', from: 'commit', to: 'later', dashed: true },
          { id: 'notify', from: 'wait', to: 'told', tone: 'blue' },
        ],
        desktop: {
          w: 1000, h: 470,
          groups: { pros: { x: 0, y: 0, w: 1000, h: 300 }, users: { x: 0, y: 318, w: 1000, h: 150 } },
          nodes: { pre: { x: 20, y: 96, w: 230 }, talk: { x: 385, y: 96, w: 230 }, commit: { x: 750, y: 96, w: 230 }, later: { x: 590, y: 214, w: 390 }, wait: { x: 20, y: 380, w: 230 }, told: { x: 385, y: 380, w: 230 } },
          edges: {
            try: { d: 'M95 96C95 46 175 46 175 93', lx: 135, ly: 50 },
            next: { from: 'b', to: 't', fo: 0, too: 80, lx: 930, ly: 188 },
          },
        },
        mobile: {
          w: 360, h: 690,
          groups: { pros: { x: 0, y: 0, w: 360, h: 452 }, users: { x: 0, y: 470, w: 360, h: 218 } },
          nodes: { pre: { x: 30, y: 52, w: 240 }, talk: { x: 30, y: 160, w: 240 }, commit: { x: 30, y: 268, w: 240 }, later: { x: 30, y: 376, w: 300 }, wait: { x: 30, y: 522, w: 240 }, told: { x: 30, y: 620, w: 240 } },
          edges: {
            try: { d: 'M270 70C318 70 318 100 273 100', lx: 312, ly: 52 },
            conv: { lx: 150, ly: 134 }, deal: { lx: 150, ly: 242 }, next: { lx: 150, ly: 350 }, notify: { lx: 150, ly: 597 },
          },
        },
      },
    },
    {
      type: 'diagram', key: 'arch',
      spec: {
        id: 'handyx-arch',
        nodes: [
          { id: 'visitor', kind: 'person' },
          { id: 'landing', kind: 'client' },
          { id: 'api', kind: 'server', tone: 'coral' },
          { id: 'db', kind: 'db', tone: 'blue' },
          { id: 'ops', kind: 'person' },
          { id: 'portal', kind: 'client' },
          { id: 'wa', kind: 'external' },
          { id: 'purge', kind: 'service' },
        ],
        edges: [
          { id: 'visit', from: 'visitor', to: 'landing' },
          { id: 'signup', from: 'landing', to: 'api', tone: 'coral' },
          { id: 'tx', from: 'api', to: 'db', tone: 'blue' },
          { id: 'login', from: 'ops', to: 'portal' },
          { id: 'admin', from: 'portal', to: 'api', tone: 'coral' },
          { id: 'whatsapp', from: 'ops', to: 'wa', dashed: true },
          { id: 'retention', from: 'purge', to: 'db', dashed: true },
        ],
        desktop: {
          w: 1000, h: 560,
          nodes: { visitor: { x: 20, y: 40, w: 250 }, landing: { x: 380, y: 40, w: 240 }, api: { x: 720, y: 210, w: 260 }, db: { x: 720, y: 470, w: 260 }, ops: { x: 20, y: 340, w: 250 }, portal: { x: 380, y: 340, w: 240 }, wa: { x: 20, y: 470, w: 250 }, purge: { x: 380, y: 470, w: 240 } },
          edges: {
            signup: { from: 'r', to: 't', lx: 790, ly: 112 },
            admin: { from: 'r', to: 'b', too: -60, lx: 694, ly: 318 },
            tx: { fo: 50, too: 50, lx: 900, ly: 372 },
            login: { ly: 326 }, visit: { ly: 26 },
            whatsapp: { lx: 145, ly: 452 },
          },
        },
        mobile: {
          w: 360, h: 740,
          nodes: { visitor: { x: 20, y: 10, w: 250 }, landing: { x: 20, y: 100, w: 250 }, api: { x: 20, y: 190, w: 250 }, db: { x: 20, y: 280, w: 250 }, portal: { x: 20, y: 400, w: 250 }, ops: { x: 20, y: 490, w: 250 }, wa: { x: 20, y: 580, w: 250 }, purge: { x: 20, y: 670, w: 250 } },
          edges: {
            visit: { lx: 145, ly: 83 },
            signup: { lx: 145, ly: 173 },
            tx: { lx: 145, ly: 263 },
            admin: { d: 'M270 428C322 428 326 420 326 380L326 262C326 222 322 218 273 218', hide: true },
            login: { from: 't', to: 'b', lx: 145, ly: 473 },
            whatsapp: { lx: 145, ly: 563 },
            retention: { d: 'M270 698C344 698 348 690 348 650L348 352C348 312 344 308 273 308', hide: true },
          },
        },
      },
    },
    {
      type: 'sequence', key: 'signup',
      spec: {
        id: 'handyx-signup',
        lanes: [{ id: 'landing', kind: 'client' }, { id: 'api', kind: 'server' }, { id: 'db', kind: 'db' }],
        msgs: [
          { id: 'validate', from: 'landing', to: 'landing' },
          { id: 'post', from: 'landing', to: 'api' },
          { id: 'guards', from: 'api', to: 'api' },
          { id: 'encrypt', from: 'api', to: 'api' },
          { id: 'tx', from: 'api', to: 'db' },
          { id: 'ok', from: 'api', to: 'landing', back: true },
        ],
      },
    },
    { type: 'checks', key: 'security' },
    { type: 'decisions', key: 'decisions' },
    { type: 'readouts', key: 'quality' },
    { type: 'stack', key: 'stack' },
    { type: 'gallery', key: 'gallery', dir: '/media/portals', shots: ['handy-landing', 'handy-especialistas', 'handy-ops-inicio', 'handy-ops-registros'] },
    { type: 'limits', key: 'status' },
  ],
};
