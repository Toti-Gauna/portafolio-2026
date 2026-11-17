import type { CaseDef } from './types';

/** trazo: stub, filled in Ola 7b. */
export const trazo: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    { type: 'limits', key: 'status' },
  ],
  steps: [
    { id: 'what', blocks: ['what'] },
    { id: 'status', blocks: ['status'] },
  ],
};
