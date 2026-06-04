#!/bin/sh
set -e

# ─── Ports ────────────────────────────────────────────────────
# Railway sets $PORT for the public-facing port; default to 80.
LISTEN_PORT="${PORT:-80}"
API_PORT=3001   # fixed internal port — never conflicts with $PORT

# ─── Initialise database schema ───────────────────────────────
echo "[entrypoint] Running database schema initialisation..."
psql "$DATABASE_URL" -f /app/schema.sql -v ON_ERROR_STOP=0 --quiet
echo "[entrypoint] Database schema initialised."

# ─── Write nginx config ───────────────────────────────────────
rm -f /etc/nginx/sites-enabled/default
mkdir -p /etc/nginx/conf.d

cat > /etc/nginx/conf.d/app.conf << NGINX
large_client_header_buffers 8 32k;
client_header_buffer_size 8k;

server {
    listen ${LISTEN_PORT};
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    charset utf-8;

    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$http_x_forwarded_proto;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 20m;
        proxy_buffer_size     16k;
        proxy_buffers         8 16k;
        proxy_busy_buffers_size 32k;
    }

    location /api/uploads/ {
        alias /app/uploads/;
        expires 7d;
        add_header Cache-Control "public";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# ─── Start API server ─────────────────────────────────────────
echo "[entrypoint] Starting API server on port ${API_PORT}..."
PORT=${API_PORT} node --enable-source-maps /app/dist/index.mjs &
API_PID=$!

# ─── Wait for API to be ready before starting nginx ──────────
echo "[entrypoint] Waiting for API server to be ready..."
for i in $(seq 1 30); do
    if curl -sf http://127.0.0.1:${API_PORT}/api/healthz > /dev/null 2>&1; then
        echo "[entrypoint] API server is ready."
        break
    fi
    sleep 1
done

# ─── Start nginx ──────────────────────────────────────────────
echo "[entrypoint] Starting nginx on port ${LISTEN_PORT}..."
exec nginx -g "daemon off;"
