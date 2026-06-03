FROM node:24-slim AS base
RUN npm install -g pnpm@10
WORKDIR /app

# ── Deps layer: install all workspace dependencies ─────────────
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY lib/api-spec/package.json          lib/api-spec/
COPY lib/api-client-react/package.json  lib/api-client-react/
COPY lib/api-zod/package.json           lib/api-zod/
COPY lib/db/package.json                lib/db/
COPY artifacts/api-server/package.json  artifacts/api-server/
COPY artifacts/hasn/package.json        artifacts/hasn/
COPY scripts/package.json               scripts/
RUN pnpm install --no-frozen-lockfile

# ── Builder layer: codegen + typecheck + build ─────────────────
FROM deps AS builder
COPY tsconfig.base.json tsconfig.json ./
COPY lib/              lib/
COPY artifacts/api-server/ artifacts/api-server/
COPY artifacts/hasn/       artifacts/hasn/
COPY scripts/              scripts/

# 1. Generate API client hooks & Zod schemas from OpenAPI spec
RUN pnpm --filter @workspace/api-spec run codegen

# 2. Build composite libs (api-zod, api-client-react, db)
RUN pnpm run typecheck:libs

# 3. Build API server → dist/index.mjs
RUN pnpm --filter @workspace/api-server run build

# 4. Build frontend (Vite) → dist/public
RUN PORT=3000 BASE_PATH=/ pnpm --filter @workspace/hasn run build

# ── Runner: nginx + node + psql in a single slim image ─────────
FROM node:24-slim AS runner

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      nginx \
      postgresql-client \
      curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# API server bundle + runtime deps
COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/node_modules              ./node_modules
COPY --from=builder /app/lib                       ./lib

# Frontend static files
COPY --from=builder /app/artifacts/hasn/dist/public /usr/share/nginx/html

# DB schema for first-run initialisation
COPY schema.sql /app/schema.sql

# Entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Uploads directory
RUN mkdir -p /app/uploads

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD curl -sf http://localhost:${PORT:-80}/api/healthz || exit 1

CMD ["/docker-entrypoint.sh"]
