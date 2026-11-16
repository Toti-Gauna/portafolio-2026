# Portafolio 2026 · Diseño (Ola 0)

Fuente de verdad del rediseño. Todo lo que se construya en las olas 1–12 sale de acá.

- **Lienzo con los tres sistemas y el elegido:** https://claude.ai/artifact/56YcJjfucf72v3hJ6eUpGt (copia de cada artboard en `canvas/`).
- **Plan por olas:** https://claude.ai/artifact/ASwM9JbgTHp7T5wek6dFpR

## Decisión (Ignacio, 16/11/2026)

Sistema **Eclipse nocturno**, mezcla de A (cartel suizo + halftone) y B (hyperbloom + dreamscape), **sin la cinta coral animada**.

| De A | De B |
|---|---|
| Grilla suiza de 12 columnas visible y tenue, márgenes de 80 px | Fondo que pasa de tinta a noche violeta |
| Menú numerado en mono, rótulos «Fig. 00», cifras en bloque | Halos que florecen detrás de lo protagonista (nunca detrás del texto) |
| «Ignacio» ancho 125 / «Gauna» condensado 62 en coral | Cromo iridiscente en el monograma y en UNA palabra por pantalla |
| Eclipse de puntos halftone (la marca) | Islas isométricas flotantes unidas por un puente de luz |
| Botones rectos, trama en las caras de los edificios | Estrellas escasas, grano |

Los artboards son **bocetos de estilo**: fijan tokens, tipografía, composición y tono. Los fondos finales (cielo, halos, viaje entre islas) se generan con Higgsfield y GPT Image con esta paleta (`../prompts/`), y los dioramas se construyen en three.js (Ola 4). El texto va siempre en código.

## Principios

1. **Una idea por pantalla.** Resumen arriba, detalle en pasos (stepper). Nada de muros de texto.
2. **Coral = acción y estado.** Violeta, flor y hielo son luz de ambiente: halos, cromo, trama. Nunca botones ni texto largo.
3. **Honestidad visible.** Cada pieza con su rótulo: Producción interna · En desarrollo · MVP · Demo · Prototipo · Banco de pruebas · Planeado · Ejercicio de marca. Lo generado con IA (Higgsfield, GPT Image, Suno, voz de ElevenLabs) se declara.
4. **Móvil primero y liviano.** Halos y fondos se dibujan una vez y quedan quietos en celulares; three bajo demanda; nada en bucle fuera de pantalla.
5. **Accesible.** Texto ≥ 12 px, AA sobre el fondo real, objetivos ≥ 44 px, foco visible coral, `prefers-reduced-motion` con cuadro final.
6. **Sonido apagado por defecto.** Las dos puertas lo encienden; un botón minimalista lo apaga.

## Archivos

| Archivo | Qué tiene |
|---|---|
| `tokens.json` | Color, tipografía, espacio, radios, movimiento y sonido |
| `paginas.md` | Cada pantalla: contenido, storyboard de scroll, interacción y sonido |
| `kit-isometrico.md` | Especificación del kit 3D (islas, edificios, presets) |
| `sonido.md` | Paisaje sonoro y reglas |
| `trailer-v3.md` | Estructura, ritmo y guion de voz (borrador) |
| `repos.md` | Relevamiento de solo lectura de los repos de Ignacio |
| `../prompts/` | Prompts para Higgsfield, GPT Image, Suno y ElevenLabs |
