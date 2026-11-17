# Ola 5 · El camino (Work & Projects)

Diseño de Opus (17/11/2026). Técnica elegida por Ignacio: isométrico dibujado en código (SVG con el kit de `anatomy`).
Datos: `lib/career.ts`. Textos: `messages/{es,en}.json` → `career.*`.

## El objeto: una maqueta ferroviaria

La carrera es **una maqueta de tren sobre un tablero largo**. Una vía coral lleva una **zorra** (la pieza encendida,
la única `lit`) de estación en estación. Cada estación es un andén con sus edificios:

| # | Estación | Edificios | Qué los hace reconocibles |
|---|---|---|---|
| 1 | Mar del Plata · a los 17 | la primera web | un escritorio al borde del tablero, con un monitor CRT de pantalla coral y una lámpara; la vía arranca en un tope |
| 2 | TACH Argentina · 2021 – 2022 | estudio-cubo (startup) | cubo bajo, puerta, ventana redonda y mástil con antena; cartel «TACH» |
| 3 | Ada ITW · 2023 – 2024 | academia | pabellón de columnas sobre gradas, con un pizarrón adentro; cartel «ADA ITW» |
| 4 | Tsoft · 2024 – hoy | torre (Tsoft) + anexos Tuenti, CompliA (Telefónica) y Supernova Eventos | torre alta con bandas de ventanas; Tuenti con una ruleta en el techo; CompliA con un rack ventilado; Supernova con un escenario y mástiles |
| 5 | Camino propio · en paralelo | Eclipse, sistema agéntico, Kinetic, Volta, Velmar, DentalOS, games-market, HandyX, Lucero, Trazo | un **ramal** sale de la vía después de Tsoft: es el «en paralelo» del tráiler. Barrio de casas-taller chicas, cada una con un detalle propio |
| 6 | Lo que viene · Planeado | Núcleo, Ciberseguridad, Quant, Aeroespacial | la vía sigue **sin rieles**: solo durmientes y estacas de agrimensor; cuatro lotes marcados con estacas e hilo, sin edificios |

- Los carteles llevan **marcas tipográficas provisorias** hasta que lleguen los logos oficiales (TACH, Ada ITW, Tsoft,
  Telefónica, Tuenti). La página lo dice (`career.logos`).
- La regla de una sola etiqueta en el dibujo no cuenta para los carteles: son parte del objeto, como la pantalla de una
  máquina.
- Lo planeado nunca se dibuja como hecho: sin rieles, sin edificios, solo estacas, hilo y contornos punteados.

## Cómo se usa

- **La cámara viaja.** La tarjeta muestra una ventana sobre el tablero. Al elegir una estación, la cámara se desliza
  (`transform` del grupo del dibujo) hasta encuadrarla. La zorra recorre la vía hasta su andén.
- **Stepper al pie:** 6 estaciones en una lista de pestañas (`role="tablist"`), donde las flechas mueven. «Ver todo»
  aleja la cámara.
- **Edificios:** con clic o foco en un edificio del dibujo, o en su botón de la lista, el edificio **sube** (translate
  hacia arriba con su sombra que se agranda) y la ficha muestra:
  - estado: `StatusTag` o el texto `state`;
  - estación y fechas;
  - una o dos líneas;
  - hasta 3 datos con su fuente (los `facts` del caso);
  - «Ver el caso».
- **Lectura** (abajo a la derecha de la tarjeta): «Estación 4 de 6 · Tsoft · 2024 – hoy».
- **Ver como lista:** todo en HTML (estaciones → edificios → fichas). Es también lo que se ve sin JavaScript.
- **Celular:** la cámara encuadra una estación por vez, con anterior/siguiente; la ficha va debajo. Sin scroll
  horizontal.
- **Movimiento reducido:** la cámara salta sin deslizarse y la zorra aparece en el andén.

## Técnica y peso

- `scripts/camino/build.mjs` (Node, kit `lib/iso/iso-kit.mjs`, copia MIT del de la skill) escribe:
  - `public/media/camino/camino.svg`: el dibujo. `g.cam-world` contiene el tablero, `g.cam-ground` (balasto,
    durmientes, rieles, mar) y `g.cam-stand`, donde cada cosa parada es un `<g data-k="profundidad">`. Los edificios van en
    `g[data-building][data-station]`, y al final está `g.cam-car-at` con la zorra en dos orientaciones
    (`[data-car="x"]`, `[data-car="y"]`).
  - `camino.json`: `frames` (la caja en pantalla de cada estación, `[x, y, w, h]` en unidades del viewBox),
    `buildings` (lo mismo por edificio), `stops` (dónde para la zorra, como arco sobre el recorrido), `journey`
    (`[sx, sy, orientación 0=x 1=y, arco]` cada ~12 unidades) y `depth` (la profundidad en cada punto del recorrido).
    `origin` es dónde cae el (0,0,0) del mundo: la zorra se mueve con `translate(sx − origin.x, sy − origin.y)`.
- **Pintor de la zorra:** el cliente la reinserta dentro de `g.cam-stand`, justo antes del primer `g[data-k]` con una
  profundidad mayor que la suya. Así pasa por detrás de la torre de Tsoft cuando corre por la hilera de atrás.
- **Edificio elegido:** `g[data-building][data-on]` sube con `transform: translateY(-6px)` y su contorno se pone coral
  (`.iso-edge`). Al pasar el puntero sube 3 px. El resto queda igual: nada de atenuar.
- El cliente descarga el SVG recién cuando la sección se acerca a la pantalla y lo incrusta en línea, así reciben las
  variables CSS. No pesa en el HTML de la página: lo que viaja en el HTML es la lista.
- Tokens: `ISO_CSS` del kit, mapeados a los del sitio (`--surface`, `--paper`, `--line`). El coral de la vía es
  `--accent`.
- Peso medido (17/11/2026): 372 KB, 65 KB gzip. Se carga solo al acercarse a la sección. Nada en bucle: solo se anima al
  elegir.

## Verificación

- Capturas de escritorio y de celular (390), y close-ups 4× de cada estación.
- `tests/unit/career.test.ts`:
  - cada estación y cada edificio tiene sus textos en los dos idiomas;
  - los slugs existen;
  - el roadmap es `planeado`;
  - el SVG generado tiene un `data-building` por edificio.
- `tests/e2e/camino.spec.ts`:
  - elegir una estación mueve la cámara y la lectura;
  - flechas en el stepper;
  - clic en un edificio abre su ficha;
  - «Ver como lista»;
  - celular sin scroll horizontal;
  - sin JS se ve la lista.
