# Portafolio de Ignacio Gauna (2026)

Next.js (App Router, `output: 'export'`) + TypeScript + next-intl (es / en) + GSAP. Sitio estático para `portafolio.eclipse-business.com`.

## Comandos
- `npm run dev` · `npm run typecheck` · `npm test` (Vitest) · `npm run build` (→ `out/`) · `npm run test:e2e` (Playwright sobre `out/`; usa Chromium de `/opt/pw-browsers/chromium` o `CHROMIUM_PATH`).

## Reglas
- **Honestidad:** no hay afirmaciones sin respaldo. Cada hito, cargo, fecha, métrica y proyecto sale del registro aprobado por Ignacio. Sin clientes, logos, testimonios ni métricas inventadas. Cada demo, prototipo o proyecto en desarrollo lleva su etiqueta (Demo / Prototipo / WIP / Producción).
- **Confidencialidad:** nada de arquitectura, datos ni capturas internas de Tsoft, Telefónica o Tuenti. Sin salario ni datos privados.
- **Sin copy en componentes:** todo texto sale de `messages/{es,en}.json` (mismas claves; lo verifica `tests/unit/messages.test.ts`).
- **Mobile-first:** sin scroll horizontal a 360 px, gutter de 16 px, objetivos táctiles ≥ 44 px.
- **Accesibilidad:** HTML semántico, teclado completo, foco visible, contraste AA, `prefers-reduced-motion` respetado en toda animación.
- **Motion:** solo `transform`, `opacity`, `stroke-dashoffset`, `clip-path`. Nada en bucle fuera de pantalla. Sonido apagado por defecto. Excepción aprobada: el eje de ancho de Archivo (`--wdth`) en unos pocos titulares del tráiler.
- **Texto legible:** nada por debajo de 12 px en ninguna pantalla (en el tráiler: `max(12px, …)` y container queries para escenarios chicos).
- Grafía del producto: **CompliA**.
- **Dependencias:** no se agregan sin aprobación explícita.
- Pantalla de carga en cada recarga, con puerta «Conocer a Ignacio» / «Ver portafolio» (`components/Intro.tsx`). El contenido queda en el HTML, inerte mientras la pantalla está abierta.
- SVG propios en `design/svg/` (se incrustan en línea; como `<img>` no reciben las variables CSS).
- `next dev` reescribe `tsconfig.json`: ignorar esos cambios.

## Tráiler «Conocer a Ignacio» (120 s)
- `components/TrailerOverlay.tsx` (chunk lazy, `<dialog>` nativo) + `components/trailer/`: una sola timeline GSAP pausada (`scenes.ts`) maneja el texto DOM y el estado del canvas (`state.ts`, `draw.ts`); cualquier segundo se puede buscar y dibuja ese cuadro. Tiempos en `timing.ts`; partitura como datos en `score.ts`; síntesis WebAudio en `audio.ts` (apagado por defecto).
- Formato: 16:9 en horizontal y 9:16 en pantallas verticales (`data-o`). `?t=<segundos>` abre el tráiler pausado en ese cuadro (para QA y capturas).
- Movimiento reducido: no se reproduce; se muestra la versión en texto (con botón para verlo igual).
- El recorte de CompliA (`public/media/complia-demo.mp4`) es de una demo con datos de ejemplo y sin marcas; va rotulado en pantalla.
- Cada texto sale de `messages/*.json` (`trailer.scenes.*`). Cualquier dato nuevo del tráiler tiene que estar respaldado como el resto del sitio.

## Contenido del sitio (fase 9)
- Secciones de la home en `components/sections/Sections.tsx` (`#recorrido`, `#trabajo`, `#laboratorio`, `#metodo`, `#sistema`, `#capacidades`, `#sobre-mi`, `#contacto`); páginas de caso en `app/[locale]/proyectos/[slug]` (complia, tuenti, handyx, eclipse, kinetic). Todo el texto vive en `messages/{es,en}.json`; los enlaces y los slugs en `lib/cases.ts`.
- Reglas de contenido: cada afirmación tiene respaldo aprobado; los proyectos llevan su estado (Producción interna / En desarrollo / Demo / Prototipo / Banco de pruebas); los ejemplos del método son hechos reales, y las lecturas figuran como influencias, no como práctica. Los números de tests del sitio salieron de una corrida real del 27/10/2026 (Eclipse-Web 463, backend 779, portal 132 + 14 recorridos); cualquier cambio de cifra requiere una corrida nueva y una fecha nueva.
- Las entradas con `.reveal` solo se ocultan si hay JavaScript y no hay movimiento reducido (clase `js` en `<html>`).
- Capturas del laboratorio (`public/media/lab/*.webp`, 960×600): son capturas reales de builds locales de cada demo, con sus datos de muestra. Kinetic usa un cuadro de `kinetic-studio/exports/kinetic.mp4`.
- Celulares: botón flotante de contacto (`components/FloatingContact.tsx`), que se oculta cuando hay otro botón de contacto en pantalla.

## QA (fase 11)
- `tests/e2e/a11y.spec.ts`: contraste AA calculado sobre el color real de cada texto, recorrido con teclado (anillo de foco, ≥ 44 px, dentro de pantalla), metadatos de buscadores y redes, y movimiento reducido. `public/og.png` (1200×630) es la imagen para redes.
- Rendimiento medido (CPU 4× y 1,6 Mbps): FCP/LCP ≈ 1,1 s, CLS 0,017; el tráiler no se descarga hasta el clic.

## Deploy
- `.github/workflows/pages.yml`: en cada PR corre typecheck, Vitest, build y Playwright; en `main` publica una copia de prueba en GitHub Pages (`/portafolio-2026`, `noindex`).
- `.github/workflows/hostinger.yml` + `scripts/hostinger-*.sh` + `deploy/hostinger.htaccess`: deploy al subdominio `portafolio.eclipse-business.com`, apagado hasta configurar variables y secretos (`docs/hostinger.md`).
