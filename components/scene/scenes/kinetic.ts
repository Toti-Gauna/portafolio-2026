/**
 * kinetic · a timeline. A waveform of bars recedes in perspective along the bottom of the page with a ruler
 * under it; a coral playhead scrubs across it (scrolling scrubs it further) and the bars it has played stay lit.
 * On the open side, keyframe curves between diamond keys: a short dash runs each with an expo ease.
 */
import { BufferAttribute, BufferGeometry, Group, LineSegments, Mesh, Points } from 'three';
import type { SceneContext, SceneInput } from '../types';
import { FLAT_LIGHT_FRAG, halfSize, lightMaterial, vec, PALETTE } from '../kit';

export const still = 12;

export function create(ctx: SceneContext) {
  const { scene, camera, rng, mobile, dpr } = ctx;
  const deck = new Group();
  scene.add(deck);
  const NB = mobile ? 64 : 120;
  const u = {
    uTime: { value: 0 },
    uPx: { value: dpr },
    uHead: { value: 0 },
    uCoral: { value: vec(PALETTE.coral) },
    uPaper: { value: vec(PALETTE.paper) },
    uN: { value: NB },
  };

  // the waveform: one quad per bar; the height comes from a sum of slow sines (a seeded "track")
  const f = [0.11 + rng() * 0.05, 0.27 + rng() * 0.08, 0.53 + rng() * 0.1, 1.3 + rng() * 0.3];
  const ph = [rng() * 6.28, rng() * 6.28, rng() * 6.28, rng() * 6.28];
  const bp: number[] = [];
  const bi: number[] = [];
  const by: number[] = [];
  for (let i = 0; i < NB; i++) {
    for (const [cx, cy] of [[0, -1], [1, -1], [1, 1], [0, -1], [1, 1], [0, 1]]) {
      bp.push(i + cx * 0.56, 0, 0);
      bi.push(i);
      by.push(cy);
    }
  }
  const bg = new BufferGeometry();
  bg.setAttribute('position', new BufferAttribute(new Float32Array(bp), 3));
  bg.setAttribute('aI', new BufferAttribute(new Float32Array(bi), 1));
  bg.setAttribute('aY', new BufferAttribute(new Float32Array(by), 1));
  const bars = new Mesh(
    bg,
    lightMaterial(
      /* glsl */ `
      attribute float aI; attribute float aY;
      uniform float uTime; uniform float uHead; uniform float uN; uniform vec3 uCoral; uniform vec3 uPaper;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float x = aI / uN;
        float h = 0.18 + 0.82 * abs(
          sin(aI * ${f[0].toFixed(3)} + ${ph[0].toFixed(3)} + uTime * 0.21) * 0.45 +
          sin(aI * ${f[1].toFixed(3)} + ${ph[1].toFixed(3)} - uTime * 0.13) * 0.3 +
          sin(aI * ${f[2].toFixed(3)} + ${ph[2].toFixed(3)} + uTime * 0.37) * 0.17 +
          sin(aI * ${f[3].toFixed(3)} + ${ph[3].toFixed(3)}) * 0.08);
        h *= 0.55 + 0.45 * sin(3.14159 * clamp(x * 1.1, 0.0, 1.0));
        float played = step(x, uHead);
        float near = exp(-abs(x - uHead) * uN * 0.25);
        vec3 p = position;
        p.y = aY * h * 1.05;
        vColor = mix(uPaper, uCoral, max(played, near));
        vAlpha = mix(0.045, 0.13, played) + near * 0.16;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  deck.add(bars);

  // ruler + playhead: ticks under the bars, a bright vertical line at the head
  const rp: number[] = [];
  const rk: number[] = [];
  for (let i = 0; i <= NB; i++) {
    const tall = i % 8 === 0 ? 0.42 : 0.18;
    rp.push(i, -1.45, 0, i, -1.45 - tall, 0);
    rk.push(0, 0);
  }
  rp.push(0, -1.45, 0, NB, -1.45, 0);
  rk.push(0, 0);
  rp.push(0, -1.75, 0, 0, 1.9, 0); // playhead (moved in the shader)
  rk.push(1, 1);
  const rg = new BufferGeometry();
  rg.setAttribute('position', new BufferAttribute(new Float32Array(rp), 3));
  rg.setAttribute('aK', new BufferAttribute(new Float32Array(rk), 1));
  const ruler = new LineSegments(
    rg,
    lightMaterial(
      /* glsl */ `
      attribute float aK; uniform float uHead; uniform float uN; uniform vec3 uCoral; uniform vec3 uPaper;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec3 p = position;
        if (aK > 0.5) p.x = uHead * uN;
        vColor = aK > 0.5 ? uCoral : uPaper;
        vAlpha = aK > 0.5 ? 0.55 : 0.09;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  deck.add(ruler);

  // keyframe curves on the open side: an eased path between two diamond keys, a dash running it (expo out)
  const NL = mobile ? 2 : 3;
  const SEG = 48;
  const mp: number[] = [];
  const ml: number[] = [];
  const ms: number[] = [];
  const keys: number[] = [];
  for (let l = 0; l < NL; l++) {
    const y0 = -l * 1.25, s = rng();
    const rise = 0.55 + rng() * 0.35;
    // cubic-bezier(0.16, 1, 0.3, 1)-like: a fast start that settles (the site's own ease)
    const yy = (t: number) => y0 + rise * (1 - Math.pow(1 - t, 3.2));
    for (let k = 0; k < SEG; k++) {
      const a = k / SEG, b = (k + 1) / SEG;
      mp.push(a * 3, yy(a), 0, b * 3, yy(b), 0);
      ml.push(a, b);
      ms.push(s, s);
    }
    keys.push(0, yy(0), 0, 3, yy(1), 0);
  }
  const mg = new BufferGeometry();
  mg.setAttribute('position', new BufferAttribute(new Float32Array(mp), 3));
  mg.setAttribute('aT', new BufferAttribute(new Float32Array(ml), 1));
  mg.setAttribute('aS', new BufferAttribute(new Float32Array(ms), 1));
  const curves = new Group();
  scene.add(curves);
  const paths = new LineSegments(
    mg,
    lightMaterial(
      /* glsl */ `
      attribute float aT; attribute float aS;
      uniform float uTime; uniform vec3 uCoral; uniform vec3 uPaper;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float cyc = fract(uTime / (8.0 + aS * 4.0) + aS);
        float e = 1.0 - pow(2.0, -10.0 * clamp(cyc * 1.8, 0.0, 1.0)); // expo out
        float dash = exp(-pow((aT - e) * 10.0, 2.0)) * (1.0 - smoothstep(0.5, 0.58, cyc)) * step(aT, e + 0.02);
        vColor = mix(uPaper, uCoral, dash);
        vAlpha = 0.07 + dash * 0.55;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      FLAT_LIGHT_FRAG,
      u,
    ),
  );
  curves.add(paths);
  const kg = new BufferGeometry();
  kg.setAttribute('position', new BufferAttribute(new Float32Array(keys), 3));
  const keyPts = new Points(
    kg,
    lightMaterial(
      /* glsl */ `
      uniform float uPx; uniform vec3 uCoral; varying vec3 vColor; varying float vAlpha;
      void main() { vColor = uCoral; vAlpha = 0.6; gl_PointSize = 9.0 * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      /* glsl */ `
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec2 d = abs(gl_PointCoord - 0.5);
        float dia = d.x + d.y;
        float edge = smoothstep(0.5, 0.42, dia) - smoothstep(0.3, 0.22, dia) * 0.65;
        gl_FragColor = vec4(vColor * vAlpha * edge, 0.0);
      }`,
      u,
    ),
  );
  curves.add(keyPts);

  const place = () => {
    const portrait = ctx.h > ctx.w;
    const { halfW, halfH } = halfSize(camera, 0);
    // the track spans the page low down, turned a little so its right end recedes
    const width = halfW * (portrait ? 2.6 : 2.15);
    deck.scale.set(width / NB, halfH * (portrait ? 0.075 : 0.11), 1);
    deck.position.set(-halfW * (portrait ? 1.15 : 1.0), -halfH * (portrait ? 0.62 : 0.6), 0);
    deck.rotation.set(0.12, -0.3, 0);
    const cs = portrait ? halfW * 0.28 : halfH * 0.26;
    curves.scale.set(cs, cs, 1);
    curves.position.set(halfW * (portrait ? 0.02 : 0.22), halfH * (portrait ? 0.42 : 0.42), -1);
  };
  place();

  return {
    frame(i: SceneInput) {
      u.uTime.value = i.t;
      // the head plays slowly; the scroll scrubs it
      u.uHead.value = (i.t / 90 + i.progress * 0.85) % 1;
    },
    resize() {
      place();
    },
  };
}
