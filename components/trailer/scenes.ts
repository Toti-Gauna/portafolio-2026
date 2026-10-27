import { gsap } from 'gsap';
import { T, DURATION } from './timing';
import type { DrawState } from './state';

export const CODE = `const ejercicio = {
  tema: 'React',
  clase: 'hooks',
};

function explicar(concepto) {
  return ejemplo(concepto).conPráctica();
}`;

export const VIDEO_START = 62; // trailer second at which the ComplIA clip starts
export const VIDEO_LENGTH = 7;

type TL = gsap.core.Timeline;

/** Fade-and-rise in. immediateRender:false so scrubbing back restores the hidden state. */
function inn(tl: TL, el: Element | Element[] | null, at: number, o: { y?: number; d?: number } = {}) {
  if (!el) return;
  tl.fromTo(el, { autoAlpha: 0, y: o.y ?? 24 }, { autoAlpha: 1, y: 0, duration: o.d ?? 0.7, ease: 'expo.out', immediateRender: false }, at);
}
function out(tl: TL, el: Element | Element[] | null, at: number, d = 0.5) {
  if (!el) return;
  tl.to(el, { autoAlpha: 0, y: -14, duration: d, ease: 'power2.in', immediateRender: false }, at);
}

/**
 * The whole trailer as ONE paused GSAP timeline: DOM text + the canvas state.
 * Seeking to any second renders exactly that frame (same idea as the Kinetic Studio kit).
 */
export function buildTimeline(root: HTMLElement, st: DrawState, render: () => void): TL {
  const q = (k: string) => root.querySelector<HTMLElement>(`[data-k="${k}"]`);
  const qa = (k: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-k="${k}"]`));
  const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false }, onUpdate: render });
  const ease = 'expo.out';

  // ── 1 · frío ───────────────────────────────────────────────
  tl.fromTo(st, { seedA: 0 }, { seedA: 1, duration: 1.6, ease: 'power2.out' }, 0.2);
  tl.fromTo(st, { seedR: 0.01 }, { seedR: 0.06, duration: 6, ease: 'sine.inOut' }, 0.2);
  inn(tl, q('s1a'), 2.0); out(tl, q('s1a'), 4.4);
  inn(tl, q('s1b'), 4.8); out(tl, q('s1b'), 7.2);

  // ── 2 · la semilla: typewriter, then the word becomes the picture ──
  const line = q('type'), tPre = q('tPre'), tWord = q('tWord'), tPost = q('tPost');
  if (line && tPre && tWord && tPost) {
    const pre = line.dataset.pre ?? '', word = line.dataset.word ?? '', post = line.dataset.post ?? '';
    const typed = { p: 0 };
    const paint = () => {
      const n = Math.round(typed.p * (pre.length + word.length + post.length));
      tPre.textContent = pre.slice(0, n);
      tWord.textContent = word.slice(0, Math.max(0, n - pre.length));
      tPost.textContent = post.slice(0, Math.max(0, n - pre.length - word.length));
    };
    paint();
    inn(tl, line, T.s2 + 0.6, { d: 0.5 });
    tl.fromTo(typed, { p: 0 }, { p: 1, duration: 4.2, ease: 'none', onUpdate: paint }, T.s2 + 1.2);
    tl.fromTo(tWord, { '--sel': 0 }, { '--sel': 1, duration: 0.6, ease: 'power2.out' }, T.s2 + 6.0);
    out(tl, line, T.s2 + 7.2, 0.6);
  }
  tl.to(st, { seedA: 0, duration: 0.8 }, T.s2 + 6.6);
  tl.fromTo(st, { pAlpha: 0 }, { pAlpha: 1, duration: 0.6 }, T.s2 + 6.8);
  tl.fromTo(st, { toWord: 0 }, { toWord: 1, duration: 2.8, ease: 'power3.out' }, T.s2 + 6.8);

  // ── 3 · la explosión ───────────────────────────────────────
  tl.fromTo(st, { burst: 0 }, { burst: 1, duration: 1.4, ease: 'power2.out' }, T.s3);
  tl.fromTo(st, { toScatter: 0 }, { toScatter: 1, duration: 3.2, ease: 'power2.inOut' }, T.s3 + 0.5);
  tl.to(st, { pAlpha: 0.32, duration: 2.5 }, T.s3 + 3);
  inn(tl, q('s3'), T.s3 + 2.6, { d: 0.9 }); out(tl, q('s3'), T.s3 + 8.2, 0.6);
  tl.fromTo(st, { trunk: 0 }, { trunk: 1, duration: 5.5, ease: 'power2.inOut' }, T.s3 + 4);

  // ── 4 · TACH 2021 ──────────────────────────────────────────
  const card = (name: string, at: number, end: number) => {
    inn(tl, q(`card-${name}`), at, { d: 0.8 });
    out(tl, q(`card-${name}`), end, 0.6);
  };
  tl.fromTo(st, { m0: 0 }, { m0: 1, duration: 2.6, ease }, T.s4 + 0.2);
  tl.fromTo(st, { focus: -1 }, { focus: 0, duration: 0.8 }, T.s4);
  card('tach', T.s4 + 0.8, T.s5 - 0.8);
  inn(tl, q('vis-tach'), T.s4 + 1.4, { d: 0.9 }); out(tl, q('vis-tach'), T.s5 - 0.8, 0.6);
  tl.fromTo(q('shine'), { xPercent: -140 }, { xPercent: 260, duration: 1.8, ease: 'power2.inOut' }, T.s4 + 3);
  tl.fromTo(q('shine'), { xPercent: -140 }, { xPercent: 260, duration: 1.8, ease: 'power2.inOut' }, T.s4 + 6.5);

  // ── 5 · Ada 2023 ───────────────────────────────────────────
  tl.fromTo(st, { m1: 0 }, { m1: 1, duration: 2.6, ease }, T.s5 + 0.2);
  tl.to(st, { focus: 1, duration: 0.8 }, T.s5);
  card('ada', T.s5 + 0.8, T.s6 - 0.8);
  inn(tl, q('vis-ada'), T.s5 + 1.4, { d: 0.9 }); out(tl, q('vis-ada'), T.s6 - 0.8, 0.6);
  const codeEl = q('code');
  if (codeEl) {
    const typed = { p: 0 };
    const paint = () => { codeEl.textContent = CODE.slice(0, Math.round(typed.p * CODE.length)); };
    paint();
    tl.fromTo(typed, { p: 0 }, { p: 1, duration: 6, ease: 'none', onUpdate: paint }, T.s5 + 2);
  }

  // ── 6 · Tuenti 2024: the game came back ────────────────────
  tl.fromTo(st, { m2: 0 }, { m2: 1, duration: 2.6, ease }, T.s6 + 0.2);
  tl.to(st, { focus: 2, duration: 0.8 }, T.s6);
  card('tuenti', T.s6 + 0.8, T.s7 - 0.8);
  inn(tl, q('vis-tuenti'), T.s6 + 1.4, { d: 0.9 }); out(tl, q('vis-tuenti'), T.s7 - 0.8, 0.6);
  tl.fromTo(q('wheel'), { rotation: 0 }, { rotation: 1440 + 38, duration: 6, ease: 'power4.out', transformOrigin: '50% 50%', svgOrigin: '100 100' }, T.s6 + 1.4);
  qa('pill').forEach((p, i) => tl.fromTo(p, { opacity: 0.3 }, { opacity: 1, duration: 0.5 }, T.s6 + 2.4 + i * 1.8));
  inn(tl, q('tag-game'), T.s6 + 9.6, { d: 0.9 });

  // ── 7 · ComplIA 2026 ───────────────────────────────────────
  tl.fromTo(st, { m3: 0 }, { m3: 1, duration: 2.6, ease }, T.s7 + 0.2);
  tl.to(st, { focus: 3, duration: 0.8 }, T.s7);
  card('complia', T.s7 + 0.8, T.s8 - 0.8);
  inn(tl, q('vis-complia'), T.s7 + 1.2, { d: 0.9 }); out(tl, q('vis-complia'), T.s8 - 0.8, 0.6);

  // ── 8 · mis propias ramas ──────────────────────────────────
  tl.to(st, { focus: -1, duration: 0.8 }, T.s8);
  inn(tl, q('proj-title'), T.s8 + 0.4);
  const sides: (keyof DrawState)[] = ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'];
  const chips = qa('chip');
  sides.forEach((k, i) => {
    tl.fromTo(st, { [k]: 0 }, { [k]: 1, duration: 1.1, ease }, T.s8 + 0.8 + i * 1.0);
    inn(tl, chips[i] ?? null, T.s8 + 1.0 + i * 1.0, { y: 16, d: 0.6 });
  });
  out(tl, [q('proj-title'), ...chips].filter(Boolean) as Element[], T.s9 - 0.9, 0.6);

  // ── 9 · no es vibe coding ──────────────────────────────────
  tl.to(st, { graphA: 0, duration: 0.8, ease: 'power2.in' }, T.s9 - 0.4);
  tl.fromTo(st, { agents: 0 }, { agents: 1, duration: 3.4, ease: 'power2.out' }, T.s9 + 0.3);
  inn(tl, q('sys-title'), T.s9 + 0.6, { d: 0.9 });
  inn(tl, q('sys-text'), T.s9 + 2.0);
  const gates = qa('gate');
  gates.forEach((g, i) => {
    const at = T.s9 + 4 + i * 1.7;
    tl.to(st, { gates: i + 1, duration: 0.6, ease: 'power2.out' }, at);
    inn(tl, g, at, { y: 10, d: 0.5 });
  });
  inn(tl, q('sys-note'), T.s9 + 13);
  out(tl, [q('sys-title'), q('sys-text'), q('sys-note'), ...gates].filter(Boolean) as Element[], T.s10 - 0.8, 0.6);
  tl.to(st, { agents: 0, duration: 0.8 }, T.s10 - 0.8);

  // ── 10 · unión ─────────────────────────────────────────────
  tl.to(st, { graphA: 1, duration: 0.5 }, T.s10);
  tl.fromTo(st, { converge: 0 }, { converge: 1, duration: 2.6, ease: 'power3.in' }, T.s10 + 0.8);
  tl.to(st, { graphA: 0, duration: 0.7 }, T.s10 + 3.0);
  tl.to(st, { pAlpha: 1, duration: 0.8 }, T.s10 + 2.6);
  tl.fromTo(st, { toName: 0 }, { toName: 1, duration: 3.2, ease: 'power3.inOut' }, T.s10 + 2.8);
  inn(tl, q('role'), T.s10 + 6.4, { d: 1.0 });
  out(tl, q('role'), T.s11 - 0.6, 0.5);

  // ── 11 · créditos ──────────────────────────────────────────
  tl.to(st, { pAlpha: 0.18, duration: 1.2 }, T.s11 - 0.4);
  tl.fromTo(q('cut-a'), { xPercent: 120, rotation: 8, opacity: 0 }, { xPercent: 0, rotation: 0, opacity: 1, duration: 1.1, ease }, T.s11);
  tl.fromTo(q('cut-b'), { xPercent: 140, rotation: -6, opacity: 0 }, { xPercent: 0, rotation: 0, opacity: 1, duration: 1.3, ease }, T.s11 + 0.2);
  inn(tl, q('open'), T.s11 + 0.7, { d: 0.9 });
  inn(tl, q('mail'), T.s11 + 1.7);
  tl.to(q('stage-fade'), { opacity: 1, duration: 0.8, ease: 'power2.in' }, DURATION - 0.8);

  tl.set({}, {}, DURATION); // the timeline lasts exactly 120 s
  return tl;
}
