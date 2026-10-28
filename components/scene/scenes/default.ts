/**
 * default · a sparse field of dots in depth, drifting slowly to the left like a quiet star chart.
 */
import { BufferAttribute, BufferGeometry, Points, Vector3 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { SOFT_POINT_FRAG, lightMaterial, vec, PALETTE } from '../kit';

export const still = 10;

export function create(ctx: SceneContext) {
  const { scene, rng, mobile, dpr } = ctx;
  const count = mobile ? 180 : 420;
  const box = new Vector3(26, 14, 16);
  const g = new BufferGeometry();
  const p = new Float32Array(count * 3);
  const s = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // a loose lattice, jittered: reads as order, not noise
    const gx = Math.floor(rng() * 26), gy = Math.floor(rng() * 14), gz = Math.floor(rng() * 8);
    p.set([gx + (rng() - 0.5) * 0.3, gy + (rng() - 0.5) * 0.3, gz * 2 + (rng() - 0.5) * 0.6], i * 3);
    s[i] = rng();
  }
  g.setAttribute('position', new BufferAttribute(p, 3));
  g.setAttribute('aSeed', new BufferAttribute(s, 1));
  const uniforms = { uTime: { value: 0 }, uPx: { value: dpr }, uBox: { value: box }, uA: { value: vec(PALETTE.paper) }, uB: { value: vec(PALETTE.sky) }, uScroll: { value: 0 } };
  const pts = new Points(
    g,
    lightMaterial(
      /* glsl */ `
      attribute float aSeed;
      uniform float uTime; uniform float uPx; uniform vec3 uBox; uniform vec3 uA; uniform vec3 uB; uniform float uScroll;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec3 p = position;
        p.x = mod(p.x - uTime * 0.08 - uScroll * 2.0, uBox.x) - uBox.x * 0.5;
        p.y = p.y - uBox.y * 0.5;
        p.z = -p.z - 2.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float depth = clamp((-mv.z - 8.0) / 18.0, 0.0, 1.0);
        float side = smoothstep(-0.6, 0.9, p.x / (uBox.x * 0.5));
        vColor = mix(uA, uB, step(0.86, aSeed));
        vAlpha = (0.3 + 0.6 * side) * (1.0 - depth * 0.6) * (0.7 + 0.3 * sin(uTime * 0.5 + aSeed * 50.0));
        gl_PointSize = (1.8 + aSeed * 1.8) * (1.0 - depth * 0.45) * uPx;
        gl_Position = projectionMatrix * mv;
      }`,
      SOFT_POINT_FRAG,
      uniforms,
    ),
  );
  scene.add(pts);
  return {
    frame(i: SceneInput) {
      uniforms.uTime.value = i.t;
      uniforms.uScroll.value = i.progress;
    },
  };
}
