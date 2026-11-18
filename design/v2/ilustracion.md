# Ilustración

## Figuras isométricas

- Usá el kit de Anatomy (`v2/iso/iso-kit.ts`) con el tema de `app/v2/[locale]/kit.css`: papel índigo, cuatro tonos por cara, líneas en niebla y un solo acento encendido en blanco.
- El objeto es la explicación: en vez de cajas y flechas, una máquina reconocible cuyo funcionamiento es la idea. Ejemplo: «El calibre de tests», un reloj comparador que mide cinco cambios; dentro de la franja la luz queda verde y el cambio sigue a producción.
- Sólidos, no alambres: cada pieza está pintada y tapa a la que tiene detrás.
- Cada línea termina en algo: una cara, otra línea o un punto.
- El detalle pertenece a una pieza: tornillos, moleteados, reglas con sus marcas. Nada de ruido.
- Todo lo que se mueve y todo número que se muestra sale del mismo modelo (`gauge-model.ts`).
- El color solo aparece cuando el color es el tema: la franja de tolerancia en `color-success` y la luz de la figura.
- La figura va en su tarjeta: «Fig. n» arriba a la izquierda, el título arriba a la derecha, la pista abajo a la izquierda y la lectura en vivo abajo a la derecha. Debajo, la leyenda y un pie verdadero. Todo el texto en HTML, a 12 px o más.

## Estampillas

- Una por parada del recorrido: TACH Argentina (2021), Ada ITW (2023), Tsoft · Tuenti (2024), CompliA · Tsoft (2026), Supernova Eventos (2026) y Eclipse (hoy). Están en `assets/Estampillas/`.
- Tinta plana sobre papel crema, un motivo dibujado por parada, borde dentado. Es el único lugar donde la paleta cambia.
- Sin marcas de clientes ni capturas. El año va arriba y el nombre abajo, en HTML sobre el dibujo: se leen y se traducen.
- Se usan en Work, al abrir un proyecto, y en el tráiler.

## El apilado

- El oficio en cinco capas, en vista explotada, a la misma distancia entre sí: planificación y ejecución, código, agentes, tests y deploy.
- Cada capa es su propio SVG y se mueve solo con `transform` y `opacity`. Al tocar una capa, las de arriba suben para que se vea entera.
- El texto de las caras se muestra solo si se lee a 12 px o más; por debajo van barras de su largo.

## 3D

- Cámara ortográfica, con el mismo ángulo que las ilustraciones.
- Materiales oscuros y un borde de luz del color de la capa: el color nunca rellena.
- three.js se descarga recién cuando la escena entra en pantalla, y se dibuja a pedido (al entrar, al arrastrar y mientras frena). Con movimiento reducido, un cuadro quieto.
