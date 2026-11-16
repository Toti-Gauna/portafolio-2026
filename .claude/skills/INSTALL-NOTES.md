# Skills instaladas (16/11/2026)

Revisadas antes de instalar: las cuatro son MIT, sin hooks ni scripts de instalación. Se copiaron sin modificar.

| Skill | Origen | Notas |
|---|---|---|
| `anatomy` | wheresryan22/anatomy (zip pasado por Ignacio) | Se omitieron los ejemplos pesados `raptor-engine`, `arcade-cabinet`, `turning-dial` y `push-button` (22 MB) y los tests; están en el origen. Los scripts `capture/drive/lines/turn-check` abren Chrome sin interfaz: apuntarlos solo a páginas propias. `publish.mjs` sube figuras a una galería pública: **no ejecutar** sin pedido expreso. |
| `scroll-world` | oso95/scroll-world | **No ejecutar el pipeline de generación.** Por defecto genera video con Monid (pago por clip en USD) y como alternativa con créditos de Higgsfield. En este proyecto Ignacio genera los videos con sus créditos a partir de prompts que escribimos; de la skill se usan el motor de scrub (`references/scrub-engine.js`), la plantilla y los prompts. |
| `threejs-*` (13) | CloudAI-X/threejs-skills | Apuntan a three r186, la versión instalada (0.186.1). |

`design/reference/dashboard-3d-demo/` NO es la skill «Dashboard 3D» del video: es una demo de otro autor (Ronald Mego, MIT, datos sintéticos) que sirve de referencia de una escena 3D guiada por datos. La skill del video sigue pendiente.
