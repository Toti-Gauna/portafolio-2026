import type { CaseDef } from './types';

/** handyx: stub, filled in Ola 7b. */
export const handyx: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    { type: 'limits', key: 'status' },
  ],
  steps: [
    { id: 'what', blocks: ['what'] },
    { id: 'status', blocks: ['status'] },
  ],
};
