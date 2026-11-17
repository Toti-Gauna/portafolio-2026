import type { CaseDef } from './types';

/** Kinetic Studio: the motion-graphics lab (public repo) and the kit behind the portfolio's trailer.
 *  Facts: scratchpad facts/kinetic.md (repo HEAD 30f1280, read on 28/10/2026) and facts/portfolio.md (the trailer).
 *  Not claimed: that every trailer is pure code (two commercials animate captures; they are not featured), that the
 *  export tool lives in the repo, or that the repo has tests. */
export const kinetic: CaseDef = {
  blocks: [
    { type: 'text', key: 'what' },
    {
      type: 'showcase', key: 'media',
      items: [
        { id: 'kinetic-formas', kind: 'video', frame: 'browser', src: '/media/kinetic/kinetic-formas.mp4', poster: '/media/kinetic/kinetic-formas.jpg', w: 1280, h: 720, url: 'kinetic-studio' },
        { id: 'kinetic-ritmo', kind: 'video', frame: 'browser', src: '/media/kinetic/kinetic-ritmo.mp4', poster: '/media/kinetic/kinetic-ritmo.jpg', w: 1280, h: 720, url: 'kinetic-studio' },
        { id: 'kinetic-profundidad', kind: 'video', frame: 'browser', src: '/media/kinetic/kinetic-profundidad.mp4', poster: '/media/kinetic/kinetic-profundidad.jpg', w: 1280, h: 720, url: 'kinetic-studio' },
        { id: 'lab-bauhaus', kind: 'video', frame: 'browser', src: '/media/kinetic/lab-bauhaus.mp4', poster: '/media/kinetic/lab-bauhaus.jpg', w: 1280, h: 720, url: 'kinetic-studio' },
        { id: 'lab-data-story', kind: 'video', frame: 'browser', src: '/media/kinetic/lab-data-story.mp4', poster: '/media/kinetic/lab-data-story.jpg', w: 1280, h: 720, url: 'kinetic-studio' },
        { id: 'lab-hyperspace', kind: 'video', frame: 'browser', src: '/media/kinetic/lab-hyperspace.mp4', poster: '/media/kinetic/lab-hyperspace.jpg', w: 1280, h: 720, url: 'kinetic-studio' },
      ],
    },
    {
      // One paused master timeline drives picture and sound; ?t= and the warm-up pass are both just seeks.
      type: 'diagram', key: 'engine',
      spec: {
        id: 'kinetic-engine',
        nodes: [
          { id: 'config', kind: 'doc' },
          { id: 'recipes', kind: 'code' },
          { id: 'score', kind: 'doc', tone: 'yellow' },
          { id: 'tl', kind: 'queue', tone: 'coral' },
          { id: 'seek', kind: 'external' },
          { id: 'warm', kind: 'service', tone: 'blue' },
          { id: 'image', kind: 'client' },
          { id: 'sound', kind: 'service', tone: 'yellow' },
        ],
        edges: [
          { id: 'run', from: 'config', to: 'recipes' },
          { id: 'tweens', from: 'recipes', to: 'tl', tone: 'coral' },
          { id: 'notes', from: 'score', to: 'tl', tone: 'yellow' },
          { id: 'freeze', from: 'seek', to: 'tl', dashed: true },
          { id: 'warmup', from: 'warm', to: 'tl', dashed: true, tone: 'blue' },
          { id: 'draw', from: 'tl', to: 'image', tone: 'coral' },
          { id: 'play', from: 'tl', to: 'sound', tone: 'yellow' },
        ],
        desktop: {
          w: 1000, h: 470,
          nodes: {
            seek: { x: 520, y: 40, w: 230 },
            config: { x: 20, y: 210, w: 200 }, recipes: { x: 270, y: 210, w: 200 }, tl: { x: 520, y: 210, w: 230 }, image: { x: 800, y: 210, w: 180 },
            score: { x: 270, y: 380, w: 200 }, warm: { x: 520, y: 380, w: 230 }, sound: { x: 800, y: 380, w: 180 },
          },
          edges: {
            run: { lx: 245, ly: 180 },
            tweens: { too: -12, lx: 495, ly: 180 },
            notes: { from: 't', to: 'b', fo: 60, too: -80, lx: 420, ly: 330 },
            freeze: { lx: 635, ly: 157 },
            warmup: { lx: 635, ly: 327 },
            draw: { from: 'r', to: 'l', fo: -14, lx: 800, ly: 180 },
            play: { from: 'r', to: 'l', fo: 14, lx: 790, ly: 330 },
          },
        },
        mobile: {
          w: 360, h: 512,
          nodes: {
            config: { x: 12, y: 12, w: 154 }, seek: { x: 194, y: 12, w: 154 },
            recipes: { x: 12, y: 120, w: 154 }, score: { x: 194, y: 120, w: 154 },
            tl: { x: 55, y: 228, w: 250 },
            image: { x: 12, y: 336, w: 154 }, sound: { x: 194, y: 336, w: 154 },
            warm: { x: 55, y: 444, w: 250 },
          },
          edges: {
            run: { lx: 76, ly: 94 },
            // from the seek box down the gap between the two columns, into the timeline's top
            freeze: { d: 'M194 40C180 40 180 40 180 60L180 225', lx: 196, ly: 94 },
            tweens: { from: 'b', to: 't', too: -60, lx: 76, ly: 202 },
            notes: { from: 'b', to: 't', too: 60, lx: 282, ly: 202 },
            draw: { from: 'b', to: 't', fo: -60, lx: 80, ly: 310 },
            play: { from: 'b', to: 't', fo: 60, lx: 290, ly: 310 },
            warmup: { lx: 180, ly: 418 },
          },
        },
      },
    },
    { type: 'flow', key: 'pipeline', cols: 4 },
    { type: 'text', key: 'flagship' },
    { type: 'flow', key: 'acts', cols: 4 },
    { type: 'readouts', key: 'film' },
    {
      type: 'sequence', key: 'host',
      spec: {
        id: 'kinetic-host',
        lanes: [{ id: 'page', kind: 'client' }, { id: 'film', kind: 'code' }, { id: 'audio', kind: 'service' }],
        msgs: [
          { id: 'click', from: 'page', to: 'page' },
          { id: 'open', from: 'page', to: 'film' },
          { id: 'borrow', from: 'film', to: 'audio' },
          { id: 'warm', from: 'film', to: 'film' },
          { id: 'ready', from: 'film', to: 'page', back: true },
          { id: 'ctrl', from: 'page', to: 'film' },
          { id: 'end', from: 'film', to: 'page', back: true },
          { id: 'close', from: 'page', to: 'audio' },
        ],
      },
    },
    { type: 'decisions', key: 'decisions' },
    { type: 'readouts', key: 'quality' },
    { type: 'stack', key: 'stack' },
    { type: 'gallery', key: 'gallery', dir: '/media/lab', shots: ['kinetic'] },
    { type: 'text', key: 'debt' },
    { type: 'limits', key: 'status' },
  ],
  links: [
    { label: 'toti-gauna.github.io/motion-animations', href: 'https://toti-gauna.github.io/motion-animations/' },
    { label: 'github.com/Toti-Gauna/kinetic-studio', href: 'https://github.com/Toti-Gauna/kinetic-studio' },
  ],
};
