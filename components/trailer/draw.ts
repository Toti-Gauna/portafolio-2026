import type { DrawState } from './state';
import type { StageSize } from './types';
import {
  ACCENT, BLUE, PAPER, INK, GATE_X0, GATE_STEP, agentNodes, buildBranches, gateY, graphRect, mapUV, partial, type Pt,
} from './graph';
import { rng } from './rng';
import { pulseAt } from './score';

export const PARTICLES = 3200;

export interface Particle { sx: number; sy: number; ang: number; spd: number; rx: number; ry: number; size: number; tone: number }

export interface Targets { word: Pt[]; name: Pt[] }

export interface Scene {
  size: StageSize;
  targets: Targets;
  particles: Particle[];
  graph: ReturnType<typeof buildBranches>;
  agents: Pt[];
}

export function makeScene(size: StageSize, targets: Targets): Scene {
  const r = rng(7);
  const { W, H } = size;
  const particles: Particle[] = Array.from({ length: PARTICLES }, () => {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    return {
      sx: W / 2 + Math.cos(a) * d * 14, sy: H / 2 + Math.sin(a) * d * 14,
      ang: r() * Math.PI * 2, spd: 0.25 + r() * 0.75,
      rx: r() * W, ry: r() * H, size: 1.8 + r() * 3.2, tone: r(),
    };
  });
  return { size, targets, particles, graph: buildBranches(graphRect(size.o, W, H)), agents: agentNodes(size.o, W, H) };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function line(g: CanvasRenderingContext2D, pts: Pt[], color: string, w: number, alpha: number) {
  if (pts.length < 2 || alpha <= 0) return;
  g.globalAlpha = alpha;
  g.strokeStyle = color;
  g.lineWidth = w;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.stroke();
  g.globalAlpha = 1;
}

function dot(g: CanvasRenderingContext2D, p: Pt, r: number, color: string, alpha = 1) {
  if (alpha <= 0) return;
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  g.arc(p.x, p.y, r, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
}

/** Draws one frame. A pure function of (state, time): seeking never leaves artefacts. */
export function draw(g: CanvasRenderingContext2D, s: DrawState, sc: Scene, time: number) {
  const { W, H, o } = sc.size;
  g.clearRect(0, 0, W, H);
  g.fillStyle = INK;
  g.fillRect(0, 0, W, H);
  const k = Math.min(W, H) / 1080; // line widths scale with the stage
  const cx = W / 2, cy = H / 2;
  const beat = pulseAt(time); // 0..1, decays after every kick

  // seed glow
  if (s.seedA > 0) {
    const r = s.seedR * Math.min(W, H) * 1.6 * (1 + 0.06 * Math.sin(time * 2.6));
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(r, 1));
    grad.addColorStop(0, `rgba(255,77,46,${0.55 * s.seedA})`);
    grad.addColorStop(0.35, `rgba(255,77,46,${0.16 * s.seedA})`);
    grad.addColorStop(1, 'rgba(255,77,46,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    dot(g, { x: cx, y: cy }, 7 * k, PAPER, s.seedA);
  }

  // commit graph, seen through a camera that follows the focused branch
  if (s.graphA > 0.001) {
    const { trunk, main, side } = sc.graph;
    const centre = { x: cx, y: cy };
    const pull = (p: Pt): Pt => (s.converge > 0 ? { x: lerp(p.x, centre.x, s.converge), y: lerp(p.y, centre.y, s.converge) } : p);
    const pp = (pts: Pt[]) => (s.converge > 0 ? pts.map(pull) : pts);
    const a = s.graphA;
    // camera target: between the nodes of the branches around `focus`
    const f = Math.min(3, Math.max(0, s.focus));
    const i0 = Math.floor(f), i1 = Math.min(3, i0 + 1), fk = f - i0;
    const n0 = main[i0].pts[0], n1 = main[i1].pts[0];
    const target = { x: lerp(n0.x, n1.x, fk), y: lerp(n0.y, n1.y, fk) };
    const r = graphRect(o, W, H);
    const gc = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    const look = { x: lerp(gc.x, target.x, s.cam), y: gc.y };
    g.save();
    g.translate(gc.x, gc.y);
    g.scale(s.zoom, s.zoom);
    g.translate(-look.x, -gc.y);
    const lw = k / Math.sqrt(s.zoom);
    line(g, pp(partial(trunk, s.trunk)), PAPER, 2.5 * lw, a);
    main.forEach((b, i) => {
      const prog = [s.m0, s.m1, s.m2, s.m3][i];
      const hot = Math.max(0, 1 - Math.abs(s.focus - i));
      const part = pp(partial(b.pts, prog));
      // light: a wide, faint stroke under the focused branch
      if (hot > 0.05) line(g, part, b.color, (16 + beat * 10) * lw, a * 0.13 * hot);
      line(g, part, b.color, (2.4 + hot * 2 + hot * beat * 1.5) * lw, a * (0.45 + 0.55 * Math.max(hot, prog >= 1 && s.focus < 0 ? 1 : 0)));
      if (prog >= 1) dot(g, pull(b.node), (5 + hot * 4) * lw * (1 + hot * beat * 0.6), b.color, a);
    });
    side.forEach((b, i) => {
      const prog = [s.s0, s.s1, s.s2, s.s3, s.s4, s.s5, s.s6, s.s7, s.s8][i];
      line(g, pp(partial(b.pts, prog)), b.color, 2 * lw, a * 0.9);
      if (prog >= 1) dot(g, pull(b.node), 4.5 * lw * (1 + beat * 0.5), b.color, a);
    });
    if (s.trunk > 0) dot(g, pull(trunk[0]), 8 * lw * (1 + beat * 0.3), ACCENT, a);
    g.restore();
  }

  // agents graph
  if (s.agents > 0.001) {
    const N = sc.agents, ag = s.agents;
    for (let i = 1; i < N.length; i++) {
      const show = Math.min(1, Math.max(0, ag * 2.2 - (i - 1) * 0.12));
      line(g, [N[0], { x: lerp(N[0].x, N[i].x, show), y: lerp(N[0].y, N[i].y, show) }], PAPER, 1.5 * k, 0.35);
      const nx = N[i === 10 ? 1 : i + 1];
      if (show >= 1) line(g, [N[i], nx], PAPER, 1 * k, 0.18);
    }
    N.forEach((p, i) => dot(g, p, (i === 0 ? 13 : 8) * k * (1 + beat * (i === 0 ? 0.5 : 0.25)), i === 0 ? ACCENT : i % 2 ? BLUE : PAPER, Math.min(1, ag * 3 - i * 0.1)));
    // gates
    const gy = gateY(o) * H;
    const gx = (i: number) => (GATE_X0 + i * GATE_STEP) * W;
    line(g, [{ x: gx(0), y: gy }, { x: gx(5), y: gy }], PAPER, 1.5 * k, 0.25 * Math.min(1, ag * 2));
    line(g, [{ x: gx(0), y: gy }, { x: lerp(gx(0), gx(5), Math.min(1, s.gates / 5)), y: gy }], ACCENT, 3 * k, Math.min(1, ag * 2));
    for (let i = 0; i < 6; i++) {
      const lit = Math.min(1, Math.max(0, s.gates - i));
      dot(g, { x: gx(i), y: gy }, (7 + lit * 4) * k, lit > 0.5 ? ACCENT : PAPER, Math.min(1, ag * 2) * (0.35 + 0.65 * lit));
    }
  }

  // particles (the word, the burst, the name)
  if (s.pAlpha > 0.001) {
    const { word, name } = sc.targets;
    g.fillStyle = PAPER;
    for (let i = 0; i < sc.particles.length; i++) {
      const p = sc.particles[i];
      const w = word[i % word.length], n = name[i % name.length];
      let x = lerp(p.sx, w.x, s.toWord), y = lerp(p.sy, w.y, s.toWord);
      if (s.burst > 0) {
        const d = s.burst * s.burst * p.spd * Math.min(W, H) * 0.9;
        x += Math.cos(p.ang) * d; y += Math.sin(p.ang) * d;
      }
      const par = (s.cam * (p.tone - 0.5) * 60 + s.cam * 40) * k; // depth: far stars move less
      x = lerp(x, p.rx - par + Math.sin(time * 0.6 + p.ang) * 12, s.toScatter);
      y = lerp(y, p.ry + Math.cos(time * 0.5 + p.ang) * 12, s.toScatter);
      x = lerp(x, n.x, s.toName); y = lerp(y, n.y, s.toName);
      g.globalAlpha = s.pAlpha * (0.45 + 0.55 * p.tone);
      g.fillStyle = p.tone > 0.82 ? ACCENT : p.tone < 0.12 ? BLUE : PAPER;
      const sz = p.size * k * (1 + s.toName * 0.4);
      g.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    }
    g.globalAlpha = 1;
  }
}

export { mapUV };
