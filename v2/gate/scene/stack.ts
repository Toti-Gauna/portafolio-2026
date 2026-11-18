import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { easeOut, type Rig, type RigFactory } from './core';

/**
 * «Código»: the craft in five layers, in exploded view (the signature of the direction Ignacio chose): five
 * slabs of dark lacquer, each with a rim of light in its colour and its own pattern on top — a board, lines of
 * code, a graph of agents, rows of checks, a pipeline. They come down one loading step at a time, from the
 * bottom up, and the finished stack breathes. Colour never fills: it is light on the edges.
 */
const SW = 34, SD = 22, ST = 1.9, GAP = 6.6;
const COLORS: [number, number][] = [[0xffc247, 0xffe39a], [0xff6b4a, 0xffa04a], [0xff5fa2, 0xc79bff], [0x3fe0b0, 0xb6f36a], [0x5f86ff, 0x58d5ff]];
type Bar = [x: number, z: number, w: number, d: number, bright?: number];

/** What is drawn on each slab, in its own plane (x right, z toward the camera), inside ±15 × ±9. */
const PATTERNS: Bar[][] = [
  // plan: a board of three columns
  [-10, 0, 10].flatMap((x, c) => [[x, -8, 8, 0.5, 1.5] as Bar, ...[0, 1, 2].slice(0, 3 - (c % 2)).map((r) => [x, -5 + r * 4.6, 8, 3.4, r === 0 && c === 1 ? 0.75 : 0.2] as Bar)]),
  // code: indented lines
  [[0, 14], [2, 9], [4, 17], [4, 11], [6, 8], [4, 13], [2, 6], [0, 10]].map(([ind, len], r) => [-14 + ind + len / 2, -8 + r * 2.3, len, 0.7, r === 2 ? 1.7 : 0.75] as Bar),
  // agents: nodes and the lines between them
  [[-11, -5], [-2, -7], [8, -4], [-7, 3], [3, 2], [12, 5], [-1, 8]].map(([x, z], i) => [x, z, 2.2, 2.2, i === 4 ? 1.8 : 0.9] as Bar)
    .concat([[-6.5, -6, 6.6, 0.24], [3, -5.5, 7.6, 0.24], [-2, 2.5, 7.6, 0.24], [7.5, 3.5, 6.6, 0.24], [1, 5, 0.24, 4]].map(([x, z, w, d]) => [x, z, w, d, 0.45] as Bar)),
  // tests: a check and its line, five times
  [0, 1, 2, 3, 4].flatMap((r) => [[-13, -7.4 + r * 3.7, 1.7, 1.7, 1.7] as Bar, [-11 + (9 + ((r * 5) % 7) * 2) / 2 + 1, -7.4 + r * 3.7, 9 + ((r * 5) % 7) * 2, 0.7, 0.7] as Bar]),
  // ship: a pipeline of four stages and the line that carries them
  [[-11.2, 0, 6.2, 5, 0.22], [-3.7, 0, 6.2, 5, 0.22], [3.8, 0, 6.2, 5, 0.22], [11.3, 0, 6.2, 5, 1.2], [0, 5.6, 28.7, 0.3, 0.9], [0, -5.6, 28.7, 0.3, 0.4]] as Bar[],
];

function rimPath() {
  const pts: THREE.Vector3[] = [];
  const r = 1.1, hx = SW / 2 - 0.04, hz = SD / 2 - 0.04;
  const corners: [number, number, number][] = [[hx - r, hz - r, 0], [-hx + r, hz - r, Math.PI / 2], [-hx + r, -hz + r, Math.PI], [hx - r, -hz + r, Math.PI * 1.5]];
  for (const [cx, cz, a0] of corners) for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector3(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r)); }
  const path = new THREE.CurvePath<THREE.Vector3>();
  pts.forEach((p, i) => path.add(new THREE.LineCurve3(p, pts[(i + 1) % pts.length])));
  return path;
}

export const stackRig: RigFactory = ({ reduced }): Rig => {
  const root = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.y = -0.62;
  root.add(tilt);
  const made: { dispose(): void }[] = [];
  const slabGeo = new RoundedBoxGeometry(SW, ST, SD, 5, 0.42);
  const rimGeo = new THREE.TubeGeometry(rimPath(), 260, 0.1, 6, true);
  // the rim carries the layer's gradient from one end of the slab to the other
  const rx = rimGeo.attributes.position;
  const mix = new Float32Array(rx.count);
  for (let i = 0; i < rx.count; i++) mix[i] = (rx.getX(i) + SW / 2) / SW;
  rimGeo.setAttribute('aMix', new THREE.BufferAttribute(mix, 1));
  const barGeo = new THREE.BoxGeometry(1, 0.1, 1);
  made.push(slabGeo, rimGeo, barGeo);

  const layers = COLORS.map(([from, to], i) => {
    const g = new THREE.Group();
    const body = new THREE.MeshPhysicalMaterial({ color: 0x120e33, metalness: 0.4, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.9, transparent: true, opacity: 0 });
    const rim = new THREE.ShaderMaterial({
      uniforms: { uA: { value: new THREE.Color(from) }, uB: { value: new THREE.Color(to) }, uK: { value: 0 } },
      vertexShader: 'attribute float aMix; varying float vM; void main(){ vM = aMix; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 uA; uniform vec3 uB; uniform float uK; varying float vM; void main(){ gl_FragColor = vec4(mix(uA, uB, vM) * uK, 1.0); }',
    });
    const ink = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    made.push(body, rim, ink);
    const slab = new THREE.Mesh(slabGeo, body);
    const edge = new THREE.Mesh(rimGeo, rim);
    edge.position.y = ST / 2 - 0.05;
    const bars = new THREE.InstancedMesh(barGeo, ink, PATTERNS[i].length);
    const m = new THREE.Matrix4(), a = new THREE.Color(from), b = new THREE.Color(to), c = new THREE.Color();
    PATTERNS[i].forEach(([x, z, w, d, bright = 0.8], k) => {
      m.makeScale(w, 1, d).setPosition(x, ST / 2 + 0.04, z);
      bars.setMatrixAt(k, m);
      bars.setColorAt(k, c.copy(a).lerp(b, (x + SW / 2) / SW).multiplyScalar(bright));
    });
    g.add(slab, edge, bars);
    g.renderOrder = COLORS.length - i;
    tilt.add(g);
    return { g, body, rim, ink, rest: (2 - i) * GAP };
  });

  // which move brings each layer, and when inside it: the two at the bottom share the first step
  const plan: [step: number, from: number, to: number][] = [[3, 0, 0.7], [2, 0, 1], [1, 0, 1], [0, 0.3, 1], [0, 0, 0.7]];
  // where each layer's name hangs: off the middle of its right edge
  const anchors = layers.map((l) => new THREE.Vector3(SW / 2 + 0.8, l.rest, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), tilt.rotation.y));
  return {
    root,
    anchors,
    frame: { x: 0, y: -2.5, w: 47, h: 47 },
    floorY: -(2 * GAP + ST / 2 + 4.5),
    durations: [1300, 850, 850, 1500],
    camera: { fromYaw: -0.7, fromPitch: 0.62, fromDist: 1.2, pitch: 0.4, sway: 0.16, follow: 0.26 },
    update(p, t) {
      const whole = p[3] >= 1 ? 1 : 0;
      layers.forEach((l, i) => {
        const [step, a, b] = plan[i];
        const q = Math.min(1, Math.max(0, (p[step] - a) / (b - a)));
        const e = easeOut(q);
        const breathe = reduced ? 0 : whole * Math.sin(t * 0.7 + i * 0.5) * 0.22 * (2 - i);
        l.g.visible = q > 0;
        l.g.position.y = l.rest + (1 - e) * 30 + breathe;
        l.g.rotation.y = (1 - e) * 0.8 * (i % 2 ? 1 : -1);
        l.body.opacity = Math.min(1, q * 2.4);
        l.ink.opacity = Math.min(1, Math.max(0, q * 2 - 0.9));
        // the rim flares as the slab lands, then holds
        const land = Math.exp(-Math.pow((q - 0.92) / 0.12, 2));
        l.rim.uniforms.uK.value = Math.min(1, q * 2) * (1.25 + land * 2.4 + (reduced ? 0 : whole * 0.25 * Math.sin(t * 1.3 + i)));
      });
    },
    dispose() { made.forEach((m) => m.dispose()); },
  };
};
