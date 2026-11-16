# Portafolio 2026 · Diseño (Ola 0)

Fuente de verdad del rediseño. Todo lo que se construya en las olas 1–12 sale de acá.

- **Lienzo con los tres sistemas y el elegido:** https://claude.ai/artifact/56YcJjfucf72v3hJ6eUpGt (copia de cada artboard en `canvas/`).
- **Plan por olas:** https://claude.ai/artifact/ASwM9JbgTHp7T5wek6dFpR

## Decisión (Ignacio, 16/11/2026)

Sistema **Cartel suizo** (la opción A: Neo Swiss + halftone), **sin la cinta coral animada**. Se probaron también B (hyperbloom + dreamscape), C (neo brutalismo + retrofuturismo) y una mezcla A + B; quedan en el lienzo como descartados.

- Fondo tinta con grilla suiza de 12 columnas visible y tenue, márgenes de 80 px, grano fijo.
- Menú numerado en mono (01 Work & Projects … 05 Sobre mí), rótulos tipo «Fig. 00», cifras en bloque con línea superior.
- «Ignacio» en Archivo ancho 125 y peso 900; «Gauna» condensado 62, peso 300, en coral.
- El **eclipse de puntos halftone** coral es la imagen de marca (hero, puerta, tráiler).
- Dos tintas, como una serigrafía: papel y coral sobre negro. La **trama de puntos reemplaza a los degradés** (también en las caras de los edificios).
- Botones rectos, sin radios; secundario con borde de 1 px.

Los artboards son **bocetos de estilo**: fijan tokens, tipografía, composición y tono. Los fondos finales (el eclipse en movimiento, el viaje por el camino, la costa) se generan con Higgsfield y GPT Image con esta paleta (`../prompts/`), y los dioramas se construyen en three.js (Ola 4). El texto va siempre en código.

## Principios

1. **Una idea por pantalla.** Resumen arriba, detalle en pasos (stepper). Nada de muros de texto.
2. **Coral = acción y estado.** Todo lo demás es tinta, papel y gris. Nada de degradés ni brillos: profundidad con trama halftone.
3. **Honestidad visible.** Cada pieza con su rótulo: Producción interna · En desarrollo · MVP · Demo · Prototipo · Banco de pruebas · Planeado · Ejercicio de marca. Lo generado con IA (Higgsfield, GPT Image, Suno, voz de ElevenLabs) se declara.
4. **Móvil primero y liviano.** Las tramas y fondos se dibujan una vez y quedan quietos en celulares; three bajo demanda; nada en bucle fuera de pantalla.
5. **Accesible.** Texto ≥ 12 px, AA sobre el fondo real, objetivos ≥ 44 px, foco visible coral, `prefers-reduced-motion` con cuadro final.
6. **Sonido apagado por defecto.** Las dos puertas lo encienden; un botón minimalista lo apaga.

## Archivos

| Archivo | Qué tiene |
|---|---|
| `tokens.json` | Color, tipografía, espacio, radios, movimiento y sonido |
| `paginas.md` | Cada pantalla: contenido, storyboard de scroll, interacción y sonido |
| `kit-isometrico.md` | Especificación del kit 3D (edificios, camino, presets) |
| `sonido.md` | Paisaje sonoro y reglas |
| `trailer-v3.md` | Estructura, ritmo y guion de voz (borrador) |
| `repos.md` | Relevamiento de solo lectura de los repos de Ignacio |
| `../prompts/` | Prompts para Higgsfield, GPT Image, Suno y ElevenLabs |
