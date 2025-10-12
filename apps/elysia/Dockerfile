FROM node:22-alpine AS base

ENV NODE_ENV=production

WORKDIR /app

# =========================================================================== #

FROM base AS builder-base

ENV TURBO_TELEMETRY_DISABLED=1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=1

RUN corepack enable pnpm

# =========================================================================== #

FROM builder-base AS builder

RUN pnpm install --global turbo

COPY . .

# https://turbo.build/repo/docs/guides/tools/docker#the-solution
RUN turbo prune @repo/elysia --docker

# =========================================================================== #

FROM builder-base AS installer

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm --filter="@repo/elysia" build

# =========================================================================== #

FROM base AS production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 elysia

COPY --from=installer --chown=elysia:nodejs /app/apps/elysia/dist /app/dist

USER elysia

# HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
#   CMD wget --quiet --spider http://${SERVER_HOST}:${SERVER_PORT}/healthcheck || exit 1

CMD ["node", "/app/dist/index.js"]
