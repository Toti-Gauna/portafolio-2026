/* CONOCER A IGNACIO — entry point, served as plain ES modules (no bundler).
   Kit from Kinetic Studio: GSAP (classic scripts, on window) → audio → engine → recipes → music → ig-kit → ig-shots + js/shots/* (act 5 views) → config.
   ?lang=en loads the English config. ?host = inside the portfolio overlay. ?t=<s> freezes a frame (QA).
   ?o=v = the 9:16 edition: the SAME film (scenes, timings, score, texts) on a 1080×1920 stage. The configs don't
   change: the stage is set here, and every recipe lays itself out for D.W < D.H (html.is-vertical for the CSS). */
import './js/audio.js';
import './js/engine.js';
import './js/recipes.js';
import './js/recipes-type.js';
import './js/recipes-glitch.js';
import './js/recipes-ui.js';
import './js/recipes-dev.js';
import './js/recipes-shop.js';
import './js/recipes-branch.js';
import './js/recipes-music.js';
import './js/ig-kit.js';
import './js/ig-career.js';
import './js/ig-case.js';
import './js/ig-shots.js';
import './js/ig-stack.js';
import './js/stack/work.js';
import './js/stack/lab.js';
import './js/shots/eclipse.js';
import './js/shots/handy.js';
import './js/shots/lab.js';

const query = new URLSearchParams(location.search);
const lang = query.get('lang') === 'en' ? 'en' : 'es';
if (query.get('o') === 'v') {
  const run = Trailer.run;
  const fx = document.getElementById('fx');
  fx.width = 1080; fx.height = 1920; // the engine only resizes the canvas when the stage scale changes it
  Trailer.run = cfg => run({ ...cfg, stage: { w: 1080, h: 1920 } });
}
await import(lang === 'en' ? './js/trailer.en.js' : './js/trailer.es.js');
