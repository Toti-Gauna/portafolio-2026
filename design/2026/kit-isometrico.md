# Kit isométrico (Ola 4)

Skills: `iso-dashboard-3d`, `anatomy`, `threejs-*`. Agentes: `iso-3d-builder`, `diorama-dashboard-builder`, `three-engineer`.

## Piezas

| Pieza | Variantes | Uso |
|---|---|---|
| Isla | chica / media / grande; borde de trama; sombra flotante | base de cada etapa o proyecto |
| Edificio | startup (cubo bajo con letrero), academia (pabellón con pizarrón), corporativa (torre con logo), estudio propio (casa-taller), laboratorio (domo) | carrera y proyectos |
| Máquina | engranaje, cinta, antena, servidor, pantalla | estado «en marcha» / «parada» |
| Puente de luz | curva coral con brillo; punteado para «Planeado» | une islas |
| Faro | certificaciones | roadmap |
| Personas | figuras sin rostro (2 alturas) | equipo, alumnos |
| Marca | placa con logo autorizado (TACH, Ada ITW, Tsoft, Telefónica, Tuenti) | sobre cada edificio |

## Reglas de dibujo

- Cámara ortográfica isométrica (30°), luz desde arriba a la izquierda.
- Caras: superior papel #eeeae3; izquierda trama clara (lila sobre noche); derecha trama oscura (violeta); el protagonista con trama coral.
- Una tinta de acción (coral). Brillos solo en el puente y en la isla elegida.
- Rótulos mono «A · TACH — startup», marcos de esquina finos.

## Datos

Contrato de `iso-dashboard-3d` (`id`, `nombre`, `forma`, `estado`, `cifras` con fuente, `stack`, `semanas`, `logo`). Archivos: `lib/career.ts` (carrera y proyectos) y `lib/roadmap.ts` (roadmap). Seis dioramas a medida (Faro, Escudo, Surco, Estación, Lupa, Horizonte) y el resto con presets.

## Presupuesto

three bajo demanda; ≤ 30 ms por cuadro con CPU ×4 en escritorio; en celular sin sombras ni postproceso y con instancias reducidas; SVG 2D de respaldo para cada vista; movimiento reducido = cuadro quieto.
