/**
 * eclipse · totality. A dark disc with a corona that breathes slowly: a thin bright limb, soft amber streamers,
 * now and then a diamond-ring bead on the edge. Kept dim; the disc covers the page's own glow behind it.
 */
import { BufferAttribute, BufferGeometry, CircleGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Points, Vector3 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { NOISE, SOFT_POINT_FRAG, halfSize, lightMaterial, vec, worldAt, PALETTE } from '../kit';

export const still = 30;
export const renderScale = 0.8;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const sun = new Group();
  scene.add(sun);
  const u = {
    uTime: { value: 0 },
    uPx: { value: dpr },
    uAmber: { value: vec(PALETTE.yellow) },
    uDeep: { value: vec('#ff7a2e') },
    uPale: { value: vec('#fff1cf') },
    uR: { value: 1 },
    uRpx: { value: 100 },
  };
  let R = 1;
  const place = () => {
    const portrait = ctx.h > ctx.w;
    const { halfH, halfW } = halfSize(camera, 0);
    R = portrait ? halfW * 0.38 : halfH * 0.3;
    sun.position.copy(worldAt(camera, portrait ? 0.8 : 0.79, portrait ? 0.2 : 0.3, 0));
    sun.scale.setScalar(R);
    u.uRpx.value = (R / (2 * halfH)) * ctx.h * dpr;
  };

  // corona: a quad 7 radii wide around the disc (the shader stays local, cheap)
  const corona = new Mesh(
    new PlaneGeometry(7, 7),
    lightMaterial(
      /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      /* glsl */ `
      uniform float uTime; uniform vec3 uAmber; uniform vec3 uDeep; uniform vec3 uPale; uniform float uRpx;
      varying vec2 vP;
      ${NOISE}
      void main() {
        float r = length(vP);
        if (r < 0.985) discard;
        float a = atan(vP.y, vP.x);
        float breathe = 0.86 + 0.14 * sin(uTime * 0.32);
        float x = r - 1.0;
        // streamers: noise around the rim, stretched outward, turning very slowly
        vec2 dir = vec2(cos(a), sin(a));
        float n = snoise(vec3(dir * 1.7, uTime * 0.035)) * 0.6 + snoise(vec3(dir * 4.3, uTime * 0.05 + 3.0)) * 0.4;
        float streak = pow(0.5 + 0.5 * n, 2.2) * 1.6;
        // streamers reach further where the noise is strong (long rays), the inner corona hugs the limb
        float glow = exp(-x * 3.0) * 0.06 + exp(-x * mix(9.0, 2.6, streak * 0.6)) * 0.14 * streak + exp(-x * 1.4) * 0.03 * streak;
        float limb = exp(-pow(x * uRpx / 1.6, 2.0)) * 0.55;
        float fade = 1.0 - smoothstep(2.4, 3.5, r);
        vec3 c = mix(uPale, mix(uAmber, uDeep, smoothstep(0.0, 1.2, x)), smoothstep(0.0, 0.25, x));
        gl_FragColor = vec4(c * (glow * breathe * fade + limb * (0.75 + 0.25 * breathe)), 0.0);
      }`,
      u,
    ),
  );
  sun.add(corona);

  // the moon: covers what is behind it
  const disc = new Mesh(new CircleGeometry(0.985, 96), new MeshBasicMaterial({ color: 0x060607 }));
  disc.position.z = 0.001;
  sun.add(disc);

  // diamond ring: one bead on the limb that brightens and fades every ~26 s
  const bg = new BufferGeometry();
  bg.setAttribute('position', new BufferAttribute(new Float32Array([Math.cos(2.35), Math.sin(2.35), 0.002]), 3));
  const bead = new Points(
    bg,
    lightMaterial(
      /* glsl */ `
      uniform float uTime; uniform float uPx; uniform vec3 uPale;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float c = mod(uTime + 14.0, 26.0);
        float on = smoothstep(0.0, 3.0, c) * (1.0 - smoothstep(4.0, 8.0, c));
        vColor = uPale; vAlpha = on;
        gl_PointSize = (4.0 + 26.0 * on) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      /* glsl */ `
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float r = length(d) * 2.0;
        float core = exp(-r * r * 40.0);
        float spikes = exp(-abs(d.x) * 60.0) * exp(-abs(d.y) * 5.0) + exp(-abs(d.y) * 60.0) * exp(-abs(d.x) * 5.0);
        gl_FragColor = vec4(vColor * vAlpha * (core + spikes * 0.35) * (1.0 - smoothstep(0.8, 1.0, r)), 0.0);
      }`,
      u,
    ),
  );
  sun.add(bead);

  // a few faint stars around totality
  const S = mobile ? 40 : 90;
  const sp = new Float32Array(S * 3);
  const ss = new Float32Array(S);
  const span = halfSize(camera, -6);
  for (let i = 0; i < S; i++) {
    sp.set([(rng() * 2 - 1) * span.halfW * 1.1, (rng() * 2 - 1) * span.halfH * 1.1, -6], i * 3);
    ss[i] = rng();
  }
  const stg = new BufferGeometry();
  stg.setAttribute('position', new BufferAttribute(sp, 3));
  stg.setAttribute('aSeed', new BufferAttribute(ss, 1));
  const stars = new Points(
    stg,
    lightMaterial(
      /* glsl */ `
      attribute float aSeed; uniform float uTime; uniform float uPx; uniform vec3 uPale;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vColor = uPale;
        vAlpha = (0.12 + 0.3 * aSeed * aSeed) * (0.75 + 0.25 * sin(uTime * 0.6 + aSeed * 40.0));
        gl_PointSize = (1.2 + aSeed * 1.3) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      SOFT_POINT_FRAG,
      u,
    ),
  );
  scene.add(stars);

  place();
  const home = new Vector3();
  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      // the disc slides a hair as the page scrolls, like a slow passage
      home.copy(worldAt(camera, ctx.h > ctx.w ? 0.8 : 0.79, ctx.h > ctx.w ? 0.2 : 0.3, 0));
      sun.position.set(home.x - i.progress * R * 0.6, home.y - i.progress * R * 0.5, 0);
      corona.rotation.z = i.t * 0.004;
    },
    resize() {
      place();
    },
  };
}
