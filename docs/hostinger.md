# Deploy a Hostinger (subdominio `portafolio`)

El workflow `.github/workflows/hostinger.yml` está listo y **apagado**: no hace nada hasta que se completen estos pasos.
Copia el mecanismo de Eclipse-Web: sube el export por SSH a una carpeta de staging fuera de `public_html`, hace backup de lo publicado, publica y corre chequeos públicos; si fallan, restaura el backup.

## 1. Subdominio en Hostinger (hPanel)
1. Dominios → Subdominios → crear `portafolio` en `eclipse-business.com`.
2. Anotar la carpeta que asigna hPanel. Suele ser una de estas:
   - `/home/<usuario>/domains/eclipse-business.com/public_html/portafolio`
   - `/home/<usuario>/domains/portafolio.eclipse-business.com/public_html`
3. SSL: activar el certificado para `portafolio.eclipse-business.com`.
4. Si el DNS del dominio está en Cloudflare: registro `A` (o `CNAME`) `portafolio` hacia el servidor de Hostinger, igual que el dominio principal.

## 2. Acceso SSH para GitHub Actions
Se puede reusar la misma clave que usa Eclipse-Web, o crear una nueva solo para este repo (recomendado):
```bash
ssh-keygen -t ed25519 -C "portafolio-deploy" -f portafolio_deploy -N ""
# pegar portafolio_deploy.pub en hPanel → Avanzado → Acceso SSH → Claves SSH
ssh-keyscan -p 65002 <host> > known_hosts
```

## 3. Configurar el repo (Settings → Secrets and variables → Actions)
**Secrets**
- `HOSTINGER_SSH_KEY`: contenido de `portafolio_deploy` (clave privada).
- `HOSTINGER_KNOWN_HOSTS`: contenido de `known_hosts`.

**Variables**
- `HOSTINGER_HOST`: IP o host SSH de Hostinger.
- `HOSTINGER_USER`: usuario SSH (`u…`).
- `HOSTINGER_PORT`: `65002` (valor por defecto si no se define).
- `HOSTINGER_PATH`: la carpeta del paso 1.2. El script solo acepta `…/domains/*/public_html` o `…/public_html/portafolio`.
- `HOSTINGER_SITE_URL`: `https://portafolio.eclipse-business.com`.
- `HOSTINGER_DEPLOY_ENABLED`: `true` (esto lo enciende).

## 4. Publicar
- Automático en cada push a `main`, o manual desde Actions → «Deploy a Hostinger (subdominio)» → Run workflow.
- El primer deploy se frena si en la carpeta ya hay un `.htaccess` que no es de este proyecto (para no pisar nada a ciegas).

## 5. Después del primer deploy
- Cambiar `HOSTINGER_SITE_URL` solo si el dominio final es otro; el sitio usa esa URL para canonical, hreflang, sitemap e imagen para redes.
- La copia de GitHub Pages queda como entorno de prueba con `noindex` (variable `PAGES_NOINDEX`, por defecto `1`).
