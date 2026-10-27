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

## Tráiler «Conocer a Ignacio» (120 s)
- `components/TrailerOverlay.tsx` (chunk lazy, `<dialog>` nativo) + `components/trailer/`: una sola timeline GSAP pausada (`scenes.ts`) maneja el texto DOM y el estado del canvas (`state.ts`, `draw.ts`); cualquier segundo se puede buscar y dibuja ese cuadro. Tiempos en `timing.ts`; partitura como datos en `score.ts`; síntesis WebAudio en `audio.ts` (apagado por defecto).
- Formato: 16:9 en horizontal y 9:16 en pantallas verticales (`data-o`). `?t=<segundos>` abre el tráiler pausado en ese cuadro (para QA y capturas).
- Movimiento reducido: no se reproduce; se muestra la versión en texto (con botón para verlo igual).
- El recorte de ComplIA (`public/media/complia-demo.mp4`) es de una demo con datos de ejemplo y sin marcas; va rotulado en pantalla.
- Cada texto sale de `messages/*.json` (`trailer.scenes.*`). Cualquier dato nuevo del tráiler tiene que estar respaldado como el resto del sitio.
