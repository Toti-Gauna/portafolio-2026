/**
 * dentalos · calm and clinical. A grid of soft circles on a plane that recedes into the page, breathing in a
 * slow wave that crosses it diagonally; a few of them hold a small green check-dot (a confirmed slot). Teal.
 */
import { BufferAttribute, BufferGeometry, Group, Points } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { halfSize, lightMaterial, vec, worldAt, PALETTE } from '../kit';

export const still = 5;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const plane = new Group();
  scene.add(plane);
  const NX = mobile ? 7 : 12, NY = mobile ? 9 : 8;
  const n = NX * NY;
  const p = new Float32Array(n * 3);
  const s = new Float32Array(n);
  const k = new Float32Array(n);
  for (let y = 0; y < NY; y++)
    for (let x = 0; x < NX; x++) {
      const i = y * NX + x;
      p.set([x - (NX - 1) / 2, y - (NY - 1) / 2, 0], i * 3);
      s[i] = rng();
      k[i] = rng() < 0.09 ? 1 : 0;
    }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(p, 3));
  g.setAttribute('aSeed', new BufferAttribute(s, 1));
  g.setAttribute('aK', new BufferAttribute(k, 1));
  const u = {
    uTime: { value: 0 },
    uPx: { value: dpr },
    uCell: { value: 40 },
    uTeal: { value: vec(PALETTE.teal) },
    uGreen: { value: vec(PALETTE.green) },
    uScroll: { value: 0 },
  };
  const pts = new Points(
    g,
    lightMaterial(
      /* glsl */ `
      attribute float aSeed; attribute float aK;
      uniform float uTime; uniform float uPx; uniform float uCell; uniform float uScroll;
      uniform vec3 uTeal; uniform vec3 uGreen;
      varying vec3 vColor; varying float vAlpha; varying float vBreath; varying float vK;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        // one slow wave across the grid (period ~9 s)
        float w = 0.5 + 0.5 * sin(uTime * 0.7 - (position.x + position.y) * 0.45 - uScroll * 6.0);
        float depth = clamp((-mv.z - 6.0) / 12.0, 0.0, 1.0);
        vBreath = w;
        vK = aK;
        vColor = uTeal;
        vAlpha = (0.55 + 0.45 * w) * (1.0 - depth * 0.6);
        gl_PointSize = uCell * (0.55 + 0.25 * w) * uPx / -mv.z * 10.0;
        gl_Position = projectionMatrix * mv;
      }`,
      /* glsl */ `
      uniform vec3 uGreen;
      varying vec3 vColor; varying float vAlpha; varying float vBreath; varying float vK;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        if (r > 1.0) discard;
        float ring = smoothstep(0.07, 0.0, abs(r - 0.86)) * 0.16;
        float fill = smoothstep(0.86, 0.5, r) * (0.025 + 0.04 * vBreath);
        float check = vK * smoothstep(0.26, 0.16, r) * 0.55;
        vec3 c = vColor * vAlpha * (ring + fill) + uGreen * check * vAlpha;
        gl_FragColor = vec4(c, 0.0);
      }`,
      u,
    ),
  );
  plane.add(pts);

  const place = () => {
    const portrait = ctx.h > ctx.w;
    const { halfH, halfW } = halfSize(camera, 0);
    const cell = portrait ? (halfW * 2) / 7.5 : (halfH * 2) / 8.5;
    plane.scale.setScalar(cell);
    plane.position.copy(worldAt(camera, portrait ? 0.7 : 0.8, portrait ? 0.7 : 0.62, -1));
    plane.rotation.set(-0.95, 0, portrait ? 0.35 : 0.5);
    u.uCell.value = (cell / (2 * halfH)) * ctx.h;
  };
  place();

  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      u.uScroll.value = i.progress;
    },
    resize() {
      place();
    },
  };
}
