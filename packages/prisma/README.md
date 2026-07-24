# @repo/prisma

The single source of truth for the database schema and the generated Prisma client, consumed by `apps/nestjs` (and any other service that needs direct DB access). It exists so the schema, migrations, and generated types live in exactly one place instead of being duplicated or drifting between services.

It owns `src/schema.prisma`, the migration history under `src/migrations/`, and a generated client (built via `prisma generate` into `src/generated/`) exposed through `PrismaClientExtended.createInstance()`, which builds a singleton `PrismaClient` extended with Accelerate and reuses it across hot reloads in development. It also exports Prisma-related enums such as `PrismaErrorCode`. See `.docs/prisma.md` for this repo's Prisma conventions.
