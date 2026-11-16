---
name: brand-board-svg
description: "Diseña tableros de marca en SVG propio con animaciones nativas: logo principal, logo secundario, submark, paleta con nombres y códigos, tipografía, patrones y aplicaciones (cartel, packaging, etiquetas). Usalo para el Brand Lab del portafolio y para mostrar cómo se da marca a Velmar, Eclipse, Lucero, IG y otros. Las marcas ficticias se rotulan «Ejercicio de marca»."
---

# brand-board-svg

## Estructura del tablero (tomada de las cuatro referencias que pasó Ignacio)

1. **Logo principal** en grande, sobre un color de la paleta.
2. **Logo secundario** (versión apilada o reducida) y **submark** (monograma o símbolo) lado a lado.
3. **Paleta**: 5–6 círculos con nombre propio y código (hex; opcional RGB/CMYK).
4. **Tipografía**: muestra «Aa» de la fuente de títulos y la de texto, con abecedario y números.
5. **Patrones**: 3–4 mosaicos con el símbolo y formas de la marca.
6. **Aplicaciones**: cartel, envase, etiqueta, delantal o pantalla, dibujados como mockups en SVG.

Las referencias son de otros autores (Astral, Psicomess, Morao Cream, Crumb Club): se usan solo para la estructura. **No se copian logos, formas ni nombres.**

## Reglas

- Todo se dibuja en SVG propio, con `viewBox`, `<title>` y `<desc>`. Sin imágenes rasterizadas ni logos de terceros.
- Tipografías con licencia abierta (OFL) y autoalojadas.
- **Rótulos:** una marca ficticia lleva «Ejercicio de marca» visible. Las marcas reales del portafolio (IG, Eclipse, Velmar) dicen de quién son. Velmar no muestra la marca del cliente tapada en capturas.
- Contraste AA en cada par texto/fondo; nada por debajo de 12 px a tamaño real.
- Animación al aparecer: se dibuja el trazo del logo (`stroke-dashoffset`), los círculos de la paleta entran uno por uno, los patrones se revelan con `clip-path`. Hover: elevación y giro suave del submark. Todo con `transform`/`opacity`, y estado final con movimiento reducido.

## Pasos

1. Definí la idea de la marca en una frase y el lugar donde vive.
2. Paleta primero (con nombres), tipografías después, logo al final.
3. Construí cada bloque como componente reutilizable; el tablero es una grilla de esos bloques (átomos del kit).
4. Guion de animación: orden, duración y curva; una sola «curva firma».
5. Revisá con la rúbrica de `content-guardian` antes de publicar.
