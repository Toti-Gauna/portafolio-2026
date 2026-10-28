/**
 * velmar · a workshop at the end of the afternoon. A soft, warm shaft of light falls from a high window at the
 * top right (its mullions in it, clouds passing over it now and then); dust drifts through the room and
 * catches the light only inside the shaft. No brand, nothing but light.
 */
import { BufferAttribute, BufferGeometry, Points, Vector2 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { NOISE, SOFT_DOT, halfSize, lightMaterial, screenQuad, vec } from '../kit';

export const still = 16;
export const renderScale = 0.85;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const u = {
    uTime: { value: 0 },
    uPx: { value: dpr },
    uWarm: { value: vec('#ffb347') },
    uPale: { value: vec('#fff0d2') },
    uAspect: { value: ctx.w / ctx.h },
    // the shaft, in screen space (0..1, y up): from the window to the floor
    uFrom: { value: new Vector2(0.9, 1.08) },
    uTo: { value: new Vector2(0.48, -0.05) },
    uScroll: { value: 0 },
  };
  const SHAFT = /* glsl */ `
  uniform vec2 uFrom; uniform vec2 uTo; uniform float uAspect;
  // 0..1 inside the shaft: distance across its axis, widening toward the floor
  float shaft(vec2 s, out float along) {
    vec2 a = vec2(uFrom.x * uAspect, uFrom.y), b = vec2(uTo.x * uAspect, uTo.y), p = vec2(s.x * uAspect, s.y);
    vec2 ab = b - a;
    float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
    along = t;
    vec2 n = normalize(vec2(-ab.y, ab.x));
    float d = dot(p - a, n);
    float half_ = mix(0.08, 0.26, t);
    return smoothstep(half_, half_ * 0.35, abs(d));
  }`;
  const beam = screenQuad(
    lightMaterial(
      /* glsl */ `
      varying vec2 vS;
      void main() { vS = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      /* glsl */ `
      uniform float uTime; uniform vec3 uWarm; uniform vec3 uPale; uniform float uScroll;
      varying vec2 vS;
      ${NOISE}
      ${SHAFT}
      void main() {
        float along;
        float k = shaft(vS, along);
        if (k <= 0.0) discard;
        // the window's mullions: two soft darker bands along the shaft
        vec2 a = vec2(uFrom.x * uAspect, uFrom.y), b = vec2(uTo.x * uAspect, uTo.y);
        vec2 n = normalize(vec2(-(b - a).y, (b - a).x));
        float d = dot(vec2(vS.x * uAspect, vS.y) - a, n) / mix(0.08, 0.26, along);
        float mull = 1.0 - 0.35 * (exp(-pow((d - 0.18) * 14.0, 2.0)) + exp(-pow((d + 0.3) * 14.0, 2.0)));
        // clouds passing over the window (very slow)
        float cloud = 0.8 + 0.2 * snoise(vec3(uTime * 0.04, 0.0, 1.7));
        float fall = (1.0 - along * 0.7) * smoothstep(0.0, 0.12, along + 0.02);
        vec3 c = mix(uPale, uWarm, along);
        gl_FragColor = vec4(c * k * mull * cloud * fall * 0.12, 0.0);
      }`,
      u,
    ),
  );
  beam.renderOrder = -1;
  scene.add(beam);

  // dust: everywhere, dim; inside the shaft it glints
  const D = mobile ? 110 : 240;
  const span = halfSize(camera, 0);
  const dp = new Float32Array(D * 3);
  const ds = new Float32Array(D);
  for (let i = 0; i < D; i++) {
    dp.set([(rng() * 2 - 1) * span.halfW, (rng() * 2 - 1) * span.halfH, (rng() - 0.5) * 4], i * 3);
    ds[i] = rng();
  }
  const dg = new BufferGeometry();
  dg.setAttribute('position', new BufferAttribute(dp, 3));
  dg.setAttribute('aSeed', new BufferAttribute(ds, 1));
  const dustU = { ...u, uSpan: { value: new Vector2(span.halfW, span.halfH) } };
  const dust = new Points(
    dg,
    lightMaterial(
      /* glsl */ `
      attribute float aSeed; uniform float uTime; uniform float uPx; uniform vec2 uSpan; uniform vec3 uPale; uniform vec3 uWarm;
      varying vec3 vColor; varying float vAlpha;
      ${NOISE}
      ${SHAFT}
      void main() {
        vec3 p = position;
        // a slow Brownian drift, slightly sinking, wrapped inside the room
        p.x += snoise(vec3(aSeed * 10.0, uTime * 0.03, 0.0)) * 0.8 + uTime * 0.012;
        p.y += snoise(vec3(aSeed * 10.0, uTime * 0.03, 5.0)) * 0.6 - uTime * 0.008;
        p.xy = mod(p.xy + uSpan, 2.0 * uSpan) - uSpan;
        vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        vec2 s = clip.xy / clip.w * 0.5 + 0.5;
        float along;
        float lit = shaft(s, along) * (1.0 - along * 0.5);
        float tw = 0.6 + 0.4 * sin(uTime * (0.8 + aSeed) + aSeed * 50.0);
        vColor = mix(uWarm, uPale, lit);
        vAlpha = (0.08 + lit * 1.0 * tw) * (0.5 + aSeed * 0.5);
        gl_PointSize = (1.4 + aSeed * 2.0 + lit * 1.4) * uPx;
        gl_Position = clip;
      }`,
      /* glsl */ `
      varying vec3 vColor; varying float vAlpha;
      ${SOFT_DOT}
      void main() { float a = softDot(gl_PointCoord); if (a <= 0.0) discard; gl_FragColor = vec4(vColor * vAlpha * a, 0.0); }`,
      dustU,
    ),
  );
  scene.add(dust);

  const place = () => {
    const portrait = ctx.h > ctx.w;
    u.uAspect.value = ctx.w / ctx.h;
    u.uFrom.value.set(portrait ? 1.0 : 0.9, 1.06);
    u.uTo.value.set(portrait ? 0.3 : 0.5, -0.05);
  };
  place();

  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      // the sun moves a little as you scroll down: the shaft leans
      u.uTo.value.x = (ctx.h > ctx.w ? 0.3 : 0.5) - i.progress * 0.12;
    },
    resize() {
      place();
    },
  };
}
