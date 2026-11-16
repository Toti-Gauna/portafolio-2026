# Pantallas y storyboards

Cada pantalla: **qué contiene** (sale del sitio actual salvo lo marcado como nuevo), **storyboard de scroll** (qué pasa a medida que se baja), **interacción** y **sonido**. El texto real vive en `messages/`; acá solo hay estructura.

## 0. Puerta de entrada (rehecha, Ola 2)

- Contenido: monograma IG con su punto coral, «Ignacio / Gauna», rol, dos botones: **Conocer a Ignacio** (coral, ▶) y **Ver portafolio**.
- Fondo: tinta con la grilla suiza y el eclipse de puntos coral detrás del nombre.
- Carga: el eclipse se completa como barra de progreso (los puntos se encienden desde el centro).
- Interacción: cualquiera de los dos botones **enciende el sonido** (es el gesto que el navegador exige). «Conocer a Ignacio» abre el tráiler; «Ver portafolio» funde al inicio.
- Sonido: ninguno antes del clic. Al clic, un acorde corto y la música de fondo entra en 2 s.

## 1. Header (Ola 2)

- ≥ 1100 px: monograma · menú numerado (01 Work & Projects … 05 Sobre mí) · botón de sonido (ecualizador de 5 barras: se mueve si suena, quieto si no) · ES·EN · Contacto.
- 768–1099 px: monograma · los cinco enlaces en una fila compacta · sonido · Contacto (antes era solo «Menú»).
- < 768 px: monograma · sonido · «Menú» (diálogo a pantalla completa, como hoy).

## 2. Inicio: el recorrido por el Taller cósmico (Ola 3; Ignacio, 16/11/2026)

La home es un recorrido por **el Taller cósmico**: un mundo flotante en el espacio, dibujado como grabado punteado y trama de puntos (piedra clara, coral solo de acento, negro con órbitas). Cada capítulo es un edificio distinto, ocupa una pantalla y tiene una frase, un dato y un botón a su página. Imágenes: `design/2026/taller/` (hoja de referencia y recortes) y las escenas generadas `escena-0…10`. Texto, rótulos «Fig. 0X», logos y botones van en código encima. En celulares: imágenes fijas con fundido. Movimiento reducido: imagen fija.

| # | Capítulo | Edificio | Qué muestra | Lleva a |
|---|---|---|---|---|
| 0 | Hero | El taller entero con el eclipse | Nombre, titular, las dos puertas | — |
| 1 | El origen | Escritorio frente al mar, la primera web | «Todo empezó en Mar del Plata, a los 17» | Sobre mí |
| 2 | El recorrido | Estudio-cubo, academia y torre sobre el camino coral | TACH → Ada ITW → Tsoft, con fechas | Sobre mí |
| 3 | Work & Projects | Hangar donde se arman los productos | 3–4 proyectos destacados con su estado | Work & Projects |
| 4 | Cómo trabajo | Observatorio con 11 módulos | Sistema agéntico, una persona aprueba | Cómo trabajo |
| 5 | Capacidades | Telescopio hacia una constelación | Stack por origen | Capacidades |
| 6 | Brand Lab | Imprenta de serigrafía | Cómo doy marca | Brand Lab |
| 7 | Negocio y marketing | Sala con el agujero negro (embudo) | Modelos y embudos | Negocio |
| 8 | Video y tráileres | Cine que proyecta | Kinetic, CompliA, Remotion | Video |
| 9 | Roadmap | Campo de lanzamiento con maquetas punteadas | 4 etapas, «Planeado» | Roadmap |
| 10 | Contacto | Faro-antena con señal coral | Reclutadores, Upwork, mail, LinkedIn | Contacto |

## 3. Work & Projects (Olas 4–6)

- **El camino:** vista isométrica de edificios con trama halftone unidos por un camino coral. Orden: semilla en Mar del Plata (a los 17) → TACH (startup) → Ada ITW (academia) → Tsoft (corporativa, con Telefónica y Tuenti) → caminos propios (Eclipse, HandyX, Lucero, Trazo, Kinetic, laboratorio) → roadmap (edificios en contorno punteado, «Planeado»).
- **Interacción:** clic o foco en un edificio → sube y abre su ficha (estado, fechas, rol, 3 cifras con fuente, stack, «Ver el caso»). Stepper al pie con las etapas; flechas del teclado avanzan.
- **Alternativa:** botón «Ver como lista» con lo mismo en HTML.
- **Roadmap:** las 4 etapas (Núcleo, Ciberseguridad, Quant, Aeroespacial) como barrios; las ventanas de matemática como cruces con su «nivel de salida»; certificaciones como faros, sin precio.

## 4. Casos (Olas 7a/7b)

Plantilla única:

1. **Portada:** nombre, estado, rol, período, una frase. Diorama del caso a la derecha.
2. **TL;DR en 3 tarjetas:** problema · solución · dónde está.
3. **Stepper** (barra lateral en escritorio, pestañas arriba en celular): Qué es → Cómo funciona → Mi aporte → Decisiones → Calidad → Estado. Un paso por vista, con su animación clave.
4. En demos solo frontend: paso extra **«Cómo se implementa de verdad»** con backend, base de datos y seguridad, y la nota: *«Es solo frontend a propósito: un MVP para validar antes de construir (The Lean Startup).»*
5. Cierre: «Lo que no afirmo» + siguiente caso.

## 5. Brand Lab (Ola 8a)

Tableros de marca en SVG (IG, Eclipse, Velmar, Lucero, Volta, DentalOS y ejercicios rotulados). Cada tablero se arma al entrar: logo se dibuja, paleta cae círculo por círculo, patrones se revelan, aplicaciones aparecen al final.

## 6. Negocio y marketing (Ola 8b)

Modelos de negocio · marketing digital y físico · branding · operaciones · embudos de redes (dibujados, con datos de ejemplo rotulados). Los tres libros siguen, resumidos en una tarjeta cada uno.

## 7. Video, contenido y tráileres (Ola 8c)

Kinetic Studio, tráileres de producto (CompliA y los del hub), edición y shorts; Remotion solo si la prueba funciona. Ejemplos reproducibles al entrar en pantalla.

## 8. Cómo trabajo (Ola 11)

Método de 6 pasos (ciclo) + sistema agéntico: diagrama «Cómo viaja un cambio», agentes con su ícono y modelo, y **cómo se decidió** (qué se probó, qué se descartó: Scroll World como pipeline, Remotion antes de la prueba).

## 9. Capacidades

La matriz de 17 tecnologías pasa a una constelación: cada tecnología es una estrella con su origen (trabajo / proyectos / estudio) por color de borde; filtros arriba; lista accesible abajo. Sección AR/VR, Blender, Claude y Meshy como conocimiento (Ola 10).

## 10. Sobre mí y contacto

El recorrido como una línea de luz vertical con 8 hitos; contacto general (mail, LinkedIn, GitHub) y una línea para reclutadores y trabajos en Upwork (Ola 8d).
