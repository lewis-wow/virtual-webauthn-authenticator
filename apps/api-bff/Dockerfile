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
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
ENV CI=1

RUN corepack enable pnpm

# =========================================================================== #
# STAGE 2: Prune the monorepo
# =========================================================================== #
FROM base AS pruner
COPY . .
RUN pnpx turbo prune @repo/api-bff --docker

# =========================================================================== #
# STAGE 3: Build the application using the pruned workspace
# =========================================================================== #
FROM base AS builder

COPY --from=pruner /app/out/full .
COPY --from=pruner /app/out/json/pnpm-lock.yaml .
COPY --from=pruner /app/scripts ./scripts

RUN --mount=type=cache,id=pnpm-api-bff,target=/pnpm/store pnpm install --frozen-lockfile --prod=false --fetch-retries=5 --fetch-timeout=120000

RUN pnpx turbo run build

# =========================================================================== #
# STAGE 4: Final production image
# =========================================================================== #
FROM base AS production

RUN pnpm add -g @dotenvx/dotenvx
WORKDIR /app

COPY --from=pruner /app/out/full .
COPY --from=pruner /app/out/json/pnpm-lock.yaml .

RUN --mount=type=cache,id=pnpm-api-bff,target=/pnpm/store pnpm install --prod --fetch-retries=5 --fetch-timeout=120000

COPY --from=builder /app/apps/api-bff/dist ./apps/api-bff/dist
COPY apps/api-bff/.env.production ./apps/api-bff/.env.production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 apibff
RUN chown -R apibff:nodejs /app
USER apibff

EXPOSE 3001

CMD ["dotenvx", "run", "-f", "apps/api-bff/.env.production", "--", "node", "apps/api-bff/dist/index.js"]
