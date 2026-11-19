import type { CaseSlug } from '../cases';
import { circle, isle, pip, seg } from '../../work/world-kit';

/**
 * The object of each case (lote 5.3): one isometric object per product, drawn once at build time with the kit of
 * the world of Work, that explains «Cómo funciona» by itself. It has as many phases as the case has steps, and
 * every part says when it belongs: `data-from="i"` (it appears at step i and stays), `data-only="i"` (it is there
 * only during step i: something that moves from one place to another is drawn in each place) and `data-now="i"`
 * (it lights up during step i). The HTML is the last phase, whole: with no JavaScript, or with reduced motion,
 * the object is complete. Ink solids, paper where there is light, one accent (--a, the colour of the case).
 */
type I = ReturnType<typeof isle>;
type Art = { box: [number, number, number, number]; svg: string; phases: number };

const at = (attr: 'from' | 'only' | 'now', i: number, svg: string) => `<g data-${attr}="${i}">${svg}</g>`;
const from = (i: number, svg: string) => at('from', i, svg);
const only = (i: number, svg: string) => at('only', i, svg);
const now = (i: number, svg: string) => at('now', i, svg);

/** Lines of text on a sheet that stands facing left (y = yF), from x0 to x1, at heights zs. */
const textLines = (I: I, yF: number, x0: number, x1: number, zs: number[], cls = 'wa-l wa-l--ink') => I.lines(zs.map((z, i) => [[x0, yF, z], [x1 - (i % 2 ? 6 : 0), yF, z]]), cls);
/** A chat bubble standing, facing left. */
const bubble = (I: I, x: number, y: number, z: number, w = 30, h = 18) => I.box(x, y, w, 3, z, h, { lit: true, r: 2 }) + I.face([[x + 5, y + 3.1, z], [x + 11, y + 3.1, z], [x + 4, y + 3.1, z - 7]], 'wa-lit') + I.lines([[[x + 5, y + 3.2, z + h * 0.66], [x + w - 6, y + 3.2, z + h * 0.66]], [[x + 5, y + 3.2, z + h * 0.33], [x + w - 12, y + 3.2, z + h * 0.33]]], 'wa-l wa-l--ink');
/** A check mark standing in the plane facing left. */
const check = (I: I, x: number, y: number, z: number, s = 6) => I.line([[x - s, y, z], [x - s * 0.3, y, z - s * 0.7], [x + s, y, z + s * 0.9]], 'wa-acc-l');
/** A phone lying a little tilted: a thin slab with a screen. */
const phone = (I: I, x: number, y: number, lit = false) => I.box(x - 7, y - 12, 14, 24, 0, 3) + I.face([[x - 5.5, y - 10, 3.1], [x + 5.5, y - 10, 3.1], [x + 5.5, y + 10, 3.1], [x - 5.5, y + 10, 3.1]], lit ? 'wa-acc' : 'wa-win');
/** A floor line between stations, dashed. */
const trail = (I: I, pts: [number, number][]) => I.line(pts.map(([x, y]) => [x, y, 0.2]), 'ob-trail');

const ART: Record<CaseSlug, (I: I) => string> = {
  /* CompliA: a stack of documents, a lens that finds, a check that validates, a gate that leaves some cases to a
     person, and the ruling with its seal. */
  complia: (I) =>
    I.box(-120, -40, 250, 110, -6, 6, { r: 6 }) + trail(I, [[-80, 10], [-20, -10], [40, -10], [95, 15]]) +
    // the documents
    from(0, I.box(-100, 0, 34, 3, 0, 44, { lit: true }) + I.box(-95, 6, 34, 3, 0, 40, { lit: true }) + I.box(-90, 12, 34, 3, 0, 36, { lit: true }) + textLines(I, 15.2, -86, -60, [28, 22, 16, 10])) +
    // the lens: it finds the line that matters
    now(0, I.face([[-86, 15.3, 22.6], [-62, 15.3, 22.6], [-62, 15.3, 20.4], [-86, 15.3, 20.4]], 'wa-acc')) +
    only(0, I.wheel(-74, 18, 30, 11, 'y', 'wa-acc-l') + I.line([[-66, 18, 22], [-58, 18, 12]], 'wa-pole')) +
    // the check: every answer is validated before it shows
    from(1, I.box(-30, -24, 26, 26, 0, 22) + I.box(-26, -20, 18, 18, 22, 3, { lit: true }) + I.line([[-22, -11, 25.4], [-18, -7, 25.4], [-10, -17, 25.4]], 'wa-acc-l')) +
    now(1, I.dot(-17, -11, 36, 4.5, 'wa-acc')) +
    // the gate: some processes go to a person
    from(2, I.box(28, -30, 6, 6, 0, 30) + I.box(52, -30, 6, 6, 0, 30) + I.box(28, -30, 30, 6, 30, 5) + I.line([[34, -27, 14], [52, -27, 14]], 'wa-acc-l') + I.cyl(43, 2, 5, 0, 15) + I.dot(43, 2, 21, 4.6, 'wa-lit')) +
    now(2, I.ring(43, 2, 9, 0.3, 'wa-acc-l')) +
    // the ruling, with its seal
    from(3, I.box(80, 0, 36, 26, 0, 4, { lit: true }) + I.lines([[[86, 4, 4.2], [108, 4, 4.2]], [[86, 9, 4.2], [104, 9, 4.2]], [[86, 14, 4.2], [108, 14, 4.2]]], 'wa-l wa-l--ink') + I.cyl(104, 19, 5.5, 4, 1.4, { className: 'ob-acc' })) +
    now(3, I.cyl(104, 19, 4.6, 14, 16) + I.cyl(104, 19, 6.5, 30, 4)),

  /* Tuenti: the wheel of prizes, the dashboard that measures, and the phone that tops up and pays. */
  tuenti: (I) =>
    I.box(-110, -40, 230, 100, -6, 6, { r: 6 }) +
    from(0, I.box(-86, -4, 26, 14, 0, 6) + I.line([[-73, 3, 6], [-73, 3, 22]], 'wa-pole') +
      I.turn('y', -73, 3, 44, 'ob-spin', [circle(22, 'wa-wheel'), ...Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return seg(0, 0, Math.cos(a) * 21, Math.sin(a) * 21, 'wa-pole'); }), ...Array.from({ length: 8 }, (_, i) => { const a = (i / 8 + 1 / 16) * Math.PI * 2; return pip(Math.cos(a) * 15, Math.sin(a) * 15, 2.6, i % 3 ? 'wa-lit' : 'wa-acc'); }), pip(0, 0, 3.5, 'wa-acc')]) +
      I.face([[-73, 3, 70], [-70, 3, 76], [-76, 3, 76]], 'wa-acc')) +
    now(0, I.burst(-73, 3, 44, 34, 12)) +
    from(1, I.box(-14, -26, 46, 6, 0, 40) + I.face([[-11, -19.9, 5], [29, -19.9, 5], [29, -19.9, 36], [-11, -19.9, 36]], 'wa-win') +
      I.box(-7, -20.4, 6, 0.6, 6, 10, { lit: true }) + I.box(3, -20.4, 6, 0.6, 6, 18, { lit: true }) + I.box(13, -20.4, 6, 0.6, 6, 14, { lit: true }) + I.box(23, -20.4, 4, 0.6, 6, 24, { className: 'ob-acc' })) +
    now(1, I.line([[-8, -20.5, 20], [2, -20.5, 28], [12, -20.5, 24], [26, -20.5, 34]], 'wa-acc-l')) +
    from(2, I.box(60, 0, 18, 32, 0, 3) + I.face([[62, 2, 3.1], [76, 2, 3.1], [76, 30, 3.1], [62, 30, 3.1]], 'wa-win') + I.cyl(96, -8, 7, 0, 3, { lit: true }) + I.cyl(96, -8, 7, 4, 3, { lit: true }) + I.cyl(96, -8, 7, 8, 3, { className: 'ob-acc' })) +
    now(2, check(I, 69, 16, 12, 5) + I.dot(96, -8, 18, 3, 'wa-acc')),

  /* Supernova: a stage with its star; the catalogue, a seat that is taken, the pass with its code, the creator, and
     the turnstile that reads the pass. */
  supernova: (I) =>
    I.box(-120, -40, 250, 110, -6, 6, { r: 6 }) +
    I.box(-20, -40, 60, 30, 0, 10) + I.star(10, -25, 52, 9) + I.line([[10, -25, 10], [10, -25, 40]], 'wa-pole') +
    from(0, I.box(-104, -6, 22, 2, 0, 30, { lit: true }) + I.box(-98, 2, 22, 2, 0, 30, { lit: true }) + I.box(-92, 10, 22, 2, 0, 30, { lit: true }) + I.face([[-89, 12.1, 18], [-73, 12.1, 18], [-73, 12.1, 27], [-89, 12.1, 27]], 'wa-acc')) +
    from(1, [0, 1, 2, 3].map((k) => I.box(-56 + k * 12, 16, 8, 8, 0, k === 2 ? 10 : 7, k === 2 ? { className: 'ob-acc' } : {})).join('')) +
    now(1, I.dot(-28, 20, 16, 2.6, 'wa-lit')) +
    from(2, I.box(4, 24, 24, 2, 0, 32, { lit: true }) + [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => ((r + c) % 2 ? '' : I.face([[8 + c * 5, 26.1, 8 + r * 5], [12 + c * 5, 26.1, 8 + r * 5], [12 + c * 5, 26.1, 12 + r * 5], [8 + c * 5, 26.1, 12 + r * 5]], 'wa-ink')))).join('') + I.dot(24, 26.2, 27, 2.4, 'wa-acc')) +
    from(3, I.box(56, -36, 22, 2, 0, 34, { lit: true }) + textLines(I, -33.9, 60, 74, [28, 22, 16, 10]) + I.line([[82, -38, 4], [74, -38, 26]], 'wa-l wa-l--thick wa-l--hi') + I.dot(74, -38, 26, 1.6, 'wa-acc')) +
    from(4, I.box(84, 26, 8, 8, 0, 28) + I.box(108, 26, 8, 8, 0, 28) + I.box(84, 26, 32, 8, 28, 5)) +
    now(4, I.line([[92, 30, 14], [108, 30, 14]], 'wa-acc-l') + I.line([[100, 30, 26], [100, 30, 4]], 'ob-beam')),

  /* Eclipse: five steps of a path, from the trade to the project, under the eclipse of the brand. */
  eclipse: (I) => {
    const step = (k: number) => [-80 + k * 40, 40 - k * 40] as const;
    const tiles = [0, 1, 2, 3, 4].map((k) => { const [x, y] = step(k); return from(k, I.box(x - 14, y - 14, 28, 28, 0, 4 + k * 3)) + now(k, I.face([[x - 14, y - 14, 4.2 + k * 3], [x + 14, y - 14, 4.2 + k * 3], [x + 14, y + 14, 4.2 + k * 3], [x - 14, y + 14, 4.2 + k * 3]], 'wa-acc ob-glow')); }).join('');
    const h = (k: number) => 4 + k * 3;
    const [x0, y0] = step(0), [x1, y1] = step(1), [x2, y2] = step(2), [x3, y3] = step(3), [x4, y4] = step(4);
    return I.box(-120, -80, 250, 160, -6, 6, { r: 6 }) +
      I.dot(70, -60, 92, 15, 'wa-ink') + I.burst(70, -60, 92, 30, 20) +
      tiles +
      // a house: the trade that opens the way
      from(0, I.box(x0 - 8, y0 - 6, 16, 12, h(0), 10) + I.gable(x0 - 9, y0 - 7, 18, 14, h(0) + 10, 7)) +
      // the demo, on a screen
      from(1, I.box(x1 - 10, y1 - 2, 20, 3, h(1), 16) + I.face([[x1 - 8, y1 + 1.1, h(1) + 2], [x1 + 8, y1 + 1.1, h(1) + 2], [x1 + 8, y1 + 1.1, h(1) + 14], [x1 - 8, y1 + 1.1, h(1) + 14]], 'wa-win') + I.dot(x1, y1 + 1.2, h(1) + 8, 3.4, 'wa-acc')) +
      // the message
      from(2, bubble(I, x2 - 12, y2 - 2, h(2) + 8, 24, 14)) +
      // the deal and its deposit
      from(3, I.box(x3 - 9, y3 - 2, 14, 2, h(3), 20, { lit: true }) + I.cyl(x3 + 6, y3 + 4, 5, h(3), 2.5, { className: 'ob-acc' }) + I.cyl(x3 + 6, y3 + 4, 5, h(3) + 3, 2.5, { className: 'ob-acc' })) +
      // the project in its portal: five stages
      from(4, [0, 1, 2, 3, 4].map((s) => I.box(x4 - 10 + s * 4.4, y4 - 3, 3.2, 6, h(4), 4 + s * 3, s === 4 ? { className: 'ob-acc' } : { lit: true })).join(''));
  },

  /* The agentic system: a request, a short spec, the agents of each role with their skills, the review, and the human gate. */
  agentes: (I) =>
    I.box(-125, -45, 260, 110, -6, 6, { r: 6 }) + trail(I, [[-95, 15], [-50, 0], [0, -10], [50, -10], [100, 5]]) +
    from(0, I.cyl(-100, 18, 6, 0, 18) + I.dot(-100, 18, 25, 5.4, 'wa-lit') + bubble(I, -94, 6, 26, 22, 12)) +
    from(1, I.box(-58, -4, 22, 2.4, 0, 32, { lit: true }) + textLines(I, -1.5, -54, -40, [26, 20, 14]) + check(I, -42, -1.4, 8, 3)) +
    from(2, [[-16, -26], [-2, -12], [12, -26]].map(([x, y], k) => I.box(x - 7, y - 7, 14, 14, 0, 14) + I.box(x - 3, y - 3, 6, 6, 14, 2.5, { lit: true }) + I.dot(x, y, 18.5, 1.8, k === 1 ? 'wa-acc' : 'wa-lit')).join('') + I.cyl(-2, -40, 8, 0, 6) + I.cyl(-2, -40, 8, 7, 6)) +
    now(2, I.ring(-2, -19, 26, 0.4, 'wa-acc-l')) +
    from(3, I.box(40, -22, 20, 20, 0, 36) + I.lines([[[42, -1.8, 26], [56, -1.8, 26]], [[42, -1.8, 18], [56, -1.8, 18]]], 'wa-l wa-l--hi') + check(I, 49, -1.6, 10, 4)) +
    from(4, I.box(84, -6, 6, 6, 0, 32) + I.box(108, -6, 6, 6, 0, 32) + I.box(84, -6, 30, 6, 32, 5) + I.cyl(99, 22, 5, 0, 15) + I.dot(99, 22, 21, 4.6, 'wa-lit')) +
    now(4, I.line([[90, -3, 16], [108, -3, 16]], 'wa-acc-l') + I.dot(99, -3, 16, 3, 'wa-acc')),

  /* Kinetic Studio: a timeline with its playhead, and what feeds it: the folder, the data, the recipes; then the
     push that publishes and the poster that previews. */
  kinetic: (I) => {
    const head = (k: number) => { const x = -70 + k * 34; return only(k, I.line([[x, 4, 2], [x, 4, 40]], 'wa-acc-l') + I.dot(x, 4, 42, 3.2, 'wa-acc')); };
    return I.box(-120, -50, 250, 110, -6, 6, { r: 6 }) +
      I.box(-90, -4, 180, 16, 0, 4) + I.lines([0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => [[-84 + k * 21, 12.2, 1], [-84 + k * 21, 12.2, 3.6]]), 'wa-l wa-l--hi') +
      [0, 1, 2, 3, 4].map(head).join('') +
      from(0, I.box(-104, -40, 26, 18, 0, 14) + I.box(-104, -40, 12, 18, 14, 2)) +
      from(1, I.box(-66, -40, 20, 2, 0, 28, { lit: true }) + textLines(I, -37.9, -62, -50, [22, 17, 12, 7])) +
      from(2, [0, 1, 2].map((k) => I.box(-30 + k * 22, -1, 18, 10, 4, 6, k === 1 ? { className: 'ob-acc' } : { lit: true })).join('')) +
      from(3, I.cyl(62, -36, 13, 0, 4) + I.dome(62, -36, 13, 4) + I.line([[62, -36, 10], [62, -36, 30]], 'wa-acc-l') + I.line([[57, -36, 25], [62, -36, 30], [67, -36, 25]], 'wa-acc-l')) +
      from(4, I.box(84, 24, 30, 4, 0, 40) + I.face([[87, 28.1, 5], [111, 28.1, 5], [111, 28.1, 37], [87, 28.1, 37]], 'wa-win') + I.face([[96, 28.2, 15], [96, 28.2, 27], [105, 28.2, 21]], 'wa-acc'));
  },

  /* Volta: the jar and how long it lasts, the week it runs out, the message with the bag ready, and the coupon. */
  volta: (I) =>
    I.box(-110, -45, 230, 110, -6, 6, { r: 6 }) +
    from(0, I.cyl(-78, 6, 15, 0, 34) + I.cyl(-78, 6, 16, 34, 6, { className: 'ob-acc' }) + I.box(-93.5, 4, 0.5, 4, 8, 22, { lit: true })) +
    // the level: full while it lasts, low the week it runs out
    only(0, I.face([[-90, 20.6, 4], [-66, 20.6, 4], [-66, 20.6, 28], [-90, 20.6, 28]], 'ob-level')) +
    from(1, I.face([[-90, 20.6, 4], [-66, 20.6, 4], [-66, 20.6, 10], [-90, 20.6, 10]], 'ob-level') + I.box(-40, -36, 30, 4, 0, 30) + [0, 1, 2, 3, 4, 5].map((k) => I.face([[-37 + (k % 3) * 9, -31.9, 8 + Math.floor(k / 3) * 10], [-30 + (k % 3) * 9, -31.9, 8 + Math.floor(k / 3) * 10], [-30 + (k % 3) * 9, -31.9, 15 + Math.floor(k / 3) * 10], [-37 + (k % 3) * 9, -31.9, 15 + Math.floor(k / 3) * 10]], k === 4 ? 'wa-acc' : 'wa-lit')).join('')) +
    now(1, I.dot(-60, 6, 46, 4, 'wa-acc')) +
    from(2, phone(I, 18, 0) + bubble(I, 6, -8, 18, 28, 16)) +
    now(2, I.line([[10, -4.7, 23], [28, -4.7, 23]], 'wa-acc-l')) +
    from(3, I.box(64, -2, 34, 22, 0, 26) + I.line([[70, 9, 26], [74, 9, 36], [88, 9, 36], [92, 9, 26]], 'wa-pole') + I.box(76, 20.2, 14, 0.6, 6, 10, { className: 'ob-acc' })) +
    now(3, I.burst(83, 9, 46, 16, 10)),

  /* Velmar: a collar configured on its stand, the cart that approves it, the receipt, the machine, and the date. */
  velmar: (I) =>
    I.box(-120, -45, 250, 110, -6, 6, { r: 6 }) + trail(I, [[-80, 10], [-30, 0], [20, -5], [70, 0], [105, 15]]) +
    from(0, I.box(-94, -4, 24, 24, 0, 8) + I.ring(-82, 8, 14, 22, 'wa-wheel') + [0, 1, 2, 3, 4, 5].map((k) => { const a = (k / 6) * Math.PI * 2; return I.dot(-82 + Math.cos(a) * 14, 8 + Math.sin(a) * 14, 22, 2.4, k === 0 ? 'wa-acc' : 'wa-lit'); }).join('') + I.line([[-82, 8, 8], [-82, 8, 22]], 'wa-pole')) +
    now(0, I.ring(-82, 8, 20, 22, 'wa-acc-l')) +
    from(1, I.box(-46, -14, 26, 18, 6, 14) + I.line([[-46, -14, 20], [-52, -14, 26]], 'wa-pole') + I.cyl(-40, 6, 3, 0, 3) + I.cyl(-26, 6, 3, 0, 3) + I.dot(-33, -5, 22, 3.4, 'wa-acc')) +
    from(2, I.box(-6, -24, 20, 2, 0, 30, { lit: true }) + textLines(I, -21.9, -2, 10, [24, 18, 12]) + check(I, 8, -21.8, 7, 3.5)) +
    from(3, I.box(30, -26, 32, 30, 0, 24) + I.box(36, -20, 20, 18, 24, 6) + I.line([[46, -11, 30], [46, -11, 40], [62, -11, 40], [62, -11, 30]], 'wa-pole') + I.dot(62, -11, 28, 2.6, 'wa-acc')) +
    now(3, I.burst(62, -11, 28, 10, 8)) +
    from(4, I.box(84, 0, 30, 2, 0, 32, { lit: true }) + [0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => I.face([[87 + c * 7, 2.1, 6 + r * 7], [92 + c * 7, 2.1, 6 + r * 7], [92 + c * 7, 2.1, 11 + r * 7], [87 + c * 7, 2.1, 11 + r * 7]], r === 1 && c === 2 ? 'wa-acc' : 'wa-l wa-l--ink ob-cell'))).join('') + I.box(96, 18, 16, 14, 0, 12)),

  /* DentalOS: a week of appointments; the A-0012 card moves from its old slot to its new one, the chair is checked,
     the reminder is swapped, and reception sees it. */
  dentalos: (I) => {
    const slot = (c: number, r: number): [number, number] => [-60 + c * 26, -40 + r * 22];
    const card = (c: number, r: number) => { const [x, y] = slot(c, r); return I.box(x - 10, y - 8, 20, 16, 2.4, 5, { className: 'ob-acc' }); };
    return I.box(-120, -60, 250, 130, -6, 6, { r: 6 }) +
      I.box(-76, -54, 104, 88, 0, 2.4, { lit: true }) +
      [0, 1, 2, 3].flatMap((c) => [0, 1, 2, 3].map((r) => { const [x, y] = slot(c, r); return I.ring(x, y, 0.1, 2.5) + I.face([[x - 10, y - 8, 2.5], [x + 10, y - 8, 2.5], [x + 10, y + 8, 2.5], [x - 10, y + 8, 2.5]], 'ob-cell-fill'); })).join('') +
      from(0, bubble(I, -110, 30, 14, 26, 14) + I.cyl(-100, 44, 5, 0, 12) + I.dot(-100, 44, 17, 4.4, 'wa-lit')) +
      only(0, card(0, 1)) + only(1, card(0, 1) + I.line([[slot(0, 1)[0], slot(0, 1)[1], 8], [slot(2, 2)[0], slot(2, 2)[1], 8]], 'ob-trail')) +
      from(1, I.box(50, -44, 22, 18, 0, 8) + I.box(66, -44, 6, 18, 8, 16) + I.box(50, -44, 22, 4, 8, 4)) +
      now(1, check(I, 61, -26, 24, 5)) +
      from(2, card(2, 2)) +
      now(2, I.ring(slot(2, 2)[0], slot(2, 2)[1], 16, 8, 'wa-acc-l')) +
      from(3, I.cone(64, 6, 8, 0, 16) + I.dot(64, 6, 18, 2.4, 'wa-acc') + I.line([[50, 22, 4], [58, 14, 14]], 'wa-l wa-l--thick')) +
      from(4, I.box(80, 34, 34, 4, 0, 30) + I.face([[83, 38.1, 5], [111, 38.1, 5], [111, 38.1, 27], [83, 38.1, 27]], 'wa-win') + I.face([[90, 38.2, 12], [102, 38.2, 12], [102, 38.2, 18], [90, 38.2, 18]], 'wa-acc'));
  },

  /* games-market: the projector and its room code, the phones that join, the ball that plays, the packets that
     keep everyone in step, and the trophy. */
  games: (I) => {
    const phones: [number, number][] = [[-70, 40], [-20, 52], [36, 48]];
    return I.box(-115, -60, 240, 130, -6, 6, { r: 6 }) +
      I.box(-30, -50, 70, 6, 0, 52) + I.face([[-26, -43.9, 6], [36, -43.9, 6], [36, -43.9, 48], [-26, -43.9, 48]], 'wa-win') +
      from(0, I.box(-80, -36, 16, 16, 0, 16, { lit: true }) + [[-76, -20.2, 12], [-68, -20.2, 4], [-72, -20.2, 8]].map(([x, y, z]) => I.dot(x, y, z, 1.5, 'wa-ink')).join('') + I.face([[-22, -43.8, 32], [-8, -43.8, 32], [-8, -43.8, 44], [-22, -43.8, 44]], 'wa-lit')) +
      from(1, phones.map(([x, y]) => phone(I, x, y)).join('') + I.lines(phones.map(([x, y]) => [[x, y - 12, 1], [5, -44, 1]]), 'ob-trail')) +
      from(2, I.dot(10, -43.7, 20, 4.2, 'wa-acc') + I.line([[-14, -43.8, 10], [-14, -43.8, 20]], 'wa-l wa-l--hi') + I.line([[30, -43.8, 18], [30, -43.8, 28]], 'wa-l wa-l--hi') + phones.map(([x, y]) => I.face([[x - 5.5, y - 10, 3.2], [x + 5.5, y - 10, 3.2], [x + 5.5, y + 10, 3.2], [x - 5.5, y + 10, 3.2]], 'wa-acc ob-glow')).join('')) +
      now(3, phones.map(([x, y], k) => I.dot(x + (5 - x) * (0.3 + k * 0.2), y - 12 + (-32 - y) * (0.3 + k * 0.2), 2, 2.6, 'wa-lit')).join('')) +
      from(3, I.ring(5, -20, 8, 0.4, 'wa-l')) +
      from(4, I.cyl(86, -10, 9, 0, 4) + I.cyl(86, -10, 3, 4, 10) + I.cone(86, -10, 11, 30, -14, 'ob-acc-f') + I.star(86, -10, 40, 5));
  },
};

/** Paint the last phase into the HTML: whatever belongs to it is on. */
function settle(svg: string, last: number) {
  return svg.replace(/<g data-(from|only|now)="(\d+)">/g, (_, a: string, n: string) => {
    const i = Number(n), on = a === 'from' ? i <= last : i === last;
    return `<g data-${a}="${n}"${on ? ' data-on' : ''}>`;
  });
}

/** The drawing of every case's object, with as many phases as its steps; box is fixed per drawing. */
export function objectArt(slug: CaseSlug, phases: number): Art {
  const I = isle(0, 0);
  return { box: BOX[slug], svg: settle(ART[slug](I), phases - 1), phases };
}

/** The frame of each drawing: its outline measured in a browser (getBBox of the whole drawing, every phase on) plus 10 units. A test checks it still holds the drawing. */
const BOX: Record<CaseSlug, [number, number, number, number]> = {
  complia: [-177, -103, 336, 207], tuenti: [-159, -135, 309, 231], supernova: [-177, -92, 336, 197], eclipse: [-186, -137, 399, 246],
  agentes: [-177, -91, 345, 195], kinetic: [-168, -103, 336, 203], volta: [-164, -97, 318, 194], velmar: [-173, -83, 336, 185], dentalos: [-177, -89, 354, 194], games: [-173, -103, 345, 205],
};
