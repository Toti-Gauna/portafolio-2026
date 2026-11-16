---
name: iso-dashboard-3d
description: "Crea dashboards-diorama isométricos para cualquier negocio o proyecto del portafolio: una escena 3D guiada por datos (edificios, máquinas, vías, personas) con una sola tinta de acento, rótulos mono, marcos de esquina, paneles de datos, línea de tiempo y estados que cambian la escena (por ejemplo «parada» detiene la máquina). Usalo para el camino de Work & Projects, el roadmap 3D y cualquier escena tipo «ciudad de datos». Se apoya en anatomy (dibujo) y threejs-* (WebGL)."
---

# iso-dashboard-3d

Skill propia, escrita a partir de la observación de tres videos de referencia (plataforma logística 3D, dioramas «Dashboard 3D» de una tostadora y un gimnasio, almacén tipo juego de estrategia) y de la demo `design/reference/dashboard-3d-demo/` (MIT, otro autor, datos sintéticos). No es la skill original de ningún autor ni copia su código.

## Qué hace que se vea premium (rasgos observados)

1. **Un diorama por tema**, no un gráfico: cada negocio es un objeto físico reconocible armado con muchas piezas chicas (cinta, silo, chimenea, árboles, autos). Cámara isométrica fija o con giro suave.
2. **Una sola tinta de acento** sobre neutros. En este sitio: coral sobre tinta, con un tono secundario por categoría y nada más.
3. **El dato manda la escena.** Un registro (`id`, `nombre`, `forma`, `estado`, números) genera la geometría y los paneles. Cambiar el dato cambia el dibujo: si el estado pasa a `parada`, la máquina se detiene y el humo se corta.
4. **Rótulos en mono y marcos de esquina** alrededor de la escena; título corto arriba, lectura viva abajo.
5. **Panel flotante al elegir un edificio** (clic o foco): ficha con 3–5 cifras, estado, stack y enlace. Nunca más.
6. **Línea de tiempo al pie** con pasos (stepper): el usuario recorre etapas y la escena avanza.
7. **Se adapta con una frase:** los colores y el logo salen de tokens, no de la escena.

## Contrato de datos

```ts
type Pieza = {
  id: string;
  nombre: string;
  forma: 'edificio' | 'nave' | 'torre' | 'casas' | 'maquina' | 'puente' | 'jardin';
  estado: 'produccion' | 'mvp' | 'demo' | 'prototipo' | 'planeado' | 'parada';
  etapa?: string;            // para el roadmap: nucleo | ciber | quant | aero
  cifras: { k: string; v: string; fuente: string }[]; // cada cifra con su fuente
  stack: string[];
  semanas?: number;
  logo?: string;             // marca autorizada por Ignacio
};
```

Los datos de ejemplo se rotulan «Datos de ejemplo» en pantalla. Las cifras reales llevan su fuente y fecha.

## Pasos

1. Leé `CLAUDE.md` del repo y la tabla de estados. Elegí el estado verdadero de cada pieza.
2. Dibujá la versión **SVG 2D de respaldo** primero con la skill `anatomy` (sólidos, cuatro tonos, orden del pintor). Debe leerse sin JavaScript.
3. Construí la versión three.js con cámara ortográfica y materiales planos con sombreado de cuatro tonos (`threejs-materials`, `threejs-lighting`). Instanciá lo repetido (`threejs-geometry`).
4. Animá con calma: entrada escalonada, hover con elevación suave (`transform` y `opacity`), humo y luces solo si la pieza está en pantalla.
5. Paneles y stepper en HTML real (teclado, foco visible, ≥ 44 px). Lista alternativa de todas las piezas.
6. Medí: peso del chunk, cuadros y memoria en 390 × 844 a DPR 3. Si no entra, versión liviana (sin sombras, sin postproceso, menos instancias).

## Presupuestos

- three bajo demanda, nunca en la primera carga.
- Escritorio: ≤ 30 ms de media por cuadro con CPU ×4; celulares: modo liviano con un cuadro cada 2 en reposo.
- Nada en bucle fuera de pantalla; pausa al scrollear en táctiles.
- `prefers-reduced-motion`: un cuadro quieto y paneles estáticos.

## No hacer

Mostrar como hecho lo que es «Planeado»; inventar cifras; usar logos no autorizados; texto por debajo de 12 px; copiar escenas de otros autores.
