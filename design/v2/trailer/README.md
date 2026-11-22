# Tráiler «Conocer a Ignacio» de /v2 · guion y storyboard (lote 8.1)

80 segundos: 36 compases de 4/4 a 108 pulsos por minuto, seis capítulos y veinte planos, en 16:9 y 9:16.
Un punto de luz —el punto coral de la «i»— sale de Mar del Plata, sube por cada frente y vuelve a su lugar.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| La estructura: compases, capítulos, planos, color de cada plano, entradas por tiempo, golpes de la música | `v2/trailer/script.json` |
| Las palabras en pantalla, es / en | `messages/v2/trailer/<idioma>.json` |
| Los verbos y el estado de cada caso | el propio caso (`messages/v2/cases`, `ui.status`); `show` en el guion dice cuáles se ven |
| Notas de dirección: qué se ve, cómo se mueve, qué suena, cómo cambia en 9:16 y de dónde sale cada dato | `design/v2/trailer/notes.json` |
| El dibujo de cada plano (HTML y SVG, en los dos formatos) | `design/v2/trailer/frames.ts` |
| La página del storyboard, con el animático | `design/v2/trailer/board.ts` |
| Las reglas del guion, medidas | `tests/unit/v2-trailer.test.ts` |

## Regenerar el storyboard

```
TRAILER_BOARD=<carpeta> npx vitest run tests/unit/trailer-storyboard.test.ts
```

Escribe `<carpeta>/storyboard.html` (el cuerpo del artifact), `<carpeta>/preview.html` (lo mismo, para abrir en un
navegador) y `<carpeta>/media/` (los recortes reales de los casos, a 720 px; necesita ffmpeg). El artifact se publica con
`storyboard.html` y los archivos de `media/` en sus mismas rutas.

## Reglas del guion (las mide el test)

- Entre 60 y 90 segundos, sobre una grilla de compases: los planos llenan los 36 compases en orden y cada golpe de la
  música abre una frase de cuatro.
- Un capítulo por frente y por proyecto; las seis estampillas del kit se sellan una vez cada una.
- Tiempo para leer: ningún plano pide más de tres palabras por segundo (nombre, frases, píldoras, verbos y cifra).
- Desafíos, no puestos: ningún cargo en pantalla. Voz en positivo.
- Cada dato sale del registro: fechas de la ficha de Sobre mí, verbos y estado de cada caso, la cifra de tests del inicio
  con su fecha y los 11 agentes. Tuenti, solo con su ilustración.
