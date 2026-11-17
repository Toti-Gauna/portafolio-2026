import type { CaseDef } from './types';
import { gridLayouts } from './grid';

/** HandyX: «MVP · proyecto propio» (Ignacio, 16/11/2026). Two PWAs (user app, specialist app) with a simulated server;
 *  the backends are private repos that were NOT read: everything about them comes from the contracts and docs of the two
 *  frontends (handyx-client-fe and handyx-specialist-fe, public, main at ca04340 and f7c0733, read on 17/11/2026).
 *  Ignacio (17/11/2026): the case carries the `real` step even though its state is MVP, and tells how the backend of both
 *  sides was thought. No money screens, no fee, no captures in this wave. Never says it is not a venture. */
const g = gridLayouts([
  ['appU', 'appE'],
  ['apiU', 'apiE'],
  ['pay', 'db', 'media'],
  ['portal'],
]);

export const handyx: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    { type: 'checks', key: 'today' },
    { type: 'text', key: 'real' },
    {
      type: 'diagram', key: 'realArch',
      spec: {
        id: 'handyx-real-arch',
        nodes: [
          { id: 'appU', kind: 'client' },
          { id: 'appE', kind: 'client', tone: 'yellow' },
          { id: 'apiU', kind: 'server', tone: 'coral' },
          { id: 'apiE', kind: 'server', tone: 'coral' },
          { id: 'pay', kind: 'external', tone: 'paper' },
          { id: 'db', kind: 'db', tone: 'blue' },
          { id: 'media', kind: 'cloud', tone: 'paper' },
          { id: 'portal', kind: 'client', tone: 'paper' },
        ],
        edges: [
          { id: 'uCall', from: 'appU', to: 'apiU', tone: 'coral' },
          { id: 'eCall', from: 'appE', to: 'apiE', tone: 'coral' },
          { id: 'shared', from: 'apiU', to: 'apiE', dashed: true },
          { id: 'uSql', from: 'apiU', to: 'db', tone: 'blue' },
          { id: 'eSql', from: 'apiE', to: 'db', tone: 'blue' },
          { id: 'checkout', from: 'apiU', to: 'pay', dashed: true },
          { id: 'photos', from: 'apiE', to: 'media' },
          { id: 'review', from: 'portal', to: 'db', dashed: true },
        ],
        desktop: g.desktop,
        mobile: g.mobile,
      },
    },
    {
      type: 'sequence', key: 'realFlow',
      spec: {
        id: 'handyx-real-flow',
        lanes: [
          { id: 'usr', kind: 'client' },
          { id: 'apiU', kind: 'server' },
          { id: 'db', kind: 'db' },
          { id: 'apiE', kind: 'server' },
          { id: 'spec', kind: 'client' },
        ],
        msgs: [
          { id: 'order', from: 'usr', to: 'apiU' },
          { id: 'saveOrder', from: 'apiU', to: 'db' },
          { id: 'eligible', from: 'spec', to: 'apiE' },
          { id: 'offer', from: 'spec', to: 'apiE' },
          { id: 'saveOffer', from: 'apiE', to: 'db' },
          { id: 'accept', from: 'usr', to: 'apiU' },
          { id: 'tx', from: 'apiU', to: 'db' },
          { id: 'events', from: 'spec', to: 'apiE' },
          { id: 'close', from: 'usr', to: 'apiU' },
        ],
      },
    },
    { type: 'text', key: 'realData' },
    { type: 'checks', key: 'realSec' },
    { type: 'checks', key: 'sec' },
    { type: 'decisions', key: 'decisions' },
    { type: 'limits', key: 'status' },
  ],
  steps: [
    { id: 'what', blocks: ['what'] },
    { id: 'how', blocks: ['today'] },
    { id: 'real', blocks: ['real', 'realArch', 'realFlow', 'realData', 'realSec'] },
    { id: 'security', blocks: ['sec'] },
    { id: 'decisions', blocks: ['decisions'] },
    { id: 'status', blocks: ['status'] },
  ],
  // No repo links: the visibility of the two frontends could not be checked from here (see the final report).
};
