---
name: premium-motion
description: "Micro-interacciones y entradas premium para el portafolio: hover, foco, revelado por scroll y transiciones entre páginas con un presupuesto de rendimiento y movimiento reducido. Usalo al animar tarjetas, botones, diagramas, dioramas y tableros de marca."
---

# premium-motion

## Principios

- **Una curva firma** (`cubic-bezier(0.16, 1, 0.3, 1)`) y tres duraciones: 150 ms (respuesta), 400 ms (cambio de estado), 700 ms (entrada).
- Solo `transform`, `opacity`, `stroke-dashoffset` y `clip-path`. Nada de `top/left/width`, nada de `filter` animado ni `will-change` permanente en móviles.
- **Hover** (solo con puntero fino): elevación 2–4 px, borde que se enciende en coral, la miniatura avanza un cuadro de su animación. En táctiles, `:active` con escala 0,98.
- **Foco visible** siempre igual: anillo coral de 2 px.
- **Entradas:** una vez, escalonadas ≤ 60 ms por elemento, máximo 8 elementos por grupo. Estado de reposo completo si no hay JS.
- **Nada en bucle** fuera de pantalla; todo con `IntersectionObserver`.
- `prefers-reduced-motion`: sin traslados; solo cambios de opacidad inmediatos.

## Presupuesto

Medí antes y después en Chromium con CPU ×4 y 390 × 844 a DPR 3: sin cuadros > 50 ms nuevos, sin capas > 30 % del escenario.
