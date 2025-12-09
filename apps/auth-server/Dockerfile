# =========================================================================== #
# STAGE 1: Base image with pnpm configured
# Shared base from docker/Dockerfile.base
# =========================================================================== #
FROM node:22-alpine AS base

RUN apk update && apk add --no-cache libc6-compat
ENV NODE_ENV=production
WORKDIR /app
ENV TURBO_TELEMETRY_DISABLED=1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=1
RUN corepack enable pnpm

# =========================================================================== #
# STAGE 2: Prune the monorepo
# =========================================================================== #
FROM base AS pruner
RUN pnpm install --global turbo
COPY . .
RUN turbo prune @repo/auth-server --docker

# =========================================================================== #
# STAGE 3: Build the application using the pruned workspace
# =========================================================================== #
FROM base AS builder

COPY --from=pruner /app/out/full .
COPY --from=pruner /app/out/json/pnpm-lock.yaml .
COPY --from=pruner /app/scripts ./scripts
COPY --from=pruner /app/.barrelsby.json ./.barrelsby.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false --fetch-retries=5 --fetch-timeout=120000

RUN pnpx turbo run build

# =========================================================================== #
# STAGE 4: Final production image
# Shared production-base from docker/Dockerfile.base
# =========================================================================== #
FROM base AS production

RUN pnpm add -g @dotenvx/dotenvx
WORKDIR /app

ENV PRISMA_QUERY_ENGINE_LIBRARY="/app/packages/prisma/src/generated/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node"

COPY --from=pruner /app/out/full .
COPY --from=pruner /app/out/json/pnpm-lock.yaml .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY --from=builder /app/apps/auth-server/dist ./apps/auth-server/dist
COPY apps/auth-server/.env.production ./apps/auth-server/.env.production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 authserver
RUN chown -R authserver:nodejs /app
USER authserver

EXPOSE 3002

CMD ["dotenvx", "run",  "-f", "apps/auth-server/.env.production", "--", "node", "apps/auth-server/dist/index.js"]

