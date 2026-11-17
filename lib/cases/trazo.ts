import type { CaseDef } from './types';
import { gridLayouts } from './grid';

/** Trazo: Ignacio's personal tracker, a PWA he uses every day (no `real` step: he did not ask for a backend for this one).
 *  Facts: repo Toti-Gauna/personal-tracker, branch main (54141a4, 16/11/2026), read on 17/11/2026. The first local clone
 *  was an old branch (ola 1): always read `main`. The repo is public but holds Ignacio's personal plan (roadmap, goals,
 *  names): only sample data is shown here, and no repo link is given (see the final report). */
const g = gridLayouts([
  ['screens', 'sw'],
  ['store'],
  ['domain', 'ls', 'backup'],
]);

export const trazo: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    {
      type: 'diagram', key: 'arch',
      spec: {
        id: 'trazo-arch',
        nodes: [
          { id: 'screens', kind: 'client' },
          { id: 'sw', kind: 'service', tone: 'paper' },
          { id: 'store', kind: 'service', tone: 'blue' },
          { id: 'domain', kind: 'code', tone: 'coral' },
          { id: 'ls', kind: 'db', tone: 'blue' },
          { id: 'backup', kind: 'doc' },
        ],
        edges: [
          { id: 'precache', from: 'sw', to: 'screens', dashed: true },
          { id: 'actions', from: 'screens', to: 'store' },
          { id: 'rules', from: 'store', to: 'domain', tone: 'coral' },
          { id: 'save', from: 'store', to: 'ls', tone: 'blue' },
          { id: 'export', from: 'store', to: 'backup', dashed: true },
        ],
        desktop: g.desktop,
        mobile: g.mobile,
      },
    },
    { type: 'flow', key: 'ladder', cols: 3 },
    { type: 'readouts', key: 'rules' },
    { type: 'text', key: 'data' },
    { type: 'decisions', key: 'decisions' },
    { type: 'readouts', key: 'quality' },
    { type: 'stack', key: 'stack' },
    { type: 'limits', key: 'status' },
  ],
  steps: [
    { id: 'what', blocks: ['what'] },
    { id: 'how', blocks: ['arch', 'ladder', 'rules', 'data'] },
    { id: 'decisions', blocks: ['decisions'] },
    { id: 'quality', blocks: ['quality', 'stack'] },
    { id: 'status', blocks: ['status'] },
  ],
};
