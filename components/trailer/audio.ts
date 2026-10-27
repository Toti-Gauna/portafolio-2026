import { buildScore, type ScoreEvent } from './score';

/**
 * Synthesised score (WebAudio, no files). Off by default: the AudioContext is only created when the
 * visitor turns sound on. Seeking or pausing never leaves notes behind (each "epoch" has its own gain).
 */
export class TrailerAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private epoch: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private cursor = 0;
  private events: ScoreEvent[] = buildScore();
  private on = false;
  private playing = false;

  constructor(private now: () => number) {}

  get enabled() { return this.on; }

  setEnabled(v: boolean) {
    this.on = v;
    if (v) {
      this.ensure();
      this.seek();
      if (this.playing) this.startTimer();
    } else {
      this.stopTimer();
      this.dropEpoch();
    }
  }

  play() { this.playing = true; if (this.on) { void this.ctx?.resume(); this.seek(); this.startTimer(); } }
  pause() { this.playing = false; this.stopTimer(); this.dropEpoch(); }
  seek() { this.cursor = this.now(); this.dropEpoch(); this.newEpoch(); }

  dispose() {
    this.stopTimer();
    this.playing = false;
    void this.ctx?.close();
    this.ctx = null; this.master = null; this.epoch = null;
  }

  private ensure() {
    if (this.ctx) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) { this.on = false; return; }
    this.ctx = new Ctor();
    const comp = this.ctx.createDynamicsCompressor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(comp).connect(this.ctx.destination);
    // seeded noise buffer: the same hiss every time
    const len = this.ctx.sampleRate * 2;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    let a = 12345;
    for (let i = 0; i < len; i++) { a = (a * 1664525 + 1013904223) >>> 0; d[i] = a / 2147483648 - 1; }
    this.newEpoch();
  }

  private newEpoch() {
    if (!this.ctx || !this.master) return;
    this.epoch = this.ctx.createGain();
    this.epoch.connect(this.master);
  }

  private dropEpoch() {
    if (!this.ctx || !this.epoch) return;
    const e = this.epoch, t = this.ctx.currentTime;
    e.gain.cancelScheduledValues(t);
    e.gain.setTargetAtTime(0, t, 0.03);
    setTimeout(() => e.disconnect(), 300);
    this.epoch = null;
  }

  private startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => this.tick(), 50);
  }
  private stopTimer() { if (this.timer) clearInterval(this.timer); this.timer = null; }

  private tick() {
    if (!this.ctx || !this.on) return;
    if (!this.epoch) this.newEpoch();
    const now = this.now(), horizon = now + 0.3;
    for (const ev of this.events) {
      if (ev.t < this.cursor) continue;
      if (ev.t >= horizon) break;
      this.voice(ev, this.ctx.currentTime + Math.max(0, ev.t - now));
    }
    this.cursor = horizon;
  }

  private env(g: GainNode, at: number, peak: number, attack: number, hold: number, release: number) {
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), at + attack);
    g.gain.setValueAtTime(Math.max(peak, 0.0002), at + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + release);
  }

  private tone(type: OscillatorType, f: number, at: number, dur: number, peak: number, attack = 0.005, filter?: number) {
    const c = this.ctx!, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, at);
    this.env(g, at, peak, attack, Math.max(0, dur - attack), 0.08);
    let node: AudioNode = o;
    if (filter) { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filter; o.connect(lp); node = lp; }
    node.connect(g).connect(this.epoch!);
    o.start(at); o.stop(at + dur + 0.2);
  }

  private hiss(at: number, dur: number, peak: number, type: BiquadFilterType, f0: number, f1?: number) {
    const c = this.ctx!, s = c.createBufferSource(), flt = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; flt.type = type; flt.frequency.setValueAtTime(f0, at);
    if (f1) flt.frequency.exponentialRampToValueAtTime(f1, at + dur);
    this.env(g, at, peak, Math.min(0.01, dur / 3), 0, dur);
    s.connect(flt).connect(g).connect(this.epoch!);
    s.start(at, 0, dur + 0.1);
  }

  private voice(ev: ScoreEvent, at: number) {
    const v = ev.v ?? 0.6;
    switch (ev.k) {
      case 'kick': {
        const c = this.ctx!, o = c.createOscillator(), g = c.createGain();
        o.frequency.setValueAtTime(150, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.12);
        this.env(g, at, 0.9 * v, 0.003, 0.03, 0.16);
        o.connect(g).connect(this.epoch!); o.start(at); o.stop(at + 0.3);
        break;
      }
      case 'thump': this.tone('sine', 52, at, 0.18, 0.7 * v, 0.01); break;
      case 'hat': this.hiss(at, 0.05, 0.22 * v, 'highpass', 7000); break;
      case 'click': this.hiss(at, 0.025, 0.28 * v, 'bandpass', 2600); break;
      case 'bass': this.tone('sawtooth', ev.f ?? 55, at, ev.d ?? 0.2, 0.34 * v, 0.008, 420); break;
      case 'blip': this.tone('triangle', ev.f ?? 440, at, ev.d ?? 0.2, 0.22 * v, 0.004); break;
      case 'pad': {
        const f = ev.f ?? 110, d = ev.d ?? 6;
        for (const det of [-6, 6]) {
          const c = this.ctx!, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
          o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
          lp.type = 'lowpass'; lp.frequency.value = 700;
          g.gain.setValueAtTime(0.0001, at);
          g.gain.exponentialRampToValueAtTime(0.11 * v, at + Math.min(2, d / 3));
          g.gain.setValueAtTime(0.11 * v, at + d - 1.2);
          g.gain.exponentialRampToValueAtTime(0.0001, at + d);
          o.connect(lp).connect(g).connect(this.epoch!); o.start(at); o.stop(at + d + 0.1);
        }
        break;
      }
      case 'whoosh': this.hiss(at, ev.d ?? 1.2, 0.3 * v, 'bandpass', 300, 5000); break;
      case 'swell': this.hiss(at, ev.d ?? 1.5, 0.35 * v, 'bandpass', 200, 6000); break;
      case 'hit': {
        this.hiss(at, 0.9, 0.55 * v, 'lowpass', 3000, 120);
        this.tone('sine', 44, at, 0.9, 0.9 * v, 0.005);
        break;
      }
    }
  }
}
