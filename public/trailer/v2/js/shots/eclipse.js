/* Act 5 shots — eclipse group. PLACEHOLDERS: replaced by the real views (contract in js/ig-shots.js). */
(() => {
  'use strict';
  const { add } = Trailer.igShots;
  add('eclipse-landing', {
    frame: 'browser', url: 'eclipse-business.com', bg: '#05050A', color: '#F5B942',
    text: { es: { name: 'eclipse-landing' }, en: { name: 'eclipse-landing' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
  add('eclipse-portal', {
    frame: 'browser', url: 'eclipse-business.com/portal', bg: '#F4EFE6', color: '#F5B942',
    text: { es: { name: 'eclipse-portal' }, en: { name: 'eclipse-portal' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
  add('eclipse-ops', {
    frame: 'browser', url: 'operacion.eclipse', bg: '#0C0C14', color: '#F5B942',
    text: { es: { name: 'eclipse-ops' }, en: { name: 'eclipse-ops' } },
    html: t => `<div class="shot-ph"><b>${t.name}</b></div>`,
    play() {},
  });
})();
