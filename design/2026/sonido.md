# Sonido (Ola 3b; skill `site-sound-design`, agente `sound-designer`)

- **Por defecto apagado.** «Conocer a Ignacio» y «Ver portafolio» lo encienden (gesto exigido por el navegador). Un botón minimalista del header (cinco barras, `aria-pressed`) lo apaga y lo vuelve a encender; si el visitante lo apagó, se recuerda (`localStorage: ig-sound`) y las puertas no lo encienden de nuevo.
- **Un solo contexto de audio** (`lib/sound.ts`): `master ← cues + música`. Se pausa (fundido de 0,25 s y el contexto se suspende) con la pestaña oculta y mientras suena el tráiler (`hold`), y vuelve solo.
- **Sonidos de interfaz** (sintetizados, sin archivos; ninguno con movimiento reducido): tic suave al pasar el mouse por un control (solo puntero fino), clic en botones y enlaces, soplo al abrir el menú, pulso grave al llegar a otro edificio del recorrido, acorde de re al entrar por «Ver portafolio». Un oyente delegado (`lib/ui-sounds.ts`): ningún componente los cablea.
- **Música de fondo, 5 zonas** (`lib/zones.ts`; mismo tempo, 84 BPM, y tono, re menor, para fundir entre ellas en 1,5 s):

| Zona | Pista | Suena en |
|---|---|---|
| inicio | `pad-inicio.mp3` | Hero y origen de la home |
| work | `pad-work.mp3` | Recorrido, Work & Projects y Cómo trabajo (home) · `/trabajo`, `/como-trabajo`, los casos |
| brand | `pad-brand.mp3` | Capacidades, Brand Lab, Negocio y Video (home) · `/capacidades`, `/negocio` |
| roadmap | `pad-roadmap.mp3` | Roadmap (home) |
| about | `pad-about.mp3` | Contacto (home) · `/sobre-mi` |

  La zona la fija el capítulo que está en el centro de la pantalla (`TallerEngine`) o la ruta (`SoundSystem`). El catálogo interno no tiene música.
- **Las pistas** (`public/media/music/pad-<zona>.mp3`, `scripts/encode-music.sh`): del tema de Suno se toman 70 s (desde el segundo 10), −20 LUFS, MP3 de 80 kbps (~700 KB). Se reproducen en streaming con `<audio>` (no se decodifican enteras: memoria en iPhone) y el bucle funde dos copias del mismo archivo durante 2,5 s, así que no hace falta un punto de bucle musical. Se descarga solo la pista de la zona en la que se está.
- **Sin pistas (todavía) o si una falla:** un colchón sintetizado en re menor (acordes por zona, filtro que respira), bajo (≈ −28 dBFS de RMS). Qué zonas tienen pista se decide al compilar (`lib/music-files.ts`): no hay pedidos que den 404.
- **Crédito:** «Música de fondo generada con Suno.» aparece al pie de la home solo cuando hay al menos una pista. El colchón sintetizado no se acredita: es código.
- **Licencias:** pistas generadas con el plan gratuito de Suno, uso aceptado por Ignacio bajo su riesgo (16/11/2026). Si hace falta, se regeneran con un plan pago. Registro en `../prompts/suno/LICENCIAS.md`.
- **Tráiler v3:** pista de Suno a tempo fijo + voz clonada (ElevenLabs) con ducking de −12 dB (Ola 9).
- **QA:** `window.__igSound` (`zone`, `kind` file/synth, `wanted`, `running`, `rms()`); `tests/e2e/sound.spec.ts` y `tests/unit/sound.test.ts`.
