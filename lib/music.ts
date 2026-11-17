/**
 * Background music (design/2026/sonido.md): one track per zone (lib/zones.ts), faded in and out as the visitor moves
 * between areas. Runs on the site's audio bus (lib/sound.ts); nothing here makes a sound before the sound is on.
 * - A zone with a track file (public/media/music/pad-<zone>.mp3, known at build time: `available`) streams it through an
 *   <audio> element (no decoding of the whole track: iOS memory). It loops by cross-fading two elements of the same
 *   file, so the loop point never shows.
 * - A zone without a file (or when the file fails) gets a quiet synthesized pad in the same key (D minor), so the
 *   site sounds right before the Suno tracks exist and if a download fails.
 * Only one zone's voice plays at a time (plus the one fading out).
 */
import { SOUND_EVENT, getAudio, isRunning } from './sound';
import type { Zone } from './zones';

const FADE = 1.5; // s, between zones
const LOOP_XF = 2.5; // s, the overlap of a file's loop
const FILE_LEVEL = 0.55; // ≈ −29 dBFS RMS with the −20 LUFS tracks: under the interface cues (lib/sound.ts)

type Voice = { zone: Zone; kind: 'file' | 'synth'; gain: GainNode; dispose: () => void };

let available = new Set<Zone>();
let base = '';
let wanted: Zone | null = null;
let current: Voice | null = null;
let installed = false;

/** Synth fallback: [frequencies, filter cutoff] per zone — all in D minor, quiet. */
const CHORDS: Record<Zone, [number[], number]> = {
  inicio: [[73.42, 110, 146.83, 174.61], 900], // D2 A2 D3 F3
  work: [[73.42, 110, 130.81, 174.61, 220], 1100], // D2 A2 C3 F3 A3
  brand: [[116.54, 146.83, 174.61, 220], 1300], // Bb2 D3 F3 A3
  roadmap: [[98, 146.83, 233.08, 349.23], 1000], // G2 D3 Bb3 F4
  about: [[146.83, 174.61, 220, 261.63], 800], // D3 F3 A3 C4
};

function synthVoice(ctx: AudioContext, bus: GainNode, zone: Zone): Voice {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = CHORDS[zone][1];
  filter.Q.value = 0.4;
  filter.connect(gain).connect(bus);
  const nodes: AudioScheduledSourceNode[] = [];
  CHORDS[zone][0].forEach((f, i) => {
    for (const det of [-5, 5]) {
      const o = ctx.createOscillator();
      o.type = i % 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = det;
      const g = ctx.createGain();
      g.gain.value = 0.022;
      o.connect(g).connect(filter);
      o.start();
      nodes.push(o);
    }
  });
  // a slow breath on the filter: transform-free, it only moves the sound
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const depth = ctx.createGain();
  depth.gain.value = CHORDS[zone][1] * 0.35;
  lfo.connect(depth).connect(filter.frequency);
  lfo.start();
  nodes.push(lfo);
  return {
    zone,
    kind: 'synth',
    gain,
    dispose: () => {
      nodes.forEach((n) => { try { n.stop(); } catch { /* ya parado */ } });
      gain.disconnect();
      filter.disconnect();
    },
  };
}

function fileVoice(ctx: AudioContext, bus: GainNode, zone: Zone, onFail: () => void): Voice {
  const url = `${base}/media/music/pad-${zone}.mp3`;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(bus);
  type Deck = { el: HTMLAudioElement; g: GainNode };
  const decks: Deck[] = [0, 1].map(() => {
    const el = new Audio();
    el.preload = 'none';
    el.loop = false;
    const g = ctx.createGain();
    g.gain.value = 0;
    ctx.createMediaElementSource(el).connect(g).connect(gain);
    return { el, g };
  });
  let active = 0;
  let failed = false;
  let timer = 0;
  const fail = () => {
    if (failed) return;
    failed = true;
    onFail();
  };
  decks.forEach((d) => d.el.addEventListener('error', fail));
  const start = (i: number) => {
    const d = decks[i];
    const t = ctx.currentTime;
    d.g.gain.cancelScheduledValues(t);
    d.g.gain.setValueAtTime(0, t);
    d.g.gain.linearRampToValueAtTime(1, t + LOOP_XF);
    if (!d.el.src) d.el.src = url;
    d.el.currentTime = 0;
    void d.el.play().catch(() => {});
  };
  const stopDeck = (i: number) => {
    const d = decks[i];
    const t = ctx.currentTime;
    d.g.gain.cancelScheduledValues(t);
    d.g.gain.setValueAtTime(d.g.gain.value, t);
    d.g.gain.linearRampToValueAtTime(0, t + LOOP_XF);
    window.setTimeout(() => d.el.pause(), LOOP_XF * 1000 + 100);
  };
  start(0);
  timer = window.setInterval(() => {
    const d = decks[active];
    const left = d.el.duration - d.el.currentTime;
    if (Number.isFinite(left) && left > 0 && left < LOOP_XF + 0.3 && decks[1 - active].el.paused) {
      const next = 1 - active;
      start(next);
      stopDeck(active);
      active = next;
    }
  }, 250);
  return {
    zone,
    kind: 'file',
    gain,
    dispose: () => {
      window.clearInterval(timer);
      decks.forEach((d) => {
        d.el.pause();
        d.el.removeAttribute('src');
        d.el.load();
      });
      gain.disconnect();
    },
  };
}

function fadeOut(v: Voice, a: NonNullable<ReturnType<typeof getAudio>>, seconds = FADE) {
  const t = a.ctx.currentTime;
  v.gain.gain.cancelScheduledValues(t);
  v.gain.gain.setValueAtTime(v.gain.gain.value, t);
  v.gain.gain.linearRampToValueAtTime(0, t + seconds);
  window.setTimeout(() => v.dispose(), seconds * 1000 + 150);
}

function fadeIn(v: Voice, a: NonNullable<ReturnType<typeof getAudio>>) {
  const t = a.ctx.currentTime;
  v.gain.gain.setValueAtTime(0, t);
  v.gain.gain.linearRampToValueAtTime(v.kind === 'file' ? FILE_LEVEL : 1, t + FADE);
}

function sync() {
  const a = getAudio();
  if (!a) return;
  if (!isRunning() || !wanted) {
    // paused or off: the bus (lib/sound.ts) is already fading to silence; keep the voice for the way back
    if (!wanted && current) {
      fadeOut(current, a);
      current = null;
    }
    return;
  }
  if (current?.zone === wanted) return;
  const prev = current;
  const zone = wanted;
  const mk = (): Voice => {
    if (available.has(zone)) {
      const v: Voice = fileVoice(a.ctx, a.music, zone, () => {
        // the file failed: this zone gets the synth instead (once, without a fade: nothing was heard yet)
        if (current !== v) return;
        available.delete(zone);
        v.dispose();
        current = synthVoice(a.ctx, a.music, zone);
        fadeIn(current, a);
      });
      return v;
    }
    return synthVoice(a.ctx, a.music, zone);
  };
  current = mk();
  fadeIn(current, a);
  if (prev) fadeOut(prev, a);
}

/** Which zones have a track file (known at build time) and where the site is served from. Call once. */
export function configureMusic(zones: Zone[], basePath: string) {
  available = new Set(zones);
  base = basePath;
  if (installed) return;
  installed = true;
  window.addEventListener(SOUND_EVENT, sync);
  // QA / debugging: what plays and how loud (an analyser is only created when asked)
  let analyser: AnalyserNode | undefined;
  (window as unknown as { __igSound: unknown }).__igSound = {
    get zone() { return current?.zone ?? null; },
    get kind() { return current?.kind ?? null; },
    get wanted() { return wanted; },
    get running() { return isRunning(); },
    rms() {
      const a = getAudio();
      if (!a) return 0;
      if (!analyser) {
        analyser = a.ctx.createAnalyser();
        analyser.fftSize = 2048;
        a.master.connect(analyser);
      }
      const buf = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buf);
      return Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length);
    },
  };
}

/** The zone the visitor is in now. null: no music (the internal catalogue). */
export function setZone(zone: Zone | null) {
  if (zone === wanted) return;
  wanted = zone;
  sync();
}

export function currentZone() {
  return wanted;
}
