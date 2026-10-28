/**
 * supernova · a deep starfield turning very slowly, and one star that blooms: it brightens, throws out a soft
 * halo and a thin shock ring, and fades back to an ember over ~50 s, then the cycle starts again.
 */
import { BufferAttribute, BufferGeometry, Mesh, PlaneGeometry, Points, Vector3 } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { SOFT_POINT_FRAG, halfSize, lightMaterial, vec, worldAt, PALETTE } from '../kit';

const CYCLE = 52;

export const still = 17;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const S = mobile ? 320 : 760;
  const sp = new Float32Array(S * 3);
  const ss = new Float32Array(S);
  for (let i = 0; i < S; i++) {
    // a shell of stars around the camera, denser along a faint band
    const v = new Vector3(rng() * 2 - 1, (rng() * 2 - 1) * (rng() < 0.45 ? 0.25 : 1), rng() * 2 - 1).normalize().multiplyScalar(40 + rng() * 30);
    sp.set([v.x, v.y, v.z], i * 3);
    ss[i] = rng();
  }
  const u = {
    uTime: { value: 0 },
    uPx: { value: dpr },
    uPaper: { value: vec(PALETTE.paper) },
    uSky: { value: vec(PALETTE.sky) },
    uYellow: { value: vec(PALETTE.yellow) },
    uCoral: { value: vec(PALETTE.coral) },
    uPhase: { value: 0 },
  };
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(sp, 3));
  g.setAttribute('aSeed', new BufferAttribute(ss, 1));
  const stars = new Points(
    g,
    lightMaterial(
      /* glsl */ `
      attribute float aSeed; uniform float uTime; uniform float uPx; uniform vec3 uPaper; uniform vec3 uSky; uniform vec3 uYellow;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float mag = aSeed * aSeed * aSeed;
        vColor = aSeed > 0.93 ? uSky : aSeed > 0.86 ? mix(uYellow, uPaper, 0.5) : uPaper;
        vAlpha = (0.22 + 0.78 * mag) * (0.8 + 0.2 * sin(uTime * (0.3 + aSeed) + aSeed * 90.0));
        gl_PointSize = (1.3 + 2.4 * mag) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      SOFT_POINT_FRAG,
      u,
    ),
  );
  scene.add(stars);

  // the nova: one quad (520 px across) drawing core, halo and shock ring from the cycle's phase
  const nova = new Mesh(
    new PlaneGeometry(1, 1),
    lightMaterial(
      /* glsl */ `
      uniform float uPhase;
      varying float vP; varying vec2 vUv;
      void main() { vP = uPhase; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      /* glsl */ `
      uniform vec3 uYellow; uniform vec3 uCoral; uniform vec3 uPaper;
      varying float vP; varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        if (r > 1.0) discard;
        // phase 0..1: rise (0–.15), bloom (.15–.4), fade to an ember (.4–1)
        float rise = smoothstep(0.0, 0.15, vP);
        float bloom = smoothstep(0.12, 0.22, vP) * (1.0 - smoothstep(0.3, 0.75, vP));
        float ember = 1.0 - smoothstep(0.6, 1.0, vP);
        float core = exp(-r * r * 900.0) * (0.25 + 0.75 * rise) * ember;
        float halo = exp(-r * r * mix(60.0, 9.0, bloom)) * bloom * 0.14;
        float shockR = smoothstep(0.15, 0.6, vP) * 0.95;
        float shock = exp(-pow((r - shockR) * 60.0, 2.0)) * (1.0 - smoothstep(0.3, 0.62, vP)) * step(0.15, vP) * 0.16;
        vec3 c = uPaper * core + mix(uYellow, uCoral, r * 1.4) * halo + uYellow * shock;
        gl_FragColor = vec4(c, 0.0);
      }`,
      u,
    ),
  );
  scene.add(nova);

  const place = () => {
    const portrait = ctx.h > ctx.w;
    nova.position.copy(worldAt(camera, portrait ? 0.74 : 0.8, portrait ? 0.2 : 0.26, -2));
    const { halfH } = halfSize(camera, -2);
    nova.scale.setScalar(((portrait ? 420 : 520) / ctx.h) * 2 * halfH);
  };
  place();

  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      u.uPhase.value = ((i.t + 4) % CYCLE) / CYCLE;
      // the sky turns very slowly; scrolling turns it on
      stars.rotation.y = i.t * 0.004 + i.progress * 0.25;
      stars.rotation.x = 0.2 + i.progress * 0.05;
    },
    resize() {
      place();
    },
  };
}
