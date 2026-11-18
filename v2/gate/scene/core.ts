import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

/**
 * The gate's 3D stage (lote 3.1, second take: «tiene que ser premium, tiene que usar 3D»).
 * A small film studio in code: a long lens, softboxes that only exist as reflections (an environment map
 * rendered once from a scene of light panels), a polished floor that mirrors whatever stands on it (a planar
 * reflection, blurred with distance), bloom on what is really bright, and a neutral tone map that keeps the
 * brand colours. Each version of the gate is a «rig»: the object on the stage and how it builds itself, one
 * move per loading step. The stage runs only while the gate is open and the tab is visible, and frees the GPU
 * when the gate closes. With reduced motion it draws the finished object once.
 */
export type Box = { cx: number; cy: number; w: number; h: number };
export type Stage = {
  /** Where the object goes: its box in CSS px of the canvas, and the canvas size. */
  place(box: Box, width: number, height: number): void;
  /** Pointer position, −1…1 on each axis. */
  pointer(x: number, y: number): void;
  /** How many loading steps are done (0…4): each one releases a move of the rig. */
  step(n: number): void;
  /** Resolves when the first frame is on screen. */
  ready: Promise<void>;
  /** Resolves when the object is whole and at rest. */
  settled: Promise<void>;
  /** The camera goes through the object; resolves when it is done. */
  exit(): Promise<void>;
  dispose(): void;
};
export type StageOpts = {
  reduced: boolean;
  coarse: boolean;
  /** What the visitor sees built so far, 0…1 (never ahead of the real loading). */
  onProgress?(p: number): void;
  /** How many moves are finished (0…4): labels appear with the part they name. */
  onMoves?(done: number): void;
  /** Labels tied to points of the rig: called when they move. */
  onAnchors?(points: { x: number; y: number; on: boolean }[], unit: number): void;
  /** Pictures a rig prints on its objects (the stamps), already decoded. */
  images?: HTMLImageElement[];
};
export type RigCtx = { coarse: boolean; reduced: boolean; scene: THREE.Scene; bloom: UnrealBloomPass; images?: HTMLImageElement[] };
export type Rig = {
  root: THREE.Object3D;
  /** The frame the camera keeps inside the stage box: its centre and size, in world units. */
  frame: { x: number; y: number; w: number; h: number };
  floorY: number;
  /** One per loading step (four): how long each move takes, ms. */
  durations: number[];
  /** Camera: where it starts (yaw, pitch in rad; distance as a factor) and where it rests. */
  camera: { fromYaw: number; fromPitch: number; fromDist: number; pitch: number; sway: number; follow: number };
  /** `p[k]` is how far move k is, 0…1; `t` is seconds since the stage started; `calm` is 0…1 once everything rests. */
  update(p: number[], t: number, dt: number): void;
  anchors?: THREE.Vector3[];
  dispose(): void;
};
export type RigFactory = (ctx: RigCtx) => Rig;

const INK = 0x060513;
const FOV = 24;
const OVERLAP = 0.72; // the next move starts when the previous one is this far
const EXIT_MS = 620;
const BLOOM = 0.3;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const backOut = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);

/** The studio: light panels that only the reflections see. */
function studio(renderer: THREE.WebGLRenderer) {
  const s = new THREE.Scene();
  const made: { dispose(): void }[] = [];
  const dome = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 16), new THREE.MeshBasicMaterial({ color: 0x04030c, side: THREE.BackSide }));
  s.add(dome);
  made.push(dome.geometry, dome.material);
  const panel = (hex: number, power: number, w: number, h: number, pos: [number, number, number]) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(power), side: THREE.DoubleSide });
    const g = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    s.add(mesh);
    made.push(g, m);
  };
  panel(0xfff6ee, 7, 26, 10, [-18, 30, 16]); // key: a warm softbox, high and to the left
  panel(0xffffff, 18, 44, 1.4, [6, 34, -4]); // a long thin strip overhead: the crisp line along every tube
  panel(0xe4e0f2, 3.2, 14, 34, [-44, 6, 10]); // a tall mist card on the left: the bright side of each stroke
  panel(0xff5a3c, 3.4, 5, 22, [-38, -6, -18]); // coral, low on the left and behind
  panel(0x5f86ff, 5, 9, 30, [38, 4, -22]); // blue, behind and to the right: the cool rim
  panel(0xc79bff, 2.6, 5, 24, [42, 8, 14]); // lilac, on the right
  panel(0x8a6bff, 2.4, 30, 6, [-6, -10, -44]); // violet, low and behind: the rim from below
  panel(0xc9c5de, 0.7, 70, 44, [0, 6, 52]); // a wide dim fill behind the camera: the fronts never go black
  const pmrem = new THREE.PMREMGenerator(renderer);
  const map = pmrem.fromScene(s, 0.035).texture;
  pmrem.dispose();
  made.forEach((m) => m.dispose());
  return map;
}

const FLOOR_SHADER = {
  name: 'GateFloor',
  uniforms: {
    color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null },
    uBg: { value: new THREE.Color(INK) }, uCenter: { value: new THREE.Vector2() }, uRadius: { value: 60 }, uMirror: { value: 0.5 },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec3 vWorld;
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec3 uBg;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uMirror;
    varying vec4 vUv;
    varying vec3 vWorld;
    void main() {
      vec2 uv = vUv.xy / vUv.w;
      float d = distance(vWorld.xz, uCenter) / uRadius;
      // a polished floor, not a mirror: the reflection softens and dies with distance
      float b = 0.0009 + 0.0045 * smoothstep(0.0, 1.0, d);
      vec3 c = texture2D(tDiffuse, uv).rgb * 0.28;
      for (int i = 0; i < 8; i++) {
        float a = float(i) * 0.7854;
        float r = (i - (i / 2) * 2 == 0) ? 1.0 : 0.55;
        c += texture2D(tDiffuse, uv + vec2(cos(a), sin(a)) * b * r).rgb * 0.09;
      }
      float k = uMirror * (1.0 - smoothstep(0.12, 1.0, d));
      vec3 lit = max(c - uBg, 0.0) * k;
      // a pool of light where the object stands
      vec3 pool = vec3(0.16, 0.12, 0.42) * 0.07 * (1.0 - smoothstep(0.0, 1.15, d));
      gl_FragColor = vec4(uBg + pool + lit, 1.0);
    }`,
};

const DUST_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vA;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.12 + aSeed * 40.0) * 1.4 + uTime * (0.25 + aSeed * 0.35);
    p.x += cos(uTime * 0.09 + aSeed * 23.0) * 1.8;
    p.y = mod(p.y + 30.0, 70.0) - 30.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + aSeed) * (120.0 / -mv.z);
    vA = (0.35 + 0.65 * sin(uTime * 0.8 + aSeed * 90.0) * 0.5 + 0.5) * smoothstep(-30.0, -18.0, p.y) * (1.0 - smoothstep(26.0, 40.0, p.y));
  }`;
const DUST_FRAG = /* glsl */ `
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(0.75, 0.72, 1.0) * a * a * vA * 0.5, 1.0);
  }`;

const HALO_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uOn;
  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p * vec2(1.0, 1.25));
    float a = smoothstep(0.5, 0.0, d);
    vec3 indigo = vec3(0.10, 0.07, 0.36);
    vec3 warm = vec3(0.42, 0.10, 0.16);
    float w = smoothstep(0.34, 0.0, length(p - vec2(-0.1, 0.12)));
    gl_FragColor = vec4((indigo * a * a * 0.5 + warm * w * w * 0.07) * uOn, 1.0);
  }`;

export function createStage(canvas: HTMLCanvasElement, make: RigFactory, opts: StageOpts): Stage {
  const { reduced, coarse } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(INK, 1);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(INK);
  const env = studio(renderer);
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 600);

  const target = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: coarse ? 2 : 4 });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(dpr);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(4, 4), BLOOM, 0.5, 1);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const rig = make({ coarse, reduced, scene, bloom, images: opts.images });
  scene.add(rig.root);
  const N = rig.durations.length;

  // the floor
  const floorGeo = new THREE.PlaneGeometry(900, 900);
  const floor = new Reflector(floorGeo, { textureWidth: 512, textureHeight: 512, clipBias: 0.003, shader: FLOOR_SHADER, multisample: coarse ? 0 : 2 });
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = rig.floorY;
  const floorU = (floor.material as THREE.ShaderMaterial).uniforms;
  floorU.uCenter.value.set(rig.frame.x, 0);
  floorU.uRadius.value = rig.frame.w * 1.5;
  scene.add(floor);

  // a glow behind the object: depth without a backdrop
  const haloGeo = new THREE.PlaneGeometry(1, 1);
  const haloMat = new THREE.ShaderMaterial({
    uniforms: { uOn: { value: 1 } }, fragmentShader: HALO_FRAG, depthWrite: false, blending: THREE.AdditiveBlending, transparent: true,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.scale.set(rig.frame.w * 4.2, rig.frame.h * 2.6, 1);
  halo.position.set(rig.frame.x, rig.frame.y + rig.frame.h * 0.25, -46);
  halo.renderOrder = -2;
  scene.add(halo);

  // dust in the light
  const COUNT = coarse ? 140 : 260;
  const dustGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3), seed = new Float32Array(COUNT);
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = rig.frame.x + (rnd() - 0.5) * rig.frame.w * 4.4;
    pos[i * 3 + 1] = -30 + rnd() * 70;
    pos[i * 3 + 2] = -50 + rnd() * 80;
    seed[i] = rnd();
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const dustMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uSize: { value: 2.2 * dpr } }, vertexShader: DUST_VERT, fragmentShader: DUST_FRAG,
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  // state
  let W = 1, H = 1, box: Box = { cx: 0.5, cy: 0.5, w: 1, h: 1 }, dist = 200;
  let px = 0, py = 0, sx = 0, sy = 0;
  let arrived = 0, raf = 0, last = 0, t0 = 0, alive = true, drawn = 0, leaving = 0, shownP = -1, shownM = -1;
  const started: number[] = [];
  const p = new Array<number>(N).fill(0);
  let onReady = () => {}, onSettled = () => {}, isSettled = false;
  const ready = new Promise<void>((r) => { onReady = r; });
  const settled = new Promise<void>((r) => { onSettled = r; });
  const look = new THREE.Vector3(rig.frame.x, rig.frame.y, 0);
  const tmp = new THREE.Vector3();

  const fit = () => {
    renderer.setSize(W, H, false);
    composer.setSize(W, H);
    const rt = floor.getRenderTarget();
    const rw = Math.min(1024, Math.round(W * dpr * 0.6)), rh = Math.min(1024, Math.round(H * dpr * 0.6));
    rt.setSize(rw, rh);
    camera.aspect = W / H;
    // the frame of the rig fills its box: the longer lens the better, so distance does the fitting
    const tan = Math.tan((FOV * Math.PI) / 360);
    const dH = (rig.frame.h * H) / (box.h * 2 * tan);
    const dW = (rig.frame.w * W) / (box.w * 2 * tan * camera.aspect);
    dist = Math.max(dH, dW);
    camera.setViewOffset(W, H, W / 2 - box.cx, H / 2 - box.cy, W, H);
    camera.updateProjectionMatrix();
  };

  const frame = (now: number) => {
    raf = 0;
    if (!alive) return;
    if (!t0) { t0 = now; last = now; }
    const dt = Math.min(64, now - last);
    last = now;
    const t = (now - t0) / 1000;

    // release the moves, in order, as their loading steps arrive
    while (started.length < Math.min(arrived, N)) {
      const k = started.length;
      if (k > 0 && now < started[k - 1] + rig.durations[k - 1] * OVERLAP) break;
      started.push(now);
    }
    let sum = 0;
    for (let k = 0; k < N; k++) {
      p[k] = reduced ? (k < arrived ? 1 : 0) : started[k] === undefined ? 0 : clamp01((now - started[k]) / rig.durations[k]);
      sum += p[k];
    }
    const whole = sum / N;
    const pct = Math.round(whole * 100);
    if (pct !== shownP) { shownP = pct; opts.onProgress?.(pct / 100); } // in whole percents: 100 is exactly 1
    const moves = p.filter((x) => x >= 1).length;
    if (moves !== shownM) { shownM = moves; opts.onMoves?.(moves); }
    if (!isSettled && whole >= 1) { isSettled = true; onSettled(); }

    rig.update(p, t, dt);
    dustMat.uniforms.uTime.value = t;

    // camera: arrives on an arc while the object builds, then breathes and follows the pointer
    const k = 1 - Math.exp(-dt / 260);
    sx += (px - sx) * k;
    sy += (py - sy) * k;
    const arc = easeOut(clamp01(whole));
    const out = leaving ? easeInOut(clamp01((now - leaving) / EXIT_MS)) : 0;
    const c = rig.camera;
    const yaw = c.fromYaw * (1 - arc) + (reduced ? 0 : Math.sin(t * 0.32) * c.sway * arc) + sx * c.follow - out * 0.12;
    const pitch = c.fromPitch * (1 - arc) + c.pitch * arc - sy * c.follow * 0.35;
    const d = dist * (c.fromDist * (1 - arc) + arc) * (1 - out * 0.55);
    camera.position.set(look.x + Math.sin(yaw) * Math.cos(pitch) * d, look.y + Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d);
    camera.lookAt(look);
    bloom.strength = BLOOM + out * 1.2;
    renderer.toneMappingExposure = 1 + out * 1.2;

    composer.render();
    drawn += 1;
    canvas.dataset.frames = String(drawn);
    if (drawn === 2) onReady();
    if (rig.anchors && opts.onAnchors) {
      // `unit`: how many CSS px one world unit measures where the object stands
      opts.onAnchors(rig.anchors.map((a) => {
        tmp.copy(a).project(camera);
        return { x: (tmp.x * 0.5 + 0.5) * W, y: (-tmp.y * 0.5 + 0.5) * H, on: tmp.z < 1 };
      }), H / (2 * Math.tan((FOV * Math.PI) / 360) * camera.position.distanceTo(look)));
    }
    if (reduced && drawn >= 2 && !leaving) return; // a still: drawn again only when something changes
    raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && alive && !document.hidden) raf = requestAnimationFrame(frame); };
  const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; last = 0; } else { last = performance.now(); kick(); } };
  document.addEventListener('visibilitychange', onVis);

  return {
    place(b, width, height) { box = b; W = Math.max(1, Math.round(width)); H = Math.max(1, Math.round(height)); fit(); drawn = Math.min(drawn, 1); kick(); },
    pointer(x, y) { if (reduced) return; px = x; py = y; },
    step(n) { arrived = Math.max(arrived, n); if (reduced) { drawn = Math.min(drawn, 1); kick(); } },
    ready,
    settled,
    exit() {
      if (reduced) return Promise.resolve();
      leaving = performance.now();
      kick();
      return new Promise((r) => setTimeout(r, EXIT_MS));
    },
    dispose() {
      alive = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      rig.dispose();
      [floorGeo, haloGeo, haloMat, dustGeo, dustMat, env, target].forEach((x) => x.dispose());
      floor.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
