import type { CaseDef } from './types';

/** Tuenti: professional work at Tsoft. No architecture, data, metrics or screenshots (confidential). */
export const tuenti: CaseDef = {
  blocks: [
    { type: 'text', key: 'context' },
    { type: 'flow', key: 'path', cols: 4 },
    { type: 'checks', key: 'did' },
    { type: 'art', key: 'drawn', art: 'tuenti' },
    { type: 'stack', key: 'stack' },
    { type: 'text', key: 'learned' },
    { type: 'limits', key: 'hidden' },
  ],
  steps: [
    { id: 'what', blocks: ['context', 'path'] },
    { id: 'see', blocks: ['drawn'] },
    { id: 'role', blocks: ['did', 'stack', 'learned'] },
    { id: 'status', blocks: ['hidden'] },
  ],
};
