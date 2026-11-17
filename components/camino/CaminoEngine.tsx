'use client';

import { useEffect } from 'react';
import { STATIONS, BUILDINGS, type StationId } from '@/lib/career';
import { asset } from '@/lib/site';
import { playCue } from '@/lib/sound';

type Data = {
  w: number;
  h: number;
  origin: [number, number];
  stops: Record<StationId, number>;
  frames: Record<StationId, [number, number, number, number]>;
  buildings: Record<string, [number, number, number, number]>;
  /** [screen x, screen y, orientation (0: along x, 1: along y), arc length] every ~12 units of the journey */
  journey: [number, number, number, number][];
  /** the painter's depth of each journey point */
  depth: number[];
};

const REDUCED = '(prefers-reduced-motion: reduce)';
const NARROW = 640;
/** the smallest area the camera frames on a wide stage, in drawing units */
const MIN = [560, 380] as const;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * «El camino» (components/camino/Camino.tsx). Everything the model does, and nothing that loops:
 * - the drawing (public/media/camino/camino.svg + .json) is fetched when the section comes near and put in line, so it
 *   gets the page's CSS variables; until then, and if it fails, the list is the whole content;
 * - the camera is one `transform` on the world group, eased by CSS: a station frames the whole station, and on a narrow
 *   stage the picked building (a station would be too small to read);
 * - the handcar runs along the journey to the station's stop (rAF only while it moves), and is re-inserted in the
 *   painter's order of the buildings it passes behind;
 * - a picked building (a click on it, or its chip) is lifted, outlined in coral, and its card opens.
 */
function run(root: HTMLElement) {
  const slot = root.querySelector<HTMLElement>('[data-slot]')!;
  const window_ = slot.parentElement!;
  const steps = Array.from(root.querySelectorAll<HTMLButtonElement>('.camino__step'));
  const readout = root.querySelector<HTMLElement>('[data-readout]')!;
  const toggle = root.querySelector<HTMLButtonElement>('[data-toggle]')!;
  const panels = new Map(Array.from(root.querySelectorAll<HTMLElement>('[data-panel]')).map((p) => [p.dataset.panel as StationId, p]));
  const motion = matchMedia(REDUCED);

  let data: Data | undefined;
  let svg: SVGSVGElement | undefined;
  let world: SVGGElement | undefined;
  let car: SVGGElement | undefined;
  let stand: SVGGElement | undefined;
  let standing: { el: Element; k: number }[] = [];
  let station: StationId = STATIONS[0].id;
  let picked: string = STATIONS[0].buildings[0].id;
  const lastPicked = new Map<StationId, string>(STATIONS.map((s) => [s.id, s.buildings[0].id]));
  let stageW = 0;
  let stageH = 0;
  let carS = 0;
  let raf = 0;
  let loading = false;

  /* ── the list side: tabs, panels, chips, cards ── */
  const showStation = (id: StationId, focus = false) => {
    station = id;
    steps.forEach((b) => {
      const on = b.dataset.station === id;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    panels.forEach((p, k) => p.toggleAttribute('data-active', k === id));
    const b = steps.find((x) => x.dataset.station === id);
    readout.textContent = b?.dataset.readout ?? '';
    showBuilding(lastPicked.get(id) ?? STATIONS.find((s) => s.id === id)!.buildings[0].id, false);
    camera();
    drive(id);
  };
  const showBuilding = (id: string, frame = true) => {
    picked = id;
    const st = BUILDINGS.find((b) => b.id === id)!.station;
    lastPicked.set(st, id);
    root.querySelectorAll<HTMLElement>('[data-card]').forEach((c) => c.toggleAttribute('data-on', c.dataset.card === id));
    root.querySelectorAll<HTMLElement>('.camino__chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.b === id)));
    svg?.querySelectorAll('[data-building]').forEach((g) => g.toggleAttribute('data-on', g.getAttribute('data-building') === id));
    if (frame && stageW < NARROW) camera();
  };

  /* ── the camera: one transform on the world group ── */
  const camera = () => {
    if (!data || !world) return;
    const narrow = stageW < NARROW;
    const raw = narrow ? data.buildings[picked] ?? data.frames[station] : data.frames[station];
    // never closer than a small neighbourhood: a lone building floating in the dark says nothing
    const f: [number, number, number, number] = narrow ? raw : [raw[0] - Math.max(0, MIN[0] - raw[2]) / 2, raw[1] - Math.max(0, MIN[1] - raw[3]) / 2, Math.max(raw[2], MIN[0]), Math.max(raw[3], MIN[1])];
    const pad = narrow ? 1.5 : 1.12;
    const s = Math.min(stageW / (f[2] * pad), stageH / (f[3] * pad));
    const cx = f[0] + f[2] / 2;
    const cy = f[1] + f[3] / 2;
    world.style.transform = `translate(${(stageW / 2 - cx * s).toFixed(1)}px, ${(stageH / 2 - cy * s).toFixed(1)}px) scale(${s.toFixed(4)})`;
  };
  const measure = () => {
    stageW = window_.clientWidth;
    stageH = window_.clientHeight;
    svg?.setAttribute('viewBox', `0 0 ${stageW} ${stageH}`);
    if (world) {
      world.style.transition = 'none';
      camera();
      void world.getBoundingClientRect();
      world.style.transition = '';
    }
  };

  /* ── the handcar ── */
  const at = (s: number) => {
    const j = data!.journey;
    let lo = 0;
    let hi = j.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (j[m][3] <= s) lo = m;
      else hi = m;
    }
    const q = clamp((s - j[lo][3]) / Math.max(1e-6, j[hi][3] - j[lo][3]), 0, 1);
    return { x: j[lo][0] + (j[hi][0] - j[lo][0]) * q, y: j[lo][1] + (j[hi][1] - j[lo][1]) * q, o: q < 0.5 ? j[lo][2] : j[hi][2], d: data!.depth[lo] + (data!.depth[hi] - data!.depth[lo]) * q };
  };
  let slot_ = -1;
  const place = (s: number) => {
    if (!data || !car || !stand) return;
    const p = at(s);
    car.setAttribute('transform', `translate(${(p.x - data.origin[0]).toFixed(1)} ${(p.y - data.origin[1]).toFixed(1)})`);
    car.querySelectorAll<SVGElement>('[data-car]').forEach((c) => c.toggleAttribute('hidden', c.dataset.car !== (p.o ? 'y' : 'x')));
    // painter: in front of everything that is farther than the car, behind what is nearer
    let i = standing.findIndex((x) => x.k > p.d);
    if (i < 0) i = standing.length;
    if (i !== slot_) {
      slot_ = i;
      stand.insertBefore(car, standing[i]?.el ?? null);
    }
    carS = s;
  };
  const drive = (id: StationId) => {
    if (!data) return;
    cancelAnimationFrame(raf);
    const to = data.stops[id];
    if (motion.matches || Math.abs(to - carS) < 1) return place(to);
    const from = carS;
    const dur = clamp(Math.abs(to - from) * 1.1, 600, 1700);
    const t0 = performance.now();
    const tick = (t: number) => {
      const q = clamp((t - t0) / dur, 0, 1);
      place(from + (to - from) * ease(q));
      if (q < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  /* ── loading ── */
  const load = async () => {
    if (loading || data) return;
    loading = true;
    try {
      const [svgText, json] = await Promise.all([
        fetch(asset('/media/camino/camino.svg')).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status))))),
        fetch(asset('/media/camino/camino.json')).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
      ]);
      data = json as Data;
      slot.innerHTML = svgText;
      svg = slot.querySelector('svg')!;
      svg.removeAttribute('aria-label');
      svg.removeAttribute('role');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      world = svg.querySelector<SVGGElement>('.cam-world')!;
      car = svg.querySelector<SVGGElement>('.cam-car-at')!;
      stand = svg.querySelector<SVGGElement>('.cam-stand')!;
      world.style.transformOrigin = '0 0';
      standing = Array.from(stand.children)
        .filter((c) => c !== car && c.hasAttribute('data-k'))
        .map((el) => ({ el, k: Number(el.getAttribute('data-k')) }));
      measure();
      carS = data.stops[station];
      place(carS);
      showBuilding(picked, false);
      root.dataset.state = 'ready';
    } catch {
      root.dataset.state = 'error';
      root.dataset.view = 'list';
    }
  };

  /* ── events ── */
  const onStepClick = (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('.camino__step');
    if (b) {
      if (b.dataset.station !== station) playCue('select');
      showStation(b.dataset.station as StationId);
    }
  };
  const onStepKey = (e: KeyboardEvent) => {
    const i = steps.findIndex((b) => b.dataset.station === station);
    const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: steps.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const n = steps[clamp(to, 0, steps.length - 1)];
    showStation(n.dataset.station as StationId, true);
  };
  const onClick = (e: MouseEvent) => {
    const t = e.target as Element;
    const chip = t.closest<HTMLElement>('.camino__chip');
    if (chip) return showBuilding(chip.dataset.b!);
    const g = t.closest<SVGGElement>('[data-building]');
    if (g && svg?.contains(g)) {
      const id = g.getAttribute('data-building')!;
      const st = BUILDINGS.find((b) => b.id === id)!.station;
      if (st !== station) showStation(st);
      showBuilding(id);
    }
  };
  let hover: Element | null = null;
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const g = (e.target as Element).closest('[data-building]');
    if (g === hover) return;
    hover?.removeAttribute('data-hover');
    hover = g;
    hover?.setAttribute('data-hover', '');
  };
  const onToggle = () => {
    const list = root.dataset.view === 'list';
    if (list) delete root.dataset.view;
    else root.dataset.view = 'list';
    if (list) measure();
  };

  const stepsBar = root.querySelector<HTMLElement>('[data-steps]')!;
  stepsBar.addEventListener('click', onStepClick);
  stepsBar.addEventListener('keydown', onStepKey);
  root.addEventListener('click', onClick);
  slot.addEventListener('pointerover', onOver, { passive: true });
  toggle.addEventListener('click', onToggle);
  const ro = new ResizeObserver(() => data && measure());
  ro.observe(window_);
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { void load(); io.disconnect(); } }, { rootMargin: '700px 0px' });
  io.observe(root);
  readout.textContent = steps[0]?.dataset.readout ?? '';
  root.dataset.live = '';

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    stepsBar.removeEventListener('click', onStepClick);
    stepsBar.removeEventListener('keydown', onStepKey);
    root.removeEventListener('click', onClick);
    slot.removeEventListener('pointerover', onOver);
    toggle.removeEventListener('click', onToggle);
    slot.replaceChildren();
    delete root.dataset.state;
    delete root.dataset.live;
  };
}

export function CaminoEngine() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-camino]');
    if (!root) return;
    return run(root);
  }, []);
  return null;
}
