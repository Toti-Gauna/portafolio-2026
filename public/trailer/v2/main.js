/* CONOCER A IGNACIO — entry point, served as plain ES modules (no bundler).
   Kit from Kinetic Studio: GSAP (classic scripts, on window) → audio → engine → recipes → music → ig-kit → config.
   ?lang=en loads the English config. ?host = inside the portfolio overlay. ?t=<s> freezes a frame (QA). */
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

const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es';
await import(lang === 'en' ? './js/trailer.en.js' : './js/trailer.es.js');
