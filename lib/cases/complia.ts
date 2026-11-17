import type { CaseDef } from './types';

/** CompliA: a GENERIC, labelled scheme of how a RAG assistant like it works (approved by Ignacio, 28/10/2026).
 *  Not Telefónica's architecture: no system names, data, controls or providers. */
const W = 240;
export const complia: CaseDef = {
  blocks: [
    { type: 'text', key: 'context' },
    { type: 'text', key: 'problem' },
    {
      type: 'diagram', key: 'how',
      spec: {
        id: 'complia-rag',
        nodes: [
          { id: 'user', kind: 'person' },
          { id: 'ui', kind: 'client' },
          { id: 'search', kind: 'db', tone: 'blue' },
          { id: 'llm', kind: 'ai', tone: 'yellow' },
          { id: 'rules', kind: 'gate', tone: 'coral' },
          { id: 'answer', kind: 'doc' },
          { id: 'human', kind: 'person', tone: 'green' },
        ],
        edges: [
          { id: 'ask', from: 'user', to: 'ui' },
          { id: 'query', from: 'ui', to: 'search' },
          { id: 'ctx', from: 'search', to: 'llm', tone: 'blue' },
          { id: 'draft', from: 'llm', to: 'rules', tone: 'yellow' },
          { id: 'ok', from: 'rules', to: 'answer' },
          { id: 'review', from: 'answer', to: 'human', tone: 'green' },
        ],
        desktop: {
          w: 1000, h: 470,
          nodes: { user: { x: 20, y: 30, w: W }, ui: { x: 380, y: 30, w: W }, search: { x: 740, y: 30, w: W }, llm: { x: 740, y: 200, w: W }, rules: { x: 380, y: 200, w: W }, answer: { x: 20, y: 200, w: W }, human: { x: 20, y: 370, w: W } },
        },
        mobile: {
          w: 360, h: 640,
          nodes: Object.fromEntries(['user', 'ui', 'search', 'llm', 'rules', 'answer', 'human'].map((id, i) => [id, { x: 50, y: 14 + i * 92, w: 250 }])),
        },
      },
    },
    { type: 'flow', key: 'steps', cols: 4 },
    { type: 'text', key: 'role' },
    { type: 'checks', key: 'limitsByDesign' },
    { type: 'video', key: 'demo', src: '/media/complia-demo.mp4', poster: '/media/complia-demo-poster.jpg' },
    { type: 'limits', key: 'hidden' },
  ],
};
