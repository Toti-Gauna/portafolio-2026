/**
 * complia · an embedding space. Document points drift in clusters; every few seconds a query (yellow) arrives
 * along a soft ray, its nearest neighbours light up in blue one by one, linked to it, and fade: retrieval.
 */
import { BufferAttribute, BufferGeometry, Group, LineSegments, Points, Vector3 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { FLAT_LIGHT_FRAG, SOFT_POINT_FRAG, gauss, lightMaterial, mulberry32, vec, worldAt, PALETTE } from '../kit';

const K = 7; // neighbours per query
const PERIOD = 7.5; // seconds between queries

// the same drift on the GPU (DRIFT) and on the CPU (drift): neighbours are found where the points really are
const DRIFT = /* glsl */ `
vec3 drift(vec3 p, float s, float t) {
  return p + 0.09 * vec3(sin(t * 0.21 + s * 6.0), cos(t * 0.17 + s * 9.0), sin(t * 0.13 + s * 3.0));
}`;
const drift = (p: Vector3, s: number, t: number) =>
  new Vector3(p.x + 0.09 * Math.sin(t * 0.21 + s * 6), p.y + 0.09 * Math.cos(t * 0.17 + s * 9), p.z + 0.09 * Math.sin(t * 0.13 + s * 3));

export const still = 10.4;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const cloud = new Group();
  scene.add(cloud);

  const place = () => {
    const portrait = ctx.h > ctx.w;
    cloud.position.copy(worldAt(camera, portrait ? 0.62 : 0.74, portrait ? 0.36 : 0.48, -1.5));
  };
  place();

  // clusters: topics in the space
  const C = 6;
  const centers: Vector3[] = [];
  for (let c = 0; c < C; c++) {
    const a = (c / C) * Math.PI * 2 + rng() * 0.6;
    centers.push(new Vector3(Math.cos(a) * (1.3 + rng() * 0.9), Math.sin(a) * (1.0 + rng() * 0.7), (rng() - 0.5) * 2.6));
  }
  const N = mobile ? 230 : 520;
  const base: Vector3[] = [];
  const seeds = new Float32Array(N);
  const cl = new Float32Array(N);
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const c = i < N * 0.9 ? Math.floor(rng() * C) : -1; // a few strays between topics
    const spread = c < 0 ? 2.2 : 0.42;
    const ctr = c < 0 ? new Vector3() : centers[c];
    const p = new Vector3(ctr.x + gauss(rng) * spread, ctr.y + gauss(rng) * spread * 0.8, ctr.z + gauss(rng) * spread);
    base.push(p);
    pos.set([p.x, p.y, p.z], i * 3);
    seeds[i] = rng();
    cl[i] = c;
  }
  const glow = new Float32Array(N); // rank (1..K) of a lit neighbour in the current query, 0 otherwise

  const u = {
    uTime: { value: 0 },
    uPx: { value: dpr },
    uQ: { value: 0 }, // seconds since the current query arrived
    uDoc: { value: vec('#cfd6e6') },
    uBlue: { value: vec(PALETTE.sky) },
    uYellow: { value: vec(PALETTE.yellow) },
  };

  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  g.setAttribute('aCl', new BufferAttribute(cl, 1));
  const glowAttr = new BufferAttribute(glow, 1);
  g.setAttribute('aGlow', glowAttr);
  // lit neighbour: fades in by rank (closest first), holds, fades out with the query
  const LIT = /* glsl */ `
  float lit(float rank, float q) {
    if (rank < 0.5) return 0.0;
    float on = smoothstep(1.1 + rank * 0.22, 1.6 + rank * 0.22, q);
    return on * (1.0 - smoothstep(4.6, 6.2, q));
  }`;
  const pts = new Points(
    g,
    lightMaterial(
      /* glsl */ `
      attribute float aSeed; attribute float aCl; attribute float aGlow;
      uniform float uTime; uniform float uPx; uniform float uQ; uniform vec3 uDoc; uniform vec3 uBlue;
      varying vec3 vColor; varying float vAlpha;
      ${DRIFT}
      ${LIT}
      void main() {
        vec3 p = drift(position, aSeed, uTime);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float l = lit(aGlow, uQ);
        float depth = clamp((-mv.z - 7.0) / 8.0, 0.0, 1.0);
        float tint = step(0.5, mod(aCl, 2.0)) * step(0.0, aCl);
        vColor = mix(mix(uDoc, uBlue, tint * 0.55), uBlue, l);
        vAlpha = (0.5 - depth * 0.24) * (aCl < 0.0 ? 0.55 : 1.0) + l * 0.9;
        gl_PointSize = ((1.8 + aSeed * 1.6) * (1.0 - depth * 0.35) + l * 3.5) * uPx;
        gl_Position = projectionMatrix * mv;
      }`,
      SOFT_POINT_FRAG,
      u,
    ),
  );
  cloud.add(pts);

  // the query: a point, the ray it came along and the links to its neighbours (1 + K segments)
  const lpos = new Float32Array((1 + K) * 6);
  const lseed = new Float32Array((1 + K) * 2);
  const lkind = new Float32Array((1 + K) * 2); // 0 ray start, 1 ray end, 2 link at query, 3 link at neighbour
  const lrank = new Float32Array((1 + K) * 2);
  lkind.set([0, 1]);
  for (let k = 0; k < K; k++) {
    lkind.set([2, 3], 2 + k * 2);
    lrank.set([k + 1, k + 1], 2 + k * 2);
  }
  const lg = new BufferGeometry();
  const lposAttr = new BufferAttribute(lpos, 3);
  const lseedAttr = new BufferAttribute(lseed, 1);
  lg.setAttribute('position', lposAttr);
  lg.setAttribute('aSeed', lseedAttr);
  lg.setAttribute('aKind', new BufferAttribute(lkind, 1));
  lg.setAttribute('aRank', new BufferAttribute(lrank, 1));
  const links = new LineSegments(
    lg,
    lightMaterial(
      /* glsl */ `
      attribute float aSeed; attribute float aKind; attribute float aRank;
      uniform float uTime; uniform float uQ; uniform vec3 uBlue; uniform vec3 uYellow;
      varying vec3 vColor; varying float vAlpha;
      ${DRIFT}
      ${LIT}
      void main() {
        vec3 p = aKind > 2.5 ? drift(position, aSeed, uTime) : position;
        float ray = smoothstep(0.0, 0.9, uQ) * (1.0 - smoothstep(1.4, 2.6, uQ));
        float link = lit(aRank, uQ);
        vColor = aKind < 1.5 ? uYellow : uBlue;
        vAlpha = aKind < 0.5 ? 0.0 : aKind < 1.5 ? ray * 0.32 : link * (aKind < 2.5 ? 0.3 : 0.16);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  cloud.add(links);

  const qg = new BufferGeometry();
  const qpos = new Float32Array(3);
  const qAttr = new BufferAttribute(qpos, 3);
  qg.setAttribute('position', qAttr);
  const query = new Points(
    qg,
    lightMaterial(
      /* glsl */ `
      uniform float uPx; uniform float uQ; uniform vec3 uYellow;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float on = smoothstep(0.6, 1.0, uQ) * (1.0 - smoothstep(4.8, 6.2, uQ));
        vColor = uYellow;
        vAlpha = on;
        gl_PointSize = (5.0 + 3.0 * on) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      SOFT_POINT_FRAG,
      u,
    ),
  );
  cloud.add(query);

  let event = -1;
  const setQuery = (n: number, t0: number) => {
    const r = mulberry32(9001 + n * 7919);
    const c = centers[Math.floor(r() * C)];
    const q = new Vector3(c.x + gauss(r) * 0.35, c.y + gauss(r) * 0.3, c.z + gauss(r) * 0.35);
    qpos.set([q.x, q.y, q.z]);
    qAttr.needsUpdate = true;
    // the ray comes in from outside the cloud, from the open side of the page
    lpos.set([q.x + 2.6, q.y + 1.6, q.z + 1.2, q.x, q.y, q.z], 0);
    // nearest neighbours where the points will be when they light up
    const at = t0 + 1.5;
    const d = base.map((p, i) => [drift(p, seeds[i], at).distanceToSquared(q), i] as const).sort((a, b) => a[0] - b[0]);
    glow.fill(0);
    for (let k = 0; k < K; k++) {
      const i = d[k][1];
      glow[i] = k + 1;
      const b = base[i];
      lpos.set([q.x, q.y, q.z, b.x, b.y, b.z], 6 + k * 6);
      lseed.set([seeds[i], seeds[i]], 2 + k * 2);
    }
    glowAttr.needsUpdate = true;
    lposAttr.needsUpdate = true;
    lseedAttr.needsUpdate = true;
  };

  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      const n = Math.floor(i.t / PERIOD);
      if (n !== event) {
        event = n;
        setQuery(n, n * PERIOD);
      }
      u.uQ.value = i.t - n * PERIOD;
      cloud.rotation.y = i.t * 0.018 + i.progress * 0.6;
      cloud.rotation.x = Math.sin(i.t * 0.05) * 0.08;
    },
    resize() {
      place();
    },
  };
}
