/* Act 5 shots — lab group. PLACEHOLDERS: replaced by the real views (contract in js/ig-shots.js). */
(() => {
  'use strict';
  const { add } = Trailer.igShots;
  add('volta', {
    frame: 'browser', url: 'volta.demo', bg: '#101010', color: '#d4ff3a',
    text: { es: { name: 'volta' }, en: { name: 'volta' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
  add('velmar', {
    frame: 'browser', url: 'velmar.demo', bg: '#efe7da', color: '#d2ad69',
    text: { es: { name: 'velmar' }, en: { name: 'velmar' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
  add('dentalos', {
    frame: 'browser', url: 'dentalos.demo', bg: '#eef6f4', color: '#5ee6c8',
    text: { es: { name: 'dentalos' }, en: { name: 'dentalos' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
  add('supernova', {
    frame: 'phone', bg: '#14051a', color: '#ff2e88',
    text: { es: { name: 'supernova' }, en: { name: 'supernova' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
  add('games', {
    frame: 'browser', url: 'games-market', bg: '#071a12', color: '#34d399',
    text: { es: { name: 'games' }, en: { name: 'games' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
  add('kinetic', {
    frame: 'none', bg: '#0e0e10', color: '#ff4d2e',
    text: { es: { name: 'kinetic' }, en: { name: 'kinetic' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
})();
