/**
 * The background engine (lazy chunk: the only entry into three). One renderer, one camera rig, one RAF loop
 * for the whole visit; scenes come and go with the route and are disposed when they leave.
 *
 * - DPR ≤ 1.5 on desktop, 1 on phones; phones render at ≤ 30 fps. Software GL (no GPU): DPR 1 at 3/4 resolution,
 *   no MSAA, 30 fps. A governor lowers the frame rate further when frames come slowly.
 * - Pauses while the tab is hidden and while the page is inert (boot screen, trailer).
 * - Reduced motion: one still frame per scene (again only if the canvas is resized, which clears it).
 * - Per frame: one read of scrollY and the pointer cached by a passive listener. No layout reads.
 * - `window.__igScene` exposes the state and counters for QA (e2e test, perf script).
 */
import { ColorManagement, Group, LinearSRGBColorSpace, type Mesh, PerspectiveCamera, Scene, type ShaderMaterial, WebGLRenderer } from 'three';
import type { SceneId } from './routes';
import type { SceneContext, SceneInput, SceneInstance, SceneModule, SceneState } from './types';
import { disposeTree, mulberry32, seedOf } from './kit';

ColorManagement.enabled = false;

const LOADERS: Record<SceneId, () => Promise<SceneModule>> = {
  home: () => import('./scenes/home'),
  complia: () => import('./scenes/complia'),
  handyx: () => import('./scenes/handyx'),
  eclipse: () => import('./scenes/eclipse'),
  kinetic: () => import('./scenes/kinetic'),
  agentes: () => import('./scenes/agentes'),
  tuenti: () => import('./scenes/tuenti'),
  volta: () => import('./scenes/volta'),
  dentalos: () => import('./scenes/dentalos'),
  games: () => import('./scenes/games'),
  velmar: () => import('./scenes/velmar'),
  supernova: () => import('./scenes/supernova'),
  negocio: () => import('./scenes/negocio'),
  default: () => import('./scenes/default'),
};

export type EngineOptions = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  /** no GPU: render lean from the start */
  software: boolean;
  reduced: boolean;
  onState: (s: SceneState) => void;
};

export type Engine = {
  show(id: SceneId): Promise<void>;
  setReduced(r: boolean): void;
  dispose(): void;
};

type Debug = {
  id: SceneId | null;
  state: SceneState;
  frames: number;
  cpuMs: number;
  looping: boolean;
  /** quality tier: frame-rate cap 0 → 60 fps · 1 → 30 · 2 → 20 · 3 → 15 (QA may set it; `govern` adjusts it) */
  tier: number;
  /** QA: stop the governor (to measure one tier) */
  hold: boolean;
  software: boolean;
  memory: () => { geometries: number; textures: number; programs: number };
  /** QA: preview another scene over the current page */
  show: (id: SceneId) => Promise<void>;
};

const isMobile = () => matchMedia('(pointer: coarse)').matches || innerWidth < 768;
const FADE_OUT_MS = 320;
// minimum ms between rendered frames per tier (a hair under 1000/fps so 60 and 120 Hz screens land on the cap)
const TIER_GAP = [0, 31, 48, 64];
// average RAF interval (ms) above which the governor steps down from each tier
const TIER_LIMIT = [22, 40, 50];
const WINDOW_MS = 2500;

export function createEngine({ canvas, gl, software, reduced: reduced0, onState }: EngineOptions): Engine {
  let reduced = reduced0;
  let mobile = isMobile();
  // the context comes from SceneBackground (its attributes: alpha, premultiplied, MSAA off on phones)
  const renderer = new WebGLRenderer({ canvas, context: gl, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const camera = new PerspectiveCamera(35, 1, 0.1, 200);
  const rig = new Group();
  rig.add(camera);

  let w = Math.max(1, canvas.clientWidth || innerWidth);
  let h = Math.max(1, canvas.clientHeight || innerHeight);
  let maxScroll = 1;
  let current: { id: SceneId; mod: SceneModule; scene: Scene; inst: SceneInstance; ctx: SceneContext } | null = null;
  let token = 0;
  let raf = 0;
  let last = 0;
  let disposed = false;
  let hidden = document.visibilityState === 'hidden';
  const shell = document.getElementById('app-shell');
  let inert = !!shell?.hasAttribute('inert');
  const input: SceneInput = { t: 0, dt: 0, scroll: 0, progress: 0, px: 0, py: 0 };
  let tx = 0;
  let ty = 0;
  // quality governor: phones start at 30 fps. Anywhere, when frames come slowly (software GL, a weak GPU, a busy
  // page), it lowers the frame rate one step per window: 30, 20, 15 fps. It never steps back up, and it never
  // touches the resolution (resizing the drawing buffer stalls on a slow GPU: a long task every time).
  let winStart = 0;
  let winTicks = 0;

  const debug: Debug = {
    id: null,
    state: 'loading',
    frames: 0,
    cpuMs: 0,
    looping: false,
    tier: mobile || software ? 1 : 0,
    hold: false,
    software,
    memory: () => ({ geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, programs: renderer.info.programs?.length ?? 0 }),
    show: (id) => show(id),
  };
  (window as unknown as { __igScene?: Debug }).__igScene = debug;

  const setState = (s: SceneState) => {
    if (debug.state === s) return;
    debug.state = s;
    onState(s);
  };

  const dprFor = (mod?: SceneModule) =>
    Math.min(window.devicePixelRatio || 1, mobile || software ? 1 : 1.5) * (mod?.renderScale ?? 1) * (software ? 0.75 : 1);

  const applySize = () => {
    renderer.setPixelRatio(dprFor(current?.mod));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (current) {
      const dpr = dprFor(current.mod);
      Object.assign(current.ctx, { w, h, mobile, dpr });
      // point sizes are written in CSS px × uPx: keep it in step with the real pixel ratio
      current.scene.traverse((o) => {
        const u = ((o as Mesh).material as ShaderMaterial | undefined)?.uniforms;
        if (u?.uPx) u.uPx.value = dpr;
      });
      current.inst.resize?.(w, h);
    }
  };

  const render = (dt: number) => {
    if (!current) return;
    const t0 = performance.now();
    input.dt = dt;
    input.t += dt;
    input.scroll = window.scrollY;
    input.progress = Math.min(1, Math.max(0, input.scroll / maxScroll));
    const k = 1 - Math.exp(-dt * 2.5);
    input.px += (tx - input.px) * k;
    input.py += (ty - input.py) * k;
    current.inst.frame(input);
    // pointer parallax: the rig turns a hair around the scene's origin
    rig.rotation.set(input.py * 0.018, -input.px * 0.03, 0);
    rig.updateMatrixWorld(true);
    renderer.render(current.scene, camera);
    debug.frames++;
    debug.cpuMs += performance.now() - t0;
  };

  const still = () => {
    if (!current) return;
    input.t = current.mod.still ?? 14;
    input.progress = 0;
    render(0);
    setState('still');
  };

  const loop = (now: number) => {
    raf = 0;
    if (!shouldRun()) {
      debug.looping = false;
      return;
    }
    raf = requestAnimationFrame(loop);
    govern(now);
    // tier 1 (phones from the start): ≤ 30 fps; lower tiers 20 and 15
    if (last && now - last < TIER_GAP[debug.tier]) return;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
    last = now;
    render(dt);
  };

  const govern = (now: number) => {
    if (!winStart) {
      winStart = now;
      winTicks = 0;
      return;
    }
    winTicks++;
    if (now - winStart < WINDOW_MS) return;
    const avg = (now - winStart) / winTicks;
    winStart = now;
    winTicks = 0;
    if (!debug.hold && debug.tier < 3 && avg > TIER_LIMIT[debug.tier]) debug.tier++;
  };

  const shouldRun = () => !disposed && !reduced && !hidden && !inert && !!current;

  const kick = () => {
    if (!shouldRun()) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      debug.looping = false;
      if (current && !disposed) setState(reduced ? 'still' : 'paused');
      return;
    }
    setState('running');
    if (raf) return;
    last = 0;
    winStart = 0; // a fresh measuring window after every pause
    debug.looping = true;
    raf = requestAnimationFrame(loop);
  };

  // --- listeners (all cheap: they store a value or flip a flag) ---
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !fine.matches) return;
    tx = (e.clientX / w) * 2 - 1;
    ty = (e.clientY / h) * 2 - 1;
  };
  const onVisibility = () => {
    hidden = document.visibilityState === 'hidden';
    kick();
  };
  const measureScroll = () => {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  };
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      if (e.target === canvas) {
        const r = e.contentRect;
        if (r.width < 1 || r.height < 1) continue;
        // the observer's first report (and a relayout that keeps the size) must not redraw the still frame
        if (r.width === w && r.height === h) continue;
        mobile = isMobile();
        if (mobile && debug.tier < 1) debug.tier = 1;
        w = r.width;
        h = r.height;
        applySize();
        if (reduced && current) still();
      }
    }
    measureScroll();
  });
  ro.observe(canvas);
  ro.observe(document.body);
  const mo = shell
    ? new MutationObserver(() => {
        inert = shell.hasAttribute('inert');
        kick();
      })
    : null;
  mo?.observe(shell!, { attributes: true, attributeFilter: ['inert'] });
  addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onLost);
  function onLost(e: Event) {
    e.preventDefault();
    teardown();
    setState('fallback');
  }

  applySize();
  measureScroll();

  const disposeCurrent = () => {
    if (!current) return;
    current.inst.dispose?.();
    disposeTree(current.scene);
    current.scene.clear();
    renderer.renderLists.dispose();
    current = null;
  };

  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  async function show(id: SceneId) {
    if (disposed) return;
    if (current?.id === id) return;
    const mine = ++token;
    if (current) {
      canvas.dataset.on = '0';
      if (!reduced) await wait(FADE_OUT_MS);
      if (mine !== token || disposed) return;
      disposeCurrent();
    }
    let mod: SceneModule;
    try {
      mod = await LOADERS[id]();
    } catch {
      if (mine === token) setState('fallback');
      return;
    }
    if (mine !== token || disposed) return;
    const scene = new Scene();
    camera.fov = 35;
    camera.near = 0.1;
    camera.far = 200;
    camera.position.set(0, 0, 10);
    camera.rotation.set(0, 0, 0);
    camera.up.set(0, 1, 0);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dprFor(mod));
    renderer.setSize(w, h, false);
    const ctx: SceneContext = { scene, camera, renderer, rng: mulberry32(seedOf(id)), mobile, reduced, w, h, dpr: dprFor(mod) };
    const inst = mod.create(ctx);
    current = { id, mod, scene, inst, ctx };
    debug.id = id;
    input.t = 0;
    if (reduced) still();
    else {
      render(1 / 60);
      kick();
    }
    canvas.dataset.on = '1';
  }

  function setReduced(r: boolean) {
    if (r === reduced) return;
    reduced = r;
    if (reduced) {
      kick();
      still();
    } else kick();
  }

  function teardown() {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    debug.looping = false;
    ro.disconnect();
    mo?.disconnect();
    removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('webglcontextlost', onLost);
  }

  function dispose() {
    if (disposed && !current) return;
    teardown();
    disposeCurrent();
    renderer.dispose();
    canvas.dataset.on = '0';
  }

  return { show, setReduced, dispose };
}
