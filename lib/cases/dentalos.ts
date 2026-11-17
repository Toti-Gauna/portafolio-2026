import type { CaseDef } from './types';

/** DentalOS: the administrative circuit of a fictional dental clinic, frontend only (Demo).
 *  Facts: scratchpad facts/dentalos.md (repo Toti-Gauna/DentalOS, read on 28/10/2026). Public repo.
 *  16 modules in the code (M01–M16; the README's «15» is older than M16 Campañas). No pricing exists: never invent one. */
export const dentalos: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    {
      type: 'showcase', key: 'media',
      items: [
        { id: 'recepcion', kind: 'video', frame: 'browser', src: '/media/dentalos/recepcion.mp4', poster: '/media/dentalos/recepcion.jpg', w: 1280, h: 800, url: 'dentalos · demo' },
        { id: 'odontograma', kind: 'video', frame: 'browser', src: '/media/dentalos/odontograma.mp4', poster: '/media/dentalos/odontograma.jpg', w: 1280, h: 800, url: 'dentalos · demo' },
        { id: 'ortodoncia', kind: 'image', frame: 'browser', src: '/media/dentalos/ortodoncia.webp', w: 1600, h: 1000, url: 'dentalos · demo' },
        { id: 'campanas', kind: 'image', frame: 'browser', src: '/media/dentalos/campanas.webp', w: 1600, h: 1000, url: 'dentalos · demo' },
      ],
    },
    { type: 'flow', key: 'reschedule', cols: 3 },
    { type: 'text', key: 'ideas' },
    {
      type: 'diagram', key: 'arch',
      spec: {
        id: 'dentalos-arch',
        nodes: [
          { id: 'portal', kind: 'client' },
          { id: 'panel', kind: 'client', tone: 'yellow' },
          { id: 'store', kind: 'service', tone: 'blue' },
          { id: 'ls', kind: 'db', tone: 'blue' },
          { id: 'domain', kind: 'code', tone: 'coral' },
          { id: 'clock', kind: 'service' },
          { id: 'sched', kind: 'gate', tone: 'green' },
          { id: 'outbox', kind: 'queue' },
          { id: 'audit', kind: 'doc' },
        ],
        edges: [
          { id: 'portalCmd', from: 'portal', to: 'store' },
          { id: 'panelCmd', from: 'panel', to: 'store' },
          { id: 'exec', from: 'store', to: 'domain', tone: 'coral' },
          { id: 'slot', from: 'domain', to: 'sched', tone: 'green' },
          { id: 'msg', from: 'domain', to: 'outbox' },
          { id: 'log', from: 'domain', to: 'audit' },
          { id: 'time', from: 'domain', to: 'clock' },
          { id: 'save', from: 'store', to: 'ls', tone: 'blue' },
        ],
        desktop: {
          w: 1000, h: 560,
          nodes: {
            portal: { x: 200, y: 20, w: 240 }, panel: { x: 560, y: 20, w: 240 },
            ls: { x: 20, y: 170, w: 240 }, store: { x: 380, y: 170, w: 240 },
            domain: { x: 380, y: 320, w: 240 }, clock: { x: 740, y: 320, w: 240 },
            sched: { x: 20, y: 476, w: 240 }, outbox: { x: 380, y: 476, w: 240 }, audit: { x: 740, y: 476, w: 240 },
          },
          edges: {
            portalCmd: { from: 'b', to: 't', too: -50 },
            panelCmd: { from: 'b', to: 't', too: 50 },
            slot: { from: 'b', to: 't', fo: -80 },
            log: { from: 'b', to: 't', fo: 80 },
          },
        },
        mobile: {
          w: 360, h: 516,
          nodes: {
            portal: { x: 10, y: 10, w: 160 }, panel: { x: 190, y: 10, w: 160 },
            store: { x: 10, y: 120, w: 160 }, ls: { x: 190, y: 120, w: 160 },
            domain: { x: 55, y: 230, w: 250 },
            sched: { x: 10, y: 340, w: 160 }, clock: { x: 190, y: 340, w: 160 },
            outbox: { x: 10, y: 450, w: 160 }, audit: { x: 190, y: 450, w: 160 },
          },
          edges: {
            portalCmd: { lx: 90, ly: 93 },
            panelCmd: { from: 'b', to: 't', too: 50, lx: 220, ly: 93 },
            save: { hide: true },
            exec: { from: 'b', to: 't', too: -60, lx: 104, ly: 203 },
            slot: { from: 'b', to: 't', fo: -80, lx: 95, ly: 313 },
            time: { from: 'b', to: 't', fo: 80, lx: 265, ly: 313 },
            msg: { d: 'M176 286L176 418C176 440 90 428 90 447', lx: 90, ly: 423 },
            log: { d: 'M184 286L184 418C184 440 270 428 270 447', lx: 270, ly: 423 },
          },
        },
      },
    },
    {
      type: 'sequence', key: 'command',
      spec: {
        id: 'dentalos-command',
        lanes: [{ id: 'ui', kind: 'client' }, { id: 'store', kind: 'service' }, { id: 'domain', kind: 'code' }, { id: 'outbox', kind: 'queue' }],
        msgs: [
          { id: 'dispatch', from: 'ui', to: 'store' },
          { id: 'id', from: 'store', to: 'store' },
          { id: 'exec', from: 'store', to: 'domain' },
          { id: 'seen', from: 'domain', to: 'domain' },
          { id: 'clone', from: 'domain', to: 'domain' },
          { id: 'slot', from: 'domain', to: 'domain' },
          { id: 'msgs', from: 'domain', to: 'outbox' },
          { id: 'audit', from: 'domain', to: 'domain' },
          { id: 'result', from: 'domain', to: 'store', back: true },
          { id: 'save', from: 'store', to: 'store' },
          { id: 'render', from: 'store', to: 'ui', back: true },
        ],
      },
    },
    { type: 'checks', key: 'privacy' },
    { type: 'decisions', key: 'decisions' },
    { type: 'readouts', key: 'quality' },
    { type: 'stack', key: 'stack' },
    { type: 'gallery', key: 'gallery', dir: '/media/lab', shots: ['dentalos'] },
    { type: 'limits', key: 'status' },
  ],
  links: [{ label: 'github.com/Toti-Gauna/DentalOS', href: 'https://github.com/Toti-Gauna/DentalOS' }],
};
