# Ola 7a · La plantilla de casos (con stepper)

Diseño de Opus (17/11/2026). Casos modelo: **CompliA** y **Eclipse**. El resto pasa a la plantilla en la Ola 7b.

## El problema que resuelve

Un caso se leía como un solo scroll: Eclipse tenía 15 secciones y unos 23.000 px de alto, CompliA unos 10.000. El
índice lateral ayudaba a saltar, pero la página seguía mostrando todo a la vez. Ignacio pidió **menos información por
pantalla: resumen arriba y el detalle en pasos**.

## La forma

1. **Portada.** Igual que hoy: kicker, título, estado, resumen y datos (`facts`). Un cambio: el estado usa el átomo
   `StatusTag` cuando el caso tiene uno en `lib/career.ts` (CompliA: Producción interna; Eclipse: En desarrollo). Si
   no lo tiene, queda el texto de siempre.
2. **En corto.** Las tres tarjetas de siempre (`tldr`).
3. **Los pasos.** Cada caso declara `steps` en `lib/cases/<slug>.ts`: una lista ordenada de pasos y, en cada uno, los
   bloques que contiene (por clave). Los pasos son siempre de este vocabulario, con sus rótulos en `caseUi.steps`:

   | id | Rótulo | Para qué |
   |---|---|---|
   | `what` | Qué es | El problema y la idea |
   | `see` | Cómo se ve | El producto en movimiento: video, capturas, la demo |
   | `how` | Cómo funciona | Arquitectura, flujos y secuencias |
   | `role` | Mi aporte | Qué hice yo |
   | `real` | Cómo se implementa de verdad | Solo en demos que son solo frontend: backend, base de datos y seguridad, con la nota de MVP (Ola 7b) |
   | `security` | Seguridad | Qué protege y cómo |
   | `decisions` | Decisiones | Qué elegí y por qué |
   | `quality` | Calidad | Cómo se prueba |
   | `status` | Estado | Dónde está y lo que no afirmo (siempre el último) |

   - **CompliA:** Qué es → Cómo funciona → Mi aporte → Decisiones (los límites por diseño) → Cómo se ve (la demo) →
     Estado.
   - **Eclipse:** Qué es (con «cómo vende» y la landing) → Cómo se ve → Cómo funciona (arquitectura, portal, backend,
     recorrido, etapas, operación, kit y sesión) → Seguridad → Decisiones → Calidad (con el stack) → Estado.
4. **Siguiente caso y contacto.** Igual que hoy.

## El stepper

- **Escritorio (≥ 1100 px).** A la izquierda, en el lugar del índice actual, va una columna fija (`position: sticky`)
  con los pasos numerados. Cada paso muestra su número, su rótulo y su línea (`d`). Una línea vertical une los pasos,
  y su tramo coral crece hasta el paso actual (`transform: scaleY`). El paso actual lleva `aria-current="step"` y su
  número en coral. A la derecha se ve **un solo paso**.
- **Celular y tablet.** Una barra fija bajo el header con «Paso 2 de 7 · Cómo funciona», los botones anterior y
  siguiente (44 px) y un `<details>` «Ver todos los pasos» con la lista completa.
- **Al final de cada paso**, dos enlaces grandes: «← Qué es» y «Seguridad →» (con el rótulo del paso vecino). El
  último paso lleva al siguiente caso.
- **Cambiar de paso:**
  - el panel nuevo entra con opacidad y una traslación de 12 px (al instante con movimiento reducido);
  - la página sube hasta el comienzo del panel, si quedó más abajo;
  - el foco va al título del paso (`tabindex="-1"`);
  - suena el clic de la interfaz (el oyente delegado de `lib/ui-sounds.ts` ya lo hace para todo enlace; no se suma otro);
  - la URL cambia a `#paso-<id>` con `replaceState`, y al cargar con ese hash se abre ese paso.
- **Teclado.** Los pasos son enlaces: Tab llega a todos, Enter abre. No usa el patrón de pestañas, porque cada paso es
  largo y se lee como una página.
- **Sin JavaScript.** Se ven todos los pasos uno debajo del otro, y la columna es un índice de enlaces a `#paso-<id>`.
  Así se sigue leyendo entero.

## Cómo quedó (Ola 7a, implementado)

- `components/case/CaseSteps.tsx` (cliente): columna, barra de celular y paneles. El servidor dibuja todos los paneles
  (el primero activo); con JS (`html.js`) solo se ve el activo. El hash `#paso-<id>`, o el id de una sección dentro de un
  panel, abre ese panel. El progreso es una línea coral con `scaleY` (`--p`).
- `app/[locale]/proyectos/[slug]/page.tsx`: si el caso tiene `steps`, arma un panel por paso con `CaseSections`
  (`ui.stepped`: secciones h3 y títulos internos h4) y reemplaza el índice; el estado de la portada sale de
  `lib/career.ts` (`StatusTag`).
- Una sección titulada igual que su paso no repite el título (`sameAs`): el h2 del paso ya lo dice.
- Medido (17/11/2026): la página de Eclipse en el paso más largo mide 11.651 px, contra unos 23.000 antes
  (`case-steps.spec.ts` lo registra y exige < 16.000).

## Decisiones de Ignacio sobre las demos (17/11/2026, para la 7b)

Respuestas a las seis preguntas de `design/2026/demos-implementacion.md`:
1. **Nota de MVP:** «demo de e-commerce» (Volta y Velmar): el texto dice que es una demo para mostrar antes de la seña.
2. **DentalOS:** agregar una **propuesta mía, con todo el system design**, rotulada como propuesta.
3. **Lucero, retención:** 90 días.
4. **Supernova:** poner un **ejemplo de backend**, sin nombrar al cliente.
5. **HandyX:** colocarlo igual (paso `real`, aunque su estado sea MVP) y contar **cómo pensamos el backend de ambos
   lados** (la app de usuario y la de especialistas).
6. **Lucero:** se puede describir cómo sería el backend, con su system design.
Consecuencia: la regla «`real` solo en Demo, Prototipo o Banco» se amplía a MVP y a Prototipo (Supernova); el test
se actualiza en la 7b.

## Jerarquía

- El título de cada paso es `h2` («01 Qué es»).
- Las secciones de adentro (los bloques con `h`) bajan a `h3`, numeradas dentro del paso.
- Los títulos internos de los bloques (decisiones, chequeos) bajan a `h4`.

## La animación de cada paso

No hace falta una nueva: los diagramas ya se dibujan al entrar en pantalla (`lib/observe.ts`) y viaja un paquete
mientras están a la vista. Como un paso aparece cuando se elige, **su diagrama se dibuja en ese momento**: esa es la
animación clave del paso. Los videos de `showcase` se reproducen solos solo en el paso visible. Los demás quedan
pausados, porque no están en pantalla.

## Datos y pruebas

- **Tipos:** `StepDef` y `StepId` en `lib/cases/types.ts`. Rótulos: `caseUi.steps.*`.
- **Unitarias:** en cada caso con `steps`, cada bloque aparece en exactamente un paso, sin claves inexistentes; los
  pasos no se repiten y `status` va último; `real` solo aparece en casos cuyo estado es Demo, Prototipo o Banco de
  pruebas.
- **e2e:**
  - un solo paso visible;
  - con un clic en la columna cambia el paso, el hash y el foco;
  - anterior y siguiente funcionan;
  - abrir con `#paso-how` abre ese paso;
  - sin JS se ven todos;
  - en celular, la barra de pasos y los 44 px;
  - con movimiento reducido, sin traslación.
- **Medir:** el alto de la página de Eclipse en el paso más largo frente a los 23.000 px de hoy.
