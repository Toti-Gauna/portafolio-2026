/* Stack tiles — work group (contract in js/ig-stack.js). Every visible string in text.es / text.en. */
(() => {
  'use strict';
  const { add } = Trailer.igStack;
  // React — a component tree renders; a state change flows down and re-renders the cards it reaches.
  add('react', {
    text: { es: { name: 'React', note: 'Ruleta, referidos y pagos', state: 'estado' }, en: { name: 'React', note: 'Roulette, referrals, payments', state: 'state' } },
    html: t => {
      const N = [['App', 300, 36], ['Header', 150, 108], ['Feed', 362, 108], ['Card', 246, 184], ['Card', 362, 184], ['Card', 478, 184]];
      const E = [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]];
      const pill = ([n, x, y], i) => `<g class="rn" data-i="${i}" transform="translate(${x} ${y})"><rect x="-56" y="-20" width="112" height="40" rx="20"/><text y="7">&lt;${n}/&gt;</text></g>`;
      return `<svg viewBox="0 0 540 226" class="rx">
        ${E.map(([a, b]) => `<path class="re" d="M${N[a][1]} ${N[a][2] + 20}C${N[a][1]} ${(N[a][2] + N[b][2]) / 2} ${N[b][1]} ${(N[a][2] + N[b][2]) / 2} ${N[b][1]} ${N[b][2] - 20}"/>`).join('')}
        ${N.map(pill).join('')}
        <circle class="rs" r="9" cx="300" cy="36"/>
        <g transform="translate(84 36)"><g class="rl"><rect x="-62" y="-18" width="124" height="36" rx="18"/><text y="7">${t.state}</text></g></g>
      </svg>`;
    },
    play(D, el, T) {
      const { tl } = D, nodes = D.$$('.rn', el), edges = D.$$('.re', el), dot = D.$('.rs', el), lab = D.$('.rl', el);
      gsap.set(nodes, { transformOrigin: '50% 50%' });
      gsap.set(edges, { drawSVG: '0%' });
      nodes.forEach((n, i) => D.hit(n, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.4)' }, T + (i === 0 ? 0 : 0.18 + i * 0.07)));
      tl.to(edges, { drawSVG: '100%', duration: 0.35, ease: 'power2.out', stagger: 0.06 }, T + 0.12);
      // setState: the change travels App → Feed → the three cards, which re-render (they flash)
      D.hit(lab, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' }, T + 0.75);
      D.hit(dot, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.2 }, T + 0.85);
      tl.to(dot, { attr: { cx: 362, cy: 108 }, duration: 0.35, ease: 'power2.inOut' }, T + 1.0);
      tl.to(dot, { opacity: 0, duration: 0.15 }, T + 1.35);
      [3, 4, 5].forEach((i, k) => tl.to(nodes[i], { keyframes: [{ scale: 1.12, duration: 0.14 }, { scale: 1, duration: 0.3, ease: 'power2.out' }] }, T + 1.38 + k * 0.06));
      [2, 3, 4, 5].forEach((i, k) => tl.set(nodes[i], { attr: { class: 'rn on' } }, T + 1.3 + k * 0.06));
    },
  });

  add('typescript', { // PLACEHOLDER
    text: { es: { name: 'TypeScript', note: 'Tsoft, Eclipse y HandyX' }, en: { name: 'TypeScript', note: 'Tsoft, Eclipse and HandyX' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('nextjs', { // PLACEHOLDER
    text: { es: { name: 'Next.js', note: 'Eclipse y este portafolio' }, en: { name: 'Next.js', note: 'Eclipse and this portfolio' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('reactnative', { // PLACEHOLDER
    text: { es: { name: 'React Native', note: 'Apps móviles en el trabajo' }, en: { name: 'React Native', note: 'Mobile apps at work' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('tailwind', { // PLACEHOLDER
    text: { es: { name: 'Tailwind', note: 'En el trabajo y en Eclipse' }, en: { name: 'Tailwind', note: 'At work and in Eclipse' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('node', { // PLACEHOLDER
    text: { es: { name: 'Node.js', note: 'Express y Prisma en Eclipse' }, en: { name: 'Node.js', note: 'Express and Prisma in Eclipse' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('sql', { // PLACEHOLDER
    text: { es: { name: 'SQL', note: 'PostgreSQL en Eclipse' }, en: { name: 'SQL', note: 'PostgreSQL in Eclipse' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('cicd', { // PLACEHOLDER
    text: { es: { name: 'CI/CD', note: 'Pipelines y despliegues' }, en: { name: 'CI/CD', note: 'Pipelines and deploys' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
  add('rag', { // PLACEHOLDER
    text: { es: { name: 'RAG con LLM', note: 'CompliA, en producción interna' }, en: { name: 'RAG con LLM', note: 'CompliA, in internal production' } },
    html: t => `<div class="stk-ph">${t.name}</div>`,
    play() {},
  });
})();
