import type { CaseDef } from './types';

/** Supernova Eventos: a prototype made at Tsoft for Telefónica (Ignacio, 28/10/2026: «Prototipo»; built after becoming
 *  Ssr). Naming Telefónica in text is approved; no corporate logo or client brand marks in images, no internal systems,
 *  and old-events-images/ is never opened. Facts: scratchpad facts/supernova.md, checked read-only against the repo. */
export const supernova: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    {
      type: 'diagram', key: 'journeys',
      spec: {
        id: 'supernova-journeys',
        groups: [{ id: 'collab' }, { id: 'org' }],
        nodes: [
          { id: 'fav', kind: 'doc' },
          { id: 'catalog', kind: 'client' },
          { id: 'signup', kind: 'gate', tone: 'blue' },
          { id: 'pass', kind: 'doc', tone: 'green' },
          { id: 'checkin', kind: 'gate', tone: 'coral' },
          { id: 'create', kind: 'code', tone: 'yellow' },
          { id: 'invite', kind: 'doc' },
        ],
        edges: [
          { id: 'publish', from: 'create', to: 'catalog', tone: 'yellow' },
          { id: 'save', from: 'catalog', to: 'fav', dashed: true },
          { id: 'pick', from: 'catalog', to: 'signup', tone: 'blue' },
          { id: 'confirm', from: 'signup', to: 'pass', tone: 'green' },
          { id: 'show', from: 'pass', to: 'checkin', tone: 'coral' },
          { id: 'mail', from: 'create', to: 'invite' },
        ],
        desktop: {
          w: 1000, h: 480,
          groups: { collab: { x: 0, y: 0, w: 1000, h: 254 }, org: { x: 0, y: 274, w: 1000, h: 200 } },
          nodes: {
            fav: { x: 20, y: 60, w: 230 }, catalog: { x: 390, y: 60, w: 240 }, signup: { x: 770, y: 60, w: 210 },
            pass: { x: 770, y: 170, w: 210 },
            invite: { x: 20, y: 360, w: 230 }, create: { x: 390, y: 360, w: 240 }, checkin: { x: 770, y: 360, w: 210 },
          },
          edges: {
            publish: { ly: 190 },
            show: { ly: 318 },
          },
        },
        mobile: {
          w: 360, h: 796,
          groups: { collab: { x: 0, y: 0, w: 360, h: 448 }, org: { x: 0, y: 464, w: 360, h: 326 } },
          nodes: {
            fav: { x: 55, y: 44, w: 250 }, catalog: { x: 55, y: 150, w: 250 }, signup: { x: 55, y: 256, w: 250 },
            pass: { x: 55, y: 362, w: 250 },
            checkin: { x: 55, y: 508, w: 250 }, create: { x: 55, y: 618, w: 250 }, invite: { x: 55, y: 718, w: 250 },
          },
          edges: {
            save: { ly: 125 }, pick: { ly: 231 }, confirm: { ly: 337 }, show: { ly: 434 }, mail: { ly: 696 },
            publish: { d: 'M305 646C338 646 340 638 340 614L340 210C340 186 338 178 308 178', lx: 310, ly: 591 },
          },
        },
      },
    },
    {
      type: 'sequence', key: 'checkin',
      spec: {
        id: 'supernova-checkin',
        lanes: [{ id: 'org', kind: 'person' }, { id: 'app', kind: 'client' }, { id: 'ls', kind: 'db' }],
        msgs: [
          { id: 'choose', from: 'org', to: 'app' },
          { id: 'read', from: 'org', to: 'app' },
          { id: 'format', from: 'app', to: 'app' },
          { id: 'lookup', from: 'app', to: 'ls' },
          { id: 'checks', from: 'app', to: 'app' },
          { id: 'save', from: 'app', to: 'ls' },
          { id: 'result', from: 'app', to: 'org', back: true },
        ],
      },
    },
    {
      type: 'diagram', key: 'arch',
      spec: {
        id: 'supernova-arch',
        nodes: [
          { id: 'html', kind: 'doc' },
          { id: 'router', kind: 'gate' },
          { id: 'app', kind: 'client', tone: 'coral' },
          { id: 'lazy', kind: 'service', tone: 'yellow' },
          { id: 'universe', kind: 'code', tone: 'blue' },
          { id: 'fallback', kind: 'doc' },
          { id: 'ls', kind: 'db', tone: 'blue' },
        ],
        edges: [
          { id: 'boot', from: 'html', to: 'router' },
          { id: 'route', from: 'router', to: 'app' },
          { id: 'lazy', from: 'app', to: 'lazy', tone: 'yellow' },
          { id: 'cmd', from: 'app', to: 'universe', tone: 'blue' },
          { id: 'fail', from: 'universe', to: 'fallback', dashed: true },
          { id: 'data', from: 'app', to: 'ls', tone: 'blue' },
        ],
        desktop: {
          w: 1000, h: 440,
          nodes: {
            html: { x: 20, y: 40, w: 220 }, lazy: { x: 390, y: 40, w: 230 }, fallback: { x: 760, y: 40, w: 220 },
            router: { x: 20, y: 200, w: 220 }, app: { x: 390, y: 200, w: 230 }, universe: { x: 760, y: 200, w: 220 },
            ls: { x: 390, y: 360, w: 230 },
          },
        },
        mobile: {
          w: 360, h: 630,
          nodes: {
            html: { x: 55, y: 16, w: 250 }, router: { x: 55, y: 122, w: 250 }, app: { x: 55, y: 228, w: 250 },
            lazy: { x: 18, y: 344, w: 156 }, ls: { x: 186, y: 344, w: 156 },
            universe: { x: 55, y: 450, w: 250 }, fallback: { x: 55, y: 556, w: 250 },
          },
          edges: {
            boot: { ly: 97 }, route: { ly: 203 },
            lazy: { from: 'b', to: 't', fo: -60, lx: 92, ly: 314 },
            data: { from: 'b', to: 't', fo: 60, lx: 268, ly: 314 },
            cmd: { d: 'M305 256C349 256 355 264 355 286L355 448C355 470 349 478 308 478', lx: 308, ly: 422 },
            fail: { ly: 531 },
          },
        },
      },
    },
    { type: 'checks', key: 'security' },
    { type: 'decisions', key: 'decisions' },
    { type: 'readouts', key: 'quality' },
    { type: 'stack', key: 'stack' },
    { type: 'gallery', key: 'gallery', dir: '/media/lab', shots: ['supernova'] },
    { type: 'limits', key: 'status' },
  ],
};
