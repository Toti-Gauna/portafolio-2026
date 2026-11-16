# Kit isométrico (Ola 4)

Skills: `iso-dashboard-3d`, `anatomy`, `threejs-*`. Agentes: `iso-3d-builder`, `diorama-dashboard-builder`, `three-engineer`.

## Piezas

| Pieza | Variantes | Uso |
|---|---|---|
| Base | losa chica / media / grande con contorno punteado | suelo de cada etapa o proyecto |
| Edificio | startup (cubo bajo con letrero), academia (pabellón con pizarrón), corporativa (torre con logo), estudio propio (casa-taller), laboratorio (domo) | carrera y proyectos |
| Máquina | engranaje, cinta, antena, servidor, pantalla | estado «en marcha» / «parada» |
| Camino | línea coral de 4 px; punteada para «Planeado» | une edificios |
| Faro | certificaciones | roadmap |
| Personas | figuras sin rostro (2 alturas) | equipo, alumnos |
| Marca | placa con logo autorizado (TACH, Ada ITW, Tsoft, Telefónica, Tuenti) | sobre cada edificio |

## Reglas de dibujo

- Cámara ortográfica isométrica (30°), luz desde arriba a la izquierda.
- Caras: superior papel #eeeae3; izquierda trama clara (puntos papel de r 1,2 sobre grafito); derecha trama oscura (r 2,2); el protagonista con trama coral.
- Una tinta de acción (coral). Sin brillos ni degradés: el elegido se marca con coral y altura.
- Rótulos mono «A · TACH — startup», marcos de esquina finos.

## Datos

Contrato de `iso-dashboard-3d` (`id`, `nombre`, `forma`, `estado`, `cifras` con fuente, `stack`, `semanas`, `logo`). Archivos: `lib/career.ts` (carrera y proyectos) y `lib/roadmap.ts` (roadmap). Seis dioramas a medida (Faro, Escudo, Surco, Estación, Lupa, Horizonte) y el resto con presets.

## Presupuesto

three bajo demanda; ≤ 30 ms por cuadro con CPU ×4 en escritorio; en celular sin sombras ni postproceso y con instancias reducidas; SVG 2D de respaldo para cada vista; movimiento reducido = cuadro quieto.
