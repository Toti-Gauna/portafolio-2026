#!/usr/bin/env bash
# Chequeos de solo lectura contra el sitio publicado. Uso: hostinger-smoke.sh https://portafolio.eclipse-business.com
set -euo pipefail
site=${1:?Se espera la URL del sitio}
site=${site%/}
get() { curl --fail --silent --show-error --retry 3 --retry-delay 5 --connect-timeout 15 --max-time 30 "$1"; }
get "$site/" >/dev/null
es=$(get "$site/es/")
[[ "$es" == *'<title>Ignacio Gauna'* ]] || { echo 'La home en español no tiene el título esperado.' >&2; exit 1; }
en=$(get "$site/en/")
[[ "$en" == *'lang="en"'* ]] || { echo 'La home en inglés no responde bien.' >&2; exit 1; }
get "$site/es/proyectos/complia/" >/dev/null
get "$site/sitemap.xml" | grep -q '<loc>' || { echo 'sitemap.xml vacío.' >&2; exit 1; }
get "$site/og.png" >/dev/null
code=$(curl --silent --output /dev/null --write-out '%{http_code}' --max-time 30 "$site/no-existe-$$/")
[[ "$code" == 404 ]] || { echo "Una página inexistente devolvió $code en lugar de 404." >&2; exit 1; }
echo "Chequeos públicos OK en $site"
