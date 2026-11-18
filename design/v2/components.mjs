// The components of the Sistema IG design system: where each one renders on /v2 (page + selector), the
// group and height of its card, and its guideline. build.mjs copies the rendered HTML into the preview.
// Pages: T = /v2/es/ (tokens), C = /v2/es/componentes/, P = /v2/es/piezas/, K = /v2/es/kit/.

export const COMPONENTS = [
  // ── Acciones ──
  {
    name: 'Button', group: 'Acciones', page: 'C', select: ['#botones .cat-spec:nth-of-type(1)', '#botones .cat-spec:nth-of-type(2)', '#botones .cat-spec:nth-of-type(3)'], height: 440,
    src: 'v2/components/ui/Button.tsx',
    readme: `Un botón o un enlace con forma de botón: \`primary\` para la única acción principal de la pantalla, \`secondary\` (vidrio) para las demás y \`quiet\` (texto subrayado) para seguir leyendo.

- **Props:** \`variant\` (\`primary\` · \`secondary\` · \`quiet\`), \`size\` (\`md\` 56 px · \`sm\` 44 px), \`iconStart\`, \`iconEnd\`, \`children\` (el texto). Con \`href\` es un \`<a>\`; si no, un \`<button type="button">\`. \`external\` + \`externalLabel\` abren en otra pestaña y lo dicen.
- **Hacé:** un solo \`primary\` por pantalla, con verbo concreto («Conocer a Ignacio»). La flecha va al final; el ▶ al principio.
- **No hagas:** dos \`primary\` juntos, ni un \`quiet\` como acción principal. Deshabilitado solo cuando se entiende por qué.`,
  },
  {
    name: 'IconButton', group: 'Acciones', page: 'C', select: ['#botones .cat-spec:nth-of-type(4)'], height: 156,
    src: 'v2/components/ui/Button.tsx',
    readme: `Un botón cuadrado de 44 px que solo muestra un ícono; su nombre se lee en voz alta.

- **Props:** \`label\` (obligatoria: es su nombre accesible), \`children\` (el ícono), \`pressed\` para los que se prenden y apagan (\`aria-pressed\`).
- **Hacé:** usalo para menú, sonido y cerrar. Encendido, se rellena en \`color-paper\`.
- **No hagas:** íconos sin \`label\`, ni acciones que nadie reconocería sin texto.`,
  },
  {
    name: 'SoundToggle', group: 'Acciones', page: 'T', select: ['.ui-sound'], height: 90,
    src: 'v2/components/ui/SoundToggle.tsx',
    readme: `El botón de sonido de la barra: empieza apagado y recuerda la elección en el dispositivo.

- **Props:** \`label\`, \`on\`, \`off\` (los textos, desde \`messages\`).
- Guarda \`ig:v2:sound\` en el almacenamiento local y avisa con el evento \`ig:v2:sound\`; el motor de sonido escucha los dos.
- En celular queda solo el ícono; el nombre sigue ahí para lectores de pantalla. Encendido, se pinta en \`color-mint-500\`.`,
  },
  // ── Rótulos ──
  {
    name: 'Chip', group: 'Rótulos', page: 'C', select: ['#chips .cat-spec:nth-of-type(1)'], height: 144,
    src: 'v2/components/ui/Chip.tsx',
    readme: `Información, no un control: una tecnología, un tema, una cifra.

- **Props:** \`children\`.
- Mono 12,5 px en una píldora (\`radius-pill\`) de vidrio. Nunca lleva enlace ni acción.`,
  },
  {
    name: 'LayerChip', group: 'Rótulos', page: 'C', select: ['#chips .cat-spec:nth-of-type(2)'], height: 144,
    src: 'v2/components/ui/Chip.tsx',
    readme: `Una capa del oficio, numerada y en su color: 01 Planificación y ejecución … 05 Deploy.

- **Props:** \`id\` (\`plan\` · \`code\` · \`agents\` · \`tests\` · \`ship\`), \`n\` (su número), \`children\` (el nombre, desde \`messages.layers\`).
- El borde y el número toman el \`layer-<id>-from\` de la capa. Usalo cuando el texto habla de esa capa.`,
  },
  {
    name: 'Kbd', group: 'Rótulos', page: 'C', select: ['#chips .cat-spec:nth-of-type(3)'], height: 140,
    src: 'v2/components/ui/Chip.tsx',
    readme: `Una tecla, para indicar atajos de teclado.

- **Props:** \`children\` (la tecla).
- Siempre al lado de lo que hace. Los atajos de una sola letra solo se ofrecen donde se pueden apagar (WCAG 2.1.4).`,
  },
  {
    name: 'RoleBadge', group: 'Rótulos', page: 'C', select: ['#chips .cat-spec:nth-of-type(4)'], height: 156,
    src: 'v2/components/ui/Chip.tsx',
    readme: `El rol, con el nivel en su propio bloque de \`gradient-brand\` para que nunca se pierda.

- **Props:** \`level\` («Sr»), \`role\` («AI Fullstack Developer»).
- Va arriba del nombre en el inicio. El nivel es «Sr», nunca «Ssr».`,
  },
  {
    name: 'StatusBadge', group: 'Rótulos', page: 'C', select: ['.cat-statuses'], height: 120,
    src: 'v2/components/ui/Status.tsx',
    readme: `Dónde está un proyecto, siempre con un nombre en positivo.

- **Props:** \`status\` (\`produccion\` · \`interna\` · \`desarrollo\` · \`mvp\` · \`demo\` · \`prototipo\` · \`laboratorio\` · \`roadmap\` · \`ejercicio\` · \`profesional\`), \`label\` (el nombre, desde \`messages.ui.status\`).
- La marca cambia con el estado: punto lleno (en producción), medio punto (en construcción, MVP), aro (demo, prototipo, laboratorio, ejercicio) y aro punteado (en el roadmap). Así se distinguen también sin color.
- Todo proyecto, demo o prototipo lleva el suyo.`,
  },
  // ── Contenedores ──
  {
    name: 'GlassCard', group: 'Contenedores', page: 'C', select: ['.cat-cards'], height: 555,
    src: 'v2/components/ui/Card.tsx',
    readme: `Una tarjeta de vidrio que es UN enlace: el del título, estirado sobre toda la tarjeta.

- **Props:** \`layer\` (el color), \`title\`, \`href\`, \`meta\` (empresa · año), \`status\` + \`statusLabel\`, \`cta\` («Ver el caso»), \`headingLevel\`, \`children\` (una o dos líneas).
- Un solo foco por tarjeta, y el nombre accesible es el título. El texto se puede seleccionar.
- Al pasar el puntero sube 4 px y el borde toma el color de la capa.`,
  },
  {
    name: 'Panel', group: 'Contenedores', page: 'C', select: ['#tarjetas .cat-spec:nth-of-type(2)'], height: 180,
    src: 'v2/components/ui/Card.tsx',
    readme: `Un contenedor de vidrio para agrupar contenido sin enlace.

- **Props:** \`layer\` (opcional, tiñe el borde), \`className\`, \`children\`.
- Usalo para formularios y grupos de datos. Si toda la caja lleva a otra página, usá \`GlassCard\`.`,
  },
  {
    name: 'Stat', group: 'Contenedores', page: 'C', select: ['#tarjetas .cat-spec:nth-of-type(1)'], height: 190,
    src: 'v2/components/ui/Card.tsx',
    readme: `Una cifra con su rótulo, sobre una línea del color de su capa.

- **Props:** \`value\` (ya formateado: «1.374»), \`label\`, \`layer\`.
- Solo cifras con respaldo y fecha. Para que la cifra ruede al entrar, usá \`CountUp\` adentro.`,
  },
  {
    name: 'SectionHeading', group: 'Contenedores', page: 'C', select: ['#botones .ui-heading'], height: 190,
    src: 'v2/components/ui/Card.tsx',
    readme: `El número, el título y la bajada de una sección.

- **Props:** \`id\` (lo usa la sección en \`aria-labelledby\`), \`n\` («01»), \`title\`, \`text\`, \`level\` (2 o 3).
- El número solo va cuando las secciones son una secuencia real.`,
  },
  // ── Formularios ──
  {
    name: 'TextField', group: 'Formularios', page: 'C', select: ['.ui-field:has(input#f-name)', '.ui-field:has(input#f-email)'], height: 282,
    src: 'v2/components/ui/Form.tsx',
    readme: `Un campo de texto con la etiqueta siempre visible, la ayuda debajo y el error que dice cómo seguir.

- **Props:** \`id\`, \`label\`, \`hint\`, \`error\` y los atributos de \`<input>\` (\`type\`, \`autoComplete\`…).
- La ayuda y el error se atan con \`aria-describedby\`; con error, \`aria-invalid\` y borde \`color-danger\`.
- El texto del error explica cómo arreglarlo, sin disculpas: «Escribí un mail completo, por ejemplo nombre@empresa.com.»`,
  },
  {
    name: 'TextArea', group: 'Formularios', page: 'C', select: ['.ui-field:has(textarea)'], height: 228,
    src: 'v2/components/ui/Form.tsx',
    readme: `Un campo de varias líneas, con las mismas reglas que \`TextField\`.

- **Props:** \`id\`, \`label\`, \`hint\`, \`error\`, \`rows\` y los atributos de \`<textarea>\`.`,
  },
  {
    name: 'Select', group: 'Formularios', page: 'C', select: ['.ui-field:has(select)'], height: 124,
    src: 'v2/components/ui/Form.tsx',
    readme: `Una lista desplegable nativa, con la flecha propia.

- **Props:** \`id\`, \`label\`, \`hint\`, \`options\` (\`{ value, label }[]\`).
- Para dos o tres opciones a la vista, usá \`Segmented\`.`,
  },
  {
    name: 'Checkbox', group: 'Formularios', page: 'C', select: ['.ui-check'], height: 90,
    src: 'v2/components/ui/Form.tsx',
    readme: `Una casilla nativa dibujada a medida; marcada, se rellena en \`color-mint-500\`.

- **Props:** \`id\`, \`label\` y los atributos de \`<input type="checkbox">\`.
- Toda la fila es clicable y mide 44 px de alto.`,
  },
  {
    name: 'Switch', group: 'Formularios', page: 'C', select: ['.ui-switch'], height: 90,
    src: 'v2/components/ui/Form.tsx',
    readme: `Un ajuste de prendido y apagado: una casilla nativa que se anuncia como interruptor (\`role="switch"\`).

- **Props:** \`id\`, \`label\` y los atributos de \`<input>\`.
- Usalo para preferencias que se aplican al instante; para aceptar algo, \`Checkbox\`.`,
  },
  {
    name: 'Segmented', group: 'Formularios', page: 'C', select: ['.ui-segmented'], height: 130,
    src: 'v2/components/ui/Form.tsx',
    readme: `Una elección entre pocas opciones: un grupo de radios dibujado como control segmentado.

- **Props:** \`name\`, \`legend\`, \`options\` (\`{ value, label }[]\`), \`defaultValue\`.
- Las flechas mueven la elección, como en cualquier grupo de radios.`,
  },
  // ── Navegación ──
  {
    name: 'NavTabs', group: 'Navegación', page: 'C', select: ['#navegacion .cat-spec:nth-of-type(1)'], height: 156,
    src: 'v2/components/ui/Nav.tsx',
    readme: `Pestañas de sección, cada una con su color; la actual lleva \`aria-current\` y una luz arriba.

- **Props:** \`label\` (nombre del \`<nav>\`), \`items\` (\`{ href, label, color, current }[]\`).
- Son enlaces reales. En la barra miden lo mismo que ella; en celular pasan a una segunda fila.`,
  },
  {
    name: 'LangSwitch', group: 'Navegación', page: 'T', select: ['.ui-lang'], height: 92,
    src: 'v2/components/ui/Nav.tsx',
    readme: `ES / EN como dos enlaces a la misma página en cada idioma.

- **Props:** \`label\`, \`current\` (\`es\` · \`en\`), \`hrefs\`.
- Cada enlace lleva \`hreflang\`, \`lang\` y el nombre del idioma («Español», «English») como nombre accesible.`,
  },
  {
    name: 'Breadcrumbs', group: 'Navegación', page: 'C', select: ['#navegacion .cat-spec:nth-of-type(2)'], height: 156,
    src: 'v2/components/ui/Nav.tsx',
    readme: `La ruta hasta la página actual.

- **Props:** \`label\`, \`items\` (\`{ href?, label }[]\`; el último, sin \`href\`, es la página actual).`,
  },
  {
    name: 'Pager', group: 'Navegación', page: 'C', select: ['#navegacion .cat-spec:nth-of-type(3)'], height: 200,
    src: 'v2/components/ui/Nav.tsx',
    readme: `Anterior y siguiente, como dos enlaces grandes (de caso a caso).

- **Props:** \`label\`, \`prev\` y \`next\` (\`{ href, kicker, title }\`).
- Llevan \`rel="prev"\` / \`rel="next"\`. En celular quedan uno debajo del otro.`,
  },
  {
    name: 'LinkArrow', group: 'Navegación', page: 'C', select: ['.ui-linkarrow'], height: 90,
    src: 'v2/components/ui/Nav.tsx',
    readme: `Un enlace dentro del texto con una flecha que avanza al pasar el puntero.

- **Props:** \`href\`, \`children\`. Subrayado en \`color-coral-500\`.`,
  },
  {
    name: 'Disclosure', group: 'Navegación', page: 'C', select: ['.ui-disclosure'], height: 110,
    src: 'v2/components/ui/Nav.tsx',
    readme: `Texto que se despliega, sobre \`<details>\` nativo: Enter y Espacio funcionan y el estado se anuncia.

- **Props:** \`summary\`, \`children\`.
- Cada diagrama lleva uno: «Leer el diagrama como texto».`,
  },
  // ── Piezas firma ──
  {
    name: 'CraftStack', group: 'Piezas firma', page: 'P', select: ['#apilado .sig-stack'], height: 905, width: 900,
    src: 'v2/components/signature/CraftStack.tsx (con Stack.tsx y stack-art.ts)',
    readme: `El oficio en cinco capas, en vista explotada; en el sitio, al tocar una capa o su nombre, las de arriba suben para verla entera. Esta vista previa es estática.

- **Uso:** \`<Stack locale={locale} />\`. El dibujo se genera en el build; los nombres salen de \`messages.layers\`.
- Las cinco capas van a la misma distancia. Escape cierra la capa abierta.
- El texto de las caras se muestra solo si se lee a 12 px o más; por debajo van barras de su largo.`,
  },
  {
    name: 'TiltPanel', group: 'Piezas firma', page: 'P', select: ['.sig-panel-demo'], height: 468,
    src: 'v2/components/signature/TiltPanel.tsx',
    readme: `Un panel de vidrio con profundidad real: descansa girado y, con un puntero fino, sigue al puntero.

- **Props:** \`children\`, \`className\`. Lo que lleve \`data-depth\` flota a su propia altura (\`translateZ\`).
- En pantallas táctiles y con movimiento reducido queda en su pose de descanso.`,
  },
  {
    name: 'KineticVerbs', group: 'Piezas firma', page: 'P', select: ['.sig-verbs'], height: 260,
    src: 'v2/components/signature/KineticVerbs.tsx',
    readme: `Verbos en píldoras que se encienden uno por uno, una sola vez, al entrar en pantalla; el último queda encendido.

- **Props:** \`verbs\` (\`{ text, from, to }[]\`), \`replayKey\` (cambiarlo lo repite).
- Termina siempre: no hay nada que pausar. Sin JavaScript o con movimiento reducido se ve el cuadro final.`,
  },
  {
    name: 'CountUp', group: 'Piezas firma', page: 'P', select: ['#contador .sig-counters'], height: 200,
    src: 'v2/components/signature/CountUp.tsx',
    readme: `Una cifra cuyos dígitos ruedan hasta su valor la primera vez que entra en pantalla.

- **Props:** \`value\` (ya formateado), \`replayKey\`.
- El HTML trae el valor final: sin JavaScript se lee igual. Los lectores de pantalla leen la cifra entera.`,
  },
  {
    name: 'LightField', group: 'Piezas firma', page: 'P', select: ['.sig-light-demo'], height: 384,
    src: 'v2/components/signature/LightField.tsx',
    readme: `Una luz que sigue al puntero y enciende una trama de puntos sobre lo que toca.

- **Props:** \`children\`, \`className\`.
- Con puntero grueso o movimiento reducido, la luz queda quieta arriba a la derecha. El campo recorta la luz: nunca ensancha la página.`,
  },
  {
    name: 'ChapterPlayer', group: 'Piezas firma', page: 'P', select: ['.sig-player'], height: 700, width: 1000,
    src: 'v2/components/signature/ChapterPlayer.tsx',
    readme: `El marco del tráiler: un escenario, los capítulos en la barra, reproducir y pausar, y saltos con las flechas.

- **Props:** \`chapters\` (\`{ id, title, verb, from, to, art, crop }[]\`), \`labels\` (los textos).
- Nunca arranca solo, se pausa si sale de pantalla y termina en «Repetir». La barra se llena solo con \`transform\`.`,
  },
  // ── Ilustración ──
  {
    name: 'Icon', group: 'Ilustración', page: 'K', select: ['#iconos .kit-family:nth-of-type(2)', '#iconos .kit-family:nth-of-type(3)'], height: 460,
    src: 'v2/components/kit/icons.tsx',
    readme: `Los 42 íconos propios del sistema, sobre una grilla de 24 y trazo de 1,75. Todos los archivos están en el grupo de recursos **Icons**.

- **Props:** \`name\`, \`size\` (16 · 20 · 24 · 32), \`label\` (solo si va solo), \`accent\` (el color de su única pieza rellena).
- Decorativo por defecto (\`aria-hidden\`). Los de interfaz no llevan acento; los de concepto, uno.`,
  },
  {
    name: 'GaugeFigure', group: 'Ilustración', page: 'K', select: ['#ilustracion .kit-fig'], height: 780, width: 860,
    src: 'v2/components/kit/GaugeFigure.tsx (con gauge-model.ts y gauge-art.ts)',
    readme: `«El calibre de tests»: la figura isométrica de ejemplo, dibujada con el kit de Anatomy. En el sitio, el puntero o las flechas llevan cada cambio bajo la aguja; esta vista previa es estática.

- La aguja, la luz (verde dentro de la franja, coral fuera) y la lectura salen del mismo modelo.
- Es un control deslizante (\`role="slider"\`) con su valor en palabras. Recorre los cinco cambios una vez al entrar y se queda quieto.`,
  },
  {
    name: 'Stamp', group: 'Ilustración', page: 'K', select: ['.kit-stamps'], height: 300,
    src: 'v2/components/kit/stamps.ts',
    readme: `Las estampillas del recorrido, una por parada. Los dibujos están en el grupo de recursos **Estampillas**.

- \`stampSvg(id)\` da el dibujo; el año y el nombre van en HTML encima, desde \`messages.kit.stamps.items\`.
- Van sobre su hoja crema; es el único lugar donde la paleta cambia.`,
  },
];
