/* Act 5 shots — handy group. PLACEHOLDERS: replaced by the real views (contract in js/ig-shots.js). */
(() => {
  'use strict';
  const { add } = Trailer.igShots;
  add('handy-landing', {
    frame: 'browser', url: 'handyc.com', bg: '#0b1f3a', color: '#4a8cff',
    text: { es: { name: 'handy-landing' }, en: { name: 'handy-landing' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
  add('handy-ops', {
    frame: 'browser', url: 'interno.handyc.com', bg: '#f4f6fb', color: '#4a8cff',
    text: { es: { name: 'handy-ops' }, en: { name: 'handy-ops' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
})();
