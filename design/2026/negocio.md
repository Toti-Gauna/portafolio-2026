# Ola 8b · Negocio y marketing

Diseño del 17/11/2026. Datos: `lib/negocio.ts`. Dibujos: `components/negocio/`. Textos: `messages/{es,en}.json` → `negocio.*`
(la página de los libros sigue en `business.*`). Hechos: relevamiento de los repos con archivo de origen (scratchpad de
la sesión, `o8b/negocio-hechos.md`, 17/11/2026).

## Qué cambia

`/negocio` deja de ser «tres libros» y pasa a ser **cómo pienso el negocio, con lo que hice en mis proyectos**. Los tres
libros no se borran: cada uno queda en una tarjeta resumida y su detalle completo (modelos dibujados y «cómo lo aplico»)
pasa a **`/negocio/libros`** (con `#lean`, `#mom` y `#blue`). La home y los enlaces viejos a `/negocio#lean` se actualizan.

## Regla de honestidad de esta página

- Todo lo que se cuenta es **diseño y demo**: ninguna conversión, venta, cliente ni retención está medida en ningún repo
  (Eclipse: «sin clientes todavía»; Lucero: «todavía no lo usa ningún local»). La página lo dice arriba y en cada embudo.
- **Sin cifras de resultado** y **sin importes de dinero** (ni precios de planes, ni umbrales, ni costos). Los números que
  aparecen son de reglas del código (p. ej. «tope de 2 mensajes en 30 días»), se dicen como reglas de la demo y llevan su
  rótulo de muestra.
- No se usa nada de las notas de investigación de mercado de Velmar, ni los consejos de contenido de las demos
  (`STUDIO_TIPS`), ni la comparación con Tiendanube: no tienen fuente en los repos.
- Cada ejemplo lleva el **proyecto, su estado** (`StatusTag`) y el enlace a su caso. Las marcas ficticias dicen «demo».
- DentalOS **no tiene QR de turno** (está pendiente): no se usa como ejemplo de marketing físico.
- Supernova se cuenta sin nombrar al cliente ni a su empresa. Velmar sin su Instagram ni sus personajes.

## La página

1. **Portada:** «Negocio» / «Cómo pienso el negocio.» / bajada y la nota de honestidad. Un índice de seis temas y los libros.
2. **Seis temas**, cada uno con la misma forma: número y título, **una idea** en una frase, **una figura dibujada**
   y **«Dónde lo hice»** (3–5 ejemplos: proyecto + estado + qué pasa + enlace al caso). Sin JS todo se ve igual (las
   figuras son SVG del servidor; el movimiento solo suma).

| # | Tema | Idea | Figura |
|---|---|---|---|
| 01 | Modelos de negocio | Antes de diseñar, quién paga qué y por qué | `ValueFlow`: cuatro flujos de tres nodos (Volta, Velmar, Lucero, Eclipse) |
| 02 | Marketing digital | Escribir cuando hay una razón, y respetar a quien pidió que no | `Audience`: la audiencia de una campaña de DentalOS se achica por reglas |
| 03 | Marketing físico | Lo físico lleva a lo digital en un gesto | `Touchpoints`: QR de mesa, placa NFC, pase con QR, retiro en el local |
| 04 | Branding | La marca son decisiones, no un logo | `Swatches`: las ocho marcas del Brand Lab (enlace a `/brand-lab`) |
| 05 | Operaciones | Cada pedido es un recorrido con estados que nadie se salta | `Rails`: el recorrido de Volta, Velmar, Lucero y DentalOS |
| 06 | Embudos | Dibujar el recorrido del cliente antes de medirlo | `Funnel`: cinco embudos con sus etapas y el módulo de cada una |

3. **Los tres libros**, tres tarjetas (autor y año, título, la idea, «Los modelos que más uso» y un enlace a
   `/negocio/libros#<id>`).
4. Cierre: lectura actual y contacto (como hoy).

## Figuras

- `ValueFlow` (`bz-flow`): tres cajas en fila (celular: en columna) unidas por flechas con etiqueta; un paquete corre
  mientras está en pantalla. Sin importes.
- `Audience` (`bz-aud`): barras horizontales que se angostan en cinco pasos (todos → sin quien pidió la baja → sin
  exclusión administrativa → hasta 2 mensajes en 30 días → un mensaje por persona); **sin cifras**: el ancho es solo
  ilustrativo y la leyenda lo dice.
- `Touchpoints` (`bz-touch`): cuatro íconos de línea con su pie.
- `Swatches` (`bz-sw`): una fila por marca con tres pastillas y su nombre, enlazada a `/brand-lab#marca-<id>`.
- `Rails` (`bz-rails`): una vía por proyecto con sus estaciones; un paquete recorre cada vía mientras está en pantalla.
- `Funnel` (`bz-fun`): trapecios apilados que se angostan por etapa, con el nombre de la etapa dentro y el módulo debajo
  (en texto). Leyenda fija: «Recorrido diseñado y navegable en la demo. No está medido: no hay cifras de conversión».
  Cada figura se puede leer como lista (`<ol>` del servidor).
- Movimiento: solo `transform`, `opacity`, `stroke-dashoffset`; nada en bucle fuera de pantalla (`InView live`); con
  movimiento reducido, estado final.
- Texto ≥ 15 unidades de lienzo y ≥ 12 px reales; en celular las figuras pasan a una columna.

## Cambios en otras páginas

- `/negocio/libros` (nueva, fuera del header; `app/sitemap.ts`, `routes.ts` → fondo `negocio`, `lib/zones.ts` → zona `brand`).
- Home, capítulo «Negocio»: el capítulo lleva a `/negocio`; sus tres referencias a `/negocio/libros#lean|mom|blue`.
- `nav.pages.business`, `hub.cards.business`, `taller.ch.business`: textos nuevos.

## Pruebas

- **Unitarias (`tests/unit/negocio.test.ts`):** cada tema tiene idea y 3–5 ejemplos en los dos idiomas; cada ejemplo apunta
  a un proyecto con caso; cada embudo tiene 5–9 etapas con su módulo; ningún texto lleva importes ni precios; ningún
  texto nombra al cliente de Supernova ni su empresa ni a Velmar en su Instagram; DentalOS no figura en marketing físico.
- **e2e (`tests/e2e/negocio.spec.ts`):** la página carga con sus seis temas, sus figuras y tres tarjetas de libros; los
  libros llevan a `/negocio/libros#<id>` y esa página conserva los tres libros completos; sin scroll horizontal a 360 px;
  movimiento reducido; contraste AA.
