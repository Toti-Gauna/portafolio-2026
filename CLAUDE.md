# Portafolio de Ignacio Gauna (2026)

Next.js (App Router, `output: 'export'`) + TypeScript + next-intl (es / en) + GSAP. Sitio estático para `portfolio.eclipse-business.com`.

## Comandos
- `npm run dev` · `npm run typecheck` · `npm test` (Vitest) · `npm run build` (→ `out/`) · `npm run test:e2e` (Playwright sobre `out/`; usa Chromium de `/opt/pw-browsers/chromium` o `CHROMIUM_PATH`).

## Reglas
- **Honestidad:** no hay afirmaciones sin respaldo. Cada hito, cargo, fecha, métrica y proyecto sale del registro aprobado por Ignacio. Sin clientes, logos, testimonios ni métricas inventadas. Cada demo, prototipo o proyecto en desarrollo lleva su etiqueta (Demo / Prototipo / WIP / Producción).
- **Confidencialidad:** nada de arquitectura, datos ni capturas internas de Tsoft, Telefónica o Tuenti. Sin salario ni datos privados.
- **Sin copy en componentes:** todo texto sale de `messages/{es,en}.json` (mismas claves; lo verifica `tests/unit/messages.test.ts`).
- **Mobile-first:** sin scroll horizontal a 360 px, gutter de 16 px, objetivos táctiles ≥ 44 px.
- **Accesibilidad:** HTML semántico, teclado completo, foco visible, contraste AA, `prefers-reduced-motion` respetado en toda animación.
- **Motion:** solo `transform`, `opacity`, `stroke-dashoffset`, `clip-path`. Nada en bucle fuera de pantalla. Sonido apagado por defecto.
- **Dependencias:** no se agregan sin aprobación explícita.
- Pantalla de carga en cada recarga, con puerta «Conocer a Ignacio» / «Ver portafolio» (`components/Intro.tsx`). El contenido queda en el HTML, inerte mientras la pantalla está abierta.
- SVG propios en `design/svg/` (se incrustan en línea; como `<img>` no reciben las variables CSS).
- `next dev` reescribe `tsconfig.json`: ignorar esos cambios.
