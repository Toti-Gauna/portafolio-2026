import type { BrandArt, BrandSpec } from '../types';

/**
 * IG — Ignacio's personal brand, as this site wears it (v2/tokens/tokens.json and the monogram of the header).
 * A stem, a G and a coral dot: the dot is the unit everything is measured with. Deep indigo, paper, coral and the
 * five-colour spectrum of the craft (plan, code, agents, tests, ship).
 */
const INK = '#060513', PAPER = '#eeeae3', CORAL = '#ff5a3c', BLUE = '#2b50ff', MIST = '#b9b4d2', NIGHT = '#16123a';
const SPECTRUM = ['#ffc247', '#ff6b4a', '#ff5fa2', '#3fe0b0', '#5f86ff'];

/** The monogram in its own 48-unit box (the header's geometry), placed at (x, y) and scaled by s. */
const mono = (x: number, y: number, s: number, o: { ink?: string; dot?: string; draw?: boolean; acc?: boolean; w?: number } = {}) => {
  const ink = o.ink ?? 'currentColor', d = o.draw ? ' class="bl-draw"' : '';
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${ink}" stroke-width="${o.w ?? 3.2}" stroke-linecap="round" stroke-linejoin="round">`
    + `<path${d} style="--i:0" d="M11 16v25"/><path${d} style="--i:1" d="M41 21a13.5 13.5 0 1 0 1.5 12H30"/>`
    + `<circle class="${o.acc ? 'bl-acc' : o.draw ? 'bl-fill' : ''}" style="--i:4" cx="11" cy="7" r="3.4" stroke="none" fill="${o.acc ? 'currentColor' : o.dot ?? CORAL}"/></g>`;
};
const bars = (x: number, y: number, w: number, h: number, gap = 0) =>
  SPECTRUM.map((c, i) => `<rect x="${x + i * (w / 5)}" y="${y}" width="${w / 5 - gap}" height="${h}" fill="${c}"/>`).join('');
const txt = (x: number, y: number, s: string, size: number, o: { fill?: string; w?: number; cls?: string; anchor?: string; ls?: number } = {}) =>
  `<text class="${o.cls ?? 'bl-fd'}" x="${x}" y="${y}" font-size="${size}" font-weight="${o.w ?? 800}" fill="${o.fill ?? PAPER}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${s}</text>`;

function art(t: Record<string, string>): BrandArt {
  // the main logo: the monogram at ×3.5 (the dot is 23.8 wide: one module) and the name in two lines
  const S = 3.5, M = 6.8 * S; // one module = the dot's diameter
  const main = mono(16, 16, S, { draw: true })
    + `<g class="bl-fill" style="--i:6">${txt(198, 96, t.first, 54, { ls: -1.5 })}${txt(198, 152, t.last, 54, { fill: CORAL, ls: -1.5 })}</g>`;
  const cx = 16 + 11 * S, gx = 16 + 28.5 * S, gy = 16 + 27.5 * S; // stem axis, centre of the G
  const grid = [
    // clear space: one module on every side
    `<rect class="bl-gm" x="${16 + 4.2 * S - M}" y="${16 + 3.6 * S - M}" width="${M}" height="${M}"/>`,
    `<rect class="bl-g" x="${16 + 7.6 * S - M}" y="${16 + 3.6 * S - M}" width="${36.8 * S + 2 * M}" height="${39 * S + 2 * M}"/>`,
    // the stem's axis, the base line and the top of the stem
    `<path class="bl-g" d="M${cx} 4V196M4 ${16 + 41 * S}H380M4 ${16 + 16 * S}H380M4 ${gy}H380"/>`,
    // the G is one circle; the dot is the same circle, four times smaller
    `<circle class="bl-gc" cx="${gx}" cy="${gy}" r="${13.5 * S}"/><circle class="bl-gc" cx="${cx}" cy="${16 + 7 * S}" r="${3.4 * S}"/>`,
    `<circle class="bl-gp" cx="${gx}" cy="${gy}" r="2.5"/><circle class="bl-gp" cx="${cx}" cy="${16 + 7 * S}" r="2.5"/>`,
    // the name sits on the modules of the dot
    ...[0, 1, 2].map((i) => `<rect class="bl-gm" x="${198 - M - 6}" y="${58 + i * M * 1.6}" width="${M}" height="${M}"/>`),
  ].join('');
  const secondary = mono(8, 6, 1.5) + txt(92, 46, `${t.first} ${t.last}`, 21, { fill: 'currentColor', w: 700, ls: -0.3 }) + txt(92, 66, t.role, 12, { fill: MIST, w: 500, cls: 'bl-ft' });
  const submark = mono(4, 2, 2, { acc: true, w: 3.4 });

  const post = `<rect width="400" height="400" fill="${INK}"/>${bars(0, 0, 400, 10)}${mono(36, 44, 2.2, { ink: PAPER })}`
    + txt(36, 236, t.level, 84, { fill: CORAL, ls: -3 }) + txt(36, 286, t.roleA, 38, { ls: -1 }) + txt(36, 330, t.roleB, 38, { ls: -1 })
    + txt(36, 368, t.site, 17, { fill: MIST, w: 500, cls: 'bl-ft' });
  const slab = (i: number) => `<rect x="34" y="${140 + i * 44}" width="202" height="34" rx="9" fill="${NIGHT}" stroke="${SPECTRUM[i]}" stroke-width="2.5"/><circle cx="54" cy="${157 + i * 44}" r="5" fill="${SPECTRUM[i]}"/>`
    + txt(70, 162 + i * 44, t[`layer${i}`], 13.5, { w: 600, cls: 'bl-ft' });
  const story = `<rect width="270" height="480" fill="${INK}"/>${mono(34, 36, 1.3, { ink: PAPER })}${txt(34, 122, t.storyTitle, 23, { ls: -0.5 })}`
    + [0, 1, 2, 3, 4].map(slab).join('') + txt(34, 400, t.storyA, 15, { w: 500, fill: MIST, cls: 'bl-ft' }) + txt(34, 422, t.storyB, 15, { w: 500, fill: MIST, cls: 'bl-ft' }) + bars(34, 446, 202, 8, 4);
  const poster = `<rect width="300" height="400" fill="${CORAL}"/>${mono(18, 20, 4.9, { ink: INK, dot: PAPER, w: 3.4 })}`
    + txt(22, 300, t.posterA, 27, { fill: INK, ls: -0.8 }) + txt(22, 331, t.posterB, 27, { fill: INK, ls: -0.8 }) + txt(22, 362, t.posterC, 27, { fill: PAPER, ls: -0.8 })
    + txt(22, 386, t.site, 14, { fill: INK, w: 600, cls: 'bl-ft' });
  const print = `<rect width="240" height="140" rx="8" fill="${PAPER}"/>${mono(16, 14, 1.15, { ink: INK })}`
    + txt(16, 96, `${t.first} ${t.last}`, 19, { fill: INK, ls: -0.4 }) + txt(16, 114, t.role, 11.5, { fill: BLUE, w: 600, cls: 'bl-ft' }) + txt(16, 129, t.site, 11, { fill: NIGHT, w: 500, cls: 'bl-ft' })
    + SPECTRUM.map((c, i) => `<rect x="${212}" y="${16 + i * 22}" width="12" height="18" rx="3" fill="${c}"/>`).join('');

  // a box of cards: the monogram on the lid, the spectrum on its side
  const [W, H, D] = [230, 146, 84];
  const side = (w: number) => `<rect width="${w}" height="${H}" fill="${NIGHT}"/>` + SPECTRUM.map((c, i) => `<rect x="0" y="${15 + i * 24}" width="${w}" height="14" fill="${c}"/>`).join('');
  return {
    logo: { main: { box: [0, 0, 384, 200], svg: main }, grid, secondary: { box: [0, 0, 280, 84], svg: secondary }, submark: { box: [0, 0, 100, 100], svg: submark } },
    patterns: [
      { box: [0, 0, 120, 120], svg: `<rect width="120" height="120" fill="${INK}"/>` + [0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3].map((c) => `<circle cx="${15 + c * 30}" cy="${15 + r * 30}" r="5" fill="${r === 1 && c === 2 ? CORAL : NIGHT}"/>`)).join('') },
      { box: [0, 0, 120, 120], svg: `<rect width="120" height="120" fill="${PAPER}"/><g fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"><path d="M20 22v40M100 58v40"/><path d="M84 30a22 22 0 1 0 2 20H66M44 90a22 22 0 1 0 2 20H26M44 -30a22 22 0 1 0 2 20H26"/></g><circle cx="20" cy="8" r="5" fill="${CORAL}"/><circle cx="100" cy="44" r="5" fill="${BLUE}"/>` },
      { box: [0, 0, 120, 120], svg: SPECTRUM.map((c, i) => `<rect y="${i * 24}" width="120" height="24" fill="${NIGHT}"/><rect x="${(i % 2) * 60}" y="${i * 24 + 6}" width="60" height="12" rx="6" fill="${c}"/>`).join('') },
    ],
    digital: { post: { box: [0, 0, 400, 400], svg: post }, story: { box: [0, 0, 270, 480], svg: story } },
    physical: { poster: { box: [0, 0, 300, 400], svg: poster }, print: { box: [0, 0, 240, 140], svg: print } },
    object: {
      kind: 'box', size: [W, H, D],
      faces: {
        front: `<rect width="${W}" height="${H}" fill="${INK}"/>${mono(22, 18, 2.3, { ink: PAPER })}${txt(134, 78, t.first, 24, { ls: -0.5 })}${txt(134, 106, t.last, 24, { fill: CORAL, ls: -0.5 })}`,
        back: `<rect width="${W}" height="${H}" fill="${INK}"/>${txt(W / 2, 66, t.level, 40, { fill: CORAL, anchor: 'middle' })}${txt(W / 2, 96, t.role, 16, { w: 700, anchor: 'middle' })}${bars(24, 118, W - 48, 7, 4)}`,
        left: side(D), right: side(D),
        top: `<rect width="${W}" height="${D}" fill="${CORAL}"/>${mono(W / 2 - 34, 8, 1.4, { ink: INK, dot: PAPER, w: 4 })}`,
        bottom: `<rect width="${W}" height="${D}" fill="${NIGHT}"/>`,
      },
    },
  };
}

export const BRAND: BrandSpec = {
  id: 'ig', kind: 'own',
  skin: {
    main: { bg: INK, ink: PAPER, muted: MIST, accent: CORAL, line: '#2a2550' },
    alt: { bg: PAPER, ink: INK, muted: '#3a3560', accent: BLUE, line: '#cdc7ba' },
    onAccent: '#0c0a24', radius: '14px', rule: '1px solid',
    heading: { weight: 800, transform: 'none', tracking: '-0.02em', style: 'normal' },
  },
  palette: [
    { key: 'ink', hex: INK, share: 46 }, { key: 'paper', hex: PAPER, share: 22 }, { key: 'coral', hex: CORAL, share: 12 },
    { key: 'night', hex: NIGHT, share: 10 }, { key: 'blue', hex: BLUE, share: 6 }, { key: 'mist', hex: MIST, share: 4 },
  ],
  type: {
    display: { name: 'Archivo', stack: "var(--family-sans), 'Archivo', sans-serif", weights: [500, 700, 800] },
    text: { name: 'JetBrains Mono', stack: "var(--family-mono), 'JetBrains Mono', monospace", weights: [400, 500] },
  },
  origin: { logo: 'site', grid: 'lab', palette: 'site', type: 'site', patterns: 'lab', pieces: 'lab', object: 'lab' },
  art,
};
