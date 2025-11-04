# =========================================================================== #
# STAGE 1: Base image with pnpm configured
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
# STAGE 2: Prune the monorepo for the Next.js app
# =========================================================================== #
FROM base AS pruner
RUN pnpm install --global turbo
COPY . .
RUN turbo prune @repo/nestjs --docker

# =========================================================================== #
# STAGE 3: Build the application using the pruned workspace
# =========================================================================== #
FROM base AS builder

COPY --from=pruner /app/out/full .
COPY --from=pruner /app/out/json/pnpm-lock.yaml .
COPY --from=pruner /app/scripts ./scripts
COPY --from=pruner /app/.barrelsby.json ./.barrelsby.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false

RUN pnpx turbo run build

# =========================================================================== #
# STAGE 4: Final production image
# =========================================================================== #
FROM base AS production

RUN pnpm add -g @dotenvx/dotenvx
WORKDIR /app

ENV PRISMA_QUERY_ENGINE_LIBRARY="/app/packages/prisma/src/generated/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node"

# 1. Copy dependency-related files from the pruner stage
COPY --from=pruner /app/out/json/pnpm-lock.yaml .
COPY --from=pruner /app/out/json/pnpm-workspace.yaml .
COPY --from=pruner /app/out/full/package.json .
COPY --from=pruner /app/out/full/apps ./apps
COPY --from=pruner /app/out/full/packages ./packages

# 2. Install a complete set of production dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# 3. Copy only the necessary BUILT assets from the builder stage
COPY --from=builder /app/apps/nestjs/dist .
COPY --from=builder /app/apps/nestjs/.env.production ./apps/nestjs/.env.production

# 4. Create a non-root user and set permissions
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

# 5. Run the server from its new, explicit path
CMD ["dotenvx", "run", "-f", "apps/nestjs/.env.production", "--", "node", "apps/nestjs/main.js"]
