/* ============================================================================
   IG KIT — what "Conocer a Ignacio" adds to the Kinetic Studio kit (engine.js = the Handy copy, unchanged).
   Load it after engine.js and the recipe modules (recipes.js, -type, -glitch, -ui, -dev, -shop, -branch);
   the order against recipes-music.js does not matter. CSS: css/ig.css.

   PLUGIN (always on once loaded)
     · mix — every recipe call is wrapped: inside a recipe, D.sfx only lets through the "foley" voices
       (cfg.mix.keep, default KEEP below) because the score (cfg.music) plays the music; the recipes' own
       drums, bass and bells would clash with it. Recipes' direct SFX.pad(...) calls are muted too (only the
       ids in cfg.mix.pads sound — the score's). Per scene:  sfx: 'all' | 'none' | ['kick', …]
       and  foley: <gain>  (their level under the score; default cfg.mix.gain ?? 1).
       Also per scene: letterbox: <px> (bar height set at the scene start; the recipe can still change it)
       and hud: false | true (hide / show the film HUD at the scene start).
     · acts — cfg.acts = [{ from, to, kind, tone, alpha }]: one background treatment per act, in a layer
       between the colour wipes and the scenes (so it survives wipes and shows through transparent scenes):
       dots · rings · grid · scan · branches · net · sun. Transform/opacity only; they pulse on every bar of
       cfg.music.bpm. All tweens live on the master timeline (seekable).
     · cap — per scene  cap: { k, t, d, at, to, pos, tone, w, accent }  (or an array of them): the chapter
       caption — kicker (mono), title, one-line description — on a plate that wipes in and out.
       at / to: seconds from the scene start (default 0.15 → the scene's end); pos: bl | br | tl | tr;
       tone: dark | light; w: max width (px).
     · host — ?host (or cfg.host): played inside the portfolio's overlay. No intro, no end screen, no
       progress bar: it starts as soon as it is built, and talks to the parent with postMessage
       (same origin): → trailer:ready { duration } · trailer:end · trailer:close (Esc)
       ← trailer:mute { muted } · trailer:pause · trailer:play · trailer:toggle.

   RECIPES
     igcut      any recipe, time-warped to a length (fit) and/or trimmed (hasta) — the fast-cut tool.
     igwheel    a roulette that spins and lands (gamification), with a kicker, a title and pills.
     igclip     a real video clip in a floating window, kept in sync with the timeline (seekable).
     igprojects own projects as git branches off one main line, each with its name and status.
     igagents   the eleven agents, one glyph each, appearing group by group on the beat.
     igend      the closing card: monogram, name, role, availability, e-mail; then it empties for the hand-off.
   ========================================================================== */
(() => {
  'use strict';
  const { recipe, plugin } = Trailer;
  const INK = '#0e0e10', PAPER = '#eeeae3', CORAL = '#ff4d2e', BLUE = '#2b50ff', YELLOW = '#ffc21a';
  /** voices a recipe may still play under the score: transitions and foley, nothing pitched or rhythmic */
  const KEEP = ['whoosh', 'riser', 'boom', 'braam', 'crash', 'key', 'tick', 'glitch', 'zap', 'swell', 'fold', 'beep', 'hiss'];
  /** where each foley voice takes its volume: [argument index, its default in audio.js] (for the foley gain) */
  const VOL = { boom: [0, 1], braam: [0, 0.85], crash: [0, 0.3], tick: [0, 0.05], key: [0, 0.16], zap: [0, 0.4], fold: [0, 0.25],
    whoosh: [1, 0.5], riser: [1, 0.45], swell: [1, 0.22], glitch: [1, 0.35], beep: [2, 0.1] };
  const Q = new URLSearchParams(location.search);
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /** scale every duration-like field of a tween's vars by k (positions are mapped by the caller) */
  function sv(v, k) {
    if (!v || typeof v !== 'object' || Array.isArray(v) || k === 1) return v;
    const o = { ...v };
    ['duration', 'delay', 'repeatDelay'].forEach(f => { if (typeof o[f] === 'number') o[f] *= k; });
    if (typeof o.stagger === 'number') o.stagger *= k;
    else if (o.stagger && typeof o.stagger === 'object') { o.stagger = { ...o.stagger }; ['each', 'amount'].forEach(f => { if (typeof o.stagger[f] === 'number') o.stagger[f] *= k; }); }
    if (Array.isArray(o.keyframes)) o.keyframes = o.keyframes.map(x => sv(x, k));
    return o;
  }

  // ================================================================== ACT BACKGROUNDS
  /** opacity pulse of `el` on every bar of the act: 1 on the downbeat → `lo` */
  function pulse(D, el, a, bar, lo) {
    gsap.set(el, { opacity: lo });
    for (let t = a.from; t < a.to - 0.05; t += bar) D.hit(el, { opacity: 1 }, { opacity: lo, duration: bar * 0.8, ease: 'power2.out' }, t);
  }
  const KINDS = {
    // the portfolio's dot grid, drifting diagonally
    dots(D, el, a, bar) {
      el.innerHTML = '<i class="igb-dots"></i>';
      const d = el.firstChild;
      D.tl.set(d, { x: 0, y: 0, scale: 1 }, a.from);
      D.tl.to(d, { x: -192, y: -96, scale: 1.05, duration: a.to - a.from, ease: 'none' }, a.from);
      pulse(D, d, a, bar, 0.6);
    },
    // a ring leaves the centre on every bar (the seed's heartbeat)
    rings(D, el, a, bar) {
      el.innerHTML = '<i class="igb-ring"></i>'.repeat(4);
      const rs = Array.from(el.children);
      gsap.set(rs, { scale: 0.15, opacity: 0 });
      let b = 0;
      for (let t = a.from; t < a.to - 0.05; t += bar, b++) D.hit(rs[b % 4], { scale: 0.15, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: bar * 1.7, ease: 'power2.out' }, t);
    },
    // Bauhaus construction lines that draw in and drift (the career act, on paper)
    grid(D, el, a, bar) {
      const H = [180, 360, 540, 720, 900], V = [240, 480, 720, 960, 1200, 1440, 1680];
      el.innerHTML = `<svg class="igb-svg" viewBox="0 0 1920 1080"><g class="g">${H.map(y => `<line x1="-300" y1="${y}" x2="2220" y2="${y}"/>`).join('')}${V.map(x => `<line x1="${x}" y1="-60" x2="${x}" y2="1140"/>`).join('')}<circle cx="1440" cy="360" r="300"/><circle cx="480" cy="760" r="190"/></g></svg>`;
      const g = el.querySelector('.g'), parts = el.querySelectorAll('line, circle');
      gsap.set(parts, { drawSVG: '0%' });
      D.hit(parts, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'expo.inOut', stagger: 0.05 }, a.from);
      D.tl.set(g, { x: 0 }, a.from);
      D.tl.to(g, { x: -240, duration: a.to - a.from, ease: 'none' }, a.from);
      pulse(D, g, a, bar, 0.65);
    },
    // scanlines rolling up + a light band that sweeps down on every bar (the AI act)
    scan(D, el, a, bar) {
      el.innerHTML = '<i class="igb-lines"></i><i class="igb-band"></i>';
      const [ln, band] = el.children;
      gsap.set(band, { y: -320 });
      D.tl.set(ln, { y: 0 }, a.from);
      D.tl.to(ln, { y: -240, duration: a.to - a.from, ease: 'none' }, a.from);
      for (let t = a.from; t < a.to - 0.05; t += bar) D.hit(band, { y: -320 }, { y: 1400, duration: bar * 0.9, ease: 'power1.inOut' }, t);
    },
    // git branches leaving a main line, one after another (own projects)
    branches(D, el, a) {
      const fk = [[100, 700], [380, 520], [700, 800], [980, 360], [1260, 620], [1540, 460]];
      el.innerHTML = `<svg class="igb-svg" viewBox="0 0 1920 1080"><g class="g"><path d="M-100 900H2120"/>${fk.map(([x, y]) => `<path d="M${x} 900C${x + 130} 900 ${x + 130} ${y} ${x + 260} ${y}H2120"/>`).join('')}${fk.map(([x]) => `<circle class="n" cx="${x}" cy="900" r="8"/>`).join('')}</g></svg>`;
      const g = el.querySelector('.g'), paths = el.querySelectorAll('path'), nodes = el.querySelectorAll('.n');
      const span = a.to - a.from;
      gsap.set(paths, { drawSVG: '0%' });
      gsap.set(nodes, { scale: 0, transformOrigin: '50% 50%' });
      D.hit(paths[0], { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'power2.inOut' }, a.from);
      fk.forEach((_, i) => {
        const t = a.from + 0.4 + i * (span - 2) / fk.length;
        D.hit(nodes[i], { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t);
        D.hit(paths[i + 1], { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut' }, t);
      });
      D.tl.set(g, { x: 0 }, a.from);
      D.tl.to(g, { x: -200, duration: span, ease: 'none' }, a.from);
    },
    // a slow network of nodes (the agents' system): it turns, its nodes pulse with the bar
    net(D, el, a, bar) {
      const r = rng(11), N = 18, pts = Array.from({ length: N }, () => [120 + r() * 1680, 90 + r() * 900]);
      const links = [];
      pts.forEach((p, i) => pts.map((q, j) => [j, (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 2)
        .forEach(([j]) => { if (!links.some(([u, v]) => (u === j && v === i))) links.push([i, j]); }));
      el.innerHTML = `<svg class="igb-svg" viewBox="0 0 1920 1080"><g class="g">${links.map(([i, j]) => `<line x1="${pts[i][0].toFixed(0)}" y1="${pts[i][1].toFixed(0)}" x2="${pts[j][0].toFixed(0)}" y2="${pts[j][1].toFixed(0)}"/>`).join('')}${pts.map(([x, y]) => `<circle class="n" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="5"/>`).join('')}</g></svg>`;
      const g = el.querySelector('.g'), nodes = Array.from(el.querySelectorAll('.n'));
      gsap.set(g, { svgOrigin: '960 540' });
      D.tl.set(g, { rotation: 0 }, a.from);
      D.tl.to(g, { rotation: 14, duration: a.to - a.from, ease: 'none' }, a.from);
      gsap.set(nodes, { transformOrigin: '50% 50%' });
      let b = 0;
      for (let t = a.from; t < a.to - 0.05; t += bar, b++) D.hit(nodes.filter((_, i) => i % 3 === b % 3), { scale: 2.4 }, { scale: 1, duration: bar * 0.6, ease: 'power2.out' }, t);
    },
    // the coral sun rising behind the finale (dawn)
    sun(D, el, a, bar) {
      el.innerHTML = '<i class="igb-sun"></i>';
      const s = el.firstChild;
      D.tl.set(s, { y: 560, scale: 0.7 }, a.from);
      D.tl.to(s, { y: 40, scale: 1.2, duration: a.to - a.from, ease: 'power1.out' }, a.from);
      pulse(D, s, a, bar, 0.8);
    },
  };
  function buildActs(D, cfg) {
    const acts = cfg.acts || [];
    if (!acts.length) return;
    const bar = 240 / ((cfg.music && cfg.music.bpm) || 120);
    const layer = document.createElement('div');
    layer.id = 'ig-acts';
    D.camera.before(layer); // over #bg and #wipe, under the scenes
    acts.forEach(a => {
      const el = document.createElement('div');
      el.className = `igb igb-${a.kind}`;
      el.style.color = a.tone || PAPER;
      layer.appendChild(el);
      gsap.set(el, { autoAlpha: 0 });
      (KINDS[a.kind] || KINDS.dots)(D, el, a, bar);
      D.tl.to(el, { autoAlpha: a.alpha ?? 0.14, duration: 0.45, ease: 'power2.out' }, a.from);
      D.tl.to(el, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, a.to - 0.3);
    });
  }

  // ================================================================== CAPTIONS
  function placeCap(D, layer, T, dur, c) {
    const el = document.createElement('div');
    el.className = `igc igc-${c.pos || 'bl'} igc-${c.tone || 'dark'}`;
    if (c.w) el.style.maxWidth = c.w + 'px';
    el.style.setProperty('--acc', c.accent || CORAL);
    el.innerHTML = `<i class="igc-bar"></i>${c.k ? '<div class="igc-k mono"></div>' : ''}${c.t ? `<div class="igc-t">${c.t}</div>` : ''}${c.d ? `<div class="igc-d">${c.d}</div>` : ''}`;
    layer.appendChild(el);
    const k = el.querySelector('.igc-k'), title = el.querySelector('.igc-t'), desc = el.querySelector('.igc-d'), bar = el.querySelector('.igc-bar');
    if (k) { k.textContent = c.k; k.style.minHeight = k.offsetHeight + 'px'; k.textContent = ''; } // keep the plate's size while it scrambles
    const words = title ? D.split(title, { type: 'words', mask: 'words' }).words : [];
    gsap.set(el, { autoAlpha: 0 });
    gsap.set(words, { yPercent: 110 });
    if (desc) gsap.set(desc, { opacity: 0, y: 14 });
    gsap.set(bar, { scaleY: 0, transformOrigin: '50% 0%' });
    const a = T + (c.at ?? 0.15), b = T + Math.min(c.to ?? dur, dur) - 0.3;
    D.tl.set(el, { autoAlpha: 1 }, a);
    D.hit(el, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'expo.out' }, a);
    D.tl.to(bar, { scaleY: 1, duration: 0.4, ease: 'expo.out' }, a + 0.05);
    if (k) D.tl.to(k, { duration: 0.45, scrambleText: { text: c.k, chars: 'upperCase', speed: 1 }, ease: 'none' }, a + 0.05);
    if (words.length) D.tl.to(words, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.035 }, a + 0.1);
    if (desc) D.tl.to(desc, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, a + 0.25);
    D.tl.to(el, { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.28, ease: 'power3.in' }, b);
    D.tl.set(el, { autoAlpha: 0 }, b + 0.28);
  }

  // ================================================================== HOST MODE (inside the portfolio)
  const host = cfg => !!cfg.host || Q.has('host');
  const post = (type, extra = {}) => { try { if (parent !== window) parent.postMessage({ type, ...extra }, location.origin); } catch (e) { /* no parent */ } };

  // ================================================================== THE PLUGIN
  plugin({
    setup(D, cfg) {
      // HUD label numbers for igcut (D.label returns "07" synchronously; igcut defers the call)
      const rawLabel = D.label;
      let labels = 0;
      D.label = (at, text) => { labels++; return rawLabel(at, text); };
      D.nextLabel = () => String(labels + 1).padStart(2, '0');

      // mix: wrap every recipe (sfx filter, letterbox, hud). Wrapping is per page (one run per page).
      const keep = new Set((cfg.mix && cfg.mix.keep) || KEEP);
      const R = Trailer.recipes;
      Object.keys(R).forEach(name => {
        const fn = R[name];
        if (fn.__ig) return;
        const w = (D2, T, o = {}) => {
          if (typeof o.letterbox === 'number') D2.barsTo(o.letterbox, T, 0);
          if (o.hud === false || o.hud === true) D2.tl.to(D2.hud, { autoAlpha: o.hud ? 1 : 0, duration: 0.01 }, T);
          const mode = o.sfx ?? (cfg.music ? 'foley' : 'all');
          if (mode === 'all') return fn(D2, T, o);
          const allow = mode === 'none' ? new Set() : Array.isArray(mode) ? new Set(mode) : keep;
          const gain = o.foley ?? (cfg.mix && cfg.mix.gain) ?? 1; // level of the recipe's foley under the score
          const prev = D2.sfx;
          D2.sfx = (n, at, ...a) => {
            if (!allow.has(n)) return undefined;
            if (gain !== 1 && n in VOL) { a = a.slice(); const [i, def] = VOL[n]; a[i] = (a[i] ?? def) * gain; }
            return prev.call(D2, n, at, ...a);
          };
          try { return fn(D2, T, o); } finally { D2.sfx = prev; }
        };
        w.__ig = true;
        R[name] = w;
      });
      // recipes' own pads (drones, chords) are muted under a score; the score's pad ids pass
      if (cfg.music && window.SFX && !SFX.__igPads) {
        const allowPads = new Set((cfg.mix && cfg.mix.pads) || ['hdr-musica', 'synpad']);
        const rawPad = SFX.pad;
        SFX.pad = (id, ...a) => (allowPads.has(id) ? rawPad(id, ...a) : undefined);
        SFX.__igPads = true;
      }

      buildActs(D, cfg);
      const caps = document.createElement('div');
      caps.id = 'ig-caps';
      D.camera.after(caps);
      D.igCaps = caps;
      if (host(cfg)) {
        document.documentElement.classList.add('is-host');
        // from the first frame on, not only once it is built: Esc always gets the visitor out
        addEventListener('keydown', e => { if (e.key === 'Escape') post('trailer:close'); });
      }
    },

    scene(D, T, s, dur) {
      if (!s.cap) return;
      (Array.isArray(s.cap) ? s.cap : [s.cap]).forEach(c => placeCap(D, D.igCaps, T, dur, c));
    },

    done(D, cfg) {
      if (!host(cfg)) return;
      const tl = D.tl, prev = tl.eventCallback('onComplete');
      tl.eventCallback('onComplete', () => { if (prev) prev(); post('trailer:end'); });
      addEventListener('message', e => {
        if (e.origin !== location.origin || !e.data || typeof e.data !== 'object') return;
        const d = e.data;
        if (d.type === 'trailer:mute') SFX.setMuted(!!d.muted);
        else if (d.type === 'trailer:toggle' || (d.type === 'trailer:pause' && !tl.paused()) || (d.type === 'trailer:play' && tl.paused())) dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      });
      post('trailer:ready', { duration: tl.duration() });
      // the engine enables #play at the very end of its build: start on the next task (not in ?t= / ?embed)
      if (!Q.has('t') && !Q.has('embed')) setTimeout(() => { const b = document.getElementById('play'); if (b && !b.disabled) b.click(); }, 0);
    },
  });

  // ================================================================== IGCUT
  // { type: 'igcut', de: 'title', fit: 5 }                 the recipe, time-warped to last exactly 5 s
  // { type: 'igcut', de: 'brline', k: 0.7, hasta: 4.6 }     at 0.7× its time, cut at its own second 4.6
  //   de       the recipe (any registered type)            fit     final length in s (k = fit / cut)
  //   k        time factor when there is no fit (default 1) hasta   cut point in the recipe's own seconds
  //   congela  from this recipe second on, nothing new starts (the frame holds until the cut)
  //   keep     true: its sections are not hidden at the cut
  //   cls      extra classes for the sections it creates (CSS hooks: .ig-big-labels …)
  // Every other option goes to the recipe. How: the recipe runs against a facade of D that RECORDS every
  // timeline operation (tl.to/set/fromTo/call, sfx, call, show, hide, hit, setBg, ink, label, flash, shake,
  // barsTo, wipeTo, glitch); once it returns its length, they are replayed on the master timeline with
  // positions T + (p − T)·k and durations × k. A pure warp replays everything (a recipe may clean up after
  // its own end, under the next scene); a trim (hasta / congela) drops what would start at or after the cut
  // — so never trim a canvas recipe (particles, warp) before its layer fades out.
  // Positions must be numbers (absolute seconds), as every kit recipe writes them. Sounds keep their length.
  recipe('igcut', (D, T, o) => {
    const fn = Trailer.recipes[o.de];
    if (!fn || o.de === 'igcut') throw new Error(`igcut: unknown recipe "${o.de}"`);
    const ops = [], sections = [];
    const num = (p, what) => { if (typeof p !== 'number' || !Number.isFinite(p)) throw new Error(`igcut(${o.de}): ${what} at "${p}" — only absolute times`); return p; };
    const rec = (kind, p, args) => { ops.push({ kind, p: num(p, kind), args }); };
    const W = Object.create(D);
    W.tl = {
      to: (t, v, p) => { rec('to', p, [t, v]); return W.tl; },
      set: (t, v, p) => { rec('set', p, [t, v]); return W.tl; },
      fromTo: (t, a, b, p) => { rec('fromTo', p, [t, a, b]); return W.tl; },
      call: (f, a, p) => { rec('call', p, [f, a]); return W.tl; },
      duration: () => D.tl.duration(),
      time: (...a) => D.tl.time(...a),
    };
    W.scene = (name, html) => { const s = D.scene(name, html); if (o.cls) s.classList.add(...o.cls.split(/\s+/)); sections.push(s); return s; };
    W.sfx = (n, p, ...a) => rec('sfx', p, [n, a]);
    W.call = (f, p) => rec('dcall', p, [f]);
    W.show = (el, p) => rec('show', p, [el]);
    W.hide = (el, p) => rec('hide', p, [el]);
    W.hit = (el, a, b, p) => rec('hit', p, [el, a, b]);
    W.setBg = (c, p) => rec('setBg', p, [c]);
    W.ink = (c, p) => rec('ink', p, [c]);
    W.label = (p, text) => { rec('label', p, [text]); return D.nextLabel ? D.nextLabel() : '00'; };
    W.flash = (p, peak, dur = 0.6, c) => rec('flash', p, [peak, dur, c]);
    W.shake = (p, dur = 0.5, amp, grow) => rec('shake', p, [dur, amp, grow]);
    W.barsTo = (h, p, dur = 0.9, ease) => rec('barsTo', p, [h, dur, ease]);
    W.wipeTo = (c, p, dir, dur = 0.44) => rec('wipeTo', p, [c, dir, dur]);
    if (D.glitch) W.glitch = (p, g = {}) => rec('glitch', p, [g]);

    const inner = { ...o, type: o.de };
    delete inner.letterbox; delete inner.hud; // already applied once, by the wrapper of igcut itself
    const base = fn(W, T, inner);
    if (!(base > 0)) throw new Error(`igcut: ${o.de} returned no length`);
    const cut = Math.min(o.hasta ?? base, base);
    const k = o.fit ? o.fit / cut : (o.k ?? 1);
    // A pure time-warp keeps EVERY operation, also the ones a recipe places after its own end (e.g. the
    // particles' canvas fading out under the next scene): dropping them would leave state behind. Only a
    // trim (hasta < length, or congela) drops what would start at or after the cut.
    const trim = cut < base - 1e-6 || o.congela != null;
    const fin = T + cut * k, stop = trim ? Math.min(fin, o.congela != null ? T + o.congela * k : Infinity) : Infinity;
    const at = p => T + (p - T) * k;
    const live = (p, v) => at(p) + (v && typeof v.delay === 'number' ? v.delay * k : 0) < stop - 1e-6;
    const clamp = x => (trim ? Math.min(x, fin) : x);
    for (const { kind, p, args } of ops) {
      const x = at(p);
      switch (kind) {
        case 'to': if (live(p, args[1])) D.tl.to(args[0], sv(args[1], k), x); break;
        case 'set': if (live(p)) D.tl.set(args[0], args[1], x); break;
        case 'fromTo': if (live(p, args[2])) D.tl.fromTo(args[0], args[1], sv(args[2], k), x); break;
        case 'call': if (live(p)) D.tl.call(args[0], args[1], x); break;
        case 'sfx': if (live(p)) D.sfx(args[0], x, ...args[1]); break;
        case 'dcall': if (live(p)) D.call(args[0], x); break;
        case 'show': D.show(args[0], clamp(x)); break;
        case 'hide': D.hide(args[0], clamp(x)); break;
        case 'hit': if (live(p, args[2])) D.hit(args[0], args[1], sv(args[2], k), x); break;
        case 'setBg': if (live(p)) D.setBg(args[0], x); break;
        case 'ink': if (live(p)) D.ink(args[0], x); break;
        case 'label': if (live(p)) D.label(x, args[0]); break;
        case 'flash': if (live(p)) D.flash(x, args[0], args[1] * k, args[2]); break;
        case 'shake': if (live(p)) D.shake(x, args[0] * k, args[1], args[2]); break;
        case 'barsTo': if (live(p)) D.barsTo(args[0], x, args[1] && args[1] * k, args[2]); break;
        case 'wipeTo': if (live(p)) D.wipeTo(args[0], x, args[1], args[2] * k); break;
        case 'glitch': if (live(p)) D.glitch(x, { ...args[0], dur: (args[0].dur ?? 0.3) * k }); break;
        default: break;
      }
    }
    if (!o.keep) sections.forEach(s => D.hide(s, fin));
    return fin - T;
  });

  // ================================================================== IGWHEEL
  // A roulette (n coloured segments) drops in, spins with a power4 slowdown — the pointer flicks on every
  // peg it passes (ticks computed from the ease, so they are exact on every replay) — and lands on `land`.
  // The kicker scrambles in, the title lands with the wheel, the pills pop on the next beats.     4 s
  //   { kicker, title, pills: [], colors: [], land, turns, spin, bg, duration }
  recipe('igwheel', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 4, cols = o.colors || [CORAL, INK, BLUE, INK, YELLOW, INK, PAPER, INK];
    const n = cols.length, R = 300, step = 360 / n, bg = o.bg || PAPER, fg = D.contrast(bg);
    const P = (r, a) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
    const rad = d => (d - 90) * Math.PI / 180;
    const seg = i => `M0 0L${P(R, rad(i * step))}A${R} ${R} 0 0 1 ${P(R, rad((i + 1) * step))}Z`;
    const s = D.scene('igwheel', `<div class="igw" style="--fg:${fg};--bg:${bg}">
      <div class="igw-box"><svg class="igw-wheel" viewBox="-340 -340 680 680">
        <g class="igw-rot">${cols.map((c, i) => `<path class="igw-seg" d="${seg(i)}" style="fill:${c}"/>`).join('')}
          <circle class="igw-rim" r="${R}"/>${cols.map((_, i) => `<circle class="igw-peg" cx="${(R - 16) * Math.cos(rad(i * step))}" cy="${(R - 16) * Math.sin(rad(i * step))}" r="7"/>`).join('')}</g>
        <circle class="igw-hub" r="34"/><path class="igw-ptr" d="M-28 -340L28 -340L0 -282Z"/>
      </svg></div>
      <div class="igw-copy"><div class="igw-k mono">${o.kicker || ''}</div><div class="igw-t v">${o.title || ''}</div>
        <div class="igw-pills">${(o.pills || []).map(p => `<span>${p}</span>`).join('')}</div></div>
    </div>`);
    const box = D.$('.igw-box', s), rot = D.$('.igw-rot', s), ptr = D.$('.igw-ptr', s), segs = D.$$('.igw-seg', s);
    const k = D.$('.igw-k', s), title = D.fit(D.$('.igw-t', s), 860), pills = D.$$('.igw-pills span', s);
    const chars = D.split(title, { type: 'chars', mask: 'chars' }).chars;
    gsap.set(rot, { svgOrigin: '0 0', rotation: 0 });
    gsap.set(ptr, { svgOrigin: '0 -330', rotation: 0 });
    gsap.set(chars, { yPercent: 110 });
    gsap.set(pills, { opacity: 0, scale: 0.6 });
    const kText = k.textContent;
    k.textContent = '';

    D.show(s, T);
    D.setBg(bg, T);
    D.ink(fg, T);
    if (o.label) D.label(T, o.label);
    D.hit(box, { scale: 0.55, rotation: -50, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, T);
    D.sfx('whoosh', T, 0.5, 0.3);
    if (kText) tl.to(k, { duration: 0.5, scrambleText: { text: kText, chars: 'upperCase', speed: 1 }, ease: 'none' }, T + 0.25);
    // the spin
    const land = o.land ?? 2, turns = o.turns ?? 4, spinAt = T + 0.3, spinDur = o.spin ?? 2.0;
    const total = 360 * turns + (360 - (land + 0.5) * step);
    D.hit(rot, { rotation: 0 }, { rotation: total, duration: spinDur, ease: 'power4.out' }, spinAt);
    const ease = gsap.parseEase('power4.out');
    let last = -1;
    for (let m = 1; m * step <= total; m++) {
      const target = (m * step) / total;
      let lo = 0, hi = 1;
      for (let it = 0; it < 30; it++) { const mid = (lo + hi) / 2; if (ease(mid) < target) lo = mid; else hi = mid; }
      const t = spinAt + hi * spinDur;
      if (t - last < 0.045) continue;
      last = t;
      D.sfx('tick', t, 0.04 + 0.05 * hi);
      tl.to(ptr, { rotation: -16, duration: 0.03, ease: 'none' }, t);
      tl.to(ptr, { rotation: 0, duration: 0.09, ease: 'power2.out' }, t + 0.03);
    }
    const tl0 = spinAt + spinDur;
    D.hit(ptr, { rotation: -24 }, { rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)' }, tl0 - 0.05);
    D.hit(segs[land], { opacity: 0.35 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, tl0);
    D.hit(box, { scale: 1.04 }, { scale: 1, duration: 0.5, ease: 'expo.out' }, tl0);
    D.sfx('boom', tl0, 0.4);
    D.sfx('key', tl0, 0.3);
    tl.to(chars, { yPercent: 0, duration: 0.55, ease: 'expo.out', stagger: 0.025 }, tl0 - 0.1);
    pills.forEach((p, i) => D.hit(p, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.5)' }, tl0 + 0.35 + i * 0.25));
    D.hide(s, T + dur);
    return dur;
  });

  // ================================================================== IGCLIP
  // A real clip (MP4) in a floating window that settles from a 3D tilt and slowly pushes in; a label that
  // must stay on screen (sample data) pops on the frame. The <video> follows the timeline from a ticker:
  // playing → it plays and is re-synced if it drifts > 0.25 s; paused / seeking (?t=) → it is paused on
  // the exact frame. Muted (the score plays).                                     6 s
  //   { src, poster, from (s into the clip), rate, window, tag, bg, duration }
  recipe('igclip', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, from = o.from ?? 0, rate = o.rate || 1;
    const s = D.scene('igclip', `<div class="igv"><figure class="igv-win">
      <div class="igv-bar"><i></i><i></i><i></i><span>${o.window || ''}</span></div>
      <div class="igv-media"><video class="igv-video" muted playsinline preload="auto"${o.poster ? ` poster="${o.poster}"` : ''}><source src="${o.src}" type="video/mp4"></video></div>
      <figcaption class="igv-tag mono">${o.tag || ''}</figcaption></figure></div>`);
    const win = D.$('.igv-win', s), v = D.$('video', s), tag = D.$('.igv-tag', s);
    v.muted = true;
    D.show(s, T);
    if (o.bg) D.setBg(o.bg, T);
    D.ink(o.ink || PAPER, T);
    if (o.label) D.label(T, o.label);
    D.hit(win, { opacity: 0, scale: 1.14, rotationY: -18, rotationX: 7, transformPerspective: 1800 }, { opacity: 1, scale: 1, rotationY: 0, rotationX: 0, duration: 0.9, ease: 'expo.out' }, T);
    tl.to(win, { scale: 1.04, duration: Math.max(0.1, dur - 1.25), ease: 'sine.inOut' }, T + 0.9);
    D.hit(tag, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)' }, T + 0.45);
    tl.to(win, { opacity: 0, scale: 0.97, duration: 0.3, ease: 'power2.in' }, T + dur - 0.3);
    D.sfx('whoosh', T, 0.7, 0.3);
    D.sfx('tick', T + 0.45, 0.05);
    D.hide(s, T + dur);
    gsap.ticker.add(() => {
      const t = D.tl.time(), want = from + (t - T) * rate, inside = t >= T && t < T + dur;
      if (inside && !D.tl.paused()) {
        if (v.paused) { v.playbackRate = rate; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        if (Math.abs(v.currentTime - want) > 0.25) v.currentTime = want;
      } else {
        if (!v.paused) v.pause();
        const w = Math.min(Math.max(want, from), from + dur * rate);
        if (v.readyState >= 1 && Math.abs(v.currentTime - w) > 0.05) v.currentTime = w;
      }
    });
    return dur;
  });

  // ================================================================== IGPROJECTS
  // Own projects as git branches: a main line draws across the bottom; one branch per eighth note forks
  // off it on its own lane (like `git log --graph`), climbs and turns into its tag: a ledger row with the
  // name and the status, in the project's colour. Two columns × four rows; the top row takes the outer
  // lane, so no branch crosses another. Then the frame holds and drifts.                       6 s
  //   { items: [{ name, status, color }] (up to 8, filled column by column), bg, step, duration }
  recipe('igprojects', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, items = (o.items || []).slice(0, 8), step = o.step || 0.25, bg = o.bg || INK;
    const COLX = [150, 1060], ROWY = [370, 490, 610, 730], TAG_H = 96, MAIN = 900, LANE = [50, 960];
    const geo = items.map((it, i) => {
      const c = Math.floor(i / 4), r = i % 4, x = COLX[c], y = ROWY[r], fx = LANE[c] + r * 24, ym = y + TAG_H / 2;
      const d = `M${fx} ${MAIN}V${ym + 24}Q${fx} ${ym} ${fx + 24} ${ym}H${x}`;
      return { ...it, c, r, x, y, fx, d };
    });
    const s = D.scene('igprojects', `<div class="igp"><div class="igp-cam">
      <svg class="igp-g" viewBox="0 0 1920 1080"><path class="igp-main" d="M40 ${MAIN}H1880"/>
        ${geo.map(g => `<path class="igp-br" d="${g.d}" style="stroke:${g.color}"/>`).join('')}
        ${geo.map(g => `<circle class="igp-n" cx="${g.fx}" cy="${MAIN}" r="11" style="fill:${g.color}"/>`).join('')}</svg>
      ${geo.map(g => `<div class="igp-tag" style="left:${g.x}px;top:${g.y}px;--c:${g.color}"><b>${g.name}</b><span>${g.status}</span></div>`).join('')}
    </div></div>`);
    const cam = D.$('.igp-cam', s), main = D.$('.igp-main', s), brs = D.$$('.igp-br', s), ns = D.$$('.igp-n', s), tags = D.$$('.igp-tag', s);
    gsap.set(main, { drawSVG: '0%' });
    gsap.set(brs, { drawSVG: '0%' });
    gsap.set(ns, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(tags, { opacity: 0 });
    D.show(s, T);
    D.setBg(bg, T);
    D.ink(D.contrast(bg), T);
    if (o.label) D.label(T, o.label);
    tl.to(main, { drawSVG: '100%', duration: 0.7, ease: 'power2.inOut' }, T + 0.05);
    D.sfx('whoosh', T + 0.05, 0.7, 0.25);
    geo.forEach((g, i) => {
      const t = T + 0.5 + i * step;
      D.hit(ns[i], { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, t);
      tl.to(brs[i], { drawSVG: '100%', duration: 0.4, ease: 'power2.inOut' }, t);
      D.hit(tags[i], { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out' }, t + 0.25);
      D.sfx('tick', t + 0.25, 0.05);
    });
    gsap.set(cam, { transformOrigin: '960px 640px' });
    tl.set(cam, { x: 0, scale: 1 }, T);
    tl.to(cam, { x: -24, scale: 1.03, duration: dur - 0.4, ease: 'sine.inOut' }, T + 0.2);
    tl.to(cam, { opacity: 0, duration: 0.3, ease: 'power2.in' }, T + dur - 0.3);
    D.hide(s, T + dur);
    return dur;
  });

  // ================================================================== IGAGENTS
  // Eleven tiles in two rows; each agent arrives on an eighth note: its glyph draws on (DrawSVG), its one
  // accent detail pops, its name rises. Groups arrive one after the other (`groups`: lists of ids with a
  // start time), so a caption per group can sit on top. Then every glyph breathes on the beat.    6 s
  //   { agents: [{ id, name }], glyphs: { id: { base, acc } }, rows: [[ids], [ids]], groups: [{ ids, at }],
  //     bg, ink, accent, step, duration }
  recipe('igagents', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 6, bg = o.bg || CORAL, ink = o.ink || INK, acc = o.accent || PAPER, step = o.step || 0.25;
    const names = Object.fromEntries((o.agents || []).map(a => [a.id, a.name]));
    const rows = o.rows || [['chief', 'uxui', 'design', 'marketing', 'ads', 'docs'], ['frontend', 'backend', 'security', 'game', 'trailer']];
    const RY = o.rowsY || [270, 540], TW = 260;
    const tile = (id, x, y) => {
      const g = o.glyphs[id];
      return `<div class="iga-tile" data-id="${id}" style="left:${x - TW / 2}px;top:${y - 120}px">
        <svg class="iga-g" viewBox="0 0 24 24">${g.base}${g.acc}</svg><div class="iga-n">${names[id] || id}</div></div>`;
    };
    const html = rows.map((ids, r) => ids.map((id, i) => tile(id, D.CX + (i - (ids.length - 1) / 2) * 280, RY[r])).join('')).join('');
    const s = D.scene('igagents', `<div class="iga" style="--ink:${ink};--acc:${acc}">${html}</div>`);
    const byId = Object.fromEntries(D.$$('.iga-tile', s).map(el => [el.dataset.id, el]));
    gsap.set(Object.values(byId), { opacity: 0 });
    D.show(s, T);
    D.setBg(bg, T);
    D.ink(ink, T);
    if (o.label) D.label(T, o.label);
    const groups = o.groups || [{ ids: rows.flat(), at: 0.2 }];
    const order = [];
    groups.forEach(gr => gr.ids.forEach((id, i) => {
      const el = byId[id];
      if (!el) return;
      const t = T + gr.at + i * step, strokes = el.querySelectorAll('svg > :not([class^="acc"])'), accs = el.querySelectorAll('svg > [class^="acc"]');
      gsap.set(strokes, { drawSVG: '0%' });
      gsap.set(accs, { scale: 0, transformOrigin: '50% 50%' });
      D.hit(el, { opacity: 0, y: 30, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' }, t);
      tl.to(strokes, { drawSVG: '100%', duration: 0.5, ease: 'power2.inOut', stagger: 0.05 }, t);
      tl.to(accs, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.35);
      D.sfx('tick', t, 0.05);
      order.push(el);
    }));
    // all of them, on the beat, from the centre out
    const tAll = T + (o.breathAt ?? dur - 1.6);
    for (let b = 0; b < 3; b++) D.hit(order.map(el => el.querySelector('svg')), { scale: 1.12 }, { scale: 1, duration: 0.45, ease: 'power2.out', stagger: { each: 0.02, from: 'center' } }, tAll + b * 0.5);
    tl.to(order, { opacity: 0, y: -24, duration: 0.3, ease: 'power2.in', stagger: 0.012 }, T + dur - 0.35);
    D.hide(s, T + dur);
    return dur;
  });

  // ================================================================== IGEND
  // The closing card on the portfolio's own colours: the IG monogram draws itself and its seed drops in,
  // the name rises, the role scrambles, a rule draws, "open to new opportunities" with a live dot that
  // beats, the line about the role, then the e-mail types itself. Everything holds, then empties to the
  // bare background: that empty frame is the hand-off to the portfolio (the parent closes on trailer:end).
  //   { name, role, open, lead, email, mono: { strokes, dot }, bg, ink, accent, handoff, duration }
  recipe('igend', (D, T, o) => {
    const { tl } = D;
    const dur = o.duration || 10, bg = o.bg || INK, ink = o.ink || PAPER, acc = o.accent || CORAL, M = o.mono;
    const s = D.scene('igend', `<div class="ige" style="color:${ink};--acc:${acc}">
      <svg class="ige-mono" viewBox="0 0 64 64">${M.strokes.map(d => `<path d="${d}"/>`).join('')}<circle class="ige-dot" cx="${M.dot.cx}" cy="${M.dot.cy}" r="${M.dot.r}"/></svg>
      <div class="ige-name v">${o.name}</div>
      <div class="ige-role mono"></div>
      <i class="ige-rule"></i>
      <div class="ige-open"><i class="ige-live"></i><span>${o.open}</span></div>
      ${o.lead ? `<div class="ige-lead">${o.lead}</div>` : ''}
      <div class="ige-mail mono"><span class="ige-mt"></span><i class="ige-caret"></i></div>
    </div>`);
    const box = D.$('.ige', s), strokes = D.$$('.ige-mono path', s), dot = D.$('.ige-dot', s), name = D.fit(D.$('.ige-name', s), 1500);
    const role = D.$('.ige-role', s), rule = D.$('.ige-rule', s), open = D.$('.ige-open span', s), live = D.$('.ige-live', s), lead = D.$('.ige-lead', s);
    const mt = D.$('.ige-mt', s), caret = D.$('.ige-caret', s), mailBox = D.$('.ige-mail', s);
    mt.textContent = o.email;
    mailBox.style.width = mailBox.offsetWidth + 2 + 'px'; // freeze the final width: it types from a fixed start
    mt.textContent = '';
    const nameCh = D.split(name, { type: 'chars', mask: 'chars' }).chars, openW = D.split(open, { type: 'words', mask: 'words' }).words;
    gsap.set(strokes, { drawSVG: '0%' });
    gsap.set(dot, { opacity: 0 });
    gsap.set(nameCh, { yPercent: 110 });
    gsap.set(openW, { yPercent: 110 });
    gsap.set([rule], { scaleX: 0 });
    gsap.set([live, caret], { opacity: 0 });
    if (lead) gsap.set(lead, { opacity: 0, y: 14 });

    D.show(s, T);
    D.wipeTo(bg, T, 'up', 0.5);
    D.ink(ink, T);
    tl.to(D.hud, { autoAlpha: 0, duration: 0.3 }, T);
    D.barsTo(0, T, 0.4);
    if (o.label) D.label(T, o.label);
    tl.to(strokes, { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut', stagger: 0.15 }, T + 0.35);
    D.hit(dot, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'bounce.out' }, T + 0.95);
    D.sfx('boom', T + 1.15, 0.3);
    tl.to(nameCh, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.03 }, T + 0.55);
    tl.to(role, { duration: 0.8, scrambleText: { text: o.role, chars: 'upperCase', speed: 0.8 }, ease: 'none' }, T + 1.2);
    tl.to(rule, { scaleX: 1, duration: 0.7, ease: 'expo.inOut' }, T + 1.5);
    tl.to(openW, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 }, T + 1.8);
    tl.set(live, { opacity: 1 }, T + 1.8);
    for (let b = 0; b < 5; b++) D.hit(live, { scale: 1.9, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'power2.out' }, T + 2 + b);
    if (lead) tl.to(lead, { opacity: 0.85, y: 0, duration: 0.5, ease: 'power3.out' }, T + 2.3);
    // the e-mail, typed
    const tm = T + 2.7, per = o.typeSpeed || 0.032, N = o.email.length, P = { n: 0 };
    tl.set(caret, { opacity: 1 }, tm - 0.1);
    tl.to(P, { n: N, duration: N * per, ease: 'none', onUpdate: () => { mt.textContent = o.email.slice(0, Math.round(P.n)); } }, tm);
    for (let i = 0; i < N; i += 2) D.sfx('key', tm + i * per, 0.12);
    const th = T + (o.handoff ?? dur - 2);
    for (let t = tm + N * per + 0.25, k = 0; t < th - 0.1; t += 0.5, k++) tl.set(caret, { opacity: k % 2 ? 1 : 0 }, t);
    tl.to(box, { scale: 1.02, duration: Math.max(0.1, th - T - 2), ease: 'none' }, T + 2);
    // the hand-off: everything leaves, the bare background remains (the portfolio's)
    tl.to(box, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, th);
    return dur;
  });
})();
