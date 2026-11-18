/**
 * The gate (lote 3.1) covers the home on every full load of it. `html[data-gate]` is the one source of truth:
 * an inline script in the layout sets it before the first paint ('on' on the home and on the preview of each
 * version, /puerta/<version>/; 'off' anywhere else), the
 * gate sets it to 'off' when the visitor enters, and it stays 'off' for the rest of the visit (client-side
 * navigations never show the gate again). QA: `localStorage['ig:v2:gate'] = 'off'` skips it.
 */
export const GATE_KEY = 'ig:v2:gate';
/** The four versions of the gate, each a 3D scene on the same stage (Ignacio, 18/11/2026: «premium, y en 3D»). */
export const GATE_VARIANTS = ['monograma', 'codigo', 'ascenso', 'postal'] as const;
export type GateVariant = (typeof GATE_VARIANTS)[number];
/** The real loading, in four steps: the script, the fonts, the scene of the gate, the page itself. */
export const STEPS = ['dom', 'fonts', 'scene', 'page'] as const;
export type Step = (typeof STEPS)[number];
export const GATE_EVENT = 'ig:v2:gate'; // { action: 'enter' | 'meet' }
export const gateOpen = () => typeof document !== 'undefined' && document.documentElement.dataset.gate === 'on';

/** Runs in <head>, before anything is painted. A click on a door before the page is interactive still enters. */
export const gateScript = (base: string) => `(function(){try{var h=document.documentElement,p=location.pathname.slice(${base.length});
if(/^\\/v2\\/[a-z]{2}(\\/puerta\\/[a-z]+)?\\/?$/.test(p)&&localStorage.getItem(${JSON.stringify(GATE_KEY)})!=='off'){h.dataset.gate='on';
document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('[data-gate-enter]');if(t&&!h.dataset.gateLive)h.dataset.gate='off';},true);}
else h.dataset.gate='off';}catch(e){document.documentElement.dataset.gate='off';}})();`;

/**
 * The labels each version hangs on its 3D object, and the move (0…3) that brings the part each one names:
 * a label shows once that many moves are finished.
 */
export const TAG_AFTER: Record<GateVariant, number[]> = {
  monograma: [],
  codigo: [4, 3, 2, 1, 1], // the five layers, top first: they land from the bottom up
  ascenso: [0, 1, 2, 3, 4], // four stages and the arrival
  postal: [1, 2, 2, 3, 3, 4], // six stamps, dealt 1 · 2 · 2 · 1
};
