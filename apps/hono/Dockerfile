# =========================================================================== #
# STAGE 1: Base image with pnpm configured
# =========================================================================== #
FROM node:22-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat

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
RUN turbo prune @repo/hono --docker

# =========================================================================== #
# STAGE 3: Build the application using the pruned workspace
# =========================================================================== #
FROM base AS builder

COPY --from=pruner /app/out/full .
COPY --from=pruner /app/out/json/pnpm-lock.yaml .
COPY --from=pruner /app/scripts ./scripts

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false --fetch-retries=5 --fetch-timeout=120000

RUN pnpx turbo run build

# =========================================================================== #
# STAGE 4: Final production image
# =========================================================================== #
FROM base AS production

RUN pnpm add -g @dotenvx/dotenvx

COPY --from=pruner /app/out/full .
COPY --from=pruner /app/out/json/pnpm-lock.yaml .

# Install production dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --fetch-retries=5 --fetch-timeout=120000

COPY --from=builder /app/apps/hono/dist ./apps/hono/dist

COPY apps/hono/static ./static

COPY apps/hono/.env.production .

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 hono
RUN chown -R hono:nodejs /app
USER hono

EXPOSE 3001

CMD ["dotenvx", "run",  "-f", ".env.production", "--", "node", "apps/hono/dist/index.js"]

