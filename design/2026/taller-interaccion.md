# Ola 4 · Interacción sobre las escenas del Taller

Diseño: Opus (17/11/2026). Código: Sonnet. Fuente de los datos: `lib/taller.ts` (`Spot`, `CHAPTERS[i].spots`). Textos:
`messages/{es,en}.json` → `taller.spots.*` (genéricos) y `taller.ch.<key>.spots.<id>.{name, text, cta?}`.

Reemplaza el «kit isométrico 3D» del plan original. Las escenas ilustradas y los videos ya hacen ese trabajo. Lo que
faltaba era poder **señalar** cosas dentro de cada escena y que respondan.

## La idea: láminas con referencias

Cada escena es una lámina de grabado. Como en una lámina técnica, lleva **referencias numeradas**: un cuadradito con
un número, puesto sobre la cosa a la que se refiere. Pasa esto:

1. **Pasar el puntero o enfocar con el teclado** sobre una referencia:
   - Al lado del número asoma su nombre: una etiqueta de tinta que se revela con `clip-path`, de izquierda a derecha.
   - Alrededor del edificio u objeto se dibuja un contorno coral punteado (`stroke-dashoffset`).
   - Ese recorte de la escena **se eleva**: sube unos píxeles y debajo aparece su sombra. Es la «elevación» que prometía el plan.
2. **Clic, Enter o Espacio:** se abre la **ficha**. Lleva el rótulo, el estado si tiene, una o dos líneas y la acción.
3. Solo hay una ficha abierta por vez. Se cierra con Escape (el foco vuelve a la referencia), con un clic afuera, con el botón «Cerrar» o al seguir scrolleando.

El hero es el **índice del taller**: sus 8 referencias llevan el número de figura de cada capítulo (02, 03 … 10). La
ficha de cada una muestra el título y la frase de ese capítulo, más «Ir a la escena» (`#taller-<key>`).

Nada se mueve solo. Todo responde al visitante y solo usa `transform`, `opacity`, `clip-path` y `stroke-dashoffset`.

## Qué hay en cada escena (datos en `lib/taller.ts`)

| # | Capítulo | Referencias |
|---|---|---|
| 0 | Hero | torre → recorrido · hangar → trabajo · templo → cómo trabajo · cúpula → capacidades · techo de vidrio → Brand Lab · anfiteatro → negocio · cine → video · faro → contacto |
| 1 | Origen | la laptop (la primera web) · la ventana (Mar del Plata) · los libros (autodidacta → /negocio) |
| 2 | Recorrido | cubo → TACH · academia → Ada ITW · torre → Tsoft. Sin logos hasta la Ola 5 |
| 3 | Trabajo | paneles flotantes → CompliA (Producción interna), Eclipse (En desarrollo), Volta (Demo) · el piso del hangar → el laboratorio |
| 4 | Cómo trabajo | la consola central → la puerta humana · un módulo → 11 agentes · otro módulo → primero la especificación |
| 5 | Capacidades | laptop → en el trabajo · esfera armilar → en mis proyectos · telescopio → estudiando |
| 6 | Brand Lab | la prensa → tableros de marca (sin enlace: «Próximamente») · el tablero coral → ejercicios de marca (estado Ejercicio de marca) |
| 7 | Negocio | dos arcos → The Lean Startup, The Mom Test · el cubo del embudo → Blue Ocean Strategy (`/negocio#lean|mom|blue`) |
| 8 | Video | la pantalla → Kinetic Studio · el proyector → el tráiler (abre «Conocer a Ignacio» con `TrailerButton`) |
| 9 | Roadmap | las maquetas punteadas → energía, agro, finanzas, espacio. Todas «Planeado», sin enlace |
| 10 | Contacto | ninguna: el capítulo ya tiene sus acciones |

Las referencias están siempre del lado del edificio. No caen sobre la columna de texto, que tapa del 4 % al 43 % o del
57 % al 96 % del ancho. Cada texto de ficha sale de lo ya aprobado en el sitio (tarjetas de trabajo, sistema, capacidades,
negocio, transcripción del tráiler). Antes de mergear, `content-guardian` lo revisa.

## Marcado (uno solo, sirve en todos los modos)

Va dentro de cada `article.tch`, después de `.tch__body` y dentro de `.tch__pin`:

```html
<div class="tch__map" data-map>
  <svg class="tch__shapes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <polygon data-shape="<id>" points="…" pathLength="100" />
  </svg>
  <p class="tch__spots-label label">En esta escena</p>
  <ul class="tch__spots">
    <li class="tch__spot" data-spot="<id>" data-open="left|right" data-v="up|down" style="--x: 44.3%; --y: 15%">
      <details name="taller-<key>">
        <summary class="tch__mark">
          <span class="tch__num">01</span><span class="tch__tag">CompliA</span>
        </summary>
        <div class="tch__card">
          <p class="tch__card-fig label">Fig. 03.1</p>
          <!-- StatusTag si tiene estado -->
          <p class="tch__card-text">…</p>
          <!-- Link .tch__go con la cta · TrailerButton · <p class="tch__soon"> si no hay destino -->
        </div>
      </details>
    </li>
  </ul>
</div>
```

- **`<details>`/`<summary>`:** son una revelación nativa. Funcionan sin JavaScript, con teclado y con lector de pantalla.
  El atributo `name` (acordeón exclusivo) deja una sola abierta en los navegadores actuales; el JS lo refuerza en el resto.
- **Numeración:** en el hero, el número de figura del capítulo de destino (`02`…`10`). En el resto, `01`, `02`… en el
  orden de `spots`. La ficha muestra «Fig. <capítulo>.<n>».
- **Lado de apertura:** se calcula al compilar. `data-open` vale `left` si x > 62, `right` si x < 38; en el medio, se abre
  hacia el lado opuesto al texto. `data-v` vale `up` si y > 55, si no `down`.
- **Hero:** el nombre de la etiqueta es `taller.ch.<destino>.title`, el texto de la ficha es `taller.ch.<destino>.heading`
  y la acción es «Ir a la escena».

## Modo plano (celulares, tablets en vertical, movimiento reducido, sin JS)

- `.tch__map` queda en el flujo, debajo del texto del capítulo, como una lista: «En esta escena», y cada referencia es
  una fila (número + nombre, 44 px de alto como mínimo, borde inferior `--line`) que se despliega con su ficha.
- No hay contorno ni elevación: el SVG y la capa de elevación no se muestran.
- Sin scroll horizontal a 360 px.

## Modo recorrido (≥ 900 px con movimiento permitido: `.taller[data-mode='scroll']`)

- **Capa de referencias:** `.tch__map` tiene `position: absolute` dentro de `.tch__pin` (el sticky es su bloque contenedor)
  y la misma caja que la escena vista con `contain`:
  `left: 50%; top: 50%; width: min(100%, calc(100svh * 2400 / 1357)); aspect-ratio: 2400 / 1357; transform: translate(-50%, -50%)`.
  Lleva `pointer-events: none`; los `li` llevan `auto`. Cada `li` es `position: absolute; left: var(--x); top: var(--y)`,
  centrado en su punto. El texto del capítulo (`.tch__body`) va por encima (`position: relative; z-index: 2`).
  La etiqueta «En esta escena» queda solo para lectores de pantalla (`sr-only`).
- **Referencia (`summary`):** caja de 44×44 de objetivo. El cuadradito visible mide 30 px: borde de 1 px `--paper`, fondo
  `--ink` al 85 %, el número en mono de 13 px. Abierta o activa: fondo `--accent` y número en `--ink`. Foco: el anillo de
  foco del sitio. Sin marcador de `details` (`list-style: none` y `::-webkit-details-marker`).
- **Etiqueta (`.tch__tag`):** pegada al cuadradito, del lado de `data-open`. Fondo `--ink`, texto `--paper`, 14 px, peso 700.
  Cerrada: `clip-path: inset(0 100% 0 0)` (o `0 0 0 100%` si abre a la izquierda). Activa: `inset(0)`. Duración: 220 ms.
- **Ficha (`.tch__card`):** 300 px de ancho (máximo `calc(100vw - 32px)`), fondo `--surface`, borde de 1 px `--line`,
  padding de 16 a 18 px y radio 0. Dos marcas de esquina coral, arriba a la izquierda y abajo a la derecha, hechas con
  `::before` y `::after` (10 px, 2 px de grosor): son los marcos de esquina del sistema. Se ubica al lado del número,
  según `data-open` y `data-v`. Entra con `opacity` 0 → 1 y `translate` de 6 px en 200 ms. Texto de 15 px en `--soft`. La
  acción usa `.tch__go`. Arriba a la derecha va «Cerrar» (44 px, `aria-label` = `taller.spots.close`).
- **Contorno (`.tch__shapes polygon`):** `fill: none`, `stroke: var(--accent)`, 1,5 px con `vector-effect: non-scaling-stroke`,
  `stroke-dasharray: 2 1.2`. En reposo, `opacity: 0`. Activa: opacity 1 y se dibuja con `stroke-dashoffset` (truco: un
  segundo trazo continuo, con `pathLength=100`, `dasharray 100` y `dashoffset` de 100 → 0, en 450 ms).
- **Elevación:** una capa en el escenario, `.taller__lift`, con la misma caja que la escena. Adentro van dos cosas:
  - `.taller__lift-shadow`: un `div` de color `--ink` con `clip-path: polygon(...)` del recorte, corrido `translate(0.3%, 0.9%)`.
    La opacidad va de 0 a 0,55.
  - `.taller__lift-img`: un `<img>` con el `currentSrc` de la escena actual, el mismo `clip-path` y
    `translate(0, -0.8%) scale(1.01)` (origen en el centro del recorte).

  La capa está una sola vez, y el JS cambia `src` y `clip-path` al activar una referencia. Transición de 280 ms con `--ease`.
- **Activar** es pasar el puntero (solo con `pointer: fine`), enfocar o abrir; el estado vive en `li[data-active]`.
  Desactivar es salir o perder el foco, salvo si la ficha está abierta.
- **Al scrollear:** el motor (`TallerEngine`) aplica a `.tch__map` la misma opacidad y el mismo desplazamiento que a
  `.tch__body`. Cuando la escena empieza a irse (`out > 0`), cierra la ficha abierta, desactiva la elevación y pone
  `inert` en el mapa; lo quita cuando vuelve a 0.

## JavaScript (`components/taller/TallerSpots.tsx`, cliente, un solo efecto)

- Un oyente delegado sobre `[data-taller]` atiende `toggle` de los `details` (en captura). Al abrir una, cierra las
  demás, marca `data-active` y suena `playCue('click')`. Ojo: el oyente común de `lib/ui-sounds.ts` no cubre `summary`.
  Hay que agregar `summary` a su selector `CONTROL`, así el hover hace «tick» como los botones.
- Escape cierra la abierta y devuelve el foco a su `summary`. Un clic fuera de `.tch__spot` cierra la abierta.
- En modo recorrido, al activar mueve `.taller__lift` (src de la escena del capítulo actual, `clip-path` del `poly`). Fuera
  del modo recorrido no hace nada visual.
- El hero lleva enlaces `#taller-<key>`: el navegador salta al capítulo. En modo recorrido, el salto cae al inicio del
  capítulo, que es su escena quieta.
- Nada en bucle; sin `requestAnimationFrame` propio, salvo el del motor.

## Accesibilidad

- `summary` se lee como «01 CompliA, contraído/expandido». El nombre siempre está en el DOM: la etiqueta se oculta con
  `clip-path`, no con `display`.
- Lista con nombre: `ul` con `aria-labelledby` a la etiqueta «En esta escena».
- Foco visible en `summary` y en la acción de la ficha; contraste AA de la ficha sobre `--surface`. Cada `li` es un
  objetivo ≥ 44 px.
- Movimiento reducido: modo plano (como hoy). La ficha aparece sin traslación.
- `.taller__lift` y `.tch__shapes` llevan `aria-hidden`.

## Rendimiento y memoria

- Una sola `<img>` extra en el escenario, que reutiliza el archivo de la escena (está en caché). Sin `will-change` fijo:
  solo mientras está activa.
- Medido (17/11/2026): el HTML de la home pasó de 16,5 a 25,0 KB gzip (35 referencias con su ficha, contando el payload
  de Next). El objetivo de sumar menos de 4 KB no se cumplió: casi todo es texto real que debe estar en el HTML. Los
  contornos ya no viajan (se dibujan desde un solo atributo `data-poly`).

## Pruebas

- **Unitarias (`tests/unit/taller.test.ts`):**
  - ids únicos por capítulo.
  - `at` y `poly` dentro de 0–100, `poly` con 3 puntos o más y el marcador dentro de su polígono (punto en polígono).
  - Referencias del lado del edificio (`building: 'left'` → x < 58; `'right'` → x > 42).
  - Hero: cada `go.chapter` existe y no apunta a sí mismo.
  - Cada referencia que no es del hero tiene `name` y `text`, y `cta` si tiene `href` o `trailer`.
  - Las de roadmap llevan `planeado`.
- **e2e (`tests/e2e/content.spec.ts`, 1440×900):**
  - Pasar el puntero sobre una referencia muestra la etiqueta y la elevación (opacidad > 0 en `.taller__lift-img`).
  - Clic abre la ficha con su acción.
  - Abrir otra cierra la primera.
  - Escape cierra y devuelve el foco.
  - Seguir scrolleando cierra la ficha.
  - Desde el hero, «Ir a la escena» lleva al capítulo.
- **e2e (390×844):** la lista se despliega, objetivos ≥ 44 px, sin scroll horizontal.
- **e2e (a11y):** el contraste AA y el recorrido con teclado incluyen las fichas abiertas.
- **QA visual:** capturas de cada escena con todas las referencias activas, a 1440×900 y 1280×720. Revisar que no
  pisen el texto y que el contorno coincida con su edificio.
