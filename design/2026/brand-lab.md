# Ola 8a · El Brand Lab

Diseño de Opus (17/11/2026). Datos: `lib/brands.ts`. Dibujos: `components/brandlab/`. Textos: `messages/{es,en}.json` →
`brandlab.*`. Hechos de cada marca: el código de su repo (relevamiento en el scratchpad de la sesión, `o8/brands.md`).

## Decisiones de Ignacio (17/11/2026)

- El Brand Lab es **una página del header**: `/brand-lab`, la cuarta, en el orden de la home (Trabajo, Cómo trabajo,
  Capacidades, **Brand Lab**, Negocio, Sobre mí). El header pasa de cinco a seis enlaces y tiene que seguir entrando en
  una fila desde 768 px.
- **Velmar va con su logo** (la «M» sobre la «V», redibujada en la demo a partir de su Instagram), rotulado como marca
  del cliente con el sistema que armé para la demo. La paleta de la demo es **provisional** (así lo dice el repo) y el
  tablero lo dice.
- **Dos ejercicios nuevos**, inventados para el lab y rotulados «Ejercicio de marca»: **Sereno** (una panadería de masa
  madre que hornea de madrugada) y **Brote** (un vivero de plantas de interior). No existen; no copian a ningún negocio.

## Las ocho marcas y su rótulo

| Marca | De quién | Rótulo | Sale de |
|---|---|---|---|
| IG | Ignacio (su marca personal) | Marca propia | `design/svg/brand`, tokens del sitio |
| Eclipse | El estudio de Ignacio | Marca propia | la reconstrucción del tráiler (`public/trailer/v2/js/shots/eclipse.js`) |
| Velmar | Cliente real | Marca del cliente · sistema de la demo | `velmar-ecommerce-` |
| Volta | Ficticia (demo de venta) | Ejercicio de marca | `supplements-ecommerce` |
| DentalOS | Ficticia (demo de preventa) | Ejercicio de marca | `DentalOS` |
| Lucero | Ficticia (demo de producto) | Ejercicio de marca | `foody` |
| Sereno | Ficticia, nueva | Ejercicio de marca | este diseño |
| Brote | Ficticia, nueva | Ejercicio de marca | este diseño |

Las marcas de las demos usan **lo que está en su código**: hex exactos, fuentes y el logo como se dibuja en el repo. Lo
que el tablero agrega (patrones y aplicaciones que el producto no tiene) va dibujado en código y se presenta como
aplicación de ejemplo, no como algo que exista.

## El objeto: la imprenta

El capítulo 6 de la home es una imprenta de serigrafía. La página sigue esa idea: cada tablero es **un pliego impreso**
sobre la mesa de tinta del sitio, con marcas de corte en las esquinas y una tira de control de color en el borde (las
pastillas de la paleta, como en un pliego de imprenta). Fuera del pliego todo es el cartel suizo del sitio; dentro, la
marca manda: su fondo, sus colores y sus tipografías.

## Página `/brand-lab`

1. **`PageHead`:** «Brand Lab» / «Cómo doy marca.» / la bajada.
2. **El método, en una fila de cuatro pasos:** la idea y el lugar en una frase → la paleta con nombres → las
   tipografías → el logo al final, y después las aplicaciones (`brandlab.method`). Sale de la skill `brand-board-svg`.
3. **El selector** (`role="tablist"`, flechas, Inicio y Fin): una pestaña por marca con su nombre en su propia fuente,
   tres pastillas de su paleta y su rótulo. En celular, una grilla de dos columnas (sin scroll horizontal). `#marca-<id>`
   abre esa marca.
4. **El pliego** (un tablero por vez con JS; sin JS, los ocho uno debajo del otro):
   - **Cabecera:** nombre, rótulo (`StatusTag` «Ejercicio de marca» en las ficticias), la idea en una frase y dónde vive.
   - **A · Logo principal**, grande, sobre el color principal.
   - **B · Logo secundario** (apilado o reducido) y **C · submark**, lado a lado.
   - **D · Paleta:** 5–6 círculos con nombre propio, hex y para qué se usa.
   - **E · Tipografía:** «Aa» de la fuente de títulos y la de texto, con abecedario, números y el nombre de cada familia.
   - **F · Patrones:** tres mosaicos hechos con el submark y las formas de la marca.
   - **G · Aplicaciones:** tres piezas dibujadas (cartel, envase o etiqueta, pantalla), con textos de ejemplo.
   - **Pie:** «Sale de: …» (el repo o «este ejercicio») y lo que no afirmo (p. ej. «paleta provisional», «la marca es
     del cliente»).
   En escritorio es una grilla de 12 columnas (A ocupa 7 y dos filas; B y C a la derecha; D a lo ancho; E y F mitad y
   mitad; G a lo ancho). En celular, una columna en el mismo orden.

## Movimiento

Una sola curva firma (`--ease-expo`). Al abrir un tablero (o al entrar en pantalla sin JS de pestañas):

1. El logo principal se dibuja: los trazos con `stroke-dashoffset` y los rellenos con un `clip-path` que barre (0–700 ms).
2. Los círculos de la paleta caen uno por uno (opacidad + `translateY`, 70 ms entre cada uno).
3. Los patrones se revelan con `clip-path: inset()` de izquierda a derecha.
4. Las aplicaciones aparecen al final, levemente elevadas.
- Hover sobre el submark: sube 4 px y gira 6°.
- Movimiento reducido: todo en su estado final, sin transiciones.
- Nada en bucle.

## Accesibilidad

- Cada SVG lleva `role="img"` y un nombre: «Logo de Volta», «Envase de Volta, de ejemplo».
- La paleta es una lista (`<ul>`) con el nombre y el hex en texto real.
- El contraste de cada texto se mide sobre su fondo real. Los textos de las piezas de ejemplo (dentro de los mockups) son
  imagen de la marca y van con su nombre accesible.
- Las pestañas y la lista tienen ≥ 44 px.

## Sonido y fondo

Zona de música `brand` (como Capacidades y Negocio) y el fondo `default`.

## Enlaces que cambian

- `lib/nav.ts`: `PAGES` suma `{ key: 'brand', href: '/brand-lab' }` en cuarto lugar.
- La home, capítulo 6 (`lib/taller.ts`): `href: '/brand-lab'`, sin «Próximamente». Sus dos referencias llevan
  `go: { href: '/brand-lab' }` y `/brand-lab#marca-sereno`.
- `app/sitemap.ts`, `components/scene/routes.ts`, `lib/zones.ts`, `tests/unit/pages.test.ts` (seis enlaces) y el e2e del
  header.

## Pruebas

- **Unitarias:** cada marca tiene paleta de 5–6 colores con hex válidos, textos en es y en, rótulo coherente (las
  ficticias son «ejercicio»); los hex de Volta, Velmar, DentalOS y Lucero coinciden con los del relevamiento.
- **e2e:**
  - la página carga con su h1 y el primer tablero;
  - las pestañas (clic y flechas) cambian el tablero y el hash, y `#marca-velmar` abre Velmar;
  - las ficticias muestran «Ejercicio de marca»;
  - sin JS se ven los ocho;
  - en celular no hay scroll horizontal y las pestañas miden ≥ 44 px;
  - con movimiento reducido no hay transiciones;
  - el header tiene seis enlaces en una fila a 1024 y a 1440.
