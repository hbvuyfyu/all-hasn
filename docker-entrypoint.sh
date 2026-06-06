#!/bin/sh
set -e

# ─── Initialise database schema ───────────────────────────────
echo "[entrypoint] Running database schema initialisation..."
psql "$DATABASE_URL" -f /app/schema.sql -v ON_ERROR_STOP=0 --quiet 2>/dev/null || echo "[entrypoint] Warning: DB init skipped (psql not available or DB unreachable)"
echo "[entrypoint] Database schema initialised."

# ─── Start API server (also serves frontend in production) ────
echo "[entrypoint] Starting server on port ${PORT:-3001}..."
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
