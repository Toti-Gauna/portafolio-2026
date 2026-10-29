/* KINETIC — the score.
   Every sound is synthesized live with the Web Audio API: no audio files.
   Each voice is fire-and-forget and is triggered from the master GSAP timeline.
   SFX.render() plays the same score into an OfflineAudioContext (faster than real time) for
   exports: every voice reads its start time from now(), which is the event's time offline.

   KIT — lo que cambia esta copia:
   - SFX.play(atraso, voz, args): el timeline llama a cada voz por acá (D.sfx en js/engine.js). En vivo pone el
     reloj de la voz (vt) en ctx.currentTime + ADELANTO (0,03 s) − atraso, nunca antes de ctx.currentTime: el
     atraso del ticker (0–17 ms, distinto en cada nota) se descuenta y todas las notas quedan corridas lo mismo,
     30 ms (como la latencia de salida: no se nota contra la imagen). Offline render() ya puso vt en el tiempo del
     evento y play() llama a la voz tal cual: el render no cambia.
   - pad() guarda { g, oscs, t0, fade, v } y padStop() calcula el nivel del pad en su tiempo (el ataque es
     exponencial: 0,0001 · (v / 0,0001)^k, k = (t − t0) / fade) y lo apaga desde ahí. Antes usaba
     cancelAndHoldAtTime, que en Chromium no deja un punto de espera si el ataque ya terminó: la rampa de salida
     arrancaba desde el fin del ataque y el pad se cortaba de golpe (~ −36 dB) en t. Si el ataque sigue en
     curso, se reprograma el mismo ataque cortado en t (sin saltos, sin cancelAndHold: funciona igual offline,
     donde las voces se programan hasta 0,25 s antes, y en navegadores sin cancelAndHoldAtTime).
   - stopAll() corta también los pads programados con adelanto que todavía no arrancaron.

   CONOCER A IGNACIO — lo que agrega esta copia (marcado "IG"):
   - init() usa el AudioContext que le pasa la página que lo contiene (window.parent.__igTrailerAudio, creado y
     reanudado en el clic que abre el tráiler: el clic cuenta como gesto del usuario aunque el iframe cargue después).
   - cinco voces nuevas: pluck (lead cálido: dos sierras desafinadas + cuadrada una octava abajo, filtro que se cierra),
     keys (piano eléctrico FM 1:1 con "tine"), sub (seno limpio bajo el bajo), snare (cuerpo + ruido brillante) y
     duck (sidechain: baja el bus de los pads y lo recupera; todos los SFX.pad pasan por ese bus, padIn).
   - render() guarda y restaura padIn como el resto del bus. */
window.SFX = (() => {
  const VOL = 0.85;
  /** en vivo, cuánto antes de sonar se programa cada voz (s): cubre el atraso del ticker */
  const ADELANTO = 0.03;
  let ctx = null, out, verb, noiseBuf, muted = false, analyser = null, padIn = null; // IG: padIn = bus de los pads (duck)
  let vt = null, offline = false, seed = 1;
  const pads = new Map();

  const ok = () => ctx && (offline || ctx.state === 'running');
  /** when a voice starts: the audio clock live, the event's own time when rendering offline */
  const now = () => (vt != null ? vt : ctx.currentTime);
  /** Math.random live; seeded offline, so an exported soundtrack is the same on every run (to within
   *  1 bit in ~0.01 % of the samples: float rounding, -90 dBFS) */
  const rnd = () => {
    if (!offline) return Math.random();
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  function init() {
    if (ctx) return ctx.resume();
    // IG: the portfolio creates (and resumes) the context inside the click that opens the trailer and lends it to
    // this frame (same origin). Without it, a context of our own (needs a gesture in this frame to start).
    let shared = null;
    try { shared = window.parent !== window ? window.parent.__igTrailerAudio || null : null; } catch (e) { shared = null; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!shared && !AC) return Promise.resolve();
    build(shared || new AC(), muted ? 0 : VOL);
    return ctx.resume();
  }

  /** the mix bus on context `c`: compressor, analyser tap, hall reverb, noise buffer */
  function build(c, vol) {
    ctx = c;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 5;
    comp.attack.value = 0.003; comp.release.value = 0.25;
    out = ctx.createGain();
    out.gain.value = vol;
    out.connect(comp).connect(ctx.destination);
    // a side tap for visualisers (recipes-beat.js): the real mixed output, not part of the signal path
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.72;
    comp.connect(analyser);

    // Shared hall reverb
    const conv = ctx.createConvolver();
    conv.buffer = impulse(3.4, 3);
    verb = ctx.createGain();
    const wet = ctx.createGain(); wet.gain.value = 0.32;
    verb.connect(conv).connect(wet).connect(out);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1;

    // IG: every pad goes through padIn (dry + 0.6 to the hall, as bus(0.6) did) so duck() can pump them
    padIn = ctx.createGain();
    padIn.gain.value = 1;
    padIn.connect(out);
    const padWet = ctx.createGain();
    padWet.gain.value = 0.6;
    padIn.connect(padWet);
    padWet.connect(verb);
  }

  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  // ---- building blocks ----
  function bus(wet = 0, pan = 0) {
    const g = ctx.createGain();
    g.gain.value = 0;
    let node = g;
    if (pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p);
      node = p;
    }
    node.connect(out);
    if (wet) {
      const s = ctx.createGain();
      s.gain.value = wet;
      node.connect(s);
      s.connect(verb);
    }
    return g;
  }
  function env(param, t, peak, a, d) {
    param.setValueAtTime(0.0001, t);
    param.exponentialRampToValueAtTime(peak, t + a);
    param.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function osc(type, freq, t, end, dest) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.connect(dest);
    o.start(t);
    o.stop(end);
    return o;
  }
  function noise(t, end, dest) {
    const n = ctx.createBufferSource();
    n.buffer = noiseBuf;
    n.loop = true;
    n.connect(dest);
    n.start(t, rnd() * 1.5);
    n.stop(end);
    return n;
  }
  function filter(type, freq, q = 0.7) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, now());
    f.Q.value = q;
    return f;
  }
  function shaper(k) {
    const n = 1024, c = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      c[i] = Math.tanh(k * x) / Math.tanh(k);
    }
    const s = ctx.createWaveShaper();
    s.curve = c;
    return s;
  }

  // ---- voices ----
  function kick(v = 1) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.04);
    env(g.gain, t, v, 0.003, 0.42);
    osc('sine', 165, t, t + 0.5, g).frequency.exponentialRampToValueAtTime(44, t + 0.13);
    const c = bus();
    env(c.gain, t, v * 0.22, 0.001, 0.03);
    osc('triangle', 1400, t, t + 0.05, c);
  }

  function hat(v = 0.2) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.05, (rnd() - 0.5) * 0.6);
    env(g.gain, t, v, 0.001, 0.05);
    const f = filter('highpass', 7500);
    f.connect(g);
    noise(t, t + 0.08, f);
  }

  function clap(v = 0.45) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.25);
    g.gain.setValueAtTime(0.0001, t);
    [0, 0.011, 0.022].forEach(o => {
      g.gain.setValueAtTime(v, t + o);
      g.gain.exponentialRampToValueAtTime(v * 0.25, t + o + 0.009);
    });
    g.gain.setValueAtTime(v, t + 0.033);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    const f = filter('bandpass', 1400, 0.9);
    f.connect(g);
    noise(t, t + 0.26, f);
  }

  function boom(v = 1) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.35);
    env(g.gain, t, v, 0.005, 2.4);
    osc('sine', 120, t, t + 2.6, g).frequency.exponentialRampToValueAtTime(30, t + 1.4);
    const n = bus(0.4);
    env(n.gain, t, v * 0.5, 0.002, 0.5);
    const f = filter('lowpass', 900);
    f.frequency.exponentialRampToValueAtTime(70, t + 0.5);
    f.connect(n);
    noise(t, t + 0.6, f);
  }

  // FM bell — glassy, reverberant
  function bell(freq = 440, v = 0.2, len = 1.3) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.55, (rnd() - 0.5) * 0.8);
    env(g.gain, t, v, 0.004, len);
    const car = osc('sine', freq, t, t + len + 0.1, g);
    const mg = ctx.createGain();
    mg.gain.setValueAtTime(freq * 2.2, t);
    mg.gain.exponentialRampToValueAtTime(1, t + len);
    mg.connect(car.frequency);
    osc('sine', freq * 3.5, t, t + len + 0.1, mg);
  }

  function bass(freq = 55, v = 0.32) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.04);
    env(g.gain, t, v, 0.004, 0.22);
    const f = filter('lowpass', 2400, 7);
    f.frequency.exponentialRampToValueAtTime(130, t + 0.2);
    f.connect(g);
    osc('sawtooth', freq, t, t + 0.3, f);
    osc('sine', freq, t, t + 0.3, g);
  }

  function whoosh(dur = 0.9, v = 0.5) {
    if (!ok()) return;
    const t = now(), pk = t + dur * 0.6;
    const g = bus(0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, pk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const f = filter('bandpass', 250, 1.1);
    f.frequency.exponentialRampToValueAtTime(3200, pk);
    f.frequency.exponentialRampToValueAtTime(400, t + dur);
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(-0.8, t);
      p.pan.linearRampToValueAtTime(0.8, t + dur);
      f.connect(p).connect(g);
    } else f.connect(g);
    noise(t, t + dur + 0.05, f);
  }

  function riser(dur = 2, v = 0.45) {
    if (!ok()) return;
    const t = now(), e = t + dur;
    const g = bus(0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, e);
    g.gain.setValueAtTime(0.0001, e + 0.02);
    const bp = filter('bandpass', 300, 1.4);
    bp.frequency.exponentialRampToValueAtTime(9000, e);
    bp.connect(g);
    noise(t, e + 0.03, bp);

    const tg = bus(0.3);
    tg.gain.setValueAtTime(0.0001, t);
    tg.gain.exponentialRampToValueAtTime(v * 0.16, e);
    tg.gain.setValueAtTime(0.0001, e + 0.02);
    const lp = filter('lowpass', 3000);
    lp.connect(tg);
    osc('sawtooth', 110, t, e + 0.03, lp).frequency.exponentialRampToValueAtTime(880, e);
    osc('sawtooth', 111.3, t, e + 0.03, lp).frequency.exponentialRampToValueAtTime(885, e);
  }

  // The trailer "BRAAAM"
  function braam(v = 0.85) {
    if (!ok()) return;
    const t = now(), e = t + 4.8;
    const g = bus(0.45);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.05);
    g.gain.exponentialRampToValueAtTime(v * 0.45, t + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, e);
    const sh = shaper(6);
    sh.connect(g);
    const lp = filter('lowpass', 150, 4);
    lp.frequency.exponentialRampToValueAtTime(1600, t + 0.12);
    lp.frequency.exponentialRampToValueAtTime(170, t + 3.6);
    lp.connect(sh);
    const pre = ctx.createGain();
    pre.gain.value = 0.35;
    pre.connect(lp);
    [43.65, 43.9, 65.4, 87.3, 87.9, 130.8].forEach(f => osc('sawtooth', f, t, e, pre));
  }

  function crash(v = 0.3) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.5);
    env(g.gain, t, v, 0.002, 2.6);
    const f = filter('highpass', 3800);
    f.connect(g);
    noise(t, t + 2.7, f);
  }

  // Paper fold / pop-up: a crisp crackle of noise plus a soft cardboard thump
  function fold(v = 0.25) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.2, (rnd() - 0.5) * 0.7);
    env(g.gain, t, v, 0.002, 0.09);
    const f = filter('bandpass', 1800 + rnd() * 1400, 0.9);
    f.frequency.exponentialRampToValueAtTime(700, t + 0.09);
    f.connect(g);
    noise(t, t + 0.12, f);
    const th = bus(0.1);
    env(th.gain, t, v * 0.9, 0.003, 0.12);
    osc('sine', 150, t, t + 0.16, th).frequency.exponentialRampToValueAtTime(70, t + 0.12);
  }

  // A flock's wings: band-passed noise amplitude-modulated at wingbeat rate
  function flutter(dur = 1.5, v = 0.18) {
    if (!ok()) return;
    const t = now(), e = t + dur;
    const g = bus(0.3, (rnd() - 0.5) * 0.8);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, e);
    const am = ctx.createGain();
    am.gain.value = 0.5;
    am.connect(g);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 14 + rnd() * 6;
    const lg = ctx.createGain();
    lg.gain.value = 0.5;
    lfo.connect(lg).connect(am.gain);
    lfo.start(t);
    lfo.stop(e + 0.05);
    const f = filter('bandpass', 1100, 0.7);
    f.connect(am);
    noise(t, e + 0.05, f);
  }

  // A raptor's cry: a high falling glide with vibrato
  function cry(v = 0.12) {
    if (!ok()) return;
    const t = now(), e = t + 0.7;
    const g = bus(0.6, 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, e);
    const f = filter('bandpass', 2400, 3);
    f.connect(g);
    const o = osc('sawtooth', 2600, t, e + 0.05, f);
    o.frequency.exponentialRampToValueAtTime(1500, e);
    const vib = ctx.createOscillator();
    vib.frequency.value = 28;
    const vg = ctx.createGain();
    vg.gain.value = 70;
    vib.connect(vg).connect(o.frequency);
    vib.start(t);
    vib.stop(e + 0.05);
  }

  // Water drop: a sine that glides up fast (the "plip" of a drop hitting water)
  function plip(v = 0.3, f0 = 520) {
    if (!ok()) return;
    const t = now(), f = f0 * (0.85 + rnd() * 0.3);
    const g = bus(0.55, (rnd() - 0.5) * 0.6);
    env(g.gain, t, v, 0.002, 0.13);
    osc('sine', f, t, t + 0.18, g).frequency.exponentialRampToValueAtTime(f * 3.2, t + 0.07);
  }

  // A burst of n rising bubbles
  function bubbles(n = 6, v = 0.1) {
    if (!ok()) return;
    const t0 = now();
    for (let k = 0; k < n; k++) {
      const t = t0 + k * 0.055 + rnd() * 0.03, f = 700 + rnd() * 900;
      const g = bus(0.5, (rnd() - 0.5) * 0.9);
      env(g.gain, t, v * (0.5 + rnd() * 0.5), 0.002, 0.06);
      osc('sine', f, t, t + 0.09, g).frequency.exponentialRampToValueAtTime(f * 1.9, t + 0.05);
    }
  }

  // Ocean swell: low-passed noise that rises and falls across the stereo field
  function swell(dur = 3, v = 0.22) {
    if (!ok()) return;
    const t = now(), pk = t + dur * 0.55;
    const g = bus(0.4);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, pk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const f = filter('lowpass', 300, 0.9);
    f.frequency.exponentialRampToValueAtTime(1400, pk);
    f.frequency.exponentialRampToValueAtTime(250, t + dur);
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(0.6, t);
      p.pan.linearRampToValueAtTime(-0.6, t + dur);
      f.connect(p).connect(g);
    } else f.connect(g);
    noise(t, t + dur + 0.05, f);
  }

  // Digital glitch: bit-crushed noise plus a stuttering square-wave "data chirp"
  function glitch(dur = 0.3, v = 0.35) {
    if (!ok()) return;
    const t = now(), e = t + Math.max(0.06, dur);
    const g = bus(0.08, (rnd() - 0.5) * 0.8);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.005);
    g.gain.setValueAtTime(v, e - 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, e);
    const sh = shaper(24);
    sh.connect(g);
    const bp = filter('bandpass', 1800, 0.8);
    bp.connect(sh);
    noise(t, e, bp);
    const sq = ctx.createGain();
    sq.gain.value = 0.35;
    sq.connect(sh);
    const o = osc('square', 200, t, e, sq);
    for (let k = 0; k * 0.03 < e - t; k++) {
      o.frequency.setValueAtTime(80 + rnd() * 2400, t + k * 0.03);
      bp.frequency.setValueAtTime(400 + rnd() * 5000, t + k * 0.03);
    }
  }

  // Test-card tone
  function beep(freq = 1000, dur = 0.5, v = 0.1) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.05);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.01);
    g.gain.setValueAtTime(v, t + dur - 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc('sine', freq, t, t + dur + 0.05, g);
  }

  // CRT power-off: a falling sine zap with a click
  function zap(v = 0.4) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.3);
    env(g.gain, t, v, 0.003, 0.5);
    osc('sine', 1400, t, t + 0.55, g).frequency.exponentialRampToValueAtTime(50, t + 0.35);
    const c = bus();
    env(c.gain, t, v * 0.5, 0.001, 0.03);
    osc('square', 3000, t, t + 0.05, c);
  }

  // Sustained TV static (stop it with padStop(id))
  function hiss(id = 'hiss', v = 0.06, fade = 0.05) {
    if (!ok()) return;
    padStop(id, 0.02);
    const t = now();
    const g = bus(0.2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + fade);
    const f = filter('highpass', 1200);
    f.connect(g);
    const n = ctx.createBufferSource();
    n.buffer = noiseBuf;
    n.loop = true;
    n.connect(f);
    n.start(t);
    pads.set(id, { g, oscs: [n], t0: t, fade, v });
  }

  // Typewriter key: a papery click plus a small body thump
  function key(v = 0.16) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.08, (rnd() - 0.5) * 0.5);
    env(g.gain, t, v, 0.001, 0.04);
    const f = filter('bandpass', 2600 + rnd() * 1200, 1.2);
    f.connect(g);
    noise(t, t + 0.06, f);
    const th = bus(0.05);
    env(th.gain, t, v * 0.6, 0.002, 0.05);
    osc('sine', 190 + rnd() * 40, t, t + 0.07, th);
  }

  function tick(v = 0.05) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.1, (rnd() - 0.5));
    env(g.gain, t, v, 0.001, 0.02);
    osc('square', 2600 + rnd() * 900, t, t + 0.04, g);
  }

  // Sustained detuned-saw pads (drones / chords)
  function pad(id, freqs, fade = 2, v = 0.08, cut = 700) {
    if (!ok()) return;
    padStop(id, 0.05);
    const t = now();
    const g = ctx.createGain(); // IG: into the pad bus (was bus(0.6)); duck() pumps it
    g.gain.value = 0;
    g.connect(padIn);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + fade);
    const lp = filter('lowpass', cut, 1.2);
    lp.connect(g);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lg = ctx.createGain();
    lg.gain.value = cut * 0.4;
    lfo.connect(lg).connect(lp.frequency);
    lfo.start(t);
    const oscs = [lfo];
    freqs.forEach(f => [-8, 8].forEach(cents => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = cents;
      o.connect(lp);
      o.start(t);
      oscs.push(o);
    }));
    pads.set(id, { g, oscs, t0: t, fade, v });
  }

  /** apaga un pad (o hiss) desde su nivel en t = now(): el tiempo del evento, no el de la tanda offline */
  function padStop(id, fade = 1.5) {
    const p = pads.get(id);
    if (!p || !ctx) return;
    pads.delete(id);
    const t = now(), gp = p.g.gain;
    if (t <= p.t0) {
      // todavía no arrancó (programado con adelanto): nunca suena
      gp.cancelScheduledValues(p.t0);
      p.oscs.forEach(o => o.stop(p.t0));
      return;
    }
    // el nivel en t sobre el ataque exponencial (no se lee gain.value: offline no sigue la automatización, y
    // cancelAndHoldAtTime no deja punto de espera en Chromium si el ataque ya terminó)
    const k = Math.min(1, (t - p.t0) / p.fade), lvl = 0.0001 * Math.pow(p.v / 0.0001, k);
    if (k < 1) {
      // el ataque sigue en curso: se reprograma igual pero cortado en t (la misma curva hasta lvl, sin saltos)
      gp.cancelScheduledValues(p.t0);
      gp.setValueAtTime(0.0001, p.t0);
      gp.exponentialRampToValueAtTime(lvl, t);
    } else {
      gp.cancelScheduledValues(t);
      gp.setValueAtTime(lvl, t);
    }
    gp.exponentialRampToValueAtTime(0.0001, t + fade);
    p.oscs.forEach(o => o.stop(t + fade + 0.05));
  }

  // ---- IG voices ----
  // Warm plucked lead: two saws ±7 cents + a square an octave below, through a low-pass that closes.
  function pluck(freq = 440, v = 0.1, len = 0.4, bright = 1) {
    if (!ok()) return;
    const t = now(), e = t + len;
    const g = bus(0.32, (rnd() - 0.5) * 0.5);
    env(g.gain, t, v, 0.003, len);
    const top = 700 + 3600 * bright;
    const lp = filter('lowpass', top, 2.2);
    lp.frequency.setValueAtTime(top, t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(220, freq * 1.25), t + len * 0.85);
    lp.connect(g);
    [-7, 7].forEach(c => { const o = osc('sawtooth', freq, t, e + 0.05, lp); o.detune.setValueAtTime(c, t); });
    const sq = ctx.createGain();
    sq.gain.value = 0.35;
    sq.connect(lp);
    osc('square', freq / 2, t, e + 0.05, sq);
  }

  // Electric-piano chord: FM 1:1 per note (the index falls: bright attack, mellow tail) + a short tine at 4×.
  function keys(freqs = [261.63, 329.63, 392], v = 0.05, len = 1.6) {
    if (!ok()) return;
    const t = now();
    const g = bus(0.4, (rnd() - 0.5) * 0.4);
    env(g.gain, t, v, 0.005, len);
    freqs.forEach(f => {
      const car = osc('sine', f, t, t + len + 0.1, g);
      const mg = ctx.createGain();
      mg.gain.setValueAtTime(f * 1.4, t);
      mg.gain.exponentialRampToValueAtTime(f * 0.04, t + len * 0.6);
      mg.connect(car.frequency);
      osc('sine', f, t, t + len + 0.1, mg);
      const tg = ctx.createGain();
      tg.gain.setValueAtTime(0.0001, t);
      tg.gain.exponentialRampToValueAtTime(0.16, t + 0.003);
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      tg.connect(g);
      osc('sine', f * 4, t, t + 0.2, tg);
    });
  }

  // Sub: a clean sine that holds half its length, then falls (under 'bass' on the downbeats).
  function sub(freq = 55, v = 0.3, len = 0.42) {
    if (!ok()) return;
    const t = now();
    const g = bus(0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.006);
    g.gain.setValueAtTime(v, t + len * 0.45);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    osc('sine', freq, t, t + len + 0.02, g);
  }

  // Snare: a pitched body (220 → 150 Hz) + bright high-passed noise. Layer it with clap on 2 and 4.
  function snare(v = 0.3) {
    if (!ok()) return;
    const t = now();
    const b = bus(0.12);
    env(b.gain, t, v * 0.8, 0.002, 0.11);
    osc('triangle', 220, t, t + 0.14, b).frequency.exponentialRampToValueAtTime(150, t + 0.08);
    const n = bus(0.2, (rnd() - 0.5) * 0.2);
    env(n.gain, t, v, 0.001, 0.17);
    const hp = filter('highpass', 1400, 0.7);
    hp.connect(n);
    noise(t, t + 0.2, hp);
  }

  // Sidechain pump: the pad bus dips to (1 − depth) and comes back in ~rel s. Smooth (setTarget), no clicks.
  function duck(depth = 0.5, rel = 0.28) {
    if (!ok() || !padIn) return;
    const t = now(), gp = padIn.gain;
    gp.cancelScheduledValues(t);
    gp.setTargetAtTime(1 - depth, t, 0.005);
    gp.setTargetAtTime(1, t + 0.03, rel / 3);
  }

  function stopAll(fade = 0.08) {
    [...pads.keys()].forEach(k => padStop(k, fade));
  }

  /** Render the score offline, faster than real time. `events`: [{ t, fn }] sorted by time (the
   *  timeline's zero-length callbacks, see trailer.callbacks()); each fn runs with the clock set to
   *  its t, exactly as the live timeline fires it. Resolves to a stereo AudioBuffer of `dur` s. */
  async function render(dur, events, { sampleRate = 48000, seed: s = 1, batch = 0.25 } = {}) {
    const keep = { ctx, out, verb, noiseBuf, analyser, padIn, pads: [...pads] }; // IG: + padIn
    pads.clear();
    offline = true; seed = s;
    try {
      const oc = new OfflineAudioContext(2, Math.max(1, Math.ceil(dur * sampleRate)), sampleRate);
      build(oc, VOL);
      const fire = list => {
        for (const e of list) {
          vt = e.t;
          try { e.fn(); } catch (err) { console.warn('audio event at ' + e.t + ' s:', err); }
        }
        vt = null;
      };
      // Voices are created just in time, as they are live: the rendering pauses every `batch`
      // seconds (suspend) and the coming events are scheduled then. Creating every node up front
      // makes each render quantum process thousands of idle nodes (hundreds of times slower).
      const groups = new Map();
      events.forEach(e => { const k = Math.max(0, Math.floor(e.t / batch)); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); });
      const q = 128 / sampleRate;
      groups.forEach((list, k) => {
        const at = Math.floor((k * batch - 0.01) / q) * q; // a render-quantum boundary just before the batch
        if (at <= 0) fire(list);
        else if (at < dur) oc.suspend(at).then(() => { fire(list); oc.resume(); });
      });
      return await oc.startRendering();
    } finally {
      vt = null; offline = false; pads.clear();
      ({ ctx, out, verb, noiseBuf, analyser, padIn } = keep);
      keep.pads.forEach(([k, v]) => pads.set(k, v));
    }
  }

  function setMuted(m) {
    muted = m;
    if (out) out.gain.setTargetAtTime(m ? 0 : VOL, ctx.currentTime, 0.04);
  }

  /** una voz del timeline (D.sfx): `atraso` = cuánto pasó el cabezal del tiempo del evento cuando corrió el callback */
  function play(atraso, name, args) {
    const fn = api[name];
    // offline (o dentro de otra voz) el reloj ya está puesto en el tiempo exacto del evento
    if (vt != null || offline || !ctx) return fn(...args);
    const t = ctx.currentTime;
    vt = Math.max(t, t + ADELANTO - Math.max(0, atraso || 0));
    try { return fn(...args); } finally { vt = null; }
  }

  const api = {
    init, render, play, kick, hat, clap, boom, bell, bass, whoosh, riser, braam, crash, tick, key, glitch, beep, zap, hiss, plip, bubbles, swell, flutter, cry, fold, pad, padStop, stopAll,
    pluck, keys, sub, snare, duck, // IG
    setMuted,
    isMuted: () => muted,
    analyser: () => analyser,
    /** true while sound is actually playing (context running and not muted) */
    live: () => ok() && !muted,
    // IG: the portfolio closes the lent context when it leaves the film: nothing to suspend or resume then
    suspend: () => ctx && ctx.state !== 'closed' && ctx.suspend().catch(() => {}),
    resume: () => ctx && ctx.state !== 'closed' && ctx.resume().catch(() => {}),
  };
  return api;
})();
