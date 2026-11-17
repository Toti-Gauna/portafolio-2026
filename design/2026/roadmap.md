# Ola 6 · El roadmap

Diseño de Opus (17/11/2026). Datos: `lib/roadmap.ts` (56 piezas). Textos: `messages/{es,en}.json` → `roadmap.*`.
Figura: `scripts/roadmap/build.mjs` → `public/media/roadmap/roadmap.{svg,json}`. Estilos de la figura:
`components/roadmap/roadmap-figure.css`.

## Decisiones de Ignacio (17/11/2026)

- Las fechas se muestran como **mes y año** («nov 2026 – ene 2027 · 5 semanas»).
- **P0 Consolidación** va como **En desarrollo**, porque ya empezó. Todo lo demás es **Planeado**.
- El roadmap tiene **página propia, `/roadmap`**, fuera del header (que sigue con sus 5 páginas). Llevan a ella la home
  (capítulo «Lo que viene»), el camino de `/trabajo` (estación 6) y el pie.
- Se publica completo, hasta agosto de 2030, **sin precios**. Security+ aparece sin el código del examen («la versión
  vigente al rendirla»). P8, P9, Q2, Q6 y A6 llevan «Propuesto», y A3 y A6 «Recortable», como en su plan.

## El objeto: el terreno relevado

Sigue la maqueta de la Ola 5. Si el camino es la vía construida, el roadmap es **el terreno que viene después**: un
tablero con una grilla de agrimensor marcada, cuatro barrios (las etapas, cada uno con un tono de papel apenas distinto
y una piedra numerada al empezar) y una **línea de agrimensor**. La línea va en serpentina, sin rieles: solo durmientes
claros y una línea de puntos. Recorre las 56 piezas en orden:

| Pieza | Cómo se dibuja |
|---|---|
| Proyecto | Una **maqueta de alambre punteado**, sin rellenos: no está construida. Va sobre su lote, marcado con estacas e hilo, y lleva una placa con su código (P1, S2, Q4…). Seis son dioramas hechos a mano (Faro: el balancín de un pozo y un faro; Escudo: una puerta con un escudo; Surco: surcos con plantines y un mástil de sensores; Estación: una antena parabólica; Lupa: un banco de inspección con una lupa; Horizonte: un cohete en su torre). El resto sale de su nombre: Cripta es una puerta de bóveda, Bastión una muralla, Centinela una torre de vigía, Ábaco un ábaco, Prisma un prisma, Libro un libro abierto, Tablero un panel con barras, Trayectoria un arco balístico, Cuerda una viga reticulada, Túnel un túnel de viento, Rumbo un dron, Órbita un planeta con su órbita. |
| P0 (en desarrollo) | **Medio construido:** una mitad sólida y la otra todavía de alambre. |
| Ventana de matemática (W) | Un **paso a nivel**: dos postes con farol y una barrera a rayas coral que cruza la línea, porque ahí se para la programación. Lleva una placa con su código. |
| Certificación (C) | Una **torre de señales** de reticulado con su farol coral y su placa. |
| Pausa, colchón o cierre | Un **banco** sobre una losa. |

**Color.**
- En reposo, las maquetas son grafito punteado.
- Las de la etapa en pantalla se ponen coral punteado (`[data-stage-on]` en su grupo).
- La elegida se dibuja con una **línea coral entera** (`[data-item][data-on]`): de plan pasa a trazo.
- Lo único coral fijo son las rayas de las barreras y los faroles: indican el estado del camino.

## Página `/roadmap`

1. **`PageHead`:** «Roadmap» / «Lo que viene.» / la bajada (`roadmap.lead`). Debajo va la regla de las ventanas
   (`roadmap.rule`) y el conteo (`roadmap.count`: proyectos, ventanas y certificaciones, calculado de `ROADMAP`).
2. **La maqueta**, con la misma mecánica que el camino (`components/camino/CaminoEngine.tsx`, sin la zorra):
   - el SVG se carga cuando la sección se acerca;
   - la cámara es un solo `transform` sobre `.cam-world` y encuadra `frames[etapa]`; en pantallas angostas, o con una
     pieza elegida, encuadra `items[id]`;
   - una lectura abajo a la izquierda: «Etapa 2 de 4 · Ciberseguridad · feb – ago 2028».
3. **Stepper de 4 etapas** (`role="tablist"`, con flechas, Inicio y Fin). Cada pestaña dice número, nombre y meses.
   Al lado va «Ver como lista».
4. **Panel de la etapa:**
   - nombre, meses y una línea (`roadmap.st.<id>`);
   - la **lista ordenada de sus piezas**: cada fila es un botón con código, nombre, tipo y meses (≥ 44 px). Al
     elegir una, sube su ficha y se enciende su maqueta;
   - la **ficha** muestra: tipo (`roadmap.kinds`), `StatusTag` (Planeado o En desarrollo), «Propuesto» o
     «Recortable» si corresponde, meses · semanas, «Con: …» (`tech`), lo que contiene (`what`) y, en las ventanas,
     «Nivel de salida» (`exit`) y «Habilita» (`opens`).
5. **Sin JavaScript o con «Ver como lista»:** las cuatro etapas una debajo de la otra, cada una con todas sus fichas
   (56). Es el HTML del servidor.
6. Al pie, «Volver al trabajo» (`roadmap.back`).

Los meses se formatean en el servidor con `Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })`. Si
`from` y `to` caen en el mismo año, se escribe el año una sola vez: «feb – ago 2028».

## Enlaces que cambian

- **Home, capítulo «Lo que viene»** (`lib/taller.ts`): `href: '/roadmap'`, con `cta` = «Ver el roadmap» / «See the
  roadmap» (sale el «Próximamente»). Sus 4 referencias de la Ola 4 suman `go: { href: '/roadmap' }` y su `cta`.
- **El camino, estación 6:** cada ficha (core, cyber, quant, space) lleva un enlace a `/roadmap` (`career.toRoadmap`).
- **Pie** (`Footer`): «Roadmap» en la lista de páginas.
- **`app/sitemap.ts`**, `components/scene/routes.ts` (fondo `default`) y `tests/unit/pages.test.ts`.

## Pruebas

- **Unitarias (`tests/unit/roadmap.test.ts`):**
  - 56 piezas en orden de fechas, sin huecos ni solapes (cada `from` es el día siguiente del `to` anterior);
  - las semanas coinciden con los días;
  - cada pieza tiene `name` y `what` en los dos idiomas; las ventanas llevan `opens`; los proyectos llevan `tech`
    (salvo P0);
  - ningún texto tiene precios (`US$`, `USD`, `$`) ni «SY0-»;
  - todas son `planeado` salvo P0;
  - el SVG tiene un `data-item` por pieza y el JSON un encuadre por etapa y por pieza.
- **e2e (`tests/e2e/roadmap.spec.ts`):**
  - la página carga la maqueta con sus 56 piezas;
  - el stepper (clic y teclado) mueve la cámara y la lectura;
  - una fila enciende su maqueta y abre su ficha;
  - «Ver como lista» muestra todo;
  - sin JS se ve la lista;
  - en celular, filas ≥ 44 px y sin scroll horizontal;
  - la home y el camino llevan a `/roadmap`.

Peso medido de la figura (17/11/2026): 408 KB, 70 KB gzip. Se carga solo al acercarse.
