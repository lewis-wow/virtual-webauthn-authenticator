
# Base image
FROM node:18-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# -------------------------------------------------------------------------------------------------
# Prune the monorepo
FROM base AS pruner
WORKDIR /app

# Copy root package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Copy project files
COPY . .
RUN turbo prune --scope=console --docker

# -------------------------------------------------------------------------------------------------
# Builder image
FROM base AS builder
WORKDIR /app

# Copy pruned files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Build the app
RUN pnpm turbo run build --filter=console...

# -------------------------------------------------------------------------------------------------
# Runner image
FROM base AS runner
WORKDIR /app

# Copy build output
COPY --from=builder /app/apps/console/.next/standalone ./
COPY --from=builder /app/apps/console/public ./apps/console/public
COPY --from=builder /app/apps/console/.next/static ./apps/console/.next/static

# Set the correct user
USER nextjs

# Expose the port
EXPOSE 3000

# Start the app
CMD ["node", "apps/console/server.js"]
