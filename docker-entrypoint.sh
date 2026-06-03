#!/bin/sh
set -e

# ─── Ports ────────────────────────────────────────────────────
# Railway sets $PORT for the public-facing port; default to 80.
LISTEN_PORT="${PORT:-80}"
API_PORT=8080

# ─── Wait for PostgreSQL ──────────────────────────────────────
echo "[entrypoint] Starting app (no DB wait)..."

npm start

# ─── Initialise database schema ───────────────────────────────
echo "[entrypoint] Running database schema initialisation..."
psql "$DATABASE_URL" -f /app/schema.sql -v ON_ERROR_STOP=0 --quiet
echo "[entrypoint] Database schema initialised."

# ─── Write nginx config ───────────────────────────────────────
rm -f /etc/nginx/sites-enabled/default
mkdir -p /etc/nginx/conf.d

cat > /etc/nginx/conf.d/app.conf << EOF
# Increase header/cookie buffer sizes to handle session cookies
large_client_header_buffers 8 32k;
client_header_buffer_size 8k;

server {
    listen ${LISTEN_PORT};
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    charset utf-8;

    # Forward API requests to the Node.js server
    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        # Pass Railway's original protocol (https) so Express sets secure cookies correctly
        proxy_set_header X-Forwarded-Proto \$http_x_forwarded_proto;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 20m;
        # Proxy buffer sizes for large headers/cookies
        proxy_buffer_size     16k;
        proxy_buffers         8 16k;
        proxy_busy_buffers_size 32k;
    }

    # Serve uploaded files
    location /api/uploads/ {
        alias /app/uploads/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Frontend SPA — all other paths go to index.html
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Long-lived cache for hashed static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# ─── Start API server ─────────────────────────────────────────
echo "[entrypoint] Starting API server on port ${API_PORT}..."
PORT=${API_PORT} node --enable-source-maps /app/dist/index.mjs &
API_PID=$!

# ─── Start nginx ──────────────────────────────────────────────
echo "[entrypoint] Starting nginx on port ${LISTEN_PORT}..."
exec nginx -g "daemon off;"
