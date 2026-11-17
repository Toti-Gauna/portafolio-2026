# Ola 8c · Video y tráileres

Diseño del 17/11/2026. Página `/video` (fuera del header, que tiene seis; `EXTRA_PAGES` la suma al pie y al sitemap).
Datos: `lib/video.ts`. Textos: `messages/{es,en}.json` → `video.*`. Los videos y sus pies salen de los casos
(`messages/cases/<idioma>/<slug>.json` → `blocks.media.items`), así no se repite ni se contradice lo que ya dice cada caso.

## Qué es

La casa de todo lo que se mueve en el portafolio: los tráileres hechos con código, los recorridos grabados de cada demo,
cómo se edita y en qué formatos, y la prueba de Remotion. Todo se reproduce solo al entrar en pantalla, sin sonido, con su
botón de pausa (`MediaPlayer`); con movimiento reducido no arranca solo.

## Orden de la página

1. **Portada:** «Video» / «Video y tráileres.» / bajada y la nota de honestidad (demos con datos de muestra, marcas de
   clientes y pantallas de dinero tapadas).
2. **01 · Tráileres hechos con código (Kinetic Studio):** la idea (sin editor de video, sin material de stock y sin audio
   grabado: cada pieza es código), tres cifras del caso (31 tráileres en el hub, 1.430 s de película y 272 escenas), los seis videos de Kinetic, y tres acciones: **ver «Conocer a Ignacio»** (abre el tráiler), el caso
   y el hub público.
3. **02 · Recorridos de producto:** un grupo por proyecto (Eclipse, CompliA, Volta, Velmar, DentalOS, Supernova, games-market)
   con su estado, una línea y sus videos (solo los que son video; las capturas quedan en el caso), y el enlace al caso.
4. **03 · Edición y formatos:** cuatro hallazgos del código, cada uno con su proyecto:
   - la misma película en 16:9 y en 9:16 (el tráiler del portafolio);
   - un cuadro en cualquier segundo (la línea de tiempo pausada, `?t=`);
   - el estudio de contenido de Volta y Velmar (post 1:1, historia 9:16 y carrusel 4:5 en PNG o video, con música
     sintetizada; en la demo es simulado);
   - la exportación a MP4 (existe un exportador fuera del repo; la prueba dio 2 de 4 momentos idénticos al bit).
5. **04 · Remotion, la prueba:** dos recorridos dibujados con `Flow` (Kinetic: se ve en vivo en el navegador; Remotion:
   componente de React → render → MP4) y los hechos de la prueba.
6. Cierre: contacto.

## La prueba de Remotion (17/11/2026)

Hecha en una carpeta aparte, **fuera del repo** (no se agregó ninguna dependencia: regla del proyecto): una composición de
React de 2 s (60 cuadros a 30 por segundo, 1280×720) renderizada con Chromium a H.264 en unos 20 segundos. **Funciona.**
- No está en el repo ni en ninguna pieza publicada: la página lo dice.
- Licencia (leída en su `LICENSE.md`): gratis para individuos, organizaciones de hasta 3 personas y evaluación; una empresa
  más grande necesita licencia. **Ignacio tiene que confirmar si su uso entra en la gratuita antes de sumarlo a un proyecto.**
- Para qué lo usaría (criterio mío, rotulado así): para entregables en MP4 con salida determinista (shorts, recortes para
  redes), mientras Kinetic sigue para piezas que viven en una página.

## Cambios en otras páginas

- Home, capítulo «Video y tráileres»: el capítulo lleva a `/video`; sus referencias siguen a Kinetic y al tráiler.
- `nav`: `EXTRA_PAGES` suma `video` (pie y sitemap). Zona de música `brand`; el fondo es el de Kinetic.
- **Corrección:** el caso de Kinetic describía el tráiler viejo (112 s, ocho actos, once vistas). Se actualizó a la
  película actual (130 s, 15 escenas, siete actos, seis vistas, 17 animaciones, edición 9:16, reproducción al 85 %).

## Pruebas

- Unitarias (`tests/unit/video.test.ts`): cada grupo apunta a un caso con su bloque `media`; los videos existen en
  `public/media`; copy completo en los dos idiomas; ninguna afirmación de resultados, importes ni marcas de clientes;
  la prueba de Remotion dice «fuera del repo» y no hay `remotion` en `package.json`.
- e2e (`tests/e2e/video.spec.ts`): carga, siete grupos con sus videos, «Ver Conocer a Ignacio» abre el tráiler, sin scroll
  horizontal a 360 px, movimiento reducido (los videos no arrancan solos) y contraste AA.
