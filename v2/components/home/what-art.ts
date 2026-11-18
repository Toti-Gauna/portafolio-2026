import * as k from '@/v2/iso/iso-kit';

/**
 * «Qué hago», drawn (lote 3.2): one small isometric object per capability, built once on the server with the
 * Anatomy kit — solids painted back to front, and ONE lit piece in each (the answer, the interface, the seal,
 * the play mark), like the dot of the monogram. No text in the drawing. The card makes the object jump.
 */
export const WHAT_IDS = ['ai', 'full', 'quality', 'motion'] as const;
export type WhatId = (typeof WHAT_IDS)[number];
export const WHAT_BOX = { width: 200, height: 170 };

const P: k.Projection = { origin: [100, 110], scale: 1.16 };
const S = k.solidSvg, L = k.lineSvg;
const at = (p: k.Point3) => k.iso(p, P);
const poly = (points: k.Point3[], closed = false) => k.pathOf(points.map(at), closed);
const shadow = (rx: number, dy = 0) => `<ellipse class="hw-shadow" cx="${at([0, 0, 0])[0].toFixed(1)}" cy="${(at([0, 0, 0])[1] + dy).toFixed(1)}" rx="${rx}" ry="${(rx * 0.36).toFixed(1)}"/>`;
const acc = (inner: string) => `<g class="hw-acc">${inner}</g>`;

/** A document, and the answer that hangs over the line it cites. */
function ai(): string {
  const page = { x: -36, y: -27, w: 72, d: 54, r: 4 };
  const out = [shadow(62, 6)];
  out.push(S(k.slabOf({ ...page, x: page.x + 5, y: page.y - 5 }, 0, 3, P), { tone: 'lo' }));
  out.push(S(k.slabOf(page, 4, 4, P, 8, 0.6), { tone: 'hi' }));
  [[0, 44], [1, 52], [2, 30], [3, 48], [4, 38]].forEach(([row, len]) => out.push(L(k.lineOnTop([page.x + 9, page.y + 10 + row * 8.5], [page.x + 9 + len, page.y + 10 + row * 8.5], 8, P), { tone: row === 2 ? 'hi' : 'lo', className: row === 2 ? 'hw-cite' : undefined, free: true })));
  out.push(L(k.rise([page.x + 9 + 30, page.y + 27], 8, 30, P), { tone: 'hi', dotted: true }));
  const bubble = { x: -8, y: -30, w: 50, d: 30, r: 9 };
  out.push(acc(S(k.slabOf(bubble, 30, 8, P, 8, 1), { lit: true }) + L(poly([[6, -17, 38], [14, -9, 38], [31, -22, 38]]), { tone: 'lit', className: 'hw-thick', free: true })));
  return out.join('');
}

/** Three tiers of one system: the data, the service, and the interface on top. */
function full(): string {
  const tier = { x: -33, y: -25, w: 66, d: 50, r: 5 };
  const out = [shadow(58, 4)];
  out.push(S(k.cylinder(0, 0, 31, 0, 13, P, 40, 1), { tone: 'hi' }));
  out.push(L(k.ring(0, 0, 22, 13, P), { tone: 'lo' }));
  for (const [x, y] of [[-20, 14], [20, 14], [20, -14]] as k.Plane[]) out.push(L(k.rise([x, y], 13, 24, P), { tone: 'mid', dotted: true }));
  out.push(S(k.slabOf(tier, 24, 7, P, 8, 0.8), { tone: 'hi' }));
  out.push(L(k.lineOnTop([-20, -8], [20, -8], 31, P), { tone: 'lo', free: true }), L(k.lineOnTop([-20, 6], [8, 6], 31, P), { tone: 'lo', free: true }));
  for (const [x, y] of [[-24, 18], [24, 18], [24, -18]] as k.Plane[]) out.push(L(k.rise([x, y], 31, 43, P), { tone: 'mid', dotted: true }));
  const screen = [
    S(k.slabOf(tier, 43, 5, P, 8, 0.8), { lit: true }),
    L(k.lineOnTop([tier.x + 6, tier.y + 9], [tier.x + tier.w - 6, tier.y + 9], 48, P), { tone: 'lit', free: true }),
    L(k.planOutline({ x: -25, y: -9, w: 20, d: 27, r: 2 }, 48, P), { tone: 'lit' }),
    L(k.planOutline({ x: 1, y: -9, w: 25, d: 11, r: 2 }, 48, P), { tone: 'lit' }),
    L(k.planOutline({ x: 1, y: 7, w: 25, d: 11, r: 2 }, 48, P), { tone: 'lit' }),
  ];
  out.push(acc(screen.join('')));
  return out.join('');
}

/** A lock, and the seal of a check that passed. */
function quality(): string {
  const body = { x: -27, y: -15, w: 54, d: 30, r: 6 };
  const out = [shadow(56, 4)];
  out.push(S(k.slabOf(body, 0, 38, P, 8, 1.2), { tone: 'hi' }));
  // the keyhole, on the face that looks at the viewer
  out.push(k.dotsSvg([at([0, 15, 23])], { size: 3, tone: 'hi' }), L(poly([[0, 15, 21], [0, 15, 12]]), { tone: 'hi', className: 'hw-thick', free: true }));
  const arch: k.Point3[] = [[-15, 0, 38]];
  for (let i = 0; i <= 18; i++) { const a = Math.PI - (i / 18) * Math.PI; arch.push([15 * Math.cos(a), 0, 52 + 15 * Math.sin(a)]); }
  arch.push([15, 0, 38]);
  out.push(L(poly(arch), { tone: 'hi', className: 'hw-shackle', free: true }));
  out.push(acc(S(k.cylinder(36, 22, 13, 0, 6, P, 32, 0.8), { lit: true }) + L(poly([[30, 23, 6], [35, 28, 6], [43, 17, 6]]), { tone: 'lit', className: 'hw-thick', free: true })));
  return out.join('');
}

/** A disc that plays, and the ball that never stops. */
function motion(): string {
  const out = [shadow(60, 4)];
  out.push(L(k.ring(0, 0, 47, 4, P, 56), { tone: 'mid', dashed: true }));
  out.push(S(k.cylinder(0, 0, 33, 0, 8, P, 44, 1), { tone: 'hi' }));
  out.push(L(k.ring(0, 0, 26, 8, P), { tone: 'lo' }));
  const trail: k.Point3[] = [];
  for (let i = 0; i <= 10; i++) { const a = 0.5 + (i / 10) * 0.75; trail.push([47 * Math.cos(a), 47 * Math.sin(a), 4 + i * 1.5]); }
  out.push(L(poly(trail), { tone: 'hi', free: true }));
  const [bx, by] = at([47 * Math.cos(1.25), 47 * Math.sin(1.25), 24]);
  // the play mark and the ball are one lit piece: they lift together
  out.push(acc(`<path class="hw-play" d="${poly([[-9, -13, 8.4], [-9, 13, 8.4], [15, 0, 8.4]], true)}"/><circle class="hw-ball" cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="7"/>`));
  return out.join('');
}

export const WHAT_ART: Record<WhatId, string> = { ai: ai(), full: full(), quality: quality(), motion: motion() };
