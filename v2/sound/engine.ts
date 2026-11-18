import { barDegree, chord, chordName, type NoteEvent, place, STYLES, type StyleId, swingBeat, type Voice, ZONES, type ZoneKey } from './compose';

/**
 * The sound of the generative music (lote 2.3): every voice is synthesised with Web Audio (oscillators,
 * filters, noise and a reverb generated in code), nothing is a recording. The engine plays bar after bar from
 * the composer (compose.ts), a third of a second ahead; a change of page or style waits for the next bar.
 * It runs only while it plays: stop() fades out, cuts the session and clears its timer.
 * Works on an AudioContext (the site) and on an OfflineAudioContext (renders for tests and samples).
 */

export type BarInfo = { bar: number; style: StyleId; zone: ZoneKey; chord: string };

const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);
/** How much of each voice goes to the reverb. */
const SEND: Record<Voice, number> = { pad: 0.55, pluck: 0.6, arp: 0.28, keys: 0.25, lead: 0.35, bass: 0, kick: 0.04, hat: 0.08, brush: 0.12, shaker: 0.15, swell: 0.5, chime: 0.85 };
/** Per style: how wet the room is, and the echo of the arpeggio. */
const ROOM: Record<StyleId, { verb: number; delay: number; level: number }> = { marea: { verb: 0.9, delay: 0, level: 0.82 }, circuito: { verb: 0.45, delay: 0.22, level: 1.3 }, taller: { verb: 0.35, delay: 0, level: 1.05 } };
/** Background music: about -22 dBFS RMS, peaks well under -10 (measured offline, tests/e2e/v2-sound.spec.ts). */
const MASTER = 0.24;

export type Sfx = 'open' | 'stop' | 'grab' | 'thud' | 'night' | 'day' | 'horn';
const i5 = (n: number, len: number) => n % len;

export class MusicEngine {
  readonly ctx: BaseAudioContext;
  style: StyleId;
  zone: ZoneKey;
  onBar?: (info: BarInfo) => void;
  private bus: GainNode;
  private level: GainNode;
  private verbIn: GainNode;
  private verbOut: GainNode;
  private delayIn: GainNode;
  private delay: DelayNode;
  private noise: AudioBuffer;
  private session: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | undefined;
  private bar = 0;
  private nextBar = 0;
  private pending: { style?: StyleId; zone?: ZoneKey } = {};

  constructor(ctx: BaseAudioContext, out: AudioNode = ctx.destination, style: StyleId = 'marea', zone: ZoneKey = 'home') {
    this.ctx = ctx;
    this.style = style;
    this.zone = zone;
    const master = ctx.createGain();
    master.gain.value = MASTER;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    master.connect(comp).connect(out);
    this.bus = ctx.createGain();
    this.bus.connect(master);
    this.level = master;
    // a room generated in code: two channels of noise that fade out over 2.8 s
    const verb = ctx.createConvolver();
    verb.buffer = this.impulse(2.8);
    this.verbIn = ctx.createGain();
    this.verbOut = ctx.createGain();
    this.verbIn.connect(verb).connect(this.verbOut).connect(master);
    // an eighth-note echo, for the arpeggio of «Circuito»
    const delay = ctx.createDelay(1);
    const fb = ctx.createGain();
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 2400;
    fb.gain.value = 0.32;
    this.delayIn = ctx.createGain();
    this.delayIn.connect(delay).connect(tone).connect(fb).connect(delay);
    tone.connect(master);
    this.delay = delay;
    this.noise = this.whiteNoise(2);
    this.applyRoom(true);
  }

  get playing() { return Boolean(this.session); }

  /** Changes take effect on the next bar, so the music never breaks mid-phrase. */
  setStyle(style: StyleId) { if (style !== this.style || this.pending.style) this.pending.style = style; }
  setZone(zone: ZoneKey) { if (zone !== this.zone || this.pending.zone) this.pending.zone = zone; }

  start(fade = 0.8) {
    if (this.session) return;
    const t = this.ctx.currentTime;
    const s = this.ctx.createGain();
    s.gain.setValueAtTime(0, t);
    s.gain.linearRampToValueAtTime(1, t + fade);
    s.connect(this.bus);
    this.session = s;
    this.nextBar = t + 0.08;
    this.tick();
    this.timer = setInterval(() => this.tick(), 60);
  }

  stop(fade = 0.6) {
    const s = this.session;
    if (!s) return;
    this.session = null;
    clearInterval(this.timer);
    this.timer = undefined;
    const t = this.ctx.currentTime;
    s.gain.cancelScheduledValues(t);
    s.gain.setValueAtTime(s.gain.value, t);
    s.gain.linearRampToValueAtTime(0, t + fade);
    // notes already scheduled for later bars die with their session
    setTimeout(() => s.disconnect(), (fade + 0.1) * 1000);
  }

  /** A short, bright chord on the tonic of the page: the gate opening (lote 3.1). It sounds on its own, with or without the music. */
  accent() {
    const z = ZONES[this.zone];
    const t = this.ctx.currentTime + 0.03;
    const tones = [...chord(z, 0, false), 12];
    tones.forEach((semis, i) => this.play({ voice: 'chime', beat: 0, dur: 4, midi: place(z, semis, 72 + (i === 3 ? 12 : 0), 84 + (i === 3 ? 12 : 0)), vel: 0.34 }, t + i * 0.075, 0.5, this.bus, z.bright));
  }

  /**
   * Small sounds of the world of Work (lote 4.3), in the key of the page so they sit inside the music: a place
   * opening, a stop reached, a crate picked up or hitting the ground (`power` 0…1), dusk and dawn, the car.
   * Each sounds on its own, with or without the music playing.
   */
  sfx(kind: Sfx, power = 1) {
    const z = ZONES[this.zone], t = this.ctx.currentTime + 0.02, k = Math.max(0.15, Math.min(1, power));
    const note = (voice: NoteEvent['voice'], semis: number, lo: number, at: number, dur: number, vel: number) =>
      this.play({ voice, beat: 0, dur, midi: place(z, semis, lo, lo + 12), vel }, t + at, 0.5, this.bus, z.bright);
    const tones = chord(z, 0, false);
    switch (kind) {
      case 'open': [tones[0], tones[2], tones[1] + 12].forEach((s2, i) => note('chime', s2, 72, i * 0.07, 3, 0.3)); break;
      case 'stop': note('pluck', tones[i5(this.sfxN++, tones.length)], 67, 0, 1.2, 0.34); break;
      case 'grab': note('pluck', tones[2], 79, 0, 0.6, 0.3); note('pluck', tones[0] + 12, 79, 0.06, 0.6, 0.24); break;
      case 'thud': this.play({ voice: 'kick', beat: 0, dur: 0.4, midi: 38, vel: 0.5 * k }, t, 0.5, this.bus, 0); if (k > 0.5) note('pluck', tones[0], 55, 0, 0.5, 0.2 * k); break;
      case 'night': [tones[2], tones[1], tones[0]].forEach((s2, i) => note('chime', s2, 67, i * 0.16, 4, 0.26)); this.play({ voice: 'swell', beat: 0, dur: 2.2, midi: 60, vel: 0.3 }, t, 0.5, this.bus, 0); break;
      case 'day': [tones[0], tones[1], tones[2], tones[0] + 12].forEach((s2, i) => note('chime', s2, 72, i * 0.11, 3, 0.26)); break;
      case 'horn': note('keys', tones[0], 60, 0, 0.5, 0.42); note('keys', tones[2], 60, 0, 0.5, 0.36); break;
    }
  }
  private sfxN = 0;

  /** Offline: lays down `seconds` of music from now (for an OfflineAudioContext); with a tour, the page changes every `barsEach` bars. */
  renderAhead(seconds: number, tour: ZoneKey[] = [], barsEach = 4) {
    const s = this.ctx.createGain();
    s.connect(this.bus);
    this.session = s;
    this.nextBar = 0.05;
    let n = 0;
    while (this.nextBar < seconds) {
      if (tour.length && n % barsEach === 0) this.setZone(tour[Math.floor(n / barsEach) % tour.length]);
      this.scheduleBar(s);
      n += 1;
    }
    this.session = null;
  }

  private tick() {
    const s = this.session;
    if (!s) return;
    while (this.nextBar < this.ctx.currentTime + 0.35) this.scheduleBar(s);
  }

  private scheduleBar(dest: GainNode) {
    if (this.pending.style) { this.style = this.pending.style; this.applyRoom(); }
    const zoneChanged = this.pending.zone !== undefined && this.pending.zone !== this.zone;
    if (this.pending.zone) this.zone = this.pending.zone;
    this.pending = {};
    const style = STYLES[this.style];
    const zone = ZONES[this.zone];
    const beat = 60 / style.bpm;
    const t0 = this.nextBar;
    const events = style.compose(this.bar, zone);
    // a new page is greeted by a bell on the root of its first chord
    if (zoneChanged) events.push({ voice: 'chime', beat: 0, dur: 4, midi: zone.root + 48, vel: 0.14 });
    for (const ev of events) this.play(ev, t0 + swingBeat(ev.beat, style.swing) * beat, beat, dest, zone.bright);
    const info: BarInfo = { bar: this.bar, style: this.style, zone: this.zone, chord: chordName(zone, barDegree(zone, this.bar)) };
    if (this.onBar && 'close' in this.ctx) {
      const wait = Math.max(0, (t0 - this.ctx.currentTime) * 1000);
      setTimeout(() => this.onBar?.(info), wait);
    }
    this.bar += 1;
    this.nextBar = t0 + 4 * beat;
  }

  private applyRoom(now = false) {
    const r = ROOM[this.style];
    const t = this.ctx.currentTime;
    const set = (p: AudioParam, v: number, tau: number) => (now ? p.setValueAtTime(v, t) : p.setTargetAtTime(v, t, tau));
    set(this.verbOut.gain, r.verb, 0.4);
    set(this.level.gain, MASTER * r.level, 0.3);
    set(this.delayIn.gain, r.delay, 0.1);
    this.delay.delayTime.setValueAtTime(30 / STYLES[this.style].bpm, t);
  }

  /* ── voices ──────────────────────────────────────────────────────────── */

  private out(dest: AudioNode, voice: Voice, pan = 0) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    let tail: AudioNode = g;
    if (pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); tail = p; }
    tail.connect(dest);
    if (SEND[voice]) { const s = ctx.createGain(); s.gain.value = SEND[voice]; tail.connect(s).connect(this.verbIn); }
    if (voice === 'arp') tail.connect(this.delayIn);
    return g;
  }

  private osc(type: OscillatorType, freq: number, t: number, end: number, dest: AudioNode, detune = 0) {
    const o = this.ctx.createOscillator();
    o.type = type; o.frequency.value = freq; o.detune.value = detune;
    o.connect(dest); o.start(t); o.stop(end);
    return o;
  }

  private noiseSrc(t: number, end: number, dest: AudioNode) {
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise; n.loop = true;
    n.connect(dest); n.start(t, Math.random() * 1.5); n.stop(end);
    return n;
  }

  private filter(type: BiquadFilterType, freq: number, q = 0.7) {
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    return f;
  }

  private play(ev: NoteEvent, t: number, beat: number, dest: AudioNode, bright: number) {
    const dur = ev.dur * beat;
    const f = mtof(ev.midi);
    const v = ev.vel;
    switch (ev.voice) {
      case 'pad': {
        const g = this.out(dest, 'pad');
        const lp = this.filter('lowpass', 650 + bright * 1300, 0.4);
        lp.connect(g);
        const end = t + dur + 2.4;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v * 0.075, t + 1.2);
        g.gain.setValueAtTime(v * 0.075, t + dur);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        this.osc('sawtooth', f, t, end, lp, -7);
        this.osc('sawtooth', f, t, end, lp, 7);
        this.osc('sine', f / 2, t, end, lp);
        break;
      }
      case 'pluck': {
        const g = this.out(dest, 'pluck', (ev.midi % 7) / 7 - 0.43);
        const lp = this.filter('lowpass', 1800 + bright * 2200);
        lp.connect(g);
        const end = t + 1.6;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v * 0.22, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        this.osc('triangle', f, t, end, lp);
        const h = this.ctx.createGain(); h.gain.value = 0.3; h.connect(lp);
        this.osc('sine', f * 2, t, end, h);
        break;
      }
      case 'arp': {
        const g = this.out(dest, 'arp', ev.midi % 2 ? 0.35 : -0.35);
        const lp = this.filter('lowpass', 500, 4);
        lp.connect(g);
        const end = t + dur + 0.2;
        lp.frequency.setValueAtTime(900 + bright * 2600, t);
        lp.frequency.exponentialRampToValueAtTime(420, t + 0.2);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v * 0.11, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        this.osc('square', f, t, end, lp);
        break;
      }
      case 'keys': {
        // an electric piano by FM: a sine pushed by another sine whose depth fades, plus a short metallic tine
        const g = this.out(dest, 'keys', (ev.midi % 5) / 10 - 0.2);
        const end = t + dur + 0.5;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v * 0.13, t + 0.006);
        g.gain.exponentialRampToValueAtTime(v * 0.04, t + dur);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        const car = this.osc('sine', f, t, end, g);
        const m1 = this.ctx.createGain();
        m1.gain.setValueAtTime(f * 2.2, t);
        m1.gain.exponentialRampToValueAtTime(f * 0.25, t + 0.9);
        m1.connect(car.frequency);
        this.osc('sine', f, t, end, m1);
        const m2 = this.ctx.createGain();
        m2.gain.setValueAtTime(f * 0.7, t);
        m2.gain.exponentialRampToValueAtTime(1, t + 0.06);
        m2.connect(car.frequency);
        this.osc('sine', f * 14, t, t + 0.1, m2);
        break;
      }
      case 'lead': {
        const g = this.out(dest, 'lead', 0.15);
        const end = t + dur + 0.3;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v * 0.12, t + 0.02);
        g.gain.setValueAtTime(v * 0.12, t + dur);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        const o = this.osc('sine', f, t, end, g);
        const tri = this.ctx.createGain(); tri.gain.value = 0.35; tri.connect(g);
        this.osc('triangle', f, t, end, tri);
        const lfo = this.ctx.createGain(); lfo.gain.setValueAtTime(0, t); lfo.gain.linearRampToValueAtTime(5, t + 0.25); lfo.connect(o.detune);
        this.osc('sine', 5.2, t, end, lfo);
        break;
      }
      case 'bass': {
        const g = this.out(dest, 'bass');
        const lp = this.filter('lowpass', this.style === 'circuito' ? 380 : 520);
        lp.connect(g);
        const end = t + dur + 0.15;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v * 0.34, t + 0.012);
        g.gain.setValueAtTime(v * 0.3, t + dur);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        this.osc(this.style === 'circuito' ? 'sawtooth' : 'triangle', f, t, end, lp);
        this.osc('sine', f, t, end, lp);
        break;
      }
      case 'kick': {
        const g = this.out(dest, 'kick');
        const o = this.osc('sine', 110, t, t + 0.35, g);
        o.frequency.setValueAtTime(110, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
        g.gain.setValueAtTime(v * 0.6, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        break;
      }
      case 'hat':
      case 'shaker':
      case 'brush': {
        const spec = { hat: { type: 'highpass', freq: 7200, q: 0.7, a: 0.002, d: 0.05, peak: 0.24 }, shaker: { type: 'bandpass', freq: 5400, q: 1.2, a: 0.012, d: 0.09, peak: 0.3 }, brush: { type: 'bandpass', freq: 2600, q: 0.7, a: 0.015, d: 0.22, peak: 0.22 } }[ev.voice];
        const g = this.out(dest, ev.voice, ev.voice === 'hat' ? 0.25 : -0.2);
        const fl = this.filter(spec.type as BiquadFilterType, spec.freq, spec.q);
        fl.connect(g);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v * spec.peak, t + spec.a);
        g.gain.exponentialRampToValueAtTime(0.0001, t + spec.a + spec.d);
        this.noiseSrc(t, t + spec.a + spec.d + 0.02, fl);
        break;
      }
      case 'swell': {
        // the sea: noise through a filter that opens and closes over two bars
        const g = this.out(dest, 'swell');
        const lp = this.filter('lowpass', 300, 0.5);
        lp.connect(g);
        lp.frequency.setValueAtTime(260, t);
        lp.frequency.linearRampToValueAtTime(900 + bright * 600, t + dur * 0.45);
        lp.frequency.linearRampToValueAtTime(260, t + dur);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v * 0.14, t + dur * 0.45);
        g.gain.linearRampToValueAtTime(0, t + dur);
        this.noiseSrc(t, t + dur + 0.05, lp);
        break;
      }
      case 'chime': {
        const g = this.out(dest, 'chime', 0.3);
        const end = t + 3.2;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v * 0.16, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        this.osc('sine', f, t, end, g);
        const p = this.ctx.createGain(); p.gain.value = 0.28; p.connect(g);
        this.osc('sine', f * 2.76, t, t + 1.2, p);
        break;
      }
    }
  }

  /* ── buffers made in code ────────────────────────────────────────────── */

  private whiteNoise(seconds: number) {
    const b = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * seconds), this.ctx.sampleRate);
    const d = b.getChannelData(0);
    let s = 7;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
    return b;
  }

  private impulse(seconds: number) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const b = this.ctx.createBuffer(2, len, rate);
    let s = 11;
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        s = (s * 48271) % 2147483647;
        const x = (s / 2147483647) * 2 - 1;
        lp += (x - lp) * (0.35 - 0.25 * (i / len)); // darker as it fades, like a real room
        d[i] = lp * Math.exp(-i / (rate * 0.62));
      }
    }
    return b;
  }
}

/** Renders `seconds` of a style and a page to an AudioBuffer (samples for Ignacio, level checks in tests). */
export async function renderMusic(style: StyleId, zone: ZoneKey | ZoneKey[], seconds: number, sampleRate = 44100): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, Math.ceil(sampleRate * seconds), sampleRate);
  const tour = Array.isArray(zone) ? zone : [];
  const e = new MusicEngine(ctx, ctx.destination, style, tour[0] ?? (zone as ZoneKey));
  e.renderAhead(seconds - 2.5, tour);
  return ctx.startRendering();
}
