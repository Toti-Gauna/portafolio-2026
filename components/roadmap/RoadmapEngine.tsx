'use client';

import { useEffect } from 'react';
import { ROADMAP, STAGES, itemsOf, type StageId } from '@/lib/roadmap';
import { asset } from '@/lib/site';
import { playCue } from '@/lib/sound';

type Frame = [number, number, number, number];
type Data = { w: number; h: number; frames: Record<StageId, Frame>; items: Record<string, Frame>; all: Frame };

const NARROW = 640;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const stageOf = (id: string) => ROADMAP.find((i) => i.id === id)!.stage;

/**
 * The roadmap's model (components/roadmap/Roadmap.tsx), the same mechanics as «El camino» without the handcar:
 * - the drawing (public/media/roadmap/roadmap.{svg,json}) is fetched when the section is near and put in line;
 *   until then, and if it fails, the list is the whole content;
 * - the camera is one `transform` on the world group, eased by CSS: a stage frames the whole district, and on a narrow
 *   stage the picked piece;
 * - the stage on screen has its wire models dotted in coral (`data-stage-on`), the picked piece draws solid and lifts.
 */
function run(root: HTMLElement) {
  const slot = root.querySelector<HTMLElement>('[data-slot]')!;
  const win = slot.parentElement!;
  const steps = Array.from(root.querySelectorAll<HTMLButtonElement>('.camino__step'));
  const readout = root.querySelector<HTMLElement>('[data-readout]')!;
  const toggle = root.querySelector<HTMLButtonElement>('[data-toggle]')!;
  const stepsBar = root.querySelector<HTMLElement>('[data-steps]')!;
  const panels = new Map(Array.from(root.querySelectorAll<HTMLElement>('[data-panel]')).map((p) => [p.dataset.panel as StageId, p]));

  let data: Data | undefined;
  let svg: SVGSVGElement | undefined;
  let world: SVGGElement | undefined;
  let stage: StageId = STAGES[0];
  let picked = itemsOf(STAGES[0])[0].id;
  const lastPicked = new Map<StageId, string>(STAGES.map((s) => [s, itemsOf(s)[0].id]));
  let w = 0;
  let h = 0;
  let loading = false;

  const camera = () => {
    if (!data || !world) return;
    const narrow = w < NARROW;
    const f = narrow ? data.items[picked] ?? data.frames[stage] : data.frames[stage];
    const pad = narrow ? 1.5 : 1.1;
    const s = Math.min(w / (f[2] * pad), h / (f[3] * pad));
    world.style.transform = `translate(${(w / 2 - (f[0] + f[2] / 2) * s).toFixed(1)}px, ${(h / 2 - (f[1] + f[3] / 2) * s).toFixed(1)}px) scale(${s.toFixed(4)})`;
  };
  const measure = () => {
    w = win.clientWidth;
    h = win.clientHeight;
    svg?.setAttribute('viewBox', `0 0 ${w} ${h}`);
    if (world) {
      world.style.transition = 'none';
      camera();
      void world.getBoundingClientRect();
      world.style.transition = '';
    }
  };

  const showItem = (id: string, frame = true) => {
    picked = id;
    lastPicked.set(stageOf(id), id);
    root.querySelectorAll<HTMLElement>('[data-card]').forEach((c) => c.toggleAttribute('data-on', c.dataset.card === id));
    root.querySelectorAll<HTMLElement>('.roadmap__row').forEach((r) => r.setAttribute('aria-pressed', String(r.dataset.b === id)));
    svg?.querySelectorAll('[data-item]').forEach((g) => g.toggleAttribute('data-on', g.getAttribute('data-item') === id));
    if (frame && w < NARROW) camera();
  };
  const showStage = (id: StageId, focus = false) => {
    stage = id;
    steps.forEach((b) => {
      const on = b.dataset.station === id;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    panels.forEach((p, k) => p.toggleAttribute('data-active', k === id));
    readout.textContent = steps.find((b) => b.dataset.station === id)?.dataset.readout ?? '';
    svg?.querySelectorAll('[data-item]').forEach((g) => g.toggleAttribute('data-stage-on', g.getAttribute('data-stage') === id));
    showItem(lastPicked.get(id)!, false);
    camera();
  };

  const load = async () => {
    if (loading || data) return;
    loading = true;
    try {
      const [text, json] = await Promise.all([
        fetch(asset('/media/roadmap/roadmap.svg')).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status))))),
        fetch(asset('/media/roadmap/roadmap.json')).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
      ]);
      data = json as Data;
      slot.innerHTML = text;
      svg = slot.querySelector('svg')!;
      svg.removeAttribute('aria-label');
      svg.removeAttribute('role');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      world = svg.querySelector<SVGGElement>('.cam-world')!;
      world.style.transformOrigin = '0 0';
      measure();
      showStage(stage);
      root.dataset.state = 'ready';
    } catch {
      root.dataset.state = 'error';
      root.dataset.view = 'list';
    }
  };

  const onStep = (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('.camino__step');
    if (!b) return;
    if (b.dataset.station !== stage) playCue('select');
    showStage(b.dataset.station as StageId);
  };
  const onKey = (e: KeyboardEvent) => {
    const i = STAGES.indexOf(stage);
    const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: STAGES.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    showStage(STAGES[clamp(to, 0, STAGES.length - 1)], true);
  };
  const onClick = (e: MouseEvent) => {
    const t = e.target as Element;
    const row = t.closest<HTMLElement>('.roadmap__row');
    if (row) return showItem(row.dataset.b!);
    const g = t.closest<SVGGElement>('[data-item]');
    if (g && svg?.contains(g)) {
      const id = g.getAttribute('data-item')!;
      if (stageOf(id) !== stage) showStage(stageOf(id));
      showItem(id);
    }
  };
  let hover: Element | null = null;
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const g = (e.target as Element).closest('[data-item]');
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

  stepsBar.addEventListener('click', onStep);
  stepsBar.addEventListener('keydown', onKey);
  root.addEventListener('click', onClick);
  slot.addEventListener('pointerover', onOver, { passive: true });
  toggle.addEventListener('click', onToggle);
  const ro = new ResizeObserver(() => data && measure());
  ro.observe(win);
  const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { void load(); io.disconnect(); } }, { rootMargin: '700px 0px' });
  io.observe(root);
  readout.textContent = steps[0]?.dataset.readout ?? '';
  root.dataset.live = '';

  return () => {
    ro.disconnect();
    io.disconnect();
    stepsBar.removeEventListener('click', onStep);
    stepsBar.removeEventListener('keydown', onKey);
    root.removeEventListener('click', onClick);
    slot.removeEventListener('pointerover', onOver);
    toggle.removeEventListener('click', onToggle);
    slot.replaceChildren();
    delete root.dataset.state;
    delete root.dataset.live;
  };
}

export function RoadmapEngine() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-roadmap]');
    if (!root) return;
    return run(root);
  }, []);
  return null;
}
