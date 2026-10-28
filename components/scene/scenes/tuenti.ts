/**
 * tuenti · a wheel of segments turning very slowly at the edge of the page (no logos, nothing branded),
 * tilted in depth, with confetti drifting down past it. Coral and blue.
 */
import { BufferAttribute, BufferGeometry, Group, LineSegments, Mesh, Points } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { FLAT_LIGHT_FRAG, halfSize, lightMaterial, vec, worldAt, PALETTE } from '../kit';

const SEGMENTS = 12;

export const still = 8;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const holder = new Group();
  const wheel = new Group();
  holder.add(wheel);
  scene.add(holder);
  const u = {
    uTime: { value: 0 },
    uPx: { value: dpr },
    uCoral: { value: vec(PALETTE.coral) },
    uBlue: { value: vec(PALETTE.blue) },
    uSky: { value: vec(PALETTE.sky) },
    uPaper: { value: vec(PALETTE.paper) },
    uYellow: { value: vec(PALETTE.yellow) },
  };

  // sectors: a faint fill per segment (coral / blue / ink in turn)
  const fp: number[] = [];
  const fk: number[] = [];
  const A = 16;
  for (let s = 0; s < SEGMENTS; s++) {
    const a0 = (s / SEGMENTS) * Math.PI * 2, a1 = ((s + 1) / SEGMENTS) * Math.PI * 2;
    for (let k = 0; k < A; k++) {
      const b0 = a0 + ((a1 - a0) * k) / A, b1 = a0 + ((a1 - a0) * (k + 1)) / A;
      fp.push(Math.cos(b0) * 0.16, Math.sin(b0) * 0.16, 0, Math.cos(b0), Math.sin(b0), 0, Math.cos(b1), Math.sin(b1), 0);
      fp.push(Math.cos(b0) * 0.16, Math.sin(b0) * 0.16, 0, Math.cos(b1), Math.sin(b1), 0, Math.cos(b1) * 0.16, Math.sin(b1) * 0.16, 0);
      for (let v = 0; v < 6; v++) fk.push(s % 3);
    }
  }
  const fg = new BufferGeometry();
  fg.setAttribute('position', new BufferAttribute(new Float32Array(fp), 3));
  fg.setAttribute('aK', new BufferAttribute(new Float32Array(fk), 1));
  const fills = new Mesh(
    fg,
    lightMaterial(
      /* glsl */ `
      attribute float aK; uniform vec3 uCoral; uniform vec3 uBlue; uniform vec3 uPaper;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float r = length(position.xy);
        vColor = aK < 0.5 ? uCoral : aK < 1.5 ? uBlue : uPaper;
        vAlpha = (aK < 0.5 ? 0.06 : aK < 1.5 ? 0.11 : 0.02) * (0.4 + 0.6 * r);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  wheel.add(fills);

  // outlines: rim, inner rings, spokes and ticks
  const lp: number[] = [];
  const la: number[] = [];
  const ring = (r: number, a: number, n = 180) => {
    for (let k = 0; k < n; k++) {
      const b0 = (k / n) * Math.PI * 2, b1 = ((k + 1) / n) * Math.PI * 2;
      lp.push(Math.cos(b0) * r, Math.sin(b0) * r, 0, Math.cos(b1) * r, Math.sin(b1) * r, 0);
      la.push(a, a);
    }
  };
  ring(1, 0.24);
  ring(1.06, 0.1);
  ring(0.16, 0.2, 48);
  for (let s = 0; s < SEGMENTS; s++) {
    const a = (s / SEGMENTS) * Math.PI * 2;
    lp.push(Math.cos(a) * 0.16, Math.sin(a) * 0.16, 0, Math.cos(a), Math.sin(a), 0);
    la.push(0.14, 0.14);
  }
  for (let k = 0; k < 72; k++) {
    const a = (k / 72) * Math.PI * 2, len = k % 6 === 0 ? 0.05 : 0.025;
    lp.push(Math.cos(a) * 1.06, Math.sin(a) * 1.06, 0, Math.cos(a) * (1.06 + len), Math.sin(a) * (1.06 + len), 0);
    la.push(0.18, 0.18);
  }
  const lg = new BufferGeometry();
  lg.setAttribute('position', new BufferAttribute(new Float32Array(lp), 3));
  lg.setAttribute('aAlpha', new BufferAttribute(new Float32Array(la), 1));
  const lines = new LineSegments(
    lg,
    lightMaterial(
      /* glsl */ `
      attribute float aAlpha; uniform vec3 uPaper; varying vec3 vColor; varying float vAlpha;
      void main() { vColor = uPaper; vAlpha = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  wheel.add(lines);

  // confetti: small rotating rectangles drifting down
  const C = mobile ? 36 : 80;
  const span = halfSize(camera, 0);
  const cp = new Float32Array(C * 3);
  const cs = new Float32Array(C);
  for (let i = 0; i < C; i++) {
    cp.set([(rng() * 2 - 1) * span.halfW, (rng() * 2 - 1) * span.halfH, (rng() - 0.5) * 3], i * 3);
    cs[i] = rng();
  }
  const cg = new BufferGeometry();
  cg.setAttribute('position', new BufferAttribute(cp, 3));
  cg.setAttribute('aSeed', new BufferAttribute(cs, 1));
  const confU = { ...u, uH: { value: span.halfH } };
  const confetti = new Points(
    cg,
    lightMaterial(
      /* glsl */ `
      attribute float aSeed; uniform float uTime; uniform float uPx; uniform float uH;
      uniform vec3 uCoral; uniform vec3 uSky; uniform vec3 uYellow; uniform vec3 uPaper;
      varying vec3 vColor; varying float vAlpha; varying float vRot; varying float vFlip;
      void main() {
        vec3 p = position;
        p.y = mod(p.y + uH - uTime * (0.08 + aSeed * 0.1), 2.0 * uH) - uH;
        p.x += sin(uTime * 0.5 + aSeed * 30.0) * 0.25;
        vRot = uTime * (0.4 + aSeed) + aSeed * 10.0;
        vFlip = abs(cos(uTime * (0.7 + aSeed * 0.8) + aSeed * 7.0));
        float k = fract(aSeed * 7.3);
        vColor = k < 0.4 ? uCoral : k < 0.75 ? uSky : k < 0.9 ? uYellow : uPaper;
        vAlpha = 0.3 + 0.35 * fract(aSeed * 13.1);
        gl_PointSize = (5.0 + aSeed * 4.0) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
      /* glsl */ `
      varying vec3 vColor; varying float vAlpha; varying float vRot; varying float vFlip;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float c = cos(vRot), s = sin(vRot);
        vec2 q = vec2(c * d.x - s * d.y, s * d.x + c * d.y);
        // a 2:1 paper strip that flips (its width breathes)
        float inside = step(abs(q.x), 0.42) * step(abs(q.y), 0.18 * (0.25 + 0.75 * vFlip));
        gl_FragColor = vec4(vColor * vAlpha * inside * (0.55 + 0.45 * vFlip), 0.0);
      }`,
      confU,
    ),
  );
  scene.add(confetti);

  const place = () => {
    const portrait = ctx.h > ctx.w;
    const { halfH, halfW } = halfSize(camera, 0);
    holder.position.copy(worldAt(camera, portrait ? 0.98 : 0.96, portrait ? 0.3 : 0.56, 0));
    holder.scale.setScalar(portrait ? halfW * 0.95 : halfH * 0.78);
    holder.rotation.set(0.18, -0.55, 0.05);
  };
  place();

  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      // one turn every ~4 minutes; scrolling gives it a nudge
      wheel.rotation.z = -i.t * 0.026 - i.progress * 1.2;
    },
    resize() {
      place();
      confU.uH.value = halfSize(camera, 0).halfH;
    },
  };
}
