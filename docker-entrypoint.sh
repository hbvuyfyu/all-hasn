#!/bin/sh
set -e

# Railway injects $PORT — default to 80 if not set
LISTEN_PORT="${PORT:-80}"
API_PORT=8080

# Remove default nginx site config if it exists
rm -f /etc/nginx/sites-enabled/default

# Write nginx config with the correct listen port
mkdir -p /etc/nginx/conf.d
cat > /etc/nginx/conf.d/app.conf << EOF
# Increase header/cookie buffer sizes to handle large session cookies
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
        # Pass through Railway's original X-Forwarded-Proto (https) so Express
        # correctly treats the connection as secure for cookie handling.
        proxy_set_header X-Forwarded-Proto \$http_x_forwarded_proto;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 20m;
        # Increase proxy buffer sizes for large response headers/cookies
        proxy_buffer_size 16k;
        proxy_buffers 8 16k;
        proxy_busy_buffers_size 32k;
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
EOF

# Start Node.js API server in background
PORT=${API_PORT} node --enable-source-maps /app/dist/index.mjs &

# Start nginx in foreground
exec nginx -g "daemon off;"
