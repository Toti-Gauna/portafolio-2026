/* Stack tiles — lab group (contract in js/ig-stack.js). Every visible string in text.es / text.en. */
(() => {
  'use strict';
  const { add } = Trailer.igStack;
  add('security', { // PLACEHOLDER
    text: { es: { name: 'Seguridad', note: 'HttpOnly, CSRF, 2FA, Argon2' }, en: { name: 'Seguridad', note: 'HttpOnly, CSRF, 2FA, Argon2' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('python', { // PLACEHOLDER
    text: { es: { name: 'Python', note: 'Estudio y proyectos propios' }, en: { name: 'Python', note: 'Study and own projects' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('c', { // PLACEHOLDER
    text: { es: { name: 'C', note: 'Estudio y proyectos propios' }, en: { name: 'C', note: 'Study and own projects' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('motion', { // PLACEHOLDER
    text: { es: { name: 'GSAP · WebGL', note: 'Kinetic Studio: 32 tráileres' }, en: { name: 'GSAP · WebGL', note: 'Kinetic Studio: 32 trailers' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('tests', { // PLACEHOLDER
    text: { es: { name: 'Vitest · Playwright', note: 'Eclipse y este sitio' }, en: { name: 'Vitest · Playwright', note: 'Eclipse and this site' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('ml', { // PLACEHOLDER
    text: { es: { name: 'Machine learning', note: 'Fundamentos' }, en: { name: 'Machine learning', note: 'Fundamentals' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('aws', { // PLACEHOLDER
    text: { es: { name: 'AWS', note: 'Estudio' }, en: { name: 'AWS', note: 'Study' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('azure', { // PLACEHOLDER
    text: { es: { name: 'Azure', note: 'Estudio' }, en: { name: 'Azure', note: 'Study' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
})();
