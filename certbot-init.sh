#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
# certbot-init.sh — Obtiene certificados SSL para SmartPost
# Uso: sudo bash certbot-init.sh
# ═══════════════════════════════════════════════════════════
set -euo pipefail

DOMAINS=(
  "smartpost.torresjr.dev"
  "panel.smartpost.torresjr.dev"
)
EMAIL="admin@torresjr.dev"   # <-- cambia si es necesario

# ── 1. Instalar certbot + plugin nginx si no están ─────────
if ! command -v certbot &>/dev/null; then
  echo "[+] Instalando certbot..."
  apt-get update -qq
  apt-get install -y certbot python3-certbot-nginx
fi

# ── 2. Instalar configs de nginx (HTTP-only temporal) ──────
#    Necesario para que certbot pueda hacer el challenge via nginx
NGINX_AVAIL="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

for DOMAIN in "${DOMAINS[@]}"; do
  CONF="$NGINX_AVAIL/$DOMAIN.conf"

  if [ ! -f "$CONF" ]; then
    echo "[+] Creando config HTTP temporal para $DOMAIN..."
    cat > "$CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    location / { return 200 'ok'; add_header Content-Type text/plain; }
}
EOF
    ln -sf "$CONF" "$NGINX_ENABLED/$DOMAIN.conf"
  fi
done

# Quitar el default de nginx si existe
rm -f "$NGINX_ENABLED/default"

nginx -t && systemctl reload nginx

# ── 3. Obtener certificados ────────────────────────────────
for DOMAIN in "${DOMAINS[@]}"; do
  if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "[=] Certificado ya existe para $DOMAIN, renovando si es necesario..."
    certbot renew --cert-name "$DOMAIN" --nginx --non-interactive
  else
    echo "[+] Obteniendo certificado para $DOMAIN..."
    certbot --nginx \
      --non-interactive \
      --agree-tos \
      --email "$EMAIL" \
      -d "$DOMAIN"
  fi
done

# ── 4. Copiar configs finales (HTTPS) ──────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for DOMAIN in "${DOMAINS[@]}"; do
  SRC="$SCRIPT_DIR/nginx-vps/$DOMAIN.conf"
  DEST="$NGINX_AVAIL/$DOMAIN.conf"

  if [ -f "$SRC" ]; then
    echo "[+] Instalando config HTTPS para $DOMAIN..."
    cp "$SRC" "$DEST"
    ln -sf "$DEST" "$NGINX_ENABLED/$DOMAIN.conf"
  else
    echo "[!] No se encontró $SRC — omitiendo."
  fi
done

# ── 5. Validar y recargar nginx ────────────────────────────
nginx -t
systemctl reload nginx

# ── 6. Verificar renovación automática ────────────────────
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
  echo "[+] Agregando cron de renovación automática..."
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -
fi

echo ""
echo "✓ Certificados SSL instalados y nginx configurado."
echo "  smartpost.torresjr.dev    → https://smartpost.torresjr.dev"
echo "  panel.smartpost.torresjr.dev → https://panel.smartpost.torresjr.dev"
