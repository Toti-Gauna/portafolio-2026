/**
 * Sonido del sitio (design/2026/sonido.md). Apagado por defecto: nada suena antes de un clic.
 * «Conocer a Ignacio» y «Ver portafolio» lo encienden (es el gesto que exige el navegador); el botón del header lo apaga
 * y lo vuelve a encender. Si el visitante lo apagó, se recuerda (localStorage) y las puertas no lo vuelven a encender.
 * Contexto de audio propio del sitio: el tráiler usa el suyo (lib/trailer-prime.ts) y lo cierra al salir.
 * Los sonidos de interfaz se sintetizan (sin archivos); con movimiento reducido no hay sonidos de interfaz.
 * La música de fondo por sección llega en la Ola 3b.
 */
export const SOUND_EVENT = 'ig:sound';
const KEY = 'ig-sound';

let ctx: AudioContext | undefined;
let master: GainNode | undefined;
let on = false;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mutedByVisitor = () => {
  try {
    return localStorage.getItem(KEY) === 'off';
  } catch {
    return false;
  }
};
const remember = (v: 'on' | 'off') => {
  try {
    localStorage.setItem(KEY, v);
  } catch { /* sin almacenamiento: no pasa nada */ }
};

function ensureContext() {
  if (ctx && ctx.state !== 'closed') return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return undefined;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  return ctx;
}

function announce() {
  window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: { on } }));
}

export function isSoundOn() {
  return on;
}

/** Desde una puerta, DENTRO del clic. No hace nada si el visitante ya lo había apagado. */
export function enableSoundFromGate() {
  if (mutedByVisitor()) return false;
  return setSound(true, false);
}

/** Desde el botón del header, DENTRO del clic. */
export function setSound(next: boolean, rememberChoice = true) {
  if (next) {
    try {
      const c = ensureContext();
      void c?.resume();
    } catch { /* sin audio: el sitio sigue igual */ }
  } else {
    void ctx?.suspend().catch(() => {});
  }
  on = next;
  if (rememberChoice) remember(next ? 'on' : 'off');
  announce();
  return on;
}

type Cue = 'open' | 'click' | 'select' | 'tick';

/** Un sonido corto de interfaz, sintetizado. Silencioso si el sonido está apagado o con movimiento reducido. */
export function playCue(cue: Cue) {
  if (!on || !ctx || !master || reduced()) return;
  const t0 = ctx.currentTime + 0.01;
  const note = (freq: number, start: number, dur: number, gain: number, type: OscillatorType = 'sine') => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    const f = ctx!.createBiquadFilter();
    o.type = type;
    o.frequency.value = freq;
    f.type = 'lowpass';
    f.frequency.value = 2400;
    g.gain.setValueAtTime(0, t0 + start);
    g.gain.linearRampToValueAtTime(gain, t0 + start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
    o.connect(f).connect(g).connect(master!);
    o.start(t0 + start);
    o.stop(t0 + start + dur + 0.05);
  };
  if (cue === 'open') {
    // acorde abierto de re (D–A–E), suave: la entrada al portafolio
    note(146.83, 0, 1.4, 0.05, 'triangle');
    note(220, 0.06, 1.3, 0.035, 'sine');
    note(329.63, 0.12, 1.2, 0.025, 'sine');
  } else if (cue === 'click') {
    note(880, 0, 0.06, 0.03, 'triangle');
  } else if (cue === 'select') {
    note(110, 0, 0.35, 0.06, 'sine');
    note(220, 0.02, 0.25, 0.02, 'triangle');
  } else {
    note(1320, 0, 0.03, 0.015, 'square');
  }
}
