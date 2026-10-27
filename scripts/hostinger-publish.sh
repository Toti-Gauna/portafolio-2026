#!/usr/bin/env bash
# Se ejecuta en Hostinger por SSH; no recibe credenciales.
# Uso: hostinger-publish.sh publish|rollback <carpeta pública del subdominio> <release>
set -Eeuo pipefail

action=${1:?Se espera publish o rollback}
target=${2:?Se espera la carpeta pública}
release=${3:?Se espera el identificador del release}
[[ "$action" == publish || "$action" == rollback ]] || exit 2
[[ "$release" =~ ^[0-9]+-[0-9]+-[a-f0-9]{40}$ ]] || exit 2
# Solo carpetas públicas de un dominio/subdominio de la cuenta (p. ej. .../domains/x/public_html o .../public_html/portafolio).
case "$target" in
  /*/domains/*/public_html | /*/domains/*/public_html/portafolio) ;;
  *) echo 'Carpeta de destino inesperada.' >&2; exit 2 ;;
esac
[[ -d "$target" && ! -L "$target" ]] || { echo 'La carpeta pública no existe (crear el subdominio en hPanel primero).' >&2; exit 2; }
base="${target%%/public_html*}/.portafolio-deploy"
stage="$base/staging/$release"
backup="$base/backups/$release.tar.gz"
umask 077
mkdir -p "$base/backups"
chmod 700 "$base" "$base/backups"
mkdir "$base/lock" || { echo 'Hay otro deploy en curso; revisar el lock antes de reintentar.' >&2; exit 1; }
trap 'rmdir "$base/lock"' EXIT

restore() {
  [[ -f "$backup" && -f "$backup.list" && -d "$stage" ]] || return 1
  local incoming="$base/backups/$release.incoming"
  find "$stage" -type f -print0 > "$incoming" || return 1
  # Borra solo los archivos nuevos de este release y restaura el backup completo.
  while IFS= read -r -d '' file; do
    relative=${file#"$stage/"}
    if ! grep -Fxq -- "./$relative" "$backup.list"; then
      rm -f -- "$target/$relative" || return 1
    fi
  done < "$incoming"
  tar --same-permissions -xzf "$backup" -C "$target" || return 1
  echo "Backup del release $release restaurado."
}

if [[ "$action" == rollback ]]; then
  restore
  exit
fi

for file in index.html 404.html .htaccess es/index.html en/index.html sitemap.xml; do
  [[ -s "$stage/$file" ]] || { echo "Export incompleto: falta $file." >&2; exit 1; }
done
[[ -d "$stage/_next/static" ]] || exit 1
if [[ -s "$target/.htaccess" ]] && ! grep -Fxq '# Portafolio Hostinger managed static export' "$target/.htaccess"; then
  echo 'El .htaccess existente necesita revisión antes del primer deploy; no se tocó nada.' >&2
  exit 1
fi
[[ -z "$(find "$target" "$stage" -type l -print -quit)" ]] || { echo 'Revisar enlaces simbólicos antes de publicar.' >&2; exit 1; }
[[ ! -e "$backup" ]] || { echo 'Este release ya tiene backup.' >&2; exit 1; }
tar -czf "$backup" -C "$target" .
tar -tzf "$backup" > "$backup.list"

publication_failed() {
  trap - ERR
  echo 'Falló la publicación; se restauran los archivos anteriores.' >&2
  restore || echo 'La restauración automática falló. Usar el backup guardado antes de reintentar.' >&2
  exit 1
}
trap publication_failed ERR
find "$stage" -type d -exec chmod 755 {} +
find "$stage" -type f -exec chmod 644 {} +
umask 022
# Primero los assets (se conservan los hasheados viejos para páginas ya abiertas), después el resto.
cp -R --preserve=mode "$stage/_next" "$target/"
cp -R --preserve=mode "$stage/." "$target/"
trap - ERR
echo "Release $release publicado. Backup: $backup"
