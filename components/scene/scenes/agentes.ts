/**
 * agentes · a quiet graph of 11 nodes (the agentic system). Work pulses leave the planner, pass through the
 * workers and stop at one gate node (yellow ring) until it lets them through; past the gate they turn green
 * and reach the last node. The graph turns slowly in depth.
 */
import { BufferAttribute, BufferGeometry, Group, LineSegments, Points, Vector3 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { FLAT_LIGHT_FRAG, SOFT_DOT, halfSize, lightMaterial, vec, worldAt, PALETTE } from '../kit';

// 0 planner → 1–4 workers → 5–7 reviewers → 8 gate → 9 release → 10 production
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 5], [2, 5], [2, 6], [3, 6], [3, 7], [4, 7],
  [5, 8], [6, 8], [7, 8],
  [8, 9], [9, 10],
];
const GATE = 8;
const HOLD = 1.4; // seconds a pulse waits at the gate

export const still = 7.2;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const graph = new Group();
  scene.add(graph);

  // layered layout in depth: columns left → right, spread in y and z
  const cols = [[0], [1, 2, 3, 4], [5, 6, 7], [8], [9], [10]];
  const nodes: Vector3[] = new Array(11);
  cols.forEach((col, c) => {
    col.forEach((id, k) => {
      const y = (k - (col.length - 1) / 2) * 1.05 + (rng() - 0.5) * 0.3;
      const z = (rng() - 0.5) * 1.8;
      nodes[id] = new Vector3((c - 2.5) * 1.35, y, z);
    });
  });

  const u = {
    uTime: { value: 0 },
    uPx: { value: dpr },
    uPaper: { value: vec(PALETTE.paper) },
    uCoral: { value: vec(PALETTE.coral) },
    uYellow: { value: vec(PALETTE.yellow) },
    uGreen: { value: vec(PALETTE.green) },
    uGate: { value: 0 }, // 0..1 while a pulse is held at the gate
  };

  const ep: number[] = [];
  for (const [a, b] of EDGES) ep.push(nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z);
  const eg = new BufferGeometry();
  eg.setAttribute('position', new BufferAttribute(new Float32Array(ep), 3));
  const edges = new LineSegments(
    eg,
    lightMaterial(
      /* glsl */ `
      uniform vec3 uPaper; varying vec3 vColor; varying float vAlpha;
      void main() { vColor = uPaper; vAlpha = 0.085; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  graph.add(edges);

  // nodes as rings with a dot; the gate is a larger yellow ring
  const np = new Float32Array(11 * 3);
  const nk = new Float32Array(11);
  nodes.forEach((n, i) => {
    np.set([n.x, n.y, n.z], i * 3);
    nk[i] = i === GATE ? 1 : i === 10 ? 2 : 0;
  });
  const ng = new BufferGeometry();
  ng.setAttribute('position', new BufferAttribute(np, 3));
  ng.setAttribute('aK', new BufferAttribute(nk, 1));
  const nodePts = new Points(
    ng,
    lightMaterial(
      /* glsl */ `
      attribute float aK; uniform float uPx; uniform float uGate; uniform vec3 uPaper; uniform vec3 uYellow; uniform vec3 uGreen;
      varying vec3 vColor; varying float vAlpha; varying float vK;
      void main() {
        vK = aK;
        vColor = aK > 1.5 ? uGreen : aK > 0.5 ? uYellow : uPaper;
        vAlpha = aK > 0.5 && aK < 1.5 ? 0.45 + 0.5 * uGate : 0.4;
        gl_PointSize = (aK > 0.5 && aK < 1.5 ? 22.0 + 6.0 * uGate : 13.0) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      /* glsl */ `
      varying vec3 vColor; varying float vAlpha; varying float vK;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        if (r > 1.0) discard;
        float ring = smoothstep(0.12, 0.0, abs(r - 0.78));
        float dot = smoothstep(0.32, 0.18, r) * (vK > 0.5 && vK < 1.5 ? 0.0 : 0.6);
        gl_FragColor = vec4(vColor * vAlpha * (ring + dot), 0.0);
      }`,
      u,
    ),
  );
  graph.add(nodePts);

  // pulses: each runs a path 0 → worker → reviewer → gate (hold) → 9 → 10
  const paths: number[][] = [];
  for (const [a, b] of EDGES) if (a === 0) for (const [c, d] of EDGES) if (c === b && d >= 5 && d <= 7) paths.push([0, b, d, GATE, 9, 10]);
  type Pulse = { path: number[]; start: number };
  const P = mobile ? 4 : 6;
  const gap = 3.2;
  const pulses: Pulse[] = [];
  for (let k = 0; k < P; k++) pulses.push({ path: paths[Math.floor(rng() * paths.length)], start: -k * gap });
  const legT = 1.6; // seconds per edge
  const total = legT * 5 + HOLD;
  const TR = 5;
  const pp = new Float32Array(P * TR * 3);
  const pa = new Float32Array(P * TR);
  const pc = new Float32Array(P * TR);
  const pg = new BufferGeometry();
  const ppAttr = new BufferAttribute(pp, 3);
  const paAttr = new BufferAttribute(pa, 1);
  const pcAttr = new BufferAttribute(pc, 1);
  pg.setAttribute('position', ppAttr);
  pg.setAttribute('aAlpha', paAttr);
  pg.setAttribute('aC', pcAttr);
  const pulsePts = new Points(
    pg,
    lightMaterial(
      /* glsl */ `
      attribute float aAlpha; attribute float aC; uniform float uPx; uniform vec3 uCoral; uniform vec3 uGreen;
      varying vec3 vColor; varying float vAlpha;
      void main() { vColor = mix(uCoral, uGreen, aC); vAlpha = aAlpha; gl_PointSize = (2.0 + 3.0 * aAlpha) * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      /* glsl */ `
      varying vec3 vColor; varying float vAlpha;
      ${SOFT_DOT}
      void main() { float a = softDot(gl_PointCoord); if (a <= 0.0) discard; gl_FragColor = vec4(vColor * vAlpha * a, 0.0); }`,
      u,
    ),
  );
  graph.add(pulsePts);

  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const posAt = (path: number[], s: number, out: Vector3) => {
    // s: seconds into the trip. legs 0..2 before the gate, hold, legs 3..4 after
    const before = legT * 3;
    if (s < before) {
      const leg = Math.floor(s / legT);
      return out.copy(nodes[path[leg]]).lerp(nodes[path[leg + 1]], ease((s - leg * legT) / legT));
    }
    if (s < before + HOLD) return out.copy(nodes[GATE]);
    const s2 = s - before - HOLD;
    const leg = Math.min(4, 3 + Math.floor(s2 / legT));
    return out.copy(nodes[path[leg]]).lerp(nodes[path[leg + 1]], ease(Math.min(1, (s2 - (leg - 3) * legT) / legT)));
  };
  const tmp = new Vector3();

  const place = () => {
    const portrait = ctx.h > ctx.w;
    const { halfH, halfW } = halfSize(camera, 0);
    graph.position.copy(worldAt(camera, portrait ? 0.52 : 0.7, portrait ? 0.24 : 0.48, 0));
    graph.scale.setScalar(portrait ? 0.27 * halfW : 0.42 * halfH);
  };
  place();

  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      let gate = 0;
      pulses.forEach((p, k) => {
        let s = i.t - p.start;
        if (s > total + 0.6) {
          p.start += Math.ceil((s - total) / (P * gap)) * P * gap;
          p.path = paths[(k + Math.floor(i.t)) % paths.length];
          s = i.t - p.start;
        }
        const live = s >= 0 && s <= total ? Math.min(1, s / 0.3, (total - s) / 0.4 + 0.2) : 0;
        const past = s > legT * 3 + HOLD ? 1 : 0;
        if (s > legT * 3 && s < legT * 3 + HOLD) gate = Math.max(gate, Math.sin(((s - legT * 3) / HOLD) * Math.PI));
        for (let q = 0; q < TR; q++) {
          posAt(p.path, Math.max(0, s - q * 0.07), tmp);
          pp.set([tmp.x, tmp.y, tmp.z], (k * TR + q) * 3);
          pa[k * TR + q] = live * (q === 0 ? 0.95 : 0.35 * (1 - q / TR));
          pc[k * TR + q] = past;
        }
      });
      u.uGate.value = gate;
      ppAttr.needsUpdate = true;
      paAttr.needsUpdate = true;
      pcAttr.needsUpdate = true;
      graph.rotation.y = Math.sin(i.t * 0.04) * 0.35 + i.progress * 0.5;
      graph.rotation.x = Math.sin(i.t * 0.03) * 0.08;
    },
    resize() {
      place();
    },
  };
}
