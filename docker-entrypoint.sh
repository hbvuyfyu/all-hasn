#!/bin/sh
set -e

# Start Node.js API server in background
PORT=8080 node --enable-source-maps /app/dist/index.mjs &

# Start nginx in foreground
nginx -g "daemon off;"
