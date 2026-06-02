#!/bin/sh
set -e

echo "Starting API server on port 8080..."
# Start Node.js API server in background
PORT=8080 node --enable-source-maps /app/dist/index.mjs &
API_PID=$!

# Give API server time to start
sleep 2

# Check if API process is still running
if ! kill -0 $API_PID 2>/dev/null; then
    echo "Failed to start API server!"
    exit 1
fi

echo "Starting nginx..."
# Start nginx in foreground
exec nginx -g "daemon off;"
