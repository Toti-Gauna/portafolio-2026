import type { CaseDef } from './types';

/** Eclipse: Ignacio's own studio, built as one system in four repos (landing + client portal, backend, internal portal,
 *  email kit). Facts: scratchpad facts/eclipse.md (read on 28/10/2026) plus Eclipse-Web PR #35 on GitHub (home of
 *  products, v3 landing moved to /agency/). No prices, internal finance, clients or real names; the backend is not
 *  claimed as deployed. Repos are not linked: the page describes the design. */
export const eclipse: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    { type: 'flow', key: 'sell', cols: 3 },
    { type: 'checks', key: 'landing' },
    {
      type: 'diagram', key: 'arch',
      spec: {
        id: 'eclipse-arch',
        groups: [{ id: 'pub' }, { id: 'be', tone: 'coral' }, { id: 'int' }],
        nodes: [
          { id: 'visitor', kind: 'person' },
          { id: 'web', kind: 'client' },
          { id: 'api', kind: 'server', tone: 'coral' },
          { id: 'db', kind: 'db', tone: 'blue' },
          { id: 'mail', kind: 'queue', tone: 'yellow' },
          { id: 'ops', kind: 'person' },
          { id: 'internal', kind: 'client' },
          { id: 'kit', kind: 'doc' },
        ],
        edges: [
          { id: 'visit', from: 'visitor', to: 'web' },
          { id: 'client', from: 'web', to: 'api', tone: 'coral' },
          { id: 'tx', from: 'api', to: 'db', tone: 'blue' },
          { id: 'mail', from: 'api', to: 'mail', tone: 'yellow' },
          { id: 'login', from: 'ops', to: 'internal' },
          { id: 'admin', from: 'internal', to: 'api', tone: 'coral' },
          { id: 'kit', from: 'ops', to: 'kit', dashed: true },
        ],
        desktop: {
          w: 1000, h: 590,
          groups: { pub: { x: 0, y: 0, w: 650, h: 120 }, be: { x: 0, y: 176, w: 1000, h: 124 }, int: { x: 0, y: 356, w: 650, h: 232 } },
          nodes: {
            visitor: { x: 24, y: 40, w: 236 }, web: { x: 390, y: 40, w: 236 },
            db: { x: 24, y: 216, w: 236 }, api: { x: 390, y: 216, w: 236 }, mail: { x: 756, y: 216, w: 224 },
            ops: { x: 24, y: 396, w: 236 }, internal: { x: 390, y: 396, w: 236 }, kit: { x: 24, y: 506, w: 236 },
          },
          edges: {
            client: { lx: 508, ly: 148 },
            admin: { lx: 508, ly: 328 },
            kit: { lx: 142, ly: 483 },
          },
        },
        mobile: {
          w: 360, h: 950,
          groups: { pub: { x: 0, y: 0, w: 360, h: 212 }, be: { x: 0, y: 262, w: 360, h: 312 }, int: { x: 0, y: 630, w: 360, h: 312 } },
          nodes: {
            visitor: { x: 50, y: 40, w: 250 }, web: { x: 50, y: 140, w: 250 },
            api: { x: 50, y: 302, w: 250 }, db: { x: 50, y: 402, w: 250 }, mail: { x: 50, y: 502, w: 250 },
            internal: { x: 50, y: 670, w: 250 }, ops: { x: 50, y: 770, w: 250 }, kit: { x: 50, y: 870, w: 250 },
          },
          edges: {
            visit: { lx: 175, ly: 118 },
            client: { lx: 175, ly: 237 },
            tx: { lx: 175, ly: 380 },
            mail: { d: 'M50 330C24 330 20 338 20 366L20 502C20 526 24 530 47 530', hide: true },
            login: { from: 't', to: 'b', lx: 175, ly: 748 },
            admin: { d: 'M300 698C336 698 340 690 340 660L340 368C340 342 336 338 303 338', hide: true },
            kit: { lx: 175, ly: 848 },
          },
        },
      },
    },
    {
      type: 'diagram', key: 'portal',
      spec: {
        id: 'eclipse-modes',
        nodes: [
          { id: 'code', kind: 'code' },
          { id: 'build', kind: 'gate', tone: 'yellow' },
          { id: 'demo', kind: 'client', tone: 'blue' },
          { id: 'fixtures', kind: 'doc', tone: 'blue' },
          { id: 'live', kind: 'client', tone: 'coral' },
          { id: 'api', kind: 'server', tone: 'coral' },
        ],
        edges: [
          { id: 'compile', from: 'code', to: 'build' },
          { id: 'demo', from: 'build', to: 'demo', tone: 'blue' },
          { id: 'nonet', from: 'demo', to: 'fixtures', tone: 'blue', dashed: true },
          { id: 'live', from: 'build', to: 'live', tone: 'coral' },
          { id: 'link', from: 'live', to: 'api', tone: 'coral' },
        ],
        desktop: {
          w: 1000, h: 480,
          nodes: {
            code: { x: 380, y: 20, w: 240 }, build: { x: 380, y: 140, w: 240 },
            demo: { x: 140, y: 270, w: 240 }, live: { x: 620, y: 270, w: 240 },
            fixtures: { x: 140, y: 400, w: 240 }, api: { x: 620, y: 400, w: 240 },
          },
          edges: {
            compile: { lx: 500, ly: 112 },
            demo: { from: 'l', to: 't', lx: 290, ly: 226 },
            live: { from: 'r', to: 't', lx: 710, ly: 226 },
            nonet: { lx: 260, ly: 367 },
            link: { lx: 740, ly: 367 },
          },
        },
        mobile: {
          w: 360, h: 420,
          nodes: {
            code: { x: 55, y: 10, w: 250 }, build: { x: 55, y: 104, w: 250 },
            demo: { x: 8, y: 226, w: 160 }, live: { x: 186, y: 226, w: 160 },
            fixtures: { x: 8, y: 346, w: 160 }, api: { x: 186, y: 346, w: 160 },
          },
          edges: {
            compile: { lx: 180, ly: 85 },
            demo: { from: 'b', to: 't', fo: -70, lx: 88, ly: 194 },
            live: { from: 'b', to: 't', fo: 70, lx: 266, ly: 194 },
            nonet: { lx: 88, ly: 314 },
            link: { lx: 266, ly: 314 },
          },
        },
      },
    },
    { type: 'text', key: 'backend' },
    {
      type: 'diagram', key: 'journey',
      spec: {
        id: 'eclipse-journey',
        groups: [{ id: 'before' }, { id: 'after', tone: 'green' }],
        nodes: [
          { id: 'order', kind: 'client' },
          { id: 'req', kind: 'queue', tone: 'coral' },
          { id: 'review', kind: 'person' },
          { id: 'accepted', kind: 'doc' },
          { id: 'deal', kind: 'gate', tone: 'green' },
          { id: 'project', kind: 'db', tone: 'blue' },
          { id: 'ops', kind: 'client' },
          { id: 'client', kind: 'client', tone: 'blue' },
        ],
        edges: [
          { id: 'send', from: 'order', to: 'req', tone: 'coral' },
          { id: 'rev', from: 'req', to: 'review' },
          { id: 'ok', from: 'review', to: 'accepted' },
          { id: 'deal', from: 'accepted', to: 'deal', dashed: true },
          { id: 'born', from: 'deal', to: 'project', tone: 'green' },
          { id: 'write', from: 'ops', to: 'project', tone: 'blue' },
          { id: 'read', from: 'project', to: 'client', tone: 'blue' },
        ],
        desktop: {
          w: 1000, h: 450,
          groups: { before: { x: 0, y: 0, w: 1000, h: 120 }, after: { x: 0, y: 176, w: 1000, h: 264 } },
          nodes: {
            order: { x: 20, y: 40, w: 215 }, req: { x: 265, y: 40, w: 215 }, review: { x: 510, y: 40, w: 215 }, accepted: { x: 755, y: 40, w: 225 },
            client: { x: 16, y: 216, w: 248 }, project: { x: 380, y: 216, w: 240 }, deal: { x: 750, y: 216, w: 230 },
            ops: { x: 380, y: 360, w: 240 },
          },
          edges: {
            deal: { lx: 866, ly: 148 },
            write: { lx: 500, ly: 320 },
          },
        },
        mobile: {
          w: 360, h: 866,
          groups: { before: { x: 0, y: 0, w: 360, h: 400 }, after: { x: 0, y: 456, w: 360, h: 400 } },
          nodes: {
            order: { x: 50, y: 40, w: 250 }, req: { x: 50, y: 136, w: 250 }, review: { x: 50, y: 232, w: 250 }, accepted: { x: 50, y: 328, w: 250 },
            deal: { x: 50, y: 496, w: 250 }, project: { x: 50, y: 592, w: 250 }, ops: { x: 50, y: 688, w: 250 }, client: { x: 50, y: 784, w: 250 },
          },
          edges: {
            deal: { lx: 175, ly: 428 },
            born: { lx: 175, ly: 572 },
            write: { from: 't', to: 'b', lx: 175, ly: 668 },
            read: { d: 'M300 620C338 620 344 628 344 656L344 780C344 806 338 812 303 812', hide: true },
          },
        },
      },
    },
    { type: 'flow', key: 'stages', cols: 5 },
    { type: 'text', key: 'ops' },
    { type: 'text', key: 'kit' },
    {
      type: 'sequence', key: 'session',
      spec: {
        id: 'eclipse-session',
        lanes: [{ id: 'portal', kind: 'client' }, { id: 'api', kind: 'server' }, { id: 'db', kind: 'db' }],
        msgs: [
          { id: 'csrf', from: 'portal', to: 'api' },
          { id: 'login', from: 'portal', to: 'api' },
          { id: 'check', from: 'api', to: 'api' },
          { id: 'store', from: 'api', to: 'db' },
          { id: 'cookies', from: 'api', to: 'portal', back: true },
          { id: 'call', from: 'portal', to: 'api' },
          { id: 'expired', from: 'api', to: 'portal', back: true },
          { id: 'refresh', from: 'portal', to: 'api' },
          { id: 'rotate', from: 'api', to: 'db' },
        ],
      },
    },
    { type: 'checks', key: 'security' },
    { type: 'decisions', key: 'decisions' },
    { type: 'readouts', key: 'quality' },
    { type: 'stack', key: 'stack' },
    { type: 'gallery', key: 'gallery', dir: '/media/portals', shots: ['eclipse-landing', 'eclipse-landing-precios', 'eclipse-portal-proyectos', 'eclipse-portal-detalle', 'eclipse-ops-prospectos', 'eclipse-ops-proyectos', 'eclipse-ops-calendario'] },
    { type: 'limits', key: 'status' },
  ],
  links: [{ label: 'eclipse-business.com', href: 'https://eclipse-business.com/' }],
};
