/**
 * negocio · from a red ocean to a blue one. A wide sea surface drawn as fine swell lines under a low horizon;
 * at the top of the page it is red (crowded water), and it turns blue as you scroll down (open water).
 */
import { BufferAttribute, BufferGeometry, LineSegments, Vector3 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { FLAT_LIGHT_FRAG, lightMaterial, screenQuad, smooth, vec, PALETTE } from '../kit';

export const still = 10;

export function create(ctx: SceneContext) {
  const { scene, camera, mobile } = ctx;
  const ROWS = mobile ? 26 : 40;
  const COLS = mobile ? 60 : 110;
  const u = {
    uTime: { value: 0 },
    uMix: { value: 0 },
    uRed: { value: vec(PALETTE.coral) },
    uRedDeep: { value: vec('#8a1c0c') },
    uBlue: { value: vec(PALETTE.blue) },
    uSky: { value: vec(PALETTE.sky) },
    uHorizon: { value: 0.42 },
    uDim: { value: 1 }, // phones: the sea fills more of the text column, so it is fainter
  };

  // rows of the surface, from the horizon (z = -60) to under the camera (z = 4)
  const p: number[] = [];
  const r: number[] = [];
  for (let j = 0; j < ROWS; j++) {
    const t = j / (ROWS - 1);
    const z = -60 + 64 * Math.pow(t, 1.45);
    const half = 20 + (-z) * 0.9;
    for (let i = 0; i < COLS; i++) {
      const x0 = -half + (2 * half * i) / COLS, x1 = -half + (2 * half * (i + 1)) / COLS;
      p.push(x0, 0, z, x1, 0, z);
      r.push(t, t);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(p), 3));
  g.setAttribute('aRow', new BufferAttribute(new Float32Array(r), 1));
  const sea = new LineSegments(
    g,
    lightMaterial(
      /* glsl */ `
      attribute float aRow; uniform float uTime; uniform float uMix; uniform float uDim;
      uniform vec3 uRed; uniform vec3 uBlue; uniform vec3 uSky;
      varying vec3 vColor; varying float vAlpha;
      float wave(vec2 q, vec2 d, float k, float s, float a) { return a * sin(dot(q, d) * k + uTime * s); }
      void main() {
        vec3 q = position;
        float h = wave(q.xz, normalize(vec2(0.3, 1.0)), 0.55, 0.55, 0.22)
                + wave(q.xz, normalize(vec2(-0.6, 1.0)), 0.9, 0.8, 0.12)
                + wave(q.xz, normalize(vec2(1.0, 0.2)), 1.7, 1.1, 0.05);
        // a calmer sea when it turns blue
        q.y = h * mix(1.15, 0.75, uMix);
        float crest = smoothstep(0.05, 0.35, h);
        vec3 c = mix(uRed, mix(uBlue, uSky, 0.35), uMix);
        vColor = mix(c, vec3(1.0), crest * 0.15);
        // far rows fade into the haze, near rows fade out of the frame
        vAlpha = smoothstep(0.0, 0.2, aRow) * (1.0 - smoothstep(0.85, 1.0, aRow)) * (0.06 + 0.22 * crest) * mix(1.0, 1.3, uMix) * mix(0.7, 1.25, aRow) * uDim;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(q, 1.0);
      }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  scene.add(sea);

  // the horizon's glow, same colour as the water
  const glow = screenQuad(
    lightMaterial(
      /* glsl */ `
      varying vec2 vS;
      void main() { vS = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      /* glsl */ `
      uniform float uMix; uniform float uHorizon; uniform vec3 uRedDeep; uniform vec3 uBlue;
      varying vec2 vS;
      void main() {
        float d = vS.y - uHorizon;
        float band = exp(-d * d * 120.0) * 0.6 + exp(-max(-d, 0.0) * 4.0) * step(d, 0.0) * 0.4;
        float side = 0.45 + 0.55 * smoothstep(0.0, 1.0, vS.x);
        vec3 c = mix(uRedDeep, uBlue * 0.55, uMix);
        gl_FragColor = vec4(c * band * side * 0.16, 0.0);
      }`,
      u,
    ),
  );
  glow.renderOrder = -1;
  scene.add(glow);

  const aim = () => {
    camera.fov = ctx.h > ctx.w ? 55 : 38;
    u.uDim.value = ctx.h > ctx.w ? 0.55 : 1;
    camera.position.set(0, 2.2, 6);
    camera.lookAt(0, 5.2, -20);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    // where the horizon lands on screen (for the glow)
    const v = new Vector3(0, 0, -60).project(camera);
    u.uHorizon.value = v.y * 0.5 + 0.5;
  };
  aim();

  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      // red ocean at the top of the page, blue ocean from two thirds down
      u.uMix.value = smooth(0.12, 0.7, i.progress);
    },
    resize() {
      aim();
    },
  };
}
