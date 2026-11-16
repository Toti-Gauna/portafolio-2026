# Dashboard 3D

A 3D map of a construction portfolio. Each project is built up to its actual progress, its key figures float above it, and a weekly timeline replays the schedule from the start to the projection at the current pace.

**Live demo:** https://ronaldmego.github.io/dashboard-3d/ · Spanish: `?lang=es`

The company, Constructora Aldamar, is fictional and every figure is synthetic.

## What it shows

- Seven projects of different types (residential tower, road bridge, industrial warehouse, housing, clinic and more) plus the materials yard, each built from its own record.
- Portfolio KPIs at the cutoff: progress against plan, projects behind schedule, projected overrun at completion, idle equipment hours and trucks on the road.
- A popup and a full sheet per project: actual vs scheduled progress, SPI, CPI, earned value, next milestone, crew, deliveries and critical material, with the source tables each figure would come from.
- A timeline of 72 weeks: before the cutoff is history, after it is a projection at the current pace.

## Data shape

Everything the scene draws comes from the `OBRAS` array in `index.html`. One record per project:

| Field | Meaning |
|---|---|
| `id`, `nombre`, `zona`, `tipo` | Identity, district and project type (ES/EN) |
| `forma` | Geometry family: `edificio`, `puente`, `nave`, `casas` |
| `dur`, `real0`, `prog0` | Duration in weeks and actual / scheduled progress at the cutoff (0–1) |
| `contrato`, `cpi`, `desvio` | Contract value, cost performance index and projected overrun (USD M) |
| `atraso`, `paro` | Accumulated delay in days and idle equipment hours, when they apply |
| `cuadrilla`, `sinAccidentes` | People on site and days without lost-time incidents |
| `hitos` | Milestones as `[progress, ES, EN]` |
| `critico` | Critical material and its days of cover |
| `pos`, `lote`, `puerta`, `via`, … | Layout of the lot in the city and its access route |

Progress decides how much of each structure is standing; the rest of the fields fill its labels and sheet. The layout fields are placed by hand for this city.

## Run it

Open `index.html` in a browser. There is no build step and no server. Three.js r128 and its OrbitControls are vendored in `vendor/three/` under their MIT license.

## Scope

This is a demonstration of reading operational data, not a project-control system. The figures are not connected to a live source, and the layout of the city is fixed to these seven projects.

## License

MIT
