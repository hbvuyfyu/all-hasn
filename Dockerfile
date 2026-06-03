FROM node:24-slim AS base
RUN npm install -g pnpm@10
WORKDIR /app

# --- deps layer ---
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY lib/api-spec/package.json lib/api-spec/
COPY lib/api-client-react/package.json lib/api-client-react/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/db/package.json lib/db/
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/hasn/package.json artifacts/hasn/
COPY scripts/package.json scripts/
RUN pnpm install --no-frozen-lockfile

# --- builder layer ---
FROM deps AS builder
COPY tsconfig.base.json tsconfig.json ./
COPY lib/ lib/
COPY artifacts/api-server/ artifacts/api-server/
COPY artifacts/hasn/ artifacts/hasn/
COPY scripts/ scripts/
RUN pnpm --filter @workspace/api-spec run codegen
RUN pnpm run typecheck:libs
RUN pnpm --filter @workspace/api-server run build
RUN PORT=3000 BASE_PATH=/ pnpm --filter @workspace/hasn run build

# --- final layer: nginx + node on same base ---
FROM node:24-slim AS runner

# Install nginx
RUN apt-get update && apt-get install -y --no-install-recommends nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy API server bundle and its runtime dependencies
COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/lib ./lib

# Copy frontend build to nginx html dir (vite builds to dist/public)
COPY --from=builder /app/artifacts/hasn/dist/public /usr/share/nginx/html

# Start both services
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
CMD ["/docker-entrypoint.sh"]
