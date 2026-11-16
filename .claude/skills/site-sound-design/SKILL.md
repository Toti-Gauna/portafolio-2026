---
name: site-sound-design
description: "Diseña el paisaje sonoro del portafolio: música de fondo por sección (pistas de Suno), sonidos de interfaz sintetizados con Web Audio (hover, clic, transiciones), control visible de silencio, mezcla, carga bajo demanda y límites de memoria en celulares. Usalo para la música y los sonidos de la web y la banda sonora del tráiler."
---

# site-sound-design

## Reglas del sitio que cambian (a confirmar por Ignacio en la Ola 1)

Hasta hoy: «sonido apagado por defecto» (`CLAUDE.md`). Ignacio ahora quiere música de fondo y sonidos. Propuesta que respeta el navegador y la accesibilidad:

- **Nada suena antes de un gesto.** Los navegadores lo bloquean. La puerta de entrada («Ver portafolio» / «Conocer a Ignacio») ya es un clic: ahí se crea el `AudioContext` y se decide el arranque.
- **Control siempre visible** (botón de altavoz en el header, ≥ 44 px, `aria-pressed`, atajo sin tecla de una letra). Lo exige WCAG 1.4.2 para audio de más de 3 segundos.
- **Arranque recomendado: música baja y activa solo si la persona la pidió en la puerta** (un tercer gesto en la pantalla de carga: «Con sonido» / «Sin sonido»). Se recuerda la elección. Sin elección previa: silencio.
- Se pausa con la pestaña oculta, con el menú abierto en móviles y con `prefers-reduced-motion` (sin sonidos de interfaz; la música solo si fue pedida).
- Volumen máximo −18 LUFS aprox. para música de fondo; sonidos de interfaz −26 LUFS aprox.; nunca ambos a la vez al mismo nivel.

## Piezas

1. **Sonidos de interfaz sintetizados** con Web Audio (osciladores y envolventes, sin archivos): hover suave, clic, apertura de menú, selección de edificio, paso del stepper, transición de página. El kit del tráiler ya sintetiza música (`public/trailer/v2/audio.js`): reutilizar su motor.
2. **Música de fondo (Suno):** una pista base y variaciones por sección (Inicio, Work & Projects, Roadmap, Brand Lab, Negocio) con el mismo tempo y tonalidad para fundir entre ellas. Cuando la sección cambia, crossfade de 1,5 s.
3. **Banda sonora del tráiler v3:** pista de Suno con tempo fijo (la línea de tiempo del tráiler cuenta con una grilla de compases), más la voz de ElevenLabs en una pista aparte.

## Cómo se genera (lo hace Ignacio con su cuenta de Suno)

- `media-prompt-writer` deja en `design/prompts/sonido/` un `.md` por pista: duración, BPM y tonalidad, estilo, instrumentos, «sin voz», referencias y el nombre de archivo esperado.
- Suno entrega temas largos, no bucles: se recortan y se arman bucles o colas con `ffmpeg` (corte en compás, fundido cruzado) y se codifican a Opus/AAC mono o estéreo a 96 kbps. Presupuesto: ≤ 600 KB por pista de fondo, ≤ 2,5 MB en total antes del clic de la puerta (cero), todo lo demás bajo demanda.
- **Derechos:** los términos de uso comercial dependen del plan de Suno al momento de generar. Ignacio confirma su plan y se guarda la fecha y el plan en `design/prompts/sonido/LICENCIAS.md`. En la web: «Música generada con Suno» (y «Voz clonada de Ignacio con ElevenLabs»).

## Técnica

- Pistas largas con `<audio>` (streaming) y `MediaElementAudioSourceNode`; no `decodeAudioData` de temas enteros en iOS (memoria).
- Un solo `AudioContext` compartido con el tráiler (`window.__igTrailerAudio`), cerrado al salir del tráiler; al volver al sitio se reanuda.
- Ducking: la música baja −12 dB mientras suena la voz o el tráiler.
- Sin cálculos de audio en el hilo principal durante el scroll en táctiles.

## No hacer

Autoplay sin gesto; música sin control; música con voz que compita con la lectura; mezclar pistas con distinto tempo; subir pistas sin anotar su origen y licencia.
