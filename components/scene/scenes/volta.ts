/**
 * volta · energy. Three electric arcs hang between two poles at the top right, crawling slowly (no flicker):
 * a soft ribbon each, with a surge that runs along it now and then and throws a few sparks. Blue and yellow.
 */
import { BufferAttribute, BufferGeometry, Group, Mesh, Points, Vector2 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { SOFT_POINT_FRAG, halfSize, lightMaterial, vec, worldAt, PALETTE } from '../kit';

const N = 56; // points per arc

export const still = 6;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const rig = new Group();
  scene.add(rig);
  const u = {
    uTime: { value: 0 },
    uPx: { value: dpr },
    uSky: { value: vec(PALETTE.sky) },
    uBlue: { value: vec(PALETTE.blue) },
    uYellow: { value: vec(PALETTE.yellow) },
    uWhite: { value: vec('#e8eeff') },
  };

  // poles in rig space; arcs sag between them like a catenary and wander with layered sines
  const A = mobile ? 2 : 3;
  const arcs = Array.from({ length: A }, (_, k) => ({
    a: new Vector2(-1.05, 0.1 + k * 0.04),
    b: new Vector2(1.05, -0.05 + k * 0.05),
    sag: [0.22, 0.5, 0.36][k],
    amp: [0.08, 0.13, 0.1][k],
    ph: rng() * 100,
    sp: 0.3 + rng() * 0.3,
    surge: 5.5 + k * 2.3 + rng() * 2,
  }));
  const W = 0.045; // ribbon half-width (rig units)
  const verts = A * (N - 1) * 6;
  const rp = new Float32Array(verts * 3);
  const rv = new Float32Array(verts); // -1..1 across the ribbon
  const rt = new Float32Array(verts); // 0..1 along the arc
  const ra = new Float32Array(verts); // arc index
  const rpAttr = new BufferAttribute(rp, 3);
  const rg = new BufferGeometry();
  rg.setAttribute('position', rpAttr);
  rg.setAttribute('aV', new BufferAttribute(rv, 1));
  rg.setAttribute('aT', new BufferAttribute(rt, 1));
  rg.setAttribute('aA', new BufferAttribute(ra, 1));
  let o = 0;
  for (let k = 0; k < A; k++)
    for (let i = 0; i < N - 1; i++)
      for (const [di, side] of [[0, -1], [1, -1], [1, 1], [0, -1], [1, 1], [0, 1]]) {
        rv[o] = side;
        rt[o] = (i + di) / (N - 1);
        ra[o] = k;
        o++;
      }
  const ribbonU = { ...u, uSurge: { value: new Float32Array(3) } };
  const ribbons = new Mesh(
    rg,
    lightMaterial(
      /* glsl */ `
      attribute float aV; attribute float aT; attribute float aA;
      uniform float uSurge[3]; uniform vec3 uSky; uniform vec3 uWhite;
      varying vec3 vColor; varying float vAlpha; varying float vV;
      void main() {
        float s = aA < 0.5 ? uSurge[0] : aA < 1.5 ? uSurge[1] : uSurge[2];
        float run = exp(-pow((aT - s) * 7.0, 2.0)) * step(0.0, s) * step(s, 1.0);
        float ends = smoothstep(0.0, 0.08, aT) * smoothstep(1.0, 0.92, aT);
        vV = aV;
        vColor = mix(uSky, uWhite, run * 0.6);
        vAlpha = (0.16 + run * 0.55) * (0.55 + 0.45 * ends);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      /* glsl */ `
      varying vec3 vColor; varying float vAlpha; varying float vV;
      void main() {
        float core = exp(-vV * vV * 28.0);
        float halo = exp(-vV * vV * 3.5) * 0.22;
        gl_FragColor = vec4(vColor * vAlpha * (core + halo), 0.0);
      }`,
      ribbonU,
    ),
  );
  rig.add(ribbons);

  // poles: two small bright terminals
  const pg = new BufferGeometry();
  pg.setAttribute('position', new BufferAttribute(new Float32Array([-1.05, 0.12, 0, 1.05, -0.02, 0]), 3));
  const poles = new Points(
    pg,
    lightMaterial(
      /* glsl */ `
      uniform float uPx; uniform vec3 uWhite; varying vec3 vColor; varying float vAlpha;
      void main() { vColor = uWhite; vAlpha = 0.7; gl_PointSize = 6.0 * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      SOFT_POINT_FRAG,
      u,
    ),
  );
  rig.add(poles);

  // sparks: born on an arc where a surge passes, they fly out, fall a little and fade
  const S = mobile ? 70 : 150;
  const sp = new Float32Array(S * 3);
  const sv = new Float32Array(S * 3);
  const sb = new Float32Array(S).fill(-99);
  const spAttr = new BufferAttribute(sp, 3);
  const svAttr = new BufferAttribute(sv, 3);
  const sbAttr = new BufferAttribute(sb, 1);
  const sg = new BufferGeometry();
  sg.setAttribute('position', spAttr);
  sg.setAttribute('aVel', svAttr);
  sg.setAttribute('aBorn', sbAttr);
  const sparks = new Points(
    sg,
    lightMaterial(
      /* glsl */ `
      attribute vec3 aVel; attribute float aBorn; uniform float uTime; uniform float uPx; uniform vec3 uYellow; uniform vec3 uWhite;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float age = uTime - aBorn;
        vec3 p = position + aVel * age + vec3(0.0, -0.06 * age * age, 0.0);
        float life = 1.0 - smoothstep(0.0, 2.2, age);
        vColor = mix(uWhite, uYellow, smoothstep(0.0, 0.6, age));
        vAlpha = life * step(0.0, age) * 0.85;
        gl_PointSize = (1.4 + 1.6 * life) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
      SOFT_POINT_FRAG,
      u,
    ),
  );
  rig.add(sparks);

  const pts: Vector2[] = Array.from({ length: N }, () => new Vector2());
  const arcPoint = (k: number, t: number, time: number, out: Vector2) => {
    const arc = arcs[k];
    const x = arc.a.x + (arc.b.x - arc.a.x) * t;
    const y = arc.a.y + (arc.b.y - arc.a.y) * t - arc.sag * Math.sin(Math.PI * t);
    const env = Math.sin(Math.PI * t);
    const q = time * arc.sp + arc.ph;
    // layered sines from smooth to jagged: an arc that crawls without flickering
    const j = (Math.sin(t * 9 + q * 1.3) * 0.45 + Math.sin(t * 23 - q * 1.9) * 0.28 + Math.sin(t * 57 + q * 2.7) * 0.17 + Math.sin(t * 131 - q * 3.3) * 0.1) * arc.amp * env;
    const j2 = Math.sin(t * 17 - q * 1.1 + k) * arc.amp * 0.5 * env;
    return out.set(x + j2, y + j);
  };
  let nextSpark = 0;

  const place = () => {
    const portrait = ctx.h > ctx.w;
    const { halfH, halfW } = halfSize(camera, 0);
    rig.position.copy(worldAt(camera, portrait ? 0.6 : 0.72, portrait ? 0.16 : 0.2, 0));
    rig.scale.setScalar(portrait ? halfW * 0.62 : halfH * 0.62);
  };
  place();

  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      o = 0;
      for (let k = 0; k < A; k++) {
        for (let n = 0; n < N; n++) arcPoint(k, n / (N - 1), i.t, pts[n]);
        for (let n = 0; n < N - 1; n++) {
          const a = pts[n], b = pts[n + 1];
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
          const nx = (-dy / len) * W, ny = (dx / len) * W;
          for (const [di, side] of [[0, -1], [1, -1], [1, 1], [0, -1], [1, 1], [0, 1]]) {
            const p = di ? b : a;
            rp[o * 3] = p.x + nx * side;
            rp[o * 3 + 1] = p.y + ny * side;
            rp[o * 3 + 2] = 0;
            o++;
          }
        }
        // a surge runs along each arc every few seconds
        const arc = arcs[k];
        const cyc = (i.t + k * 1.7) % arc.surge;
        const s = cyc / 1.6;
        ribbonU.uSurge.value[k] = s <= 1 ? s : -1;
        if (s <= 1) {
          if (i.t >= nextSpark) {
            nextSpark = i.t + 0.05;
            const at = arcPoint(k, s, i.t, new Vector2());
            const j = Math.floor((i.t * 20) % S);
            sp.set([at.x, at.y, 0], j * 3);
            const ang = rng() * Math.PI * 2;
            sv.set([Math.cos(ang) * 0.25, Math.sin(ang) * 0.2 + 0.08, 0], j * 3);
            sb[j] = i.t;
            spAttr.needsUpdate = svAttr.needsUpdate = sbAttr.needsUpdate = true;
          }
        }
      }
      rpAttr.needsUpdate = true;
      // the arcs swing a little in depth; scrolling turns them further
      rig.rotation.y = Math.sin(i.t * 0.05) * 0.12 + i.progress * 0.35;
    },
    resize() {
      place();
    },
  };
}
