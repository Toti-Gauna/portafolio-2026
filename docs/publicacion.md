# Checklist de publicación — portafolio.eclipse-business.com

Estado al 27/10/2026: el sitio está completo en la rama `claude/ignacio-portfolio-9juacc`. **No está publicado.** Publicar requiere la autorización expresa de Ignacio.

## Antes de publicar
- [ ] Ignacio revisó el sitio entero en es y en (texto, casos, tráiler con sonido).
- [ ] Probado en un iPhone (Safari) y un Android (Chrome) reales: loader, puerta, tráiler en vertical y horizontal, botón flotante.
- [ ] Probado con un lector de pantalla (VoiceOver o NVDA): puerta, tráiler (versión en texto) y navegación.
- [ ] Enlaces externos abiertos a mano: LinkedIn, GitHub, `eclipse-business.com`, `toti-gauna.github.io/motion-animations`, `toti-gauna.github.io/supernova-eventos`.
- [ ] Repos enlazados revisados: rótulo «Demo» visible en la tienda de Velmar; vista móvil de administración de Supernova.

## Publicar (con autorización)
1. Elegir hosting: GitHub Pages (repo público) o Hostinger.
2. GitHub Pages: agregar un workflow que corra `npm ci`, `npm test`, `npm run build` y publique `out/`; agregar `public/CNAME` con `portafolio.eclipse-business.com`; activar Settings → Pages → Source: GitHub Actions; activar «Enforce HTTPS».
3. DNS: registro `CNAME` `portfolio` → `toti-gauna.github.io` (o el destino que indique el hosting elegido).
4. Abrir un PR de la rama a `main`, revisar y mergear.

## Después de publicar
- [ ] `npm run test:e2e` contra la URL pública (o recorrido manual) y revisar `https://portafolio.eclipse-business.com/sitemap.xml`.
- [ ] Vista previa en redes: LinkedIn Post Inspector con la URL de la home.
- [ ] Enviar el sitemap a Google Search Console.
- [ ] Agregar el enlace del portafolio al perfil de LinkedIn y a GitHub.

## Mantenimiento con fecha
- **10/11/2026:** HandyX dice «lanza el 10 de noviembre». Después de esa fecha, actualizar el estado en `messages/*.json` (tarjeta, caso y tráiler).
- **Números de tests** (corrida del 27/10/2026): si cambian, volver a correr y actualizar cifra y fecha.
- **CV:** cuando exista, sumarlo a Contacto.
