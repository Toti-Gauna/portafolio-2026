import { LAYERS, tokens, type LayerId } from '@/v2/tokens';

/**
 * The craft in five layers, exploded: one SVG per layer (same viewBox) so each can move on its own, plus a
 * still glow behind. Drawn in code, with a seed: no Math.random, the same art on every build.
 *
 * Text and its small-size stand-in: anything written on a face comes twice, as <text class="t"> and as
 * bars <rect class="b">; the stage shows the text only when it renders at 12 px or more (signature.css).
 */
const AX = 0.9, AY = 0.38, W = 480, D = 300, T = 16, GAP = 80;
const INK = '#0c0a24', PAPER = tokens.color.paper;
/** How far the layers above an open layer rise, and the rest sink, in viewBox units. */
export const STACK_LIFT = { up: 120, down: 115 };
export const STACK_VIEWBOX = { x: -310, y: -510, w: 810, h: 1000 };
/** Type on the faces, in viewBox units: it reads at ≥ 12 px once the art is ≥ this many px wide. */
const FACE_FONT = 17;
export const STACK_TEXT_MIN_WIDTH = Math.ceil((12 / FACE_FONT) * STACK_VIEWBOX.w);

const iso = (x: number, y: number, z = 0): [number, number] => [+((x - y) * AX).toFixed(1), +((x + y) * AY - z).toFixed(1)];
const pts = (a: [number, number][]) => a.map((p) => p.join(',')).join(' ');
const z = (i: number) => GAP * (LAYERS.length - 1 - i);
const col = (id: LayerId, end: 'from' | 'to') => tokens.layer[`${id}-${end}` as keyof typeof tokens.layer];

const syn = { kw: '#ff7a5c', fn: '#8aa4ff', ty: '#3fe0b0', nu: '#c79bff', pr: '#ffc247', id: PAPER, pu: '#9a95b8', co: '#9a95b8' } as const;
type Tok = [keyof typeof syn, string];
const CODE: [number, ...Tok[]][] = [
  [0, ['kw', 'async function '], ['fn', 'responder'], ['pu', '('], ['id', 'q'], ['pu', ': '], ['ty', 'string'], ['pu', ') {']],
  [2, ['kw', 'const '], ['id', 'fuentes '], ['pu', '= '], ['kw', 'await '], ['fn', 'buscar'], ['pu', '('], ['id', 'q'], ['pu', ')']],
  [2, ['kw', 'const '], ['id', 'borrador '], ['pu', '= '], ['kw', 'await '], ['id', 'ia'], ['pu', '.'], ['fn', 'generar'], ['pu', '({']],
  [4, ['pr', 'pregunta'], ['pu', ': '], ['id', 'q'], ['pu', ', '], ['pr', 'fuentes'], ['pu', ',']],
  [2, ['pu', '})']],
  [2, ['kw', 'return '], ['fn', 'verificar'], ['pu', '('], ['id', 'borrador'], ['pu', ', '], ['id', 'fuentes'], ['pu', ')']],
  [0, ['pu', '}']],
  [0, ['co', '// cada respuesta, con su cita']],
];
const CH = FACE_FONT * 0.6, LH = 28, Y0 = 76;

/** A label on a face: real text, and a bar of the same length for small sizes. */
const label = (x: number, y: number, t: string, fill: string, extra = '') =>
  `<text class="t" x="${x}" y="${y}" font-size="${FACE_FONT}" fill="${fill}"${extra}>${t}</text>` +
  `<rect class="b" x="${x}" y="${y - 11}" width="${(t.length * CH - 3).toFixed(1)}" height="11" rx="5.5" fill="${fill}" opacity=".85"/>`;

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function planFace(a: string): string {
  let o = `<rect width="${W}" height="40" fill="#fff" opacity=".055"/><path d="M0 40H${W}" stroke="#fff" opacity=".12"/>`;
  o += `<rect x="12" y="10" width="20" height="20" rx="5" fill="${a}"/><path d="M17 20l3 3l6-7" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += label(42, 26, 'plan.md', PAPER);
  o += `<rect x="${W - 112}" y="11" width="100" height="18" rx="9" fill="#fff" opacity=".08"/><rect x="${W - 112}" y="11" width="64" height="18" rx="9" fill="url(#g-plan)"/>`;
  ([[1, 112], [1, 92], [1, 120], [0, 84], [0, 104], [0, 76]] as const).forEach(([done, w], i) => {
    const y = 60 + i * 36;
    o += done
      ? `<rect x="16" y="${y}" width="18" height="18" rx="5" fill="${a}"/><path d="M20.5 ${y + 9}l3 3l6-7" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<rect x="17" y="${y + 1}" width="16" height="16" rx="5" fill="none" stroke="${PAPER}" stroke-width="1.6" opacity=".55"/>`;
    o += `<rect x="44" y="${y + 5}" width="${w}" height="8" rx="4" fill="${done ? PAPER : '#9a95b8'}" opacity="${done ? 0.75 : 0.5}"/>`;
  });
  const gx = 190, gw = W - gx - 14;
  for (let k = 0; k <= 6; k++) o += `<path d="M${(gx + (k * gw) / 6).toFixed(1)} 52V268" stroke="#fff" opacity="${k ? 0.07 : 0.14}"/>`;
  ([[0, 1.6, '#ffc247'], [1.1, 1.5, '#ff6b4a'], [2.2, 1.7, '#ff5fa2'], [3.2, 1.3, '#3fe0b0'], [4.1, 1.4, '#5f86ff'], [5, 0.9, '#58d5ff']] as const).forEach(([s, len, c], i) => {
    const y = 60 + i * 36, x = gx + (s * gw) / 6, w = (len * gw) / 6;
    o += `<rect x="${x.toFixed(1)}" y="${y + 2}" width="${w.toFixed(1)}" height="14" rx="7" fill="${c}" opacity="${i < 3 ? 1 : 0.38}"/>`;
    if (i < 3) o += `<rect x="${x.toFixed(1)}" y="${y + 2}" width="${w.toFixed(1)}" height="14" rx="7" fill="none" stroke="#fff" stroke-opacity=".35"/>`;
    if (i === 2 || i === 5) { const mx = x + w + 12; o += `<rect x="${(mx - 6).toFixed(1)}" y="${y + 3}" width="12" height="12" transform="rotate(45 ${mx.toFixed(1)} ${y + 9})" fill="${INK}" stroke="${c}" stroke-width="2"/>`; }
  });
  const today = gx + (3.4 * gw) / 6;
  o += `<path d="M${today.toFixed(1)} 48V274" stroke="${a}" stroke-width="1.6" stroke-dasharray="3 4"/><circle cx="${today.toFixed(1)}" cy="48" r="4" fill="${a}"/>`;
  o += `<rect x="16" y="282" width="${W - 32}" height="6" rx="3" fill="#fff" opacity=".08"/><rect x="16" y="282" width="${((W - 32) * 0.56).toFixed(1)}" height="6" rx="3" fill="url(#g-plan)"/>`;
  return o;
}

function codeFace(a: string): string {
  const rnd = rng(7);
  let o = `<rect width="${W}" height="40" fill="#fff" opacity=".055"/><path d="M0 40H${W}" stroke="#fff" opacity=".12"/>`;
  o += `<circle cx="17" cy="20" r="5" fill="#ff6b4a"/><circle cx="33" cy="20" r="5" fill="#ffc247"/><circle cx="49" cy="20" r="5" fill="#3fe0b0"/>`;
  o += `<path d="M64 40V8h138v32" fill="#120f33" stroke="#fff" stroke-opacity=".14"/><path d="M64 8h138" stroke="${a}" stroke-width="2.4"/>`;
  o += label(74, 30, 'responder.ts', PAPER) + label(214, 30, 'verificar.ts', '#9a95b8');
  const mx = W - 40;
  o += `<rect x="${mx - 6}" y="46" width="1" height="${D - 52}" fill="#fff" opacity=".1"/>`;
  for (let i = 0; i < 26; i++) o += `<rect x="${mx}" y="${52 + i * 9}" width="${(8 + rnd() * 24).toFixed(1)}" height="3.4" rx="1.7" fill="${[syn.kw, syn.fn, PAPER, syn.ty, syn.pu][i % 5]}" opacity=".5"/>`;
  o += `<rect x="${mx - 3}" y="50" width="38" height="78" rx="3" fill="#fff" opacity=".07"/>`;
  CODE.forEach((ln, i) => {
    const y = Y0 + i * LH, x0 = 44 + ln[0] * CH;
    const toks = ln.slice(1) as Tok[];
    if (i === 5) o += `<rect x="36" y="${y - 20}" width="${mx - 44}" height="${LH}" fill="${a}" opacity=".12"/><rect x="36" y="${y - 20}" width="2.6" height="${LH}" fill="${a}"/>`;
    if ([1, 2, 3, 5].includes(i)) o += `<rect x="3" y="${y - 18}" width="3" height="${LH - 4}" rx="1.5" fill="${i === 5 ? '#3fe0b0' : '#5f86ff'}"/>`;
    o += `<text class="t" x="30" y="${y}" font-size="${FACE_FONT}" text-anchor="end" fill="#9a95b8">${i + 1}</text><rect class="b" x="14" y="${y - 10}" width="14" height="9" rx="4.5" fill="#fff" opacity=".2"/>`;
    if (!toks.length) return;
    o += `<text class="t" x="${x0.toFixed(1)}" y="${y}" font-size="${FACE_FONT}" xml:space="preserve"${toks[0][0] === 'co' ? ' font-style="italic"' : ''}>` + toks.map(([k, t]) => `<tspan fill="${syn[k]}">${t}</tspan>`).join('') + `</text>`;
    let x = x0;
    for (const [k, t] of toks) { const w = t.trim().length * CH, lead = (t.length - t.trimStart().length) * CH; if (w > 0) o += `<rect class="b" x="${(x + lead).toFixed(1)}" y="${y - 11}" width="${Math.max(5, w - 2).toFixed(1)}" height="11" rx="5.5" fill="${syn[k]}"/>`; x += t.length * CH; }
  });
  return o;
}

function agentsFace(a: string, b: string): string {
  const c = [312, 166];
  const n = [[216, 226], [256, 162], [320, 86], [392, 60], [428, 122], [418, 198], [376, 252], [302, 260], [160, 266], [246, 110]];
  let o = '';
  n.forEach((p, i) => { o += `<path d="M${c[0]} ${c[1]}L${p[0]} ${p[1]}" stroke="${i % 2 ? a : b}" stroke-width="1.6" opacity=".75"/>`; });
  [[0, 8], [0, 1], [2, 3], [3, 4], [5, 6], [6, 7], [1, 9], [9, 2]].forEach(([p, q]) => { o += `<path d="M${n[p][0]} ${n[p][1]}L${n[q][0]} ${n[q][1]}" stroke="#fff" stroke-width="1" opacity=".22" stroke-dasharray="3 5"/>`; });
  n.forEach((p, i) => { o += `<circle cx="${p[0]}" cy="${p[1]}" r="13" fill="${INK}" stroke="${i % 2 ? a : b}" stroke-width="2"/><circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="${i % 2 ? a : b}"/>`; });
  o += `<circle cx="${c[0]}" cy="${c[1]}" r="30" fill="${a}" opacity=".18"/><circle cx="${c[0]}" cy="${c[1]}" r="21" fill="${INK}" stroke="url(#g-agents)" stroke-width="3"/><circle cx="${c[0]}" cy="${c[1]}" r="8" fill="url(#g-agents)"/>`;
  return o;
}

function testsFace(a: string, b: string): string {
  const rnd = rng(23);
  let o = '';
  for (let r = 0; r < 12; r++) for (let c = 0; c < 40; c++) {
    const x = 26 + c * 11, y = 126 + r * 11; if (x + y < 392 || x > W - 22) continue;
    const v = rnd();
    o += `<rect x="${x}" y="${y}" width="8" height="8" rx="2" fill="${v > 0.86 ? b : a}" opacity="${(0.35 + v * 0.65).toFixed(2)}"/>`;
  }
  o += `<rect x="150" y="268" width="${W - 172}" height="7" rx="3.5" fill="url(#g-tests)"/>`;
  return o;
}

function shipFace(a: string, b: string): string {
  const box = (x: number, y: number, w: number, c: string) => `<rect x="${x}" y="${y}" width="${w}" height="40" rx="9" fill="${INK}" stroke="${c}" stroke-width="2"/><rect x="${x + 12}" y="${y + 15}" width="${w - 46}" height="10" rx="5" fill="${c}" opacity=".85"/><circle cx="${x + w - 18}" cy="${y + 20}" r="6" fill="${c}"/>`;
  let o = '';
  [[80, 280, 420, 280], [270, 110, 270, 280], [338, 60, 338, 208], [420, 120, 420, 280], [338, 150, 420, 150], [202, 196, 338, 196]].forEach(([p, q, r, s], i) => { o += `<path d="M${p} ${q}L${r} ${s}" stroke="${i % 2 ? b : a}" stroke-width="1.6" opacity=".6"/><circle cx="${p}" cy="${q}" r="3.5" fill="${i % 2 ? b : a}"/><circle cx="${r}" cy="${s}" r="3.5" fill="${i % 2 ? b : a}"/>`; });
  o += box(126, 238, 96, a) + box(240, 176, 96, b) + box(342, 100, 100, PAPER);
  o += `<path d="M222 252L252 222M336 190L362 146" stroke="${PAPER}" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round"/>`;
  return o;
}

const FACES: Record<LayerId, (a: string, b: string) => string> = { plan: planFace, code: codeFace, agents: agentsFace, tests: testsFace, ship: shipFace };

export type StackLayerArt = { id: LayerId; from: string; to: string; svg: string; /** where its leader line ends, in % of the stage */ anchor: { x: number; y: number }; /** a viewBox that frames this layer alone */ crop: string };

function layerSvg(id: LayerId, i: number): StackLayerArt {
  const a = col(id, 'from'), b = col(id, 'to'), lz = z(i), bz = lz - T;
  const top = [iso(0, 0, lz), iso(W, 0, lz), iso(W, D, lz), iso(0, D, lz)];
  const [ox, oy] = top[0];
  const left = pts([iso(0, D, lz), iso(W, D, lz), iso(W, D, bz), iso(0, D, bz)]);
  const right = pts([iso(W, 0, lz), iso(W, D, lz), iso(W, D, bz), iso(W, 0, bz)]);
  const front = `M${top[3].join(' ')}L${top[2].join(' ')}L${top[1].join(' ')}`;
  const r = top[1];
  const defs =
    `<linearGradient id="g-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>` +
    `<linearGradient id="t-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}" stop-opacity=".2"/><stop offset=".6" stop-color="${b}" stop-opacity=".05"/><stop offset="1" stop-color="${b}" stop-opacity=".16"/></linearGradient>` +
    `<linearGradient id="s-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}" stop-opacity=".95"/><stop offset="1" stop-color="${b}" stop-opacity=".25"/></linearGradient>` +
    `<clipPath id="c-${id}"><rect width="${W}" height="${D}"/></clipPath>`;
  const body =
    `<polygon points="${left}" fill="${INK}"/><polygon points="${left}" fill="url(#s-${id})" opacity=".55"/>` +
    `<polygon points="${right}" fill="${INK}"/><polygon points="${right}" fill="url(#s-${id})" opacity=".85"/>` +
    `<polygon points="${pts(top)}" fill="#100d2c" opacity=".96"/><polygon points="${pts(top)}" fill="url(#t-${id})"/>` +
    `<g transform="matrix(${AX},${AY},${-AX},${AY},${ox},${oy})"><g clip-path="url(#c-${id})">${FACES[id](a, b)}</g></g>` +
    `<polygon points="${pts(top)}" fill="none" stroke="url(#g-${id})" stroke-width="1.6"/>` +
    `<path d="${front}" fill="none" stroke="${a}" stroke-width="7" opacity=".28" stroke-linejoin="round"/><path d="${front}" fill="none" stroke="#fff" stroke-width="1.2" opacity=".75"/>` +
    `<path d="M${r[0] + 6} ${r[1]}H${r[0] + 54}" stroke="${a}" stroke-width="1.4"/><circle cx="${r[0] + 6}" cy="${r[1]}" r="4" fill="${a}"/>` +
    `<polygon class="hit" points="${pts(top)}" fill="#fff" fill-opacity="0"/>`;
  const V = STACK_VIEWBOX;
  return { id, from: a, to: b, svg: `<defs>${defs}</defs>${body}`, crop: `-285 ${-lz - 14} 730 344`, anchor: { x: +(((r[0] + 58 - V.x) / V.w) * 100).toFixed(2), y: +(((r[1] - V.y) / V.h) * 100).toFixed(2) } };
}

/** The still light behind the stack: one blurred shape per layer, never animated. */
function glowSvg(): string {
  let o = `<defs><filter id="sg-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26"/></filter></defs>`;
  o += `<ellipse cx="70" cy="-60" rx="330" ry="250" fill="#7a4dff" opacity=".2" filter="url(#sg-blur)"/><ellipse cx="-50" cy="-250" rx="220" ry="120" fill="#ffb648" opacity=".16" filter="url(#sg-blur)"/><ellipse cx="-70" cy="-150" rx="200" ry="120" fill="#ff5a3c" opacity=".2" filter="url(#sg-blur)"/><ellipse cx="210" cy="130" rx="220" ry="130" fill="#2b50ff" opacity=".28" filter="url(#sg-blur)"/>`;
  [...LAYERS].reverse().forEach((id, k) => {
    const i = LAYERS.length - 1 - k, bz = z(i) - T - 36;
    o += `<polygon points="${pts([iso(0, 0, bz), iso(W, 0, bz), iso(W, D, bz), iso(0, D, bz)])}" fill="${col(id, 'from')}" opacity="${i === LAYERS.length - 1 ? 0.34 : 0.16}" filter="url(#sg-blur)"/>`;
  });
  return o;
}

export function stackArt(): { glow: string; layers: StackLayerArt[] } {
  return { glow: glowSvg(), layers: LAYERS.map((id, i) => layerSvg(id, i)) };
}
