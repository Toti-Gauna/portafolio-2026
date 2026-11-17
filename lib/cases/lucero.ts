import type { CaseDef } from './types';
import { gridLayouts } from './grid';

/** Lucero: a fictional bar-restaurant (Demo) that shows «Eclipse para restaurantes»: the diner's menu with Gus, the order, the
 *  kitchen and a CRM, also split across phones by role. Facts: the repo Toti-Gauna/foody (CLAUDE.md, docs/PLAN-EJECUCION.md,
 *  SDD-0.1-DESCUBRIMIENTO.md, ROADMAP.md, DEPLOY.md, EXPERIENCIA-CARTA-GUS.md, procedencia.md), read on 17/11/2026. Its README is
 *  out of date («planning»), so it is not used. Foody-be (the relay on Render) lives in another repo: only what the frontend shows is described.
 *  Never named: the real business used as a reference, plan prices, the WhatsApp number. Ola 7b: no showcase or screenshots yet.
 *  Retention of the diner's data: 90 days, then anonymised (Ignacio, 17/11/2026; the SDD said 90 and the ROADMAP 12 months). */
const nowGrid = gridLayouts([['mesa', 'mozo', 'cocina'], ['owner'], ['bc', 'rtc', 'relay']]);
const realGrid = gridLayouts([['phones', 'auth', 'screens'], ['api'], ['db', 'rt']]);

export const lucero: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    { type: 'flow', key: 'cycle', cols: 3 },
    {
      type: 'diagram', key: 'now',
      spec: {
        id: 'lucero-now',
        nodes: [
          { id: 'mesa', kind: 'client' },
          { id: 'mozo', kind: 'client' },
          { id: 'cocina', kind: 'client' },
          { id: 'owner', kind: 'client', tone: 'coral' },
          { id: 'bc', kind: 'queue', tone: 'blue' },
          { id: 'rtc', kind: 'cloud' },
          { id: 'relay', kind: 'external', tone: 'yellow' },
        ],
        edges: [
          { id: 'asks', from: 'mesa', to: 'owner' },
          { id: 'asks2', from: 'mozo', to: 'owner' },
          { id: 'moves', from: 'cocina', to: 'owner' },
          { id: 'tabs', from: 'owner', to: 'bc', tone: 'blue', dashed: true },
          { id: 'p2p', from: 'owner', to: 'rtc', dashed: true },
          { id: 'ws', from: 'owner', to: 'relay', tone: 'yellow' },
        ],
        desktop: nowGrid.desktop,
        mobile: nowGrid.mobile,
      },
    },
    { type: 'text', key: 'sync' },
    { type: 'text', key: 'real' },
    {
      // Ola 7b: the full product. Next.js + Neon (Postgres) + a table session signed by the QR + roles are in the SDD; the real-time
      // mechanism is left «to decide in the phase 0.5 ADR» (options shown, none chosen); everything else is my proposal.
      type: 'diagram', key: 'realArch',
      spec: {
        id: 'lucero-real-arch',
        nodes: [
          { id: 'phones', kind: 'client' },
          { id: 'auth', kind: 'gate', tone: 'coral' },
          { id: 'screens', kind: 'client' },
          { id: 'api', kind: 'server', tone: 'blue' },
          { id: 'db', kind: 'db', tone: 'blue' },
          { id: 'rt', kind: 'cloud', tone: 'yellow' },
        ],
        edges: [
          { id: 'qr', from: 'phones', to: 'auth', tone: 'coral' },
          { id: 'login', from: 'screens', to: 'auth', tone: 'coral' },
          { id: 'session', from: 'auth', to: 'api' },
          { id: 'tx', from: 'api', to: 'db', tone: 'blue' },
          { id: 'events', from: 'api', to: 'rt', tone: 'yellow' },
          { id: 'push', from: 'rt', to: 'screens', dashed: true },
        ],
        desktop: realGrid.desktop,
        mobile: realGrid.mobile,
      },
    },
    {
      type: 'sequence', key: 'realFlow',
      spec: {
        id: 'lucero-real-flow',
        lanes: [{ id: 'diner', kind: 'person' }, { id: 'api', kind: 'server' }, { id: 'db', kind: 'db' }, { id: 'rt', kind: 'cloud' }, { id: 'kitchen', kind: 'client' }],
        msgs: [
          { id: 'scan', from: 'diner', to: 'api' },
          { id: 'verify', from: 'api', to: 'api' },
          { id: 'send', from: 'diner', to: 'api' },
          { id: 'tx', from: 'api', to: 'db' },
          { id: 'ok', from: 'api', to: 'diner', back: true },
          { id: 'publish', from: 'api', to: 'rt' },
          { id: 'arrive', from: 'rt', to: 'kitchen' },
          { id: 'advance', from: 'kitchen', to: 'api', back: true },
          { id: 'seen', from: 'rt', to: 'diner', back: true },
        ],
      },
    },
    { type: 'text', key: 'realData' },
    { type: 'checks', key: 'realSec' },
    { type: 'decisions', key: 'decisions' },
    { type: 'limits', key: 'status' },
  ],
  steps: [
    { id: 'what', blocks: ['what', 'cycle'] },
    { id: 'how', blocks: ['now', 'sync'] },
    { id: 'real', blocks: ['real', 'realArch', 'realFlow', 'realData', 'realSec'] },
    { id: 'decisions', blocks: ['decisions'] },
    { id: 'status', blocks: ['status'] },
  ],
};
