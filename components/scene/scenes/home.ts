/**
 * home · Germinación. A seed of light low on the left; thin 3D branches grow from it and fork, every tip a
 * small bud, pollen drifting up. Growth takes ~40 s; scrolling down advances it. Fully grown with reduced motion.
 */
import { BufferAttribute, BufferGeometry, Group, LineSegments, Points, Vector3 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { FLAT_LIGHT_FRAG, SOFT_POINT_FRAG, gauss, lightMaterial, vec, worldAt, PALETTE } from '../kit';

type Seg = { a: Vector3; b: Vector3; b0: number; b1: number; depth: number };
type Bud = { p: Vector3; birth: number; depth: number };

const SPEED = 0.42; // world units per second along a branch

function growTree(rng: () => number, start: Vector3, dir: Vector3, len: number, maxDepth: number, lean: Vector3) {
  const segs: Seg[] = [];
  const buds: Bud[] = [];
  const grow = (from: Vector3, d0: Vector3, length: number, depth: number, birth: number) => {
    const steps = Math.max(4, Math.round(length / 0.14));
    const step = length / steps;
    const dt = step / SPEED;
    const d = d0.clone();
    let p = from.clone();
    // where this branch forks: a few points along it, more on the trunk
    const forks = depth >= maxDepth ? 0 : depth === 0 ? 4 : depth === 1 ? 3 : 2;
    const at = new Set<number>();
    for (let k = 0; k < forks; k++) at.add(Math.min(steps - 1, Math.max(1, Math.round(steps * (0.28 + (0.62 * (k + rng() * 0.8)) / forks)))));
    for (let i = 0; i < steps; i++) {
      // a slow wander, light-seeking: toward the open side of the page
      d.add(new Vector3((rng() - 0.5) * 0.16 + lean.x, (rng() - 0.5) * 0.1 + lean.y, (rng() - 0.5) * 0.16)).normalize();
      const q = p.clone().addScaledVector(d, step);
      segs.push({ a: p, b: q, b0: birth + i * dt, b1: birth + (i + 1) * dt, depth });
      if (at.has(i + 1)) {
        // the child leaves at 0.45–0.85 rad around a random axis perpendicular to the parent
        const axis = new Vector3(gauss(rng), gauss(rng), gauss(rng)).cross(d).normalize();
        const side = new Vector3().copy(d).applyAxisAngle(axis, (0.45 + rng() * 0.4) * (rng() < 0.5 ? -1 : 1));
        side.y = Math.max(side.y, -0.15);
        grow(q, side.normalize(), length * (0.52 + rng() * 0.2), depth + 1, birth + (i + 1) * dt + 0.3 + rng() * 0.8);
      }
      p = q;
    }
    buds.push({ p, birth: birth + steps * dt, depth });
  };
  grow(start, dir.clone().normalize(), len, 0, 0);
  return { segs, buds };
}

export const still = 60;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const root = new Group();
  scene.add(root);
  const tree = new Group();
  root.add(tree);

  let seed = new Vector3();
  const place = () => {
    const portrait = ctx.h > ctx.w;
    seed = worldAt(camera, portrait ? 0.09 : 0.06, portrait ? 0.995 : 0.95, 0);
    tree.position.copy(seed);
  };
  place();

  const span = 2 * camera.position.z * Math.tan((camera.fov / 2) * (Math.PI / 180)); // visible height at z = 0
  // landscape: paths open to the right, like a timeline; portrait: up the long side of the phone
  const wide = ctx.w >= ctx.h;
  const { segs, buds } = wide
    ? growTree(rng, new Vector3(), new Vector3(1, 0.42, 0.05), span * 0.72, 5, new Vector3(0.02, 0.002, 0))
    : growTree(rng, new Vector3(), new Vector3(0.5, 1, 0.05), span * 0.4, 4, new Vector3(0.004, 0.012, 0));
  const T = Math.max(...buds.map((b) => b.birth));

  // --- branches: each segment carries its start (aFrom) and both birth times, the shader grows it ---
  const n = segs.length;
  const pos = new Float32Array(n * 6);
  const from = new Float32Array(n * 6);
  const b0 = new Float32Array(n * 2);
  const b1 = new Float32Array(n * 2);
  const depth = new Float32Array(n * 2);
  segs.forEach((s, i) => {
    pos.set([s.a.x, s.a.y, s.a.z, s.b.x, s.b.y, s.b.z], i * 6);
    from.set([s.a.x, s.a.y, s.a.z, s.a.x, s.a.y, s.a.z], i * 6);
    b0.set([s.b0, s.b0], i * 2);
    b1.set([s.b1, s.b1], i * 2);
    depth.set([s.depth, s.depth], i * 2);
  });
  const lg = new BufferGeometry();
  lg.setAttribute('position', new BufferAttribute(pos, 3));
  lg.setAttribute('aFrom', new BufferAttribute(from, 3));
  lg.setAttribute('aB0', new BufferAttribute(b0, 1));
  lg.setAttribute('aB1', new BufferAttribute(b1, 1));
  lg.setAttribute('aDepth', new BufferAttribute(depth, 1));
  const uniforms = {
    uTime: { value: 0 },
    uGrow: { value: 0 },
    uPx: { value: dpr },
    uBase: { value: vec('#d9cfc2') },
    uTip: { value: vec(PALETTE.coral) },
    uBud: { value: vec(PALETTE.yellow) },
  };
  const lines = new LineSegments(
    lg,
    lightMaterial(
      /* glsl */ `
      attribute vec3 aFrom; attribute float aB0; attribute float aB1; attribute float aDepth;
      uniform float uTime; uniform float uGrow; uniform vec3 uBase; uniform vec3 uTip;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float f = clamp((uGrow - aB0) / max(aB1 - aB0, 1e-3), 0.0, 1.0);
        vec3 p = mix(aFrom, position, f);
        float r = length(p);
        p.x += sin(uTime * 0.21 + p.y * 0.8) * 0.018 * r;
        p.z += sin(uTime * 0.17 + p.x * 0.6) * 0.03 * r;
        float age = uGrow - aB1;
        float tip = exp(-max(age, 0.0) * 1.1);
        vColor = mix(uBase, uTip, tip);
        vAlpha = step(aB0, uGrow) * (mix(0.095, 0.045, aDepth / 5.0) + tip * 0.3);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
      FLAT_LIGHT_FRAG,
      uniforms,
    ),
  );
  tree.add(lines);

  // --- buds at every branch end, forks marked like commits ---
  const bg = new BufferGeometry();
  const bp = new Float32Array(buds.length * 3);
  const bb = new Float32Array(buds.length);
  const bs = new Float32Array(buds.length);
  buds.forEach((b, i) => {
    bp.set([b.p.x, b.p.y, b.p.z], i * 3);
    bb[i] = b.birth;
    bs[i] = rng();
  });
  bg.setAttribute('position', new BufferAttribute(bp, 3));
  bg.setAttribute('aBirth', new BufferAttribute(bb, 1));
  bg.setAttribute('aSeed', new BufferAttribute(bs, 1));
  const budPoints = new Points(
    bg,
    lightMaterial(
      /* glsl */ `
      attribute float aBirth; attribute float aSeed;
      uniform float uTime; uniform float uGrow; uniform float uPx; uniform vec3 uTip; uniform vec3 uBud;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec3 p = position;
        float r = length(p);
        p.x += sin(uTime * 0.21 + p.y * 0.8) * 0.018 * r;
        p.z += sin(uTime * 0.17 + p.x * 0.6) * 0.03 * r;
        float on = smoothstep(0.0, 1.6, uGrow - aBirth);
        float pulse = 0.7 + 0.3 * sin(uTime * 0.7 + aSeed * 6.283);
        vColor = mix(uTip, uBud, aSeed);
        vAlpha = on * pulse * 0.55;
        gl_PointSize = (2.2 + aSeed * 2.2) * uPx * on;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
      SOFT_POINT_FRAG,
      uniforms,
    ),
  );
  tree.add(budPoints);

  // --- the seed: a small hot core and a wide, faint glow ---
  const sg = new BufferGeometry();
  sg.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 0, 0, 0]), 3));
  sg.setAttribute('aKind', new BufferAttribute(new Float32Array([0, 1]), 1));
  const seedPts = new Points(
    sg,
    lightMaterial(
      /* glsl */ `
      attribute float aKind;
      uniform float uTime; uniform float uPx; uniform vec3 uTip; uniform vec3 uBud;
      varying vec3 vColor; varying float vAlpha; varying float vKind;
      void main() {
        float breathe = 0.82 + 0.18 * sin(uTime * 0.9);
        vKind = aKind;
        vColor = aKind > 0.5 ? mix(uBud, vec3(1.0), 0.4) : uTip;
        vAlpha = aKind > 0.5 ? 1.0 : 0.14 * breathe;
        gl_PointSize = (aKind > 0.5 ? 7.0 : 260.0 * breathe) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      /* glsl */ `
      varying vec3 vColor; varying float vAlpha; varying float vKind;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        if (r > 1.0) discard;
        float a = vKind > 0.5 ? smoothstep(1.0, 0.2, r) : exp(-r * r * 5.0) - 0.0067;
        gl_FragColor = vec4(vColor * vAlpha * max(a, 0.0), 0.0);
      }`,
      uniforms,
    ),
  );
  tree.add(seedPts);

  // --- pollen: tiny motes rising slowly through the light ---
  const count = mobile ? 40 : 90;
  const pg = new BufferGeometry();
  const pp = new Float32Array(count * 3);
  const pv = new Float32Array(count * 3);
  const ps = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pp.set([rng() * span * 1.6, rng() * span * 1.05, (rng() - 0.5) * 3], i * 3);
    pv.set([0.02 + rng() * 0.03, 0.035 + rng() * 0.05, 0], i * 3);
    ps[i] = rng();
  }
  pg.setAttribute('position', new BufferAttribute(pp, 3));
  pg.setAttribute('aVel', new BufferAttribute(pv, 3));
  pg.setAttribute('aSeed', new BufferAttribute(ps, 1));
  const pollenU = { ...uniforms, uBox: { value: new Vector3(span * 1.6, span * 1.05, 3) } };
  const pollen = new Points(
    pg,
    lightMaterial(
      /* glsl */ `
      attribute vec3 aVel; attribute float aSeed;
      uniform float uTime; uniform float uPx; uniform vec3 uBox; uniform vec3 uBase; uniform vec3 uBud;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec3 p = mod(position + aVel * uTime, uBox);
        p.x += sin(uTime * 0.31 + aSeed * 40.0) * 0.12;
        float edge = smoothstep(0.0, 0.25, p.y / uBox.y) * smoothstep(1.0, 0.7, p.y / uBox.y);
        float near = exp(-length(p.xy) / (uBox.y * 0.55));
        vColor = mix(uBase, uBud, aSeed * 0.6);
        vAlpha = edge * (0.25 + 0.75 * near) * (0.55 + 0.45 * sin(uTime * (0.4 + aSeed) + aSeed * 30.0));
        gl_PointSize = (1.6 + aSeed * 2.0) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p - vec3(0.05 * uBox.x, 0.0, uBox.z * 0.5), 1.0);
      }`,
      SOFT_POINT_FRAG,
      pollenU,
    ),
  );
  tree.add(pollen);

  return {
    frame(i: SceneInput) {
      uniforms.uTime.value = i.t;
      // grows on its own (quick at first, then slower and slower); scrolling down advances it up to 40 %
      uniforms.uGrow.value = Math.min(T + 4, (T + 3) * (1 - Math.exp(-(i.t + 4) / 16)) + i.progress * T * 0.4);
      tree.rotation.y = Math.sin(i.t * 0.035) * 0.22 + i.progress * 0.35;
    },
    resize() {
      place();
    },
  };
}
