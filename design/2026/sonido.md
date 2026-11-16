# Sonido (Ola 3b; skill `site-sound-design`, agente `sound-designer`)

- **Por defecto apagado.** «Conocer a Ignacio» y «Ver portafolio» lo encienden (gesto exigido por el navegador). Un botón minimalista del header lo apaga y lo vuelve a encender; la elección se recuerda.
- **Música de fondo (Suno):** un pad ambiental por sección, mismo tempo y tonalidad, fundido de 1,5 s al cambiar de página. Volumen bajo (≈ −18 LUFS).
- **Sonidos de interfaz (Web Audio, sintetizados):** clic suave en botones, pulso grave al elegir un edificio, soplo al abrir el menú, tic al avanzar el stepper (≈ −26 LUFS).
- **Tráiler v3:** pista de Suno a tempo fijo + voz clonada (ElevenLabs) con ducking de −12 dB.
- **Licencias:** pistas generadas con el plan gratuito de Suno, uso aceptado por Ignacio bajo su riesgo (16/11/2026). Si hace falta, se regeneran con un plan pago. En la web: «Música generada con Suno». Registro en `../prompts/suno/LICENCIAS.md`.
- **iPhone:** pistas largas en streaming, un solo `AudioContext`, pausa con la pestaña oculta.
