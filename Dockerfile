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

# 3. Build API server -> dist/index.mjs
RUN pnpm --filter @workspace/api-server run build

# 4. Build frontend (Vite) -> dist/public
RUN PORT=3000 BASE_PATH=/ pnpm --filter @workspace/hasn run build

# ── Runner: single Node.js image (no nginx needed) ─────────────
FROM node:24-slim AS runner

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      postgresql-client \
      curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# API server bundle (esbuild includes all workspace code)
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist

# Frontend static files (served by Express in production)
COPY --from=builder /app/artifacts/hasn/dist/public ./artifacts/hasn/dist/public

# Runtime node_modules for externalized packages (pg, bcryptjs, etc.)
COPY --from=builder /app/node_modules ./node_modules

# DB schema for first-run initialisation
COPY schema.sql /app/schema.sql

# Uploads directory
RUN mkdir -p /app/uploads

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD curl -sf http://localhost:3001/api/healthz || exit 1

CMD ["node", "--enable-source-maps", "/app/artifacts/api-server/dist/index.mjs"]
