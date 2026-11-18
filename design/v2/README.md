El sistema del portafolio de Ignacio Gauna (Sr AI Fullstack Developer, Mar del Plata). Un solo mundo: índigo profundo y un espectro de cinco colores, uno por cada capa del oficio (planificación y ejecución, código, agentes, tests y deploy). Todo se dibuja a mano y en código: nada de fotos de stock, ilustraciones genéricas ni logos de marcas.

## Voz y contenido

- Escribí en español rioplatense (vos, «mirá», «tocá») con la versión en inglés al lado: las dos tienen las mismas claves y se revisan juntas.
- Senior y en positivo. Nunca anuncies lo que falta («sin clientes», «no medido», «sin probar»): lo pendiente se cuenta como próximo paso.
- No afirmes nada sin respaldo: cada cargo, fecha, cifra y proyecto sale del registro aprobado. Las cifras que se usan hoy son reales: «1.374 tests en verde en Eclipse», «11 agentes en el sistema», «desarrollador desde 2021».
- El rol se escribe «Sr AI Fullstack Developer», con el «Sr» en su propio bloque (`RoleBadge`). Nunca «Ssr».
- El producto se escribe **CompliA**. El sistema de trabajo se presenta como «un sistema agéntico, dividido en partes», con sus 11 agentes.
- Cada proyecto lleva su estado con un nombre en positivo (`StatusBadge`): En producción, En producción interna, En construcción, MVP, Demo, Prototipo, Laboratorio, En el roadmap, Ejercicio de marca, Trabajo profesional.
- Botones con verbos concretos: «Conocer a Ignacio», «Explorar el portafolio», «Ver el caso». Una sola acción principal por pantalla.
- Sin emoji. Los datos de ejemplo se rotulan «Datos de ejemplo».

## Color

- El fondo es `color-bg`, y la página entera lleva `gradient-page` encima, con la trama `gradient-grid` cada `size-grid`.
- Superficies: `color-surface` para paneles y tarjetas, `color-surface-raised` para lo que flota más alto. Bordes con `color-line`; los controles con `color-line-strong`. Los rellenos de vidrio usan `color-glass`.
- Texto: títulos en `color-heading`, cuerpo en `color-text`, secundario en `color-text-muted`, rótulos en `color-text-subtle`. Los cuatro pasan AA sobre `color-bg`, `color-bg-deep`, `color-surface` y `color-surface-raised`. `color-text-faint` es solo decoración (números de línea, guías): no pasa AA y nunca lleva texto que haya que leer.
- El espectro es el de las cinco capas, siempre en este orden y con su par `-from` → `-to`: `layer-plan-*` (ámbar), `layer-code-*` (coral), `layer-agents-*` (rosa a lila), `layer-tests-*` (menta a lima) y `layer-ship-*` (azul a celeste). Cada color de capa se lee como rótulo sobre `color-bg` (AA). Usá el color de una capa para hablar de esa capa, no para decorar.
- El coral y el azul de IG (`color-coral-ig`, `color-blue-ig`) siguen siendo la raíz. `color-blue-ig` no llega a AA sobre el fondo: usalo en rellenos y trazos, nunca como color de texto.
- La acción principal es coral liso (`color-coral-500`, `color-coral-400` al pasar el puntero) con texto `color-on-accent`, las esquinas de los campos (`radius-md`) y sin brillo. `gradient-brand` queda para el «Sr» del rol. El apellido del nombre usa `gradient-name`; la palabra «soluciones», `gradient-solutions`.
- Estados: `color-success` (menta), `color-warning` (ámbar) y `color-danger` (coral claro). Cada estado lleva también una palabra o un ícono: nunca solo el color.
- El foco es `color-focus` (ámbar): un anillo sólido de 2 px a 3 px de distancia (`shadow-focus` cuando va como sombra). Pasa 3:1 sobre el fondo y sobre el botón de marca.
- La paleta cambia en un solo lugar: las estampillas, que son tinta plana sobre papel crema y siempre quedan dentro de su propio marco.

## Tipografía

- Dos familias: `sans` (Archivo, con su eje de ancho) para todo, y `mono` (JetBrains Mono) para lo técnico, los rótulos y los números alineados.
- El nombre va en `display`: Archivo 800 con ancho 112, interlineado .86 y espaciado -0.045em. En la web va de 68 px en celular a 128 px en escritorio (`clamp`). «Ignacio» en `color-heading` y «Gauna» en `gradient-name`.
- Títulos de página en `h1`, de sección en `h2`, de bloque en `h3`. La bajada va en `lead`. El cuerpo, en `body` (17 px, interlineado 1,55, 62 caracteres de ancho como máximo).
- Los rótulos van en `label`: mono 12,5 px, 700, mayúsculas y espaciado .12em, en `color-text-subtle`.
- Nada baja de 12 px en ninguna pantalla. Los objetivos táctiles miden `size-touch` (44 px) como mínimo.

## Espacio y forma

- Escala de 4 px: de `space-1` (4 px) a `space-32` (128 px). Separá grupos con `gap`, no con márgenes sueltos.
- Margen lateral `size-gutter` (16 px) en celular, `size-margin-tablet` desde 600 px y `size-margin-desktop` desde 1100 px. Ancho máximo `size-max`.
- Radios suaves: `radius-md` en controles y botones, `radius-2xl` en tarjetas de vidrio y paneles, `radius-pill` en chips y estados.
- Alturas fijas: botones `size-button` (48 px); el header ocupa `size-header` (64 px) arriba de cada página.
- Puntos de quiebre: `bp-sm` 360, `bp-md` 600, `bp-lg` 1100, `bp-xl` 1440. Sin scroll horizontal a 360 px.

## Profundidad

- `shadow-panel` en tarjetas y paneles que flotan sobre el índigo. Nada más proyecta sombra: la acción principal se distingue por su color, no por un brillo.
- El vidrio es un relleno claro casi transparente sobre el índigo, con borde `color-line` y un halo del color de su capa arriba a la izquierda. Sin `backdrop-filter`. La única excepción es la píldora del header, y solo con mouse: en pantallas táctiles su relleno es sólido.
- Orden de apilado: `z-base`, `z-raised`, `z-header`, `z-overlay`, `z-dialog`.

## Movimiento

- Una curva firma, `cubic-bezier(0.16, 1, 0.3, 1)`, y tres duraciones: 150 ms para responder, 400 ms para cambiar de estado y 700 ms para entrar. Escalonado de 60 ms como máximo.
- Solo se animan `transform`, `opacity`, `clip-path` y `stroke-dashoffset`.
- Nada se mueve fuera de pantalla ni en bucle: las piezas corren una vez al entrar, o mientras la persona las toca, y se quedan quietas.
- Con `prefers-reduced-motion`, cada pieza muestra su cuadro final y los cambios son instantáneos. Sin JavaScript, también.
- El sonido empieza apagado y se recuerda en el dispositivo (`SoundToggle`).
- Un solo motor de motion (`v2/components/motion/MotionRoot.tsx`) reparte seis comportamientos con atributos: `data-reveal` (lo de abajo del pliegue entra al llegar, escalonado), `data-magnetic` (la acción se inclina hacia el mouse), `data-cursor="Ver caso"` (el anillo de luz que sigue al cursor dice qué hace el clic), `data-scroll` (la escena recibe `--p` de 0 a 1 con el scroll), los atajos de una tecla (`?` muestra la ayuda y desde ahí se apagan) y el cambio de página como un movimiento de cámara: hacia adelante en el menú entra por la derecha, hacia atrás por la izquierda, las páginas del sistema en profundidad. Todo vivo en `/v2/es/motion/`.
- Nada pide cuadros por su cuenta: cada uno lo pide el puntero, el scroll o una tecla, y todo se detiene al llegar.

## Iconografía

- Un set propio de 42 íconos en cuatro familias: interfaz, capas del oficio, técnica y rubros. Están en `assets/Icons/`.
- Grilla de 24 × 24, trazo de 1,75 con puntas y uniones redondas. En la web el trazo toma el color del texto (`currentColor`); los archivos de `assets/Icons/` vienen en tinta `color-ink-850` para verse sobre fondo claro.
- La regla firma: los íconos de interfaz son un solo trazo; los de concepto llevan UNA pieza de acento rellena, como el punto del monograma. El acento es coral (`color-coral-500`), salvo en las capas, que llevan el `-from` de su capa.
- Tamaños 16, 20, 24 y 32 px; a 16 px solo se usan los de interfaz. Van con su nombre al lado; solos, llevan una etiqueta para lectores de pantalla.
- Sin logos de marcas: una tecnología es su nombre en tipografía más un glifo de concepto.

## Ilustración

Cuatro lenguajes, todos en código: figuras isométricas hechas con el kit de Anatomy (el objeto es la explicación), las estampillas del recorrido, el apilado de cinco capas y el 3D. Las reglas de cada uno están en la sección **Ilustración**.

## Logos

- El monograma «IG» es una I con un punto coral y una G, a trazo. Usá `assets/Logos/ig-monogram-paper.svg` sobre el índigo y `assets/Logos/ig-monogram-ink.svg` sobre fondos claros. El punto siempre es `color-coral-500`.
- Junto al monograma el nombre va en tipografía, nunca dibujado. No hay logotipo aparte.

## Componentes

- Los componentes son React y viven en el repo del portafolio, en `v2/components/ui/` (base), `v2/components/signature/` (piezas firma) y `v2/components/kit/` (ilustración). Sus estilos están en `app/v2/[locale]/ui.css`, `signature.css` y `kit.css`, y sus textos en `messages/v2/{es,en}.json`: ningún componente trae texto propio.
- Las vistas previas de este sistema son el HTML que esos componentes generan en el sitio, copiado tal cual y con sus estilos (`components/bundle.css`). Son estáticas: lo que necesita JavaScript (abrir una capa del apilado, rodar el contador, girar el 3D) se prueba en el sitio, en `/v2/es/piezas/` y `/v2/es/kit/`.
- La tarjeta de vidrio es UN enlace: el del título, estirado sobre la tarjeta. Los errores de formulario se atan al campo con `aria-describedby` y `aria-invalid`. El foco se ve en cada parada del Tab.

## No incluido

- No hay `bundle.js`: los componentes no se publican como paquete; se usan desde el repo.
- El 3D de las cinco capas (`StackScene`) necesita three.js y no tiene vista previa acá.
- Archivo y JetBrains Mono se sirven desde Google Fonts; el sitio las autoaloja con `next/font`.
