# =========================================================================== #
# STAGE 1: Base image with pnpm configured
# =========================================================================== #
FROM node:22-alpine AS base

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

### 1. Copy the pruned source code and the lockfile
COPY --from=pruner /app/out/full .
COPY --from=pruner /app/out/json/pnpm-lock.yaml .

### 2. Install all dependencies (including dev) to build the app
RUN pnpm install --frozen-lockfile --prod=false

### 3. Build the specific app
RUN pnpm --filter="@repo/hono" build

# =========================================================================== #
# STAGE 4: Final production image
# =========================================================================== #
FROM base AS production

### 1. Copy the pruned source code and lockfile again
COPY --from=pruner /app/out/full .
COPY --from=pruner /app/out/json/pnpm-lock.yaml .

### 2. Install ONLY production dependencies
RUN pnpm install --prod

### 3. Copy the built code from the builder stage
COPY --from=builder /app/apps/hono/dist ./apps/hono/dist

### 4. Set up non-root user and permissions
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 hono
RUN chown -R hono:nodejs /app
USER hono

### 5. Set the final command to run the app from its location
CMD ["node", "apps/hono/dist/index.js"]
