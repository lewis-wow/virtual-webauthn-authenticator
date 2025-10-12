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
RUN turbo prune @repo/console --docker

# =========================================================================== #

FROM builder-base AS installer

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod=false

COPY --from=builder /app/out/full/ .
RUN pnpm --filter="@repo/console" build

# =========================================================================== #

FROM base AS production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 console

COPY --from=installer /app/apps/console/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=console:nodejs /app/apps/console/.next/standalone ./
COPY --from=installer --chown=console:nodejs /app/apps/console/.next/static ./.next/static

USER console

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
