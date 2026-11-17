/**
 * Sonido del sitio (design/2026/sonido.md). Apagado por defecto: nada suena antes de un clic.
 * «Conocer a Ignacio» y «Ver portafolio» lo encienden (es el gesto que exige el navegador); el botón del header lo apaga
 * y lo vuelve a encender. Si el visitante lo apagó, se recuerda (localStorage) y las puertas no lo vuelven a encender.
 * Un solo contexto de audio para todo el sitio (el tráiler usa el suyo, lib/trailer-prime.ts, y lo cierra al salir).
 *   master ← cues (sonidos de interfaz, sintetizados) · music (la música de fondo, lib/music.ts)
 * Pausas: con la pestaña oculta o con el tráiler abierto (`hold`) el audio se desvanece y el contexto se suspende.
 * Los sonidos de interfaz no suenan con movimiento reducido; la música sí (la pidió el visitante con la puerta).
 */
export const SOUND_EVENT = 'ig:sound';
const KEY = 'ig-sound';
const LEVEL = 0.9;

let ctx: AudioContext | undefined;
let master: GainNode | undefined;
let musicBus: GainNode | undefined;
let on = false;
const holds = new Set<string>();

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
  master.gain.value = 0;
  master.connect(ctx.destination);
  musicBus = ctx.createGain();
  musicBus.gain.value = 1;
  musicBus.connect(master);
  return ctx;
}

/** ¿Está sonando (encendido y sin pausas)? */
export function isRunning() {
  return on && holds.size === 0;
}

/** Audio del sitio para la música. Solo existe una vez que alguien lo encendió. */
export function getAudio() {
  return ctx && master && musicBus ? { ctx, master, music: musicBus } : undefined;
}

function announce() {
  window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: { on, running: isRunning() } }));
}

/** Sube o baja el volumen general (sin saltos) y suspende el contexto cuando no suena nada. */
function apply() {
  if (ctx && master) {
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    if (isRunning()) {
      void ctx.resume();
      master.gain.linearRampToValueAtTime(LEVEL, t + 0.4);
    } else {
      master.gain.linearRampToValueAtTime(0, t + 0.25);
      window.setTimeout(() => {
        if (!isRunning()) void ctx?.suspend().catch(() => {});
      }, 320);
    }
  }
  announce();
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
      void ensureContext()?.resume();
    } catch { /* sin audio: el sitio sigue igual */ }
  }
  on = next;
  if (rememberChoice) remember(next ? 'on' : 'off');
  apply();
  return on;
}

/** Pausa el sonido del sitio por un motivo («trailer», «hidden») y lo retoma cuando ya no queda ninguno. */
export function hold(reason: string, active: boolean) {
  const had = holds.size;
  if (active) holds.add(reason);
  else holds.delete(reason);
  if (holds.size !== had) apply();
}

export type Cue = 'open' | 'click' | 'select' | 'tick' | 'whoosh';

/** Un sonido corto de interfaz, sintetizado. Silencioso si el sonido está apagado o con movimiento reducido. */
export function playCue(cue: Cue) {
  if (!isRunning() || !ctx || !master || reduced()) return;
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
    // un pulso grave: se llegó a otro edificio
    note(110, 0, 0.45, 0.04, 'sine');
    note(220, 0.02, 0.3, 0.012, 'triangle');
  } else if (cue === 'whoosh') {
    // el soplo del menú: ruido filtrado que sube y baja
    const len = Math.floor(ctx.sampleRate * 0.4);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(500, t0);
    bp.frequency.exponentialRampToValueAtTime(2200, t0 + 0.28);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.05, t0 + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
    src.connect(bp).connect(g).connect(master);
    src.start(t0);
  } else {
    note(1320, 0, 0.03, 0.012, 'square');
  }
}
